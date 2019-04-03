/************************************************************************************************
Hello!
This is a very basic bot starter kit.
Ignore most of the junk below (it's just botkit setup) - scroll to the bottom for the good stuff!
************************************************************************************************/

"use strict";
require('dotenv').config();

const Botkit = require('botkit');
const express = require('express');
const app = express();
var request = require('request');


var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

function close_rtm() {
    const bot = storage.botStatus.bot;
    bot.closeRTM(function(err,bot,payload) {
        if (err) {
            console.log('Failed to start RTM');
            return setTimeout(close_rtm, 60000);
        }
        console.log("RTM Stopped!!");
    });
}

function onInstallation(bot, installer) {
	if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
			if (err) {
				console.log(err);
			}
		});
	}
}

function start_rtm(bot) {
    try {
        bot.startRTM((err,retBot,payload) => {
            if (err) {
                console.log('Failed to start RTM');
                return setTimeout(start_rtm, 60000);
            }
            console.log("RTM started!");
        });
    }
    catch(err) {
        console.log(`non critical error while in start_rtm function: ${err}`);
    }
}

let controller = Botkit.slackbot().configureSlackApp({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot'], //TODO it would be good to move this out a level, so it can be configured at the root level
});

controller.on('create_bot', function (bot, cfg) {
    bot.startRTM((err) => {
        if (err) {
            die(err);
        }
        console.log('create_bot');
        onInstallation(bot, cfg.createdBy);
    });
});


controller.storage.teams.all((err) => {
    if (err) {
        throw new Error(err);
    }
    // connect all teams with bots up to slack!
    const team = {
        "id": "T1F4HPQPQ",
        "createdBy": "UD5K3EFE3",
        "url": "https://hearstmedia.slack.com/",
        "name": "Hearst Media",
        "bot": {
            "token": process.env.SLACK_BOT_TOKEN,
            "user_id": "UCRH93HRQ",
            "createdBy": "UD5K3EFE3"
        },
        "token": process.env.SLACK_TEAM_TOKEN
    }

    let bot = controller.spawn(team).startRTM((err) => {
        if (err) {
            console.log(`Error connecting bot to Slack: ${err}`);
        }
    });
});

controller.on('rtm_open', function (bot) {
	console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
	console.log('** The RTM api just closed');
});

controller.on('rtm_reconnect_failed', function (bot) {
	console.log('** The RTM reconnection failed');
});







/********************************************

Hello! Here's the good stuff, annotated below

********************************************/


// Here's where you can write logic to handle 1:1 conversations
controller.on('direct_message', function(bot, message) {

    // Basic response
    if (message.text == "hi"){
        bot.reply(message,'hi yourself!');    
    }

});

// Here's how you can create endpoints for slash commands and other stuff
// For example, this will say hello when you visit: http://localhost:5432/say-hello
app.get('/say-hello', function(req, res){
    
    // Do as much asyncronous stuff here as you like before sending the response below!

    res.send(`hello`);
})


// Example slash command endpoint
app.post('/sc',function(req,res) {

    // Send an empty initial response. If it's longer than 3 seconds, slack will say the message failed
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(`{ "response_type": "in_channel", "text": ""}`);

    // Here's where you'll write code to process the input and send a post request to the "response_url"
    // Slash command docs - they're great! https://api.slack.com/slash-commands
    // NOTE: This code example gets you as far as step 2 above. Continue with step 3...

    // As an example, here are all the params that come with a slash command
    /*
    channel_id: "D2HJRHX3L"
    channel_name: "directmessage"
    command: "/atom-test"
    response_url: "https://hooks.slack.com/commands/T1F4HPQPQ/596273043776/eeWF73gVVGwc4GVKvqf1eVn1"
    team_domain: "hearstmedia"
    team_id: "T1F4HPQPQ"
    text: "helllllloooooo"
    token: "YmoSuwS2fPY8pUY9lW9KQIbs"
    trigger_id: "599759526983.49153806806.7e85efcf9a5b9aa1a6a2c3c313607d2a"
    user_id: "U2HJEADT7"
    user_name: "solomania"
    */

});

// Example post request endpoint
// For doing stuff like this: http://localhost:5432/webchat?brand=esq&message=hello+there
app.get('/webchat',function(req,res) {
    
    // Sample code to send the "message" parameter to a slack room
    let url = `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_BOT_TOKEN}&channel=hans-test-channel&pretty=1`
    url += `&text=${encodeURIComponent(req.query.message)}`;

    // Send a post request
    // You'll use this code structure a lot if you're passing data to other endpoints!
    request.post({
        headers: {'Content-type' : 'application/json'},
        url
    }, (error, response, body) => {
        if (error) { 
            console.log(`Error in posting to channel: ${channelName} --> ${error}`);
        } else {
            res.send("Message sent to slack channel");    
        }
    });

});





// Turn on the endpoint listener
app.listen(process.env.PORT, function(){
    console.log(`Example app listening on port ${process.env.PORT}`);
})


