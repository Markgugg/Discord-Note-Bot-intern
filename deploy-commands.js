require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize meeting notes and add action items to the task board')
    .addStringOption((o) =>
      o.setName('notes').setDescription('Paste your raw notes here').setRequired(true).setMaxLength(4000)
    ),

  new SlashCommandBuilder()
    .setName('tasks')
    .setDescription('Show the task board — unclaimed, in progress, and completed'),

  new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim a task by number (#3) or describe a new one')
    .addStringOption((o) =>
      o.setName('task').setDescription('Task number (e.g. 3) or a description').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('done')
    .setDescription('Mark your current task as complete'),

  new SlashCommandBuilder()
    .setName('unclaim')
    .setDescription('Drop your current task back to unclaimed'),

  new SlashCommandBuilder()
    .setName('teamstatus')
    .setDescription('See who is working on what'),

  new SlashCommandBuilder()
    .setName('recap')
    .setDescription('Generate a plain EOD update to paste into Slack')
    .addStringOption((o) =>
      o.setName('notes').setDescription('Optional: anything extra to include').setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('ss')
    .setDescription('Drop a screenshot and the bot will figure out what you\'re working on')
    .addAttachmentOption((o) =>
      o.setName('screenshot').setDescription('Your screenshot').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands'),

].map((cmd) => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!clientId) {
    console.error('CLIENT_ID is not set in .env');
    process.exit(1);
  }

  try {
    console.log('Registering slash commands...');
    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);
    await rest.put(route, { body: commands });
    console.log(`Registered ${commands.length} slash commands${guildId ? ` to guild ${guildId}` : ' globally'}`);
  } catch (err) {
    console.error('Failed to register commands:', err);
    process.exit(1);
  }
})();
