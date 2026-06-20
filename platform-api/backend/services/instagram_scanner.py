import hashlib
from datetime import datetime, timezone
from services import apify, llm, convex


def scan_instagram(client: dict) -> None:
    handle = client.get("instagram_handle")
    if not handle:
        return

    posts = apify.run_instagram_scraper(handle)
    if not posts:
        return

    joined_captions = "\n".join(p.get("caption") or "" for p in posts)
    content_hash = hashlib.md5(joined_captions.encode()).hexdigest()

    existing = convex.get_social_intelligence(client["_id"], "instagram")
    stored_hash = existing.get("content_hash") if existing else None

    if content_hash == stored_hash:
        convex.upsert_social_intelligence(client["_id"], "instagram", {
            "last_checked": _now_iso(),
        })
        return

    all_signals: list[str] = []

    for post in posts:
        caption = post.get("caption") or ""
        if caption.strip():
            result = llm.classify_signals(client, "instagram", caption)
            all_signals.extend(result["signals"])
        else:
            display_url = post.get("display_url")
            if display_url:
                result = llm.classify_signals_vision(client, display_url)
                all_signals.extend(result["signals"])

    unique_signals = list(dict.fromkeys(all_signals))
    convex.upsert_social_intelligence(client["_id"], "instagram", {
        "last_checked": _now_iso(),
        "content_hash": content_hash,
        "data_found": unique_signals,
        "no_signal": len(unique_signals) == 0,
    })

    if unique_signals:
        convex.update_client(client["_id"], {"pending_batch": True})


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
