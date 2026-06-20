# ImagineHack — Implementation Plan

_Last updated: 2026-06-21. Schema further revamped: `social_intelligence[]` replaced by `recent_signals[]` (one entry per platform, replaced not appended) + `persona{}` (global lifestyle classification, overwritten each scan). See `docs/social-listening.md`._

---

## Status Legend
- ✅ Done
- 🔶 Partial / needs rework against new schema
- ⬜ Not started
- 👤 Owned by teammate (assume done)

---

## Component 1 — Convex DB

**Stack**: Convex (TypeScript schema + functions)
**Location**: `convex/`

### 1.1 Schema (`convex/schema.ts`) — ✅
- [x] `clients` table — demographic, contact, socials[], family/dependents[], existing_policies[], sales_opportunities[], social_intelligence[]
- [x] `relationship` union shared by dependents + beneficiaries
- [x] `policyType` union on existing_policies
- [x] `dependents[].age` optional
- [x] `projects` table — batch_sales_angle, clients[] with status enum + follow-up/meeting dates
- [x] `chat_history` table — unchanged (OpenClaw only)
- [x] Removed `signals` + `outreach_batches` tables
- [x] Indexes: `clients.by_number`, `clients.by_created_at`, `projects.by_created_at`, `chat_history.by_client_id`

### 1.2 Client functions (`convex/clients.ts`) — ✅
- [x] `getAll()` — query, newest first
- [x] `getById(id)` — query
- [x] `getByNumber(number)` — query via `by_number` index (used by Baileys filter)
- [x] `create({...})` — insert with empty arrays defaulted
- [x] `update({id, ...})` — patch core fields
- [x] `addSocial(id, type, value)` — upsert one social entry per type
- [x] `addDependent(id, relationship, first_name, last_name, age?)`
- [x] `addSalesOpportunity(id, description)` — append with created_at
- [x] `appendSocialIntelligence(id, platform, content)` — append-only fetch log

