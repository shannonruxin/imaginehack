# OpenClaw

## Status

✅ Running in `imaginehack-openclaw` container
✅ Connected to WhatsApp (advisor's number)

OpenClaw requires no significant changes. One skill needs to be added that forwards advisor messages to the Python backend.

---

## Role in the System

OpenClaw is a **thin WhatsApp adapter**. It has zero business logic.

```
Advisor texts OpenClaw
  → OpenClaw: POST /advisor/message { advisor_message, client_name? }
  → Backend: routes intent, queries DB, calls LLM, returns { reply }
  → OpenClaw: sends reply back to advisor on WhatsApp
```

All intelligence lives in the Python backend. OpenClaw just moves text between WhatsApp and the backend.

---

## What the Advisor Can Say

OpenClaw passes everything verbatim to the backend. The backend handles intent:

| Advisor message | What happens |
|----------------|-------------|
| "What's up with Ahmad?" | Backend queries Ahmad's messages + social signals → LLM summary |
| "Remind me about Raina tomorrow" | Backend extracts context → schedules reminder |
| "Who should I reach out to this week?" | Backend returns current project client list |
| "Ahmad's Instagram is @ahmadfariz92" | Backend writes handle to Ahmad's client record |
| Anything else | Backend LLM responds with client context |

---

## Skill to Add

Create at `/root/.openclaw/plugin-skills/imaginehack/SKILL.md`:

```markdown
# ImagineHack Sales Intelligence

You are assisting a life insurance advisor. When they send any message:

1. Extract the client name if one is mentioned (e.g. "remind me about Raina" → client_name = "Raina")
2. POST to http://backend:8000/advisor/message:
   {
     "advisor_message": "<their exact message>",
     "client_name": "<extracted name or null>"
   }
3. Send back the `reply` field from the response exactly as returned.

Do not add your own commentary. Do not modify the reply. Just send it.
```

---

## Container Config

Current `openclaw.json` key settings:
- Model: `google/gemini-3.1-pro-preview`
- Channel: Telegram (default) + WhatsApp (to be confirmed connected)
- MCP servers: deepwiki, brave-search, google-workspace
- Tools allowed: read, write, edit, exec, cron, sessions, memory, web_search, web_fetch

No changes needed to existing config. Just add the skill file.

---

## WhatsApp Session Conflict with Baileys

WhatsApp only allows one Web session per number. OpenClaw already holds the session.

**For the hackathon**: use OpenClaw's `messageReceived` plugin hook instead of a separate Baileys service.

Enable in `openclaw.json`:
```json
"channels": {
  "whatsapp": {
    "pluginHooks": {
      "messageReceived": true
    }
  }
}
```

Then write a plugin that:
1. Receives every inbound message via the hook
2. Checks `GET /clients/exists?number=` against backend
3. If client: `POST /internal/messages` to backend

This replaces the standalone Baileys service entirely and avoids the session conflict.

---

## Cron via OpenClaw (alternative to APScheduler)

OpenClaw supports cron jobs natively. If the Python backend doesn't run APScheduler, OpenClaw can trigger the worker endpoints on schedule:

```
Daily  03:00 → POST http://backend:8000/workers/scan-linkedin
Daily  03:30 → POST http://backend:8000/workers/scan-instagram
Daily  04:00 → POST http://backend:8000/workers/scan-legacy
Monday 06:00 → POST http://backend:8000/workers/generate-batch
```

This is optional — APScheduler in the Python backend is self-contained and preferred. OpenClaw cron is a fallback if the backend doesn't manage its own schedule.
