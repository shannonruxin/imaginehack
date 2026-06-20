# Baileys Service — TODO

## Setup
- [x] `npm init` + install deps (`@whiskeysockets/baileys`, `express`, `axios`, `dotenv`, `pino`)
- [x] `.gitignore` — `auth/`, `node_modules/`, `.env`
- [x] `.env.example`

## Code
- [x] `src/filter.js` — `GET /clients/exists?number=` check
- [x] `src/poster.js` — `POST /internal/messages` + message type resolver
- [x] `src/index.js` — session init, `messages.upsert` handler, auto-reconnect, `GET /health`

## Docker
- [x] `Dockerfile`
- [x] `baileys` service added to root `docker-compose.yml`
- [x] `baileys-auth` named volume added (session persists across restarts)

## First Run
- [ ] Copy `.env.example` → `.env`, set `BACKEND_URL`
- [ ] `docker-compose up baileys` → scan QR with the second number
- [ ] Confirm `auth/` files written to volume (session saved)

## Integration Testing
- [ ] Component 2 stubs ready: `GET /clients/exists?number=` and `POST /internal/messages`
- [ ] Send a message from a tracked client number → confirm it hits the backend
- [ ] Send a message from an untracked number → confirm it is silently discarded
- [ ] Kill the container, restart → confirm no QR re-scan needed
- [ ] Kill the container, restart → confirm missed messages are delivered on reconnect
