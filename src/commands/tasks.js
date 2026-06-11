const { EmbedBuilder } = require('discord.js');
const { getTasks, claimTask, freeClaimTask, unclaimTask, completeTask, getOngoingTask } = require('../storage');
const { detectTaskOverlap } = require('../claude');

function buildTaskBoard() {
  const tasks = getTasks();
  const unclaimed = tasks.filter((t) => t.status === 'unclaimed');
  const ongoing = tasks.filter((t) => t.status === 'ongoing');
  const completed = tasks.filter((t) => t.status === 'completed');

  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('Task Board').setTimestamp();

  const fmt = (t) => `\`#${t.id}\` ${t.description}`;
  const fmtOngoing = (t) => `\`#${t.id}\` ${t.description} — @${t.claimedUsername}`;
  const fmtDone = (t) => `~~\`#${t.id}\`~~ ~~${t.description}~~ — @${t.completedUsername}`;

  embed.addFields(
    {
      name: `Unclaimed (${unclaimed.length})`,
      value: unclaimed.length ? unclaimed.map(fmt).join('\n') : '_Nothing here_',
    },
    {
      name: `In Progress (${ongoing.length})`,
      value: ongoing.length ? ongoing.map(fmtOngoing).join('\n') : '_Nothing in progress_',
    },
    {
      name: `Completed (${completed.length})`,
      value: completed.length ? completed.slice(-10).map(fmtDone).join('\n') : '_Nothing completed yet_',
    },
  );

  return embed;
}

async function handleTasks(interaction) {
  await interaction.reply({ embeds: [buildTaskBoard()] });
}

async function handleClaim(interaction) {
  const input = interaction.options.getString('task').trim();
  const userId = interaction.user.id;
  const username = interaction.user.username;

  // If input is a number, claim that task ID
  const taskId = parseInt(input, 10);
  if (!isNaN(taskId)) {
    const task = claimTask(taskId, userId, username);
    if (!task) return interaction.reply({ content: `No task with ID #${taskId} found.`, ephemeral: true });
    if (task.error === 'completed') return interaction.reply({ content: `Task #${taskId} is already completed.`, ephemeral: true });
    return interaction.reply({ content: `Claimed #${taskId}: **${task.description}**`, embeds: [buildTaskBoard()] });
  }

  // Free-form claim — check for overlap first
  const ongoing = getTasks().filter((t) => t.status === 'ongoing' && t.claimedBy !== userId);
  let overlapWarning = '';
  try {
    const overlap = await detectTaskOverlap(input, ongoing);
    if (overlap.hasOverlap && overlap.overlappingIndex >= 0) {
      const conflicting = ongoing[overlap.overlappingIndex];
      overlapWarning = `\n> Heads up: may overlap with @${conflicting.claimedUsername}'s task — "${conflicting.description}". ${overlap.reason}`;
    }
  } catch { /* best-effort */ }

  const task = freeClaimTask(userId, username, input);
  await interaction.reply({
    content: `Claimed: **${task.description}** (#${task.id})${overlapWarning}`,
    embeds: [buildTaskBoard()],
  });
}

async function handleUnclaim(interaction) {
  const task = unclaimTask(interaction.user.id);
  if (!task) return interaction.reply({ content: 'You don\'t have an active task.', ephemeral: true });
  await interaction.reply({ content: `Released: **${task.description}**`, embeds: [buildTaskBoard()] });
}

async function handleDone(interaction) {
  const task = completeTask(interaction.user.id, interaction.user.username);
  if (!task) return interaction.reply({ content: 'You don\'t have an active task to mark done.', ephemeral: true });
  await interaction.reply({ content: `Completed: **${task.description}**`, embeds: [buildTaskBoard()] });
}

module.exports = { handleTasks, handleClaim, handleUnclaim, handleDone, buildTaskBoard };
