import json
from services import apify, llm, convex


def scan_instagram(client: dict) -> None:
    handle = convex.social_value(client, "instagram")
    if not handle:
        return

    posts = apify.run_instagram_scraper(handle, results_limit=10)
    if not posts:
        return

    convex.set_recent_signals(
        client["_id"], "instagram",
        json.dumps({"handle": handle, "posts": posts}),
    )
    _refresh_persona(client["_id"])


def _refresh_persona(client_id: str) -> None:
    client = convex.get_client_by_id(client_id)
    if not client:
        return
    result = llm.classify_persona(client, client.get("recent_signals") or [])
    if result["tags"] or result["summary"]:
        convex.update_persona(client_id, result["tags"], result["summary"])
