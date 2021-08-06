// ladataan user model käyttöön
const express = require('express');
const router = express.Router();
//const User = require('../db/models').User;
const GameOfUr = require('../db/models').GameOfUr;
const bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated} = require("../config/auth");

// login handle
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

// uses a regex to check if email is valid
function isValidEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Register handle
router.post('/register', async function(req, res) {
    const {name, email, password, password2} = req.body;
    let errors = [];
    
    if(!name || !email || !password || !password2) {
        errors.push({msg: "Please fill in all fields."});
    }
    if(!isValidEmail(email)) {
        errors.push({msg: "Please fill in a valid email."});
    }
    // check if password is more than 6 characters
    if(password.length < 6) {
        errors.push({msg: "password atleast 6 characters"});
    }
    // check if passwords match
    if(password != password2) {
        errors.push({msg: "passwords don't match"});
    }
    // if any errors render register page again with input values
    if(errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password,
            password2: password2
        });
    } else { // validation passed
        var userExists = await User.findOne({ where: {email: email}});
        
        if(userExists) {
            errors.push({msg: "Email already exists."});
            res.render('register', {errors,name,email,password,password2});
        } else{
            try {
                var hash = bcrypt.hashSync(password, 10);
                user = await User.create({
                    userName: name,
                    email: email,
                    password: hash
                });
                req.flash('success_msg','You have now registered!');
                res.redirect('/logintuto/users/login');
            } catch(err) {
                errors.push({msg: "Something happened. Couldn't register."});
                res.render('register', {errors,name,email,password,password2});
            }
        }
    }
});

router.post('/login', 
    passport.authenticate('local', {
        failureRedirect: '/logintuto/users/login',
        failureFlash: true,
    }),
    function(req, res){
        dashboard = '/' + req.user.name +'/dashboard';
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
        const {email} = req.body;
        await User.destroy({ where: {email: email} });
        req.flash('success_msg', 'Account deleted.');
    } catch(err) {
        console.log(err);
        req.flash('error_msg', 'Resource not deleted.')
        req.logout();
    }
    res.redirect('/logintuto/users/login');
});

module.exports = router;
