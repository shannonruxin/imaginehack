# ImagineHack — Implementation Plan

_Last updated: 2026-06-20. Reflects merged state of menna/baileys + convex-db branches._

---

## Status Legend
- ✅ Done
- ⚠️ Partial / needs fix
- ⬜ Not started

---

## Component 1 — Convex DB

**Stack**: Convex (TypeScript schema + functions)

| Task | Status |
|---|---|
| Schema defined (`clients`, `chat_history`, `signals`, `outreach_batches`, `projects`) | ✅ |
| `clients.ts` — getAll, getById, create, update, updatePlatformHandle, updateScanSchedule | ✅ |
| `chatHistory.ts` — getByClient, appendMessage | ✅ |
| `outreachBatches.ts` — create, getCurrent, getByWeek, markOutreached | ✅ |
| `signals.ts` — create, listByClient | ✅ |
| `projects.ts` — list, get, create, updateClientStatus | ✅ |
| `seed.ts` — sample clients seeded | ✅ |
| `clients:getByNumber` query — **missing**, backend calls it | ⚠️ |
| `clients:listPendingBatch` + `clients:setBatchDone` — **missing** | ⚠️ |
| `messages:insert` + `messages:listByClient` — **missing** (schema uses `chat_history`, not `messages`) | ⚠️ |
| `socialIntelligence:upsert` + `socialIntelligence:get` — **missing** (no `social_intelligence` table, signals table covers this now) | ⚠️ |

**Immediate fix needed**: Add missing query/mutation functions OR update `services/convex.py` to call the correct function names that match what's in the Convex repo.

---

## Component 2 — Python Backend (platform-api/backend)

**Stack**: Python, FastAPI, APScheduler, httpx

| Task | Status |
|---|---|
| FastAPI app skeleton + lifespan | ✅ |
| `config.py` — env vars | ✅ |
| `services/convex.py` — HTTP wrapper | ✅ |
| `routers/clients.py` — CRUD + `GET /clients/exists?number=` | ✅ |
| `routers/messages.py` — `POST /internal/messages` | ✅ |
| `routers/projects.py` | ✅ |
| `routers/advisor.py` — intent router | ✅ |
| `routers/workers.py` — `/workers/*` stubs | ✅ |
| `cron.py` — APScheduler wired (3AM daily, 6AM Monday) | ✅ |
| `services/exa.py` — Exa API wrapper | ✅ |
| `services/handle_resolution.py` — resolve + confidence score | ✅ |
| `services/advisor_llm.py` — per-intent handlers | ✅ |
| `services/batch_generator.py` — weekly batch + notify | ✅ |
| `services/apify.py` — Apify wrapper | ✅ (verify impl) |
| `services/linkedin_scanner.py` | ✅ (verify impl) |
| `services/instagram_scanner.py` | ✅ (verify impl) |
| `services/legacy_scanner.py` | ✅ (verify impl) |
| `services/llm.py` — classify_intent + helpers | ✅ (verify impl) |
| Fix convex.py function name mismatches (see Component 1 ⚠️) | ⬜ |

---

## Component 3 — Baileys Service (platform-api/baileys)

**Stack**: Node.js, `@whiskeysockets/baileys`, Express

| Task | Status |
|---|---|
| `src/index.js` — session init + event handlers | ✅ |
| `src/filter.js` — `GET /clients/exists?number=` lookup | ✅ |
| `src/poster.js` — `POST /internal/messages` to backend | ✅ |
| `messages.upsert` handler — filter → post logic | ✅ |
| Auto-reconnect on disconnect | ✅ |
| `GET /health` liveness endpoint | ⚠️ (verify) |
| `auth/` added to `.gitignore` | ⚠️ (verify) |
| **Seed with a real phone number** for demo testing | ⬜ |
| Add `baileys` service to `docker-compose.yml` | ⬜ |

---

## Component 4 — Handle Resolution (Exa)

| Task | Status |
|---|---|
| `services/exa.py` wrapper | ✅ |
| `services/handle_resolution.py` — parallel queries + LLM scoring | ✅ |
| Wired to `POST /clients` via BackgroundTasks | ✅ |
| `GET /clients/:id/resolution` — resolution status endpoint | ⬜ |
| `POST /clients/:id/resolution/confirm` | ⬜ |
| `POST /clients/:id/resolution/manual` | ⬜ |
| `POST /clients/:id/resolution/skip` | ⬜ |

---

## Component 5–7 — Social Scanners (Exa / Apify)

| Task | Status |
|---|---|
| LinkedIn scanner — Exa fetch + LLM signal detection | ✅ (verify) |
| Instagram scanner — Apify scrape + LLM classify captions | ✅ (verify) |
| Legacy.com scanner — Exa obituary search + LLM match | ✅ (verify) |
| Wired to `/workers/scan-*` endpoints | ✅ (verify) |
| APScheduler calling all three at 3AM | ✅ |

---

## Component 8 — Weekly Batch Generator

| Task | Status |
|---|---|
| `services/batch_generator.py` — collect signals, LLM angle, write project | ✅ |
| Wired to `/workers/generate-batch` | ✅ |
| APScheduler Monday 6AM | ✅ |
| Notify advisor via OPENCLAW_WEBHOOK_URL after batch | ✅ |

---

## Component 9 — Advisor Intent Handler

| Task | Status |
|---|---|
| `routers/advisor.py` — `POST /advisor/message` | ✅ |
| `services/llm.py` — `classify_intent()` | ✅ (verify) |
| `services/advisor_llm.py` — client_summary, set_handle, weekly_batch, freeform | ✅ |

