require("dotenv").config();
const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { isTrackedClient } = require("./filter");
const { postMessage } = require("./poster");

const app = express();
app.use(express.json());

let sock;

async function connectToWA() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnect:", shouldReconnect);
      if (shouldReconnect) setTimeout(connectToWA, 5000);
    } else if (connection === "open") {
      console.log("WhatsApp connected");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const jid = msg.key.remoteJid || "";
      if (jid.endsWith("@g.us")) continue; // skip groups

      const phoneNumber = jid.replace("@s.whatsapp.net", "");
      const tracked = await isTrackedClient(phoneNumber);
      if (!tracked) continue;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      if (!body) continue;

      const timestamp = new Date(Number(msg.messageTimestamp) * 1000).toISOString();
      await postMessage({ phoneNumber, body, timestamp, direction: "inbound" });
    }
  });
}

connectToWA();

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Baileys service listening on :${PORT}`));
