require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('history')
    .setDescription('Show the last 5 call note summaries in this channel'),
].map((cmd) => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!clientId) {
    console.error('❌ CLIENT_ID is not set in .env');
    process.exit(1);
  }

  try {
    console.log('Registering slash commands...');

    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    await rest.put(route, { body: commands });

    if (guildId) {
      console.log(`✅ Slash commands registered to guild ${guildId} (instant)`);
    } else {
      console.log('✅ Slash commands registered globally (may take up to 1 hour to propagate)');
    }
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
    process.exit(1);
  }
})();
