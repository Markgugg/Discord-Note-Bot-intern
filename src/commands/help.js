const { EmbedBuilder } = require('discord.js');
const { PREFIX } = require('../../config');

async function handleHelp(message) {
  const p = PREFIX;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📖 Bot Commands')
    .setDescription('Call notes processor + intern team coordination bot')
    .addFields(
      {
        name: '📋 Notes Commands',
        value: [
          `\`${p}summarize [notes]\` — Summarize notes immediately (or send notes in next message)`,
          `\`${p}start\` — Begin multi-message session`,
          `\`${p}done\` — End session and summarize collected notes`,
          `\`${p}cancel\` — Discard active session`,
          `\`/history\` or \`${p}history\` — Show last 5 summaries in this channel`,
          `\`${p}help\` — Show this message`,
        ].join('\n'),
      },
      {
        name: '🤝 Coordination Commands',
        value: [
          `\`${p}claim <task>\` — Claim a task you're working on`,
          `\`${p}unclaim\` — Release your current claim`,
          `\`${p}teamstatus\` — See what everyone is working on`,
          `\`${p}standup <yesterday> | <today> | <blockers>\` — Post your daily standup`,
          `\`${p}who <keyword>\` — Search who is working on something`,
          `\`${p}pass @user <task>\` — Hand off a task to someone else`,
        ].join('\n'),
      },
      {
        name: '💡 Tips',
        value: [
          '• React with ✅ on an action items message to mark it reviewed',
          '• For long notes, use `!start` / `!done` to paste in multiple messages',
          '• Long summaries are automatically sent as `.md` file attachments',
          '• `!claim` will warn you if your task overlaps with a teammate\'s',
        ].join('\n'),
      },
    )
    .setFooter({ text: 'Powered by Claude' });

  await message.reply({ embeds: [embed] });
}

module.exports = { handleHelp };
