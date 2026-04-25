require('dotenv').config();
const axios = require('axios');
const { loadData, saveData } = require('../database');

// In-memory AI chat history per user (premium feature for persistence)
const chatHistory = {};

async function chat(userMessage, userNumber, isPremium = false) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return '🤖 AI is not configured yet. Ask the owner to set up the AI API key.';
  }

  try {
    // Build message history
    if (!chatHistory[userNumber]) chatHistory[userNumber] = [];

    // Non-premium: only keep last 2 messages (no memory)
    if (!isPremium && chatHistory[userNumber].length > 4) {
      chatHistory[userNumber] = [];
    }

    chatHistory[userNumber].push({ role: 'user', content: userMessage });

    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.AI_MODEL || 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are BLAZE MD, a helpful WhatsApp bot assistant created by Randy Blaze. You are friendly, concise, and helpful. Keep responses short and suitable for WhatsApp. Use emojis occasionally.`,
          },
          ...chatHistory[userNumber].slice(-10), // Last 10 messages
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/blaze-md',
          'X-Title': 'BLAZE MD Bot',
        },
        timeout: 15000,
      }
    );

    const reply = res.data.choices?.[0]?.message?.content || '🤖 No response from AI.';
    chatHistory[userNumber].push({ role: 'assistant', content: reply });

    return reply;
  } catch (err) {
    if (err.response?.status === 401) {
      return '❌ Invalid AI API key. Contact the owner.';
    }
    if (err.response?.status === 429) {
      return '⚠️ AI is busy right now. Please try again later.';
    }
    console.error('AI error:', err.message);
    return '❌ AI is currently unavailable. Please try again later.';
  }
}

async function command({ sock, from, args, senderNumber, db }) {
  const reply = async (text) => sock.sendMessage(from, { text });

  if (!db.settings.aiEnabled) {
    return reply('❌ AI is currently disabled.\nAsk an admin to enable it with */ai on*');
  }

  const message = args.join(' ');
  if (!message) return reply('❓ Usage: /chat <your message>\nExample: /chat What is the capital of France?');

  await sock.sendPresenceUpdate('composing', from);

  const isPremium = !!db.premiumUsers?.[senderNumber];
  const response = await chat(message, senderNumber, isPremium);

  await sock.sendMessage(from, {
    text: `🤖 *BLAZE AI*${isPremium ? ' 💎' : ''}\n\n${response}`,
  });
}

module.exports = { command, chat };
