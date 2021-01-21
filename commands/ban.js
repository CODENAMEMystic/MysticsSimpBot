module.exports = {
    name: 'ban',
    description: "This command bans a member!",
    execute(message, args) {

        if (message.member.permissions.has("BAN_MEMBERS")) {
            const member = message.mentions.users.first();
            if (member) {
                const memberTarget = message.guild.members.cache.get(member.id);
                memberTarget.ban();
                message.channel.send(`User has been banned`);
            } else {
                message.channel.send("Member does not exist");
            }
        }
        else{
            message.reply("You do not have permission!");
        }
        
    }
}