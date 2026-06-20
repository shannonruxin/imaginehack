# ImagineHack — Sales Initiative: Social Listening

## Project Spec

---

## 1. Overview

A social listening system for life insurance advisors. Monitors tracked clients' public social profiles to detect life events that signal a good time to reach out. Surfaces a weekly outreach project to the advisor: "Work on these clients this week — here's why."

**Scope for this hackathon**: social listening + WhatsApp chat history logging. No outreach sending yet.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Convex DB                              │
│              clients | projects | chat_history                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────▼─────────────────┐
              │         Python Backend            │
              │    FastAPI + APScheduler cron     │
              └──────┬──────────────┬─────────────┘
                     │              │
           ┌─────────▼───┐    ┌─────▼──────┐
           │   Exa API   │    │  Apify API │
           │ (LinkedIn,  │    │(Instagram) │
           │  Legacy,    │    └────────────┘
           │  handles)   │
           └─────────────┘

┌──────────────────────────┐     ┌──────────────────────────┐
│    Baileys Service       │     │        OpenClaw          │
│    (Node.js, always on)  │     │   (WhatsApp interface)   │
│                          │     │                          │
│ - holds WA session       │     │ - receives advisor msgs  │
│ - streams all msgs       │     │ - POST to backend        │
│ - filters to clients     │     │ - sends backend reply    │
│   only                   │     │   back to advisor        │
│ - POST /internal/msgs    │     └──────────────────────────┘
│   → Python backend       │
└──────────────────────────┘
```

**Separation of concerns:**

- **Baileys service** — persistent WA connection, streams client messages to backend, nothing else
- **Python backend** — all logic: cron, Exa/Apify calls, LLM signal detection, DB writes, advisor intent handling
- **OpenClaw** — read-only notification + conversation layer. Reads DB flags, notifies advisor, handles advisor chat. Never calls Exa, Apify, or LLM for scanning — only fires when advisor sends a message or a batch is ready
- **Convex DB** — shared state

**Why Exa and scanning live in the backend, not OpenClaw:**

- OpenClaw model credits only fire on meaningful interactions (advisor message, Monday batch)
- Scanning runs on a cron regardless of OpenClaw — no model cost for routine checks
- Hash-based change detection means LLM only runs when content actually changed since last scan
- All intelligence in one place — easier to maintain and extend

---

## 3. Data Sources


| Platform              | Tool                             | What we get                                              | Limitation                                            |
| --------------------- | -------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| LinkedIn              | Exa `site:linkedin.com`          | Public profile, current role, recent posts               | Login-gated data inaccessible                         |
| Instagram             | Apify instagram-profile-scraper  | Public posts, captions, profile bio                      | Requires username, not name                           |
| Legacy.com            | Exa `includeDomains: legacy.com` | Obituary results by name + city                          | Needs family member names for best match              |
| WhatsApp chat history | Baileys service                  | All messages with tracked clients, streamed in real-time | Clients only — filtered at source                     |
| Handle resolution     | Exa web search                   | Resolves real name → likely IG username                  | Confidence-scored, advisor confirms medium confidence |


---

## 4. Life Event Signals


| Signal         | Source              | Insurance relevance                          |
| -------------- | ------------------- | -------------------------------------------- |
| `new_baby`     | Instagram, LinkedIn | New dependent → new/increased coverage       |
| `pregnancy`    | Instagram           | Pre-birth planning window                    |
| `marriage`     | Instagram, LinkedIn | Joint life plans, beneficiary update         |
| `new_job`      | LinkedIn            | Income change → policy review                |
| `promotion`    | LinkedIn            | Income increase → upsell opportunity         |
| `layoff`       | LinkedIn            | May need income protection                   |
| `retirement`   | LinkedIn            | Major financial restructuring                |
| `new_home`     | Instagram, LinkedIn | Mortgage protection insurance                |
| `family_death` | Legacy.com          | Mortality salience, beneficiary review       |
| `divorce`      | Instagram           | Beneficiary changes, loss of spouse coverage |


---

## 5. Handle Resolution Pipeline

Runs once when a client is added. Finds their Instagram handle and LinkedIn URL before any paid API calls are made.

```
Client added to DB { first_name, last_name, socials[], occupation }
        │
        ▼
Exa search (free, 20k req/month) — run in parallel:
  - '"[name]" [occupation] site:instagram.com'
  - '"[name]" instagram'
  - '"[name]" [occupation] site:linkedin.com'
        │
        ▼
LLM scores each candidate:
  +3  bio mentions client's occupation
  +2  display name matches client name
  +2  city keyword in bio
  +1  industry keyword in bio
        │
        ├── HIGH (≥ 6)  → auto-store, begin monitoring
        ├── MEDIUM (3–5) → dashboard: "Is this [name]? [link] — Confirm / Reject"
        └── LOW (< 3)   → dashboard: "Add [name]'s handle manually"
