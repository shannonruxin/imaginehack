# ImagineHack — Sales Initiative: Social Listening

## Project Spec

---

## 1. Overview

A social listening system for life insurance advisors. Monitors tracked clients' public social profiles to detect life events that signal a good time to reach out. Surfaces a weekly outreach batch to the advisor dashboard: "Work on these clients this week — here's why."

**Scope for this hackathon**: social listening only. No email. WhatsApp outreach is a future phase.

---

## 2. System Components

```
┌──────────────────────────────────────────────────────────────┐
│                        Convex DB                             │
│   clients | social_intelligence | outreach_batches           │
└───────────────────────────┬──────────────────────────────────┘
                            │
             ┌──────────────▼──────────────┐
             │       Python Backend         │
             │  FastAPI + APScheduler cron  │
             └──────┬───────────┬───────────┘
                    │           │
          ┌─────────▼──┐   ┌───▼────────┐
          │  Exa API   │   │ Apify API  │
          │ (LinkedIn, │   │(Instagram) │
          │  Legacy,   │   └────────────┘
          │  handles)  │
          └────────────┘

             ┌──────────────────────────┐
             │         OpenClaw         │
             │  WhatsApp interface only │
             │  - advisor conversations │
             │  - fetch WA chat history │
             │  - surface DB results    │
             └──────────────────────────┘
```

**Separation of concerns:**

- **Python backend** owns all cron jobs, API calls (Exa, Apify), signal detection, batch generation
- **OpenClaw** only does what requires WhatsApp access — advisor chat, fetching client WA history
- **Convex DB** is the shared state both read/write to

---

## 3. Data Sources


| Platform          | Tool                             | What we get                                                          | Limitation                                            |
| ----------------- | -------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| LinkedIn          | Exa search (`site:linkedin.com`) | Public profile: current role, company, headline, recent public posts | Login-gated data not accessible                       |
| Instagram         | Apify Instagram Profile Scraper  | Public posts, captions, profile bio                                  | Requires username (not name)                          |
| Legacy.com        | Exa search                       | Obituary results by name + city                                      | Family member names needed for best match             |
| Handle resolution | Exa web search (free)            | Resolves real name → likely IG username                              | Confidence-scored, advisor confirms medium confidence |


---

## 4. Life Event Signals


| Signal                  | Source              | Insurance relevance                          |
| ----------------------- | ------------------- | -------------------------------------------- |
| `new_baby`              | Instagram, LinkedIn | New dependent → new/increased coverage       |
| `pregnancy`             | Instagram           | Pre-birth planning window                    |
| `marriage`              | Instagram, LinkedIn | Joint life plans, beneficiary update         |
| `new_job`               | LinkedIn            | Income change → policy review                |
| `promotion`             | LinkedIn            | Income increase → upsell opportunity         |
| `layoff` / `career_gap` | LinkedIn            | May need income protection                   |
| `retirement`            | LinkedIn            | Major financial restructuring                |
| `new_home`              | Instagram, LinkedIn | Mortgage protection insurance                |
| `family_death`          | Legacy.com          | Mortality salience, beneficiary review       |
| `divorce`               | Instagram           | Beneficiary changes, loss of spouse coverage |


---

## 5. Handle Resolution Pipeline

The system resolves a client's Instagram username before any Apify call is made. This preserves Apify credits and avoids monitoring the wrong person.

### Flow

```
Client added to DB
  { name, company, city, industry, known_family_members[] }
        │
        ▼
Step 1: Exa search (free, 20k req/month)
  Queries run in parallel:
  - '"[name]" [company] site:instagram.com'
  - '"[name]" "[city]" instagram'
  - '"[name]" [company] linkedin OR instagram'
        │
        ▼
Step 2: LLM extracts candidate handles + scores them
  Confidence scoring per candidate:
  +3  bio/profile mentions client's company
  +2  bio/profile mentions client's city
  +2  display name matches or is close to client name
  +1  industry keyword in bio
  +1  LinkedIn profile links to this IG account
        │
        ├── HIGH (≥ 6pts) → auto-store handle, schedule Apify monitoring
        ├── MEDIUM (3–5pts) → dashboard flag: "Is this [name]? [link] — Confirm / Reject"
        └── LOW (< 3pts) → dashboard prompt: "Add [name]'s Instagram handle manually"
```

