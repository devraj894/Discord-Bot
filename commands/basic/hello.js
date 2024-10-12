const {SlashCommandBuilder} = require('discord.js');
const db = require('../../firebase/firebaseClient');

module.exports = {
    data: new SlashCommandBuilder()
         .setName('hello')
         .setDescription('Replies with hello'),
    async execute(interaction){
        await interaction.reply(`Hello, ${interaction.user.username}`);

        const logRef = db.ref('commandUsage/basic/hello');
        const currDate = new Date();
        await logRef.push({
            userId: interaction.user.id,
            timestamp: currDate.toDateString(),
        });
    },
};