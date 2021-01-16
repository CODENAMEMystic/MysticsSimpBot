//Author: Tanner Overly - Mystic
//Version: 1.0.0

const Discord = require('discord.js'); //Discord API
const key = require('./secret.js'); //Saved variable info
const reactionRoleDatabase = require('./reactionRoles.json');
const ytdl = require("ytdl-core");
var fs = require('fs'); //quite honestly dont know what this is for


const {
  Client,
  RichEmbed,
  DiscordAPIError
} = require('discord.js');
const {
  config
} = require('process');
const {
  ifError
} = require('assert');
const { error } = require('console');

const bot = new Client(); //Creates Discord Client

const PREFIX = "!"; //Defines the prefix to use bot commands

//const admin = 'AdminRoleIdHere'; //Will be used later to allow users within admin rank to interact with the bot

var serverData = fs.readFileSync('./servers.json'),
  serverObj;

var reactionRoleData = fs.readFileSync('./reactionRoles.json'),
  reactionObj;


var servers = loadServers();
var reactionRoles = loadReactionRoles();










//Initialize bot
bot.on('ready', () => {
  console.log('Mystic Simp Bot is online!');
});

//USER JOINS THE DISCORD SERVER
bot.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(channel => channel.name === "userlog");
  if (!channel) return;

  channel.send(`User: ${member} has joined`)
  //member.send(`Welcome to Mystic's OG Squad!!\nIn order to unlock the server make sure to join either The Boys or The Girls by reacting to the message in #auto-rolls\nhttps://discord.com/channels/723441004002148374/743629567771672707/745142005637841007`)

});

bot.on('guildMemberRemove', member => {
  const channel = member.guild.channels.cache.find(channel => channel.name === "userlog");

  if (!channel) return;

  channel.send(`User: ${member} has left.`)
  //member.send(`I'm sorry to see you go! If you ever want to rejoin heres my link :)\nhttps://discord.gg/yyRzuYwMEp`);

})


//Music player queue map
const queue = new Map();


//Music Player default embed
const defaultMusicPlayerEmbed = new Discord.MessageEmbed()
  .setColor('#0099ff')
  .setAuthor('No songs playing currently', 'https://i.imgur.com/kvgsN9a.png')
  .setImage(`https://i.pinimg.com/originals/75/6e/11/756e11784356a1e57639df839931b10b.jpg`)
  .setFooter(`Prefix for this server is ${PREFIX}`);




var serverOfInterest;

//When message is sent in discord server:
bot.on('message', message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;
  let msg = message.content.toLowerCase(); //set incoming message to lowercase

  //Music Player Related:
  const serverQueue = queue.get(message.guild.id);
  let args = message.content.substring(PREFIX.length).split(" ");
  switch (args[0]) {
    case "play":
      if (msg.indexOf("youtube") == -1) {
        message.channel.send("Invalid YouTube Link ;)");
        break;
      }
      execute(message, serverQueue);
      message.delete();
      break;

    case "skip":
      skip(message, serverQueue);
      break;

    case "stop":
      stop(message, serverQueue);
      break;

    case "playing":
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
      message.channel.send("pong!");
      break;

    case "poll":
      log(message, "poll");

      const Embed = new Discord.MessageEmbed()
        .setColor(0xFFC300)
        .setTitle("Initiate Poll")
        .setDescription("!poll to initiate a simple yes or no poll");

      if (!args[1]) {
        message.channel.send(Embed);
        break;
      }

      let msgArgs = args.slice(1).join(" ");

      message.channel.send(msgArgs).then(messageReaction => {
        messageReaction.react("👍");
        messageReaction.react("👎");
        message.delete()
      });
      break;

    case "disabledstats":
      message.reply("Calculating");
      break;

    case "save":
      saveServer();
      break;

    case "load":
      loadServers();
      break;

    case "new":
      console.log(`ah welcome, i will add this server: NEW HAS BEEN USED`);
      servers.instances.push(new Server(message.guild));

      saveServer();
      break;

    case "stats":
      locate(message, args[1]);

      var d = new Date(0);
      d.setUTCMilliseconds(userOfInterest.joinedTimestamp);

      message.reply(`\n**Display Name:** ${userOfInterest.displayName}\n**Joined:** ${d}\n**ID:** ${userOfInterest.userID}`);
      break;

    case "admin":
      if (message.member.hasPermission('ADMINISTRATOR')) message.reply('User is an admin.');
      break;
    case "emojireact":
      message.react("726490836228898847");
      break;

    case "test":
      reactionRoleSetup(message);
      break;

    case "te":
      const reactionRoleEmbed = new Discord.MessageEmbed()
        .setTitle(`Reaction Role List`)
        .addFields({
          name: 'Regular field title',
          value: 'Some value here'
        }, {
          name: 'Regular field title',
          value: 'Some value here'
        }, {
          name: 'Regular field title',
          value: 'Some value here'
        }, )
      message.channel.send(reactionRoleEmbed);
      break;
    case "t":
      //message.reply(message.guild.channels.cache.get("783496949998813280").name);
      message.channel.messages.fetch("799848019204898838")
        .then(message => message.reply(message.content))
        .catch(console.error);

      break;




  }
})

