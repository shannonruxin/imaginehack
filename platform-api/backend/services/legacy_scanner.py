import json
from services import exa, llm, convex


def scan_legacy(client: dict) -> None:
    name = convex.client_name(client)
    if not name:
        return

    family_members = [
        f"{d.get('first_name', '')} {d.get('last_name', '')}".strip()
        for d in (client.get("dependents") or [])
    ]
    family_members = [m for m in family_members if m]

    results = exa.search_legacy(name, "", family_members)
    if not results:
        return

    convex.set_recent_signals(
        client["_id"], "legacy",
        json.dumps({"results": results}),
    )
    _refresh_persona(client["_id"])


def _refresh_persona(client_id: str) -> None:
    client = convex.get_client_by_id(client_id)
    if not client:
        return
    result = llm.classify_persona(client, client.get("recent_signals") or [])
    if result["tags"] or result["summary"]:
        convex.update_persona(client_id, result["tags"], result["summary"])
