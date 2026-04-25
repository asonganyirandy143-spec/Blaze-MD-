const { loadData } = require('./database');

async function handleGroupEvents(sock, update) {
  try {
    const { id: groupId, participants, action } = update;
    const db = loadData();
    const groupSettings = db.groups?.[groupId] || {};

    const groupMeta = await sock.groupMetadata(groupId).catch(() => null);
    if (!groupMeta) return;

    const groupName = groupMeta.name || 'this group';

    for (const participant of participants) {
      const number = participant.replace('@s.whatsapp.net', '');

      if (action === 'add' && groupSettings.welcome) {
        const welcomeText = `
👋 *Welcome to ${groupName}!*

🎉 Say hello to @${number}!

📜 Please read the group rules by typing */rules*
🤖 Type */menu* to see all bot commands
💎 Want premium features? Type */premium*

> 🔥 Powered by BLAZE MD
        `.trim();

        await sock.sendMessage(groupId, {
          text: welcomeText,
          mentions: [participant],
        });
      }

      if (action === 'remove' && groupSettings.goodbye) {
        const goodbyeText = `
👋 *Goodbye @${number}!*

😢 We'll miss you. Hope to see you again!

> 🔥 BLAZE MD
        `.trim();

        await sock.sendMessage(groupId, {
          text: goodbyeText,
          mentions: [participant],
        });
      }

      if (action === 'promote') {
        await sock.sendMessage(groupId, {
          text: `🎉 Congratulations @${number}! You've been promoted to *Admin*! 👑`,
          mentions: [participant],
        });
      }

      if (action === 'demote') {
        await sock.sendMessage(groupId, {
          text: `ℹ️ @${number} has been removed from admin.`,
          mentions: [participant],
        });
      }
    }
  } catch (err) {
    console.error('Group event error:', err);
  }
}

module.exports = { handleGroupEvents };
