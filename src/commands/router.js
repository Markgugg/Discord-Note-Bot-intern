const { handleSummarize } = require('./summarize');
const { handleTasks, handleClaim, handleUnclaim, handleDone } = require('./tasks');
const { handleTeamStatus } = require('./coordination');
const { handleRecap } = require('./eod');
const { handleHelp } = require('./help');
const { handleScreenshot } = require('./screenshot');

async function handleSlashCommand(interaction) {
  switch (interaction.commandName) {
    case 'summarize':  return handleSummarize(interaction);
    case 'tasks':      return handleTasks(interaction);
    case 'claim':      return handleClaim(interaction);
    case 'unclaim':    return handleUnclaim(interaction);
    case 'done':       return handleDone(interaction);
    case 'teamstatus': return handleTeamStatus(interaction);
    case 'recap':      return handleRecap(interaction);
    case 'help':       return handleHelp(interaction);
    case 'ss':         return handleScreenshot(interaction);
  }
}

module.exports = { handleSlashCommand };
