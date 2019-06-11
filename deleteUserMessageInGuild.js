//Browser Script to Delete All Your Messages in a Discord Channel
//Updated by z861gz6wb2 ~ Working as of March 20th, 2019.
//Credit to: Altoids1 (Original code), GotEnouth (Updated code), TheOutride (Updated code).
(function() {
    'use strict';

    /*INSTRUCTIONS FOR THIS SCRIPT ARE BELOW*/

    let messageID = "000000000000000000"; //The ID of the message you would like to delete.
    //Note: you can leave the messageID set to "000000000000000000",
    //      if you want to delete every single message in the channel.

    let authToken = "YOUR_AUTH_TOKEN"; //Your Discord account's auth token.
    //Note: this script will attempt to grab your auth token automatically,
    //but it may fail depending on the browser you are using,
    //in which case you should paste it in manually into the line above,
    //by using the script from the Q&A linked below to grab it.

    //HOW TO USE THIS SCRIPT:
    //Step 1: Login to the web browser version of Discord,
    //        and find the most recent message you want to delete.
    //Step 2: Copy the ID of that message and paste it into the line above.
    //        All messages sent prior to that message will be deleted.
    //Step 3: Paste this script into your browser's console.
    //Step 4: ???
    //Step 5: Profit.

    let guildID = "FILL_THIS"; //fill this manually, search google on how to fill this

    //Q: Where can I find my Message ID?
    //A: Visit: https://support.discordapp.com/hc/en-us/articles/206346498
    //Q: Where can I find my Auth Token?
    //A: Use this: https://github.com/FOCI-DEV/Get-Discord-Token
    //Q: How can I turn this script into a bookmark?
    //A: Paste it into this tool: https://chriszarate.github.io/bookmarkleter/

    /*DO NOT MODIFY ANYTHING BELOW THIS LINE! (unless you know what you're doing)*/
    const channelID = window.location.href.split('/').pop(); //Get our channel ID from the current window's URL
    const frame = document.body.appendChild(document.createElement("iframe")); //Create an iframe to get the IDs we need from localStorage
    const cloneLS = JSON.parse(JSON.stringify(frame.contentWindow.localStorage)); //Make a copy of the iframe's localStorage
    frame.parentNode.removeChild(frame); //Remove the iframe now that we no longer need it
    const userID = cloneLS.user_id_cache.replace(/"/g, ""); //Get our user ID from localStorage

    if (authToken === "YOUR_AUTH_TOKEN") { //Check if the auth token was filled in
        if (!cloneLS.hasOwnProperty('token')) { //Check if our auth token exists in localStorage
            window.alert("Failed to retrieve your auth token from localStorage, try pasting it into this script manually.\nInstructions to find your auth token are provided in this script.");
            return; //We don't have any auth token to use so we end the process.
        }
        authToken = cloneLS.token.replace(/"/g, ""); //Get our auth token from localStorage
    }
    console.log("Your Discord account's auth token is:\n" + authToken);

    let msgCount = 0; //Keeps track of how many messages we find
    const interval = 500; //The amount of time to wait in-between deleting messages (default "safe" value is 500)

    let delay = (duration) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), duration);
        });
    }

    let clearMessages = () => {
        const URL = "https://discordapp.com/api/v6/guilds/" + guildID + "/messages/search?author_id=" + userID + "&include_nsfw=true";
        const headers = {
            "Authorization": authToken
        };

        let clock = 0;

        window.fetch(URL, {
            headers,
            method: 'GET'
            }) //Fetch the message data from discord
            .then((resp) => resp.json()) //Make it into a json
            .then((messages) => { //Call that json "messages" and do this function with it as the parameter:
                //console.log(messages.messages);
                messages.messages.forEach(function(element){
                    console.log(element);
                    if (typeof element === "undefined" || !element.hasOwnProperty('length')) {
                        window.alert("Failed to retrieve messages! Try refreshing the page, then running the script again.");
                        return true;
                    } else if (element.length === 0) {
                        window.alert("All your messages have been deleted!\nTotal Messages Deleted: " + msgCount);
                        return true;
                    }
                    return Promise.all(element.map(
                    (message) => { //Call this function for all messages we have
                        messageID = message.id; //Update our message ID
                        if (message.author.id === userID) { //Checks to see if message is yours
                            msgCount++;
                            const msgNumber = msgCount; //Remember the count for this message for logging purposes
                            //console.log("Found message #" + msgNumber);
                            return delay(clock += interval)
                            .then(() => {
                                console.log("Deleting message " + msgNumber + "/" + msgCount);
                                fetch(`https://discordapp.com/api/channels/${message.channel_id}/messages/${message.id}`, {
                                    headers,
                                    method: 'DELETE'
                                });
                            });
                        } else { //If the message is not yours, we skip it.
                            //console.log("Skipped message from other user.");
                            return;
                            //Chrome's console groups up repeated logs. If this prints out 3 times, it'll say:
                            //"(3) Skipped message from other user". You can add a variable to track how many
                            //messages it skips and log the count, but beware it will spam your console log.
                        }
                    }));
                }
                )
            })
            .then((isFinished) => {
                if (isFinished === true) { //Check to see if we are finished deleting messages.
                    return; //We finished deleting all our messages, so we end the process!
                }
                clearMessages(); //Once we've deleted all the messages we can see, we ask for more!
            });
        }
        clearMessages();
    })();
