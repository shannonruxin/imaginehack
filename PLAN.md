# ImagineHack — Implementation Plan

Each component is listed in build order. Complete one before starting the next unless noted as parallelisable.

---

## Component 1 — Convex DB

**What**: Schema for all three tables. Everything else depends on this.

**Tasks**
- [ ] Init Convex project (`npx convex dev`)
- [ ] Define `clients` table with validators
- [ ] Define `messages` table with validators
- [ ] Define `projects` table with validators
- [ ] Write query: `getClientByNumber(number)` — used by Baileys filter check
- [ ] Write query: `getClientById(id)`
- [ ] Write query: `listClients()`
- [ ] Write mutation: `insertClient(data)`
- [ ] Write mutation: `insertMessage(data)`
- [ ] Write mutation: `upsertSocialIntelligence(clientId, platform, data)`
- [ ] Write mutation: `insertProject(data)`
- [ ] Write mutation: `updateProjectClientStatus(projectId, clientId, status)`

**Stack**: Convex (TypeScript schema + functions)

**Env needed**: `CONVEX_URL`, `CONVEX_DEPLOY_KEY`

---

## Component 2 — Python Backend

**What**: FastAPI app that owns all business logic — LLM calls, Exa/Apify calls, cron jobs, advisor intent handling. Everything routes through here.

**Structure**
```
backend/
  main.py              # FastAPI app entry
  routers/
    clients.py         # /clients endpoints
    messages.py        # /internal/messages
    projects.py        # /projects endpoints
    advisor.py         # /advisor/message — OpenClaw calls this
    workers.py         # /workers/* — internal cron endpoints
  services/
    convex.py          # Convex HTTP API wrapper
    exa.py             # Exa API calls
    apify.py           # Apify API calls
    llm.py             # LLM calls (OpenAI / ILMU)
  cron.py              # APScheduler setup
  config.py            # env vars
```

**Tasks**
- [ ] Set up FastAPI project + dependencies (`fastapi`, `uvicorn`, `httpx`, `apscheduler`)
- [ ] `config.py` — load all env vars
- [ ] `services/convex.py` — HTTP wrapper for Convex queries/mutations
- [ ] `routers/clients.py` — CRUD endpoints + `GET /clients/exists?number=`
- [ ] `routers/messages.py` — `POST /internal/messages` (Baileys writes here)
- [ ] `routers/projects.py` — list, get, create, update client status
- [ ] `routers/advisor.py` — `POST /advisor/message` intent handler (stub first)
- [ ] `routers/workers.py` — all `/workers/*` endpoints (stubs first)
- [ ] `cron.py` — APScheduler wired to worker functions, daily 3AM + Monday 6AM

**Stack**: Python, FastAPI, APScheduler, httpx

**Env needed**: `CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `EXA_API_KEY`, `APIFY_API_TOKEN`, `OPENAI_API_KEY`, `LLM_MODEL`

---

## Component 3 — Baileys Service

**Location**: `platform-api/baileys/`

**What**: Persistent Node.js process. Connects to the advisor's WhatsApp number via QR scan. Streams all incoming messages to backend — but only for tracked client numbers.

**Status**: OpenClaw is already connected to WhatsApp in the container. Baileys service will be a **separate** lightweight Node.js process alongside it, connected to the same or a different number depending on setup.

> Note: If the advisor's number is already linked to OpenClaw, Baileys cannot link the same number simultaneously (WhatsApp only allows one Web session). Two options:
> - Use a dedicated second number for Baileys (recommended for prod)
> - Or rely on OpenClaw's `messageReceived` plugin hook to forward messages to backend instead of running Baileys separately (simpler for hackathon)

**Structure**
```
platform-api/
  baileys/
    src/
      index.js        # entry — session init + event handlers
      filter.js       # client lookup + discard logic
      poster.js       # POST to Python backend
    auth/             # WA session credentials (gitignored)
    package.json
    .env
