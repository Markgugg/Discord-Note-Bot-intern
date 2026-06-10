const { startSession, hasSession, cancelSession } = require('../sessions');

async function handleStart(message) {
  if (hasSession(message.author.id)) {
    return message.reply('⚠️ You already have an active session. Use `!done` to finish or `!cancel` to discard it.');
  }
  startSession(message.author.id, message.channel.id);
  await message.reply('📝 Session started. Paste your notes in multiple messages, then type `!done` when finished.');
}

async function handleDone(message) {
  const { endSession } = require('../sessions');
  const { processSummary } = require('./summarize');

  if (!hasSession(message.author.id)) {
    return message.reply('⚠️ No active session. Start one with `!start`.');
  }

  const notes = endSession(message.author.id);
  if (!notes || !notes.trim()) {
    return message.reply('⚠️ Session ended but no notes were collected. Try again with `!start`.');
  }

  await message.reply('✅ Session ended. Summarizing your notes...');
  await processSummary(message, notes);
}

async function handleCancel(message) {
  const had = cancelSession(message.author.id);
  if (had) {
    await message.reply('🗑️ Session cancelled. All collected notes discarded.');
  } else {
    await message.reply('⚠️ No active session to cancel.');
  }
}

module.exports = { handleStart, handleDone, handleCancel };
