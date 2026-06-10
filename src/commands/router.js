const { PREFIX } = require('../../config');
const { handleSummarize } = require('./summarize');
const { handleStart, handleDone, handleCancel } = require('./session');
const { handleHistory } = require('./history');
const { handleHelp } = require('./help');
const { handleEod } = require('./eod');
const {
  handleClaim,
  handleUnclaim,
  handleTeamStatus,
  handleStandup,
  handleWho,
  handlePass,
} = require('./coordination');

async function handleCommand(message, commandName, args) {
  switch (commandName) {
    case 'summarize':
    case 's':
      return handleSummarize(message, args.join(' '));

    case 'start':
      return handleStart(message);

    case 'done':
      return handleDone(message);

    case 'cancel':
      return handleCancel(message);

    case 'history':
      return handleHistory(message, null);

    case 'help':
      return handleHelp(message);

    case 'claim':
      return handleClaim(message, args.join(' '));

    case 'unclaim':
      return handleUnclaim(message);

    case 'teamstatus':
    case 'team':
      return handleTeamStatus(message);

    case 'standup':
      return handleStandup(message, args.join(' '));

    case 'who':
      return handleWho(message, args.join(' '));

    case 'pass':
      // !pass @user task description
      return handlePass(message, args[0], args.slice(1).join(' '));

    case 'eod':
    case 'dayrecap':
      return handleEod(message, args.join(' '));

    default:
      // Unknown command — silently ignore
      break;
  }
}

async function routeMessage(message) {
  const content = message.content.trim();
  if (!content.startsWith(PREFIX)) return false;

  const withoutPrefix = content.slice(PREFIX.length).trim();
  const [commandName, ...args] = withoutPrefix.split(/\s+/);

  if (!commandName) return false;

  await handleCommand(message, commandName.toLowerCase(), args);
  return true;
}

async function handleSlashCommand(interaction) {
  if (interaction.commandName === 'history') {
    const { handleHistory } = require('./history');
    return handleHistory(null, interaction);
  }
}

module.exports = { routeMessage, handleSlashCommand };
