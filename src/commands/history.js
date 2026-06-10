const { EmbedBuilder } = require('discord.js');
const { getSummaries } = require('../storage');
const { HISTORY_LIMIT } = require('../../config');

async function handleHistory(message, interaction) {
  const channelId = message ? message.channel.id : interaction.channelId;
  const summaries = getSummaries(channelId);

  if (!summaries.length) {
    const reply = 'No summaries found in this channel yet.';
    if (interaction) return interaction.reply({ content: reply, ephemeral: true });
    return message.reply(reply);
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📚 Last ${Math.min(summaries.length, HISTORY_LIMIT)} Summaries`)
    .setTimestamp();

  summaries
    .slice(-HISTORY_LIMIT)
    .reverse()
    .forEach((s, i) => {
      const date = s.timestamp ? new Date(s.timestamp).toLocaleDateString() : 'Unknown date';
      const author = s.author ? ` · ${s.author}` : '';
      const preview = s.summary ? s.summary.slice(0, 120) + (s.summary.length > 120 ? '...' : '') : '_No summary_';
      embed.addFields({ name: `#${i + 1} — ${date}${author}`, value: preview });
    });

  if (interaction) return interaction.reply({ embeds: [embed] });
  return message.reply({ embeds: [embed] });
}

module.exports = { handleHistory };
