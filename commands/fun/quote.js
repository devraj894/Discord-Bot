const {SlashCommandBuilder} = require('discord.js');
const fetch = require('node-fetch');
const db = require('../../firebase/firebaseClient');
require('dotenv/config');

module.exports = {
    data: new SlashCommandBuilder()
         .setName('quote')
         .setDescription('Provides random quotes'),
    async execute(interaction){
        const logRef = db.ref('commandUsage/fun/quote');
        const currDate = new Date();
        await logRef.push({
            userId: interaction.user.id,
            timestamp: currDate.toDateString(),
            username: interaction.user.tag
        });

        const quote = await fetchQuote();
        if(quote){
            interaction.reply(quote);
        }else{
            interaction.reply('Faled to provide quote');
        }
    }     
}

async function fetchQuote(){
    try{
        const response = await fetch(process.env.QUOTE_API);
        const data = await response.json();
        return data.quoteText;
    }catch(error){
        console.log("Api fetch error : ", error);
        return null;
    }
}