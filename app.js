// express configuration
const express = require('express')
const socketio = require('socket.io')
const app = express()

const flash = require('connect-flash');
const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());
const {ensureAuthenticated} = require("./config/auth");

// EJS
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', ensureAuthenticated, (req, res) => {
    res.render('index')
});

//app.use('/', (req, res) => {
//    res.render('index')
//})

const server = app.listen(process.env.PORT || 3000, () => console.log("server is running"))

// initialize socket for the server
const io = socketio(server)

io.on('connection', socket => {
    console.log("New user connected.")
    
    socket.username = "Anonymous"
    
    socket.on('change_username', data => {
        socket.username = data.username
    })
    
    // handle the new message event
    socket.on('new_message', data => {
        console.log("new message");
        io.sockets.emit('receive_message', {message: data.message, username: socket.username});
    });
    
    socket.on('typing', data => {
        /*"When we use broadcast, every user except the one who is typing the message receives the typing event from the server."*/
        socket.broadcast.emit('typing', {username: socket.username});
    });
})

// login tuto
//const router = express.Router();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');

const passport = require('passport');
require("./config/passport")(passport)

// mongoose
// mongodb:ssä näkyvä tietokanta, jossa users taulu löytyy on nimeltään 'logintuto'
// kun mongoose ottaa yhteyden mongoon, niin mongo luo lokaalin tietokannan 'logintuto'
// jos sellaista ei vielä ole
mongoose.connect('mongodb://localhost/logintuto', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('connected to mongo'))
.catch((err) => console.log(err));

// EJS
app.use(expressEjsLayout);

// BodyParser
app.use(express.urlencoded({extended: false}));

// express session
//app.use(session({
//    secret: 'secret',
//    resave: true,
//    saveUninitialized: true
//}));

app.use(passport.initialize());
app.use(passport.session());

// flash-message stuff, not to be confused with the browser flash thing
// use flash
//app.use(flash());
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/logintuto', require('./routes/index'));
app.use('/logintuto/users', require('./routes/users'));
