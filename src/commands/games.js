const axios = require('axios');

// /8ball <question> — Ask the magic 8 ball
async function eightball({ sock, from, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });
  const question = args.join(' ');
  if (!question) return reply('❓ Usage: /8ball <question>\nExample: /8ball Will I be rich?');

  const responses = [
    '✅ It is certain.', '✅ It is decidedly so.', '✅ Without a doubt.',
    '✅ Yes, definitely!', '✅ You may rely on it.', '✅ As I see it, yes.',
    '✅ Most likely.', '✅ Outlook good.', '✅ Yes!', '✅ Signs point to yes.',
    '🤔 Reply hazy, try again.', '🤔 Ask again later.', '🤔 Better not tell you now.',
    '🤔 Cannot predict now.', '🤔 Concentrate and ask again.',
    '❌ Don\'t count on it.', '❌ My reply is no.', '❌ My sources say no.',
    '❌ Outlook not so good.', '❌ Very doubtful.',
  ];

  const answer = responses[Math.floor(Math.random() * responses.length)];
  await reply(`🎱 *MAGIC 8 BALL*\n\n❓ Question: _${question}_\n\n${answer}\n\n> 🔥 BLAZE MD`);
}

// /truth — Get a truth question
async function truth({ sock, from }) {
  const truths = [
    'What is the most embarrassing thing you have ever done?',
    'What is your biggest fear in life?',
    'Have you ever lied to your best friend?',
    'What is the most childish thing you still do?',
    'Who was your first crush?',
    'What is something you have never told anyone?',
    'Have you ever cheated on a test?',
    'What is your biggest regret?',
    'What is the worst gift you have ever received?',
    'Have you ever pretended to be sick to avoid something?',
    'What is a bad habit you have?',
    'What is the most embarrassing song you love?',
    'Have you ever blamed someone else for something you did?',
    'What is your most irrational fear?',
    'What is something you are secretly proud of?',
  ];
  const q = truths[Math.floor(Math.random() * truths.length)];
  await sock.sendMessage(from, { text: `💬 *TRUTH*\n\n❓ ${q}\n\n> 🔥 BLAZE MD` });
}

// /dare — Get a dare challenge
async function dare({ sock, from }) {
  const dares = [
    'Send a voice note singing your favourite song for 30 seconds.',
    'Change your profile picture to a funny face for 1 hour.',
    'Send a message to your crush right now.',
    'Do 20 push-ups and send a video as proof.',
    'Tell a joke to the group right now.',
    'Send your most embarrassing photo.',
    'Type with your elbows for your next 3 messages.',
    'Write a love letter to the last person who texted you.',
    'Post your last 3 Google searches.',
    'Send the last photo in your gallery (no deleting it first!).',
    'Say something nice about every person in this group.',
    'Send a voice note doing your best animal impression.',
    'Change your name to a funny nickname for 1 day.',
    'Let the group send any message from your phone.',
    'Send a selfie right now with no filter.',
  ];
  const d = dares[Math.floor(Math.random() * dares.length)];
  await sock.sendMessage(from, { text: `🎯 *DARE*\n\n🔥 ${d}\n\n> 🔥 BLAZE MD` });
}

