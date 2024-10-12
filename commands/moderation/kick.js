const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server')
        .addUserOption(option =>  
            option.setName('target')
                  .setDescription('The user to kick')
                  .setRequired(true)
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target'); 
        const member = interaction.guild.members.cache.get(targetUser.id);

        // Check if the command invoker has the KICK_MEMBERS permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) { 
            return interaction.reply({
                content: "You don't have permission to kick members.",
                ephemeral: true
            });
        }

        // Check if the bot has the KICK_MEMBERS permission
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) { 
            return interaction.reply({
                content: "I don't have permission to kick members.",
                ephemeral: true
            });
        }

        // Check if the target user is a member of the guild
        if (!member) {
            return interaction.reply({
                content: "User not found or not in the server.",
                ephemeral: true
            });
        }

        // Try to kick the member
        try {
            await member.kick();
            await interaction.reply({ content: `${targetUser.tag} has been kicked from the server.` });

            // Log the kick action in Firebase
            const logRef = db.ref('commandUsage/moderation/kick'); 
            const currDate = new Date();
            await logRef.push({
                userId: targetUser.id,
                userTag: targetUser.tag,
                kickedBy: interaction.user.id,
                kickedByTag: interaction.user.tag,
                timestamp: currDate.toDateString(),
                serverId: interaction.guild.id,
                serverName: interaction.guild.name
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was an error while trying to kick the member.",
                ephemeral: true
            });
        }
    }
}
