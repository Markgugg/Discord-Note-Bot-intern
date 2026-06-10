const { NOTES_CHANNEL, PREFIX } = require('../../config');
const { hasPendingCapture, clearPendingCapture, hasSession, appendToSession } = require('../sessions');
const { processSummary } = require('../commands/summarize');
const { routeMessage } = require('../commands/router');

// Commands that are allowed in any channel even when NOTES_CHANNEL is set
const COORDINATION_COMMANDS = new Set([
  'claim', 'unclaim', 'teamstatus', 'team', 'standup', 'who', 'pass', 'help',
]);

function isCoordinationCommand(content) {
  const trimmed = content.trim();
  if (!trimmed.startsWith(PREFIX)) return false;
  const cmd = trimmed.slice(PREFIX.length).trim().split(/\s+/)[0].toLowerCase();
  return COORDINATION_COMMANDS.has(cmd);
}

async function handleMessage(message) {
  if (message.author.bot) return;

  const inNotesChannel =
    !NOTES_CHANNEL || message.channel.name === NOTES_CHANNEL;

  // Outside notes channel: only allow coordination commands
  if (!inNotesChannel && !isCoordinationCommand(message.content)) return;

  // Handle pending captures: user sent "!summarize" alone, next message is the notes
  if (hasPendingCapture(message.author.id)) {
    if (!message.content.startsWith(PREFIX)) {
      clearPendingCapture(message.author.id);
      await processSummary(message, message.content.trim());
      return;
    }
    // If user typed another command instead, cancel the pending capture
    clearPendingCapture(message.author.id);
  }

  // Append to active collection session
  if (hasSession(message.author.id)) {
    const content = message.content.trim();
    // !done and !cancel are handled via the router below; don't swallow them
    if (!content.startsWith(PREFIX)) {
      appendToSession(message.author.id, content);
      await message.react('📝').catch(() => {});
      return;
    }
  }

  await routeMessage(message);
}

module.exports = { handleMessage };
