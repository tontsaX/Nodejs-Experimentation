// express configuration
const express = require('express')
const socketio = require('socket.io')
const app = express()

// EJS
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
})

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
const router = express.Router();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');

// mongoose
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('connected to mongo'))
.catch((err) => console.log(err));

// EJS
app.use(expressEjsLayout);
app.use(express.static('routes'));

// BodyParser
app.use(express.urlencoded({extended: false}));

// Routes
app.use('/logintuto', require('./routes/index.js'));
app.use('/logintuto/users', require('./routes/users'));
