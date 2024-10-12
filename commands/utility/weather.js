const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const db = require('../../firebase/firebaseClient'); 
require('dotenv/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Provides the information of current weather')
        .addStringOption(option =>
            option.setName('city')
                .setDescription('The city to get weather information for')
                .setRequired(true)),
    async execute(interaction) {
        const city = interaction.options.getString('city');
        const weather = await fetchWeather(city);

        if (weather) {
            interaction.reply({
                content: `Weather in ${weather.location.name} is ${weather.current.temp_c}°C and ${weather.current.temp_f}°F with ${weather.current.condition.text}`,
                ephemeral: true
            });

            await saveWeatherData(city, weather);
        } else {
            await interaction.reply({ content: 'Could not fetch weather data. Please try again later.', ephemeral: true });
        }
    }
}

async function fetchWeather(city) {
    try {
        const response = await fetch(`${process.env.WEATHER_API}${city}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Failed to fetch API: ", error);
        return null;
    }
}

async function saveWeatherData(city, weatherData) {
    try {
        const weatherRef = db.ref('commandUsage/utility/weather');
        const newEntryRef = weatherRef.push(); 
        await newEntryRef.set({
            city: city,
            temperature_c: weatherData.current.temp_c,
            temperature_f: weatherData.current.temp_f,
            condition: weatherData.current.condition.text,
            timestamp: new Date().toDateString()
        });
        console.log(`Weather data for ${city} saved to Firebase.`);
    } catch (error) {
        console.error("Error saving weather data to Firebase: ", error);
    }
}
