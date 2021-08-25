const express = require('express');
const router = express.Router();
const GameOfUr = require('../db/models').GameOfUr;
const bcrypt = require('bcrypt');
const passport = require('passport');
const socketio = require('socket.io');
//const { ensureAuthenticated } = require("../config/auth");

router.get('/', (req, res) => {
	res.render('createGameofUr');
});

// Create a game and log in the game
router.post('/create-game', async function(req, res) {
	let errors = [];
	var game;

	try {
		let newGamecode = bcrypt.hashSync("GameofUr", 2);

		// We don't want to have slashes in our gamecode (used as address to navigate to a game), because the browser would navigate to a page, that doesn't exists.
		// If the hashed string would be used as a password with an account, this would NOT be a correct procedure to handle password storing.
		// And further more, you absolutely do NOT put passwords in an address.
		if (newGamecode.includes("\/")) {
			newGamecode = newGamecode.replace(/\//g, "-");
		}

		let gameExists = await GameOfUr.findOne({ where: { passCode: newGamecode } });

		if (gameExists) {
			errors.push({ msg: "Couldn't generate gamecode. Please try again." });
			res.render('createGameofUr', { errors });
		}
		else {
			game = await GameOfUr.create({
				passCode: newGamecode,
				players: 0
			});
			
			// The login() function is exposed on req object by passport and can be used to redirect registered user to user page. -passportjs.org
			req.login(game, function(err) {
				if (err) { res.render('createGameofUr', { gamecode: newGamecode }); }
				gameroom = '/game-of-ur/' + game.passCode;
				res.redirect(gameroom);
			});
		}
	} catch (err) {
		errors.push({ msg: "Something happened. Couldn't generate gamecode." });
		console.log(err);
		res.render('createGameofUr', { errors });
	}
});

router.get('/logout', async function(req, res) {
	try {
		let gamecode = req.user.passCode;
		let game = await GameOfUr.findOne({ where: { passCode: gamecode } });

		game.players--;

		if (game.players <= 0) {
			await game.destroy();
		}
		else {
			await game.save();
		}

	} catch (err) {
		console.log("Player reduction failed.");
		console.log(err);
	}
	
	console.log("Logout ready.");
	
	req.logout();
	res.redirect('/game-of-ur');
//	req.flash('success_msg', "You've successfully logged out.");
//	res.redirect('/login');
});

// Works with navigator object.
// Don't redirect to router.get('/logout'..). The logout with sendBeacon() won't happen then.
router.post('/logout', async function(req, res) {
	// need to make a query function
	// this try-cactch-clause is used the same way many times
	try {
		let gamecode = req.user.passCode;
		let game = await GameOfUr.findOne({ where: { passCode: gamecode } });
	
		game.players--;

		if (game.players <= 0) {
			await game.destroy();
		}
		else {
			await game.save();
		}

	} catch (err) {
		console.log("Player reduction failed.");
		console.log(err);
	}

	req.logout();
});

router.get('/:gamecode', async function(req, res) {
	let errors = [];

	try {
		let game = await GameOfUr.findOne({ where: { passCode: req.params.gamecode } });

		if (game && game.players < 2) {
			game.players++;
			game.save();

			req.login(game, function(err) {
				if(err) { 
					console.log("Login error msg: " + err);
					res.redirect('/game-of-ur'); 
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
			res.redirect('/game-of-ur');
		}
	} catch (err) {
		console.log(err);
		errors.push({ msg: "You need to generate a game before playing." });
		res.redirect('/game-of-ur');
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

//		console.log("New user connected.")
//		console.log("Gameroom: " + gameroom);
//		console.log("=============");

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
