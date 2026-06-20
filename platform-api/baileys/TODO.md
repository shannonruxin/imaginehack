# Baileys Service — TODO

## Setup
- [x] `npm init` + install deps (`@whiskeysockets/baileys`, `express`, `axios`, `dotenv`, `pino`, `qrcode-terminal`)
- [x] `.gitignore` — `auth/`, `node_modules/`, `.env`
- [x] `.env` — `BACKEND_URL`, `PORT`

## Code
- [x] `src/filter.js` — client existence check against backend
- [x] `src/poster.js` — POST to backend + message type resolver
- [x] `src/index.js` — session init, `messages.upsert` handler, auto-reconnect, `GET /health`

## First Run
- [x] Run `node --use-system-ca src/index.js` (flag required for corporate SSL proxy)
- [x] Scanned QR with +601162687670 — session saved to `auth/`
- [x] Confirmed connected: `✅ Connected to WhatsApp`
- [x] Confirmed message capture: inbound + outbound texts with content logged
- [ ] Confirm no QR re-scan needed on restart

## Known Issues
- Baileys v7 uses `@lid` JIDs (internal WA linked-device IDs) instead of `@s.whatsapp.net` — phone number extracted is the LID numeric ID, not the real E.164 number (e.g. `601XXXXXXX`). Needs resolution via contact store for production use.

## Integration Testing (blocked on Component 2)
- [ ] Component 2 stubs ready: `GET /clients/exists?number=` and `POST /internal/messages`
- [ ] Send message from a tracked client number → confirm it hits the backend
- [ ] Send message from an untracked number → confirm silent discard
- [ ] Restart process → confirm no QR re-scan needed
