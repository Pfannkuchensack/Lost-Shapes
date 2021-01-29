var express = require('express');
var fs = require('fs');
//    https =      require('https'),
var http = require('http');
/* var server = https.createServer({
				key: fs.readFileSync('/etc/letsencrypt/live/www.meinonline.date/privkey.pem'),
				cert: fs.readFileSync('/etc/letsencrypt/live/www.meinonline.date/cert.pem'),
		ca: fs.readFileSync('/etc/letsencrypt/live/www.meinonline.date/chain.pem'),
		requestCert: false, rejectUnauthorized: false
				},app); */
var app = express();
var server = http.createServer(app);
var dotenv = require('dotenv').config();
var crypto = require('crypto');
var clients = [];
/* Besseres logging */
var log = function () { return console.log.apply(console, ['[' + new Date().toISOString().slice(11, -5) + ']'].concat(Array.prototype.slice.call(arguments))); };

/* redis + socket.io */
const redis = require('redis');
const io = require('socket.io')(server);
const { argv } = require('process');
server.listen(8010);
log('Starte Websocket Server');

process.on('uncaughtException', function (e) {
	log(e);
	process.exit(1);
});

/* alle 15 Sekunden Auslatung posten */
setInterval(countuser, 15000);
function countuser() {
	log('Auslastung: ' + Object.keys(clients).length + ' User');
}
const RetryStrategy = function (options) {
	if (options.error && (options.error.code === 'ECONNREFUSED' || options.error.code === 'NR_CLOSED')) {
		// Try reconnecting after 5 seconds
		log('The server refused the connection. Retrying connection...');
		return 5000;
	}
	if (options.total_retry_time > 1000 * 60 * 60) {
		// End reconnecting after a specific timeout and flush all commands with an individual error
		return new Error('Retry time exhausted');
	}
	if (options.attempt > 50) {
		// End reconnecting with built in error
		log('Redis Server 50 Times');
		return undefined;
	}
	// reconnect after
	return Math.min(options.attempt * 100, 3000);
}
const redisClient = redis.createClient({ host: process.env.REDIS_HOST, port: 6379, retry_strategy: RetryStrategy, lazyConnect: true, retry_unfulfilled_commands: true });
//redisClient.auth(process.env.REDIS_PASSWORD); // Nicht nötig local
redisClient.subscribe('ls:gamelobby');



io.on('connection', function (socket) {
	// var hostname = socket.handshake.headers.host.toLowerCase();
	socket.on('go', function (data) {
		/* Logic ob user in lobby drin ist
		if (data.hash === crypto.createHash('md5').update(data.user_id + '_' + process.env.APP_NAME).digest('hex')) {
			socket.user_id = data.user_id;
			// if (true === true) {
			// socket.emit('debug', 'Broadcast ready!');
			// } else {
			// socket.emit('debug', 'Keine Verbindung zum Broadcast');
			// }
			// Redis Nachrichten Verabrieten und entsprechend weiterleiten
			redisClient.addListener('message', NewMsg);
			clients[socket.id] = { socket: socket.id, user_id: socket.user_id };
		} else {
			socket.emit('debug', 'Error' + data);
			socket.disconnect();
		}*/
		redisClient.addListener('message', NewMsg);
		clients[socket.id] = { socket: socket.id, user_id: socket.user_id, lobby: data.gameid, color: data.color };
	});

	socket.on('disconnect', reason => {
		delete clients[socket.id];
		redisClient.removeListener('message', NewMsg);
	});

	function NewMsg(channel, message) {
		if (channel == 'ls:gamelobby:' + socket.lobby) {
			try {
				const obj = JSON.parse(message);
				if (obj.networkColor != socket.color) {
					socket.emit('lsgame', message);
					log(message);
				}
			} catch (error) {
				log(error);
			}
		}
	}
});
