const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),
    async execute(interaction) {
        // Log the usage of the user command
        const logRef = db.ref('commandUsage/info/user');
        const currDate = new Date();
        await logRef.push({
            userId: interaction.user.id,
            username: interaction.user.tag,
            joinedAt: interaction.member.joinedAt,
            timestamp: currDate.toDateString()
        });

        // Reply with user information
        await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
    },
};
