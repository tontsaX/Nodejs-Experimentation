const express = require('express');
const expressEjsLayout = require('express-ejs-layouts');
const appExport = require('./config/server');
const app = appExport.app;

const passport = require('passport');
require("./config/passport")(passport)

const flash = require('connect-flash');
const session = require('express-session');

// EJS
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(expressEjsLayout);

// BodyParser
app.use(express.urlencoded({extended: false}));

// setting up express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Authentication system
app.use(passport.initialize());
app.use(passport.session({resave: false}));

// flash-message stuff, not to be confused with the browser flash thing
app.use(flash());
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/logintuto', require('./routes/index'));
app.use('/logintuto/users', require('./routes/users'));
app.use('/', require('./routes/socketing'));
