(function connect(){
    let socket = io.connect('/');
    let username = document.querySelector('#username').innerHTML;

    let message = document.querySelector('#message');
    let messageBtn = document.querySelector('#messageBtn');
    let messageList = document.querySelector('#message-list');

	console.log(chatroom);
    
    messageBtn.addEventListener('click', e => {
        console.log(message.value);
		console.log(chatroom);
        socket.emit('new_message', {room: chatroom, username: username, message: message.value});
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
})()
