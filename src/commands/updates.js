const { loadData } = require('../database');
const pkg = require('../../package.json');

async function check({ sock, from }) {
  const currentVersion = pkg.version;
  const text = `
📦 *UPDATE CHECK*

🤖 Bot: *BLAZE MD*
📌 Current Version: *v${currentVersion}*
✅ Status: *Up to date*
📅 Last Checked: *${new Date().toLocaleDateString()}*

> To see what changed, use */updatelog*
  `.trim();

  await sock.sendMessage(from, { text });
}

async function log({ sock, from }) {
  const db = loadData();
  const logs = db.updateLog || [];

  if (logs.length === 0) {
    return sock.sendMessage(from, { text: '📋 No update logs found.' });
  }

  const logText = logs
    .slice()
    .reverse()
    .map((entry) => `📦 *v${entry.version}* (${entry.date})\n   ↳ ${entry.notes}`)
    .join('\n\n');

  await sock.sendMessage(from, {
    text: `📋 *UPDATE LOG*\n\n${logText}\n\n> 🔥 BLAZE MD`,
  });
}

module.exports = { check, log };
