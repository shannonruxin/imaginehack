import httpx
from services import llm, convex, enrich as enrich_service
from config import settings

BABY_MATERNITY_SIGNALS = {"new_baby", "marriage"}  # marriage often co-occurs with family planning
HIGH_URGENCY_SIGNALS = {"health_event", "job_loss", "death_in_family", "retirement", "new_home", "relocation", "graduation", "business_milestone", "promotion", "new_job"}


def _build_clients_and_signals(clients: list[dict], cutoff: int = 0) -> list[dict]:
    """Classify signals for all clients newer than cutoff. Returns enriched list."""
    result = []
    for client in clients:
        recent = [
            e for e in (client.get("recent_signals") or [])
            if e.get("date_fetched", 0) > cutoff
        ]
        if not recent:
            continue

        signals: list[str] = []
        for entry in recent:
            classified = llm.classify_signals(client, entry.get("platform", ""), entry.get("content", ""))
            if not classified["no_signal"]:
                signals.extend(classified["signals"])
        signals = list(dict.fromkeys(signals))
        if not signals:
            continue

        persona = client.get("persona") or {}
        result.append({
            "client_id": client["_id"],
            "name": convex.client_name(client),
            "signals": signals,
            "persona_summary": persona.get("summary", ""),
            "persona_tags": persona.get("tags", []),
        })
    return result


def _create_project(clients_and_signals: list[dict], theme_label: str) -> str | None:
    if not clients_and_signals:
        return None

    batch = llm.generate_batch_angle(clients_and_signals)
    notes_by_id = {
        n["client_id"]: n.get("note", "")
        for n in batch.get("client_notes", []) if "client_id" in n
    }
    project_clients = [
        {
            "client_id": c["client_id"],
            "notes": notes_by_id.get(c["client_id"]) or ", ".join(c["signals"]),
            "status": "to_follow_up",
        }
        for c in clients_and_signals
    ]
    angle = batch.get("sales_angle", "")
    project_id = convex.insert_project({
        "batch_sales_angle": f"[{theme_label}] {angle}" if angle else theme_label,
        "clients": project_clients,
    })
    enrich_service.enrich_project(project_id)
    return project_id


def generate_weekly_project() -> None:
    """Standard weekly batch — all clients with any new life-event signal."""
    clients = convex.list_clients() or []
    current = convex.get_current_project()
    cutoff = current.get("created_at", 0) if current else 0

    all_signals = _build_clients_and_signals(clients, cutoff)
    project_id = _create_project(all_signals, "Weekly Outreach")
    if project_id:
        batch_stub = {"sales_angle": ""}  # notify without re-running LLM
        _notify_advisor(batch_stub, all_signals, project_id)


def generate_baby_maternity_project() -> str | None:
    """Project targeting clients with new baby / maternity life events."""
    return generate_custom_project({"signals": list(BABY_MATERNITY_SIGNALS)}, "New Baby & Family")


def generate_high_urgency_project() -> str | None:
    """Project targeting clients with high-urgency life events."""
    return generate_custom_project({"signals": list(HIGH_URGENCY_SIGNALS)}, "High Urgency Events")


def generate_custom_project(filters: dict, label: str = "Custom Batch") -> str | None:
    """Build a project from flexible filter criteria.

    filters keys (all optional, AND-combined across categories, OR within a list):
      signals: list[str]        — life-event signals (requires LLM classification)
      persona_tags: list[str]   — match any of these persona tags
      platforms: list[str]      — client has a recent signal on any of these platforms
      marital_status: list[str] — match any of these marital statuses
      no_policies: bool         — only clients with zero existing policies
      missing_policy_types: list[str] — clients missing ALL of these policy types
      only_recent: bool         — only signals fetched since the last project
    """
    clients = convex.list_clients() or []

    # Cheap filters first (no LLM)
    pre = []
    for c in clients:
        if filters.get("marital_status") and c.get("marital_status") not in filters["marital_status"]:
            continue
        if filters.get("persona_tags"):
            tags = set((c.get("persona") or {}).get("tags", []))
            if not (set(filters["persona_tags"]) & tags):
                continue
        if filters.get("platforms"):
            present = {s.get("platform") for s in c.get("recent_signals", [])}
            if not (set(filters["platforms"]) & present):
                continue
        if filters.get("no_policies") and c.get("existing_policies"):
            continue
        if filters.get("missing_policy_types"):
            owned = {p.get("type") for p in c.get("existing_policies", [])}
            if owned & set(filters["missing_policy_types"]):
                continue
        pre.append(c)

    # Signal-based filtering (needs LLM classification)
    cutoff = 0
    if filters.get("only_recent"):
        current = convex.get_current_project()
        cutoff = current.get("created_at", 0) if current else 0

    if filters.get("signals"):
        classified = _build_clients_and_signals(pre, cutoff)
        wanted = set(filters["signals"])
        result = [c for c in classified if wanted & set(c["signals"])]
    else:
        # No signal filter — still build the enriched shape, but skip classification cost
        result = []
        for c in pre:
            recent = c.get("recent_signals", [])
            if cutoff and not any(e.get("date_fetched", 0) > cutoff for e in recent):
                continue
            persona = c.get("persona") or {}
            result.append({
                "client_id": c["_id"],
                "name": convex.client_name(c),
                "signals": persona.get("tags", []),
                "persona_summary": persona.get("summary", ""),
                "persona_tags": persona.get("tags", []),
            })

    return _create_project(result, label)


def _notify_advisor(batch: dict, clients_and_signals: list[dict], project_id) -> None:
    webhook = settings.OPENCLAW_WEBHOOK_URL
    if not webhook:
        return

    names = ", ".join(c["name"] for c in clients_and_signals)
    message = (
        f"Weekly outreach batch ready.\n"
        f"{batch.get('sales_angle', '')}\n"
        f"Clients: {names}"
    )
    try:
        httpx.post(webhook, json={"message": message, "projectId": str(project_id)}, timeout=10)
    except Exception:
        pass
