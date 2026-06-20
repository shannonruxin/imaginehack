# Platform API — Implementation Plan

The platform-api owns all backend intelligence. OpenClaw never calls Exa, Apify, or any LLM for scanning — it only reads DB flags and handles advisor conversation.

---

## Directory Structure

```
platform-api/
  backend/                  Python FastAPI backend
    main.py                 App entry point
    config.py               Env var settings
    cron.py                 APScheduler job definitions
    routers/
      clients.py            /clients CRUD + /clients/exists
      messages.py           /internal/messages (Baileys writes)
      projects.py           /projects CRUD
      advisor.py            /advisor/message (OpenClaw calls)
      workers.py            /workers/* internal cron endpoints
    services/
      convex.py             Convex HTTP API wrapper
      exa.py                ✅ Done — search_linkedin, search_instagram, search_legacy, fetch_linkedin_profile
      apify.py              Apify actor runner for Instagram
      llm.py                LLM calls — signal detection, handle scoring, synthesis
      handle_resolution.py  Exa search → LLM score → store handle
      linkedin_scanner.py   Fetch → hash check → LLM if changed
      instagram_scanner.py  Fetch → hash check → LLM if changed
      legacy_scanner.py     Fetch → hash check → LLM if changed
      batch_generator.py    Aggregate signals → write project
      intent_router.py      Classify advisor message intent
      advisor_llm.py        Per-intent response handlers
    requirements.txt        ✅ Done
    .env.example            ✅ Done

  baileys/                  Node.js WhatsApp message streamer
    src/
      index.js              Session init + event handlers
      filter.js             Client lookup + discard logic
      poster.js             POST to backend
    auth/                   WA session (gitignored)
    package.json
    .env
```

---

## Component A — Convex Service ✅

**File**: `backend/services/convex.py`

Thin HTTP wrapper around Convex's HTTP API. All DB reads/writes go through here.

**Tasks**
- [x] `query(fn, args)` — call a Convex query function
- [x] `mutation(fn, args)` — call a Convex mutation function
- [x] Implement per-table helpers:
  - `get_client_by_number(number)`
  - `get_client_by_id(id)`
  - `list_clients()`
  - `insert_message(data)`
  - `upsert_social_intelligence(client_id, platform, data)`
  - `get_messages_by_client(client_id, limit)`
  - `insert_project(data)`
  - `update_project_client_status(project_id, client_id, status)`

---

## Component B — Exa Service ✅

**File**: `backend/services/exa.py` — already written

Functions available:
- `search(query, num_results, text, include_domains)` — base search
- `search_linkedin(name, company, city)` — handle resolution
- `search_instagram(name, company, city)` — handle resolution
- `search_legacy(name, city, family_members)` — obituary search
- `fetch_linkedin_profile(linkedin_url)` — daily profile fetch

---

## Component C — Apify Service ✅

**File**: `backend/services/apify.py`

**Tasks**
- [x] Install `apify-client` (already in requirements.txt)
- [x] `run_instagram_scraper(handle, results_limit=10)` — runs actor, waits, returns posts
- [x] Each post returned as `{ caption, timestamp, url, display_url, likes_count }`

---

## Component D — LLM Service ✅

**File**: `backend/services/llm.py`

Central place for all LLM calls. Uses OpenAI SDK pointed at ILMU or OpenAI.

**Tasks**
- [x] `classify_signals(client, platform, content)` → `{ signals[], no_signal }` — main signal detector
- [x] `classify_signals_vision(client, image_url)` → `{ signals[], no_signal }` — for captionless IG images
- [x] `score_handle_candidate(candidate_text, client)` → `int (0–10)` — handle resolution scoring
- [x] `synthesize_client_context(client, messages)` → `str` — advisor asks "what's up with X"
- [x] `generate_batch_angle(clients_and_signals)` → `{ name, sales_angle, client_notes[] }` — weekly project
- [x] `classify_intent(advisor_message)` → `"client_summary" | "reminder" | "weekly_batch" | "set_handle" | "freeform"`

---

## Component E — Handle Resolution ✅

**File**: `backend/services/handle_resolution.py`

**Tasks**
- [x] `resolve_handles(client)` — runs Exa searches in parallel, scores candidates, stores result
- [x] Confidence scoring:
  - Run `search_linkedin` + `search_instagram` in parallel
  - LLM scores each candidate via `score_handle_candidate`
  - HIGH (≥ 6) → auto-store in `social_intelligence`, set confidence = "auto"
  - MEDIUM (3–5) → store as "pending", flag on dashboard
  - LOW (< 3) → leave null, prompt advisor to enter manually
- [x] Wire to `POST /clients` — triggers on new client creation

---

## Component F — Scanners (hash-based change detection)

