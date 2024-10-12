const { SlashCommandBuilder } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays the avatar of the mentioned user or yourself')
        .addUserOption(option => 
            option.setName('target')
                  .setDescription('The user to get the avatar of')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 512 });

        // Save the avatar URL in Firebase
        const userId = user.id; // Use the user's ID as the key
        try {
            await db.ref('commandUsage/utility/avatar' + userId).set({
                username: user.username,
                avatarURL: avatarURL,
                timestamp: new Date().toDateString()
            });
            console.log(`Avatar URL for ${user.username} saved to Firebase.`);
        } catch (error) {
            console.error('Error saving avatar URL to Firebase:', error);
        }

        // Reply with the avatar
        await interaction.reply(`${user.username}'s avatar: ${avatarURL}`);
    }
};