### DB fields added per client

```
instagram_handle             string | null
instagram_handle_confidence  "confirmed" | "auto" | "pending" | null
instagram_handle_resolved_at timestamp | null
linkedin_url                 string | null
linkedin_url_resolved_at     timestamp | null
```

Same resolution logic applies to LinkedIn URL — found once via Exa, stored, then used directly for all future monitoring.

---

## 6. Convex DB Schema

### Table 1: `clients`

```
_id                           auto

-- Core info
name                          string
age                           number
number                        string              -- WhatsApp / phone
nationality                   string
email                         string
occupation                    string
income_range                  string              -- e.g. "5000-10000"
website                       string | null

-- Personal profile
marital_status                "single" | "married" | "divorced" | "engaged"
no_of_dependents              number

-- Insurance
existing_policies             array of:
  policy_id                     string
  name                          string
  type                          string            -- "life" | "medical" | "investment-linked" | "critical-illness" | etc.
  start_date                    string            -- ISO date
  end_date                      string | null
  beneficiaries                 string[]

-- Goals & opportunities
financial_goals               array of:
                                "education_fund" | "retirement" | "housing" | string
sales_opportunities           string[]            -- free text notes e.g. "Upgrade term to whole life"

-- Social intelligence (one entry per platform, updated in place by backend cron)
social_intelligence           array of:
  platform                      "linkedin" | "instagram" | "legacy"
  handle                        string | null     -- username for instagram, profile url for linkedin
  handle_confidence             "confirmed" | "auto" | "pending" | null
  last_checked                  number | null     -- timestamp
  next_check                    number | null     -- last_checked + 24h
  data_found                    array of:
    signal_type                   string          -- "new_job" | "pregnancy" | "family_death" | etc.
    summary                       string          -- "Posted pregnancy announcement on 17 Jun"
    detected_at                   number          -- timestamp
  pending_batch                 boolean           -- signals found, not yet batched

created_at                    number
```

---

### Table 2: `projects`

```
_id                           auto

name                          string              -- e.g. "June 2026 Young Families Drive"
sales_angle                   string              -- e.g. "Focus on dependent coverage for new parents"
created_at                    number

clients                       array of:
  client_id                     reference → clients
  notes                         string | null     -- per-client notes within this project
  status                        "pending" | "contacted" | "responded" | "closed_won" | "closed_lost"
  outreached                    boolean
```

---

## 7. Python Backend — API Endpoints

### Client Management

```
POST   /clients                  Add new client (triggers handle resolution)
GET    /clients                  List all clients
GET    /clients/:id              Get client detail + signal history
PATCH  /clients/:id              Update client info
```

### Handle Resolution

```
GET    /clients/:id/resolution   Get resolution status + candidates
POST   /clients/:id/resolution/confirm   { handle: string } — advisor confirms
POST   /clients/:id/resolution/skip      Skip IG monitoring for this client
POST   /clients/:id/resolution/manual    { handle: string } — advisor sets manually
```

### Signals

```
GET    /signals                  List signals (filter by client, platform, actioned)
POST   /signals/:id/action       Mark signal as actioned
```

### Outreach Batches

```
GET    /outreach/batch/current   This week's recommended outreach list
GET    /outreach/batch/:week_of  Specific week's batch
```

### Workers (internal, called by OpenClaw cron)

```
POST   /workers/resolve-handles  Run handle resolution for unresolved clients
POST   /workers/scan-linkedin    Scan LinkedIn for all clients with linkedin_url
POST   /workers/scan-instagram   Scan Instagram for all clients with confirmed handle
POST   /workers/scan-legacy      Run Legacy.com obituary search for all clients
POST   /workers/generate-batch   Generate this week's outreach batch from signals
```

---

## 8. Backend Cron — Social Intelligence Pipeline

All scanning is owned by the Python backend (APScheduler). OpenClaw is not involved in any cron or API calls.

### Cron Schedule

```
Daily  03:00 AM  →  scan_due_clients()
Monday 06:00 AM  →  generate_outreach_batch()
```

---

### Daily Scan Flow — `scan_due_clients()`

