# Exa & Apify Live Fetch Verification — Run 2

_Run: 2026-06-21. Target: **Shannon Choo** (LinkedIn via Exa) + Instagram **@rxcshannon**
(via Apify). No database writes — scripts call the real `services/exa.py` and
`services/apify.py` wrappers and dump raw responses to `test/output/`._

## Commands run (from repo root)

```bash
python3 test/exa_test.py "Shannon Choo"   # LinkedIn search + profile fetch + legacy
python3 test/apify_test.py rxcshannon     # live Instagram scraper (~54s, real credits)
```

---

## LinkedIn — Exa (`search_linkedin` + `fetch_linkedin_profile`)

✅ Returned 3 real LinkedIn profiles for "Shannon Choo":

| URL | Title |
|---|---|
| https://sg.linkedin.com/in/shannon-choo | Shannon Choo — Financial Advisory Manager & Entrepreneur |
| https://my.linkedin.com/in/shannonchoo | Shannon Choo — YTL AI Labs (AI Engineer Intern) |
| https://linkedin.com/in/shannon-choo-b113951a4 | shannon choo — Mediator |

### `fetch_linkedin_profile()` on the top hit — real profile text (13,716 chars)
```
# Shannon Choo
Financial Advisory Manager & Entrepreneur | Advocating Personal Growth &
Financial Knowledge. Interested in Public Affairs, Politics, and Business
Financial Advisory Manager at Financial Alliance Pte Ltd
Singapore, Singapore (SG)
303 connections • 314 followers
## About
In Singapore, the focus on being diligent employees fr...
```
Saved: `test/output/exa_search_linkedin.json`, `test/output/exa_fetch_linkedin_profile.json`

> Note: the search returned several different people named Shannon Choo. The
> backend's handle-resolution LLM scoring is what picks the right one — this raw
> Exa step just returns candidates.

---

## Instagram — Apify (`run_instagram_scraper("rxcshannon", 3)`)

✅ Live actor run `runId hwN5ESubx3W8vxit9`, finished in 54.3s, 3 posts returned:

| URL | Posted | Likes | Caption |
|---|---|---|---|
| https://www.instagram.com/p/CJbDYebDRmz/ | 2020-12-30 | hidden (-1) | "Closing 2020 with u guys" |
| https://www.instagram.com/p/CxnsttqvFnL/ | 2023-09-25 | hidden (-1) | "halfway" |
| https://www.instagram.com/p/CD71e-KDH_Q/ | 2020-08-16 | hidden (-1) | "🐞" |

Returned keys per post: `caption`, `timestamp`, `url`, `display_url`, `likes_count`.
Saved: `test/output/apify_instagram.json`

> `likes_count = -1` means the like count wasn't exposed on the scraped page
> (common for some profiles/posts) — the post itself, caption, and timestamp came
> through fine.

The Apify log above (`Pulling container image` → `Crawled` → `Finished! Total 5
requests: 5 succeeded`) is proof of a live fetch, not canned data.

---

## Instagram via Exa — still N/A (expected)

`exa.search_instagram()` again returned `403 SOURCE_NOT_AVAILABLE` for instagram.com.
Exa cannot crawl Instagram; that's why IG goes through Apify. (Same finding as
RESULTS.md.)

---

## Summary

- **LinkedIn (Exa)**: ✅ working — real profiles + full profile text for Shannon Choo.
- **Instagram (Apify @rxcshannon)**: ✅ working — real posts with captions + timestamps.
- **Instagram (Exa)**: N/A by design — use Apify.
