from services import exa, llm, convex


def resolve_handles(client: dict) -> None:
    """Resolve missing LinkedIn handle via Exa. Instagram is handled by Apify — handle must be set manually."""
    name = convex.client_name(client)
    client_id = client["_id"]
    if not name:
        return

    # Only resolve LinkedIn if not already set
    if not convex.social_value(client, "linkedin"):
        li_candidates = exa.search_linkedin(name)

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
        if li_url and li_score >= 6:
            convex.add_social(client_id, "linkedin", li_url)