```
1. Query Convex: social_intelligence WHERE
     linkedin_next_check < now()   OR linkedin_next_check IS NULL
  OR instagram_next_check < now()  OR instagram_next_check IS NULL
  OR legacy_next_check < now()     OR legacy_next_check IS NULL

2. For each due client, run platforms in parallel:

   ── LinkedIn ──────────────────────────────────────────
   if client.linkedin_url is set:
     GET exa.search(
       query = site:{client.linkedin_url},
       text = true,           ← full page text
       highlights = true
     )
     → raw profile text → LLM classify signals
     → update social_intelligence:
         linkedin_last_checked = now()
         linkedin_next_check   = now() + 24h
         linkedin_signals      = ["new_job"] or []
         linkedin_last_summary = "Started new role at CIMB as of Jun 2026"
   else:
     run handle resolution (Exa people search) → store linkedin_url if found

   ── Instagram ─────────────────────────────────────────
   if client.instagram_handle is confirmed:
     POST apify.actor("apify/instagram-profile-scraper").call(
       input = { usernames: [client.instagram_handle], resultsLimit: 10 }
     )
     → posts + captions → LLM classify signals
     → if post has no caption: pass image to vision LLM (GPT-4o / Gemini)
     → update social_intelligence:
         instagram_last_checked = now()
         instagram_next_check   = now() + 24h
         instagram_signals      = ["pregnancy"] or []
         instagram_last_summary = "Posted bump photo on 17 Jun"
   else if handle is pending/null:
     run Exa handle resolution → store handle candidate

   ── Legacy.com ────────────────────────────────────────
   always runs (uses name + city + known_family_members):
     GET exa.search(
       query = '"{family_member}" obituary "{client.city}"',
       includeDomains = ["legacy.com"],
       text = true
     )
     → results → LLM checks if any match known family members
     → update social_intelligence:
         legacy_last_checked = now()
         legacy_next_check   = now() + 24h
         legacy_signals      = ["family_death"] or []
         legacy_last_summary = "Obituary found: Ahmad bin Fariz, father — Jun 2026"

3. If any platform found signals:
     social_intelligence.pending_batch = true
```

---

### Weekly Batch Flow — `generate_outreach_batch()`

```
1. Query Convex: social_intelligence WHERE pending_batch = true

2. For each flagged client:
   - Collect all signals across platforms
   - Score urgency:
       family_death, pregnancy → HIGH
       new_baby, marriage, new_home → HIGH
       new_job, promotion → MEDIUM
       layoff, retirement → MEDIUM
       divorce → MEDIUM

3. LLM generates batch_sales_angle:
   input: list of clients + their signals
   output: "This week focus on young families — 2 pregnancy signals, 1 new baby.
            Also follow up with Bob on his income change (new job at CIMB)."

4. Write outreach_batches record:
   {
     created_at: now(),
     batch_sales_angle: "...",
     clients: [
       { client_id: bob, notes: "New job — review coverage limit", outreached: false },
       { client_id: sarah, notes: "Pregnancy — dependent coverage pitch", outreached: false }
     ]
   }

5. Set social_intelligence.pending_batch = false
   Set social_intelligence.last_batched_at = now()
   for all included clients

6. Notify OpenClaw via Python API:
   POST /internal/notify-advisor
   → OpenClaw sends WhatsApp to advisor:
     "Good morning! This week's outreach batch is ready.
      • Bob — new job at CIMB
      • Sarah — pregnancy announcement
      • Raina — father passed
      Check your dashboard."
```

---

## 9. OpenClaw Harness

OpenClaw handles only what requires WhatsApp access. All DB reads/writes go through the Python API.

### What OpenClaw does


| Trigger                                   | Flow                                                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Advisor: "Remind me about Raina tomorrow" | Fetch WA chat history with Raina → LLM extracts follow-ups → reply with summary + set reminder                                                  |
| Advisor: "Who should I call this week?"   | `GET /outreach/batch/current` → format and reply                                                                                                |
| Advisor: "Update me on Ahmad"             | `GET /clients?name=Ahmad` + `GET /social-intelligence/:id` → reply with latest signals                                                          |
| Monday batch ready                        | Backend POSTs to `/internal/notify-advisor` → OpenClaw sends WA message                                                                         |
| Handle confirmation                       | Backend flags pending handle → OpenClaw asks advisor: "Is this Ahmad? [link]" → advisor replies yes/no → `POST /clients/:id/resolution/confirm` |


### OpenClaw Skills (minimal set)


