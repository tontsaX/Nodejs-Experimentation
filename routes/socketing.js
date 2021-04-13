const express = require('express');
const router = express.Router();
const socketio = require('socket.io');
const {ensureAuthenticated} = require("../config/auth");
var chatroom = ''; /* tätä ei voi käyttää, koska se vaihtuu joka kerta
                    * kun chat-osoitteeseen otetaan yhteyttä
                    */

router.get('/', (req, res) => {
	
});

// http://localhost:3000/chathall/chatroom-
router.get('/chatroom-:chatName', ensureAuthenticated, (req, res) => {
	chatroom = req.params.chatName;
    res.render('chatroom', {
		user: req.user,
		chatroom: req.params.chatName
	});
});

const serverExport = require('../config/server');
const io = socketio(serverExport.server);

io.on('connection', socket => {

    //socket.join(chatroom);
    
    socket.on('chatroom', data => {
        socket.join(data.chatroom);
        console.log("Chatroom from client: " + data.chatroom);
    });
    
    console.log("New user connected.")
	//console.log("Chatroom from client: " + chatroom);
	console.dir(socket.rooms);
	//console.log("Connect count: " + );
	console.log("=============");
    
    // message received from the client
    socket.on('new_message', data => {
        console.log("new message");
		//io.sockets.emit('receive_message', {message: data.message, username: data.username});
		io.to(data.chatroom).emit('receive_message', {message: data.message, username: data.username});
    });
    
    socket.on('typing', data => {
        /*"When we use broadcast, every user except the one who is typing the message receives the typing event from the server."*/
        //socket.to(chatroom).emit('typing', {username: socket.username});
        socket.broadcast.emit('typing', {username: socket.username});
    });
})

module.exports = router;