```

Stored as an entry in `clients.socials[]`. Never re-runs unless advisor requests.

---

## 6. Convex DB Schema

Three tables. No field is duplicated across tables.


| Table          | Owns                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| `clients`      | Full client profile including social intelligence fetched data              |
| `projects`     | Weekly auto-generated outreach todo list — each row is a batch for the week |
| `chat_history` | WhatsApp message log — reserved for OpenClaw only                           |


---

### Table 1: `clients`

```
_id                             auto

-- Demographic
first_name                      string
last_name                       string
age                             number
nationality                     string
income_range                    string              -- e.g. "RM 8,000–12,000"

-- Contact
number                          string              -- WhatsApp / phone (E.164)
email                           string

-- Socials (optional, multiple entries, one per platform/link)
socials                         array of:
  type                            "website" | "instagram" | "linkedin"
  value                           string            -- URL or handle

-- Family
marital_status                  "single" | "married" | "divorced" | "engaged"
dependents                      array of:
  relationship                    "spouse" | "child" | "parent" | "sibling" | "grandparent" | "grandchild" | "in_law" | "other"
  first_name                      string
  last_name                       string
  age                             number

-- Existing insurance
existing_policies               array of:
  policy_id                       string
  name                            string
  type                            "term_life" | "whole_life" | "medical" | "critical_illness" | "takaful" | "investment_linked" | "other"
  start_date                      string            -- ISO date
  end_date                        string | null
  beneficiaries                   array of:
    relationship                    "spouse" | "child" | "parent" | "sibling" | "grandparent" | "grandchild" | "in_law" | "other"
    first_name                      string
    last_name                       string

-- Sales opportunities (log of noted opportunities, newest first)
sales_opportunities             array of:
  created_at                      number            -- timestamp
  description                     string            -- e.g. "Consider education endowment for first child"

-- Global persona (overwritten after each scan — cheap LLM classification)
persona                         object | null
  tags                            array of string   -- e.g. ["family-oriented", "frequent-traveler"]
  summary                         string            -- one-sentence lifestyle summary for advisor
  updated_at                      number            -- timestamp

-- Recent signals (latest scan per platform — replaced on each scan, max 10 posts each)
recent_signals                  array of:
  date_fetched                    number            -- timestamp of scan run
  platform                        "linkedin" | "instagram" | "legacy"
  content                         string            -- raw JSON string of what Exa / Apify returned (last 10 posts)

created_at                      number
```

**Notes on `persona` vs `recent_signals`**:

- **`persona`** — stable lifestyle classification (family-oriented, frequent-traveler, luxury-lifestyle, etc.). Overwritten after every scan using a cheap LLM call. Advisors see this immediately as context for *how* to talk to the client.
- **`recent_signals`** — one entry per platform, replaced on each scan (not appended). Stores the last 10 posts/results raw so the batch generator can detect *timely* life events (new baby, job change, travel). Keeps only what's recent and relevant.
- Valid persona tags: `family-oriented`, `frequent-traveler`, `luxury-high-net-worth`, `health-and-fitness`, `career-driven`, `entrepreneur`, `religious-conservative`.

---

### Table 2: `projects`

The weekly outreach todo list. Generated automatically by the Monday batch cron. Can also be created manually by the advisor. Each row is a standalone batch — a set of clients to work on that week with a shared angle.

```
_id                             auto

batch_sales_angle               string              -- e.g. "Young families — focus on dependent coverage"
created_at                      number

clients                         array of:
  client_id                       reference → clients
  notes                           string | null     -- per-client outreach context
  status                          "to_follow_up" | "meeting_rescheduled" | "stale" | "help_me_out"
  next_follow_up_scheduled        string | null     -- ISO date, optional
  next_meeting_scheduled          string | null     -- ISO date, optional
```

---

### Table 3: `chat_history`

Reserved for OpenClaw only. Stores the WhatsApp conversation history grouped by client. Each client has one chat_history record containing all messages inside a nested JSON array. The Python backend never reads or writes here.

```
_id                             auto

client_id                       reference → clients

messages                        array of:
  sender                          "client" | "advisor"
  message                         string
  timestamp                       number

