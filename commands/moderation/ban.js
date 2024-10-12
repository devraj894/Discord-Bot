const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server')
        .addUserOption(option => 
            option.setName('target')
                  .setDescription('The user to ban')
                  .setRequired(true)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target'); 
        const member = interaction.guild.members.cache.get(targetUser.id); 

        // Check if the command invoker has the BAN_MEMBERS permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                content: "You don't have permission to ban members.",
                ephemeral: true
            });
        }

        // Check if the bot has the BAN_MEMBERS permission
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                content: "I don't have permission to ban members.",
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

        // Try to ban the member
        try {
            await member.ban();
            await interaction.reply({ content: `${targetUser.tag} has been banned from the server.` });

            // Log the ban action in Firebase
            const logRef = db.ref('commandUsage/moderation/ban'); 
            const currDate = new Date();
            await logRef.push({
                userId: targetUser.id,
                userTag: targetUser.tag,
                bannedBy: interaction.user.id,
                bannedByTag: interaction.user.tag,
                timestamp: currDate.toDateString(),
                serverId: interaction.guild.id,
                serverName: interaction.guild.name
            });

        } catch (error) {
            console.error(error); 
            await interaction.reply({
                content: "There was an error while trying to ban the member.",
                ephemeral: true
            });
        }
    }
}
