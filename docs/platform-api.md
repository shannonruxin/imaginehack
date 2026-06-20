# Platform API

The Python FastAPI backend that owns all business logic, database writes, and LLM calls. OpenClaw and any other clients are consumers — they call this API and get back results.

---

## Running

```bash
# Local (outside Docker)
cd platform-api/backend
uvicorn main:app --reload --port 8001

# In Docker (default)
docker compose up -d backend
# available at http://localhost:8001 on host, http://backend:8000 inside Docker network
```

---

## Architecture

```
platform-api/backend/
├── main.py              # FastAPI app, mounts all routers, starts APScheduler
├── config.py            # Env vars via pydantic-settings
├── cron.py              # APScheduler jobs (scan + batch)
├── routers/
│   ├── clients.py       # CRUD + social handle ops
│   ├── messages.py      # Inbound WhatsApp message ingestion
│   ├── projects.py      # Weekly outreach project management
│   ├── advisor.py       # Advisor chat interface
│   └── workers.py       # One-shot manual triggers for cron jobs
└── services/
    ├── convex.py         # All Convex reads + writes (single source of truth)
    ├── exa.py            # Exa API (LinkedIn fetch, Legacy.com search)
    ├── apify.py          # Apify (Instagram scraper)
    ├── llm.py            # OpenAI calls (intent classification, LLM responses, persona)
    ├── advisor_llm.py    # High-level advisor intent handlers
    ├── handle_resolution.py  # Auto-find LinkedIn/Instagram URLs for new clients
    ├── linkedin_scanner.py   # LinkedIn scan + persona refresh
    ├── instagram_scanner.py  # Instagram scan + persona refresh
    ├── legacy_scanner.py     # Legacy.com scan + persona refresh
    └── batch_generator.py    # Weekly project generation
```

---

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `EXA_API_KEY` | yes | — | Exa API for LinkedIn + Legacy searches |
| `APIFY_API_TOKEN` | yes | — | Apify for Instagram scraping |
| `OPENAI_API_KEY` | yes | — | LLM calls (advisor chat, batch generation) |
| `CONVEX_URL` | yes | — | Convex deployment URL |
| `CONVEX_DEPLOY_KEY` | yes | `""` | Convex deploy key for mutations (get from Convex dashboard) |
| `LLM_MODEL` | no | `gpt-4o` | Model for advisor + batch LLM calls |
| `CLASSIFIER_MODEL` | no | `gpt-4o-mini` | Lighter model for persona classification |
| `OPENCLAW_WEBHOOK_URL` | no | `""` | OpenClaw webhook to notify advisor when weekly batch is ready |

---

## Endpoints

### Clients — `/clients`

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/clients` | Create a new client. Triggers `resolve_handles` in background to auto-find their LinkedIn/Instagram. |
| `GET` | `/clients` | List all clients (includes `persona`, `recent_signals`, `socials`). |
| `GET` | `/clients/{id}` | Get a single client by Convex ID. |
| `PATCH` | `/clients/{id}` | Update demographic fields (name, age, nationality, income range, etc.). |
| `GET` | `/clients/exists?number=` | Check if a WhatsApp number belongs to a known client. Returns `{ exists, client_id }`. |
| `POST` | `/clients/{id}/opportunities` | Add a sales opportunity note to a client. |
| `GET` | `/clients/{id}/chat-history` | Get the client's WhatsApp conversation history. |

**Create body:**
```json
{
  "first_name": "Ahmad",
  "last_name": "Farhan",
  "age": 38,
  "nationality": "Malaysian",
  "income_range": "10k–20k",
  "number": "60123456789",
  "email": "ahmad@example.com",
  "marital_status": "married",
  "dependents": [],
  "existing_policies": [],
  "socials": [],
  "sales_opportunities": []
}
```

---

### Messages — `/internal`

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/internal/messages` | Log an inbound WhatsApp message from a client. Looks up the client by phone number, appends to `chat_history` in Convex. |

**Body:**
```json
{
  "phone_number": "60123456789",
  "body": "Hi, I wanted to ask about my policy.",
  "timestamp": "1718000000000",
  "direction": "inbound"
}
```

Called by OpenClaw's `messageReceived` plugin hook when a client texts in — not by the advisor skill.

---

### Projects — `/projects`

