const Discord = require('discord.js');
const key = require('./secret.js'); //Saved variable info

const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

const prefix = '!';

const fs = require('fs');

const memberCounter = require('./counters/membercounter.js');

client.commands = new Discord.Collection();


const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


client.on('ready', () => {
    console.log('Mystic Simp Bot is online!');
    memberCounter(client);
});

client.on('guildMemberAdd', guildMember => {
    guildMember.guild.channels.cache.get('783496949608874000').send(`Welcome to the server <@${guildMember.user.id}>`);
});

/*client.on('guildMemberRemove', guildMember => {
    guildMember.guild.channels.cache.get('783496949608874000').send(`<@${guildMember.user.id}> has left`);
});
*/

client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    //let args = message.content.substring(prefix.length).split(" ");
    const command = args.shift().toLowerCase();

    //Switch through all commands located in commands folder
    switch (command) {
        case "ping":
            client.commands.get('ping').execute(message, args);
            break;
        
        case "clear":
            client.commands.get('clear').execute(message, args);
            break;
        
        case "kick":
            client.commands.get('kick').execute(message, args);
            break;

        case "ban":
            client.commands.get('ban').execute(message, args);
            break;
        
        case "reactionrole":
            client.commands.get('reactionrole').execute(message, args, Discord, client);
            break;

            //ANY TEST COMMANDS WILL BE LISTED BELOW
        case "permissiontest":
            client.commands.get('permissiontest').execute(message, args);
            break;

        case "embedtest":
            client.commands.get('embedtest').execute(message, args, Discord);
            break;

    }

});


client.login(key.key);