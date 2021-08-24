const express = require('express');
const router = express.Router();
const GameOfUr = require('../db/models').GameOfUr;
const bcrypt = require('bcrypt');
const passport = require('passport');

router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/register', (req, res) => {
	res.render('register');
});

// Register handle
router.post('/register', async function(req, res) {
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
			res.render('register', { errors });
		}
		else {
			game = await GameOfUr.create({
				passCode: newGamecode,
				players: 0
			});
			
			// The login() function is exposed on req object by passport and can be used to redirect registered user to user page. -passportjs.org
			req.login(game, function(err) {
				if (err) { res.render('register', { gamecode: newGamecode }); }
				gameroom = '/gameofur-' + game.passCode;
				res.redirect(gameroom);
			});
		}
	} catch (err) {
		errors.push({ msg: "Something happened. Couldn't generate gamecode." });
		console.log(err);
		res.render('register', { errors });
	}
});

router.post('/login',
	passport.authenticate('local', {
		failureRedirect: '/logintuto/users/login',
		failureFlash: true,
	}),
	function(req, res) {
		dashboard = '/' + req.user.passCode + '/dashboard';
		res.redirect('/logintuto/users' + dashboard);
	}
);

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
	req.flash('success_msg', "You've successfully logged out.");
	res.redirect('/logintuto/users/login');
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

module.exports = router;