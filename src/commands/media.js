const axios = require('axios');

// /tts <text> — Convert text to speech using online TTS
async function tts({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const text = args.join(' ');
  if (!text) return reply('❓ Usage: /tts <text>\nExample: /tts Hello, I am BLAZE MD bot!');
  if (text.length > 200) return reply('❌ Text too long! Maximum 200 characters.');

  try {
    const ttsUrl = `https://api.voicerss.org/?key=demo&hl=en-us&src=${encodeURIComponent(text)}&c=MP3&f=8khz_8bit_mono`;
    await sock.sendMessage(from, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mp4',
      ptt: true,
    });
  } catch {
    await reply(
      `🔊 *TEXT TO SPEECH*\n\nTTS requires a free API key.\nGet one at: https://www.voicerss.org\nAdd to .env as: TTS_API_KEY=your_key\n\n> 🔥 BLAZE MD`
    );
  }
}

// /spotify <song> — Search for a song on Spotify
async function spotify({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const query = args.join(' ');
  if (!query) return reply('❓ Usage: /spotify <song name>\nExample: /spotify Shape of You Ed Sheeran');

  try {
    // Use iTunes Search API as free alternative
    const res = await axios.get(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`,
      { timeout: 8000 }
    );
    const track = res.data.results?.[0];
    if (!track) return reply(`❌ No results found for: *${query}*`);

    const text =
      `🎵 *SONG FOUND*\n\n` +
      `🎤 Artist: *${track.artistName}*\n` +
      `🎵 Song: *${track.trackName}*\n` +
      `💿 Album: *${track.collectionName}*\n` +
      `📅 Released: *${track.releaseDate?.slice(0, 10)}*\n` +
      `⏱️ Duration: *${Math.floor(track.trackTimeMillis / 60000)}:${String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}*\n` +
      `🎭 Genre: *${track.primaryGenreName}*\n` +
      `🔗 Preview: ${track.previewUrl || 'Not available'}\n\n` +
      `> 🔥 BLAZE MD`;

    if (track.artworkUrl100) {
      await sock.sendMessage(from, {
        image: { url: track.artworkUrl100.replace('100x100', '300x300') },
        caption: text,
      });
    } else {
      await reply(text);
    }
  } catch {
    await reply('❌ Could not search for song. Try again later.');
  }
}

// /github <username> — Show GitHub profile info
async function github({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const username = args[0];
  if (!username) return reply('❓ Usage: /github <username>\nExample: /github torvalds');

  try {
    const res = await axios.get(`https://api.github.com/users/${username}`, { timeout: 8000 });
    const u = res.data;

    const text =
      `👨‍💻 *GITHUB PROFILE*\n\n` +
      `👤 Name: *${u.name || u.login}*\n` +
      `🔗 Username: *@${u.login}*\n` +
      `📝 Bio: _${u.bio || 'No bio'}_ \n` +
      `📦 Repos: *${u.public_repos}*\n` +
      `👥 Followers: *${u.followers}*\n` +
      `➡️ Following: *${u.following}*\n` +
      `🏢 Company: *${u.company || 'N/A'}*\n` +
      `📍 Location: *${u.location || 'N/A'}*\n` +
      `🔗 Profile: ${u.html_url}\n\n` +
      `> 🔥 BLAZE MD`;

    if (u.avatar_url) {
      await sock.sendMessage(from, { image: { url: u.avatar_url }, caption: text });
    } else {
      await reply(text);
    }
  } catch (err) {
    if (err.response?.status === 404) {
      await reply(`❌ GitHub user *${username}* not found.`);
    } else {
      await reply('❌ Failed to fetch GitHub profile.');
    }
  }
}

// /cat — Get a random cat image
async function cat({ sock, from }) {
  try {
    const res = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 8000 });
    await sock.sendMessage(from, {
      image: { url: res.data[0].url },
      caption: '🐱 *Random Cat!*\n\n> 🔥 BLAZE MD',
    });
  } catch {
    await sock.sendMessage(from, { text: '❌ Could not fetch cat image. Try again!' });
  }
}

// /dog — Get a random dog image
async function dog({ sock, from }) {
  try {
    const res = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 8000 });
    await sock.sendMessage(from, {
      image: { url: res.data.message },
      caption: '🐶 *Random Dog!*\n\n> 🔥 BLAZE MD',
    });
  } catch {
    await sock.sendMessage(from, { text: '❌ Could not fetch dog image. Try again!' });
  }
}

