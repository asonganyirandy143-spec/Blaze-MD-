const axios = require('axios');

// /weather <city> — Get current weather for a city
async function weather({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const city = args.join(' ');
  if (!city) return reply('❓ Usage: /weather <city>\nExample: /weather Douala');

  try {
    const res = await axios.get(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      { timeout: 8000 }
    );
    const data = res.data;
    const current = data.current_condition[0];
    const area = data.nearest_area[0];

    const cityName = area.areaName[0].value;
    const country = area.country[0].value;
    const temp = current.temp_C;
    const feels = current.FeelsLikeC;
    const humidity = current.humidity;
    const wind = current.windspeedKmph;
    const desc = current.weatherDesc[0].value;

    const weatherEmoji =
      desc.toLowerCase().includes('sun') ? '☀️' :
      desc.toLowerCase().includes('rain') ? '🌧️' :
      desc.toLowerCase().includes('cloud') ? '☁️' :
      desc.toLowerCase().includes('storm') ? '⛈️' :
      desc.toLowerCase().includes('snow') ? '❄️' : '🌡️';

    await reply(
      `${weatherEmoji} *WEATHER - ${cityName}, ${country}*\n\n` +
      `🌡️ Temperature: *${temp}°C*\n` +
      `🤔 Feels Like: *${feels}°C*\n` +
      `💧 Humidity: *${humidity}%*\n` +
      `💨 Wind: *${wind} km/h*\n` +
      `📋 Condition: *${desc}*\n\n` +
      `> 🔥 BLAZE MD Weather`
    );
  } catch {
    await reply('❌ Could not fetch weather. Check the city name and try again.');
  }
}

// /calculate <expression> — Calculate a math expression
async function calculate({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const expression = args.join(' ');
  if (!expression) return reply('❓ Usage: /calculate <expression>\nExample: /calculate 25 * 4 + 10');

  try {
    // Safe math evaluation
    const sanitized = expression.replace(/[^0-9+\-*/.()%^ ]/g, '');
    if (!sanitized) return reply('❌ Invalid expression. Use numbers and operators only.');

    const result = Function(`"use strict"; return (${sanitized})`)();
    if (!isFinite(result)) return reply('❌ Math error — division by zero or invalid operation.');

    await reply(
      `🧮 *CALCULATOR*\n\n` +
      `📝 Expression: *${expression}*\n` +
      `✅ Result: *${result}*\n\n` +
      `> 🔥 BLAZE MD`
    );
  } catch {
    await reply('❌ Invalid math expression. Example: /calculate 10 * 5 + 3');
  }
}

// /time <city/timezone> — Get current time in a city
async function time({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const location = args.join(' ') || 'UTC';

  try {
    const res = await axios.get(
      `https://timeapi.io/api/Time/current/zone?timeZone=${encodeURIComponent(location)}`,
      { timeout: 8000 }
    );
    const d = res.data;
    await reply(
      `🕐 *WORLD TIME*\n\n` +
      `📍 Location: *${location}*\n` +
      `📅 Date: *${d.date}*\n` +
      `⏰ Time: *${d.time}*\n` +
      `📆 Day: *${d.dayOfWeek}*\n\n` +
      `> 🔥 BLAZE MD`
    );
  } catch {
    // Fallback to local time
    const now = new Date();
    await reply(
      `🕐 *CURRENT TIME (UTC)*\n\n` +
      `📅 Date: *${now.toDateString()}*\n` +
      `⏰ Time: *${now.toUTCString()}*\n\n` +
      `> 🔥 BLAZE MD`
    );
  }
}

// /define <word> — Get dictionary definition
async function define({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const word = args[0];
  if (!word) return reply('❓ Usage: /define <word>\nExample: /define perseverance');

  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { timeout: 8000 }
    );
    const entry = res.data[0];
    const meanings = entry.meanings.slice(0, 2);

    let text = `📖 *DICTIONARY: ${entry.word.toUpperCase()}*\n`;
    if (entry.phonetic) text += `🔤 Phonetic: _${entry.phonetic}_\n`;
    text += '\n';

    for (const meaning of meanings) {
      text += `*${meaning.partOfSpeech}:*\n`;
      const def = meaning.definitions[0];
      text += `• ${def.definition}\n`;
      if (def.example) text += `  _"${def.example}"_\n`;
      text += '\n';
    }

    text += '> 🔥 BLAZE MD Dictionary';
    await reply(text.trim());
  } catch {
    await reply(`❌ No definition found for *${word}*. Check spelling and try again.`);
  }
}

// /wiki <topic> — Search Wikipedia
async function wiki({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const topic = args.join(' ');
  if (!topic) return reply('❓ Usage: /wiki <topic>\nExample: /wiki Eiffel Tower');

  try {
    const res = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
      { timeout: 8000 }
    );
    const data = res.data;
    if (data.type === 'disambiguation') {
      return reply(`⚠️ *${topic}* is ambiguous. Be more specific.\nExample: /wiki ${topic} (film)`);
    }

    const summary = data.extract?.slice(0, 600) || 'No summary available.';
    await reply(
      `📚 *WIKIPEDIA: ${data.title}*\n\n` +
      `${summary}${data.extract?.length > 600 ? '...' : ''}\n\n` +
      `🔗 Read more: ${data.content_urls?.desktop?.page || ''}\n\n` +
      `> 🔥 BLAZE MD`
    );
  } catch {
    await reply(`❌ No Wikipedia article found for *${topic}*.`);
  }
}

// /translate <lang> <text> — Translate text (uses MyMemory free API)
async function translate({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (args.length < 2) {
    return reply('❓ Usage: /translate <language> <text>\nExample: /translate french Hello how are you\n\nLanguages: french, spanish, arabic, german, portuguese, chinese, japanese');
  }

  const langMap = {
    french: 'fr', spanish: 'es', arabic: 'ar', german: 'de',
    portuguese: 'pt', chinese: 'zh', japanese: 'ja', italian: 'it',
    russian: 'ru', korean: 'ko', dutch: 'nl', turkish: 'tr',
    hindi: 'hi', swahili: 'sw', yoruba: 'yo', hausa: 'ha',
  };

  const langInput = args[0].toLowerCase();
  const targetLang = langMap[langInput] || langInput;
  const text = args.slice(1).join(' ');

  try {
    const res = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`,
      { timeout: 8000 }
    );
    const translated = res.data.responseData.translatedText;
    await reply(
      `🌍 *TRANSLATOR*\n\n` +
      `📝 Original: _${text}_\n` +
      `🔄 Language: *${langInput}*\n` +
      `✅ Translated: *${translated}*\n\n` +
      `> 🔥 BLAZE MD`
    );
  } catch {
    await reply('❌ Translation failed. Try again later.');
  }
}

// /currency <amount> <from> <to> — Convert currency
async function currency({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  if (args.length < 3) {
    return reply('❓ Usage: /currency <amount> <from> <to>\nExample: /currency 100 USD EUR\nExample: /currency 5000 XAF USD');
  }

  const amount = parseFloat(args[0]);
  const fromCurr = args[1].toUpperCase();
  const toCurr = args[2].toUpperCase();

  if (isNaN(amount)) return reply('❌ Invalid amount. Use a number.');

  try {
    const res = await axios.get(
      `https://open.er-api.com/v6/latest/${fromCurr}`,
      { timeout: 8000 }
    );
    const rates = res.data.rates;
    if (!rates[toCurr]) return reply(`❌ Currency *${toCurr}* not found.`);

    const result = (amount * rates[toCurr]).toFixed(2);
    await reply(
      `💱 *CURRENCY CONVERTER*\n\n` +
      `💵 Amount: *${amount} ${fromCurr}*\n` +
      `💴 Result: *${result} ${toCurr}*\n` +
      `📊 Rate: 1 ${fromCurr} = ${rates[toCurr]} ${toCurr}\n\n` +
      `> 🔥 BLAZE MD`
    );
  } catch {
    await reply('❌ Could not fetch exchange rates. Try again later.');
  }
}

// /qr <text> — Generate QR code for any text or link
async function qr({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const text = args.join(' ');
  if (!text) return reply('❓ Usage: /qr <text or link>\nExample: /qr https://whatsapp.com');

  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    await sock.sendMessage(from, {
      image: { url: qrUrl },
      caption: `📱 *QR CODE GENERATED*\n\n📝 Content: ${text}\n\n> 🔥 BLAZE MD`,
    });
  } catch {
    await reply('❌ Failed to generate QR code.');
  }
}

// /shorten <url> — Shorten a URL using TinyURL
async function shorten({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const url = args[0];
  if (!url) return reply('❓ Usage: /shorten <url>\nExample: /shorten https://www.google.com/very/long/url');

  try {
    const res = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      { timeout: 8000 }
    );
    await reply(
      `🔗 *URL SHORTENER*\n\n` +
      `📎 Original: ${url}\n` +
      `✅ Shortened: *${res.data}*\n\n` +
      `> 🔥 BLAZE MD`
    );
  } catch {
    await reply('❌ Failed to shorten URL. Make sure it is a valid link.');
  }
}

// /ip <address> — Lookup IP address info
async function ip({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const address = args[0];
  if (!address) return reply('❓ Usage: /ip <address>\nExample: /ip 8.8.8.8');

  try {
    const res = await axios.get(`https://ipapi.co/${address}/json/`, { timeout: 8000 });
    const d = res.data;
    if (d.error) return reply(`❌ ${d.reason || 'Invalid IP address.'}`);

    await reply(
      `🌐 *IP LOOKUP: ${address}*\n\n` +
      `🏳️ Country: *${d.country_name}*\n` +
      `🏙️ City: *${d.city}*\n` +
      `📍 Region: *${d.region}*\n` +
      `🕐 Timezone: *${d.timezone}*\n` +
      `🌍 Latitude: *${d.latitude}*\n` +
      `🌍 Longitude: *${d.longitude}*\n` +
      `📡 ISP: *${d.org}*\n\n` +
      `> 🔥 BLAZE MD`
    );
  } catch {
    await reply('❌ Failed to lookup IP address.');
  }
}

// /news — Get latest world news headlines
async function news({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  try {
    const res = await axios.get(
      'https://gnews.io/api/v4/top-headlines?lang=en&max=5&apikey=demo',
      { timeout: 8000 }
    );
    const articles = res.data.articles?.slice(0, 5);
    if (!articles?.length) throw new Error('No articles');

    let text = `📰 *LATEST NEWS*\n\n`;
    articles.forEach((a, i) => {
      text += `${i + 1}. *${a.title}*\n   📅 ${a.publishedAt?.slice(0, 10)}\n\n`;
    });
    text += `> 🔥 BLAZE MD News`;
    await reply(text.trim());
  } catch {
    // Fallback
    await reply(
      `📰 *NEWS*\n\nNews API requires a free API key.\n\nGet one free at: https://gnews.io\nThen add it to your .env as:\nNEWS_API_KEY=your_key\n\n> 🔥 BLAZE MD`
    );
  }
}

module.exports = { weather, calculate, time, define, wiki, translate, currency, qr, shorten, ip, news };
