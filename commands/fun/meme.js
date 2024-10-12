const {SlashCommandBuilder} = require('discord.js');
const fetch = require('node-fetch');
const db = require('../../firebase/firebaseClient');
require('dotenv/config');

module.exports = {
    data: new SlashCommandBuilder()
         .setName('meme')
         .setDescription('Fetch a random meme'),
    async execute(interaction){
        const logRef = db.ref('commandUsage/fun/meme');
        const currDate = new Date();
        await logRef.push({
            userId: interaction.user.id,
            timestamp: currDate.toDateString(),
            username: interaction.user.tag
        });

        const meme = await fetchMeme();
        if(meme){
            await interaction.reply({ content: meme, ephemeral: true })
        }else{
            await interaction.reply({ content: 'Could not fetch a meme at this time.', ephemeral: true });
        }
    }     
}

async function fetchMeme(){
    try{
        const response = await fetch(process.env.MEME_API);
        const data = await response.json();
        return data.url;
    }catch(error){
        
        console.error("Error fetching meme : ", error);
        return null;
    }
}