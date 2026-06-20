# Baileys (WhatsApp) Setup

## First-time setup

```bash
cd /Users/shannon.chu/Code/imaginehack/platform-api/baileys
npm install
npm install qrcode-terminal
```

## Connect a WhatsApp account

```bash
cd /Users/shannon.chu/Code/imaginehack/platform-api/baileys
node src/index.js
```

A QR code will appear in the terminal. Scan it from WhatsApp: **Settings → Linked Devices → Link a Device**.

Once scanned, the session is saved in `auth/` and future runs will reconnect automatically without showing the QR again.

## Every time after that

```bash
cd /Users/shannon.chu/Code/imaginehack/platform-api/baileys
node src/index.js
```

## How it works

- Listens for inbound WhatsApp messages from tracked phone numbers
- Checks if a number is tracked via `GET /clients/exists` on the platform API
- Forwards matched messages to `POST /internal/messages`
- Runs an Express health check at `http://localhost:3001/health`
