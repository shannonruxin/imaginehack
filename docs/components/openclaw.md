# OpenClaw

## Status

✅ Running in `imaginehack-openclaw` container
✅ Connected to WhatsApp (advisor's number) + Telegram
✅ `messageReceived` plugin hook enabled on WhatsApp (internal use only)
⚠️ Skill not yet deployed — container needs rebuild (see Setup below)
⚠️ `backend` service not yet in docker-compose.yml — `PLATFORM_API_URL` won't resolve until Component 13 is done

---

## Role in the System

OpenClaw is a **thin WhatsApp adapter**. It has zero business logic.

```
Advisor texts OpenClaw on WhatsApp
  → OpenClaw skill: POST {PLATFORM_API_URL}/advisor/message { message, advisor_id }
  → Backend: classifies intent, queries Convex, calls LLM, returns { reply, intent }
  → OpenClaw: sends reply back to advisor on WhatsApp verbatim
```

All intelligence lives in the Python backend. OpenClaw just moves text between WhatsApp and the backend.

---

## What the Advisor Can Say

OpenClaw passes everything verbatim to the backend. The backend classifies intent:

| Advisor message | Backend intent | What happens |
|----------------|----------------|-------------|
| "What's up with Ahmad?" | `client_summary` | Reads chat history + recent signals → LLM summary |
| "Who should I reach out to this week?" | `weekly_batch` | Returns current project client list with angles |
| "Ahmad's Instagram is @ahmadfariz92" | `set_handle` | Writes handle to Ahmad's client record in Convex |
| Anything else | `freeform` | LLM reply with client context |

---

## Skill

The skill file lives at **`openclaw/plugin-skills/imaginehack/SKILL.md`** in this repo.

On every container start, `entrypoint.sh` syncs it into `/root/.openclaw/plugin-skills/imaginehack/SKILL.md` (the `/root` named volume shadows image contents, so we stage at `/opt/imaginehack/plugin-skills/` in the image and copy at runtime).

**Payload the skill sends to the backend:**
```jsonc
// POST {PLATFORM_API_URL}/advisor/message
{ "message": "<advisor's exact message text>", "advisor_id": "<wa id or \"default\">" }
// ← { "reply": "...", "intent": "..." }
```

The backend extracts client names from the message itself — the skill does **not** parse names. The skill relays `reply` verbatim; it never modifies, summarizes, or invents replies.

**Optional — explicit approach angle:**
```jsonc
// POST {PLATFORM_API_URL}/advisor/suggest-angle
{ "client_id": "<convex id>" }
// ← { "angle": "...", "reasoning": "..." }
```

---

## Container Config (actual state)

From `/root/.openclaw/openclaw.json` as of 2026-06-21:

| Setting | Value |
|---------|-------|
| Model | `google/gemini-2.5-flash` (primary) |
| Fallbacks | `ilmu/nemo-super`, `ilmu/ilmu-nemo-nano`, `google/gemini-3.1-pro-preview` |
| Thinking | `medium` |
| Channels | WhatsApp ✅, Telegram ✅ |
| MCP servers | deepwiki, brave-search, google-workspace, whatsapp-history, exa |
| Plugin hook | `messageReceived: true` on WhatsApp default account |

WhatsApp `dmPolicy` is `allowlist` — only messages from numbers in `allowFrom` reach the skill. Current allowlist: `60122468905`, `60173024851`.

---

## Inbound Client Messages

Client message ingestion is handled by the **Baileys service** — not OpenClaw. Baileys holds a separate persistent WhatsApp connection, filters to tracked client numbers, and POSTs to `POST /internal/messages` on the platform API. OpenClaw is not involved in this flow.

---

## Cron via OpenClaw (optional)

OpenClaw supports native cron. If the Python backend's APScheduler isn't running, OpenClaw can trigger worker endpoints:

```
Daily  03:00 → POST http://backend:8000/workers/scan-linkedin
Daily  03:30 → POST http://backend:8000/workers/scan-instagram
Daily  04:00 → POST http://backend:8000/workers/scan-legacy
Monday 06:00 → POST http://backend:8000/workers/generate-batch
```

APScheduler inside the backend is preferred. This is a fallback.

---

## Setup — Deploy the Skill

See [`docs/setup/openclaw.md`](../setup/openclaw.md) for the full step-by-step.

**Quick rebuild:**
```bash
cd /Users/shannon.chu/Code/imaginehack
docker compose build openclaw
docker compose up -d openclaw
```

After rebuild, verify the skill landed:
```bash
docker exec imaginehack-openclaw ls /root/.openclaw/plugin-skills/imaginehack/
# → SKILL.md
```
