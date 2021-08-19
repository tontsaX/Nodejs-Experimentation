const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
//const User = require("../db/models").User;
const GameOfUr = require("../db/models").GameOfUr;

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'game',
        passwordField: 'gamecode'
    },
		async function(empty, gamecode, done) {
			// jos koodi kryptattu, niin findOne ei tule koskaan löytämään selaimen kautta
			// annettavaa koodia
            var game = await GameOfUr.findOne({ where: {passCode: gamecode} });
            var errMsg = "Incorrect passcode.";
            
            if(game === null) {
                return done(null, false, {message: errMsg});
            } 
            else {
            
            	if(gamecode === game.passCode || game.players < 2) {
					return done(null, game);
				}
				else {
					return done(null, false, {message: errMsg});
				}
				// ei saada toimimaan ilman username systeemiä
//                bcrypt.compare(gamecode, game.passCode, function (err, isMatch) {
//                    if(err) throw err;
//                            
//                    if(isMatch) {
//                        return done(null, game);
//                    } else {
//                        return done(null, false, {message: errMsg});
//                    }
//                }); 
                
            }
        })   
    ); // end of passport.use
    
    passport.serializeUser((user, done)=> {
        done(null, user);
    });
    
    passport.deserializeUser((user, done)=>{
        done(null, user);
    });
};