All three scanners follow the same pattern:
1. Fetch content from Exa or Apify
2. Hash the content
3. Compare to stored `content_hash`
4. If same → update timestamps only, skip LLM
5. If changed → run LLM, update signals + hash

### LinkedIn Scanner
**File**: `backend/services/linkedin_scanner.py`

- [x] `scan_linkedin(client)`:
  - `fetch_linkedin_profile(client.linkedin_url)` → raw text
  - `md5(raw_text)` vs `social_intelligence[linkedin].content_hash`
  - If changed: `classify_signals(client, "linkedin", raw_text)`
  - Update `social_intelligence[linkedin]` in Convex

### Instagram Scanner
**File**: `backend/services/instagram_scanner.py`

- [x] `scan_instagram(client)`:
  - `run_instagram_scraper(client.instagram_handle)`
  - `md5(joined captions)` vs stored hash
  - If changed: `classify_signals` on captions + `classify_signals_vision` for captionless posts
  - Update `social_intelligence[instagram]` in Convex

### Legacy Scanner
**File**: `backend/services/legacy_scanner.py`

- [x] `scan_legacy(client)`:
  - `search_legacy(client.name, client.city, client.known_family_members)`
  - `md5(joined result texts)` vs stored hash
  - If changed: `classify_signals(client, "legacy", results)`
  - Update `social_intelligence[legacy]` in Convex

---

## Component G — Batch Generator ✅

**File**: `backend/services/batch_generator.py`

**Tasks**
- [x] `generate_weekly_project()`:
  - Query all clients with `pending_batch = true`
  - Collect signals per client, score urgency
  - `generate_batch_angle(clients_and_signals)` → project name + sales_angle + per-client notes
  - Write `projects` record to Convex
  - Set `pending_batch = false` for all included clients
  - Call `POST /workers/notify-advisor` → sends WA message to advisor via OpenClaw

---

## Component H — Routers

### `routers/clients.py`
- [ ] `POST /clients` — create + trigger handle resolution
- [ ] `GET /clients` — list
- [ ] `GET /clients/:id` — detail + signal history
- [ ] `PATCH /clients/:id` — update
- [ ] `GET /clients/exists?number=` — lightweight lookup for Baileys

### `routers/messages.py`
- [ ] `POST /internal/messages` — Baileys writes here; resolves client_id from number, inserts to Convex

### `routers/projects.py`
- [ ] `GET /projects`
- [ ] `POST /projects`
- [ ] `GET /projects/:id`
- [ ] `PATCH /projects/:id/clients/:client_id`

### `routers/advisor.py`
- [ ] `POST /advisor/message`:
  - Classify intent via `classify_intent`
  - Route to appropriate handler in `advisor_llm.py`
  - Return `{ reply: string }`

### `routers/workers.py`
- [ ] `POST /workers/scan-linkedin`
- [ ] `POST /workers/scan-instagram`
- [ ] `POST /workers/scan-legacy`
- [ ] `POST /workers/resolve-handles`
- [ ] `POST /workers/generate-batch`
- [ ] `POST /workers/notify-advisor` — POST to OpenClaw webhook

---

## Component I — Cron

**File**: `backend/cron.py`

```python
scheduler.add_job(scan_due_clients,        'cron', hour=3,  minute=0)
scheduler.add_job(generate_weekly_project, 'cron', day_of_week='mon', hour=6, minute=0)
```

`scan_due_clients()` fans out to all three scanners in parallel for due clients.

---

## Component J — Baileys Service

**Location**: `platform-api/baileys/`

- [ ] `npm init` + install `@whiskeysockets/baileys`, `express`, `axios`, `dotenv`
- [ ] `src/index.js` — session init, QR scan, auto-reconnect
- [ ] `src/filter.js` — `GET /clients/exists?number=` → keep or discard
- [ ] `src/poster.js` — `POST /internal/messages` to backend
- [ ] `auth/` in `.gitignore`
- [ ] `GET /health` endpoint

---

## Build Order

```
A  Convex service wrapper          ← everything else reads/writes DB through this
B  Exa service                     ✅ done
C  Apify service
D  LLM service
E  Handle resolution               ← depends on B + D
F  Scanners (LinkedIn, IG, Legacy) ← depends on B + C + D, hash logic here
G  Batch generator                 ← depends on D + Convex
H  Routers (all)                   ← depends on A + E + F + G
I  Cron                            ← depends on F + G
J  Baileys service                 ← independent, can build any time
```

---

## OpenClaw's Role (what it does NOT do)

- ❌ Does not call Exa
- ❌ Does not call Apify
- ❌ Does not run signal detection LLM
- ❌ Does not run cron jobs
- ✅ Receives advisor WhatsApp messages → POST /advisor/message → sends reply
- ✅ Receives batch-ready notification → sends advisor WA summary
- ✅ Handles advisor conversation (context synthesis done by backend LLM)
