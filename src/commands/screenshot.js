const { analyzeScreenshot } = require('../claude');
const { freeClaimTask } = require('../storage');
const { buildTaskBoard } = require('./tasks');

async function handleScreenshot(interaction) {
  const attachment = interaction.options.getAttachment('screenshot');

  if (!attachment || !attachment.contentType?.startsWith('image/')) {
    return interaction.reply({ content: 'Please attach an image.', ephemeral: true });
  }

  await interaction.deferReply();

  try {
    const result = await analyzeScreenshot(attachment.url, interaction.user.username);

    const lines = [
      `**What I see:** ${result.description}`,
      `**Suggested claim:** \`${result.suggestedClaim}\``,
      '',
      'Use `/claim` to claim this task, or `/claim task:' + result.suggestedClaim + '` to claim it directly.',
    ];

    await interaction.editReply(lines.join('\n'));
  } catch (err) {
    console.error('screenshot error:', err);
    await interaction.editReply(`Failed to analyze screenshot: ${err.message}`);
  }
}

module.exports = { handleScreenshot };
