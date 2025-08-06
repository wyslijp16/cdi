const express = require('express');
const path = require('path');
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Sert index.html à la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sert propositions.json
app.get('/propositions.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'propositions.json'));
});

// Lance le serveur web
app.listen(PORT, () => {
  console.log(`Site web en ligne sur le port ${PORT}`);
});

// --- Bot Discord ---
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // Ajoute ton client ID Discord dans les variables d'environnement
const GUILD_ID = process.env.GUILD_ID;   // Ajoute l'ID du serveur Discord dans les variables d'environnement
const PROPOSALS_CHANNEL_ID = 'ID_DU_SALON_PROPOSITIONS'; // À remplacer

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Enregistrement de la commande slash au démarrage
const commands = [
  new SlashCommandBuilder()
    .setName('proposer')
    .setDescription('Propose une ressource à valider')
    .addStringOption(opt => opt.setName('titre').setDescription('Titre').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Description').setRequired(true))
    .addStringOption(opt => opt.setName('lien').setDescription('Lien').setRequired(true))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Commande /proposer enregistrée');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// Gestion de la commande slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'proposer') {
    const title = interaction.options.getString('titre');
    const description = interaction.options.getString('description');
    const url = interaction.options.getString('lien');
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .addFields({ name: 'Lien', value: url })
      .setFooter({ text: `Proposé par ${interaction.user.tag}` });
    const channel = await client.channels.fetch(PROPOSALS_CHANNEL_ID);
    const sent = await channel.send({ embeds: [embed] });
    await sent.react('✅');
    await sent.react('❌');
    await interaction.reply({ content: 'Ta proposition a été envoyée à l\'équipe de modération !', ephemeral: true });
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (reaction.message.channel.id !== PROPOSALS_CHANNEL_ID) return;
  const embed = reaction.message.embeds[0];
  if (!embed) return;
  if (reaction.emoji.name === '✅') {
    const newResource = {
      title: embed.title,
      description: embed.description,
      url: embed.fields[0].value,
    };
    let data = [];
    if (fs.existsSync(path.join(__dirname, 'propositions.json'))) {
      data = JSON.parse(fs.readFileSync(path.join(__dirname, 'propositions.json')));
    }
    data.push(newResource);
    fs.writeFileSync(path.join(__dirname, 'propositions.json'), JSON.stringify(data, null, 2));
    await reaction.message.reply('✅ Proposition acceptée et ajoutée !');
  }
  if (reaction.emoji.name === '❌') {
    await reaction.message.reply('❌ Proposition refusée.');
  }
});

client.login(TOKEN);
