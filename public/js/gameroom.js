// Immediately Invoked Function Expression (IIFE) or Self Executing Anonymous Function
// The function connect() is invoked when the file is loaded.
// With this you can control function visibility. It's a closure.
(function connect(){
    let socket = io.connect('/');
    let playername = document.querySelector('#playername').innerHTML;

    let message = document.querySelector('#message');
    let messageBtn = document.querySelector('#messageBtn');
    let messageList = document.querySelector('#message-list');

	// gameroom is defined in gameroom.ejs
	console.log(gameroom);
	
	// Sends object, which is catch in socketing.js socket.on('gameroom'..).
	socket.emit('gameroom', {gameroom: gameroom});
    
    messageBtn.addEventListener('click', e => {
        console.log(message.value);
		console.log(gameroom);
        socket.emit('new_message', {gameroom: gameroom, playername: playername, message: message.value});
        message.value = '';
    });
    
    socket.on('receive_message', data => {
        console.log(data);
        let listItem = document.createElement('li');
        listItem.textContent = data.playername + ': ' + data.message;
        listItem.classList.add('list-group-item');
        messageList.appendChild(listItem);
    });
    
    let info = document.querySelector('.info');
    
    message.addEventListener('keypress', e => {
        socket.emit('typing');
    });
    
    socket.on('typing', data => {
        info.textContent = data.playername + " is typing..."
        setTimeout(() => {info.textContent=''}, 5000);
    });
})();
