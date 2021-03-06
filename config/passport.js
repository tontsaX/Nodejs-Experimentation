const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require("../db/models").User;

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async function(email, password, done) {
        // kirjautuu, mutta kirjautuu kaikilla salasanoilla
        var user = await User.findOne({ where: {email: email} });
        if(user == null) {
            return done(null, false, {message: 'Incorrect email or password.'});
        }
        // väärällä postilla ja oikealla salasanalla password on null
        // tämä tarkoittaa sitä, että password ja user.password viittaavat
        // samaan arvoon
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) throw err;
                    
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Incorrect email or password.'});
            }
        }) 

        return done(null, user);
    }));
    
    passport.serializeUser((user, done)=> {
        done(null, user);
    });
    
    passport.deserializeUser((user, done)=>{
        done(null, user);
    });
};
