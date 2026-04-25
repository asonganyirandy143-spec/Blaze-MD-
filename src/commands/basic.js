require('dotenv').config();

const BOT_NAME = process.env.BOT_NAME || 'BLAZE MD';
const VERSION = process.env.BOT_VERSION || '1.0.0';
const PREFIX = process.env.PREFIX || '/';

async function menu({ sock, from }) {
  const menuText = `
╔══════════════════════════════╗
║      🔥 *BLAZE MD* 🔥        ║
║  👑 Owner: Randy Blaze ☘️    ║
║  📦 Version: ${VERSION}          ║
╚══════════════════════════════╝

📌 *BASIC COMMANDS*
├ ${PREFIX}menu - Show this menu
├ ${PREFIX}help - Help guide
├ ${PREFIX}ping - Check bot speed
├ ${PREFIX}info - Bot information
└ ${PREFIX}rules - Group rules

🎭 *FUN COMMANDS*
├ ${PREFIX}anime - Random anime info
├ ${PREFIX}meme - Random meme
└ ${PREFIX}joke - Random joke

🎮 *GAMES & ENTERTAINMENT*
├ ${PREFIX}8ball <question> - Magic 8 ball
├ ${PREFIX}truth - Truth question
├ ${PREFIX}dare - Dare challenge
├ ${PREFIX}roast @user - Funny roast
├ ${PREFIX}compliment @user - Nice compliment
├ ${PREFIX}quote - Inspirational quote
├ ${PREFIX}fact - Random fun fact
├ ${PREFIX}riddle - Brain teaser
├ ${PREFIX}ship @user1 @user2 - Love meter
├ ${PREFIX}randomcolor - Random color
└ ${PREFIX}wyr - Would you rather?

🛠️ *UTILITY COMMANDS*
├ ${PREFIX}weather <city> - Weather info
├ ${PREFIX}calc <expression> - Calculator
├ ${PREFIX}time <city> - World time
├ ${PREFIX}define <word> - Dictionary
├ ${PREFIX}wiki <topic> - Wikipedia search
├ ${PREFIX}translate <lang> <text> - Translate
├ ${PREFIX}currency <amt> <from> <to> - Convert
├ ${PREFIX}qr <text> - Generate QR code
├ ${PREFIX}shorten <url> - Shorten link
├ ${PREFIX}ip <address> - IP lookup
└ ${PREFIX}news - Latest headlines

📸 *MEDIA COMMANDS*
├ ${PREFIX}tts <text> - Text to speech
├ ${PREFIX}spotify <song> - Search music
├ ${PREFIX}github <username> - GitHub profile
├ ${PREFIX}cat - Random cat image
├ ${PREFIX}dog - Random dog image
├ ${PREFIX}wallpaper <query> - Wallpaper
├ ${PREFIX}ss <url> - Screenshot website
└ ${PREFIX}avatar @user - Profile picture

🔁 *AUTO REPLY*
└ ${PREFIX}autoreply on/off

🛡️ *SECURITY*
├ ${PREFIX}antilink on/off
├ ${PREFIX}antimention on/off
├ ${PREFIX}warn @user
├ ${PREFIX}unwarn @user
└ ${PREFIX}checkwarn @user

🔨 *MODERATION*
├ ${PREFIX}kick @user - Kick user
├ ${PREFIX}ban @user - Ban user
├ ${PREFIX}unban <number> - Unban user
├ ${PREFIX}mute - Mute group
├ ${PREFIX}unmute - Unmute group
├ ${PREFIX}promote @user - Make admin
├ ${PREFIX}demote @user - Remove admin
├ ${PREFIX}tagall <message> - Tag everyone
├ ${PREFIX}hidetag <message> - Silent tag all
├ ${PREFIX}poll Q|A|B|C - Create poll
├ ${PREFIX}grouplink - Get invite link
├ ${PREFIX}revoke - Reset invite link
├ ${PREFIX}setgroupname <name> - Set group name
├ ${PREFIX}setgroupdesc <text> - Set group desc
└ ${PREFIX}listmembers - List all members

💎 *PREMIUM*
├ ${PREFIX}premium - Premium info
├ ${PREFIX}buy - How to buy
├ ${PREFIX}addpremium <number> - Add (owner)
├ ${PREFIX}removepremium <number> - Remove (owner)
└ ${PREFIX}checkpremium <number> - Check status

🤖 *AI SYSTEM*
├ ${PREFIX}chat <message> - Talk to AI
└ ${PREFIX}ai on/off - Toggle AI

📦 *UPDATES*
├ ${PREFIX}update - Check updates
└ ${PREFIX}updatelog - Update history

👥 *GROUP MANAGEMENT*
├ ${PREFIX}welcome on/off
├ ${PREFIX}goodbye on/off
└ ${PREFIX}admin add/remove <number>

👑 *OWNER ONLY*
├ ${PREFIX}setwarnlimit <number>
├ ${PREFIX}restart - Restart bot
├ ${PREFIX}shutdown - Stop bot
├ ${PREFIX}setname <name> - Set bot name
└ ${PREFIX}setbio <text> - Set bot bio

> 🔥 *BLAZE MD* — Total Commands: *80+*
> 👑 Owner: Randy Blaze ☘️ | +237676162113
`;
  await sock.sendMessage(from, { text: menuText.trim() });
}

