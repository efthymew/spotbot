
require('dotenv').config();

var { parseArgsStringToArgv } = require('string-argv');

const Discord = require('discord.js');
const ytdl = require('ytdl-core')
const https = require('https');

const bot = new Discord.Client();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const commands = require('./commands.js');

const db = require( './database.js').Database;
var shuffler = require('knuth-shuffle').knuthShuffle;

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
            who(msg, rest_of_msg);
            break;
        case 'add':
            add(msg, rest_of_msg);
            break;
        case 'save':
            save(msg, rest_of_msg);
            break;
            
        case 'queues':
            queues(msg, rest_of_msg);
            break;
            
        case 'loop':
            loop(msg, rest_of_msg);
            break;
                
        case 'queue':
            queue(msg);
            break;
        case 'shuffle':
            shuffle(msg, rest_of_msg);
            break;
        default:
        // code block
    }
}

function who(msg, rest_of_msg) {
    console.log(msg.mentions.users.array[0]);
    if (!rest_of_msg || !msg.metions) {
        msg.channel.send('asked');
    } else if (msg.mentions) {
        //msg.channel.send(msg.mentions.members[0]);
        msg.channel.send(msg.mentions.users.array()[0].username + ' asked!');
        //msg.channel.send('asked!');
    } else {
        msg.channel.send('asked');
    }
}

function shuffle(msg, rest_of_msg) {
    console.log('hello')
    var name = rest_of_msg[0];
    if (name) {
        if (db.queueExists(name)) {
            msg.reply(`shuffling queue: ${name}`)
            current_song = 0;
            current_queue = db.getQueue(name);
            shuffler(current_queue)
            play(msg, current_queue);
        } else {
            msg.reply(`no queue: ${name}`)
        }
    } else {
        if (current_queue.length > 0) {
            msg.reply('shuffling current queue');
        } else {
            msg.reply('queue is empty!!!!')
        }
    }
}

function save(msg, rest_of_msg) {
    var name = rest_of_msg[0];
    msg.reply('saving current queue!!!!!!!!!!!')
    if (!db.queueExists(name)) {
        db.addQueue(name, current_queue)
    }
}

function queues(msg, rest_of_msg) {
    let rep = 'queues:\n' + JSON.stringify(db.getQueues());
    msg.reply(rep);
}
function queue(msg) {
    let rep = 'current queue:\n' + JSON.stringify(current_queue);
    msg.reply(rep);
}
function loop(msg, rest_of_msg) {

}

function next(msg, rest_of_msg) {

}

function prev(msg, rest_of_msg) {

}

async function play(msg, rest_of_msg) {
    var song = rest_of_msg[0];
    try {
        song = ytdl.getVideoID(song);
    } catch (error) {
        if (!db.queueExists(rest_of_msg[0])) {
            msg.reply(`could not find song: ${rest_of_msg[0]}`);
            return;
        } else {
            current_song = 0;
            current_queue = db.getQueue(rest_of_msg[0]);
            play(msg, [current_queue[current_song]]);
            return;
        }
    }
    const channel = msg.member.voice.channel;
    if (!channel) {
        msg.reply('not in voice call! retry once you have joined a voice channel!')
        return;
    } else {
        msg.reply('playing')
        const dl_song = await ytdl(song, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25  });
        console.log(dl_song)
        //push to end of queue but play it
        current_queue.push(rest_of_msg[0]);
        console.log(current_queue)
        const conn = await channel.join();
        const dispatcher = conn.play(dl_song);
        //when song ends
        dispatcher.on('finish', () => {
            current_song++;
            if (current_song < current_queue.length) {
                play(msg, [current_queue[current_song]])
            }
        });
    }
    //msg.member.voice.channelID is name of voice channel user who messaged is in
    //bot.channels.fetch(^that)
}

//
function add(msg, rest_of_msg) {
    var song = rest_of_msg[0];
    try {
        song = ytdl.getVideoID(song);
    } catch (error) {
        msg.reply(`could not find song: ${song}`);
        return;
    }
    current_queue.push(rest_of_msg[0]);
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
    msg.channel.send(Math.floor(Math.random() * (6 - 1) + 1));
}
bot.on('message', msg => {
    if (msg.content[0] === '$') {
        //parse rest of message as command lines args
        let rest_of_msg = parseArgsStringToArgv(msg.content.substr(1));
        let command = rest_of_msg[0];
        //if message had a command
        if (command in commands) {
            executeCommand(command, msg, rest_of_msg.slice(1))
        }
    } else if (msg.content.toLowerCase().includes('who')) {
        msg.channel.send('asked');
    }
});