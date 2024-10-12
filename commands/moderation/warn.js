const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Gives a warning to a user')
        .addUserOption(option => 
            option.setName('target')
                  .setDescription('The user to warn')
                  .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                  .setDescription('The reason to warn')
                  .setRequired(true)), 
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || "No reason provided"; 
        const member = interaction.guild.members.cache.get(targetUser.id);

        // Check for permission to manage messages
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: 'You do not have permission to issue warnings.', 
                ephemeral: true 
            });
        }

        if (!member) {
            return interaction.reply({ content: 'User not found or not in the server.', ephemeral: true });
        }

        // Reference to the warnings node in your Firebase database
        const warningRef = db.ref('commandUsage/moderation/warn'); 

        try {
            // Get existing warnings for the user
            const snapshot = await warningRef.child(targetUser.id).once('value');
            const userWarnings = snapshot.val() || { count: 0, reasons: [] };

            // Update the warning count and reasons
            userWarnings.count += 1;
            userWarnings.reasons.push(reason);

            // Save the updated warnings back to Firebase
            await warningRef.child(targetUser.id).set(userWarnings);

            await interaction.reply({ 
                content: `${targetUser.tag} has been warned for: "${reason}". Total warnings: ${userWarnings.count}` 
            });

        } catch (error) {
            console.error('Error accessing warnings in Firebase:', error);
            return interaction.reply({
                content: 'There was an error saving the warning.',
                ephemeral: true
            });
        }
    }
};
