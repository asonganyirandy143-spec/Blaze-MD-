const { loadData, saveData } = require('../database');

async function autoReply({ sock, from, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Only the owner can toggle auto reply!');

  const toggle = args[0]?.toLowerCase();
  if (!toggle || !['on', 'off'].includes(toggle)) {
    return reply('❓ Usage: /autoreply on | /autoreply off');
  }

  const db = loadData();
  db.settings.autoReply = toggle === 'on';
  saveData(db);

  await reply(
    toggle === 'on'
      ? '🔁 *Auto Reply ENABLED*\n\nWhen someone DMs the bot, they\'ll receive:\n"⚠️ Randy Blaze is currently offline. Please wait or try later."'
      : '🔕 *Auto Reply DISABLED*\n\nThe bot will no longer auto-reply to DMs.'
  );
}

async function aiToggle({ sock, from, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Only the owner can toggle AI!');

  const toggle = args[0]?.toLowerCase();
  if (!toggle || !['on', 'off'].includes(toggle)) {
    return reply('❓ Usage: /ai on | /ai off');
  }

  const db = loadData();
  db.settings.aiEnabled = toggle === 'on';
  saveData(db);

  await reply(
    toggle === 'on'
      ? '🤖 *AI System ENABLED*\n\nUsers can now use */chat <message>* to talk to AI!'
      : '🔴 *AI System DISABLED*\n\nAI chat is now turned off.'
  );
}

module.exports = { autoReply, aiToggle };
