require("dotenv").config();
const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const axios = require("axios");
const { isTrackedClient } = require("./filter");
const { postMessage } = require("./poster");
const lidCache = require("./lidCache");

const API_URL = process.env.PLATFORM_API_URL || "http://127.0.0.1:8000";

const app = express();
app.use(express.json());

let sock;

async function seedLidCache() {
  try {
    const resp = await axios.get(`${API_URL}/clients`, { timeout: 10000 });
    const clients = resp.data || [];
    const numbers = clients
      .map(c => c.number?.replace(/^\+/, ""))
      .filter(Boolean);

    console.log(`Seeding LID cache for ${numbers.length} clients...`);
    for (const number of numbers) {
      try {
        const results = await sock.onWhatsApp(`${number}@s.whatsapp.net`);
        for (const r of results || []) {
          if (r.jid?.endsWith("@lid") || r.lid) {
            const lid = r.lid || r.jid;
            lidCache.set(lid, `${number}@s.whatsapp.net`);
            console.log(`Cached: ${lid} -> ${number}`);
          }
        }
      } catch {
        // individual lookup failures are non-fatal
      }
    }
    console.log("LID cache seeded.");
  } catch (err) {
    console.error("Failed to seed LID cache:", err.message);
  }
}

async function connectToWA() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnect:", shouldReconnect);
      if (shouldReconnect) setTimeout(connectToWA, 5000);
    } else if (connection === "open") {
      console.log("WhatsApp connected");
      seedLidCache();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" && type !== "append") return;

    for (const msg of messages) {
      const fromMe = msg.key.fromMe;

      let jid = msg.key.remoteJid || "";

      // resolve LID to real phone JID
      if (jid.endsWith("@lid")) {
        if (fromMe) {
          const cached = lidCache.get(jid);
          if (cached) jid = cached;
          else {
            console.log("Outbound LID not in cache, re-seeding:", jid);
            await seedLidCache();
            const retried = lidCache.get(jid);
            if (retried) jid = retried;
            else { console.log("Still unresolved after re-seed:", jid); continue; }
          }
        } else {
          const senderPn = msg.key.senderPn;
          if (senderPn) {
            lidCache.set(jid, senderPn);
            jid = senderPn;
          } else {
            console.log("No senderPn for inbound LID:", jid);
            continue;
          }
        }
      }

      if (!jid.endsWith("@s.whatsapp.net")) continue;

      const phoneNumber = jid.replace("@s.whatsapp.net", "");
      const tracked = await isTrackedClient(phoneNumber);
      if (!tracked) continue;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      if (!body) continue;

      const direction = fromMe ? "outbound" : "inbound";
      const timestamp = new Date(Number(msg.messageTimestamp) * 1000).toISOString();
      console.log(`Posting ${direction} message:`, phoneNumber, body);
      await postMessage({ phoneNumber, body, timestamp, direction });
    }
  });
}

connectToWA();

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Baileys service listening on :${PORT}`));
