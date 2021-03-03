const express = require('express');
const router = express.Router();
const socketio = require('socket.io');
const {ensureAuthenticated} = require("../config/auth");

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('index')
});

//const server = express().listen(process.env.PORT || 3000, () => console.log("server is running"))
const serverExport = require('../config/server');
//const io = socketio(require('../config/server'))
const io = socketio(serverExport.server);

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

module.exports = router;