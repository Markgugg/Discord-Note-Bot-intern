const { EmbedBuilder } = require('discord.js');
const { getTasks } = require('../storage');

async function handleTeamStatus(interaction) {
  const tasks = getTasks();
  const ongoing = tasks.filter((t) => t.status === 'ongoing');

  const embed = new EmbedBuilder().setColor(0xfee75c).setTitle('Team Status').setTimestamp();

  if (!ongoing.length) {
    embed.setDescription('Nobody has an active task right now.');
  } else {
    ongoing.forEach((t) => {
      embed.addFields({ name: `@${t.claimedUsername}`, value: t.description });
    });
  }

  await interaction.reply({ embeds: [embed] });
}

module.exports = { handleTeamStatus };
