module.exports = {
    name: 'kick',
    description: "This command kicks a member!",
    execute(message, args) {

        if (message.member.permissions.has("KICK_MEMBERS")) {
            const member = message.mentions.users.first();
            if (member) {
                const memberTarget = message.guild.members.cache.get(member.id);
                memberTarget.kick();
                message.channel.send(`User has been kicked`);
            } else {
                message.channel.send("Member does not exist");
            }
        }
        else{
            message.reply("You do not have permission!");
        }

    }
}