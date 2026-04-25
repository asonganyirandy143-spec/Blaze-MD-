const { loadData, saveData } = require('../database');

// Helper to check if bot and sender are admin
async function checkAdminPerms(sock, from, senderJid) {
  const groupMeta = await sock.groupMetadata(from);
  const botId = sock.user?.id?.replace(/:[0-9]+/, '') || '';
  const isBotAdmin = groupMeta.participants.some(
    (p) => p.id.includes(botId) && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  const isAdmin = groupMeta.participants.some(
    (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  return { isBotAdmin, isAdmin, groupMeta };
}

// /kick @user — Remove a user from the group
async function kick({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can kick users!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
  if (!mentionedJid) return reply('❓ Usage: /kick @user');

  const number = mentionedJid.replace('@s.whatsapp.net', '');
  try {
    await sock.groupParticipantsUpdate(from, [mentionedJid], 'remove');
    await sock.sendMessage(from, {
      text: `✅ @${number} has been *kicked* from the group! 👢`,
      mentions: [mentionedJid],
    });
  } catch {
    await reply('❌ Failed to kick user.');
  }
}

// /mute — Mute the group (only admins can send messages)
async function mute({ sock, from, msg, isGroup, isOwner }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can mute the group!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  try {
    await sock.groupSettingUpdate(from, 'announcement');
    await reply('🔇 *Group Muted!*\nOnly admins can send messages now.');
  } catch {
    await reply('❌ Failed to mute group.');
  }
}

// /unmute — Unmute the group (everyone can send messages)
async function unmute({ sock, from, msg, isGroup, isOwner }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can unmute the group!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  try {
    await sock.groupSettingUpdate(from, 'not_announcement');
    await reply('🔊 *Group Unmuted!*\nEveryone can now send messages.');
  } catch {
    await reply('❌ Failed to unmute group.');
  }
}

// /ban @user — Ban a user (kick + add to ban list)
async function ban({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can ban users!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
  if (!mentionedJid) return reply('❓ Usage: /ban @user');

  const number = mentionedJid.replace('@s.whatsapp.net', '');
  const db = loadData();
  if (!db.bannedUsers) db.bannedUsers = {};
  if (!db.bannedUsers[from]) db.bannedUsers[from] = [];
  if (!db.bannedUsers[from].includes(mentionedJid)) {
    db.bannedUsers[from].push(mentionedJid);
    saveData(db);
  }

  try {
    await sock.groupParticipantsUpdate(from, [mentionedJid], 'remove');
    await sock.sendMessage(from, {
      text: `🚫 @${number} has been *banned* from the group!\n\nThey cannot rejoin unless unbanned.`,
      mentions: [mentionedJid],
    });
  } catch {
    await reply(`✅ @${number} added to ban list (could not kick — may have already left).`);
  }
}

// /unban @user — Remove user from ban list
async function unban({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can unban users!');

  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return reply('❓ Usage: /unban <number>');

  const jid = `${number}@s.whatsapp.net`;
  const db = loadData();
  if (!db.bannedUsers?.[from]) return reply(`❌ +${number} is not banned.`);

  db.bannedUsers[from] = db.bannedUsers[from].filter((u) => u !== jid);
  saveData(db);
  await reply(`✅ @${number} has been *unbanned*! They can now rejoin the group.`);
}

// /promote @user — Make user an admin
async function promote({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can promote users!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
  if (!mentionedJid) return reply('❓ Usage: /promote @user');

  const number = mentionedJid.replace('@s.whatsapp.net', '');
  try {
    await sock.groupParticipantsUpdate(from, [mentionedJid], 'promote');
    await sock.sendMessage(from, {
      text: `👑 @${number} has been *promoted to Admin*! Congratulations! 🎉`,
      mentions: [mentionedJid],
    });
  } catch {
    await reply('❌ Failed to promote user.');
  }
}

// /demote @user — Remove admin from user
async function demote({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can demote users!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
  if (!mentionedJid) return reply('❓ Usage: /demote @user');

  const number = mentionedJid.replace('@s.whatsapp.net', '');
  try {
    await sock.groupParticipantsUpdate(from, [mentionedJid], 'demote');
    await sock.sendMessage(from, {
      text: `⬇️ @${number} has been *demoted* from Admin.`,
      mentions: [mentionedJid],
    });
  } catch {
    await reply('❌ Failed to demote user.');
  }
}

// /tagall — Tag all members in the group
async function tagall({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can tag all members!');

  const groupMeta = await sock.groupMetadata(from);
  const members = groupMeta.participants.map((p) => p.id);
  const customMsg = args.join(' ') || '📢 Attention everyone!';

  const mentions = members.map((jid) => `@${jid.replace('@s.whatsapp.net', '')}`).join(' ');
  await sock.sendMessage(from, {
    text: `📢 *${customMsg}*\n\n${mentions}`,
    mentions: members,
  });
}

// /hidetag <message> — Tag all but mentions are hidden
async function hidetag({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can use hidetag!');

  const groupMeta = await sock.groupMetadata(from);
  const members = groupMeta.participants.map((p) => p.id);
  const customMsg = args.join(' ') || '📢 Important message!';

  await sock.sendMessage(from, {
    text: customMsg,
    mentions: members,
  });
}

// /poll <question> | <option1> | <option2> — Create a poll
async function poll({ sock, from, isGroup, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const input = args.join(' ');
  const parts = input.split('|').map((p) => p.trim());

  if (parts.length < 3) {
    return reply('❓ Usage: /poll Question | Option1 | Option2 | Option3\n\nExample:\n/poll Favorite color? | Red | Blue | Green');
  }

  const question = parts[0];
  const options = parts.slice(1);

  try {
    await sock.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1,
      },
    });
  } catch {
    // Fallback text poll
    const optionsList = options.map((o, i) => `${['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣'][i] || `${i+1}.`} ${o}`).join('\n');
    await reply(`📊 *POLL*\n\n❓ ${question}\n\n${optionsList}\n\nReact with the number to vote!`);
  }
}

// /grouplink — Get the group invite link
async function grouplink({ sock, from, msg, isGroup, isOwner }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can get the group link!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  try {
    const code = await sock.groupInviteCode(from);
    await reply(`🔗 *Group Invite Link:*\n\nhttps://chat.whatsapp.com/${code}\n\n⚠️ Share carefully!`);
  } catch {
    await reply('❌ Failed to get group link.');
  }
}

// /revoke — Reset the group invite link
async function revoke({ sock, from, msg, isGroup, isOwner }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can revoke the group link!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  try {
    await sock.groupRevokeInvite(from);
    await reply('✅ *Group link revoked!*\nThe old link no longer works. Use /grouplink to get the new one.');
  } catch {
    await reply('❌ Failed to revoke group link.');
  }
}

// /setgroupname <name> — Change group name
async function setgroupname({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can change group name!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  const name = args.join(' ');
  if (!name) return reply('❓ Usage: /setgroupname <new name>');

  try {
    await sock.groupUpdateSubject(from, name);
    await reply(`✅ Group name changed to: *${name}*`);
  } catch {
    await reply('❌ Failed to change group name.');
  }
}

// /setgroupdesc <text> — Change group description
async function setgroupdesc({ sock, from, msg, isGroup, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const senderJid = msg.key.participant;
  const { isBotAdmin, isAdmin } = await checkAdminPerms(sock, from, senderJid);
  if (!isAdmin && !isOwner) return reply('❌ Only admins can change group description!');
  if (!isBotAdmin) return reply('❌ Make me an admin first!');

  const desc = args.join(' ');
  if (!desc) return reply('❓ Usage: /setgroupdesc <description>');

  try {
    await sock.groupUpdateDescription(from, desc);
    await reply(`✅ Group description updated!`);
  } catch {
    await reply('❌ Failed to update description.');
  }
}

// /listmembers — List all group members
async function listmembers({ sock, from, isGroup }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (!isGroup) return reply('❌ This command only works in groups!');

  const groupMeta = await sock.groupMetadata(from);
  const members = groupMeta.participants;
  const total = members.length;

  const adminList = members
    .filter((m) => m.admin)
    .map((m) => `👑 +${m.id.replace('@s.whatsapp.net', '')}`)
    .join('\n');

  const memberList = members
    .filter((m) => !m.admin)
    .map((m) => `👤 +${m.id.replace('@s.whatsapp.net', '')}`)
    .join('\n');

  await reply(`👥 *GROUP MEMBERS (${total})*\n\n*Admins:*\n${adminList || 'None'}\n\n*Members:*\n${memberList || 'None'}`);
}

module.exports = {
  kick, mute, unmute, ban, unban, promote, demote,
  tagall, hidetag, poll, grouplink, revoke,
  setgroupname, setgroupdesc, listmembers
};
