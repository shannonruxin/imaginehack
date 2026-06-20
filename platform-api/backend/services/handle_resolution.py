from services import exa, llm, convex


def resolve_handles(client: dict) -> None:
    name = convex.client_name(client)
    client_id = client["_id"]
    if not name:
        return

    li_candidates = exa.search_linkedin(name)
    ig_candidates = exa.search_instagram(name)

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

    # HIGH confidence (>=6) → auto-store into socials[]. Lower scores left for advisor confirm.
    if li_url and li_score >= 6:
        convex.add_social(client_id, "linkedin", li_url)

    if ig_url and ig_score >= 6:
        ig_handle = ig_url.rstrip("/").split("/")[-1]
        if ig_handle:
            convex.add_social(client_id, "instagram", ig_handle)