async function help({ sock, from }) {
  const helpText = `
📖 *BLAZE MD - HELP GUIDE*

*How to use commands:*
All commands start with the prefix *${PREFIX}*

*Examples:*
• ${PREFIX}ping → Check if bot is online
• ${PREFIX}warn @John → Warn a user
• ${PREFIX}chat Hello! → Talk to AI
• ${PREFIX}weather Douala → Get weather
• ${PREFIX}calc 25 * 4 → Calculate math
• ${PREFIX}translate french Hello → Translate
• ${PREFIX}currency 5000 XAF USD → Convert money
• ${PREFIX}8ball Will I be rich? → Magic 8 ball
• ${PREFIX}ship @user1 @user2 → Love meter
• ${PREFIX}ban @user → Ban from group
• ${PREFIX}tagall Good morning! → Tag everyone

*Warning System:*
• Users get up to 2 warnings (adjustable)
• After limit → auto kicked from group
• Admins can reset with ${PREFIX}unwarn

*Premium Features:*
• 🤖 AI chat with memory
• ⬇️ Advanced downloads
• 💎 Exclusive commands

*Tips:*
• Bot must be admin for group commands
• Use ${PREFIX}menu to see all commands
• Contact owner for premium: +237676162113

> 👑 Owner: Randy Blaze ☘️
> 🤖 ${BOT_NAME} v${VERSION}
`;
  await sock.sendMessage(from, { text: helpText.trim() });
}

async function ping({ sock, from }) {
  const start = Date.now();
  await sock.sendMessage(from, { text: '🏓 Pinging...' });
  const end = Date.now();
  const latency = end - start;
  const speed = latency > 1000 ? 'Slow 🐢' : latency > 500 ? 'Moderate 🚶' : 'Fast ⚡';

  await sock.sendMessage(from, {
    text: `🏓 *Pong!*\n\n⏱️ Response: *${latency}ms*\n🚀 Speed: *${speed}*\n🤖 Status: *Online ✅*`,
  });
}

async function info({ sock, from }) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  await sock.sendMessage(from, {
    text: `🤖 *${BOT_NAME} - BOT INFO*

📛 Name: *${BOT_NAME}*
📦 Version: *${VERSION}*
👑 Owner: *Randy Blaze ☘️*
📱 Contact: *+237676162113*
⏰ Uptime: *${hours}h ${minutes}m ${seconds}s*
🖥️ Platform: *Node.js ${process.version}*
💾 Memory: *${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB*
🌐 Library: *@whiskeysockets/baileys*
🎯 Total Commands: *80+*

✨ *Features:*
• 🛡️ Security & Moderation
• 🤖 AI Chat System
• 💎 Premium System
• 🎮 Games & Fun
• 🛠️ Utility Tools
• 📸 Media Commands
• 👥 Group Management

> 🔥 Built with ❤️ by Randy Blaze ☘️`.trim(),
  });
}

async function rules({ sock, from }) {
  await sock.sendMessage(from, {
    text: `📜 *GROUP RULES*

1️⃣ Be respectful to all members.
2️⃣ No spamming or flooding.
3️⃣ No sharing links without permission.
4️⃣ No mass mentioning members.
5️⃣ No adult or offensive content.
6️⃣ No hate speech or discrimination.
7️⃣ Follow admin instructions.
8️⃣ No advertising without approval.
9️⃣ No impersonating other members.
🔟 Keep conversations on topic.

⚠️ *Consequences:*
• 1st offense → ⚠️ Warning
• 2nd offense → ⚠️ Final Warning
• 3rd offense → 🚫 Kick/Ban

> 🛡️ Enforced by ${BOT_NAME}
> 👑 Randy Blaze ☘️`.trim(),
  });
}

module.exports = { menu, help, ping, info, rules };
