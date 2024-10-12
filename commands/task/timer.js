const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Set a time for a specified duration')
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration for the timer (e.g., 10s, 1m, 1h)')
                .setRequired(true)),
    async execute(interaction) {
        const durationString = interaction.options.getString('duration');

        // Parse the duration string (e.g., 10s, 1m, 1h)
        const durationInMs = parseDuration(durationString);
        if (durationInMs === null) {
            return interaction.reply({ content: 'Invalid duration format. Please use the format: [number][s/m/h]', ephemeral: true });
        }

        // Send a confirmation message
        await interaction.reply({ content: `Timer set for ${durationString}.`, ephemeral: true });

        // Log the timer in Firebase
        const timerRef = db.ref('commandUsage/task/timer'); 
        const currDate = new Date();
        const timerData = {
            userId: interaction.user.id,
            duration: durationString,
            timestamp: currDate.toDateString() + durationInMs 
        };

        await timerRef.push(timerData); 

        // Set a timeout for the timer
        setTimeout(async () => {
            const user = await interaction.client.users.fetch(interaction.user.id); // Fetch user to send DM
            if (user) {
                await user.send(`⏰ Time's up! Your timer for ${durationString} has finished.`);
            }
        }, durationInMs);
    },
};

// Function to parse duration string into milliseconds
function parseDuration(durationString) {
    const match = durationString.match(/^(\d+)(s|m|h)$/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's':
            return value * 1000; 
        case 'm':
            return value * 60 * 1000; 
        case 'h':
            return value * 60 * 60 * 1000;
        default:
            return null; 
    }              
}