### 1.3 Project functions (`convex/projects.ts`) — ✅
- [x] `getAll()` — query, newest first
- [x] `getById(id)` — query
- [x] `getCurrent()` — latest project (the week's batch)
- [x] `create({batch_sales_angle, clients[]})`
- [x] `updateClientStatus(id, client_id, status, notes?, next_follow_up_scheduled?, next_meeting_scheduled?)`

### 1.4 Chat history functions (`convex/chatHistory.ts`) — ✅
- [x] `getByClient(client_id)` — query
- [x] `appendMessage(client_id, sender, message, timestamp)` — upsert into messages[]

### 1.5 Cleanup — ✅
- [x] `convex/signals.ts` emptied (`export {}`)
- [x] `convex/outreachBatches.ts` emptied (`export {}`)

### 1.6 Seed (`convex/seed.ts`) — 👤
- [ ] Rewrite to new 3-table schema (40 clients, social_intelligence raw entries, projects, chat_history) — **owned by teammate on separate branch**
- [ ] One client `number` set to a real phone for live WhatsApp demo — **teammate**

---

## Component 2 — Python Backend

**Stack**: Python, FastAPI, APScheduler, httpx
**Location**: `platform-api/backend/`

### 2.1 App skeleton — ✅ (verify still boots)
- [x] `main.py` — FastAPI app + lifespan starting/stopping scheduler
- [x] `config.py` — env var loading
- [x] `/health` endpoint

### 2.2 Convex HTTP wrapper (`services/convex.py`) — ✅
- [x] `get_client_by_number` → `clients:getByNumber`
- [x] Removed `messages:*` calls — chat history via `chatHistory:appendMessage` / `getByClient`
- [x] Removed `socialIntelligence:upsert` / `:get` — now `clients:appendSocialIntelligence` + `latest_social_intelligence()` helper reads from client doc
- [x] Removed `clients:listPendingBatch` / `clients:setBatchDone` — batch reads `social_intelligence[]` directly
- [x] `insert_client` → `clients:create`
- [x] `append_social_intelligence(client_id, platform, content)` → `clients:appendSocialIntelligence`
- [x] `add_social(client_id, type, value)` → `clients:addSocial`
- [x] `add_sales_opportunity(client_id, description)` → `clients:addSalesOpportunity`
- [x] `insert_project(data)` → `projects:create`
- [x] `update_project_client_status(...)` → `projects:updateClientStatus`
- [x] `list_projects()` / `get_current_project()` → `projects:getAll` / `projects:getCurrent`
- [x] Pure helpers over client doc: `client_name`, `social_value`, `latest_social_intelligence`

### 2.3 Clients router (`routers/clients.py`) — ✅
- [x] `ClientCreate` model → new schema (first_name/last_name/age/nationality/income_range/number/email/marital_status + optional arrays)
- [x] `POST /clients` — create, fetch doc, trigger handle resolution in background
- [x] `GET /clients` — list
- [x] `GET /clients/:id` — detail (social_intelligence[] already on doc)
- [x] `PATCH /clients/:id` — update core fields
- [x] `GET /clients/exists?number=` — boolean check via `getByNumber` (Baileys)
- [x] `POST /clients/:id/opportunities` — append sales opportunity
- [x] `GET /clients/:id/chat-history` — read chat_history (Component 10.1)

### 2.4 Messages router (`routers/messages.py`) — ✅
- [x] Decided: Baileys → `POST /internal/messages` → append to `chat_history` (inbound→sender "client", outbound→"advisor"); no `messages` table
- [x] `POST /internal/messages` — resolve client by number → `chatHistory:appendMessage`

### 2.5 Projects router (`routers/projects.py`) — ✅
- [x] `GET /projects` — list (newest first)
- [x] `GET /projects/:id` — detail
- [x] `GET /projects/current` — current week's batch
- [x] `POST /projects` — manual create ({batch_sales_angle, clients[]})
- [x] `PATCH /projects/:id/clients/:clientId` — update status / notes / follow-up + meeting dates
- [x] `POST /projects/:id/enrich` — chat-aware angle per client (Component 12)

### 2.6 Advisor router (`routers/advisor.py`) — ✅
- [x] `POST /advisor/message` — intent classify → route → reply (Component 9)
- [x] `POST /advisor/suggest-angle` — `{client_id}` → angle + reasoning (Component 10.1)

### 2.7 Workers router (`routers/workers.py`) — ✅ (no change needed; signatures still match)
- [x] `/workers/resolve-handles`, `/scan-linkedin`, `/scan-instagram`, `/scan-legacy`, `/generate-batch`
- [ ] `/workers/notify-advisor` — currently advisor notify is inline in `batch_generator._notify_advisor`

### 2.8 Cron (`cron.py`) — ✅
- [x] APScheduler: daily 03:00 scan, Monday 06:00 batch
- [x] Scan jobs call reworked scanner signatures (append to social_intelligence)

---

## Component 3 — Baileys Service

**Stack**: Node.js, `@whiskeysockets/baileys`, Express
**Location**: `platform-api/baileys/`

- [x] `src/index.js` — session init + `messages.upsert` handler + auto-reconnect
- [x] `src/filter.js` — `GET /clients/exists?number=` lookup
- [x] `src/poster.js` — `POST /internal/messages` to backend
- [ ] Reconcile `filter.js` duplicate (`checkIsClient` vs `isTrackedClient`) — keep one
- [ ] `GET /health` liveness endpoint — verify present
- [ ] `auth/` in `.gitignore` — verify
- [ ] Confirm phone-number normalization matches Convex `number` format (E.164 with `+`)
- [ ] Add `baileys` service to `docker-compose.yml` (Component 13)

---

## Component 4 — Handle Resolution (Exa)

**What**: When a client is added, resolve their Instagram handle + LinkedIn URL via Exa, confidence-score, store into `clients.socials[]`.
**Location**: `platform-api/backend/services/`

- [x] `services/exa.py` — Exa wrapper (`search`, `search_linkedin`, `search_instagram`)
- [x] `services/handle_resolution.py` — reworked output target:
  - [x] Exa search by client name (company/city dropped from new schema)
  - [x] LLM scores each candidate
  - [x] HIGH (≥6) → `clients:addSocial(type, value)` auto
  - [ ] MEDIUM (3–5) → store as pending candidate for advisor confirm (no storage yet — currently skipped)
  - [ ] LOW (<3) → flag for manual entry
- [x] Wire to `POST /clients` background task
- [ ] `GET /clients/:id/resolution` — status + candidates
- [ ] `POST /clients/:id/resolution/confirm` — `{type, value}` → addSocial
- [ ] `POST /clients/:id/resolution/manual` — `{type, value}` → addSocial
- [ ] `POST /clients/:id/resolution/skip` — mark platform skipped

---

## Component 5 — LinkedIn Scanner (Exa)

**What**: Daily cron fetches each client's LinkedIn page, hash-checks against last fetch, appends raw content to `social_intelligence[]` only when changed.
**Location**: `services/linkedin_scanner.py`

- [x] For each client with a `linkedin` social entry (via `convex.social_value`):
  - [x] `exa.fetch_linkedin_profile(value)`
  - [x] Compute `md5(raw.text)`; compare against md5 of latest `social_intelligence[]` linkedin entry
  - [x] If unchanged → skip (no write)
  - [x] If changed → `clients:appendSocialIntelligence(id, "linkedin", json_str(raw))`
- [x] If no linkedin handle → return (handle resolution fills it later)
- [x] Wire to `/workers/scan-linkedin`

---

## Component 6 — Instagram Scanner (Apify)

**Location**: `services/apify.py`, `services/instagram_scanner.py`

- [x] `services/apify.py` — Apify client wrapper
- [x] `services/instagram_scanner.py`:
  - [x] For each client with an `instagram` social entry:
    - [x] `apify.run_instagram_scraper(value)`
    - [x] Compute `md5(join captions)`; compare to latest IG `social_intelligence[]` entry
    - [x] If changed → `appendSocialIntelligence(id, "instagram", json_str(posts))`
    - [ ] Vision LLM path for captionless image posts (deferred — `classify_signals_vision` exists, not wired)
  - [x] If no IG handle → return
- [x] Wire to `/workers/scan-instagram`
- [ ] Respect Apify free-tier (5 crawls/mo) — for demo, manual trigger per client

---

## Component 7 — Legacy.com Scanner (Exa)

**Location**: `services/legacy_scanner.py`

- [x] For each client:
  - [x] Build query from `first_name + last_name` + dependent names
  - [x] `exa.search_legacy(...)` (include_domains=["legacy.com"])
  - [x] Hash-check vs latest `legacy` entry
  - [x] If changed → `appendSocialIntelligence(id, "legacy", json_str(raw))`
- [x] Wire to `/workers/scan-legacy`

---

## Component 8 — Weekly Batch Generator → `projects`

**What**: Monday 06:00 reads each client's latest `social_intelligence[]`, LLM detects + scores signals, clusters into one batch, writes a `projects` row, notifies advisor.
**Location**: `services/batch_generator.py`

- [x] Read all clients; cutoff = current project's `created_at` (so only new intelligence since last batch)
- [x] LLM signal detection per client via `llm.classify_signals` over each recent SI entry
- [ ] Explicit HIGH/MEDIUM urgency scoring — currently any detected signal qualifies (not yet tiered)
- [x] Collect clients with signals since last batch
- [x] LLM generates `batch_sales_angle` from aggregated signals
- [x] `projects:create({ batch_sales_angle, clients: [{client_id, notes, status:"to_follow_up"}] })`
- [x] `_notify_advisor` posts to `OPENCLAW_WEBHOOK_URL`
- [x] Wire to `/workers/generate-batch` + Monday cron

---

## Component 9 — Advisor Intent Handler

**What**: `POST /advisor/message` — OpenClaw forwards every advisor message; backend classifies intent, queries DB, calls LLM, returns reply string.
**Location**: `routers/advisor.py`, `services/llm.py`, `services/advisor_llm.py`

| Advisor says | Backend action |
|---|---|
| "Remind me about Raina tomorrow" | Query Raina chat_history → LLM extract follow-ups → schedule reminder → reply |
| "What's up with Ahmad?" | Query Ahmad chat_history + latest social_intelligence → LLM summarize → reply |
| "Who should I call this week?" | Return current `projects` clients + notes |
| "Ahmad's Instagram is @ahmadfariz92" | Parse handle → `clients:addSocial("instagram", ...)` |
| anything else | LLM freeform reply with client context |

- [x] `services/llm.py` — `classify_intent(text)`
- [x] `services/advisor_llm.py` — handlers: `client_summary`, `set_handle`, `weekly_batch`, `freeform`
  - [x] `set_handle` → uses `add_social`
  - [x] `client_summary` → reads chat_history via `get_chat_history`
  - [x] `weekly_batch` → triggers `generate_weekly_project`
- [x] `POST /advisor/message` returns `{ reply, intent }`

---

## Component 10 — OpenClaw → Platform API Connection

**What**: OpenClaw (local container, WhatsApp connected) gets a skill to (a) fetch a client's chat history, (b) request an AI approach angle, and reply to the advisor.
**Location**: backend endpoints + `/root/.openclaw/plugin-skills/imaginehack/`

### 10.1 Backend endpoints
- [x] `GET /clients/:id/chat-history` — return `chat_history` for a client
- [x] `POST /advisor/suggest-angle` — `{client_id}` → LLM reads chat_history + latest social_intelligence → returns `{ angle, reasoning }`

### 10.2 OpenClaw skill — ✅ (skill written; live E2E pending runtime)
- [x] Skill version-controlled at `openclaw/plugin-skills/imaginehack/SKILL.md`
- [x] Synced into container `/root/.openclaw/plugin-skills/imaginehack/` via Dockerfile stage + `entrypoint.sh` (volume-safe)
- [x] Forwards advisor message verbatim → `POST /advisor/message { message, advisor_id }` (corrected from stale `{advisor_message, client_name}`; backend extracts names itself)
- [x] Relays `reply` field back to advisor unchanged; documents optional `/advisor/suggest-angle`
- [x] `PLATFORM_API_URL` added to `.env` (default `http://backend:8000`)
- [x] `docs/components/openclaw.md` updated to match real backend contract
- [ ] **Live E2E** (text OpenClaw → backend → reply): blocked on backend service in docker-compose (Component 13) + real `OPENAI_API_KEY` + `CONVEX_DEPLOY_KEY`
  - Verify once up: `curl -s $PLATFORM_API_URL/advisor/message -H 'Content-Type: application/json' -d '{"message":"What'\''s up with <client>?","advisor_id":"default"}'`

---

## Component 11 — Exa/Apify Fetch Strategy (drives `social_intelligence`)

**What**: Define exactly what we fetch per client, per platform, and when — so `social_intelligence[]` fills with the raw material the batch generator reasons over.

### 11.1 Triggers
- [ ] On new client added → handle resolution + first scan
- [ ] Daily 03:00 cron → scan all clients with resolved handles
- [ ] Manual advisor trigger (on-demand refresh for one client)

### 11.2 What we fetch (per platform)
- [ ] **LinkedIn (Exa)**: public profile text + recent posts → job changes, promotions, layoffs, retirement
- [ ] **Instagram (Apify)**: latest 10 posts (captions + image URLs) → pregnancy, new_baby, marriage, new_home, divorce
- [ ] **Legacy.com (Exa)**: obituary search on client + dependent names → family_death
- [ ] (optional) **General news (Exa)**: `'"{name}" "{occupation}"'` → business events for HNW clients

### 11.3 Storage contract
- [ ] Each scan appends `{date_fetched, platform, content}` to `social_intelligence[]` (raw JSON string, never overwrite)
- [ ] Hash-check before write — skip identical content to save LLM credits
- [ ] Signal taxonomy frozen in code: `new_baby | pregnancy | marriage | new_job | promotion | layoff | retirement | new_home | family_death | divorce`

### 11.4 Signal detection LLM
- [ ] Input: `{client: {first_name, last_name, occupation}, platform, content}`
- [ ] Output: `{signals: [{signal_type, confidence, summary, evidence}], no_signal}`
- [ ] Vision LLM fires for captionless IG images

---

## Component 12 — OpenClaw × `projects`: Enriched Approach Angles

**What**: After the weekly batch writes a `projects` row, enrich each client's `notes` by pairing their detected signals with their `chat_history` — so each todo item carries a personalized, chat-aware approach angle.

- [x] `GET /projects/current` endpoint (Component 2.5) reused
- [x] `POST /projects/:id/enrich` — for each client in the project:
  - [x] Fetch chat_history + latest social_intelligence
  - [x] LLM generates a personalized angle that references prior conversation + the new life event
  - [x] Patch `projects.clients[].notes` with the enriched angle
- [ ] Wire `enrich` into `batch_generator.py` (run right after `projects:create`)
- [ ] OR on-demand: OpenClaw calls `enrich` when advisor asks "who should I reach out to this week?"
- [ ] OpenClaw skill can `GET /projects/current` to read the enriched batch
- [ ] E2E test: signal detected → batch generated → enriched notes reference chat history

---

## Component 13 — Docker Compose

**Location**: `docker-compose.yml`

- [x] `openclaw` service (exists)
- [ ] Add `backend` (Python FastAPI) service — build `platform-api/backend`, expose 8000
- [ ] Add `baileys` (Node.js) service — build `platform-api/baileys`, mount `auth/` volume
- [ ] Shared `.env` mount across services
- [ ] Service-name networking: `backend:8000`, `baileys` → `backend`
- [ ] Health checks for backend + baileys

---

## Critical Path / Next Steps (in order)

1. ✅ **Rework `services/convex.py`** (2.2) — done, matches new Convex API.
2. ✅ **Update `routers/clients.py` + `ClientCreate` model** (2.3) to new client shape.
3. ✅ **Rework scanners** (5/6/7) — append raw content to `social_intelligence[]`.
4. ✅ **Rework `batch_generator.py`** (8) — reads `social_intelligence[]`, writes `projects`.
5. ✅ **Rework `advisor_llm.py`** (9) — `set_handle`→addSocial, `client_summary`→chat_history.
6. ✅ **OpenClaw connection** (10) — endpoints + `SKILL.md` done; live WhatsApp E2E pending Component 13 + keys.
7. **Define + verify fetch strategy** (11) — code path done; verify against live Exa/Apify.
8. **Projects enrichment** (12) — endpoint ✅; auto-wire into `batch_generator` still ⬜.
9. **Docker compose** (13) — wire backend + baileys. ⬜
10. **Baileys cleanup** (3) — dedupe `filter.js`, `/health`, normalization. ⬜
11. **Verify backend boots** — install deps + `uvicorn main:app`; needs live Convex deploy key.

---

## Build Order Summary

```
1.  Convex schema + functions          ✅
2.  Convex seed (new schema)           👤 teammate, separate branch
3.  Backend convex.py rework           ✅
4.  Backend routers (clients/projects) ✅
5.  Baileys service                    ✅ (docker + dedupe pending)
6.  Handle resolution → socials[]      ✅ (HIGH auto; MED/LOW deferred)
7.  Scanners → recent_signals[]        ✅ (schema upgraded from social_intelligence[])
8.  Batch generator → projects         ✅
9.  Advisor intent handler             ✅
10. OpenClaw connection (chat+angle)   ✅ (endpoints + SKILL.md; live E2E pending keys)
11. Exa/Apify fetch strategy           ✅ (verify live)
12. Projects enrichment                🔶 (endpoint ✅, auto-wire ⬜)
13. Docker compose complete            🔶 (backend ✅, baileys ⬜)
14. OpenClaw angle enrichment          ✅ (SKILL.md updated; E2E pending)
15. Persona classifier                 ✅ (gpt-4o-mini, runs after each scan)
16. Live E2E                           ⬜ (blocked on keys + baileys)
```

---

## Next Todo List
_Derived from `docs/openclaw.md`, `docs/platform-api.md`, `docs/social-listening.md`. In rough priority order._

---

### A — Unblock the Runtime (nothing works without these)

- [ ] **A1** Add `CONVEX_DEPLOY_KEY` to root `.env` — get from Convex dashboard → Settings → Deploy keys. Without this, backend cannot read or write Convex.
- [ ] **A2** Add `OPENAI_API_KEY` to root `.env`. Without this, all LLM calls (advisor chat, persona classification, batch generation, angle suggestion) will fail at call time.
- [ ] **A3** Restart backend after setting keys: `docker compose restart backend`. Smoke-test: `curl -s http://localhost:8001/advisor/message -H 'Content-Type: application/json' -d '{"message":"hello","advisor_id":"default"}'`

---

### B — Convex Schema / Functions (reflect actual schema in plan)

The plan still documents `social_intelligence[]` and `appendSocialIntelligence`. These have been replaced. Update tracking:

- [x] **B1** `convex/schema.ts` — `recent_signals[]` (one per platform, replaced not appended) + `persona{}` (overwritten each scan) + `is_seed: v.optional(v.boolean())`
- [x] **B2** `convex/clients.ts` — `setRecentSignals(id, platform, content)` replaces `appendSocialIntelligence`; `updatePersona(id, tags, summary)` added
- [x] **B3** `convex/dev.ts` — `clearSeed` internalMutation (targets `is_seed === true` rows only)
- [ ] **B4** Seed (`convex/seed.ts`) — teammate to rewrite for new schema: use `is_seed: true` on all inserts, `recent_signals: []`, `persona: undefined`, no `social_intelligence` field — **👤 teammate**

---

### C — Social Listening Pipeline (docs/social-listening.md)

- [x] **C1** LinkedIn scanner uses `setRecentSignals(id, "linkedin", json)` — replaces per scan, no append
- [x] **C2** Instagram scanner uses `setRecentSignals(id, "instagram", json)`, `results_limit=3`
- [x] **C3** Legacy scanner uses `setRecentSignals(id, "legacy", json)`
- [x] **C4** All three scanners call `_refresh_persona()` after each write
- [x] **C5** `classify_persona` in `llm.py` uses `CLASSIFIER_MODEL` (`gpt-4o-mini`) — separate from main `LLM_MODEL`
- [x] **C6** `CLASSIFIER_MODEL=gpt-4o-mini` added to `config.py`
- [ ] **C7** Verify live scan end-to-end: run `POST /workers/scan-linkedin` on a client with a known LinkedIn URL, confirm `recent_signals[linkedin]` is written and `persona` is updated in Convex. Requires A1 + A2.
- [ ] **C8** Verify `classify_persona` tags are from the valid set (`family-oriented`, `frequent-traveler`, etc.) — add validation/filtering if LLM returns out-of-set tags (currently filtered in `llm.py` but worth confirming with a live run)
- [ ] **C9** Handle case where `recent_signals` content is too large for LLM context — truncate `content` string before passing to `classify_persona` (LinkedIn profile text can be very long)

---

### D — Platform API (docs/platform-api.md)

- [x] **D1** Backend Dockerfile created (`platform-api/backend/Dockerfile`)
- [x] **D2** Backend added to `docker-compose.yml` as `backend` service, port 8001 on host
- [x] **D3** `config.py` — `CONVEX_DEPLOY_KEY` optional default `""`, `OPENAI_API_KEY` lazy (fails at call time not import)
- [x] **D4** `llm.py` — OpenAI client is lazy (initialised on first call)
- [ ] **D5** Fix `/internal/messages` docstring — currently says "called by OpenClaw's messageReceived hook" but per spec it's called by **Baileys**. Update `platform-api.md` and the router comment.
- [ ] **D6** `POST /projects/{id}/enrich` — auto-wire into `batch_generator.py` so it runs immediately after `projects:create`. Currently only callable manually. See Component 12.
- [ ] **D7** Handle resolution: MEDIUM confidence (score 3–5) candidates — currently silently dropped. Store as a pending candidate and expose via `GET /clients/{id}/resolution` so advisor can confirm. Low priority for demo.
- [ ] **D8** Add `baileys` service to `docker-compose.yml` (Component 13). Include `auth/` volume for session persistence. Health check on `/health`.
- [ ] **D9** Baileys `filter.js` — reconcile `checkIsClient` vs `isTrackedClient` duplicate.
- [ ] **D10** Verify Baileys phone-number normalisation matches Convex `number` format (E.164, no `+`? confirm).

---

### E — OpenClaw (docs/openclaw.md)

- [x] **E1** Skill deployed to container — `SKILL.md` synced via Dockerfile + entrypoint.sh
- [x] **E2** Backend reachable from openclaw: `docker exec imaginehack-openclaw curl -s http://backend:8000/health` → `{"ok":true}`
- [x] **E3** Pre-classification gate documented and in SKILL.md — strict: only named destinations, concrete hobbies, recent milestones pass
- [x] **E4** Web search enrichment documented in SKILL.md — good/bad search examples, output format
- [ ] **E5** **Live E2E relay test** — text advisor WhatsApp number: "What's up with [client name]?" → OpenClaw → `/advisor/message` → reply arrives on WhatsApp. Requires A1 + A2 + seed data.
- [ ] **E6** **Live angle enrichment test** — text "how should I approach [client with travel signal]?" → OpenClaw runs gate, searches Brave/Exa, returns conversation starter. Confirm gate correctly blocks generic persona-only clients.
- [ ] **E7** **Feature 3 (send messages to clients)** — wire up outbound WhatsApp sending. When advisor says "send Ahmad: [text]", OpenClaw composes a WhatsApp message to Ahmad's number. Needs: resolve client name → number via `GET /clients`, then send via WhatsApp. Currently undocumented in SKILL.md — add workflow.
- [ ] **E8** **Weekly batch notification E2E** — set `OPENCLAW_WEBHOOK_URL` in `.env` to the OpenClaw gateway webhook for the advisor's account. Trigger `POST /workers/generate-batch` manually, confirm advisor receives WhatsApp notification.
- [ ] **E9** Add advisor's number to WhatsApp allowlist if not already there. Current allowlist: `60122468905`, `60173024851`.

---

### F — Integration / E2E

- [ ] **F1** Full pipeline smoke test (requires A1 + A2 + seed + Baileys):
  1. Seed clients with `is_seed: true`
  2. Run `POST /workers/scan-instagram` on a client with IG handle
  3. Confirm `recent_signals[instagram]` written, `persona` updated
  4. Run `POST /workers/generate-batch`
  5. Confirm `projects` record created with correct clients + notes
  6. Text OpenClaw: "Who should I reach out to this week?" → reply names the batch clients
  7. Text OpenClaw: "How should I approach [client]?" → enriched conversation starter returned
- [ ] **F2** Verify `cron.py` jobs fire correctly in Docker (APScheduler timezone — confirm server timezone is UTC or MYT as expected for 3am/6am schedule)
- [ ] **F3** Run `npx convex run dev:clearSeed` after each demo to clean seed data without touching real clients
