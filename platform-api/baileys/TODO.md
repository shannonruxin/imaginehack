# Baileys Service — TODO

## Setup
- [x] `npm init` + install deps (`@whiskeysockets/baileys`, `express`, `axios`, `dotenv`, `pino`)
- [x] `.gitignore` — `auth/`, `node_modules/`, `.env`
- [x] `.env.example`

## Code
- [x] `src/filter.js` — client existence check
- [x] `src/poster.js` — POST to backend + message type resolver
- [x] `src/index.js` — session init, `messages.upsert` handler, auto-reconnect, `GET /health`

## First Run
- [ ] Copy `.env.example` → `.env`, point `BACKEND_URL` at the backend
- [ ] `node src/index.js` → scan QR with the second number
- [ ] Confirm `auth/` files written (session saved, no re-scan on restart)

## Integration Testing
- [ ] Component 2 stubs ready: `GET /clients/exists?number=` and `POST /internal/messages`
- [ ] Send message from a tracked client number → confirm it hits the backend
- [ ] Send message from an untracked number → confirm silent discard
- [ ] Restart process → confirm no QR re-scan needed
