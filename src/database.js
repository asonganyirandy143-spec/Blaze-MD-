const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

const defaultData = {
  settings: {
    autoReply: false,
    aiEnabled: false,
    botName: process.env.BOT_NAME || 'BLAZE MD',
    warnLimit: parseInt(process.env.MAX_WARNINGS) || 2,
  },
  premiumUsers: {},
  warnings: {},
  groups: {},
  autoReplyTracker: {},
  updateLog: [
    { version: '1.0.0', date: '2025-01-01', notes: 'Initial release of BLAZE MD' },
  ],
};

function loadData() {
  try {
    fs.ensureDirSync(path.dirname(DB_PATH));
    if (!fs.existsSync(DB_PATH)) {
      fs.writeJsonSync(DB_PATH, defaultData, { spaces: 2 });
      return JSON.parse(JSON.stringify(defaultData));
    }
    const data = fs.readJsonSync(DB_PATH);
    // Merge with defaults to ensure all keys exist
    return deepMerge(JSON.parse(JSON.stringify(defaultData)), data);
  } catch (err) {
    console.error('DB load error:', err);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function saveData(data) {
  try {
    fs.ensureDirSync(path.dirname(DB_PATH));
    fs.writeJsonSync(DB_PATH, data, { spaces: 2 });
    return true;
  } catch (err) {
    console.error('DB save error:', err);
    return false;
  }
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = { loadData, saveData };
