const axios = require('axios');

// ── JOKES ──────────────────────────────────────────────────────────
const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😂",
  "Why did the math book look sad? Because it had too many problems! 📚",
  "I told my wife she was drawing her eyebrows too high. She looked surprised! 😯",
  "Why can't you give Elsa a balloon? Because she'll let it go! 🎈",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
  "How do you organize a space party? You planet! 🪐",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "What do you call cheese that isn't yours? Nacho cheese! 🧀",
  "Why did the bicycle fall over? Because it was two-tired! 🚲",
];

// ── ANIME FACTS ────────────────────────────────────────────────────
const animeFacts = [
  "🎌 Did you know? One Piece has over 1,000 episodes and is still ongoing!",
  "⚔️ Naruto ran for 220 episodes and Naruto Shippuden for 500 episodes!",
  "💥 Dragon Ball Z's Goku has died more than any other main anime character!",
  "🏫 My Hero Academia's world has 80% of the population with superpowers!",
  "⚙️ Attack on Titan was completed after 11 years of serialization!",
  "🌙 Sailor Moon was one of the first anime to feature a female lead superhero!",
  "🎮 Sword Art Online's concept was inspired by VR gaming trends!",
  "🔥 Demon Slayer became the best-selling manga in Japan in 2020!",
  "🧪 Fullmetal Alchemist: Brotherhood is consistently rated #1 on MyAnimeList!",
  "🌊 One Piece creator Eiichiro Oda drew the series despite chronic illness!",
];

async function meme({ sock, from }) {
  try {
    // Using meme API
    const res = await axios.get('https://meme-api.com/gimme', { timeout: 8000 });
    const { title, url, subreddit, author } = res.data;

    await sock.sendMessage(from, {
      image: { url },
      caption: `😂 *${title}*\n\n📌 r/${subreddit} | 👤 u/${author}`,
    });
  } catch (err) {
    // Fallback text meme
    const fallbackMemes = [
      "😂 *When the bot works perfectly but you restart it just to be sure*",
      "🤣 *Me: I'll fix it tomorrow\nTomorrow: I'll fix it tomorrow*",
      "😭 *My code: works fine\nMe: let me add one more feature\nMy code: *",
      "💀 *When you copy code from Stack Overflow and it works*",
      "😅 *99 bugs in the code, take one down, patch it around, 127 bugs in the code*",
    ];
    const randomMeme = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
    await sock.sendMessage(from, {
      text: randomMeme + '\n\n> 🔥 Powered by BLAZE MD',
    });
  }
}

async function joke({ sock, from }) {
  try {
    // Try JokeAPI first
    const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist&type=single', {
      timeout: 5000,
    });

    let jokeText = '';
    if (res.data.type === 'single') {
      jokeText = res.data.joke;
    } else {
      jokeText = `${res.data.setup}\n\n${res.data.delivery}`;
    }

    await sock.sendMessage(from, {
      text: `😂 *JOKE OF THE DAY*\n\n${jokeText}\n\n> 🔥 BLAZE MD`,
    });
  } catch (err) {
    // Fallback local joke
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    await sock.sendMessage(from, {
      text: `😂 *JOKE OF THE DAY*\n\n${randomJoke}\n\n> 🔥 BLAZE MD`,
    });
  }
}

async function anime({ sock, from }) {
  try {
    // Try Jikan API for random anime
    const res = await axios.get('https://api.jikan.moe/v4/random/anime', { timeout: 8000 });
    const a = res.data.data;

    const animeInfo = `
🎌 *RANDOM ANIME*

📛 Title: *${a.title}*
🇯🇵 Japanese: *${a.title_japanese || 'N/A'}*
⭐ Score: *${a.score || 'N/A'}/10*
🎬 Episodes: *${a.episodes || 'N/A'}*
📅 Year: *${a.year || 'N/A'}*
🎭 Genres: *${a.genres?.map((g) => g.name).join(', ') || 'N/A'}*
📊 Status: *${a.status || 'N/A'}*
📖 Synopsis: _${a.synopsis?.slice(0, 200) || 'N/A'}..._

> 🔥 Powered by BLAZE MD
    `.trim();

    if (a.images?.jpg?.image_url) {
      await sock.sendMessage(from, {
        image: { url: a.images.jpg.image_url },
        caption: animeInfo,
      });
    } else {
      await sock.sendMessage(from, { text: animeInfo });
    }
  } catch (err) {
    // Fallback anime fact
    const randomFact = animeFacts[Math.floor(Math.random() * animeFacts.length)];
    await sock.sendMessage(from, {
      text: `🎌 *ANIME FACT*\n\n${randomFact}\n\n> 🔥 BLAZE MD`,
    });
  }
}

module.exports = { meme, joke, anime };
