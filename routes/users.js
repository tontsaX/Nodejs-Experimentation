// ladataan user model käyttöön
const express = require('express');
const router = express.Router();
//const User = require('../db/models').User;
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
	//	const { name, email, password, password2 } = req.body;
	const { gamecode } = req.body;
	let errors = [];

	try {
		let gameCode = bcrypt.hashSync("GameofUr", 10);
		let gameExists = await GameOfUr.findOne({ where: { passCode: gameCode } });

		console.log("Gamecode: " + gameCode);

		if (gameExists) {
			// ohjaa takaisin rekisteröinti-sivulle ja kerro, että koodi täytyy luoda uudestaan
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
	req.logout();
	req.flash('success_msg', "You've successfully logged out.");
	res.redirect('/logintuto/users/login');
});

router.get('/:passCode/dashboard', ensureAuthenticated, (req, res) => {
	// here is defined the variable name used in the dashboard.ejs
	// in this case variable named game would be more representing than user
	res.render('dashboard', {
		user: req.user
	});
});

// delete account
// :passCode comes from a form in dashboard.ejs. The variable is user.passCode.
router.post('/:passCode/dashboard', ensureAuthenticated, async function(req, res) {
	try {
		const { email } = req.body;
		await User.destroy({ where: { email: email } });
		req.flash('success_msg', 'Account deleted.');
	} catch (err) {
		console.log(err);
		req.flash('error_msg', 'Resource not deleted.')
		req.logout();
	}
	res.redirect('/logintuto/users/login');
});

module.exports = router;
