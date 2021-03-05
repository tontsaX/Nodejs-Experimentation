const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require("../db/models").User;

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async function(email, password, done) {
        var user = await User.findOne({ where: {email:email} });
        if(user == null || !user.validPassword(password)) {
            return done(null, false, {message: 'Incorrect email or password.'});
        }
        return done(null, user);
    });
};
