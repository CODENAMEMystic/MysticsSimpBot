module.exports = {
    name: 'embedtest',
    description: "this is a embed test command!",
    execute(message, args, Discord) {
        
        const newEmbed = new Discord.MessageEmbed()
        .setColor('#304281')
        .setTitle('Rules')
        .setURL('https://strangeislandstudios.com')
        .setDescription('This is an embed for server rules')
        .addFields(
            {name: 'Rule 1', value: 'Be nice'},
            {name: 'Rule 2', value: 'Be cool'},
            {name: 'Rule 4', value: 'Be pog'}
        )
        .setFooter('Make sure to check out the rules channel');

        message.channel.send(newEmbed);

    }
}