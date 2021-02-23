const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

class Database {
    constructor(dbn) {
        const adapter = new FileSync(dbn)
        const db = low(adapter)
        this.db = db;
    }

    addQueue(name, current_queue) {
        this.db.get('queues').value().push({ name: name, songs: [] })
        for (let i = 0; i < current_queue.length; i++) {
            let my_queue = this.db.get('queues').find({ name: name }).get('songs').value()
            my_queue.push(current_queue[0]);
        }
        this.db.write();
    }

    queueExists(name) {
        return this.db.get('queues').find({name: name}).value() != null
    }
    addToQueue(queueName, songName) {
        let my_queue = this.db.get('queues').find({ name: queueName }).get('songs').value()
        my_queue.push(songName);
        this.db.write();
    }

    deleteQueue(name) {
        this.db.get('queues').remove({ name: name })
        this.db.write();
    }
}

module.exports = {
    Database: new Database('db.json')
}