# Baileys Service

## What it is

A lightweight persistent Node.js process that maintains a WhatsApp Web session on the advisor's number. It streams incoming messages to the Python backend — but only for tracked clients.

## How it works

Baileys uses `@whiskeysockets/baileys` which connects to WhatsApp via WebSocket (same protocol as WhatsApp Web in a browser). It is **not polling** — WhatsApp pushes events to it in real-time as messages arrive.

```
Baileys connects → WebSocket to WA servers (stays open)
  → WA pushes message event → messages.upsert fires
  → Baileys checks if sender is a tracked client
  → if yes: forward to backend
  → if no:  discard
```

## How tracking works

Baileys has no hardcoded list of numbers. For every message it does a lightweight lookup:

```
Message from +60123456789
  → GET http://backend/clients/exists?number=60123456789
  → { exists: true }  → POST /internal/messages to backend
  → { exists: false } → discard
```

This means:
- Adding a client to Convex automatically enables message capture — no Baileys restart needed
- Removing a client stops future messages from being stored
- Baileys config never changes

## Message handling

Only stores essential fields — no raw blobs:

```js
sock.ev.on('messages.upsert', async ({ messages, type }) => {
  if (type !== 'notify') return   // skip history syncs on startup

  for (const msg of messages) {
    if (!msg.message) continue    // skip system/empty messages

    const phone = msg.key.remoteJid?.replace('@s.whatsapp.net', '')
    const { exists } = await checkIsClient(phone)
    if (!exists) continue

    await postToBackend({
      phone,
      from_me:   msg.key.fromMe,
      timestamp: msg.messageTimestamp,
      text:      msg.message?.conversation
              || msg.message?.extendedTextMessage?.text
              || null,
      type:      resolveMessageType(msg.message)   // "text" | "image" | "audio" | "other"
    })
  }
})
```

## Message fetch — on demand (fetchMessageHistory)

For existing chat history before Baileys was connected, Baileys can request historical messages from WA servers:

```js
// paginated — 50 messages max per call
await sock.fetchMessageHistory(50, oldestMsgKey, oldestMsgTimestamp)
// results arrive via messaging.history-set event (async)
```

- Max 50 per call — must paginate for full history
- Results are async (arrive via event, not return value)
- WA server limit: reliably ~30 days back
- Only needed for initial backfill — not for ongoing capture

## Auto-reconnect

```js
sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'close') {
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    if (shouldReconnect) connect()   // restart automatically
  }
})
```

If the connection drops (network hiccup, WA server restart), Baileys reconnects and WA sends any missed messages on reconnection.

## Session persistence

First run requires a QR scan on the advisor's phone. After that, session credentials are saved to `./auth/` and Baileys auto-reconnects without needing another scan.

## WhatsApp session conflict with OpenClaw

WhatsApp only allows **one Web session per number**. OpenClaw already holds a session on the advisor's number.

**Options:**
1. **OpenClaw `messageReceived` hook** (recommended for hackathon) — enable `pluginHooks.messageReceived: true` in OpenClaw config, write a plugin that forwards messages to the backend. No second service needed.
2. **Dedicated second number** — run Baileys on a separate phone/SIM used only for client tracking.

## Stack

- `@whiskeysockets/baileys` — WhatsApp Web client
- `express` — HTTP server for health check + any internal endpoints
- `node-fetch` or `axios` — POST to Python backend

## Env

```
BACKEND_URL=http://backend:8000
```
