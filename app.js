const express = require('express');
const appExport = require('./config/server');
const app = appExport.app;

// login tuto
//const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const expressEjsLayout = require('express-ejs-layouts');
const passport = require('passport');
require("./config/passport")(passport)

const flash = require('connect-flash');
const session = require('express-session');

// mongoose
// mongodb:ssä näkyvä tietokanta, jossa users taulu löytyy on nimeltään 'logintuto'
// kun mongoose ottaa yhteyden mongoon, niin mongo luo lokaalin tietokannan 'logintuto'
// jos sellaista ei vielä ole
/*mongoose.connect('mongodb://localhost/logintuto', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('connected to mongo'))
.catch((err) => console.log(err));*/

// initialize sequelize
//const sequelize = new Sequelize('postgres://doka:Polttavaongelma7@localhost/seqTuto');

const sequelize = new Sequelize('','','', {
    host: '',
    dialect: 'postgres'
});

// test the connection
testDb();
async function testDb() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch(error) {
        console.error('Unable to connect to the database:', error);
    }
}

// EJS
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(expressEjsLayout);

// BodyParser
app.use(express.urlencoded({extended: false}));

// express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Authentication system
app.use(passport.initialize());
app.use(passport.session());

// flash-message stuff, not to be confused with the browser flash thing
// use flash
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
