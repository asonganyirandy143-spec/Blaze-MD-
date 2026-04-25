require('dotenv').config();
const { getContentType } = require('@whiskeysockets/baileys');
const { loadData, saveData } = require('./database');
const commands = require('./commands');

const PREFIX = process.env.PREFIX || '/';

async function handleMessage(sock, msg, store) {
  try {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? msg.key.participant : msg.key.remoteJid;
    const senderNumber = sender?.replace(/[^0-9]/g, '');
    const ownerNumber = process.env.OWNER_NUMBER;
    const isOwner = senderNumber === ownerNumber;
    const botNumber = sock.user?.id?.replace(/:[0-9]+/, '') || '';
    const isBot = sender?.includes(botNumber);

    if (isBot) return;

    const type = getContentType(msg.message);
    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      '';

    const db = loadData();

    // ── Auto Reply ──────────────────────────────────────────────
    if (!isGroup && db.settings.autoReply && !isOwner) {
      const lastReplied = db.autoReplyTracker?.[senderNumber];
      const now = Date.now();
      if (!lastReplied || now - lastReplied > 10 * 60 * 1000) {
        await sock.sendMessage(from, {
          text: '⚠️ Randy Blaze is currently offline. Please wait or try later.',
        });
        if (!db.autoReplyTracker) db.autoReplyTracker = {};
        db.autoReplyTracker[senderNumber] = now;
        saveData(db);
      }
    }

    // ── Anti-Link ───────────────────────────────────────────────
    if (isGroup && db.groups?.[from]?.antiLink) {
      const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi;
      if (linkRegex.test(body)) {
        const groupMeta = await sock.groupMetadata(from);
        const botIsAdmin = groupMeta.participants.some(
          (p) => p.id.includes(botNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
        );
        const senderIsAdmin = groupMeta.participants.some(
          (p) => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        );
        if (botIsAdmin && !senderIsAdmin) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.sendMessage(from, {
            text: `🚫 @${senderNumber} Links are not allowed in this group!`,
            mentions: [sender],
          });
        }
      }
    }

    // ── Anti-Mention ────────────────────────────────────────────
    if (isGroup && db.groups?.[from]?.antiMention) {
      const mentionCount = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).length;
      if (mentionCount > 5) {
        const groupMeta = await sock.groupMetadata(from);
        const botIsAdmin = groupMeta.participants.some(
          (p) => p.id.includes(botNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
        );
        const senderIsAdmin = groupMeta.participants.some(
          (p) => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        );
        if (botIsAdmin && !senderIsAdmin) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.sendMessage(from, {
            text: `🚫 @${senderNumber} Mass mentions are not allowed!`,
            mentions: [sender],
          });
        }
      }
    }

    // ── AI Auto-Chat ────────────────────────────────────────────
    if (!body.startsWith(PREFIX) && db.settings.aiEnabled && !isGroup) {
      const aiReply = await commands.ai.chat(body, senderNumber);
      if (aiReply) {
        await sock.sendMessage(from, { text: aiReply });
        return;
      }
    }

    if (!body.startsWith(PREFIX)) return;

    const args = body.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    const ctx = { sock, msg, from, sender, senderNumber, isOwner, isGroup, args, body, db, store };

    await routeCommand(command, args, ctx);
  } catch (err) {
    console.error('Handler error:', err);
  }
}

