import hashlib
import json
from services import apify, convex


def scan_instagram(client: dict) -> None:
    handle = convex.social_value(client, "instagram")
    if not handle:
        return

    posts = apify.run_instagram_scraper(handle)
    if not posts:
        return

    joined_captions = "\n".join(p.get("caption") or "" for p in posts)
    content_hash = hashlib.md5(joined_captions.encode()).hexdigest()
    latest = convex.latest_social_intelligence(client, "instagram")
    if latest and hashlib.md5((latest.get("content") or "").encode()).hexdigest() == content_hash:
        return

    convex.append_social_intelligence(
        client["_id"], "instagram", json.dumps({"handle": handle, "posts": posts}),
    )
