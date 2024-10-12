const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Remove a role from a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove the role from')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to remove from the user')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the command was executed in a guild (not in DM)
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        let member;

        // Check if the user is a member of the guild
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            return interaction.reply({ content: 'User not found in the server.', ephemeral: true });
        }

        // Check if the bot has permission to manage roles
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: true });
        }

        // Check if the user has permission to remove the role
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to remove roles.', ephemeral: true });
        }

        // Check if the user currently has the role
        if (!member.roles.cache.has(role.id)) {
            return interaction.reply({ content: `User does not have the role ${role.name}.`, ephemeral: true });
        }

        // Acknowledge the interaction
        await interaction.deferReply();

        // Remove the role from the user
        try {
            await member.roles.remove(role);

            // Log the role removal to Firebase
            const roleRemovalRef = db.ref('commandUsage/role/removerole'); 
            const currDate = new Date();
            const removalData = {
                userId: user.id,
                username: user.username,
                roleId: role.id,
                roleName: role.name,
                removedBy: interaction.user.id,
                timestamp: currDate.toDateString()
            };

            await roleRemovalRef.push(removalData); // Store removal data in Firebase

            await interaction.editReply({ content: `Successfully removed the role ${role.name} from ${user.username}.` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'There was an error removing the role.' });
        }
    }
};
