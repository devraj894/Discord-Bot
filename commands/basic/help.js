const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../firebase/firebaseClient');  

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands and their descriptions'),
    async execute(interaction) {
        // Log the usage of the help command
        const logRef = db.ref('commandUsage/basic/help'); 
        const currDate = new Date();
        await logRef.push({
            userId: interaction.user.id,
            timestamp: currDate.toDateString(),
            username: interaction.user.tag
        });

        // Create and send the embed
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Help Menu - List of Commands')
            .setDescription('Here are all the commands you can use:')
            .addFields(
                { name: '/ping', value: 'Responds with "Pong!" to check if the bot is online.' },
                { name: '/hello', value: 'Greets the user with a personalized message.' },
                { name: '/server', value: 'Provides the information about the server' },
                { name: '/user', value: 'Provides the information about the user' },
                { name: '/help', value: 'Shows all the available commands for the bot' },
                { name: '/meme', value: 'Provides a random meme' },
                { name: '/quote', value: 'Provides a random quote' },
                { name: '/weather', value: 'Provides information regarding weather' },
                { name: '/avatar', value: 'Displays the avatar of the mentioned user or yourself' },
                { name: '/kick', value: 'Kicks a user from the server' },
                { name: '/ban', value: 'Bans a user from the server' },
                { name: '/warning', value: 'Issues a warning to the user' },
                { name: '/remindme', value: 'Sets a reminder for a specified time' },
                { name: '/timer', value: 'Sets a timer for a specified duration' },
                { name: '/poll', value: 'Creates a poll with a question and options' },
                { name: '/addrole', value: 'Assigns a role to the user' },
                { name: '/removerole', value: 'Removes a role from the user' },
                { name: '/ask', value: 'Ask anything from the bot' }
            )
            .setFooter({ text: 'Use the commands to interact with the bot!', iconURL: interaction.client.user.avatarURL() });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
