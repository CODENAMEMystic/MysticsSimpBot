module.exports = async (client) => {
    const guild = client.guilds.cache.get("783496949427863563");
    setInterval(() => {
        const memberCount = guild.memberCount;
        const channel = guild.channels.cache.get("801677980194963476");

        channel.setName(`Total Members: ${memberCount.toLocaleString()}`);
        console.log("Updating Member Count");
    }, 36000000);
    
}