// Immediately Invoked Function Expression (IIFE) or Self Executing Anonymous Function
// The function connect() is invoked when the file is loaded.
// With this you can control function visibility. It's a closure.
(function connect(){
    let socket = io.connect('/');
    let username = document.querySelector('#username').innerHTML;

    let message = document.querySelector('#message');
    let messageBtn = document.querySelector('#messageBtn');
    let messageList = document.querySelector('#message-list');

	// chatroom is defined in chatroom.ejs
	console.log(chatroom);
	socket.emit('chatroom', {chatroom: chatroom});
    
    messageBtn.addEventListener('click', e => {
        console.log(message.value);
		console.log(chatroom);
        socket.emit('new_message', {chatroom: chatroom, username: username, message: message.value});
        message.value = '';
    });
    
    socket.on('receive_message', data => {
        console.log(data);
        let listItem = document.createElement('li');
        listItem.textContent = data.username + ': ' + data.message;
        listItem.classList.add('list-group-item');
        messageList.appendChild(listItem);
    });
    
    let info = document.querySelector('.info');
    
    message.addEventListener('keypress', e => {
        socket.emit('typing');
    });
    
    socket.on('typing', data => {
        info.textContent = data.username + " is typing..."
        setTimeout(() => {info.textContent=''}, 5000);
    });
})();
