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
	//	let errors = [];

	try {
		let gameCode = bcypt.hashSync("GameofUr", 10);
		let gameExists = await GameOfUr.findOne({ where: { passCode: email } });

		if (gameExists) {
			// ohjaa takaisin rekisteröinti-sivulle
		}
		else {
			
			req.flash('success_msg', 'You have now registered!');
//			res.redirect('/logintuto/users/register');
			res.render('register');
		}
		//		var hash = bcrypt.hashSync(password, 10);
		//		user = await User.create({
		//			userName: name,
		//			email: email,
		//			password: hash
		//		});
	} catch (err) {
		errors.push({ msg: "Something happened. Couldn't generate gamecode." });
//				res.render('register', { errors, name, email, password, password2 });
	}
});

router.post('/login',
	passport.authenticate('local', {
		failureRedirect: '/logintuto/users/login',
		failureFlash: true,
	}),
	function(req, res) {
		dashboard = '/' + req.user.name + '/dashboard';
		res.redirect('/logintuto/users' + dashboard);
	}
);

// logoutensureAuthenticated
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', "You've successfully logged out.");
	res.redirect('/logintuto/users/login');
});

router.get('/:userName/dashboard', ensureAuthenticated, (req, res) => {
	res.render('dashboard', {
		user: req.user
	});
});

// delete account
router.post('/:userName/dashboard', ensureAuthenticated, async function(req, res) {
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