// /roast @user — Send a funny roast to a user
async function roast({ sock, from, msg, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  const roasts = [
    'You are the reason they put instructions on shampoo bottles.',
    'I would agree with you but then we would both be wrong.',
    'You are like a cloud — when you disappear, it is a beautiful day.',
    'I have met some pigs smarter than you, and they were delicious.',
    'You are not stupid; you just have bad luck thinking.',
    'If laughter is the best medicine, your face must be curing diseases.',
    'You are so slow, you would lose a race with a parked car.',
    'I would call you a fool but that would be an insult to fools.',
    'You have the personality of a blank piece of paper.',
    'Even your reflection avoids making eye contact with you.',
  ];

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const roast = roasts[Math.floor(Math.random() * roasts.length)];

  if (mentionedJid) {
    const number = mentionedJid.replace('@s.whatsapp.net', '');
    await sock.sendMessage(from, {
      text: `🔥 *ROAST*\n\n@${number}: ${roast}\n\n😂 No offense, it's just for fun!\n\n> 🔥 BLAZE MD`,
      mentions: [mentionedJid],
    });
  } else {
    await reply(`🔥 *ROAST*\n\n${roast}\n\n😂 No offense!\n\n> 🔥 BLAZE MD`);
  }
}

// /compliment @user — Send a compliment to a user
async function compliment({ sock, from, msg, args }) {
  const compliments = [
    'You have an incredible heart and a beautiful soul.',
    'You light up every room you walk into.',
    'Your kindness makes the world a better place.',
    'You are more talented than you think.',
    'You inspire everyone around you without even trying.',
    'Your smile could cure any bad day.',
    'You make people feel valued just by being you.',
    'The world is genuinely better because you are in it.',
    'You have an amazing ability to make others feel special.',
    'You are one of the most genuine people I know.',
  ];

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const comp = compliments[Math.floor(Math.random() * compliments.length)];

  if (mentionedJid) {
    const number = mentionedJid.replace('@s.whatsapp.net', '');
    await sock.sendMessage(from, {
      text: `💖 *COMPLIMENT*\n\n@${number}: ${comp} 🌟\n\n> 🔥 BLAZE MD`,
      mentions: [mentionedJid],
    });
  } else {
    await sock.sendMessage(from, { text: `💖 *COMPLIMENT*\n\n${comp} 🌟\n\n> 🔥 BLAZE MD` });
  }
}

// /quote — Get a random inspirational quote
async function quote({ sock, from }) {
  const quotes = [
    { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
    { q: 'In the middle of every difficulty lies opportunity.', a: 'Albert Einstein' },
    { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
    { q: 'Success is not final, failure is not fatal. It is the courage to continue that counts.', a: 'Winston Churchill' },
    { q: 'Believe you can and you are halfway there.', a: 'Theodore Roosevelt' },
    { q: 'Life is what happens when you are busy making other plans.', a: 'John Lennon' },
    { q: 'The future belongs to those who believe in the beauty of their dreams.', a: 'Eleanor Roosevelt' },
    { q: 'You miss 100% of the shots you do not take.', a: 'Wayne Gretzky' },
    { q: 'Whether you think you can or think you cannot, you are right.', a: 'Henry Ford' },
    { q: 'Do not watch the clock. Do what it does — keep going.', a: 'Sam Levenson' },
  ];

  try {
    const res = await axios.get('https://api.quotable.io/random', { timeout: 5000 });
    await sock.sendMessage(from, {
      text: `💡 *QUOTE OF THE DAY*\n\n_"${res.data.content}"_\n\n— *${res.data.author}*\n\n> 🔥 BLAZE MD`,
    });
  } catch {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    await sock.sendMessage(from, {
      text: `💡 *QUOTE OF THE DAY*\n\n_"${q.q}"_\n\n— *${q.a}*\n\n> 🔥 BLAZE MD`,
    });
  }
}

// /fact — Get a random fun fact
async function fact({ sock, from }) {
  const facts = [
    'Honey never expires. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible!',
    'A group of flamingos is called a flamboyance.',
    'Bananas are berries, but strawberries are not.',
    'Octopuses have three hearts and blue blood.',
    'The Eiffel Tower grows about 15cm taller during summer due to heat expansion.',
    'A day on Venus is longer than a year on Venus.',
    'Sharks are older than trees. They have existed for over 400 million years.',
    'The fingerprints of a koala are so similar to humans that they have confused crime scenes.',
    'Cleopatra lived closer in time to the Moon landing than to the construction of the pyramids.',
    'There are more possible games of chess than atoms in the observable universe.',
  ];

  try {
    const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 5000 });
    await sock.sendMessage(from, {
      text: `🧠 *RANDOM FACT*\n\n${res.data.text}\n\n> 🔥 BLAZE MD`,
    });
  } catch {
    const f = facts[Math.floor(Math.random() * facts.length)];
    await sock.sendMessage(from, { text: `🧠 *RANDOM FACT*\n\n${f}\n\n> 🔥 BLAZE MD` });
  }
}

// /riddle — Get a riddle to solve
async function riddle({ sock, from }) {
  const riddles = [
    { q: 'I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?', a: 'A map!' },
    { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps!' },
    { q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?', a: 'An echo!' },
    { q: 'What has hands but cannot clap?', a: 'A clock!' },
    { q: 'I am not alive, but I grow. I do not have lungs, but I need air. What am I?', a: 'Fire!' },
    { q: 'What can travel around the world while staying in a corner?', a: 'A stamp!' },
    { q: 'What gets wetter as it dries?', a: 'A towel!' },
    { q: 'I have a head and a tail but no body. What am I?', a: 'A coin!' },
  ];

  const r = riddles[Math.floor(Math.random() * riddles.length)];
  await sock.sendMessage(from, {
    text: `🧩 *RIDDLE*\n\n❓ ${r.q}\n\n_Reply with your answer, then type_ */answer* _to reveal!_\n\n||Answer: ${r.a}||\n\n> 🔥 BLAZE MD`,
  });
}

// /ship @user1 @user2 — Calculate love compatibility
async function ship({ sock, from, msg, args }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length < 2) {
    return reply('❓ Usage: /ship @user1 @user2\nExample: /ship @John @Jane');
  }

  const user1 = mentions[0].replace('@s.whatsapp.net', '');
  const user2 = mentions[1].replace('@s.whatsapp.net', '');

  // Generate consistent percentage based on the two numbers
  const seed = (parseInt(user1.slice(-4)) + parseInt(user2.slice(-4))) % 100;
  const percent = Math.abs(seed) || Math.floor(Math.random() * 100);

  const heart =
    percent >= 80 ? '💘 Perfect Match!' :
    percent >= 60 ? '❤️ Great Match!' :
    percent >= 40 ? '💛 Good Match!' :
    percent >= 20 ? '🧡 Could Work!' : '💔 Not Compatible';

  const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));

  await sock.sendMessage(from, {
    text: `💕 *SHIP METER*\n\n@${user1} + @${user2}\n\n[${bar}] ${percent}%\n\n${heart}\n\n> 🔥 BLAZE MD`,
    mentions: mentions,
  });
}

