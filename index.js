//Author: Tanner Overly - Mystic
//Version: 1.0.0

const Discord = require('discord.js'); //Discord API
const key = require('./secret.js'); //Saved variable info
const ytdl = require("ytdl-core");

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


const queue = new Map();



bot.on('message', message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    let msg = message.content.toLowerCase(); //set incoming message to lowercase


    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${PREFIX}mplay`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${PREFIX}mskip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${PREFIX}mstop`)) {
        stop(message, serverQueue);
        return;
    }


    let args = message.content.substring(PREFIX.length).split(" ");
    switch (args[0]) {
        case "status":
            message.reply('Received and heard well. Doing just fine over here')
            break;
        
        case "playing":
            log(message, "playing");

            let playArg = args.slice(1).join(" ");
            bot.user.setActivity(playArg);
            break;


        case "listening":
            log(message, "listening");

            let lstArg = args.slice(1).join(" ");
            bot.user.setActivity(lstArg, {
                type: "LISTENING"
            }).catch(console.error);
            break;


        case "ping":
            message.channel.send('pong!');
            timeOfLastUse = message.createdTimestamp;
            break;
        
        case "test":
          message.channel.send(message.guild.id);
          break;
      
    }
    

})



async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
     };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  
  function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }
  
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  
  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }



function log(message, command) {
    console.log(`User: ${message.author} has used ${command}`)
}


//Keep at end of file ;)
bot.login(key.key);