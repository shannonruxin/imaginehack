# ImagineHack — Sales Initiative: Social Listening
## Project Spec

---

## 1. Overview

A social listening system for life insurance advisors. Monitors tracked clients' public social profiles to detect life events that signal a good time to reach out. Surfaces a weekly outreach batch to the advisor: "Work on these clients this week — here's why."

**Scope for this hackathon**: social listening + WhatsApp chat history logging. No outreach sending yet.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Convex DB                              │
│         clients | messages | projects                           │
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

| Platform | Tool | What we get | Limitation |
|----------|------|-------------|------------|
| LinkedIn | Exa `site:linkedin.com` | Public profile, current role, recent posts | Login-gated data inaccessible |
| Instagram | Apify instagram-profile-scraper | Public posts, captions, profile bio | Requires username, not name |
| Legacy.com | Exa `includeDomains: legacy.com` | Obituary results by name + city | Needs family member names for best match |
| WhatsApp chat history | Baileys service | All messages with tracked clients, streamed in real-time | Clients only — filtered at source |
| Handle resolution | Exa web search | Resolves real name → likely IG username | Confidence-scored, advisor confirms medium confidence |

---

## 4. Life Event Signals

| Signal | Source | Insurance relevance |
|--------|--------|-------------------|
| `new_baby` | Instagram, LinkedIn | New dependent → new/increased coverage |
| `pregnancy` | Instagram | Pre-birth planning window |
| `marriage` | Instagram, LinkedIn | Joint life plans, beneficiary update |
| `new_job` | LinkedIn | Income change → policy review |
| `promotion` | LinkedIn | Income increase → upsell opportunity |
| `layoff` | LinkedIn | May need income protection |
| `retirement` | LinkedIn | Major financial restructuring |
| `new_home` | Instagram, LinkedIn | Mortgage protection insurance |
| `family_death` | Legacy.com | Mortality salience, beneficiary review |
| `divorce` | Instagram | Beneficiary changes, loss of spouse coverage |

---

## 5. Handle Resolution Pipeline

Runs once when a client is added. Finds their Instagram handle and LinkedIn URL before any paid API calls are made.

```
Client added to DB { name, company, city, occupation }
        │
        ▼
Exa search (free, 20k req/month) — run in parallel:
  - '"[name]" [company] site:instagram.com'
  - '"[name]" "[city]" instagram'
  - '"[name]" [company] site:linkedin.com'
        │
        ▼
LLM scores each candidate:
  +3  bio mentions client's company
  +2  bio mentions client's city
  +2  display name matches client name
  +1  industry keyword in bio
  +1  LinkedIn profile links to this IG
        │
        ├── HIGH (≥ 6)  → auto-store, begin monitoring
        ├── MEDIUM (3–5) → dashboard: "Is this [name]? [link] — Confirm / Reject"
        └── LOW (< 3)   → dashboard: "Add [name]'s handle manually"
```

Stored on client record inside `social_intelligence[]`. Never re-runs unless advisor requests.

---

## 6. Convex DB Schema

Each table owns one concern. No field is duplicated across tables.

| Table | Owns |
| --- | --- |
| `clients` | Identity, profile, insurance, social handles + scan schedule |
| `signals` | Every detected life event (source of truth) |
| `outreach_batches` | Weekly auto-generated advisor recommendations |
| `projects` | Advisor-created campaigns and outreach workflow |
| `chat_history` | WhatsApp message log — reserved for OpenClaw only |

---

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

### Table 3: `outreach_batches`

Weekly auto-generated recommendations. Written by `generate_outreach_batch()`. Separate from advisor-created projects.

```ts
outreach_batches: defineTable({
  week_of: v.string(),           // ISO date of Monday, e.g. "2026-06-23"
  batch_sales_angle: v.string(), // LLM-generated weekly summary
  created_at: v.number(),

  clients: v.array(v.object({
    client_id: v.id("clients"),
    notes: v.string(),           // "New job — review coverage limit"
    outreached: v.boolean(),
  })),
})
.index("by_week", ["week_of"])
```

---

### Table 4: `projects`

Advisor-created campaigns. Not generated by cron — created manually to track a sales initiative across clients.