// /randomcolor — Get a random color with hex code
async function randomcolor({ sock, from }) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();

  await sock.sendMessage(from, {
    image: { url: `https://singlecolorimage.com/get/${hex.slice(1)}/300x300` },
    caption: `🎨 *RANDOM COLOR*\n\n🎨 Hex: *${hex}*\n🔴 Red: *${r}*\n🟢 Green: *${g}*\n🔵 Blue: *${b}*\n\n> 🔥 BLAZE MD`,
  });
}

// /wyr — Would you rather question
async function wyr({ sock, from }) {
  const questions = [
    'Would you rather be invisible OR be able to fly?',
    'Would you rather lose all your money OR lose all your memories?',
    'Would you rather always speak the truth OR always lie?',
    'Would you rather live without music OR live without TV?',
    'Would you rather be famous OR be very rich but unknown?',
    'Would you rather fight 100 duck-sized horses OR 1 horse-sized duck?',
    'Would you rather know when you will die OR how you will die?',
    'Would you rather be brilliant but ugly OR beautiful but dumb?',
    'Would you rather live in the past OR in the future?',
    'Would you rather have free Wi-Fi everywhere OR free food everywhere?',
  ];
  const q = questions[Math.floor(Math.random() * questions.length)];
  await sock.sendMessage(from, {
    text: `🤔 *WOULD YOU RATHER?*\n\n${q}\n\nReply A or B! 👇\n\n> 🔥 BLAZE MD`,
  });
}

module.exports = { eightball, truth, dare, roast, compliment, quote, fact, riddle, ship, randomcolor, wyr };
