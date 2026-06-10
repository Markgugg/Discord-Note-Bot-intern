const { EmbedBuilder } = require('discord.js');
const { detectTaskOverlap } = require('../claude');
const { getClaims, setClaim, clearClaim, addStandup, getLatestStandup, getCoordination } = require('../storage');

async function handleClaim(message, task) {
  if (!task || !task.trim()) {
    return message.reply('⚠️ Usage: `!claim <task description>`');
  }

  const existingClaims = getClaims().filter((c) => c.userId !== message.author.id);

  let overlapWarning = '';
  try {
    const overlap = await detectTaskOverlap(task.trim(), existingClaims);
    if (overlap.hasOverlap && overlap.overlappingIndex >= 0) {
      const conflicting = existingClaims[overlap.overlappingIndex];
      overlapWarning = `\n\n⚠️ **Possible overlap** with **${conflicting.username}**'s task: _"${conflicting.task}"_\n> ${overlap.reason}`;
    }
  } catch {
    // overlap detection is best-effort
  }

  setClaim(message.author.id, message.author.username, task.trim());
  await message.reply(`✅ Claimed: **${task.trim()}**${overlapWarning}`);
}

async function handleUnclaim(message) {
  const had = clearClaim(message.author.id);
  if (had) {
    await message.reply('✅ Task released. You\'re now available.');
  } else {
    await message.reply('⚠️ You don\'t have an active claim.');
  }
}

async function handleTeamStatus(message) {
  const claims = getClaims();

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle('👥 Team Status')
    .setTimestamp();

  if (!claims.length) {
    embed.setDescription('_No active claims — everyone is free!_');
  } else {
    claims.forEach((c) => {
      const when = c.claimedAt ? ` _(since ${new Date(c.claimedAt).toLocaleDateString()})_` : '';
      embed.addFields({ name: `@${c.username}${when}`, value: c.task });
    });
  }

  await message.reply({ embeds: [embed] });
}

async function handleStandup(message, raw) {
  if (!raw || !raw.trim()) {
    return message.reply(
      '⚠️ Usage: `!standup <yesterday> | <today> | <blockers>`\nExample: `!standup Fixed login bug | Working on sidebar | None`',
    );
  }

  const parts = raw.split('|').map((p) => p.trim());
  if (parts.length < 3) {
    return message.reply('⚠️ Please separate sections with `|`. Format: `!standup yesterday | today | blockers`');
  }

  const [yesterday, today, blockers] = parts;
  const standup = { yesterday, today, blockers };
  addStandup(message.author.id, message.author.username, standup);

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`📊 Standup — ${message.author.username}`)
    .addFields(
      { name: '✅ Yesterday', value: yesterday || '_Nothing_' },
      { name: '🔨 Today', value: today || '_Nothing_' },
      { name: '🚧 Blockers', value: blockers || '_None_' },
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleWho(message, keyword) {
  if (!keyword || !keyword.trim()) {
    return message.reply('⚠️ Usage: `!who <keyword>`');
  }

  const kw = keyword.toLowerCase().trim();
  const claims = getClaims().filter((c) => c.task.toLowerCase().includes(kw));

  if (!claims.length) {
    return message.reply(`🔍 No one is currently working on anything matching _"${keyword}"_.`);
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`🔍 Who is working on "${keyword}"?`)
    .setTimestamp();

  claims.forEach((c) => {
    embed.addFields({ name: `@${c.username}`, value: c.task });
  });

  await message.reply({ embeds: [embed] });
}

async function handlePass(message, targetUser, task) {
  if (!targetUser || !task || !task.trim()) {
    return message.reply('⚠️ Usage: `!pass @user <task description>`');
  }

  const member = message.mentions.users.first();
  if (!member) {
    return message.reply('⚠️ Please mention a valid user: `!pass @user <task>`');
  }

  clearClaim(message.author.id);
  setClaim(member.id, member.username, task.trim());

  try {
    await member.send(
      `📬 **${message.author.username}** handed off a task to you in **${message.guild?.name || 'the server'}**:\n\n> ${task.trim()}`,
    );
  } catch {
    // DMs might be closed; that's fine
  }

  await message.reply(
    `📤 Task passed to **${member.username}**: _"${task.trim()}"_\nYour claim has been released.`,
  );
}

module.exports = { handleClaim, handleUnclaim, handleTeamStatus, handleStandup, handleWho, handlePass };