```ts
projects: defineTable({
  name: v.string(),         // "June 2026 Young Families Drive"
  sales_angle: v.string(),
  created_at: v.number(),

  clients: v.array(v.object({
    client_id: v.id("clients"),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("contacted"),
      v.literal("responded"),
      v.literal("closed_won"),
      v.literal("closed_lost")
    ),
    outreached: v.boolean(),
  })),
})
```

---

### Table 5: `chat_history`

Reserved for OpenClaw only. Stores the WhatsApp conversation history grouped by client. Each client has one chat_history record containing all messages inside a nested JSON array. The Python backend never reads or writes here.

```ts

chat_history: defineTable({

  client_id: v.id("clients"),

  // all WhatsApp messages for this client
  messages: v.array(v.object({

    // who sent the message
    sender: v.union(

      v.literal("client"),
      v.literal("advisor")

    ),
    // actual WhatsApp message
    message: v.string(),

    // when it happened
    timestamp: v.number()

  }))
})
.index("by_client", ["client_id"])
```

---

### What each update touches

| Operation | Table written |
| --- | --- |
| Add new client | `clients` only |
| Resolve Instagram / LinkedIn handle | `clients.platforms` only |
| Scan detects a signal | `signals` only (insert new row) |
| Generate weekly batch | `signals.batched = true`, insert into `outreach_batches` |
| Advisor marks signal actioned | `signals.actioned = true` only |
| Advisor marks outreached in batch | `outreach_batches.clients[].outreached` only |
| Advisor updates project status | `projects.clients[].status` only |
| OpenClaw receives/sends WA message | chat_history.messages array updated |

---

## 7. Python Backend — API Endpoints

### Clients
```
POST   /clients                         Add client (triggers handle resolution)
GET    /clients                         List all clients
GET    /clients/:id                     Get client detail
PATCH  /clients/:id                     Update client
GET    /clients/exists?number=          Check if number is a tracked client (used by Baileys)
```

### Handle Resolution
```
GET    /clients/:id/resolution          Get resolution status + candidates
POST   /clients/:id/resolution/confirm  { handle, platform } — advisor confirms
POST   /clients/:id/resolution/skip     Skip social monitoring for this client
POST   /clients/:id/resolution/manual   { handle, platform } — advisor sets manually
```

### Messages (written by Baileys, read by backend for LLM synthesis)
```
POST   /internal/messages               Baileys writes incoming messages
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
GET    /projects                        List projects
POST   /projects                        Create project manually
GET    /projects/:id                    Get project detail
PATCH  /projects/:id/clients/:clientId  Update client status within project
```

### Internal workers (called by APScheduler cron, not exposed publicly)
```
/workers/resolve-handles    Resolve social handles for new clients
/workers/scan-linkedin      Scan LinkedIn for due clients
/workers/scan-instagram     Scan Instagram for due clients
/workers/scan-legacy        Scan Legacy.com for due clients
/workers/generate-batch     Generate weekly project from signals
/workers/notify-advisor     Trigger OpenClaw to message advisor
```

---

## 9. Backend Cron — Social Intelligence Pipeline

All scanning owned by Python backend (APScheduler). Neither Baileys nor OpenClaw are involved.

### Schedule
```
Daily  03:00 AM  →  scan_due_clients()
Monday 06:00 AM  →  generate_weekly_project()
```

### Daily Scan — `scan_due_clients()`

Exa and Apify fetch content daily. LLM only runs if content changed since last scan (hash check). This keeps OpenClaw out of scanning entirely — it has no role here.

```
1. Query clients WHERE any social_intelligence[].next_check < now()

2. For each due client, per platform in parallel:

   LinkedIn
     if handle set:
       raw = exa.search(query=site:{linkedin_url}, text=true)
       hash = md5(raw.text)
       if hash == social_intelligence[linkedin].content_hash:
         → skip LLM, just update last_checked + next_check  ← no credit spent
       else:
         → LLM classifies signals from raw.text
         → update social_intelligence[linkedin]:
             last_checked, next_check, content_hash=hash, data_found
     else:
       → run handle resolution

   Instagram
     if handle confirmed:
       posts = apify.actor("instagram-profile-scraper")
                 .call({ usernames: [handle], resultsLimit: 10 })
       hash = md5(join(post.caption for post in posts))
       if hash == social_intelligence[instagram].content_hash:
         → skip LLM, update timestamps only
       else:
         → LLM classifies signals (+ vision LLM for captionless images)
         → update social_intelligence[instagram]: content_hash=hash, data_found
     else:
       → run handle resolution

   Legacy.com
     raw = exa.search('"{name}" obituary "{city}"', includeDomains=["legacy.com"])
     hash = md5(raw.text)
     if hash == social_intelligence[legacy].content_hash:
       → skip LLM, update timestamps only
     else:
       → LLM checks for family member matches
       → update social_intelligence[legacy]: content_hash=hash, data_found

3. If new signals found → set pending_batch = true
```

