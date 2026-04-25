const { loadData, saveData } = require('../database');

async function antiLink({ sock, from, isGroup, isOwner, args, senderNumber, msg }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  // Check if sender is admin
  const groupMeta = await sock.groupMetadata(from);
  const botId = sock.user?.id?.replace(/:[0-9]+/, '') || '';
  const senderJid = msg.key.participant;
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  const isBotAdmin = groupMeta.participants.some(
    (p) => p.id.includes(botId) && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isAdmin && !isOwner) return reply('❌ Only admins can use this command!');
  if (!isBotAdmin) return reply('❌ Please make me an admin first!');

  const toggle = args[0]?.toLowerCase();
  if (!toggle || !['on', 'off'].includes(toggle)) {
    return reply('❓ Usage: /antilink on | /antilink off');
  }

  const db = loadData();
  if (!db.groups[from]) db.groups[from] = {};
  db.groups[from].antiLink = toggle === 'on';
  saveData(db);

  await reply(
    toggle === 'on'
      ? '🛡️ *Anti-Link ENABLED*\nLinks will now be deleted automatically!'
      : '🔓 *Anti-Link DISABLED*\nLinks are now allowed in this group.'
  );
}

async function antiMention({ sock, from, isGroup, isOwner, args, msg }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  const groupMeta = await sock.groupMetadata(from);
  const botId = sock.user?.id?.replace(/:[0-9]+/, '') || '';
  const senderJid = msg.key.participant;
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  const isBotAdmin = groupMeta.participants.some(
    (p) => p.id.includes(botId) && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isAdmin && !isOwner) return reply('❌ Only admins can use this command!');
  if (!isBotAdmin) return reply('❌ Please make me an admin first!');

  const toggle = args[0]?.toLowerCase();
  if (!toggle || !['on', 'off'].includes(toggle)) {
    return reply('❓ Usage: /antimention on | /antimention off');
  }

  const db = loadData();
  if (!db.groups[from]) db.groups[from] = {};
  db.groups[from].antiMention = toggle === 'on';
  saveData(db);

  await reply(
    toggle === 'on'
      ? '🛡️ *Anti-Mention ENABLED*\nMass mentions will now be blocked!'
      : '🔓 *Anti-Mention DISABLED*\nMentions are now allowed.'
  );
}

async function warn({ sock, from, msg, isGroup, isOwner, args, sender }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  const groupMeta = await sock.groupMetadata(from);
  const botId = sock.user?.id?.replace(/:[0-9]+/, '') || '';
  const senderJid = msg.key.participant;
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  const isBotAdmin = groupMeta.participants.some(
    (p) => p.id.includes(botId) && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isAdmin && !isOwner) return reply('❌ Only admins can use this command!');

  // Get mentioned user
  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);

  if (!mentionedJid) return reply('❓ Usage: /warn @user\n\nMention the user you want to warn.');

  const db = loadData();
  const warnLimit = db.settings.warnLimit || 2;

  if (!db.warnings[from]) db.warnings[from] = {};
  if (!db.warnings[from][mentionedJid]) db.warnings[from][mentionedJid] = 0;

  db.warnings[from][mentionedJid]++;
  const warningCount = db.warnings[from][mentionedJid];
  saveData(db);

  const targetNumber = mentionedJid.replace('@s.whatsapp.net', '');

  if (warningCount >= warnLimit) {
    // Take action
    await sock.sendMessage(from, {
      text: `⚠️ @${targetNumber} has reached the warning limit (${warningCount}/${warnLimit})!\n\n🚫 Taking action...`,
      mentions: [mentionedJid],
    });

    if (isBotAdmin) {
      try {
        await sock.groupParticipantsUpdate(from, [mentionedJid], 'remove');
        await sock.sendMessage(from, {
          text: `✅ @${targetNumber} has been *removed* from the group.`,
          mentions: [mentionedJid],
        });
      } catch {
        await reply(`❌ Could not remove user. Please do it manually.`);
      }
    }

    // Reset warnings after action
    db.warnings[from][mentionedJid] = 0;
    saveData(db);
  } else {
    await sock.sendMessage(from, {
      text: `⚠️ *WARNING ${warningCount}/${warnLimit}*\n\n@${targetNumber} has been warned!\nReason: Violating group rules.\n\n⚠️ ${warnLimit - warningCount} warning(s) remaining before action is taken.`,
      mentions: [mentionedJid],
    });
  }
}

async function unwarn({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  const groupMeta = await sock.groupMetadata(from);
  const senderJid = msg.key.participant;
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isAdmin && !isOwner) return reply('❌ Only admins can use this command!');

  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);

  if (!mentionedJid) return reply('❓ Usage: /unwarn @user');

  const db = loadData();
  if (!db.warnings[from]) db.warnings[from] = {};

  const prev = db.warnings[from][mentionedJid] || 0;
  db.warnings[from][mentionedJid] = 0;
  saveData(db);

  const targetNumber = mentionedJid.replace('@s.whatsapp.net', '');
  await sock.sendMessage(from, {
    text: `✅ Warnings cleared for @${targetNumber}!\n\nPrevious warnings: *${prev}*\nCurrent warnings: *0*`,
    mentions: [mentionedJid],
  });
}

async function checkwarn({ sock, from, msg, isGroup, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);

  if (!mentionedJid) return reply('❓ Usage: /checkwarn @user');

  const db = loadData();
  const warnCount = db.warnings?.[from]?.[mentionedJid] || 0;
  const warnLimit = db.settings.warnLimit || 2;
  const targetNumber = mentionedJid.replace('@s.whatsapp.net', '');

  await sock.sendMessage(from, {
    text: `📊 *WARNING STATUS*\n\n👤 User: @${targetNumber}\n⚠️ Warnings: *${warnCount}/${warnLimit}*\n${warnCount === 0 ? '✅ Clean record' : warnCount >= warnLimit ? '🚫 Limit reached!' : `⚠️ ${warnLimit - warnCount} warning(s) remaining`}`,
    mentions: [mentionedJid],
  });
}

module.exports = { antiLink, antiMention, warn, unwarn, checkwarn };
