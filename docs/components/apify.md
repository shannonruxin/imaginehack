# Apify

## What we use it for

Instagram public post scraping. Exa does not index Instagram, so Apify is the only viable option for public profile + post data without Instagram login.

## Why Apify

- Most reliable Instagram scraper available
- No Instagram login required — scrapes public profiles only
- Free tier: $5 credit/month (enough for hackathon demo)
- Python SDK available

## Free Tier

$5/month in compute credits. At roughly $0.20/compute unit, this covers around 25 actor runs — enough for manual per-client testing during demo.

---

## How it works

**Input**: Instagram username (handle)
**Output**: Public posts with captions, dates, likes, image URLs

```python
from apify_client import ApifyClient

client = ApifyClient(APIFY_API_TOKEN)

run = client.actor("apify/instagram-profile-scraper").call(
    run_input={
        "usernames": ["ahmadfariz92"],
        "resultsLimit": 10          # last 10 posts
    }
)

items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
```

Each item:
```json
{
  "username": "ahmadfariz92",
  "caption": "Alhamdulillah, our little one is here 🍼",
  "timestamp": "2026-06-15T10:23:00.000Z",
  "likesCount": 142,
  "url": "https://www.instagram.com/p/...",
  "displayUrl": "https://..."     ← image URL, used for vision LLM
}
```

---

## Signal Detection

Posts are passed to the LLM signal detection prompt. For posts with no caption text, the image URL is passed to a vision LLM instead:

```
Post has caption text
  → LLM text classification → signals[]

Post has no caption (image only)
  → Vision LLM (GPT-4o vision / Gemini) with image URL
  → "Describe what life event this image shows, if any"
  → signals[]
```

This catches visual signals that have no accompanying text — baby bump photos, wedding shots, new home photos.

---

## Handle Requirement

Apify requires the exact Instagram username. It cannot search by real name.

**How we get the handle:**
1. Exa handle resolution finds likely username from client name + known info
2. Confidence-scored → auto-stored (high) or advisor confirms (medium) or manually entered (low)
3. Stored in `social_intelligence[instagram].handle` on the client record
4. Apify is only called once the handle is confirmed

---

## Limitations

- **Username required** — cannot search by real name directly
- **Public profiles only** — private accounts return no posts
- **Free tier is limited** — 5 actor runs on free tier. For demo: trigger per client manually, not bulk daily scan
- **ToS** — scraping Instagram violates their terms of service. Fine for hackathon, needs legal review for production

---

## Scaling Up

When moving beyond the free tier:
- Apify Pay-as-you-go: ~$0.50 per 1,000 results
- For 200 clients × 10 posts/day = 2,000 posts/day ≈ $1/day = ~$30/month
