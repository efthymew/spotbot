const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

class Database {
    constructor(dbn) {
        const adapter = new FileSync(dbn)
        const db = low(adapter)
        db.defaults({ queues: [] })
            .write()
        this.db = db;
    }

    addQueue(name, current_queue) {
        this.db.get('queues').push({ name: name, songs: [] })
        for (let i = 0; i < current_queue.length; i++) {
            let my_queue = this.db.get('queues').find({ name: name }).get('songs')
            my_queue.push(current_queue[0]);
        }
        this.db.write();
    }

    addToQueue(songName) {

    }

    deleteQueue(name) {
        this.db.get('queues').remove({ name: name })
        this.db.write();
    }
}

module.exports = {
    Database: new Database('db.json')
}