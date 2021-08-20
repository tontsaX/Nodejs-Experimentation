const express = require('express');
const router = express.Router();
const socketio = require('socket.io');
const {ensureAuthenticated} = require("../config/auth");

router.get('/', (req, res) => {
	
});

router.get('/chatroom-:chatName', ensureAuthenticated, function(req, res) {
    createSocketConnection(req.user.userName);
    res.render('chatroom', {
		user: req.user,
		chatroom: req.params.chatName
	});
});

const serverExport = require('../config/server');
const io = socketio(serverExport.server);

function createSocketConnection(username) {
    // Was io.on, but it caused message duplication problems when
    // client makes request to /chatroom-:chatName
    // works, if not used as a function
    // any and every request to /chatroom-:chatName added a new client as
    // the same client, which lead multiplication of messages
    io.once('connection', socket => {
        var chatroom = '';
        
        socket.on('chatroom', data => {
            socket.join(data.chatroom);
            chatroom = data.chatroom;
        });
        
        console.log("New user connected.")
        console.log("Chatroom: " + chatroom);
	    console.log("=============");
        
        // message received from the client
        socket.on('new_message', data => {
            console.log("new message");
		    io.to(chatroom).emit('receive_message', {message: data.message, username: data.username});
        });
        
        socket.on('typing', data => {
            /*"When we use broadcast, every user except the one who is typing the message receives the typing event from the server."*/
            socket.to(chatroom).broadcast.emit('typing', {username: username});
        });
    })

}

module.exports = router;
