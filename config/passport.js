const LocalStrategy = require('passport-local').Strategy;
const GameOfUr = require("../db/models").GameOfUr;

module.exports = function(passport) {
	passport.use(new LocalStrategy({
		usernameField: 'game',
		passwordField: 'gamecode'
	},
		async function(gameOfUr, gamecode, done) {
			var game = await GameOfUr.findOne({ where: { passCode: gamecode } });
			var errMsg = "Incorrect passcode.";

			if (game === null) {
				return done(null, false, { message: errMsg });
			}
			else {

				if (gamecode === game.passCode) {
					return done(null, game);
				}
				else {
					return done(null, false, { message: errMsg });
				}
			}
		})
	); // end of passport.use

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});
};