**Result**: Exa/Apify runs daily (cheap). LLM only fires when content actually changed. OpenClaw never involved.

### Weekly Project — `generate_weekly_project()`

```
1. Query clients WHERE any social_intelligence[].pending_batch = true

2. For each flagged client, collect all signals, score urgency:
     family_death, pregnancy          → HIGH
     new_baby, marriage, new_home     → HIGH
     new_job, promotion               → MEDIUM
     layoff, retirement, divorce      → MEDIUM

3. LLM generates project name + sales_angle from signal summary

4. Write projects record:
   {
     name: "Week of 22 Jun — Young Families + Income Changes",
     sales_angle: "...",
     clients: [
       { client_id: bob,   notes: "New job at CIMB — review coverage", status: "pending" },
       { client_id: sarah, notes: "Pregnancy — dependent coverage pitch", status: "pending" }
     ]
   }

5. Set pending_batch = false for all included clients

6. POST /workers/notify-advisor → OpenClaw sends WA message to advisor
```

---

## 10. OpenClaw — Thin WA Adapter

OpenClaw has zero business logic. It receives advisor messages, POSTs to backend, sends reply back.

### Flow
```
Advisor texts OpenClaw
  → OpenClaw: POST /advisor/message { advisor_message, client_name? }
  → Backend: resolves intent → queries DB → calls LLM → returns { reply }
  → OpenClaw: sends reply to advisor
```

### What advisor can say
| Message | Backend does |
|---------|-------------|
| "Remind me about Raina tomorrow" | Queries Raina's messages from Convex → LLM extracts follow-ups → schedules reminder |
| "What's up with Ahmad?" | Queries Ahmad's messages + social signals → LLM summarizes → returns |
| "Who should I call this week?" | Returns current week's project clients |
| "Ahmad's Instagram is @ahmadfariz92" | Writes handle to client record |

OpenClaw never touches Convex directly — always via `/advisor/message`.

---

## 11. Signal Detection — LLM Prompt

**Input**
```json
{
  "client": { "name": "Ahmad Fariz", "company": "Maybank", "city": "KL" },
  "platform": "instagram",
  "content": [{ "date": "2026-06-15", "caption": "Alhamdulillah, our little one is here 🍼" }]
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

## 12. Build Order

1. **Convex schema** — `clients`, `messages`, `projects` tables
2. **Python API skeleton** — FastAPI, all endpoints stubbed
3. **Baileys service** — session, message filter, POST to backend
4. **Handle resolution** — Exa search + LLM scoring + store
5. **LinkedIn scanner** — Exa + LLM signal detection
6. **Instagram scanner** — Apify + LLM (+ vision for images)
7. **Legacy.com scanner** — Exa + LLM family match
8. **Weekly batch** — aggregate signals → write project → notify
9. **Advisor intent handler** — `/advisor/message` → LLM routes and responds
10. **OpenClaw wiring** — single skill: receive msg → POST to backend → reply

---

## 13. Environment Variables

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

## 14. Constraints & Notes

- **ToS**: Apify/Exa scraping of LinkedIn/Instagram violates their ToS. Fine for hackathon, needs legal review for production.
- **Baileys filters at source** — only tracked client numbers are stored. Non-client messages never touch the DB.
- **Vision LLM** — required for Instagram images with no caption. Use GPT-4o vision or Gemini.
- **Legacy.com quality** — depends on having known family member names. Prompt advisor during client onboarding.
- **Apify free tier** — 5 crawls/month. For demo, trigger per client manually rather than bulk daily scan.
- **Baileys session** — QR scan required on first run. Session persisted to disk, auto-reconnects on pod restart.
- **Message backfill** — for clients added after Baileys was running, only future messages are captured. Historical WA messages before Baileys started are not available unless `fetchMessageHistory` backfill is implemented (future).
