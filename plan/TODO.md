# ImagineHack — To Do List (based on SPEC.md)

Status key: ✅ done · 🔧 partial / needs fix · ⬜ not started

---

## 1. Convex DB

- ✅ Schema — `clients`, `projects`, `chat_history` (3 tables, matches SPEC)
- 🔧 Remove stale `signals.ts` and `outreachBatches.ts` — these reference tables that no longer exist in the schema and will cause TypeScript errors
- ✅ `clients.ts` — all mutations and queries
- ✅ `projects.ts` — create, getAll, getById, updateClientStatus
- ✅ `chatHistory.ts` — appendMessage, getByClient
- ✅ `dev.ts` — clearSeed, clearAll
- ✅ `seed.ts` — 10 clients, 1 project, 50 chat messages
- ✅ Deployed to Convex cloud, `CONVEX_URL` set in `.env.local`
- ⬜ `CONVEX_DEPLOY_KEY` — needed for Python backend HTTP calls (check if set in platform-api `.env`)

---

## 2. Python Backend

### Setup
- ✅ FastAPI project with APScheduler (`main.py`, `cron.py`)
- ✅ `config.py` — env var loading
- ✅ `requirements.txt`
- ✅ Convex HTTP client (`services/convex.py`)

### Routers
- ✅ `/clients` — list, get, create, update (`routers/clients.py`)
- ✅ `/advisor/message` — intent routing (`routers/advisor.py`)
- ✅ `/workers` — scan-linkedin, scan-instagram, scan-legacy, generate-batch, resolve-handles (`routers/workers.py`)
- ✅ `/projects` — list, get, update client status (`routers/projects.py`)
- ✅ `/internal/messages` — Baileys writes incoming WA messages (`routers/messages.py`)
- ⬜ `GET /clients/exists?number=` — used by Baileys to check if a number is tracked before forwarding messages
- ⬜ `POST /clients/:id/opportunities` — append a sales opportunity
- ⬜ Handle resolution endpoints: `GET /clients/:id/resolution`, `POST /clients/:id/resolution/confirm`, `/skip`, `/manual`

### Services
- ✅ `exa.py` — LinkedIn + Legacy.com search
- ✅ `apify.py` — Instagram scraper
- ✅ `llm.py` — signal classification, persona classification, intent classification, approach angle
- ✅ `advisor_llm.py` — client_summary, set_handle, weekly_batch, freeform intent handlers
- ✅ `linkedin_scanner.py` — Exa fetch → set_recent_signals → classify_persona
- ✅ `instagram_scanner.py` — Apify fetch → set_recent_signals → classify_persona
- ✅ `legacy_scanner.py` — Exa search by name + family members → set_recent_signals → classify_persona
- ✅ `handle_resolution.py` — Exa search + LLM scoring → write to `clients.socials[]`
- 🔧 `batch_generator.py` — reads `recent_signals` per client, LLM signal detection, writes project. Needs end-to-end test to confirm it creates a valid `projects` record (old version wrote to `outreach_batches`)

### Cron
- ✅ Daily 03:00 AM → `scan_due_clients()` (LinkedIn + Instagram + Legacy in parallel)
- ⬜ Monday 06:00 AM → `generate_weekly_project()` — check if this is wired into `cron.py`
- ⬜ `resolve-handles` worker — confirm it runs for newly added clients (triggered on `POST /clients` or via cron)

---

## 3. Baileys Service (WhatsApp bridge)

- ✅ `src/index.js` — WA session, message listener
- ✅ `src/filter.js` — filter to tracked client numbers only
- ✅ `src/poster.js` — POST to backend `/internal/messages`
- ⬜ Calls `GET /clients/exists?number=` before forwarding — needs that endpoint to exist
- ⬜ QR scan + session persistence tested end-to-end
- ⬜ Auto-reconnect on pod restart confirmed working

---

## 4. OpenClaw (WhatsApp advisor interface)

- ✅ Plugin skill scaffolded (`plugin-skills/imaginehack/SKILL.md`)
- ⬜ Skill: advisor sends message → `POST /advisor/message` → reply sent back
- ⬜ Skill: `weekly_briefing` — surface current week's project clients + notes
- ⬜ Skill: `confirm_handle` — present MEDIUM-confidence handle candidate to advisor → confirm/reject → write to `clients.socials[]`
- ⬜ Notify advisor on Monday when a new project is generated (POST from batch_generator → OpenClaw webhook)
- ⬜ `OPENCLAW_WEBHOOK_URL` env var wired

---

## 5. End-to-End Wiring

- ⬜ All env vars populated across both services:
  - `EXA_API_KEY`
  - `APIFY_API_TOKEN`
  - `CONVEX_URL` + `CONVEX_DEPLOY_KEY`
  - `OPENAI_API_KEY` + `LLM_MODEL`
  - `BAILEYS_SERVICE_URL`
  - `OPENCLAW_WEBHOOK_URL`
- ⬜ Add client → handle resolution runs → social handles stored
- ⬜ Daily scan fires → `recent_signals` updated → `persona` refreshed
- ⬜ Monday batch fires → project created → advisor notified via OpenClaw
- ⬜ Advisor WA message → intent resolved → correct reply returned
- ⬜ Baileys receives client message → stored in `chat_history` via `/internal/messages`
