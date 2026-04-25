# 🔥 BLAZE MD WhatsApp Bot

**Owner:** Randy Blaze ☘️ (+237676162113)
**Version:** 1.0.0
**Library:** @whiskeysockets/baileys

---

## 📊 Total Commands: 80+

| # | Category | Commands |
|---|---|---|
| 1 | Basic | /menu /help /ping /info /rules |
| 2 | Fun | /anime /meme /joke |
| 3 | Games | /8ball /truth /dare /roast /compliment /quote /fact /riddle /ship /randomcolor /wyr |
| 4 | Utility | /weather /calc /time /define /wiki /translate /currency /qr /shorten /ip /news |
| 5 | Media | /tts /spotify /github /cat /dog /wallpaper /ss /avatar |
| 6 | Moderation | /kick /ban /unban /mute /unmute /promote /demote /tagall /hidetag /poll /grouplink /revoke /setgroupname /setgroupdesc /listmembers |
| 7 | Security | /antilink /antimention /warn /unwarn /checkwarn |
| 8 | Auto Reply | /autoreply on/off |
| 9 | Premium | /premium /buy /addpremium /removepremium /checkpremium |
| 10 | AI | /chat /ai on/off |
| 11 | Updates | /update /updatelog |
| 12 | Group Mgmt | /welcome /goodbye /admin |
| 13 | Owner Only | /setwarnlimit /restart /shutdown /setname /setbio |

---

## 🚀 Setup

### Requirements
- Node.js v18 or higher
- npm
- A secondary WhatsApp number for the bot

### 1. Install Dependencies
```bash
cd blaze-md
npm install
```

### 2. Configure .env
```env
OWNER_NUMBER=237676162113
BOT_NAME=BLAZE MD
BOT_VERSION=1.0.0
PREFIX=/
SESSION_PATH=./session
AI_API_KEY=your_openrouter_key   # https://openrouter.ai (free)
MAX_WARNINGS=2
```

### 3. Start the Bot
```bash
npm start
```

### 4. Scan QR Code
A QR code appears in terminal. Scan with WhatsApp:
- WhatsApp → Settings → Linked Devices → Link a Device ✅

---

## 📁 File Structure

```
blaze-md/
├── index.js
├── package.json
├── .env
├── data/db.json          (auto-created)
├── session/              (auto-created)
└── src/
    ├── bot.js
    ├── handler.js
    ├── database.js
    ├── groupEvents.js
    └── commands/
        ├── index.js
        ├── basic.js      ← menu, help, ping, info, rules
        ├── fun.js        ← anime, meme, joke
        ├── games.js      ← 8ball, truth, dare, roast, ship...
        ├── utility.js    ← weather, calc, wiki, translate...
        ├── media.js      ← tts, spotify, github, cat, dog...
        ├── moderation.js ← kick, ban, mute, tagall, poll...
        ├── security.js   ← warn, antilink, antimention...
        ├── premium.js    ← premium system
        ├── ai.js         ← AI chat
        ├── settings.js   ← autoreply, ai toggle
        ├── updates.js    ← update, updatelog
        ├── group.js      ← welcome, goodbye, admin
        └── owner.js      ← restart, shutdown, setname...
```

---

## 📖 Command Explanations

### 🎮 Games
| Command | What it does |
|---|---|
| /8ball <question> | Ask the magic 8 ball any yes/no question |
| /truth | Get a random truth question to answer |
| /dare | Get a random dare challenge |
| /roast @user | Send a funny (harmless) roast to a user |
| /compliment @user | Send a sweet compliment to a user |
| /quote | Get a random inspirational quote |
| /fact | Get a random fun/interesting fact |
| /riddle | Get a brain teaser riddle |
| /ship @user1 @user2 | Calculate love compatibility between two users |
| /randomcolor | Generate a random color with hex code |
| /wyr | Ask a "would you rather" question |

### 🛠️ Utility
| Command | What it does |
|---|---|
| /weather <city> | Get live weather for any city in the world |
| /calc <expression> | Calculate any math expression e.g. /calc 25*4+10 |
| /time <timezone> | Get current time in any timezone/city |
| /define <word> | Look up the dictionary definition of a word |
| /wiki <topic> | Search Wikipedia for any topic |
| /translate <lang> <text> | Translate text to french, spanish, arabic, etc. |
| /currency <amt> <from> <to> | Convert between currencies e.g. /currency 5000 XAF USD |
| /qr <text> | Generate a QR code for any text or link |
| /shorten <url> | Shorten any long URL using TinyURL |
| /ip <address> | Look up location and info for any IP address |
| /news | Get latest world news headlines |

### 📸 Media
| Command | What it does |
|---|---|
| /tts <text> | Convert text to a voice message (speech) |
| /spotify <song> | Search for a song and show its info |
| /github <username> | Show a GitHub user's profile and stats |
| /cat | Send a random cat image |
| /dog | Send a random dog image |
| /wallpaper <query> | Get a wallpaper image for any topic |
| /ss <url> | Take a screenshot of any website |
| /avatar @user | Get a user's WhatsApp profile picture |

### 🔨 Moderation
| Command | What it does |
|---|---|
| /kick @user | Remove a user from the group |
| /ban @user | Kick + add to ban list so they can't rejoin |
| /unban <number> | Remove user from ban list |
| /mute | Lock group — only admins can send messages |
| /unmute | Unlock group — everyone can send messages |
| /promote @user | Make a user a group admin |
| /demote @user | Remove admin status from a user |
| /tagall <message> | Mention all members in the group |
| /hidetag <message> | Silently notify all members (no visible mentions) |
| /poll Q\|A\|B\|C | Create an interactive poll |
| /grouplink | Get the group's invite link |
| /revoke | Reset/invalidate the current invite link |
| /setgroupname <n> | Change the group's name |
| /setgroupdesc <text> | Change the group's description |
| /listmembers | List all members and admins in the group |

---

## ♻️ 24/7 Uptime with PM2
```bash
npm install -g pm2
pm2 start index.js --name "blaze-md"
pm2 save
pm2 startup
```

---

## ⚠️ Important Notes
1. Use a **secondary WhatsApp number** — not your main
2. Keep the `session/` folder **private and safe**
3. Bot must be **group admin** for moderation commands
4. Delete `session/` and re-scan QR if you get logged out

---

> 🔥 **BLAZE MD** — Built with ❤️ by Randy Blaze ☘️
> 📱 Contact: +237676162113
