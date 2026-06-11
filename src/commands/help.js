const { EmbedBuilder } = require('discord.js');

async function handleHelp(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Commands')
    .addFields(
      {
        name: 'Notes',
        value: [
          '`/summarize notes:` — Summarize meeting notes and add action items to the task board',
        ].join('\n'),
      },
      {
        name: 'Tasks',
        value: [
          '`/tasks` — Show the full task board (unclaimed / in progress / completed)',
          '`/claim task:` — Claim a task by number (e.g. `3`) or description',
          '`/done` — Mark your current task as complete',
          '`/unclaim` — Drop your current task back to unclaimed',
        ].join('\n'),
      },
      {
        name: 'Team',
        value: [
          '`/teamstatus` — See who is working on what',
          '`/recap [notes:]` — Generate a plain EOD update to paste into Slack',
        ].join('\n'),
      },
      {
        name: 'Tips',
        value: [
          '• React with ✅ on an action items message to mark it reviewed',
          '• Drop a screenshot and the bot will analyze what you\'re working on',
          '• Fill in `context.md` with your project info so the bot has better context',
        ].join('\n'),
      },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { handleHelp };
