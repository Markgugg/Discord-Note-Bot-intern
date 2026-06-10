require('dotenv').config();

module.exports = {
  NOTES_CHANNEL: process.env.NOTES_CHANNEL || null,
  PREFIX: process.env.PREFIX || '!',
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
  OUTPUT_FORMAT: process.env.OUTPUT_FORMAT || 'auto',
  EMBED_CHAR_LIMIT: 1800,
  HISTORY_LIMIT: 5,
  STORAGE_FILE: './data/storage.json',
};
