# Component 3 — Baileys Message Capture Service

## What this does

Connects to a WhatsApp number, listens to all incoming and outgoing messages, filters to tracked client numbers, and writes each message to Convex via the Python backend.

Runs bare — `node src/index.js` on the host. No Docker.

```
WA message arrives
  → Baileys messages.upsert fires
  → filter: GET http://backend:8000/clients/exists?number={phone}
  → if client:  POST http://backend:8000/internal/messages { payload }
  → if not:     discard silently
```

> **Session flag**: WhatsApp enforces one Web session per number. Baileys must connect to a **dedicated second number** — not the same number OpenClaw is on.

---

## Directory structure

```
platform-api/baileys/
  src/
    index.js    ← session init, event loop, auto-reconnect, GET /health
    filter.js   ← client existence check against backend
    poster.js   ← POST message payload to backend
  auth/         ← WA session files (written on first run, gitignored)
  .env          ← local only, gitignored
  .env.example
  .gitignore
  package.json
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@whiskeysockets/baileys` | WhatsApp Web protocol client |
| `express` | HTTP server for `GET /health` |
| `axios` | HTTP calls to backend |
| `dotenv` | env var loading |
| `pino` | logging |

---

## `src/filter.js`

```
checkIsClient(phone)
  → GET {BACKEND_URL}/clients/exists?number={phone}
  → returns { exists: boolean }
  → on any error: { exists: false }  ← never crash the event loop
```

---

## `src/poster.js`

```
postMessage({ phone, fromMe, timestamp, message })
  → POST {BACKEND_URL}/internal/messages
  → body: { phone, from_me, timestamp, text, type }
  → log success/failure, never throw
```

Message type resolution: `text | image | audio | video | other`

---

## `src/index.js`

1. `useMultiFileAuthState('./auth')` — load/save session
2. `makeWASocket({ auth, printQRInTerminal: true })`
3. `creds.update` → `saveCreds`
4. `messages.upsert` → skip non-notify / no-message / group JIDs → filter → post
5. `connection.update` → auto-reconnect unless `DisconnectReason.loggedOut`
6. Express on `PORT` with `GET /health → 200`

---

## `.env`

```
BACKEND_URL=http://localhost:8000
PORT=3001
```

---

## How to run

```bash
cd platform-api/baileys
cp .env.example .env      # set BACKEND_URL to wherever the backend is
node src/index.js         # QR code prints in terminal on first run
```

Scan the QR with the **second number**. Session saved to `auth/` — no re-scan on restart.

---

## Dependency on Component 2

These two backend endpoints must exist before Baileys can be tested end-to-end:

| Endpoint | Used by |
|----------|---------|
| `GET /clients/exists?number=` | `filter.js` — called for every message |
| `POST /internal/messages` | `poster.js` — writes each captured message |
