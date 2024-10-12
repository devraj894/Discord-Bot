const {SlashCommandBuilder} = require('discord.js');
const db = require('../../firebase/firebaseClient');

module.exports = {
    data: new SlashCommandBuilder()
         .setName('ping')
         .setDescription('Replies with Pong'),
    async execute(interaction){
        await interaction.reply('Pong!');

        const logRef = db.ref('commandUsage/basic/ping');
        const currDate = new Date();
        await logRef.push({
            userId: interaction.user.id,
            timestamp: currDate.toDateString(),
        })
    },
};