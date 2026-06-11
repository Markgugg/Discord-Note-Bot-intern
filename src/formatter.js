const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { OUTPUT_FORMAT, EMBED_CHAR_LIMIT } = require('../config');

const stripOwner = (s) => s.replace(/\s*\(owner:[^)]*\)/gi, '').trim();

function buildEmbed(summary, metadata = {}) {
  const { author, date } = metadata;

  const truncate = (text, max = 1024) =>
    text.length > max ? text.slice(0, max - 3) + '...' : text;

  const formatList = (arr) =>
    arr && arr.length ? arr.map((i) => `• ${i}`).join('\n') : '_None noted_';

  const formatActionItems = (arr) =>
    arr && arr.length ? arr.map((i) => `- [ ] ${stripOwner(i)}`).join('\n') : '_None noted_';

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📋 Call Notes Summary')
    .setTimestamp(date ? new Date(date) : new Date());

  if (author) embed.setFooter({ text: `Summarized by ${author}` });

  if (summary.summary) {
    embed.setDescription(truncate(summary.summary, 4096));
  }

  embed.addFields(
    {
      name: '👥 Participants / Context',
      value: truncate(summary.participants || '_Not specified_'),
    },
    {
      name: '💬 Key Discussion Points',
      value: truncate(formatList(summary.keyPoints)),
    },
    {
      name: '✅ Action Items',
      value: truncate(formatActionItems(summary.actionItems)),
    },
  );

  if (summary.blockers && summary.blockers.length > 0) {
    embed.addFields({ name: '🚧 Blockers / Issues', value: truncate(formatList(summary.blockers)) });
  }

  if (summary.decisions && summary.decisions.length > 0) {
    embed.addFields({ name: '⚖️ Decisions Made', value: truncate(formatList(summary.decisions)) });
  }

  if (summary.nextSteps && summary.nextSteps.length > 0) {
    embed.addFields({ name: '🔜 Next Steps', value: truncate(formatList(summary.nextSteps)) });
  }

  return embed;
}

function summaryToMarkdown(summary, metadata = {}) {
  const { author, date } = metadata;
  const d = date ? new Date(date) : new Date();
  const dateStr = d.toISOString().split('T')[0];

  const formatList = (arr) =>
    arr && arr.length ? arr.map((i) => `- ${i}`).join('\n') : '_None noted_';

  const formatActionItems = (arr) =>
    arr && arr.length ? arr.map((i) => `- [ ] ${stripOwner(i)}`).join('\n') : '_None noted_';

  return `# Call Notes Summary
_Generated: ${dateStr}${author ? ` | Submitted by: ${author}` : ''}_

## Call Summary
${summary.summary || '_Not provided_'}

## Participants / Context
${summary.participants || '_Not specified_'}

## Key Discussion Points
${formatList(summary.keyPoints)}

## Action Items
${formatActionItems(summary.actionItems)}

## Blockers / Issues
${formatList(summary.blockers)}

## Decisions Made
${formatList(summary.decisions)}

## Next Steps / Follow-up
${formatList(summary.nextSteps)}
`;
}

function buildMarkdownAttachment(summary, metadata = {}) {
  const content = summaryToMarkdown(summary, metadata);
  const date = metadata.date ? new Date(metadata.date) : new Date();
  const dateStr = date.toISOString().split('T')[0];
  const buffer = Buffer.from(content, 'utf8');
  return new AttachmentBuilder(buffer, { name: `call-notes-${dateStr}.md` });
}

function shouldUseFile(summary) {
  if (OUTPUT_FORMAT === 'file') return true;
  if (OUTPUT_FORMAT === 'embed') return false;

  const allText = [
    summary.summary || '',
    summary.participants || '',
    ...(summary.keyPoints || []),
    ...(summary.actionItems || []),
    ...(summary.blockers || []),
    ...(summary.decisions || []),
    ...(summary.nextSteps || []),
  ].join(' ');

  return allText.length > EMBED_CHAR_LIMIT;
}

module.exports = {
  buildEmbed,
  buildMarkdownAttachment,
  shouldUseFile,
  summaryToMarkdown,
};
