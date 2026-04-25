require('dotenv').config();
const { loadData, saveData } = require('../database');

async function setWarnLimit({ sock, from, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Owner only command!');

  const limit = parseInt(args[0]);
  if (isNaN(limit) || limit < 1 || limit > 10) {
    return reply('❓ Usage: /setwarnlimit <number>\nNumber must be between 1 and 10.');
  }

  const db = loadData();
  db.settings.warnLimit = limit;
  saveData(db);

  await reply(`✅ Warning limit set to *${limit}*\nUsers will be actioned after ${limit} warning(s).`);
}

async function restart({ sock, from, isOwner }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Owner only command!');

  await reply('🔄 *Restarting BLAZE MD...*\n\nBot will be back online shortly!');

  setTimeout(() => {
    console.log('🔄 Bot restart requested by owner.');
    process.exit(0); // Process manager (like pm2) will restart it
  }, 2000);
}

async function shutdown({ sock, from, isOwner }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Owner only command!');

  await reply('🔴 *Shutting down BLAZE MD...*\n\nBot is now offline. Use your server to restart.');

  setTimeout(() => {
    console.log('🔴 Bot shutdown requested by owner.');
    process.exit(1);
  }, 2000);
}

async function setName({ sock, from, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Owner only command!');

  const name = args.join(' ');
  if (!name) return reply('❓ Usage: /setname <new name>');

  try {
    await sock.updateProfileName(name);
    const db = loadData();
    db.settings.botName = name;
    saveData(db);
    await reply(`✅ Bot name updated to: *${name}*`);
  } catch (err) {
    await reply('❌ Failed to update bot name. This may require the bot to be linked as a business account.');
  }
}

async function setBio({ sock, from, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Owner only command!');

  const bio = args.join(' ');
  if (!bio) return reply('❓ Usage: /setbio <new bio text>');

  try {
    await sock.updateProfileStatus(bio);
    await reply(`✅ Bot bio updated to:\n_${bio}_`);
  } catch (err) {
    await reply('❌ Failed to update bot bio.');
  }
}

module.exports = { setWarnLimit, restart, shutdown, setName, setBio };