| Skill                   | What it does                                                              |
| ----------------------- | ------------------------------------------------------------------------- |
| `fetch_wa_chat_history` | `loadMessages(jid, 50)` for a client's WA number → returns structured log |
| `extract_followups`     | LLM over chat log → extracts promises/todos → replies to advisor          |
| `surface_batch`         | Calls `/outreach/batch/current` → formats for WA reply                    |
| `confirm_handle`        | Presents handle candidate to advisor → writes confirm/reject to API       |


---

OpenClaw runs on a cron schedule and calls the Python worker endpoints. It also serves as the interface for the advisor to confirm handles via chat.

### Cron Schedule (configured in OpenClaw)

```
Daily  02:00 AM  → POST /workers/resolve-handles
Daily  03:00 AM  → POST /workers/scan-linkedin
Daily  03:30 AM  → POST /workers/scan-instagram
Daily  04:00 AM  → POST /workers/scan-legacy
Monday 06:00 AM  → POST /workers/generate-batch
```

### OpenClaw Skills

`**resolve_client_handle**`
Called when advisor says: "Find Ahmad's Instagram" or when resolution queue has pending items.

- Runs Exa search for the client
- Scores candidates
- If high confidence: auto-stores and confirms
- If medium: asks advisor "Is this Ahmad? [link]"
- If low: asks advisor to provide handle manually

`**scan_client**`
Called on demand: "Check what's new with Raina"

- Fetches latest LinkedIn + Instagram for that client
- Runs signal detection
- Returns summary to advisor

`**weekly_briefing**`
Called every Monday morning automatically (or on demand: "Who should I reach out to this week?")

- Returns the current outreach batch
- Format: "This week: Bob (new job at CIMB), Sarah (new baby), Raina (father passed)"

---

## 9. Signal Detection — LLM Prompt Design

Each platform's scraped content is passed to an LLM with structured output:

**Input**

```json
{
  "client": { "name": "Ahmad Fariz", "company": "Maybank", "city": "KL" },
  "platform": "instagram",
  "content": [ { "date": "2026-06-15", "caption": "Alhamdulillah, our little one is here 🍼" } ]
}
```

**Output schema**

```json
{
  "signals": [
    {
      "signal_type": "new_baby",
      "confidence": "high",
      "summary": "Posted new baby announcement on 15 Jun",
      "source_date": "2026-06-15",
      "evidence": "Caption: 'Alhamdulillah, our little one is here'"
    }
  ],
  "no_signal": false
}
```

For Instagram, images with no caption are passed to a **vision LLM** (baby bump photos, wedding photos, etc. are visual-only signals).

---

## 10. Build Order

1. **Convex schema** — create all tables
2. **Python API skeleton** — FastAPI, all endpoints returning stubs
3. **Handle resolution worker** — Exa search + LLM scoring
4. **LinkedIn scanner** — Exa search by stored `linkedin_url`, LLM signal detection
5. **Instagram scanner** — Apify call by stored `instagram_handle`, LLM signal detection
6. **Legacy.com scanner** — Exa search by client name + family members + city
7. **Batch generator** — weekly outreach batch from signals
8. **OpenClaw skill wiring** — cron jobs + skills for handle confirm flow
9. **Dashboard** (frontend, future phase)

---

## 11. Environment Variables

```
# Exa
EXA_API_KEY=

# Apify
APIFY_API_TOKEN=

# Convex
CONVEX_URL=
CONVEX_DEPLOY_KEY=

# LLM (for signal detection + handle scoring)
OPENAI_API_KEY=        # or ILMU_API_KEY if using ilmu models
LLM_MODEL=             # e.g. gpt-4o or google/gemini-3.1-pro-preview
```

---

## 12. Constraints & Notes

- **ToS**: Apify and Exa scraping of LinkedIn/Instagram violates their ToS. Acceptable for a hackathon demo; not for production without legal review.
- **Handle resolution is one-time per client** — stored after first resolution, never re-run unless advisor requests.
- **Vision LLM for Instagram** — required for baby bump / wedding photos with no caption text. Use GPT-4o vision or Gemini.
- **Legacy.com search quality** depends on having family member names in the client record. Prompt advisors to fill this in during onboarding.
- **Apify free tier**: 5 crawls/month — in demo, trigger manually per client rather than running bulk daily scans.

