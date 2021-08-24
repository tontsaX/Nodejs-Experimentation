const express = require('express');
const router = express.Router();
const socketio = require('socket.io');
const GameOfUr = require('../db/models').GameOfUr;
//const { ensureAuthenticated } = require("../config/auth");

// needs to be moved to where other route definitions are
router.get('/gameofur-:gamecode', async function(req, res) {
	let errors = [];

	try {
		let game = await GameOfUr.findOne({ where: { passCode: req.params.gamecode } });

		if (game && game.players < 2) {
			game.players++;
			game.save();

			req.login(game, function(err) {
				if(err) { 
					console.log("Login error msg: " + err);
					res.redirect('/logintuto/users/register'); 
				}
				
				let playername = generatePlayername(game.players);
				
				createSocketConnection(generatePlayername(game.players));
				
				res.render('gameroom', {
					game: req.user,
					playername: playername
				});
			});
		}
		else {
			errors.push({ msg: "You need to generate a game before playing." });
			res.redirect('/logintuto/users/register');
		}
	} catch (err) {
		console.log(err);
		errors.push({ msg: "You need to generate a game before playing." });
		res.redirect('/logintuto/users/register');
	}
});

function generatePlayername(playerCount) {
	switch(playerCount) {
		case 1: return "Uruk";
		case 2: return "Akkad";
	}
}

// socketing stuff
const serverExport = require('../config/server');
const io = socketio(serverExport.server);

function createSocketConnection(playername) {
	// Was io.on, but it caused message duplication problems when
	// client makes request to /chatroom-:chatName
	// works, if not used as a function
	// any and every request to /chatroom-:chatName added a new client as
	// the same client, which lead multiplication of messages
	io.once('connection', socket => {
		var gameroom = '';

		socket.on('gameroom', function(data) {
			socket.join(data.gameroom);
			gameroom = data.gameroom;
		});

		console.log("New user connected.")
		console.log("Gameroom: " + gameroom);
		console.log("=============");

		// message received from the client
		socket.on('new_message', function(data) {
			console.log("new message");
			io.to(gameroom).emit('receive_message', { message: data.message, playername: data.playername });
		});

		socket.on('typing', function(data) {
			// "When we use broadcast, every user except the one who is typing the message receives the typing event from the server."
			socket.to(gameroom).broadcast.emit('typing', { playername: playername });
		});
	})

}

module.exports = router;
