/* global $, io */
(function () {
	'use strict';

	var socket;

	function startsocket() {
		// ,
		socket = io.connect('ws://localhost:8010', { reconnect: true, transports: ['websocket', 'polling'], forceNew: true });
		socket.on('connect', function (data) {
			socket.emit('go', {}/*{ hash: document.head.querySelector('meta[name="hash"]').content, user_id: document.head.querySelector('meta[name="user_id"]').content }*/);
		});

		socket.on('lsgame', function (data) {
			const json = JSON.parse(data);
			console.log(data);
		});

		socket.on('debug', function (data) {
			console.log(data);
		});
	}

	window.addEventListener('load', startsocket);
}());
