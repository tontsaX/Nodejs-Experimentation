const express = require('express');

const flash = require('connect-flash');

const passport = require('passport');
require('./config/passport')(passport);

const expressSession = require('express-session');

const expressEjsLayout = require('express-ejs-layouts');

const { app } = require('./config/server');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressEjsLayout);

app.use(
  expressSession({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session({ resave: false }));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// BodyParser
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', require('./routes'));
app.use('/game-of-ur', require('./routes/game-of-ur'));
app.use('/worm-game', require('./routes/worm-game'));
