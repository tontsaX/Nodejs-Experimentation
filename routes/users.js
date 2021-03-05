// ladataan user model käyttöön
const express = require('express');
const router = express.Router();
const db = require('../db/models/index');
//const User = require("../models/user.js");
const bcrypt = require('bcrypt');
const passport = require('passport');

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
router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [];
    //console.log(' Name ' + name + ' email: ' + email + ' pass: ' + password);
    
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
    } else {
        // validation passed
        var user = {};
        // kryptataan salasana ja samalla tallennetaan käyttäjä
        bcrypt.genSalt(10,(err,salt)=> 
                bcrypt.hash(password,salt,
                (err,hash)=> {
                    if(err) throw err;
                        user = await User.create({
                            username: name,
                            email: email,
                            password: hash
                        });
                    .then((value)=>{
                        console.log(value);
                        req.flash('success_msg','You have now registered!');
                        res.redirect('/logintuto/users/login');
                    })
                    .catch(value=> console.log(value));                      
        }));
    } // validation passed ends here
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/logintuto/dashboard',
        failureRedirect: '/logintuto/users/login',
        failureFlash: true,
    })(req,res,next);
});

// logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Now logged out');
    res.redirect('/logintuto/users/login');
});

module.exports = router;
