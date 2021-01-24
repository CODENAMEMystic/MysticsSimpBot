module.exports = {
    name: "reactionrole",
    description: "Use this command to assign roles to members who react",
    async execute(client, message, args, Discord) {

        const channel = "783496949608874001";
        const testRole1 = message.guild.roles.cache.find(role => role.name === "one");
        const testRole2 = message.guild.roles.cache.find(role => role.name === "two");

        const role1Emoji = "😀";
        const role2Emoji = "😎";

        let embed = new Discord.MessageEmbed()
            .setColor("#e42643")
            .setTitle("Choose a role")
            .setDescription("Choosing a role will... give you a role\n\n"
                + `${role1Emoji} for role 1\n`
                + `${role2Emoji} for role 2`);
        
        let messageEmbed = await message.channel.send(embed);
        messageEmbed.react(role1Emoji);
        messageEmbed.react(role2Emoji);

        client.on("messageReactionAdd", async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (reaction.message.channel.id == channel) {
                if (reaction.emoji.name === role1Emoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(testRole1);
                }
                if (reaction.emoji.name === role2Emoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(testRole2);
                }
            }
            else {
                return;
            }
        });

        client.on("messageReactionRemove", async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (reaction.message.channel.id == channel) {
                if (reaction.emoji.name === role1Emoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(testRole1);
                }
                if (reaction.emoji.name === role2Emoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(testRole2);
                }
            }
            else {
                return;
            }
        });

    }
};