# Component 3 — Baileys Message Capture Service

## What this does

Connects to a WhatsApp number, listens to all incoming and outgoing messages, filters to tracked client numbers, and writes each message to the Convex DB via the Python backend.

```
WA message arrives on advisor's number
  → Baileys receives messages.upsert event
  → check: is this phone number a tracked client?
      GET http://backend:8000/clients/exists?number={phone}
  → yes: POST http://backend:8000/internal/messages { payload }
  → no:  discard silently
```

> **Session flag**: WhatsApp enforces one Web session per number. If OpenClaw is already connected to the same number, Baileys will conflict with it (WA kicks one session out). You'll need a dedicated second number for Baileys, OR disconnect OpenClaw from WA and let Baileys hold the session.

---

## Directory structure

```
platform-api/baileys/
  src/
    index.js        ← entry: session init, event loop, reconnect, health endpoint
    filter.js       ← GET /clients/exists check
    poster.js       ← POST /internal/messages
  auth/             ← WA session files (written on first run, gitignored)
  .env
  .gitignore
  package.json
  Dockerfile
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@whiskeysockets/baileys` | WhatsApp Web protocol client |
| `express` | HTTP server for `GET /health` |
| `axios` | HTTP calls to backend |
| `dotenv` | env var loading |
| `pino` | logging (Baileys uses this internally) |

---

## `src/index.js` — responsibilities

1. Load session from `./auth/` with `useMultiFileAuthState`
2. Create socket with `makeWASocket({ auth, printQRInTerminal: true })`
3. Save credentials on `creds.update` event
4. Handle `messages.upsert`:
   - Skip if `type !== 'notify'` (avoids history sync flood on startup)
   - Skip if `!msg.message` (system/empty messages)
   - Extract phone from JID: `remoteJid.replace('@s.whatsapp.net', '')`
   - Call `filter.js` → if client: call `poster.js`
5. Handle `connection.update` for auto-reconnect:
   - On `close`: reconnect unless `DisconnectReason.loggedOut`
   - On `open`: log connected
6. Express app on `PORT` with `GET /health → 200 OK`

---

## `src/filter.js` — client check

```
checkIsClient(phone)
  → GET {BACKEND_URL}/clients/exists?number={phone}
  → returns { exists: boolean }
  → on any error: return { exists: false }  ← fail-safe, never crash the event loop
```

---

## `src/poster.js` — write to backend

```
postMessage(payload)
  → POST {BACKEND_URL}/internal/messages
  → body:
      phone       string   — e.g. "60123456789"
      from_me     boolean  — true if advisor sent, false if client sent
      timestamp   number   — unix timestamp from WA (msg.messageTimestamp)
      text        string | null  — null for media messages
      type        "text" | "image" | "audio" | "video" | "other"
  → log success/failure, never throw (don't crash the event loop)
```

### Message type resolution (used inside poster or index)

```js
function resolveType(message) {
  if (message?.conversation || message?.extendedTextMessage) return 'text'
  if (message?.imageMessage)                                  return 'image'
  if (message?.audioMessage || message?.pttMessage)           return 'audio'
  if (message?.videoMessage)                                  return 'video'
  return 'other'
}
```

---

## `.env`

```
BACKEND_URL=http://backend:8000
PORT=3001
```

---

## `.gitignore`

```
auth/
node_modules/
.env
```

---

## `Dockerfile`

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
EXPOSE 3001
CMD ["node", "src/index.js"]
```

---

## docker-compose.yml addition (root file)

```yaml
  baileys:
    build: ./platform-api/baileys
    container_name: imaginehack-baileys
    ports:
      - "3001:3001"
    env_file:
      - .env
    volumes:
      - baileys-auth:/app/auth   ← persist session across restarts
    restart: unless-stopped
    depends_on:
      - backend

volumes:
  baileys-auth:
```

---

## Implementation tasks (in order)

- [ ] `npm init -y` inside `platform-api/baileys/`
- [ ] Install deps: `npm install @whiskeysockets/baileys express axios dotenv pino`
- [ ] Write `.gitignore`
- [ ] Write `.env`
- [ ] Write `src/filter.js`
- [ ] Write `src/poster.js`
- [ ] Write `src/index.js`
- [ ] Write `Dockerfile`
- [ ] Add `baileys` service + `baileys-auth` volume to root `docker-compose.yml`
- [ ] First run: `docker-compose up baileys` → scan QR with the number to track
- [ ] Verify `auth/` files are written to the named volume
- [ ] End-to-end test: send a message from a tracked client number → confirm it appears in Convex `messages` table

---

## Dependency on Component 2

These two backend endpoints must exist (even as stubs) before Baileys can be tested:

| Endpoint | Used by |
|----------|---------|
| `GET /clients/exists?number=` | `filter.js` — every message triggers this |
| `POST /internal/messages` | `poster.js` — writes each captured message |
