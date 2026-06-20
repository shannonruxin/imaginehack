from services import convex, llm


def enrich_project(project_id: str) -> list[dict]:
    project = convex.get_project(project_id)
    if not project:
        return []

    enriched = []
    for entry in project.get("clients", []):
        client_id = entry["client_id"]
        client = convex.get_client_by_id(client_id)
        if not client:
            continue
        history = convex.get_chat_history(client_id) or {}
        result = llm.suggest_approach_angle(
            client, history.get("messages", []), client.get("recent_signals", [])
        )
        convex.update_project_client_status(
            project_id, client_id, entry.get("status", "to_follow_up"), notes=result["angle"]
        )
        enriched.append({"client_id": client_id, "angle": result["angle"]})

    return enriched
