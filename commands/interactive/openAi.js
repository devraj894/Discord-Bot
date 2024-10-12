const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const db = require('../../firebase/firebaseClient'); 
require('dotenv/config');

const openai = new OpenAI({
    apiKey: process.env.API_KEY_OPEN_AI, 
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask anything from the bot')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask')
                .setRequired(true)
        ),
    async execute(interaction) {
        const question = interaction.options.getString('question');

        try {
            await interaction.deferReply(); 

            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Chat GPT is a friendly chatbot',
                    },
                    {
                        role: 'user',
                        content: question,
                    },
                ],
            });

            const answer = response.choices[0].message.content;

            // Reply to the user with the answer
            await interaction.editReply(answer);

            // Log the interaction in Firebase
            const logRef = db.ref('commandUsage/interactive/ask');
            const currDate = new Date();
            await logRef.push({
                userId: interaction.user.id,
                username: interaction.user.username,
                question: question,
                answer: answer,
                timestamp: currDate.toDateString(),
            });

        } catch (error) {
            console.error('OpenAI Error: ', error);
            
            // Handling insufficient quota error
            if (error.code === 'insufficient_quota') {
                await interaction.editReply('Sorry, the bot\'s API quota has been exceeded or the free trial has ended. Please try again later.');
            } else {
                await interaction.editReply('Something went wrong while contacting OpenAI.');
            }
        }
    },
};
