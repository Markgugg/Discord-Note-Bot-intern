const { summarizeNotes } = require('../claude');
const { addTasks, storeActionItems } = require('../storage');
const { buildEmbed, buildMarkdownAttachment, shouldUseFile } = require('../formatter');
const { buildTaskBoard } = require('./tasks');
const { EmbedBuilder } = require('discord.js');

async function handleSummarize(interaction) {
  const notes = interaction.options.getString('notes');
  await interaction.deferReply();

  try {
    const summary = await summarizeNotes(notes);
    const metadata = {
      author: interaction.user.username,
      date: new Date().toISOString(),
    };

    // Post summary
    if (shouldUseFile(summary)) {
      const attachment = buildMarkdownAttachment(summary, metadata);
      await interaction.editReply({ content: 'Summary is long — here it is as a file:', files: [attachment] });
    } else {
      const embed = buildEmbed(summary, metadata);
      await interaction.editReply({ embeds: [embed] });
    }

    // Create tasks from action items and post board
    if (summary.actionItems && summary.actionItems.length > 0) {
      const newTasks = addTasks(summary.actionItems);

      const taskEmbed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('Tasks added from these notes')
        .setDescription(newTasks.map((t) => `\`#${t.id}\` ${t.description}`).join('\n'))
        .setFooter({ text: 'Use /claim to pick one up' })
        .setTimestamp();

      const boardEmbed = buildTaskBoard();
      await interaction.followUp({ embeds: [taskEmbed, boardEmbed] });

      // React tracking on task embed
      const msg = await interaction.fetchReply();
      await msg.react('✅').catch(() => {});
      storeActionItems(msg.id, summary.actionItems);
    }
  } catch (err) {
    console.error('summarize error:', err);
    await interaction.editReply(`Failed to summarize: ${err.message}`);
  }
}

module.exports = { handleSummarize };