// /wallpaper <query> — Get a wallpaper image
async function wallpaper({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const query = args.join(' ') || 'nature';

  try {
    const res = await axios.get(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=demo`,
      { timeout: 8000 }
    );
    const photo = res.data;
    await sock.sendMessage(from, {
      image: { url: photo.urls?.regular || photo.urls?.full },
      caption: `🖼️ *WALLPAPER*\n\n🔍 Query: ${query}\n📸 By: ${photo.user?.name || 'Unknown'}\n\n> 🔥 BLAZE MD`,
    });
  } catch {
    // Fallback to picsum
    await sock.sendMessage(from, {
      image: { url: `https://picsum.photos/800/600?random=${Date.now()}` },
      caption: `🖼️ *RANDOM WALLPAPER*\n\n> 🔥 BLAZE MD`,
    });
  }
}

// /ss <url> — Screenshot a website
async function ss({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const url = args[0];
  if (!url || !url.startsWith('http')) return reply('❓ Usage: /ss <url>\nExample: /ss https://google.com');

  try {
    const screenshotUrl = `https://api.screenshotmachine.com?key=demo&url=${encodeURIComponent(url)}&dimension=1024x768`;
    await sock.sendMessage(from, {
      image: { url: screenshotUrl },
      caption: `📸 *WEBSITE SCREENSHOT*\n\n🔗 URL: ${url}\n\n> 🔥 BLAZE MD`,
    });
  } catch {
    await reply('❌ Could not take screenshot. Make sure the URL is valid.');
  }
}

// /avatar <@user> — Get a user's profile picture
async function avatar({ sock, from, msg, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  const mentionedJid =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.key.remoteJid;

  try {
    const ppUrl = await sock.profilePictureUrl(mentionedJid, 'image');
    const number = mentionedJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
    await sock.sendMessage(from, {
      image: { url: ppUrl },
      caption: `🖼️ *PROFILE PICTURE*\n\n👤 User: +${number}\n\n> 🔥 BLAZE MD`,
    });
  } catch {
    await reply('❌ Could not fetch profile picture. The user may have privacy settings enabled.');
  }
}

module.exports = { tts, spotify, github, cat, dog, wallpaper, ss, avatar };


// ─────────────────────────────────────────────────────────────────────────────
// /sticker — Convert image/GIF/video to WhatsApp sticker
// HOW TO USE:
//   • Send an image with caption /sticker
//   • OR reply to any image/GIF/video with /sticker
//   • Optional: /sticker <pack name> | <author>
//     Example: /sticker Blaze Pack | Randy Blaze ☘️
// ─────────────────────────────────────────────────────────────────────────────
async function sticker({ sock, from, msg, args }) {
  const reply = async (text) => sock.sendMessage(from, { text }, { quoted: msg });

  // ── Resolve which message has the media ──────────────────────────────────
  // The media can be in:
  //   1. The message itself (user sent image + caption "/sticker")
  //   2. The quoted/replied message
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mediaMsg = quoted || msg.message;

  // Detect media type
  const isImage   = !!(mediaMsg?.imageMessage);
  const isVideo   = !!(mediaMsg?.videoMessage);
  const isGif     = !!(mediaMsg?.videoMessage?.gifPlayback);
  const isSticker = !!(mediaMsg?.stickerMessage);

  if (!isImage && !isVideo && !isGif && !isSticker) {
    return reply(
      `🖼️ *STICKER MAKER*\n\n` +
      `How to use:\n` +
      `• Send an image with caption */sticker*\n` +
      `• Reply to any image/GIF/video with */sticker*\n\n` +
      `Optional — set pack info:\n` +
      `*/sticker My Pack | Randy Blaze ☘️*\n\n` +
      `> 🔥 BLAZE MD Sticker Maker`
    );
  }

  // ── Parse optional pack name and author ─────────────────────────────────
  const input     = args.join(' ');
  const parts     = input.split('|');
  const packName  = parts[0]?.trim() || 'BLAZE MD';
  const packAuth  = parts[1]?.trim() || 'Randy Blaze ☘️';

  await reply('⏳ Creating your sticker... Please wait!');

  try {
    const sharp = require('sharp');

    // ── Download the media buffer ────────────────────────────────────────
    let buffer;
    if (quoted) {
      // Download from the quoted message
      const stream = await sock.downloadContentFromMessage(
        mediaMsg.imageMessage || mediaMsg.videoMessage || mediaMsg.stickerMessage,
        isImage ? 'image' : isVideo || isGif ? 'video' : 'sticker'
      );
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      buffer = Buffer.concat(chunks);
    } else {
      // Download from the current message
      const stream = await sock.downloadContentFromMessage(
        msg.message.imageMessage || msg.message.videoMessage,
        isImage ? 'image' : 'video'
      );
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      buffer = Buffer.concat(chunks);
    }

    // ── Convert image to WebP sticker using Sharp ────────────────────────
    let webpBuffer;

    if (isImage || isSticker) {
      webpBuffer = await sharp(buffer)
        .resize(512, 512, {
          fit: 'contain',         // Keeps aspect ratio, adds padding
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        })
        .webp({ quality: 80 })
        .toBuffer();
    } else if (isVideo || isGif) {
      // For video/GIF, extract first frame as static sticker
      // (Animated stickers need ffmpeg — static fallback is safer)
      webpBuffer = await sharp(buffer, { pages: 1 })
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 80 })
        .toBuffer();
    }

    // ── Build sticker metadata ───────────────────────────────────────────
    // WhatsApp sticker metadata is stored as Exif in the WebP
    const stickerMetadata = {
      'sticker-pack-id':        `blaze-md-${Date.now()}`,
      'sticker-pack-name':       packName,
      'sticker-pack-publisher':  packAuth,
      'emojis':                 ['🔥', '😎'],
    };

    // Embed metadata as Exif JSON in WebP
    const metaJson   = JSON.stringify(stickerMetadata);
    const metaBuf    = Buffer.from(metaJson, 'utf-8');
    // Exif structure: "Exif\0\0" + IFD0 with UserComment
    // Simple approach: prepend the JSON as WebP metadata via sharp
    const finalBuffer = await sharp(webpBuffer)
      .webp()
      .withMetadata({
        exif: {
          IFD0: {
            ImageDescription: metaJson,
          },
        },
      })
      .toBuffer();

    // ── Send the sticker ─────────────────────────────────────────────────
    await sock.sendMessage(from, {
      sticker: finalBuffer,
    });

  } catch (err) {
    console.error('Sticker error:', err);

    if (err.message?.includes('sharp')) {
      return reply(
        `❌ *Sharp not installed!*\n\n` +
        `Run this command on your server:\n` +
        `\`\`\`npm install sharp\`\`\`\n\n` +
        `Then restart the bot with */restart*`
      );
    }

    await reply(
      `❌ Failed to create sticker.\n\n` +
      `Make sure you:\n` +
      `• Replied to a clear image\n` +
      `• Image is not corrupted\n` +
      `• Bot has enough memory\n\n` +
      `Try again with a different image!`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// /toimg — Convert a sticker back to an image
// HOW TO USE: Reply to any sticker with /toimg
// ─────────────────────────────────────────────────────────────────────────────
async function toimg({ sock, from, msg }) {
  const reply = async (text) => sock.sendMessage(from, { text }, { quoted: msg });

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage;

  if (!stickerMsg) {
    return reply(
      `🖼️ *STICKER → IMAGE*\n\n` +
      `Reply to any sticker with */toimg* to convert it to an image.\n\n` +
      `> 🔥 BLAZE MD`
    );
  }

  await reply('⏳ Converting sticker to image...');

  try {
    const sharp = require('sharp');

    const stream = await sock.downloadContentFromMessage(stickerMsg, 'sticker');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Convert WebP sticker to PNG image
    const pngBuffer = await sharp(buffer).png().toBuffer();

    await sock.sendMessage(from, {
      image: pngBuffer,
      caption: `🖼️ *Sticker converted to image!*\n\n> 🔥 BLAZE MD`,
    });
  } catch (err) {
    console.error('toimg error:', err);
    await reply('❌ Failed to convert sticker. Try a different sticker!');
  }
}

module.exports = { tts, spotify, github, cat, dog, wallpaper, ss, avatar, sticker, toimg };
