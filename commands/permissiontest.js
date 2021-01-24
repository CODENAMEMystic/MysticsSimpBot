module.exports = {
    name: "permissiontest",
    description: "this is a permission test command!",
    execute(client, message, args) {
        //Start of command details
        var testCommand = "ADMINISTRATOR" //Change this to test different permission flags

        //Check if member has a SPECIFIC ROLE
        if (message.member.roles.cache.has("783496949608873994")) {
            message.channel.send("You have a specific role!");
        } else {
            message.channel.send("You dont have a specific role!");
        }

        //Checks if member has a SPECIFIC PERMISSION
        if (message.member.permissions.has(testCommand)) {
            message.channel.send(`You have ${testCommand} permission`);
        }
        else {
            message.channel.send(`You dont have ${testCommand} permission`);
        }

    }
};

/*
NOTES:

message.member.roles.add('ROLE_ID_HERE').catch(console.error);      //Used to add members into a role ||If roleID fails, catch error and send it to console
message.member.roles.remove('ROLE_ID_HERE').catch(console.error);   //Used to remove members from role

*/