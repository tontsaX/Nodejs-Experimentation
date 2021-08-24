const LocalStrategy = require('passport-local').Strategy;
//const bcrypt = require('bcrypt');
const GameOfUr = require("../db/models").GameOfUr;

module.exports = function(passport) {
	passport.use(new LocalStrategy({
		// These fields are in login.ejs
		usernameField: 'game',
		passwordField: 'gamecode'
	},
		async function(empty, gamecode, done) {
			try {
				var game = await GameOfUr.findOne({ where: { passCode: gamecode } });
				var errMsg = "Incorrect passcode.";

				if (game === null) {
					return done(null, false, { message: errMsg });
				}
				else {
					if (game.players < 2) {
						return done(null, game);
					}
					else {
						return done(null, false, { message: errMsg });
					}
				}
			} catch (err) {
				return done(err);
			}
		}) // end of strategy callback
	); // end of passport.use

	passport.serializeUser((game, done) => {
		done(null, game);
	});

	passport.deserializeUser((game, done) => {
		done(null, game);
	});
};