const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('Set a reminder for a specified time')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time to wait before reminding you (e.g., 10s, 1m, 1h)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('task')
                .setDescription('The task to remind you')
                .setRequired(true)),
    async execute(interaction) {
        const timeString = interaction.options.getString('time');
        const task = interaction.options.getString('task');

        const timeInMs = parseTime(timeString);
        if (timeInMs === null) {
            return interaction.reply({ content: 'Invalid time format. Please use the format: [number][s/m/h]', ephemeral: true });
        }

        await interaction.reply({ content: `I will remind you about "${task}" in ${timeString}.`, ephemeral: true });

        // Log the reminder in Firebase
        const reminderRef = db.ref('commandUsage/task/remindme'); 
        const currDate = new Date();
        const reminderData = {
            userId: interaction.user.id,
            task: task,
            time: timeString,
            timestamp: currDate.toDateString() + timeInMs 
        };

        await reminderRef.push(reminderData); 

        // Set a timeout to send the reminder
        setTimeout(async () => {
            const user = await interaction.client.users.fetch(interaction.user.id);
            if (user) {
                await user.send(`Reminder: ${task}`);
            }
        }, timeInMs);
    },
};

function parseTime(timeString) {
    const match = timeString.match(/^(\d+)(s|m|h)$/);
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
