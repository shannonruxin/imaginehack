import httpx
from services import llm, convex, enrich as enrich_service
from config import settings


def generate_weekly_project() -> None:
    clients = convex.list_clients() or []
    current = convex.get_current_project()
    cutoff = current.get("created_at", 0) if current else 0

    clients_and_signals = []
    for client in clients:
        recent = [
            e for e in (client.get("recent_signals") or [])
            if e.get("date_fetched", 0) > cutoff
        ]
        if not recent:
            continue

        signals: list[str] = []
        for entry in recent:
            result = llm.classify_signals(client, entry.get("platform", ""), entry.get("content", ""))
            if not result["no_signal"]:
                signals.extend(result["signals"])
        signals = list(dict.fromkeys(signals))
        if not signals:
            continue

        persona = client.get("persona") or {}
        clients_and_signals.append({
            "client_id": client["_id"],
            "name": convex.client_name(client),
            "signals": signals,
            "persona_summary": persona.get("summary", ""),
            "persona_tags": persona.get("tags", []),
        })

    if not clients_and_signals:
        return

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

    project_id = convex.insert_project({
        "batch_sales_angle": batch.get("sales_angle", ""),
        "clients": project_clients,
    })

    enrich_service.enrich_project(project_id)
    _notify_advisor(batch, clients_and_signals, project_id)


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