```

**Tasks**
- [ ] `npm init` inside `platform-api/baileys/`
- [ ] Install `@whiskeysockets/baileys`, `express`, `axios`, `dotenv`
- [ ] `src/index.js` — session init + `useMultiFileAuthState('./auth')`
- [ ] `src/filter.js` — `GET /clients/exists?number=` check against backend
- [ ] `src/poster.js` — `POST /internal/messages` to backend
- [ ] Implement `messages.upsert` handler:
  - Extract phone number from JID
  - Call filter → if client: call poster
  - If not client: discard silently
- [ ] Implement auto-reconnect on disconnect
- [ ] Expose `GET /health` for liveness check
- [ ] Add `auth/` to `.gitignore`
- [ ] Add `baileys` service to root `docker-compose.yml`

**Stack**: Node.js, `@whiskeysockets/baileys`, Express

**Env needed**: `BACKEND_URL=http://backend:8000`

---

## Component 4 — Handle Resolution (Exa)

**What**: When a client is added, find their Instagram handle and LinkedIn URL using Exa web search. Confidence-score the results. Auto-store if high confidence, flag for advisor if medium, prompt manual entry if low.

**Tasks**
- [ ] `services/exa.py` — Exa API wrapper (`search()`, `searchPeople()`)
- [ ] `services/handle_resolution.py`:
  - Run 3 Exa queries in parallel per client
  - LLM scores each candidate (company match, city match, name match)
  - Returns `{ handle, confidence, evidence[] }`
- [ ] Wire to `POST /clients` — triggers resolution on new client creation
- [ ] `GET /clients/:id/resolution` — returns current resolution status + candidates
- [ ] `POST /clients/:id/resolution/confirm` — advisor confirms handle
- [ ] `POST /clients/:id/resolution/manual` — advisor sets handle directly
- [ ] `POST /clients/:id/resolution/skip` — skip social monitoring for this client
- [ ] Update `clients.social_intelligence[]` in Convex after resolution

**LLM prompt**: given candidate profile text + client known info → score confidence 0–10 + explain evidence

---

## Component 5 — LinkedIn Scanner (Exa)

**What**: Daily cron checks clients whose LinkedIn `next_check < now()`. Fetches their public LinkedIn page via Exa. LLM classifies life event signals.

**Tasks**
- [ ] `services/linkedin_scanner.py`:
  - `exa.search(query=f'site:{linkedin_url}', text=True, highlights=True)`
  - Pass page text to LLM signal detection prompt
  - Returns `{ signals[], no_signal }`
- [ ] Wire to `/workers/scan-linkedin`
- [ ] APScheduler calls `/workers/scan-linkedin` daily at 03:00 AM
- [ ] On signal found: update `social_intelligence[linkedin].data_found[]` + set `pending_batch=true`
- [ ] Update `last_checked` + `next_check = now + 24h` regardless of signal

---

## Component 6 — Instagram Scanner (Apify)

**What**: Daily cron checks clients with confirmed Instagram handle. Fetches latest 10 posts via Apify. LLM classifies signals from captions. Vision LLM for captionless image posts.

**Tasks**
- [ ] `services/apify.py` — Apify client wrapper (`run_actor()`, `get_dataset()`)
- [ ] `services/instagram_scanner.py`:
  - `apify.run_actor("apify/instagram-profile-scraper", { usernames: [handle], resultsLimit: 10 })`
  - For each post: LLM classifies caption text
  - For posts with no caption: pass image URL to vision LLM (GPT-4o vision / Gemini)
  - Returns `{ signals[], no_signal }`
- [ ] Wire to `/workers/scan-instagram`
- [ ] APScheduler calls daily at 03:30 AM
- [ ] Update `social_intelligence[instagram]` in Convex

---

## Component 7 — Legacy.com Scanner (Exa)

**What**: Daily cron searches Legacy.com obituaries for each client's known family members. Flags `family_death` signal if a match is found.

**Tasks**
- [ ] `services/legacy_scanner.py`:
  - For each client: build query `'"{family_member}" obituary "{city}"'`
  - `exa.search(query, includeDomains=["legacy.com"], text=True)`
  - LLM checks if any result matches a known family member name
  - Returns `{ signals[], no_signal }`
- [ ] Wire to `/workers/scan-legacy`
- [ ] APScheduler calls daily at 04:00 AM
- [ ] Update `social_intelligence[legacy]` in Convex

---

## Component 8 — Weekly Project Generator

**What**: Every Monday 6AM, collect all clients with `pending_batch=true`, score urgency, LLM generates project name + sales angle, writes a `projects` record, notifies advisor via OpenClaw.

