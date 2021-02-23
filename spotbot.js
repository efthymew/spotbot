
require('dotenv').config();
var { parseArgsStringToArgv } = require('string-argv');
const Discord = require('discord.js');

const bot = new Discord.Client();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const commands = require('./commands.js');

var joined_channel = null;

bot.login(DISCORD_TOKEN);
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

function executeCommand(command, msg, rest_of_msg) {
    if (command == 'play') {
        play(msg, rest_of_msg)
    }
    if (command == 'stop') {
        stop(msg)
    }
    if (command == 'save') {

    }
}

function play(msg, rest_of_msg) {
    const channel_id = msg.member.voice.channelID;
    bot.channels.fetch(channel_id)
        .then(channel => {
            msg.reply('playing')
            channel.join()
            joined_channel = channel;
        })
        .catch(msg.reply('not in a voice channel!'))
    //msg.member.voice.channelID is name of voice channel user who messaged is in
    //bot.channels.fetch(^that)
}

function stop(msg) {
    if (!joined_channel) {
        msg.reply('not playing music!')
    } else {
        msg.reply('stopping')
        joined_channel.leave();
    }
}
bot.on('message', msg => {
    if (msg.content[0] === '$') {
        //parse rest of message as command lines args
        let rest_of_msg = parseArgsStringToArgv(msg.content.substr(1));
        let command = rest_of_msg[0];
        //if message had a command
        if (command in commands) {
            executeCommand(command, msg, rest_of_msg)
        }
    }
});