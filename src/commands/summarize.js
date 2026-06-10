const { summarizeNotes } = require('../claude');
const { addSummary, storeActionItems } = require('../storage');
const { buildEmbed, buildActionItemsEmbed, buildMarkdownAttachment, shouldUseFile } = require('../formatter');
const { setPendingCapture } = require('../sessions');

async function handleSummarize(message, notes) {
  if (!notes || !notes.trim()) {
    setPendingCapture(message.author.id, message.channel.id);
    return message.reply('📝 Send your notes in the next message and I\'ll summarize them.');
  }
  await processSummary(message, notes.trim());
}

async function processSummary(message, notes) {
  const thinking = await message.channel.send('⏳ Processing your notes...');

  try {
    const summary = await summarizeNotes(notes);
    const metadata = {
      author: message.author.username,
      date: new Date().toISOString(),
    };

    addSummary(message.channel.id, { ...summary, ...metadata });

    await thinking.delete();

    if (shouldUseFile(summary)) {
      const attachment = buildMarkdownAttachment(summary, metadata);
      await message.reply({
        content: '📄 Summary is long — here it is as a file:',
        files: [attachment],
      });
    } else {
      const embed = buildEmbed(summary, metadata);
      await message.reply({ embeds: [embed] });
    }

    if (summary.actionItems && summary.actionItems.length > 0) {
      const actionEmbed = buildActionItemsEmbed(summary.actionItems, metadata.date);
      const actionMsg = await message.channel.send({ embeds: [actionEmbed] });
      await actionMsg.react('✅');
      storeActionItems(actionMsg.id, summary.actionItems);
    }
  } catch (err) {
    console.error('summarize error:', err);
    await thinking.delete().catch(() => {});
    await message.reply(`❌ Failed to summarize: ${err.message}`);
  }
}

module.exports = { handleSummarize, processSummary };
