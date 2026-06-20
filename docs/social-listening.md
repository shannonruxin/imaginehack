# Social Listening Pipeline

How the system gathers data about clients, what it stores, how it's analysed, and what OpenClaw can see.

---

## Overview

```
Cron (3am daily)
  → scan_linkedin  → Exa     → recent_signals[linkedin]  ┐
  → scan_instagram → Apify   → recent_signals[instagram] ├─ classify_persona (gpt-4o-mini) → persona{}
  → scan_legacy    → Exa     → recent_signals[legacy]    ┘

Monday 6am
  → generate_weekly_project
      reads recent_signals + persona → classify_signals (gpt-4o) → project{} in Convex

Advisor asks OpenClaw
  → GET /clients or /projects (read-only)
  → POST /advisor/message → advisor_llm reads persona + chat_history → reply
```

---

## 1. What Is Gathered

### LinkedIn — `exa.fetch_linkedin_profile(url)`
- Fetches the client's LinkedIn profile page via Exa
- Returns full profile text (bio, roles, activity — whatever Exa can extract)
- Stored as a single text blob; no post count limit (it's one profile snapshot)

### Instagram — `apify.run_instagram_scraper(handle, results_limit=3)`
- Runs the `apify/instagram-post-scraper` actor on the client's public profile
- Pulls **3 most recent posts** per run
- Each post: `caption`, `timestamp`, `url`, `likes_count`

### Legacy.com — `exa.search_legacy(name, city, family_members)`
- Searches Legacy.com for obituaries
- Searches by the client's name, then each dependent's name
- Returns up to 3 results per person searched: `url`, `title`, `text` snippet

---

## 2. What Is Stored and Where

All social data lives in **Convex** under the `clients` table. Two fields:

### `recent_signals[]` — raw content, one entry per platform

```
{
  platform: "linkedin" | "instagram" | "legacy"
  date_fetched: <unix ms>
  content: "<JSON string>"
}
```

Each scan **replaces** the existing entry for that platform. The array always has at most one entry per platform (max 3 entries total). Old scans are discarded — only the latest is kept.

**Content shape per platform:**

| Platform | JSON content |
|----------|-------------|
| `linkedin` | `{ url, text }` — full profile text |
| `instagram` | `{ handle, posts: [{caption, timestamp, url, likes_count}] }` — last 3 posts |
| `legacy` | `{ results: [{url, title, text}] }` — obituary search hits |

### `persona{}` — global lifestyle classification, overwritten each scan

```
{
  tags: ["family-oriented", "frequent-traveler", ...]   // 1–3 tags
  summary: "Travels frequently for work, posts family content on weekends."
  updated_at: <unix ms>
}
```

Valid tags: `family-oriented`, `frequent-traveler`, `luxury-lifestyle`, `health-fitness`, `career-driven`, `entrepreneur`, `religious-conservative`, `young-professional`, `outdoor-adventure`, `foodie-lifestyle`

The persona is re-classified after **every** scan using `gpt-4o-mini`. It reads all `recent_signals` across all platforms and produces a stable lifestyle snapshot. Cheap to run, meant to stay fresh without manual effort.

---

## 3. How It's Analysed

### After each scan — persona refresh (`gpt-4o-mini`)

Runs in `linkedin_scanner._refresh_persona`, `instagram_scanner._refresh_persona`, `legacy_scanner._refresh_persona`. Same logic in all three:

1. Fetch the updated client doc from Convex (including all platforms' `recent_signals`)
2. Call `llm.classify_persona(client, recent_signals)` — reads all signals, picks 1–3 persona tags + one-sentence summary
3. Write back to `clients.persona` via `convex.update_persona()`

This runs on `gpt-4o-mini` — lightweight, fast, no tool calls. Output is purely classificatory.

### Monday batch — signal detection + outreach project (`gpt-4o`)

`generate_weekly_project()` runs every Monday at 6am:

1. Load all clients from Convex
2. For each client, filter `recent_signals` to entries fetched **since the last project was created** (`date_fetched > current_project.created_at`)
3. For each new signal entry, call `llm.classify_signals(client, platform, content)` — detects life event signals: `new_baby`, `marriage`, `divorce`, `death_in_family`, `new_job`, `promotion`, `job_loss`, `retirement`, `relocation`, `new_home`, `health_event`, `graduation`, `business_milestone`
4. Clients with no signals this week are **skipped**
5. For clients with signals, call `llm.generate_batch_angle(clients_and_signals)` — takes the list of clients + their signals + persona tags and produces:
   - A weekly `sales_angle` (overall theme for this batch)
   - Per-client `notes` (specific approach note)
6. Create a `projects` record in Convex with all flagged clients, their status (`to_follow_up`), and notes
7. Fire `OPENCLAW_WEBHOOK_URL` (if set) with a plain-text summary so the advisor gets a WhatsApp notification

### On-demand — advisor asks about a client (`gpt-4o`)

When the advisor messages OpenClaw and the backend classifies intent as `client_summary`:

1. Match the client name from the message
2. Load `chat_history` (WhatsApp conversation log) from Convex
3. Read `persona{}` from the client doc
4. Call `llm.synthesize_client_context(client, messages)` — summarises recent conversation + surfaces persona
5. Return to advisor: name, persona line (summary + tags), and the LLM summary

---

## 4. How OpenClaw Interacts With It

OpenClaw is **read-only** with respect to social data. It never triggers scans, never writes signals, never updates persona. Those are backend-only operations run on schedule or via worker endpoints.

### What OpenClaw can read (via platform API GET endpoints)

| Endpoint | What it returns | When OpenClaw uses it |
|----------|----------------|----------------------|
| `GET /clients` | All clients with `persona`, `recent_signals`, `socials` | Resolving a name to a client_id |
| `GET /clients/{id}` | Single client doc | Detailed lookup |
| `GET /projects/current` | This week's flagged clients + sales angle | If advisor asks who to call |

### What OpenClaw does NOT do

- Does not call `/workers/scan-*` — scanning is scheduled, not advisor-triggered
- Does not write to `recent_signals` or `persona` — those are updated by the scanner pipeline only
- Does not write to `chat_history` directly — the `POST /internal/messages` endpoint handles that (called by the `messageReceived` plugin hook, not the advisor skill)

### What the advisor sees from social data

The persona and signals surface through the advisor chat via `POST /advisor/message`:

- **"What's up with Ahmad?"** → backend reads Ahmad's `persona` + `chat_history`, LLM synthesises a briefing. The advisor gets: persona summary, persona tags, and a summary of recent WhatsApp exchanges.
- **"Who should I reach out to this week?"** → backend returns the current `project` — the weekly batch of flagged clients with their per-client approach notes derived from signals.
- **"How should I approach Ahmad?"** → `POST /advisor/suggest-angle { client_id }` — backend reads `persona`, `recent_signals`, and `chat_history`, LLM suggests a specific approach angle and reasoning.

The advisor never sees raw signal content (LinkedIn text, Instagram captions, Legacy snippets). They see **interpreted output** — persona tags, life event signals, and LLM-generated approach notes built on top of that raw data.
