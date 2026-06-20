from exa_py import Exa
from typing import Optional
from config import settings

_client = Exa(api_key=settings.EXA_API_KEY)


def search(
    query: str,
    num_results: int = 5,
    text: bool = True,
    include_domains: Optional[list[str]] = None,
) -> list[dict]:
    kwargs = dict(num_results=num_results)
    if include_domains:
        kwargs["include_domains"] = include_domains

    results = _client.search(
        query,
        contents={"text": True, "highlights": True} if text else {},
        **kwargs,
    )
    return [
        {
            "url": r.url,
            "title": r.title,
            "text": r.text if text else None,
            "highlights": r.highlights if text else None,
        }
        for r in results.results
    ]


def search_linkedin(name: str, company: str = "", city: str = "") -> list[dict]:
    query = f'"{name}"'
    if company:
        query += f" {company}"
    query += " site:linkedin.com"
    return search(query, num_results=3)


def search_instagram(name: str, company: str = "", city: str = "") -> list[dict]:
    queries = [
        f'"{name}" {company} site:instagram.com',
        f'"{name}" "{city}" instagram' if city else f'"{name}" {company} instagram',
    ]
    seen = set()
    results = []
    for q in queries:
        for r in search(q, num_results=3):
            if r["url"] not in seen:
                seen.add(r["url"])
                results.append(r)
    return results


def search_legacy(name: str, city: str, family_members: list[str] = []) -> list[dict]:
    targets = family_members if family_members else [name]
    seen = set()
    results = []
    for member in targets:
        query = f'"{member}" obituary "{city}"'
        for r in search(query, num_results=3, include_domains=["legacy.com"]):
            if r["url"] not in seen:
                seen.add(r["url"])
                results.append(r)
    return results


def fetch_linkedin_profile(linkedin_url: str) -> dict | None:
    results = search(f"site:{linkedin_url}", num_results=1)
    return results[0] if results else None