**Tasks**
- [ ] `services/batch_generator.py`:
  - Query Convex: clients with any `pending_batch=true`
  - Collect all `data_found[]` signals per client
  - Score urgency per signal type
  - LLM generates `{ name, sales_angle, client_notes[] }`
  - Write `projects` record to Convex
  - Set `pending_batch=false` for all included clients
- [ ] Wire to `/workers/generate-batch`
- [ ] APScheduler calls Monday 06:00 AM
- [ ] After writing project: `POST /workers/notify-advisor` → OpenClaw sends WA message to advisor

---

## Component 9 — Advisor Intent Handler

**What**: Single endpoint `/advisor/message` that OpenClaw calls with every advisor message. Backend routes intent, queries DB, calls LLM, returns reply string.

**Intents to handle**

| Advisor says | Backend action |
|---|---|
| "Remind me about Raina tomorrow" | Query Raina's messages from Convex → LLM synthesizes context → schedule reminder → reply with summary |
| "What's up with Ahmad?" | Query Ahmad's messages + social signals → LLM summarizes → reply |
| "Who should I call this week?" | Query latest project → format client list → reply |
| "Ahmad's Instagram is @ahmadfariz92" | Parse handle → write to `social_intelligence[instagram].handle` |
| Anything else | LLM free-form reply using client context |

**Tasks**
- [ ] `routers/advisor.py` — `POST /advisor/message`
- [ ] `services/intent_router.py` — LLM classifies intent from message text
- [ ] `services/advisor_llm.py` — per-intent handlers that query DB + generate reply
- [ ] Return `{ reply: string }` — OpenClaw sends this verbatim back to advisor

---

## Component 10 — OpenClaw Wiring

**What**: OpenClaw is already running in the container, already connected to WhatsApp. Just needs one skill that forwards advisor messages to the backend and sends the reply back.

**Status**: ✅ Container running. ✅ WhatsApp connected. Needs: one skill added.

**Tasks**
- [ ] Write skill `imaginehack` in `/root/.openclaw/plugin-skills/imaginehack/`:
  - On any advisor message → extract text + any client name mentioned
  - `POST http://backend:8000/advisor/message { advisor_message, client_name }`
  - Receive `{ reply }` → send to advisor
- [ ] Add backend URL to OpenClaw env / skill config
- [ ] Test end-to-end: text OpenClaw → backend processes → reply comes back

**Skill file location**: `/root/.openclaw/plugin-skills/imaginehack/SKILL.md`

---

## Component 11 — Docker Compose

**What**: Wire all services together so everything starts with `docker-compose up`.

**Services**
```yaml
services:
  openclaw:       # already exists — OpenClaw + WhatsApp
  backend:        # Python FastAPI
  baileys:        # Node.js Baileys service (if not using OpenClaw hook)
```

**Tasks**
- [ ] Add `backend` service to `docker-compose.yml`
- [ ] Add `baileys` service (or skip if using OpenClaw hook)
- [ ] Add shared `.env` file mounting
- [ ] Ensure `backend` and `baileys` can reach each other by service name
- [ ] Add health checks

---

## Build Order Summary

```
1.  Convex schema                     ← everything depends on this
2.  Python backend skeleton           ← stub all endpoints
3.  Baileys service / OC hook         ← start capturing messages
4.  Handle resolution (Exa)          ← unlocks social scanning
5.  LinkedIn scanner                  ┐
6.  Instagram scanner                 ├ can be built in parallel
7.  Legacy.com scanner                ┘
8.  Weekly project generator          ← depends on scanners
9.  Advisor intent handler            ← depends on messages in DB
10. OpenClaw skill wiring             ← depends on backend being up
11. Docker compose                    ← wire it all together
```

---

## Current Status

| Component | Status |
|-----------|--------|
| OpenClaw container | ✅ Running |
| WhatsApp connected | ✅ Connected |
| Convex schema | ⬜ Not started |
| Python backend | ⬜ Not started |
| Baileys service | ⬜ Not started |
| Handle resolution | ⬜ Not started |
| LinkedIn scanner | ⬜ Not started |
| Instagram scanner | ⬜ Not started |
| Legacy scanner | ⬜ Not started |
| Weekly batch | ⬜ Not started |
| Advisor intent | ⬜ Not started |
| OpenClaw skill | ⬜ Not started |
