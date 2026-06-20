import json
from services import exa, llm, convex


def scan_linkedin(client: dict) -> None:
    linkedin_url = convex.social_value(client, "linkedin")
    if not linkedin_url:
        return

    profile = exa.fetch_linkedin_profile(linkedin_url)
    if not profile or not (profile.get("text") or "").strip():
        return

    convex.set_recent_signals(
        client["_id"], "linkedin",
        json.dumps({"url": linkedin_url, "text": profile["text"]}),
    )
    _refresh_persona(client["_id"])


def _refresh_persona(client_id: str) -> None:
    client = convex.get_client_by_id(client_id)
    if not client:
        return
    result = llm.classify_persona(client, client.get("recent_signals") or [])
    if result["tags"] or result["summary"]:
        convex.update_persona(client_id, result["tags"], result["summary"])
