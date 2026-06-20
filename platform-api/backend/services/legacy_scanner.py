import hashlib
import json
from services import exa, convex


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

    joined = "\n".join(r.get("text") or r.get("title", "") for r in results)
    content_hash = hashlib.md5(joined.encode()).hexdigest()
    latest = convex.latest_social_intelligence(client, "legacy")
    if latest and hashlib.md5((latest.get("content") or "").encode()).hexdigest() == content_hash:
        return

    convex.append_social_intelligence(
        client["_id"], "legacy", json.dumps({"results": results}),
    )
