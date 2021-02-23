const db = require( './database.js').Database;

db.addQueue('test', ['ihawio0fhawiofhawiofhawofha']);
db.addToQueue('test', 'wopjpaFJawifawoipfahjwfoaifaf')
console.log(db.queueExists('test'))
console.log(db.queueExists('testw353'))
db.deleteQueue('test');