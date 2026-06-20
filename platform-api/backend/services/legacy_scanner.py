import hashlib
from datetime import datetime, timezone
from services import exa, llm, convex


def scan_legacy(client: dict) -> None:
    name = client.get("name")
    city = client.get("city", "")
    family_members = client.get("known_family_members", [])

    results = exa.search_legacy(name, city, family_members)
    if not results:
        return

    joined = "\n".join(r.get("text") or r.get("title", "") for r in results)
    content_hash = hashlib.md5(joined.encode()).hexdigest()

    existing = convex.get_social_intelligence(client["_id"], "legacy")
    stored_hash = existing.get("content_hash") if existing else None

    if content_hash == stored_hash:
        convex.upsert_social_intelligence(client["_id"], "legacy", {
            "last_checked": _now_iso(),
        })
        return

    result = llm.classify_signals(client, "legacy", joined)
    convex.upsert_social_intelligence(client["_id"], "legacy", {
        "last_checked": _now_iso(),
        "content_hash": content_hash,
        "data_found": result["signals"],
        "no_signal": result["no_signal"],
    })

    if result["signals"]:
        convex.update_client(client["_id"], {"pending_batch": True})


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
