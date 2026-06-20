# OpenClaw in ImagineHack

How OpenClaw connects to this project and what it can do.

---

## Connection to Platform API

OpenClaw reaches the platform API at `PLATFORM_API_URL` (root `.env`).

```
PLATFORM_API_URL=http://backend:8000
```

Both containers share the same Docker network via `docker-compose.yml`. From the host, the backend is on port `8001`. The skill defaults to `http://backend:8000` if the env var is unset.

---

## Feature 1 — Enrich Sales Angle

When the advisor asks how to approach a client, OpenClaw does more than relay — it layers a web-searched conversation starter on top of the backend's data-driven angle.

### Step 1: Get the base angle from the backend
```
GET /clients                     → resolve name to client_id
POST /advisor/suggest-angle      → { angle, reasoning }
GET /clients/{id}                → read recent_signals + persona
```

### Step 2: Pre-classification gate

Before doing any web search, OpenClaw scans `recent_signals` and `persona` for a **specific, concrete, searchable detail**. This gate is strict — it prevents searching on generic signals that would only add noise.

| ✅ Passes — search | ❌ Fails — skip search |
|---|---|
| "going to Bali next week" | "posts family content" |
| "posts about surfing in Lombok" | "career-driven" |
| "just opened a café in PJ" | "active on LinkedIn" |
| "running Penang marathon in 3 weeks" | no recent signals |

If nothing passes → send base angle from the backend as-is.

### Step 3: Web search (1–2 queries, only if gate passes)

Search for what a person genuinely interested in that topic would want to talk about. **Not** insurance angles — those come from the backend.

| ✅ Good search | ❌ Bad search |
|---|---|
| "what is Bali known for" | "travel insurance Bali" |
| "popular surfing spots Lombok" | "life insurance for surfers" |
| "things to do Penang marathon weekend" | "critical illness coverage athletes" |

Take 2–3 specific, interesting facts. Discard anything generic.

### Step 4: Output to advisor

```
💬 Conversation starter for [Name]:

[1–2 sentences — a natural topic to raise. No mention of insurance.
Goal: the client brings up their own plans, not the advisor.]

→ [One sentence — where this naturally leads, so advisor knows the segue.]

Base angle (from client data): [backend angle verbatim]
```

---

## Feature 2 — Query the Database

OpenClaw can read client and project data via the platform API GET endpoints. Used when the advisor asks about a client, when enriching a sales angle, or when the messageReceived hook needs to identify a caller.

| Endpoint | Returns |
|----------|---------|
| `GET /clients` | All clients — name, persona, socials, recent signals |
| `GET /clients/{id}` | Single client |
| `GET /clients/exists?number=` | Whether a phone number belongs to a known client |
| `GET /clients/{id}/chat-history` | Client's WhatsApp conversation history (written by Baileys, read here for context) |
| `GET /projects/current` | This week's outreach batch — flagged clients + sales angle |

OpenClaw never writes to the database directly. All mutations go through platform API POST/PATCH endpoints.

---

## Feature 3 — Send Messages to Clients

OpenClaw has full WhatsApp access and can send outbound messages to clients on the advisor's behalf.

Use cases:
- Advisor says "send Ahmad a quick check-in" → OpenClaw composes and sends via WhatsApp
- Advisor says "send Raina this: [text]" → OpenClaw sends it verbatim
- Automated follow-up reminders (see Feature 5)

OpenClaw does not send unsolicited messages. It only sends when the advisor explicitly requests it or a cron reminder fires.

---

## Feature 4 — Answer Advisor Questions (Backend Relay)

The default flow — everything the advisor types goes to `POST /advisor/message`. The backend classifies intent and handles it.

| Advisor says | What happens |
|---|---|
| "What's up with Ahmad?" | Backend reads Ahmad's chat history + persona → LLM briefing |
| "Who should I reach out to this week?" | Backend returns current project — flagged clients + approach notes |
| "Set Ahmad's Instagram to @ahmadfariz92" | Backend writes handle to `socials[]` in Convex |
| Anything else | LLM freeform response with advisor context |

The advisor chats naturally. No commands or special syntax needed.

---

## Feature 5 — Receive Weekly Batch Notification

When the platform API generates the Monday outreach batch, it fires `OPENCLAW_WEBHOOK_URL`. OpenClaw pushes a WhatsApp message to the advisor summarising who to reach out to this week and the overall sales angle.

Platform API POSTs to OpenClaw:
```json
{
  "message": "Weekly outreach batch ready.\n<sales_angle>\nClients: Ahmad, Raina, ...",
  "projectId": "<convex project id>"
}
```

Set `OPENCLAW_WEBHOOK_URL` in root `.env` to activate this.

---

## What OpenClaw Cannot Do

- **No scan triggers** — cannot call `/workers/scan-*`; scanning is scheduled on the backend
- **No LLM calls** — platform API owns all LLM; OpenClaw relays results and does web search only
- **No direct DB writes** — all mutations go through platform API endpoints
- **No direct Convex access** — always goes through the platform API

---

## The Skill

File: `openclaw/plugin-skills/imaginehack/SKILL.md`

Deployed via Docker image → staged at `/opt/imaginehack/plugin-skills/` → `entrypoint.sh` syncs into `/root/.openclaw/plugin-skills/` on every container start (`/root` is a named volume so image contents are synced at runtime).

Update the skill:
```bash
# edit SKILL.md, then:
docker compose build openclaw && docker compose up -d openclaw
```

---

## Container Config

From `openclaw.json` (current):

| Setting | Value |
|---------|-------|
| Model | `google/gemini-2.5-flash` (primary) |
| Fallbacks | `ilmu/nemo-super`, `google/gemini-3.1-pro-preview` |
| Thinking | `medium` |
| WhatsApp | enabled, `dmPolicy: allowlist` |
| Telegram | enabled |
| MCP servers | deepwiki, brave-search, google-workspace, whatsapp-history, exa |
| Tools | read, write, edit, exec, cron, sessions, memory, web_search, web_fetch |

WhatsApp allowlist (only these numbers reach the skill): `60122468905`, `60173024851`.
Add a number: `docker exec -it imaginehack-openclaw openclaw configure`

---

## Verify Everything Is Working

```bash
# Skill is deployed
docker exec imaginehack-openclaw ls /root/.openclaw/plugin-skills/imaginehack/

# Backend is reachable from openclaw
docker exec imaginehack-openclaw curl -s http://backend:8000/health
# → {"ok":true}

# Backend is reachable from host
curl -s http://localhost:8001/health
# → {"ok":true}
```
