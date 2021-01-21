//Author: Tanner Overly - Mystic	const Discord = require('discord.js');
//Version: 2.0.0

const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

const fs = require('fs');

const memberCounter = require('./counters/membercounter.js');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

client.login(process.env.DISCORD_TOKEN);