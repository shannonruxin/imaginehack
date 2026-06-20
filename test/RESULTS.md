# Exa & Apify Live Fetch Verification

_Run: 2026-06-21. No database writes — these scripts call the real `services/exa.py` and
`services/apify.py` wrappers and dump raw responses to `test/output/`._

## How to reproduce (run from repo root)

```bash
# Exa: LinkedIn search, Instagram search, Legacy.com obituary search, profile fetch
python3 test/exa_test.py

# Apify: live Instagram post scraper (consumes Apify credits, ~30s)
python3 test/apify_test.py natgeo
```

Both scripts import the actual backend service modules (`platform-api/backend/services/`),
load keys from the root `.env`, and write raw JSON to `test/output/`.

---

## Exa — `services/exa.py`

Target person: **Tony Fernandes, AirAsia, Kuala Lumpur** (a very public figure, so searches
return real hits).

| Function | Result | Output file |
|---|---|---|
| `search_linkedin()` | ✅ 3 real hits | `output/exa_search_linkedin.json` |
| `search_instagram()` | ❌ 403 `SOURCE_NOT_AVAILABLE` | `output/exa_search_instagram.json` |
| `search_legacy()` | ✅ 3 real obituaries (legacy.com) | `output/exa_search_legacy.json` |
| `fetch_linkedin_profile()` | ✅ 7,142 chars of profile text | `output/exa_fetch_linkedin_profile.json` |

### `search_linkedin()` — real data returned
```
• Tony Fernandes - Chief Executive Officer at Capital A | LinkedIn
  https://my.linkedin.com/in/tonyfernandesairasia
• Tony Fernandes’ Post
  https://www.linkedin.com/posts/tonyfernandesairasia_made-the-big-decision-...
```

### `fetch_linkedin_profile()` — real profile text (first 300 chars)
```
# Tony Fernandes
Chief Executive Officer at Capital A
Chief Executive Officer at [AirAsia](https://www.linkedin.com/company/airasia)
Kuala Lumpur, Federal Territory of Kuala Lumpur, Malaysia (MY)
236 connections • 243,214 followers
## About
Started out as a music man. Bought an airline with 2 ...
```
Returned keys: `url`, `title`, `text`, `highlights`.

### `search_legacy()` — real obituaries returned
```
• Ronald Fernandes Obituary — https://www.legacy.com/us/obituaries/name/ronald-fernandes-obituary?id=53772771
• Bruce Fernandes Obituary  — https://www.legacy.com/us/obituaries/woonsocketcall/name/bruce-fernandes-obituary?id=20377087
```

### ⚠️ `search_instagram()` FAILS — Exa cannot crawl instagram.com
```
ValueError: Request failed with status code 403:
{"error":"The following requested domains are not available: instagram.com.
 Remove them from includeDomains and try again.","tag":"SOURCE_NOT_AVAILABLE"}
```
**Why:** `exa.search_instagram()` builds queries with `site:instagram.com`, but Exa's index
does not include instagram.com. This is expected — Instagram is meant to go through **Apify**,
not Exa. Action item: either drop the `site:instagram.com` filter from `search_instagram()`
(do a general web search for the IG profile instead) or remove the function and rely on Apify
for all Instagram data.

---

## Apify — `services/apify.py`

Actor: `apify/instagram-post-scraper`. Handle tested: **@natgeo**, `results_limit=3`.

| Function | Result | Output file |
|---|---|---|
| `run_instagram_scraper("natgeo", 3)` | ✅ 3 real posts in 27.6s | `output/apify_instagram.json` |

### Real posts returned (live actor run, runId `OWEaXIW3Qq1JmqaN8`)
```
• https://www.instagram.com/p/DZyK5GRD1vy/   likes=1752     ts=2026-06-20T16:00:04Z
  caption: Hammerheads, great whites, whale sharks—they're all here to celebrate #SharkFest...
• https://www.instagram.com/p/DYhkH24lf3j/   likes=55535    ts=2026-05-19T16:00:09Z
  caption: @antoni is on a quest to find the best sights, tastes, and experiences...
• https://www.instagram.com/p/DZpQwxqimz2/   likes=107266   ts=2026-06-16T16:00:07Z
  caption: There's more to the story of Pompeii than just destruction. Join Tom Hiddleston...
```
Returned keys per post: `caption`, `timestamp`, `url`, `display_url`, `likes_count` — exactly
the shape `instagram_scanner.py` hashes and appends to `social_intelligence[]`.

The Apify run log (visible in the command output above) shows the container pulling, crawling
5 pages, and `Status: SUCCEEDED` — proof this is a live fetch, not canned data.

---

## Summary

- **Exa LinkedIn + Legacy.com**: working, returns real, relevant content.
- **Exa Instagram**: broken by design — Exa can't index instagram.com. Use Apify instead.
- **Apify Instagram**: working, returns real posts with captions/likes/timestamps.

## Notes / fixes made during testing
- `platform-api/backend/config.py`: added `extra = "ignore"` to `Settings.Config` — the root
  `.env` contains Convex CLI vars (`CONVEX_DEPLOYMENT`, `CONVEX_SITE_URL`) that pydantic was
  rejecting, which would also block the FastAPI app from booting.
- `.env` is **missing `CONVEX_DEPLOY_KEY`** (the test scripts inject a dummy value since
  Exa/Apify don't touch Convex). Add a real one before the backend can talk to Convex.