| Method | Path | What it does |
|--------|------|-------------|
| `GET` | `/projects` | List all projects. |
| `GET` | `/projects/current` | Get the most recently created project (this week's batch). |
| `GET` | `/projects/{id}` | Get a specific project by ID. |
| `POST` | `/projects` | Create a project manually. |
| `POST` | `/projects/{id}/enrich` | For each client in the project, call `suggest_approach_angle` and write the result as their `notes`. |
| `PATCH` | `/projects/{id}/clients/{client_id}` | Update a client's status within a project (`to_follow_up`, `meeting_rescheduled`, `stale`, `help_me_out`), notes, and scheduled dates. |

---

### Advisor — `/advisor`

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/advisor/message` | Main entry point. Classifies the advisor's message intent, routes to the right handler, returns `{ reply, intent }`. |
| `POST` | `/advisor/suggest-angle` | Given a `client_id`, reads persona + chat history + recent signals → returns `{ angle, reasoning }` for how to approach that client. |

**Intent routing in `/advisor/message`:**

| Intent | Trigger | Handler |
|--------|---------|---------|
| `client_summary` | Advisor mentions a client name | Reads chat history + persona → LLM summary |
| `set_handle` | "set instagram handle for X to @y" | Writes handle to client's `socials[]` |
| `weekly_batch` | Asks who to reach out to this week | Triggers `generate_weekly_project()` |
| `freeform` | Anything else | LLM response with generic advisor context |

---

### Workers — `/workers`

Manual triggers for the scheduled jobs. Useful for testing or one-off runs.

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/workers/scan-linkedin` | Run LinkedIn scan for all clients (background) |
| `POST` | `/workers/scan-instagram` | Run Instagram scan for all clients (background) |
| `POST` | `/workers/scan-legacy` | Run Legacy.com scan for all clients (background) |
| `POST` | `/workers/resolve-handles` | Re-run handle resolution for all clients (background) |
| `POST` | `/workers/generate-batch` | Generate this week's outreach project (background) |

---

### Health

| Method | Path | Response |
|--------|------|---------|
| `GET` | `/health` | `{ "ok": true }` |

---

## Scheduled Jobs (APScheduler)

Runs automatically inside the backend process — no external scheduler needed.

| Schedule | Job | What it does |
|----------|-----|-------------|
| Daily 3:00am | `scan_due_clients` | Runs LinkedIn + Instagram + Legacy scan for every client in parallel (ThreadPoolExecutor, 10 workers). Each scan updates `recent_signals` and refreshes `persona`. |
| Monday 6:00am | `generate_weekly_project` | Reads all clients, finds those with new signals since the last project, runs signal classification, generates a project with a batch sales angle and per-client notes. Fires `OPENCLAW_WEBHOOK_URL` if set. |

---

## Service Layer

### `convex.py` — database (single source of truth)

All Convex reads and writes go through this module. No other module calls Convex directly.

Key functions:

```python
# Clients
get_client_by_id(id)         # read
get_client_by_number(number) # read — used by messageReceived hook
list_clients()               # read
insert_client(data)          # write
update_client(id, fields)    # write
add_social(id, type, value)  # write — appends to socials[]
set_recent_signals(id, platform, content)  # write — replaces one platform entry
update_persona(id, tags, summary)          # write — overwrites persona{}
append_message(client_id, sender, message, timestamp)  # write — chat_history

# Projects
get_current_project()        # read — latest project by created_at
insert_project(data)         # write
update_project_client_status(id, client_id, status, notes, ...)  # write

# Chat history
get_chat_history(client_id)  # read
```

### `llm.py` — OpenAI calls

| Function | Model | Purpose |
|----------|-------|---------|
| `classify_intent(message)` | `LLM_MODEL` | Classify advisor message into one of 5 intents |
| `classify_signals(client, platform, content)` | `LLM_MODEL` | Detect life event signals in social content |
| `classify_persona(client, recent_signals)` | `CLASSIFIER_MODEL` | Pick 1–3 persona tags + one-sentence summary |
| `suggest_approach_angle(client, messages, signals)` | `LLM_MODEL` | Generate approach angle + reasoning for a client |
| `synthesize_client_context(client, messages)` | `LLM_MODEL` | Briefing summary for advisor |
| `generate_batch_angle(clients_and_signals)` | `LLM_MODEL` | Weekly batch theme + per-client notes |
| `score_handle_candidate(text, client)` | `LLM_MODEL` | 0–10 confidence score for handle resolution |

### `handle_resolution.py` — auto-find social handles

Triggered in background on `POST /clients`. Searches LinkedIn and Instagram via Exa, scores each candidate against the client profile using `llm.score_handle_candidate`, and auto-saves any match with score ≥ 6 to `socials[]`. Lower-confidence matches are silently dropped (advisor can set handles manually via the advisor chat).