---

## Component 10 — OpenClaw → Platform API Connection

**What**: OpenClaw (running in local container) needs to call platform-api to:
1. Fetch a client's `chat_history` from Convex (via platform-api endpoint)
2. Get an AI-generated suggested angle for approaching that client
3. Present the suggestion back to the advisor in WhatsApp

**Status**: OpenClaw container running ✅ — skill **not written yet** ⬜

| Task | Status |
|---|---|
| Add `GET /clients/:id/chat-history` endpoint to platform-api | ⬜ |
| Add `POST /advisor/suggest-angle` endpoint — takes client_id + chat history → LLM returns approach angle | ⬜ |
| Write OpenClaw skill `imaginehack` in `/root/.openclaw/plugin-skills/imaginehack/` | ⬜ |
| Skill: on advisor message → extract client name → fetch chat history → POST suggest-angle → reply | ⬜ |
| Add `PLATFORM_API_URL` to OpenClaw env | ⬜ |
| Test end-to-end: text OpenClaw → backend processes → angle reply comes back | ⬜ |

---

## Component 11 — Exa/Apify Fetch Strategy for Clients (outreach_batches)

**What**: Define *what* we're fetching from Exa and Apify per client, and *when* — so signals land in `outreach_batches` and drive weekly outreach.

| Task | Status |
|---|---|
| Define trigger events: new client added, scheduled scan (3AM), manual trigger | ⬜ |
| **Exa fetches per client**: LinkedIn page (job changes, promotions), Legacy.com (family obituaries), general news (`"{name}" "{company}"`) | ⬜ |
| **Apify fetches per client**: Instagram profile (latest 10 posts, captions, image vision for captionless) | ⬜ |
| Define signal taxonomy: `job_change`, `promotion`, `new_baby`, `family_death`, `travel`, `purchase`, `anniversary` | ⬜ |
| Ensure scanner output writes to `signals` table with correct `client_id`, `platform`, `signal_type`, `batched=false` | ⬜ |
| Batch job reads unbatched signals → generates `outreach_batches` record with `batch_sales_angle` per cluster | ⬜ |
| Verify `outreach_batches` schema covers the enriched output (currently: `week_of`, `batch_sales_angle`, `clients[{client_id, notes, outreached}]`) | ⬜ |

---

## Component 12 — OpenClaw × outreach_batches: Enriched Approach Angles

**What**: When the weekly batch runs (or on-demand), OpenClaw gets the latest `outreach_batches` record, pairs each client's signals with their `chat_history`, and generates a personalized approach angle per client — enriching the batch.

| Task | Status |
|---|---|
| Add `GET /outreach-batches/current` endpoint to platform-api | ⬜ |
| Add `POST /outreach-batches/:id/enrich` — for each client in batch: fetch chat_history + signals → LLM generates personalized angle → patch `clients[].notes` | ⬜ |
| Wire enrich call into `batch_generator.py` (run after batch is created) | ⬜ |
| Or: OpenClaw skill calls `enrich` on-demand when advisor asks "who should I reach out to this week?" | ⬜ |
| Add `GET /outreach-batches/current` to OpenClaw skill so advisor can query the current batch | ⬜ |
| Test: signal detected → batch generated → enriched notes include chat-history-aware angle | ⬜ |

---

## Component 13 — Docker Compose

| Task | Status |
|---|---|
| `openclaw` service | ✅ |
| Add `backend` (Python FastAPI) service | ⬜ |
| Add `baileys` (Node.js) service | ⬜ |
| Shared `.env` mount | ⬜ |
| Health checks for backend + baileys | ⬜ |
| Ensure services reach each other by name (`backend:8000`, `baileys:3000`) | ⬜ |

---

## Immediate Next Steps (in order)

### 1. Seed — real phone number for demo
Update `convex/seed.ts`: change one client's `number` to a real phone number so incoming WhatsApp messages hit the filter and post to the DB. Use this to demo the full loop live.

### 2. Fix Convex function name mismatches
`services/convex.py` calls `clients:getByNumber`, `messages:insert`, `messages:listByClient`, `clients:listPendingBatch`, `clients:setBatchDone`, `socialIntelligence:*` — none of which exist in the Convex repo. Either add them to Convex or fix the Python calls to use existing functions.

### 3. OpenClaw → platform-api (Component 10)
Add two endpoints + write the skill so OpenClaw can fetch chat history and get approach suggestions.

### 4. Define + verify Exa/Apify fetch strategy (Component 11)
Confirm what the scanners actually fetch and that it flows into `signals` → `outreach_batches` correctly.

### 5. OpenClaw × outreach_batches enrichment (Component 12)
Add enrich endpoint and wire it so the batch has personalized angles per client based on chat history.

### 6. Docker Compose (Component 13)
Add backend + baileys services so everything starts with one command.

---

## Build Order Summary

```
1.  Convex schema + functions          ✅ (fix mismatches ⚠️)
2.  Python backend skeleton            ✅
3.  Baileys service                    ✅ (docker-compose ⬜)
4.  Handle resolution (Exa)           ✅
5.  Social scanners                    ✅ (verify)
6.  Weekly batch generator             ✅
7.  Advisor intent handler             ✅
8.  Seed with real phone number        ⬜  ← next
9.  OpenClaw → platform-api           ⬜  ← next
10. Exa/Apify fetch strategy          ⬜  ← next
11. outreach_batches enrichment       ⬜  ← next
12. Docker Compose complete           ⬜  ← next
```
