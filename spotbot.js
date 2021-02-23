
require('dotenv').config();
var { parseArgsStringToArgv } = require('string-argv');
const Discord = require('discord.js');

const bot = new Discord.Client();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const commands = require('./commands.js');

bot.login(DISCORD_TOKEN);
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
    if (msg.content[0] === '$') {
        //parse rest of message as command lines args
        let rest_of_msg = parseArgsStringToArgv(msg.content.substr(1))
        console.log(rest_of_msg);
        let command = rest_of_msg[0];
        if (command in commands) {
            console.log('hit!')
        }
    }
});