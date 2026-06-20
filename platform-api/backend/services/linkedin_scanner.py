import hashlib
import json
from services import exa, convex


def scan_linkedin(client: dict) -> None:
    linkedin_url = convex.social_value(client, "linkedin")
    if not linkedin_url:
        return

    profile = exa.fetch_linkedin_profile(linkedin_url)
    if not profile:
        return

    raw_text = profile.get("text") or ""
    if not raw_text.strip():
        return

    content_hash = hashlib.md5(raw_text.encode()).hexdigest()
    latest = convex.latest_social_intelligence(client, "linkedin")
    if latest and hashlib.md5((latest.get("content") or "").encode()).hexdigest() == content_hash:
        return

    convex.append_social_intelligence(
        client["_id"], "linkedin", json.dumps({"url": linkedin_url, "text": raw_text}),
    )
