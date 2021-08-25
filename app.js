const express = require('express');
const app = require('./config/server').app;

const expressEjsLayout = require('express-ejs-layouts');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressEjsLayout);

const expressSession = require('express-session');
app.use(expressSession({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const passport = require('passport');
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session({resave: false}));

const flash = require('connect-flash');
app.use(flash());
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// BodyParser
app.use(express.urlencoded({extended: false}));

// Routes
app.use('/', require('./routes/index'));
app.use('/game-of-ur', require('./routes/gameofUr'));
app.use('/worm-game', require('./routes/wormGame'));