var messageFailed = true;
function reactionRoleSetup(message) {
  var channel;
  var channelObj;
  var messageID;
 
  var emoji;
  var role;
  var type;
  const filter = message.author.id;
  const reactionRoleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Reaction Role - Setup part 1')
    .setDescription('First of all you need to tag the channel that you would like the ReactionRole message to be sent. You need to reply within 3 minutes of this message before I cancel it, this also goes for every single question that will follow.')

  //SETUP PART 1 - TAG CHANNEL
  message.channel.send(reactionRoleEmbed);

  message.channel.awaitMessages(m => m.author.id == message.author.id, {
    max: 1,
    time: 10000
  }).then(collected => {
    console.log(`We received: ${collected.first().content}`)
    channel = collected.first().content;
    //Trim channel id if given through #
    if (channel.startsWith("<#")) {
      channel = channel.substring(2, channel.length - 1);
    }

    if (message.guild.channels.cache.get(channel) === undefined) {
      message.reply(`I was unable to find this channel, please select an ID within this guild.`)
      return;
    }
    channelObj = message.guild.channels.cache.get(channel);

    const reactionRoleEmbed = new Discord.MessageEmbed()
      .setTitle('Reaction Role - Setup Part 2')
      .setDescription(`Nice type! Now time to choose your message! Please send me your message id.\nMake sure the message is in the ${collected.first().content}\nTo add multiple roles to a message choose the same id!\n\nExample (Do not use this ID as it will not work for you!)\n700020971150639195`);

    //SETUP PART 2 - TAG MESSAGE ID
    message.channel.send(reactionRoleEmbed);

    message.channel.awaitMessages(m => m.author.id == message.author.id, {
      max: 1,
      time: 30000
    }).then(collected => {
      console.log(`We received: ${collected.first().content}`)
      messageID = collected.first().content;

      /*
      channelObj.messages.fetch(collected.first().content)
        .then(message => {
          messageFailed = false;
          message.reply(`MessageFailed: ${messageFailed}`)
          
        })
        .catch((err) => {
          console.error(err);
          messageFailed = true;
        });
      *//*

      locateMessage(channelObj, collected.first().content);
      message.channel.send(`wow you fucking idiot Message failed: ${messageFailed}`)
      if(messageFailed){
        return;
      }
      */
      
      
      

      const reactionRoleEmbed = new Discord.MessageEmbed()
        .setTitle('Reaction Role - Setup Part 3')
        .setDescription(`Message ID: ${collected.first()}\nPlease REACT TO THIS MESSAGE with the reaction you want to use! DO NOT USE NITRO EMOJIS THAT IS NOT IN THIS GUILD (I have no way of accessing them!)`);
      message.channel.send(reactionRoleEmbed);

      //SETUP PART 3 - 
      message.channel.awaitMessages((m => m.author.id == message.author.id), {
        max: 1,
        time: 30000
      }).then(collected => {
        console.log(`We received: ${collected.first().content}`)
        emoji = collected.first().content;

        const reactionRoleEmbed = new Discord.MessageEmbed()
          .setTitle('Reaction Role - Setup Part 4')
          .setDescription(`Emoji Selected: ${collected.first()}\nPlease tag, write the name or the id of the role you want to give!`);

        //SETUP PART 4
        message.channel.send(reactionRoleEmbed);

        message.channel.awaitMessages(m => m.author.id == message.author.id, {
          max: 1,
          time: 10000
        }).then(collected => {
          console.log(`We received: ${collected.first().content}`)
          role = collected.first().content;

          const reactionRoleEmbed = new Discord.MessageEmbed()
            .setTitle('Reaction Role - Setup Part 5')
            .setDescription(`Role Selected: ${collected.first()}\nNow you need to choose what type of reaction role you want. Please reply with 1-4.\nYou can combine them to add a role and remove a role\nI am going to explain what thoes numbers are for you:\n\nThis is the normal Reaction Role, when you react you get the role and when you remove the reaction it gets removed. Just like magic right?\n This creates a reaction that will only give a role and not remove it when they unreact.\nThis is basically just as number 2, only difference is that it removes the role instead of giving it\nIt is type 1 [gives the role and removes it] but it is inverted: The bot takes the role when you react and gives it back when you unreact.`);

          //SETUP PART 5
          message.channel.send(reactionRoleEmbed);

          message.channel.awaitMessages(m => m.author.id == message.author.id, {
            max: 1,
            time: 10000
          }).then(collected => {
            console.log(`We received: ${collected.first().content}`)
            type = collected.first().content;


            const reactionRoleEmbed = new Discord.MessageEmbed()
              .setTitle('Reaction Role - Complete')
              .setDescription(`You have completed setup`);

            //COMPLETE
            message.channel.send(reactionRoleEmbed);
            reactionRoles.instances.push(new ReactionRole(message.guild.id, channel, messageID, emoji, role, type));
            saveReactionRoles();



          }).catch(() => {
            message.reply('No answer after 30 seconds, operation canceled.');
          })



        }).catch(() => {
          message.reply('No answer after 30 seconds, operation canceled.');
        })

      }).catch(() => {
        message.reply('No answer after 30 seconds, operation canceled.');
      })

    }).catch(() => {
      message.reply('No answer after 30 seconds, operation canceled.');
    })

  }).catch(() => {
    message.reply('No answer after 30 seconds, operation canceled.');
  })
}


