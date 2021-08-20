const express = require('express');
const router = express.Router();
const GameOfUr = require('../db/models').GameOfUr;
const bcrypt = require('bcrypt');
const passport = require('passport');
const { ensureAuthenticated } = require("../config/auth");

// login handle
router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/register', (req, res) => {
	res.render('register');
});

// käyttäjä painaa nappia
// palvelin generoi pelikoodin
// palvelin uudelleenohjaa käyttäjän rekisteröintisivulle, 
// jossa näkyy generoitu pelikoodi ja nappi || linkki peliin
// kun käyttäjä painaa nappia, niin tämä ohjataan peliin
// Register handle
router.post('/register', async function(req, res) {
	let errors = [];
	var game;

	try {
		let newGamecode = bcrypt.hashSync("GameofUr", 10);

		// We don't want to have slashes in our code, because the browser would navigate to a page, that doesn't exists.
		// If the hashed string would be a password, this would NOT be a correct procedure to handle cryption.
		// What we could do instead of this is to generate a random string and then hash it and save.
		// Then we can use the generated random string as a gamecode and the database isn't compromised.

		// Jos pelikoodit halutaan kryptata tietokannassa, niin niiden pariksi tarvitaan käyttäjänimi
		// yhden koodin jutussa voisi olla ponnahdusikkuna pelin luojalle kun joku kirjautuu käyttäen pelikoodia
		if (newGamecode.includes("\/")) {
			newGamecode = newGamecode.replace(/\//g, "-");
		}

		let gameExists = await GameOfUr.findOne({ where: { passCode: newGamecode } });

		if (gameExists) {
			// Render the gamecode generation page and ask the user to generate a gamecode again.
			errors.push({ msg: "Couldn't generate gamecode. Please try again." });
			res.render('register', { errors });
		}
		else { // If game with a generated gamecode doesn't exist, create a new game.
			game = await GameOfUr.create({
				passCode: newGamecode,
				players: 0
			});
			
			// login() function is exposed on req object by passport and can be used
			// to redirect registered user to user page
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

	req.logout(); // node "passport exposes logout() function on req" object
	req.flash('success_msg', "You've successfully logged out.");
	res.redirect('/logintuto/users/login');
});

// game dashboard
// change navigation so that the user goes straight to the game. there's nothing more in the genertated game
router.get('/:passCode/dashboard', ensureAuthenticated, (req, res) => {
	// Here is defined the variable name used in the dashboard.ejs.
	res.render('dashboard', {
		game: req.user
	});
});

// delete game
// The path variable :passCode comes from a form in dashboard.ejs. The variable is user.passCode.
router.post('/:passCode/dashboard', ensureAuthenticated, async function(req, res) {
	try {
		const { gamecode } = req.body;
		await GameOfUr.destroy({ where: { passCode: gamecode } });
		req.flash('success_msg', 'Account deleted.');
	} catch (err) {
		console.log(err);
		req.flash('error_msg', 'Resource not deleted.')
		req.logout();
	}
	res.redirect('/logintuto/users/login');
});

module.exports = router;
