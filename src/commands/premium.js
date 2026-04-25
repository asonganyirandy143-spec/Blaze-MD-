const { loadData, saveData } = require('../database');

async function info({ sock, from }) {
  const db = loadData();
  const premiumCount = Object.keys(db.premiumUsers).length;

  const text = `
💎 *BLAZE MD PREMIUM*

🌟 *Premium Features:*
• 🤖 AI chat with memory
• ⬇️ Advanced downloads
• 💎 Exclusive commands
• ⚡ Priority responses
• 🎯 Custom commands
• 🔥 Premium badge

👥 *Current Premium Users:* ${premiumCount}

💰 *Pricing:*
• 1 Week  → $2.00 💵
• 1 Month → $5.00 💵
• Lifetime → $15.00 💵

Type */buy* to get premium today!

> 🔥 BLAZE MD Premium
  `.trim();

  await sock.sendMessage(from, { text });
}

async function buy({ sock, from }) {
  const text = `
💎 *HOW TO BUY PREMIUM*

1️⃣ Contact the owner: +237676162113 (Randy Blaze ☘️)
2️⃣ Choose your plan:
   • 1 Week  → $2.00
   • 1 Month → $5.00
   • Lifetime → $15.00
3️⃣ Send payment via:
   • M-Pesa 📱
   • PayPal 💳
   • Binance Pay ₿
4️⃣ Send your WhatsApp number
5️⃣ Get activated within 5 minutes ✅

⚡ *After Purchase:*
You'll receive access to all premium features immediately!

Type */premium* to see what's included.

> 💎 BLAZE MD Premium System
  `.trim();

  await sock.sendMessage(from, { text });
}

async function add({ sock, from, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Only the owner can add premium users!');

  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return reply('❓ Usage: /addpremium <number>\nExample: /addpremium 254700000000');

  const db = loadData();
  db.premiumUsers[number] = {
    addedAt: new Date().toISOString(),
    addedBy: 'owner',
    plan: 'premium',
  };
  saveData(db);

  await reply(`✅ *Premium Activated!*\n\n👤 Number: +${number}\n💎 Status: Premium\n📅 Activated: ${new Date().toLocaleDateString()}`);
}

async function remove({ sock, from, isOwner, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!isOwner) return reply('❌ Only the owner can remove premium users!');

  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return reply('❓ Usage: /removepremium <number>');

  const db = loadData();
  if (!db.premiumUsers[number]) {
    return reply(`❌ Number +${number} is not a premium user.`);
  }

  delete db.premiumUsers[number];
  saveData(db);

  await reply(`✅ Premium removed for +${number}`);
}

async function check({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return reply('❓ Usage: /checkpremium <number>');

  const db = loadData();
  const isPremium = !!db.premiumUsers[number];
  const premiumData = db.premiumUsers[number];

  if (isPremium) {
    await reply(
      `💎 *PREMIUM STATUS*\n\n👤 Number: +${number}\n✅ Status: *PREMIUM USER*\n📅 Since: ${new Date(premiumData.addedAt).toLocaleDateString()}\n🎯 Plan: ${premiumData.plan || 'Standard'}`
    );
  } else {
    await reply(
      `📊 *PREMIUM STATUS*\n\n👤 Number: +${number}\n❌ Status: *NOT PREMIUM*\n\nType */buy* to get premium access!`
    );
  }
}

module.exports = { info, buy, add, remove, check };
