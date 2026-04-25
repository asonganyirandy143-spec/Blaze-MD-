const { loadData, saveData } = require('../database');

async function welcome({ sock, from, isGroup, isOwner, args, msg }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  const groupMeta = await sock.groupMetadata(from);
  const senderJid = msg.key.participant;
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isAdmin && !isOwner) return reply('❌ Only admins can use this command!');

  const toggle = args[0]?.toLowerCase();
  if (!toggle || !['on', 'off'].includes(toggle)) {
    return reply('❓ Usage: /welcome on | /welcome off');
  }

  const db = loadData();
  if (!db.groups[from]) db.groups[from] = {};
  db.groups[from].welcome = toggle === 'on';
  saveData(db);

  await reply(
    toggle === 'on'
      ? '👋 *Welcome Message ENABLED*\nNew members will be greeted!'
      : '🔕 *Welcome Message DISABLED*'
  );
}

async function goodbye({ sock, from, isGroup, isOwner, args, msg }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  const groupMeta = await sock.groupMetadata(from);
  const senderJid = msg.key.participant;
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isAdmin && !isOwner) return reply('❌ Only admins can use this command!');

  const toggle = args[0]?.toLowerCase();
  if (!toggle || !['on', 'off'].includes(toggle)) {
    return reply('❓ Usage: /goodbye on | /goodbye off');
  }

  const db = loadData();
  if (!db.groups[from]) db.groups[from] = {};
  db.groups[from].goodbye = toggle === 'on';
  saveData(db);

  await reply(
    toggle === 'on'
      ? '👋 *Goodbye Message ENABLED*\nMembers who leave will get a farewell!'
      : '🔕 *Goodbye Message DISABLED*'
  );
}

async function admin({ sock, from, isGroup, isOwner, args, msg }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isGroup) return reply('❌ This command only works in groups!');

  const groupMeta = await sock.groupMetadata(from);
  const botId = sock.user?.id?.replace(/:[0-9]+/, '') || '';
  const senderJid = msg.key.participant;
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && p.admin === 'superadmin'
  );
  const isBotAdmin = groupMeta.participants.some(
    (p) => p.id.includes(botId) && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isAdmin && !isOwner) return reply('❌ Only the group creator can manage admins!');
  if (!isBotAdmin) return reply('❌ Please make me an admin first!');

  const action = args[0]?.toLowerCase();
  const number = args[1]?.replace(/[^0-9]/g, '');

  if (!action || !number || !['add', 'remove'].includes(action)) {
    return reply('❓ Usage: /admin add <number> | /admin remove <number>');
  }

  const targetJid = `${number}@s.whatsapp.net`;
  const inGroup = groupMeta.participants.some((p) => p.id === targetJid);

  if (!inGroup) return reply(`❌ +${number} is not in this group!`);

  try {
    await sock.groupParticipantsUpdate(
      from,
      [targetJid],
      action === 'add' ? 'promote' : 'demote'
    );
    await reply(
      action === 'add'
        ? `✅ @${number} has been *promoted to admin*! 👑`
        : `✅ @${number} has been *removed from admins*.`
    );
  } catch (err) {
    await reply('❌ Failed to update admin status. Make sure I have the right permissions.');
  }
}

module.exports = { welcome, goodbye, admin };
