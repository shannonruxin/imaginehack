# Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Convex DB                              │
│              clients | messages | projects                      │
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
│ streams client messages  │     │ advisor sends message    │
│ → POST /internal/msgs    │     │ → POST /advisor/message  │
│   to Python backend      │     │ → sends reply back       │
└──────────────────────────┘     └──────────────────────────┘
```

## Separation of Concerns

| Component | Owns |
|-----------|------|
| **Baileys** | WhatsApp connection, real-time message streaming, client filter |
| **Python backend** | All logic — LLM calls, Exa/Apify calls, cron, DB writes, intent routing |
| **OpenClaw** | Advisor WhatsApp I/O only — receives message, POSTs to backend, sends reply |
| **Convex DB** | Shared state — single source of truth |
| **Exa** | Handle resolution, LinkedIn profile scanning, Legacy.com obituary search |
| **Apify** | Instagram public post scraping |

## Key Design Decisions

**Backend owns all intelligence.** Neither Baileys nor OpenClaw contain business logic. Both are thin I/O layers. This means all features can be built, tested, and changed in one place.

**Baileys is reactive, not polling.** WhatsApp pushes messages to Baileys via persistent WebSocket. Baileys does not check on an interval — it just receives events as they arrive and forwards relevant ones to the backend.

**Baileys tracks clients via DB lookup.** Baileys has no hardcoded list of numbers to watch. For every incoming message it calls `GET /clients/exists?number=X`. If the number is in Convex it stores the message; if not it discards. Adding a client to Convex automatically enables tracking — no Baileys config needed.

**Social scanning is pull-based on a daily cron.** The backend queries which clients are due for a scan (next_check < now), calls Exa/Apify for those clients only, and updates their social_intelligence records. Each platform tracks its own `last_checked` and `next_check` timestamps independently.

**OpenClaw is a single skill.** It receives any advisor message, POSTs it to `/advisor/message`, and sends back whatever the backend returns. All intent classification and response generation happens in the backend.

## Data Flow — WhatsApp Message

```
Client texts advisor on WhatsApp
  → Baileys receives via messages.upsert event
  → GET /clients/exists?number={phone}  →  Convex lookup
  → if client: POST /internal/messages  →  backend writes to Convex messages table
  → if not client: discard
```

## Data Flow — Advisor Command

```
Advisor texts OpenClaw: "What's up with Ahmad?"
  → OpenClaw POST /advisor/message { advisor_message: "What's up with Ahmad?" }
  → Backend: classify intent → query Ahmad's messages from Convex
  → Backend: LLM synthesizes conversation + latest social signals
  → Backend: returns { reply: "Ahmad last messaged 3 days ago..." }
  → OpenClaw sends reply back to advisor on WhatsApp
```

## Data Flow — Social Scan (daily, 3AM)

```
APScheduler fires scan_due_clients()
  → query Convex: clients where any platform next_check < now()
  → for each due client, per platform in parallel:
      LinkedIn  → Exa search → LLM classify signals
      Instagram → Apify scrape → LLM classify signals (+ vision LLM for images)
      Legacy    → Exa search → LLM check family match
  → update social_intelligence[] on client record
  → if signals found: set pending_batch = true
```

## Data Flow — Weekly Project (Monday, 6AM)

```
APScheduler fires generate_weekly_project()
  → query Convex: clients where pending_batch = true
  → LLM generates project name + sales_angle from signals
  → write projects record to Convex
  → set pending_batch = false for all included clients
  → POST /workers/notify-advisor
      → OpenClaw sends WA message to advisor with batch summary
```
