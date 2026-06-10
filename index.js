require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { handleMessage } = require('./src/handlers/message');
const { handleReaction } = require('./src/handlers/reaction');
const { handleSlashCommand } = require('./src/commands/router');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📋 Notes channel: ${process.env.NOTES_CHANNEL || 'any channel'}`);
});

client.on('messageCreate', handleMessage);
client.on('messageReactionAdd', handleReaction);
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    await handleSlashCommand(interaction);
  } catch (err) {
    console.error('Slash command error:', err);
    const reply = { content: '❌ Something went wrong.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
