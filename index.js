//Author: Tanner Overly - Mystic
//Version: 1.0.0

const Discord = require('discord.js'); //Discord API
const key = require('./secret.js'); //Saved variable info

//var fs = require('fs'); //quite honestly dont know what this is for

const {
    Client,
    RichEmbed,
    DiscordAPIError
} = require('discord.js');
const {
    config
} = require('process');

const bot = new Client(); //Creates Discord Client

const PREFIX = "!";  //Defines the prefix to use bot commands

//const admin = 'AdminRoleIdHere'; //Will be used later to allow users within admin rank to interact with the bot


//Initialize bot
bot.on('ready', () => {
    console.log('Mystic Simp Bot is online!');
});




//Keep at end of file ;)
bot.login(key.key);