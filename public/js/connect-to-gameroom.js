(() => {
  // eslint-disable-next-line no-undef
  const socket = io.connect('/');

  /** Use querySelector if you can't access element with just an id */
  const playername = document
    .getElementById('player-name')
    .getAttribute('data-player-name');

  const message = document.getElementById('message');
  const messageBtn = document.getElementById('message-btn');
  const messageList = document.getElementById('message-list');

  const gameroom = document
    .getElementById('game-code')
    .getAttribute('data-game-code');

  console.log(gameroom);

  // Sends object, which is catch in socketing.js socket.on('gameroom'..).
  socket.emit('gameroom', { gameroom });

  messageBtn.addEventListener('click', () => {
    console.log(message.value);

    console.log(gameroom);

    socket.emit('new_message', {
      gameroom,
      playername,
      message: message.value,
    });
    message.value = '';
  });

  socket.on('receive_message', (data) => {
    console.log(data);

    const listItem = document.createElement('li');
    listItem.textContent = `${data.playername}: ${data.message}`;

    listItem.classList.add('list-group-item');
    messageList.appendChild(listItem);
  });

  const info = document.querySelector('.info');

  message.addEventListener('keypress', () => {
    socket.emit('typing');
  });

  socket.on('typing', (data) => {
    info.textContent = `${data.playername} is typing...`;
    setTimeout(() => {
      info.textContent = '';
    }, 5000);
  });
})();
