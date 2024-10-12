const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebaseClient');  

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    async execute(interaction) {
        // Log the usage of the server command
        const logRef = db.ref('commandUsage/info/server');
        const currDate = new Date();
        await logRef.push({
            userId: interaction.user.id,
            username: interaction.user.tag,
            serverName: interaction.guild.name,
            memberCount: interaction.guild.memberCount,
            timestamp: currDate.toDateString()
        });

        // Reply with server information
        await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members`);
    },
};
