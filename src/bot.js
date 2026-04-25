require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto,
  getContentType,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs-extra');
const { handleMessage } = require('./handler');
const { handleGroupEvents } = require('./groupEvents');
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

async function startBot() {
  const sessionPath = process.env.SESSION_PATH || './session';
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    browser: ['BLAZE MD', 'Chrome', '1.0.0'],
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return proto.Message.fromObject({});
    },
  });

  store.bind(sock.ev);

  // ── Connection Updates ──────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 Scan the QR code above with WhatsApp to connect BLAZE MD\n');
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      } else {
        console.log('🚫 Logged out. Please delete the session folder and restart.');
      }
    }

    if (connection === 'open') {
      console.log('✅ BLAZE MD is now connected to WhatsApp!');
      console.log(`👑 Owner: ${process.env.OWNER_NUMBER}`);
      console.log(`🤖 Bot: ${process.env.BOT_NAME} v${process.env.BOT_VERSION}`);

      // Notify owner on connect
      try {
        const ownerJid = `${process.env.OWNER_NUMBER}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
          text: `✅ *BLAZE MD Connected!*\n\n🤖 Bot: ${process.env.BOT_NAME}\n📦 Version: ${process.env.BOT_VERSION}\n⏰ Time: ${new Date().toLocaleString()}\n\nType /menu to see all commands.`,
        });
      } catch (e) {}
    }
  });

  // ── Save Credentials ────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ── Messages ────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      await handleMessage(sock, msg, store);
    }
  });

  // ── Group Events ────────────────────────────────────────────────
  sock.ev.on('group-participants.update', async (update) => {
    await handleGroupEvents(sock, update);
  });

  return sock;
}

module.exports = { startBot };
