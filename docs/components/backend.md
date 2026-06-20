# Python Backend

## What it owns

Everything that isn't WhatsApp I/O:
- All API endpoints
- LLM calls (signal detection, handle scoring, advisor intent, synthesis)
- Exa and Apify calls
- Convex DB reads and writes
- APScheduler cron jobs
- Advisor intent routing

## Structure

```
backend/
  main.py                  # FastAPI app, mounts routers
  config.py                # env vars
  cron.py                  # APScheduler setup + job definitions
  routers/
    clients.py             # /clients CRUD + /clients/exists
    messages.py            # /internal/messages (Baileys writes here)
    projects.py            # /projects CRUD
    advisor.py             # /advisor/message — OpenClaw calls this
    workers.py             # /workers/* — called by cron
  services/
    convex.py              # Convex HTTP API wrapper
    exa.py                 # Exa search wrapper
    apify.py               # Apify actor runner
    llm.py                 # LLM calls (classify, synthesize, score)
    handle_resolution.py   # Exa search → LLM score → store handle
    linkedin_scanner.py    # Exa → LLM signal detection
    instagram_scanner.py   # Apify → LLM signal detection
    legacy_scanner.py      # Exa → LLM family match
    batch_generator.py     # aggregate signals → write project
    intent_router.py       # classify advisor message intent
    advisor_llm.py         # per-intent handlers
```

## API Endpoints

### Clients
```
POST   /clients                         Add client — triggers handle resolution
GET    /clients                         List all clients
GET    /clients/:id                     Get client with message history + social signals
PATCH  /clients/:id                     Update client fields
GET    /clients/exists?number=          Is this number a tracked client? (used by Baileys)
```

### Handle Resolution
```
GET    /clients/:id/resolution          Get resolution status + candidates
POST   /clients/:id/resolution/confirm  { handle, platform } — advisor confirms
POST   /clients/:id/resolution/manual   { handle, platform } — advisor sets manually
POST   /clients/:id/resolution/skip     Skip social monitoring for this client
```

### Messages
```
POST   /internal/messages               Written by Baileys — stores incoming WA message
GET    /clients/:id/messages            Get conversation history for a client
```

### Advisor Intent
```
POST   /advisor/message
  body:     { advisor_message: string, client_name?: string }
  response: { reply: string }

Called by OpenClaw on every advisor message. Backend routes intent,
queries DB, calls LLM, returns reply string for OpenClaw to send back.
```

### Projects
```
GET    /projects                            List all projects
POST   /projects                            Create project manually
GET    /projects/:id                        Get project detail
PATCH  /projects/:id/clients/:clientId      Update client status within project
```

### Workers (internal — called by APScheduler, not public)
```
POST   /workers/resolve-handles    Run handle resolution for clients with pending handles
POST   /workers/scan-linkedin      Scan LinkedIn for all due clients
POST   /workers/scan-instagram     Scan Instagram for all due clients
POST   /workers/scan-legacy        Scan Legacy.com for all due clients
POST   /workers/generate-batch     Generate weekly project from pending signals
POST   /workers/notify-advisor     Trigger OpenClaw to message advisor
```

## Cron Schedule

```python
# cron.py
scheduler = APScheduler()

scheduler.add_job(scan_due_clients,        'cron', hour=3,  minute=0)
scheduler.add_job(generate_weekly_project, 'cron', day_of_week='mon', hour=6, minute=0)
```

`scan_due_clients()` runs the LinkedIn, Instagram, and Legacy scanners in parallel for all clients where any `next_check < now()`.

## Advisor Intent Routing

`POST /advisor/message` handles all advisor commands. Intent classifier routes to the right handler:

| Intent | Trigger phrases | Handler |
|--------|----------------|---------|
| `client_summary` | "what's up with X", "update me on X" | query messages + signals → LLM summarize |
| `reminder` | "remind me about X", "follow up on X" | query messages → LLM extract context → schedule |
| `weekly_batch` | "who should I call", "this week's list" | return current project |
| `set_handle` | "X's Instagram is @...", "X's LinkedIn is..." | parse + write to Convex |
| `freeform` | anything else | LLM with client context |

## Stack

- Python 3.11+
- FastAPI
- APScheduler
- httpx (async HTTP for Convex, Exa, Apify calls)
- openai (LLM calls)

## Env

```
CONVEX_URL=
CONVEX_DEPLOY_KEY=
EXA_API_KEY=
APIFY_API_TOKEN=
OPENAI_API_KEY=
LLM_MODEL=gpt-4o
BAILEYS_SERVICE_URL=http://baileys:3001
OPENCLAW_WEBHOOK_URL=
```
