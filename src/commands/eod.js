const { EmbedBuilder } = require('discord.js');
const Anthropic = require('@anthropic-ai/sdk');
const { CLAUDE_MODEL } = require('../../config');
const { getLatestStandup, getClaims } = require('../storage');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function handleEod(message, extraNotes) {
  const standup = getLatestStandup(message.author.id);
  const claims = getClaims().find((c) => c.userId === message.author.id);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const context = [];
  if (standup) {
    if (standup.yesterday) context.push(`Yesterday: ${standup.yesterday}`);
    if (standup.today) context.push(`Today's plan: ${standup.today}`);
    if (standup.blockers) context.push(`Blockers: ${standup.blockers}`);
  }
  if (claims) context.push(`Currently claimed task: ${claims.task}`);
  if (extraNotes && extraNotes.trim()) context.push(`Additional notes: ${extraNotes.trim()}`);

  if (!context.length) {
    return message.reply(
      '⚠️ Nothing to summarize yet. Post a standup with `!standup yesterday | today | blockers` first, or run `!eod <what you did today>`.',
    );
  }

  const thinking = await message.channel.send('⏳ Generating your EOD Slack post...');

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: `You write end-of-day Slack update posts for a software intern.
Write a clean, professional, copy-paste-ready Slack message.
Format it with Slack markdown (*bold*, bullet points with •).
Keep it concise — 5-10 lines max.
Structure:
*End of Day — [date]*

*Accomplished:*
• ...

*In Progress:*
• ...

*Blockers:*
• ... (or "None")

Do not add any intro text outside the Slack post itself.`,
      messages: [
        {
          role: 'user',
          content: `Date: ${todayStr}\nTeam member: ${message.author.username}\n\n${context.join('\n')}`,
        },
      ],
    });

    const slackPost = response.content[0].text.trim();

    await thinking.delete();

    const embed = new EmbedBuilder()
      .setColor(0x4a154b)
      .setTitle('💬 Your Slack EOD Post')
      .setDescription(`\`\`\`\n${slackPost}\n\`\`\``)
      .setFooter({ text: 'Copy the text above and paste it into Slack' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Also send the raw text so it's easy to copy
    await message.channel.send(`📋 **Raw text to copy:**\n${slackPost}`);
  } catch (err) {
    console.error('eod error:', err);
    await thinking.delete().catch(() => {});
    await message.reply(`❌ Failed to generate EOD post: ${err.message}`);
  }
}

module.exports = { handleEod };
