const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll with a question and options')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question for the poll')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Comma-separated list of options (e.g., "Option 1, Option 2")')
                .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options');
        const options = optionsString.split(',').map(option => option.trim());

        // Check if options are valid (between 2 and 10)
        if (options.length < 2 || options.length > 10) {
            return interaction.reply({ content: 'Please provide between 2 and 10 options, separated by commas.', ephemeral: true });
        }

        // Check for duplicate options
        const uniqueOptions = [...new Set(options)];
        if (uniqueOptions.length !== options.length) {
            return interaction.reply({ content: 'All options must be unique.', ephemeral: true });
        }

        // Acknowledge the interaction
        await interaction.reply({ content: 'Creating poll...', ephemeral: true });

        // Create the poll embed
        const currDate = new Date();
        const pollEmbed = {
            color: 0x0099ff,
            title: `Poll: ${question}`,
            description: uniqueOptions.map((option, index) => `${index + 1}. ${option}`).join('\n'),
            timestamp: currDate.toDateString(),
        };

        // Send the poll message
        const pollMessage = await interaction.channel.send({ embeds: [pollEmbed] });

        // Add reactions for voting (regional indicator emojis for A, B, C, etc.)
        for (let i = 0; i < uniqueOptions.length; i++) {
            const emoji = String.fromCodePoint(0x1F1E6 + i); // Regional Indicator Symbol for A, B, C, ...
            await pollMessage.react(emoji);
        }

        // Save poll data to Firebase
        const pollData = {
            question: question,
            options: uniqueOptions,
            messageId: pollMessage.id, // Store message ID for future reference (e.g., to tally votes)
            timestamp: currDate.toDateString(),
        };

        // Push the poll data to Firebase
        const pollRef = db.ref('commandUsage/interactive/poll');
        await pollRef.push(pollData);

        // Optionally, you can update the original reply to indicate the poll was created
        await interaction.editReply({ content: 'Poll created successfully!', ephemeral: true });
    },
};
