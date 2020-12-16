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

const PREFIX = "!"; //Defines the prefix to use bot commands

//const admin = 'AdminRoleIdHere'; //Will be used later to allow users within admin rank to interact with the bot


//Initialize bot
bot.on('ready', () => {
  console.log('Mystic Simp Bot is online!');
});


//Music player queue map
const queue = new Map();


//Music Player default embed
const defaultMusicPlayerEmbed = new Discord.MessageEmbed()
  .setColor('#0099ff')
  .setAuthor('No songs playing currently', 'https://i.imgur.com/kvgsN9a.png')
  .setImage(`https://i.pinimg.com/originals/75/6e/11/756e11784356a1e57639df839931b10b.jpg`)
  .setFooter(`Prefix for this server is ${PREFIX}`);




//When message is sent in discord server:
bot.on('message', message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;
  let msg = message.content.toLowerCase(); //set incoming message to lowercase

  //Music Player Related:
  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${PREFIX}play`)) {
    execute(message, serverQueue);
    message.delete();
    return;
  } else if (message.content.startsWith(`${PREFIX}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${PREFIX}stop`)) {
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
      //Workzone
      const songQueueInfo = '**Queue List:**\n 1. Song 1\n 2. Song 2\n 3. Song 3'
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Song Currently Playing Name', 'https://i.imgur.com/kvgsN9a.png', 'https://google.com')
        //.setThumbnail('https://i.imgur.com/wSTFkRM.png')

        .setImage('https://i.ytimg.com/vi/IHoj7qvNmwk/hqdefault.jpg') //Image of youtube video
        .setTimestamp()
        .setFooter('# songs in queue | Volume: ##%');

      message.channel.send(songQueueInfo);
      message.channel.send(exampleEmbed);
      //End of workzone

      break;

  }


})


//Music Player Operations
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

  
  const songInfo = await ytdl.getInfo(args[1], function (err, info) {
    console.log(`test: ${info.thumbnail_url}`)
  }); 

  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    id: songInfo.videoDetails.videoId,
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
    purge(message, 1);
    return message.channel.send(createEmbed(serverQueue, serverQueue.songs[0]));
  }
}

function skip(message, serverQueue) {
  purge(message, 2);
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
  purge(message, 2);
  //message.channel.send(defaultMusicPlayerEmbed);    //Removed until further noticed
  serverQueue.songs = [];

  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    //serverQueue.textChannel.send(defaultMusicPlayerEmbed);    //removed until further noticed
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    
    return;
  }

  //When song finishes:
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
      serverQueue.textChannel.bulkDelete(1)
      .catch(error => console.log(`Error: ${error}`));
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  
  //serverQueue.textChannel.send(songQueueInfo);
  serverQueue.textChannel.send(createEmbed(serverQueue, song));
  //End of workzone  */

}



function log(message, command) {
  console.log(`User: ${message.author} has used ${command}`)
}

function createEmbed(queue, song){
  const exampleEmbed = new Discord.MessageEmbed()
  .setColor('#0099ff')
  .setAuthor(song.title, 'https://i.imgur.com/kvgsN9a.png', song.url)

  .setImage(`https://img.youtube.com/vi/${song.id}/maxresdefault.jpg`) //Image of youtube video
  .setTimestamp()
  .setFooter(`${queue.songs.length} songs in queue | Volume: ##%`);
  return exampleEmbed;
}

function purge(message, amount){
  message.channel.bulkDelete(amount)
    .catch(error => console.log(`Error: ${error}`));
}

//Keep at end of file ;)
bot.login(key.key);