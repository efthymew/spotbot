
require('dotenv').config();
var { parseArgsStringToArgv } = require('string-argv');
const Discord = require('discord.js');
const ytdl = require('ytdl-core')



const bot = new Discord.Client();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const commands = require('./commands.js');

var joined_channel = null;

bot.login(DISCORD_TOKEN);
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

function executeCommand(command, msg, rest_of_msg) {
    switch (command) {
        case 'play':
            play(msg, rest_of_msg)
            break;
        case 'stop':
            stop(msg, rest_of_msg)
            break;
        case 'rand':
            rand(msg, rest_of_msg)
            break;
        case 'who':
            break;
        default:
        // code block
    }
}

async function play(msg, rest_of_msg) {
    var song = rest_of_msg.slice(1, 2);
    try {
        song = ytdl.getVideoID(song);
    } catch(error) {
        msg.reply(`could not find song: ${song}`);
        return;
    }
    const channel = msg.member.voice.channel;
    if (!channel) {
        msg.reply('not in voice call! retry once you have joined a voice channel!')
        return;
    } else {
        msg.reply('playing')
        const dl_song = await ytdl(song, { quality: 'highestaudio' });
        console.log(dl_song)
        const conn = await channel.join();
        conn.play(dl_song);
    }
    //msg.member.voice.channelID is name of voice channel user who messaged is in
    //bot.channels.fetch(^that)
}

async function stop(msg) {
    const channel = msg.member.voice.channel;
    if (!channel) {
        msg.reply('not in voice call! retry once you have joined a voice channel!')
        return;
    } else {
        msg.reply('stopping')
        channel.leave();
    }
}

function rand(msg, rest_of_msg) {

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