updated_at                      number
```

Index: `by_client_id` on `client_id`

---

### What each operation touches


| Operation                           | Table written                                            |
| ----------------------------------- | -------------------------------------------------------- |
| Add new client                      | `clients` only                                           |
| Resolve Instagram / LinkedIn handle | `clients.socials[]` — append or update entry             |
| Scan runs (Exa / Apify)             | `clients.recent_signals[]` — replace entry for that platform |
| Generate weekly batch               | Insert row into `projects` with flagged clients          |
| Advisor marks client status         | `projects.clients[].status`                              |
| Advisor sets follow-up date         | `projects.clients[].next_follow_up_scheduled`            |
| Advisor logs sales opportunity      | `clients.sales_opportunities[]` — append entry           |
| OpenClaw receives/sends WA message  | `chat_history.messages[]` — append                       |


---

## 7. Python Backend — API Endpoints

### Clients

```
POST   /clients                         Add client (triggers handle resolution)
GET    /clients                         List all clients
GET    /clients/:id                     Get client detail
PATCH  /clients/:id                     Update client fields
GET    /clients/exists?number=          Check if number is a tracked client (used by Baileys)
```

### Social Opportunities

```
POST   /clients/:id/opportunities       Append a new sales opportunity { description }
```

### Handle Resolution

```
GET    /clients/:id/resolution          Get resolution status + candidates
POST   /clients/:id/resolution/confirm  { type, value } — advisor confirms handle
POST   /clients/:id/resolution/skip     Skip social monitoring for this client
POST   /clients/:id/resolution/manual   { type, value } — advisor sets manually
```

### Messages (written by Baileys, read by backend for LLM synthesis)

```
POST   /internal/messages               Baileys writes incoming client messages
GET    /clients/:id/messages            Get message history for a client
```

### Advisor intent (called by OpenClaw)

```
POST   /advisor/message
  body: { advisor_message: string, client_name?: string }
  → backend resolves intent, queries DB, calls LLM, returns reply string
  response: { reply: string }
```

### Projects

```
GET    /projects                                          List projects (newest first)
POST   /projects                                          Create project manually
GET    /projects/:id                                      Get project detail
PATCH  /projects/:id/clients/:clientId                    Update client status / dates within project
```

### Internal workers (called by APScheduler cron, not exposed publicly)

```
/workers/resolve-handles    Resolve social handles for new clients
/workers/scan-linkedin      Scan LinkedIn for due clients
/workers/scan-instagram     Scan Instagram for due clients
/workers/scan-legacy        Scan Legacy.com for due clients
/workers/generate-batch     Generate weekly project from latest social intelligence
/workers/notify-advisor     Trigger OpenClaw to message advisor
```

---

## 8. Backend Cron — Social Intelligence Pipeline

All scanning owned by Python backend (APScheduler). Neither Baileys nor OpenClaw are involved.

### Schedule

```
Daily  03:00 AM  →  scan_due_clients()
Monday 06:00 AM  →  generate_weekly_project()
```

### Daily Scan — `scan_due_clients()`

Exa and Apify fetch content daily and always store it (no hash-check). After each platform scan, a cheap LLM call refreshes the client's `persona`. This keeps the pipeline simple and persona always current.

```
1. Query all clients

2. For each client, per platform in parallel:

   LinkedIn
     find entry in socials[] where type == "linkedin"
     if found:
       raw = exa.fetch_linkedin_profile(value)  -- Exa search on the profile URL
       → set recent_signals[platform="linkedin"] = { date_fetched, content: json_str(raw) }
         (replaces previous linkedin entry)
       → classify_persona(client, all recent_signals) → update client.persona
     else:
       → run handle resolution

   Instagram
     find entry in socials[] where type == "instagram"
     if found:
       posts = apify.run_instagram_scraper(handle, results_limit=10)
       → set recent_signals[platform="instagram"] = { date_fetched, content: json_str(posts) }
       → classify_persona(client, all recent_signals) → update client.persona
     else:
       → run handle resolution

   Legacy.com
     name = first_name + " " + last_name (+ dependent names)
     raw = exa.search_legacy(name, family_members)
     → set recent_signals[platform="legacy"] = { date_fetched, content: json_str(raw) }
     → classify_persona(client, all recent_signals) → update client.persona

3. Batch generator reads recent_signals to detect timely life events
```

**Result**: Exa/Apify runs daily (cheap, no hash logic). Persona LLM fires once per platform per scan (cheap model, few tokens). Batch LLM fires once per week for signal detection + angle generation.

### Weekly Project — `generate_weekly_project()`

```
1. For each client, read recent_signals[] (all platforms) for entries newer than last project's created_at
   LLM extracts timely signals and scores urgency (also includes persona in context):
     family_death, pregnancy          → HIGH
     new_baby, marriage, new_home     → HIGH
     new_job, promotion               → MEDIUM
     layoff, retirement, divorce      → MEDIUM

2. Collect clients with HIGH or MEDIUM signals detected since last batch

3. LLM generates batch_sales_angle from aggregated signal summary

