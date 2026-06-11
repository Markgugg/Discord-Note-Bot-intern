const { generateRecap } = require('../claude');
const { getOngoingTask, getCompletedTasksToday } = require('../storage');

async function handleRecap(interaction) {
  const extraNotes = interaction.options.getString('notes') || '';
  const userId = interaction.user.id;
  const username = interaction.user.username;

  await interaction.deferReply();

  const ongoingTask = getOngoingTask(userId);
  const completedToday = getCompletedTasksToday(userId);

  const completedDescs = completedToday.map((t) => t.description);
  const ongoingDesc = ongoingTask ? ongoingTask.description : null;

  if (!completedDescs.length && !ongoingDesc && !extraNotes.trim()) {
    return interaction.editReply(
      'Nothing to recap yet. Complete a task with `/done` or add notes: `/recap notes:what you did`',
    );
  }

  try {
    const recap = await generateRecap(userId, username, completedDescs, ongoingDesc, extraNotes);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    await interaction.editReply(`**EOD ${date} — ${username}**\n${recap}`);
  } catch (err) {
    console.error('recap error:', err);
    await interaction.editReply(`Failed to generate recap: ${err.message}`);
  }
}

module.exports = { handleRecap };
