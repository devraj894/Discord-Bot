const {Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { time } = require('console');
const db = require('./firebase/firebaseClient');
const express = require('express');
require('dotenv/config');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const client = new Client({intents: [GatewayIntentBits.Guilds]});
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolder = fs.readdirSync(foldersPath);

for(const folder of commandFolder){
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for(const file of commandFiles){
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if(!command){
        console.log(`No command matching ${interaction.commandName} was found.`);
    }

    try {
        if (command.data.name === 'save') {
            const userId = interaction.user.id;
            const userData = {
                username: interaction.user.username,
                serverId: interaction.guild.id,
                commandUsed: interaction.commandName
            };
            
            await db.ref(`users/${userId}`).set(userData);
            await interaction.reply({ content: 'Your data has been saved!', ephemeral: true });
        } else {
            await command.execute(interaction);
        }
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
})

client.login(process.env.TOKEN);