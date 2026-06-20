import hashlib
from services import exa, llm, convex


def scan_linkedin(client: dict) -> None:
    linkedin_url = client.get("linkedin_url")
    if not linkedin_url:
        return

    profile = exa.fetch_linkedin_profile(linkedin_url)
    if not profile:
        return

    raw_text = profile.get("text") or ""
    content_hash = hashlib.md5(raw_text.encode()).hexdigest()

    existing = convex.get_social_intelligence(client["_id"], "linkedin")
    stored_hash = existing.get("content_hash") if existing else None

    if content_hash == stored_hash:
        convex.upsert_social_intelligence(client["_id"], "linkedin", {
            "last_checked": _now_iso(),
        })
        return

    result = llm.classify_signals(client, "linkedin", raw_text)
    convex.upsert_social_intelligence(client["_id"], "linkedin", {
        "last_checked": _now_iso(),
        "content_hash": content_hash,
        "data_found": result["signals"],
        "no_signal": result["no_signal"],
    })

    if result["signals"]:
        convex.update_client(client["_id"], {"pending_batch": True})


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()
