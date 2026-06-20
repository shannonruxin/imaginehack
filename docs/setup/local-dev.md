# Local Dev Setup

Three services need to run at the same time: the Convex frontend, the Python backend, and the Baileys WhatsApp bridge.

---

## 1. Convex + Frontend

```bash
cd /Users/shannon.chu/Code/imaginehack
npm install
npx convex dev   # terminal 1 — keeps Convex functions in sync
npm run dev      # terminal 2 — Next.js frontend at http://localhost:3000
```

---

## 2. Python Backend (platform API)

Handles business logic, Convex writes, and LLM calls. Runs at `:8000`.

**First-time setup:**
```bash
cd /Users/shannon.chu/Code/imaginehack/platform-api/backend
pip install -r requirements.txt
```

**Create `.env`** (copy from root `.env` — Convex credentials are already there):
```
CONVEX_URL=https://diligent-parakeet-812.convex.cloud
CONVEX_DEPLOY_KEY=dev:diligent-parakeet-812|eyJ2MiI6ImVmZDgzOWUzMDA4MDQ3MGM4ZmE0ODg0NmMxNmZhOThiIn0=
```

**Start:**
```bash
uvicorn main:app --port 8000   # terminal 3
```

The backend must be running for Baileys to forward messages into the database.

---

## 3. Baileys (WhatsApp bridge)

Listens for inbound WhatsApp messages from tracked clients and forwards them to the backend.

**First-time setup:**
```bash
cd /Users/shannon.chu/Code/imaginehack/platform-api/baileys
npm install
npm install qrcode-terminal
```

> If `npm install` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (corporate VPN/proxy), run:
> ```bash
> npm config set strict-ssl false && npm install
> ```

**Start:**
```bash
node src/index.js   # terminal 4
```

On first run, a QR code prints in the terminal. Scan it from WhatsApp: **Settings → Linked Devices → Link a Device**.

Once scanned, the session is saved in `auth/` — future runs reconnect automatically without showing the QR again.

---

## Summary

| Terminal | Command | Purpose |
|----------|---------|---------|
| 1 | `npx convex dev` | Sync Convex functions |
| 2 | `npm run dev` | Next.js frontend |
| 3 | `uvicorn main:app --port 8000` | Python backend |
| 4 | `node src/index.js` | Baileys WhatsApp bridge |