function locateMessage(channel, messageID){
  
  channel.messages.fetch(messageID)
        .then(message => {
          message.reply(`MessageFailed: False`)
          messageFailed = false;
          return messageFailed;
          
        })
        .catch((err) => {
          console.error(err);
          messageFailed = true;
          return messageFailed;
        });

}


function locate(message, IDofInterest) {

  if (IDofInterest == undefined) { //If id is not given, set id to author of message
    IDofInterest = message.author.id;
  }

  //find server in instances array
  var serverPos = servers.instances.map(function (e) {
    return e.id;
  }).indexOf(message.guild.id);
  if (serverPos != -1) { //if server is found
    serverOfInterest = servers.instances[serverPos];
  }


  var userPos = serverOfInterest.users.map(function (e) {
    return e.userID;
  }).indexOf(IDofInterest);
  if (userPos != -1) {
    userOfInterest = serverOfInterest.users[userPos];
  }
  return userOfInterest;
}


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


  const songInfo = await ytdl.getInfo(args[1]).catch(error => console.log(`Error: ${error}`));



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
  if (!serverQueue) {
    return;
  }
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

function createEmbed(queue, song) {
  const exampleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setAuthor(song.title, 'https://i.imgur.com/kvgsN9a.png', song.url)

    .setImage(`https://img.youtube.com/vi/${song.id}/maxresdefault.jpg`) //Image of youtube video
    .setTimestamp()
    .setFooter(`${queue.songs.length} songs in queue | Volume: ##%`);
  return exampleEmbed;
}

function purge(message, amount) {
  message.channel.bulkDelete(amount)
    .catch(error => console.log(`Error: ${error}`));
}

//Keep at end of file ;)
bot.login(key.key);

function saveServer() {
  fs.writeFile('./servers.json', JSON.stringify(servers), function (err) {
    if (err) {
      console.log('There has been an error saving your server data.');
      console.log(err.message);
      return;
    }
    console.log('Server data saved successfully.')
  });
}

function saveReactionRoles() {
  fs.writeFile('./reactionRoles.json', JSON.stringify(reactionRoles), function (err) {
    if (err) {
      console.log('There has been an error saving your server data.');
      console.log(err.message);
      return;
    }
    console.log('Server data saved successfully.')
  });
}

function loadReactionRoles() {
  try {
    reactionObj = JSON.parse(reactionRoleData);
  } catch (err) {
    console.log('There has been an error parsing your Server Data JSON.')
    console.log(err);
  }

  return reactionObj;
}

function loadServers() {
  try {
    serverObj = JSON.parse(serverData);
  } catch (err) {
    console.log('There has been an error parsing your Server Data JSON.')
    console.log(err);
  }

  return serverObj;
}


function makeid() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 25; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}




class User {
  constructor(userObj) {
    this.id = userObj.id;
    this.username = userObj.username;
    this.discriminator = userObj.discriminator;
    this.messagesSent = 0;
    this.voiceStartTime = 0;
    this.voiceChatTime = 0;
    this.voiceChatTimePersonalRecord = 0;
    this.userStatus;
    this.joinDate;



  }
  status(message) {
    this.userStatus = message;
  }
  out() {
    console.log(this.id);
    console.log(this.username);
    console.log(this.discriminator);
    console.log(this.messag + sSent);
    console.log(this.voiceChatTime);

  }
}


class Server {
  constructor(serverObj) {
    this.id = serverObj.id;
    this.serverName = serverObj.name;
    this.serverRegion = serverObj.region;
    //this.memberCount = serverObj.member_count;
    this.users = serverObj.members.cache;
    //this.users = serverObj.members;
  }
  out(message) {
    console.log(message);
  }
  update() {
    return;
    //total messages sent in server - update for each user in server, add total messages sent in server
  }
}

class ReactionRole {
  constructor(guildID, channel, messageID, emoji, role, type) {
    this.guildID = guildID;
    this.reactionID = makeid();
    this.emoji = emoji;
    this.messageID = messageID;
    this.channel = channel;
    this.type = type;
    this.role = role;
  }
  out(message) {
    console.log(message);
  }
  update() {
    return;
  }
}