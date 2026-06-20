from apify_client import ApifyClient
from config import settings

_client = ApifyClient(settings.APIFY_API_TOKEN)

# Actor that scrapes public Instagram profiles
_ACTOR_ID = "apify/instagram-post-scraper"


def run_instagram_scraper(handle: str, results_limit: int = 3) -> list[dict]:
    run = _client.actor(_ACTOR_ID).call(run_input={
        "username": [handle],
        "resultsLimit": results_limit,
    })
    dataset = _client.dataset(run.default_dataset_id)
    posts = []
    for item in dataset.iterate_items():
        posts.append({
            "caption": item.get("caption") or "",
            "timestamp": item.get("timestamp"),
            "url": item.get("url") or item.get("shortCode") and f"https://www.instagram.com/p/{item['shortCode']}/",
            "display_url": item.get("displayUrl"),
            "likes_count": item.get("likesCount", 0),
        })
    return posts
