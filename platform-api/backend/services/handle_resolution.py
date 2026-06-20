import asyncio
from services import exa, llm, convex


def resolve_handles(client: dict) -> None:
    name = client["name"]
    company = client.get("company", "")
    city = client.get("city", "")
    client_id = client["_id"]

    li_candidates = exa.search_linkedin(name, company, city)
    ig_candidates = exa.search_instagram(name, company, city)

    def _pick_best(candidates: list[dict]) -> tuple[str | None, int]:
        if not candidates:
            return None, 0
        scored = [
            (c, llm.score_handle_candidate(c.get("text") or c.get("title", ""), client))
            for c in candidates
        ]
        best_candidate, best_score = max(scored, key=lambda x: x[1])
        return best_candidate.get("url"), best_score

    li_url, li_score = _pick_best(li_candidates)
    ig_url, ig_score = _pick_best(ig_candidates)

    def _confidence(score: int) -> str:
        if score >= 6:
            return "auto"
        if score >= 3:
            return "pending"
        return "low"

    if li_url:
        conf = _confidence(li_score)
        if conf != "low":
            convex.upsert_social_intelligence(client_id, "linkedin", {
                "handle": li_url,
                "confidence": conf,
            })
            if conf == "auto":
                convex.update_client(client_id, {"linkedin_url": li_url})

    if ig_url:
        conf = _confidence(ig_score)
        # extract handle from URL: https://www.instagram.com/{handle}/
        ig_handle = ig_url.rstrip("/").split("/")[-1] if ig_url else None
        if conf != "low" and ig_handle:
            convex.upsert_social_intelligence(client_id, "instagram", {
                "handle": ig_handle,
                "confidence": conf,
            })
            if conf == "auto":
                convex.update_client(client_id, {"instagram_handle": ig_handle})
