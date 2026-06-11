// Message handler — only handles reaction-tracked action items and screenshot drops.
// All commands are now slash commands.

async function handleMessage(message) {
  if (message.author.bot) return;
  // Nothing to handle via message events — slash commands cover everything.
  // Screenshot drops via /ss slash command handle attachment input.
}

module.exports = { handleMessage };
