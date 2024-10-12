const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../firebase/firebaseClient'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Assigns a role to a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to assign the role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to assign to the user')
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

        // Check if the user has permission to assign the role
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to assign roles.', ephemeral: true });
        }

        // Check if the member has a higher role than the role being assigned
        if (interaction.member.roles.highest.position <= role.position) {
            return interaction.reply({ content: 'You cannot assign this role to this user.', ephemeral: true });
        }

        // Acknowledge the interaction
        await interaction.deferReply();

        // Assign the role to the user
        try {
            await member.roles.add(role);

            // Log the role assignment to Firebase
            const roleAssignmentRef = db.ref('commandUsage/role/addrole'); // Reference to the roleAssignments node
            const currDate = new Date();
            const assignmentData = {
                userId: user.id,
                username: user.username,
                roleId: role.id,
                roleName: role.name,
                assignedBy: interaction.user.id,
                timestamp: currDate.toDateString()
            };

            await roleAssignmentRef.push(assignmentData); // Store assignment data in Firebase

            await interaction.editReply({ content: `Successfully added the role ${role.name} to ${user.username}.` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'There was an error adding the role.' });
        }
    }
};