4. Insert projects record:
   {
     batch_sales_angle: "Young families + new income changes — review coverage limits",
     clients: [
       { client_id: ..., notes: "New job at CIMB — review coverage", status: "to_follow_up" },
       { client_id: ..., notes: "Pregnancy post detected — dependent coverage pitch", status: "to_follow_up" }
     ]
   }

5. POST /workers/notify-advisor → OpenClaw sends WA message to advisor
```

---

## 9. OpenClaw — Thin WA Adapter

OpenClaw has zero business logic. It receives advisor messages, POSTs to backend, sends reply back.

### Flow

```
Advisor texts OpenClaw
  → OpenClaw: POST /advisor/message { advisor_message, client_name? }
  → Backend: resolves intent → queries DB → calls LLM → returns { reply }
  → OpenClaw: sends reply to advisor
```

### What advisor can say


| Message                              | Backend does                                                                |
| ------------------------------------ | --------------------------------------------------------------------------- |
| "Remind me about Raina tomorrow"     | Queries Raina's chat_history → LLM extracts follow-ups → schedules reminder |
| "What's up with Ahmad?"              | Queries Ahmad's chat_history + latest social_intelligence → LLM summarizes  |
| "Who should I call this week?"       | Returns current week's project clients + notes                              |
| "Ahmad's Instagram is @ahmadfariz92" | Appends entry to clients.socials[]                                          |


OpenClaw never touches Convex directly — always via `/advisor/message`.

---

## 10. Signal Detection — LLM Prompt

**Input**

```json
{
  "client": { "first_name": "Ahmad", "last_name": "Fariz", "occupation": "Software Engineer" },
  "platform": "instagram",
  "content": "[{\"date\": \"2026-06-15\", \"caption\": \"Alhamdulillah, our little one is here 🍼\"}]"
}
```

**Output**

```json
{
  "signals": [{
    "signal_type": "new_baby",
    "confidence": "high",
    "summary": "Posted new baby announcement on 15 Jun",
    "evidence": "Caption: 'Alhamdulillah, our little one is here'"
  }],
  "no_signal": false
}
```

Vision LLM fires for Instagram images with no caption text.

---

## 11. Build Order

1. **Convex schema** — `clients`, `projects`, `chat_history`
2. **Python API skeleton** — FastAPI, all endpoints stubbed
3. **Baileys service** — session, message filter, POST to backend
4. **Handle resolution** — Exa search + LLM scoring + append to `socials[]`
5. **LinkedIn scanner** — Exa fetch → `set_recent_signals("linkedin")` → cheap `classify_persona` LLM → update `client.persona`
6. **Instagram scanner** — Apify fetch (last 10 posts) → `set_recent_signals("instagram")` → `classify_persona` → update `client.persona`
7. **Legacy.com scanner** — Exa fetch → `set_recent_signals("legacy")` → `classify_persona` → update `client.persona`
8. **Weekly batch** — read `recent_signals` per client (since last batch) → LLM signal detection → write project with persona-aware notes → notify
9. **Advisor intent handler** — `/advisor/message` → LLM routes and responds
10. **OpenClaw wiring** — single skill: receive msg → POST to backend → reply

---

## 12. Environment Variables

```
# Exa
EXA_API_KEY=

# Apify
APIFY_API_TOKEN=

# Convex
CONVEX_URL=
CONVEX_DEPLOY_KEY=

# LLM
OPENAI_API_KEY=           # or ILMU_API_KEY
LLM_MODEL=                # e.g. gpt-4o or google/gemini-3.1-pro-preview

# Baileys service URL (internal)
BAILEYS_SERVICE_URL=http://baileys-service:3001

# OpenClaw webhook (for notify-advisor)
OPENCLAW_WEBHOOK_URL=
```

---

## 13. Constraints & Notes

- **ToS**: Apify/Exa scraping of LinkedIn/Instagram violates their ToS. Fine for hackathon, needs legal review for production.
- **Baileys filters at source** — only tracked client numbers are stored. Non-client messages never touch the DB.
- **Vision LLM** — required for Instagram images with no caption. Use GPT-4o vision or Gemini.
- **Legacy.com quality** — depends on having known dependent/family member names. Prompt advisor during client onboarding.
- **Apify free tier** — 5 crawls/month. For demo, trigger per client manually rather than bulk daily scan.
- **Baileys session** — QR scan required on first run. Session persisted to disk, auto-reconnects on pod restart.
- **`persona` vs `recent_signals` split** — `persona` is the stable, advisor-facing lifestyle summary (overwritten each scan via a cheap LLM). `recent_signals` is the timely raw content (one entry per platform, replaced each scan, max 10 posts). The two layers serve different jobs: persona shapes *how* the advisor talks; recent signals determine *when* to act.
- **Message backfill** — for clients added after Baileys was running, only future messages are captured.

