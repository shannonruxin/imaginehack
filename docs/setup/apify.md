# Apify Setup

Apify is used for **Instagram post scraping** only. We scrape public posts by handle to detect life event signals.

Actor used: `apify/instagram-post-scraper` — posts + engagement metrics by username.

Skill installed: `apify-ultimate-scraper` (12.1K installs, official Apify org)

---

## Todo

### 1. Get API Token
- [x] Created token at https://console.apify.com → Settings → API & Integrations

### 2. Add to env files
- [x] `APIFY_API_TOKEN` set in root `.env`
- [x] Copied to `platform-api/backend/.env`

### 3. Python client
- [x] `apify-client==3.0.3` installed via `pip install -r requirements.txt`

### 4. Smoke test — passed ✅
```
Got 3 posts
caption: In the Democratic Republic of the Congo...
timestamp: 2026-06-20T10:00:04.000Z
likes: 16726
url: https://www.instagram.com/p/DZxvMgyH8yR/
```

### 5. Install CLI (optional, for manual testing via Claude Code skill)
- [ ] `npm install -g apify-cli`
- [ ] `apify login` or `export APIFY_TOKEN=<your-token>`

---

## How it fits in the backend

```
apify.py → run_instagram_scraper(handle, results_limit=10)
         → runs apify/instagram-post-scraper actor
         → returns list of { caption, timestamp, url, display_url, likes_count }

instagram_scanner.py → calls run_instagram_scraper
                     → md5(captions) vs stored content_hash
                     → only runs LLM if content changed
```

---

## Cost

Apify free tier: **$5/month credit**. The `instagram-post-scraper` costs ~$0.50–1.00 per 1,000 posts. For 200 clients × 10 posts daily = 2,000 posts/day → ~$1/day. Consider running every 2–3 days instead of daily to stay within free tier.

---

## Notes

- Actor needs exact Instagram **username** (handle), not a person's real name — that's why handle resolution runs first (Exa → store handle → Apify uses it)
- Private accounts return no posts — expected behaviour, not an error
- The `apify-ultimate-scraper` skill can also be used ad-hoc via Claude Code to run one-off Instagram lookups during testing
