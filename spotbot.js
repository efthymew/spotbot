
require('dotenv').config();

var { parseArgsStringToArgv } = require('string-argv');

const Discord = require('discord.js');
const ytdl = require('ytdl-core')
const https = require('https');

const bot = new Discord.Client();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const commands = require('./commands.js');

const db = require( './database.js');

var current_queue = [];
var current_song = 0;

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
        case 'trivia':
            trivia(msg, rest_of_msg)
            break;
        case 'add':
            add(msg, rest_of_msg);
            break;
        default:
        // code block
    }
}

function save(msg, rest_of_msg) {
    
}

async function play(msg, rest_of_msg) {
    var song = rest_of_msg.slice(1, 2);
    try {
        song = ytdl.getVideoID(song);
    } catch (error) {
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
        //push to end of queue but play it
        current_queue.push(rest_of_msg.slice(1, 2)[0]);
        const conn = await channel.join();
        conn.play(dl_song);
        //when song ends
        dl_song.on('end', () => {
            current_song++;
            if (current_song < current_queue.length) {
                play(msg, current_queue[current_song])
            }
        });
    }
    //msg.member.voice.channelID is name of voice channel user who messaged is in
    //bot.channels.fetch(^that)
}

//
function add(msg, rest_of_msg) {
    var song = rest_of_msg.slice(1, 2);
    try {
        song = ytdl.getVideoID(song);
    } catch (error) {
        msg.reply(`could not find song: ${song}`);
        return;
    }
    current_queue.push(rest_of_msg.slice(1, 2)[0]);
    msg.reply('song added to queue!')
    console.log(current_queue)
}
async function trivia(msg, rest_of_msg) {
    const difficulty = rest_of_msg[1];
    const num_q = rest_of_msg[2];
    const TRIVIA_TOKEN = await getTriviaToken();
    console.log(TRIVIA_TOKEN)
    /*
    const trivia_json = await getTrivia(TRIVIA_TOKEN, num_q)
    console.log(JSON.parse(trivia_json))*/
}

function getTrivia(TT, num_q) {
    var options = {
        json: true
    }
    let promise = new Promise(function (resolve, reject) {
        https.get(`https://opentdb.com/api.php?amount=${num_q}?token=${TT}`, options, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            res.on('data', (d) => {
                resolve({ msg: 'success', data: d });
            });

        }).on('error', (e) => {
            reject(new Error({ msg: 'It does not work' }));
        });
    });
    return promise;
}
function getTriviaToken() {
    const options = {
        hostname: 'opentdb.com',
        path: '/api_token.php?command=request',
        json: true
      };
    let promise = new Promise(function (resolve, reject) {
        https.get(options, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            res.on('data', (d) => {
                resolve({ msg: 'success', data: d});
            });

        }).on('error', (e) => {
            reject(new Error({ msg: 'It does not work' }));
        });
    });
    return promise;
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