async function routeCommand(command, args, ctx) {
  const { sock, from } = ctx;
  const reply = async (text) => sock.sendMessage(from, { text });

  try {
    switch (command) {

      // ── BASIC ────────────────────────────────────────────────────
      case 'menu':           return await commands.basic.menu(ctx);
      case 'help':           return await commands.basic.help(ctx);
      case 'ping':           return await commands.basic.ping(ctx);
      case 'info':           return await commands.basic.info(ctx);
      case 'rules':          return await commands.basic.rules(ctx);

      // ── FUN ──────────────────────────────────────────────────────
      case 'meme':           return await commands.fun.meme(ctx);
      case 'joke':           return await commands.fun.joke(ctx);
      case 'anime':          return await commands.fun.anime(ctx);

      // ── GAMES ────────────────────────────────────────────────────
      case '8ball':          return await commands.games.eightball(ctx);
      case 'truth':          return await commands.games.truth(ctx);
      case 'dare':           return await commands.games.dare(ctx);
      case 'roast':          return await commands.games.roast(ctx);
      case 'compliment':     return await commands.games.compliment(ctx);
      case 'quote':          return await commands.games.quote(ctx);
      case 'fact':           return await commands.games.fact(ctx);
      case 'riddle':         return await commands.games.riddle(ctx);
      case 'ship':           return await commands.games.ship(ctx);
      case 'randomcolor':    return await commands.games.randomcolor(ctx);
      case 'wyr':            return await commands.games.wyr(ctx);

      // ── UTILITY ──────────────────────────────────────────────────
      case 'weather':        return await commands.utility.weather(ctx);
      case 'calculate':
      case 'calc':           return await commands.utility.calculate(ctx);
      case 'time':           return await commands.utility.time(ctx);
      case 'define':         return await commands.utility.define(ctx);
      case 'wiki':           return await commands.utility.wiki(ctx);
      case 'translate':      return await commands.utility.translate(ctx);
      case 'currency':       return await commands.utility.currency(ctx);
      case 'qr':             return await commands.utility.qr(ctx);
      case 'shorten':        return await commands.utility.shorten(ctx);
      case 'ip':             return await commands.utility.ip(ctx);
      case 'news':           return await commands.utility.news(ctx);

      // ── MEDIA ────────────────────────────────────────────────────
      case 'tts':            return await commands.media.tts(ctx);
      case 'spotify':        return await commands.media.spotify(ctx);
      case 'github':         return await commands.media.github(ctx);
      case 'cat':            return await commands.media.cat(ctx);
      case 'dog':            return await commands.media.dog(ctx);
      case 'wallpaper':      return await commands.media.wallpaper(ctx);
      case 'ss':             return await commands.media.ss(ctx);
      case 'avatar':         return await commands.media.avatar(ctx);
      case 'sticker':       return await commands.media.sticker(ctx);
      case 'toimg':         return await commands.media.toimg(ctx);

      // ── MODERATION ───────────────────────────────────────────────
      case 'kick':           return await commands.moderation.kick(ctx);
      case 'mute':           return await commands.moderation.mute(ctx);
      case 'unmute':         return await commands.moderation.unmute(ctx);
      case 'ban':            return await commands.moderation.ban(ctx);
      case 'unban':          return await commands.moderation.unban(ctx);
      case 'promote':        return await commands.moderation.promote(ctx);
      case 'demote':         return await commands.moderation.demote(ctx);
      case 'tagall':         return await commands.moderation.tagall(ctx);
      case 'hidetag':        return await commands.moderation.hidetag(ctx);
      case 'poll':           return await commands.moderation.poll(ctx);
      case 'grouplink':      return await commands.moderation.grouplink(ctx);
      case 'revoke':         return await commands.moderation.revoke(ctx);
      case 'setgroupname':   return await commands.moderation.setgroupname(ctx);
      case 'setgroupdesc':   return await commands.moderation.setgroupdesc(ctx);
      case 'listmembers':    return await commands.moderation.listmembers(ctx);

      // ── AUTO REPLY ───────────────────────────────────────────────
      case 'autoreply':      return await commands.settings.autoReply(ctx);

      // ── SECURITY ─────────────────────────────────────────────────
      case 'antilink':       return await commands.security.antiLink(ctx);
      case 'antimention':    return await commands.security.antiMention(ctx);
      case 'warn':           return await commands.security.warn(ctx);
      case 'unwarn':         return await commands.security.unwarn(ctx);
      case 'checkwarn':      return await commands.security.checkwarn(ctx);

      // ── PREMIUM ──────────────────────────────────────────────────
      case 'premium':        return await commands.premium.info(ctx);
      case 'buy':            return await commands.premium.buy(ctx);
      case 'addpremium':     return await commands.premium.add(ctx);
      case 'removepremium':  return await commands.premium.remove(ctx);
      case 'checkpremium':   return await commands.premium.check(ctx);

      // ── AI ───────────────────────────────────────────────────────
      case 'chat':           return await commands.ai.command(ctx);
      case 'ai':             return await commands.settings.aiToggle(ctx);

      // ── UPDATES ──────────────────────────────────────────────────
      case 'update':         return await commands.updates.check(ctx);
      case 'updatelog':      return await commands.updates.log(ctx);

      // ── GROUP MANAGEMENT ─────────────────────────────────────────
      case 'welcome':        return await commands.group.welcome(ctx);
      case 'goodbye':        return await commands.group.goodbye(ctx);
      case 'admin':          return await commands.group.admin(ctx);

      // ── OWNER ────────────────────────────────────────────────────
      case 'setwarnlimit':   return await commands.owner.setWarnLimit(ctx);
      case 'restart':        return await commands.owner.restart(ctx);
      case 'shutdown':       return await commands.owner.shutdown(ctx);
      case 'setname':        return await commands.owner.setName(ctx);
      case 'setbio':         return await commands.owner.setBio(ctx);

      default:
        await reply(`❓ Unknown command: */${command}*\nType */menu* to see all commands.`);
    }
  } catch (err) {
    console.error(`Command error [${command}]:`, err);
    await reply(`❌ Error running */${command}*. Please try again.`);
  }
}

module.exports = { handleMessage };
