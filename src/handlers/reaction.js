const { EmbedBuilder } = require('discord.js');
const { getActionItems, markActionItemsReviewed } = require('../storage');

async function handleReaction(reaction, user) {
  if (user.bot) return;
  if (reaction.emoji.name !== '✅') return;

  try {
    // Fetch partial reaction/message if needed
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
  } catch (err) {
    console.error('Failed to fetch partial reaction:', err);
    return;
  }

  const messageId = reaction.message.id;
  const record = getActionItems(messageId);
  if (!record) return;

  const updated = markActionItemsReviewed(messageId, user.id, user.username);
  if (!updated) return;

  const reviewers = updated.reviewedBy.map((r) => `@${r.username}`).join(', ');

  // Edit the embed to show who reviewed
  const existingEmbed = reaction.message.embeds[0];
  if (!existingEmbed) return;

  const updatedEmbed = EmbedBuilder.from(existingEmbed).setFooter({
    text: `Reviewed by: ${reviewers}`,
  });

  await reaction.message.edit({ embeds: [updatedEmbed] }).catch(() => {});
}

module.exports = { handleReaction };
