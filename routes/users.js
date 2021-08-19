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
	// req.body looks for a field named gamecode in register.ejs and puts the result here
	// right now value found would be empty
	//	const { gamecode } = req.body;
	let errors = [];

	try {
		let gameCode = bcrypt.hashSync("GameofUr", 2);

		// We don't want to have slashes in our code, because the browser would navigate to a page, that doesn't exists.
		// If the hashed string would be a password, this would NOT be a correct procedure to handle cryption.
		if (gameCode.includes("\/")) {
			console.log("There's a slash!");
			gameCode = gameCode.replace(/\//g, "-");
		}

		let gameExists = await GameOfUr.findOne({ where: { passCode: gameCode } });

		console.log("Gamecode: " + gameCode);

		if (gameExists) {
			// Render the gamecode generation page and ask the user to generate a gamecode again.
			errors.push({ msg: "Couldn't generate gamecode. Please try again." });
			res.render('register', { errors });
		}
		else {
			user = await GameOfUr.create({
				passCode: gameCode,
				players: 1
			});

			req.flash('success_msg', 'Your game has been created!');
			res.render('register', { gamecode: gameCode });
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

router.get('/logout', (req, res) => {
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
