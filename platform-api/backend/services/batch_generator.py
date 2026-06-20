import httpx
from datetime import datetime, timezone
from services import llm, convex
from config import settings


def generate_weekly_project() -> None:
    clients = convex.get_clients_pending_batch() or []
    if not clients:
        return

    clients_and_signals = []
    for client in clients:
        li = convex.get_social_intelligence(client["_id"], "linkedin") or {}
        ig = convex.get_social_intelligence(client["_id"], "instagram") or {}
        leg = convex.get_social_intelligence(client["_id"], "legacy") or {}

        signals = (
            li.get("data_found", []) +
            ig.get("data_found", []) +
            leg.get("data_found", [])
        )
        clients_and_signals.append({
            "client_id": client["_id"],
            "name": client.get("name"),
            "signals": list(dict.fromkeys(signals)),
        })

    batch = llm.generate_batch_angle(clients_and_signals)

    project_id = convex.insert_project({
        "created_at": datetime.now(timezone.utc).isoformat(),
        "batch_sales_angle": batch.get("sales_angle", ""),
        "name": batch.get("name", f"Batch {datetime.now().strftime('%Y-%m-%d')}"),
        "client_ids": [c["_id"] for c in clients],
        "client_notes": batch.get("client_notes", []),
        "status": "ready",
    })

    convex.set_clients_batch_done([c["_id"] for c in clients])

    _notify_advisor(batch, clients, project_id)


def _notify_advisor(batch: dict, clients: list[dict], project_id) -> None:
    webhook = settings.OPENCLAW_WEBHOOK_URL
    if not webhook:
        return

    names = ", ".join(c.get("name", "") for c in clients)
    message = (
        f"Weekly outreach batch ready: *{batch.get('name')}*\n"
        f"{batch.get('sales_angle', '')}\n"
        f"Clients: {names}"
    )
    try:
        httpx.post(webhook, json={"message": message, "projectId": str(project_id)}, timeout=10)
    except Exception:
        pass
