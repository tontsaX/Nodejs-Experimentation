const express = require('express');

const socketio = require('socket.io');

const bcrypt = require('bcrypt');

const { server } = require('../config/server');

const io = socketio(server);

const router = express.Router();

const { GameOfUr } = require('../db/models');

const logoutActions = async (req) => {
  let logoutMessage = '';

  try {
    const gamecode = req.user.passCode;
    const game = await GameOfUr.findOne({ where: { passCode: gamecode } });

    // This null check is to resolve double logout call asap.
    if (game === null) {
      logoutMessage = 'Game was not found. Logout ready.';
      return;
    }

    game.players -= 1;

    if (game.players <= 0) {
      await game.destroy();
    } else {
      await game.save();
    }

    logoutMessage = 'Logout ready.';
  } catch (err) {
    console.log('Player reduction failed.');
    console.log(err);
  } finally {
    console.log(logoutMessage);
  }
};

// need to have a way to check player name.
// now it changes when page is refreshed
const generatePlayername = (playerCount) => {
  switch (playerCount) {
    case 1:
      return 'Uruk';
    case 2:
      return 'Akkad';
    default:
      return '';
  }
};

// GAMEPLAY SOCKET HANDLING

const createSocketConnection = (playername) => {
  io.once('connection', (socket) => {
    let gameroom = '';

    socket.on('gameroom', (data) => {
      socket.join(data.gameroom);
      gameroom = data.gameroom;
    });

    socket.on('new_message', (data) => {
      console.log('new message');
      io.to(gameroom).emit('receive_message', {
        message: data.message,
        playername: data.playername,
      });
    });

    socket.on('typing', () => {
      /** "When we use broadcast, every user except the one who is typing the message
       *  receives the typing event from the server."
       */
      socket.to(gameroom).broadcast.emit('typing', { playername });
    });
  });
};

router.get('/', (req, res) => {
  res.render('create-game-of-ur');
});

router.get('/logout', async (req, res) => {
  logoutActions(req, res);

  req.logout();
  res.redirect('/game-of-ur');
});

// there is no way yet in this app to check if a player refreshes their page
// resfresh redirects the player to be the second player or out of the site
router.get('/:gamecode', async (req, res) => {
  const errors = [];

  try {
    const game = await GameOfUr.findOne({
      where: { passCode: req.params.gamecode },
    });

    if (game != null && game.players < 2) {
      game.players += 1;
      game.save();

      req.login(game, (err) => {
        if (err) {
          console.log(`Login error msg: ${err}`);
          res.redirect('/game-of-ur');
        }

        const playername = generatePlayername(game.players);

        createSocketConnection(generatePlayername(game.players));

        res.render('game-room', {
          game: req.user,
          playername,
        });
      });
    } else {
      errors.push({ msg: 'You need to generate a game before playing.' });
      res.redirect('/game-of-ur');
    }
  } catch (err) {
    console.log(err);
    errors.push({ msg: 'You need to generate a game before playing.' });
    res.redirect('/game-of-ur');
  }
});

// Create a game and log in the game
router.post('/create-game', async (req, res) => {
  const errors = [];
  let game;

  try {
    let newGamecode = bcrypt.hashSync('GameofUr', 2);

    // We don't want to have slashes in our gamecode (used as address to navigate to a game), because the browser would navigate to a page, that doesn't exists.
    // If the hashed string would be used as a password with an account, this would NOT be a correct procedure to handle password storing.
    // And further more, you absolutely do NOT put passwords in an address.
    if (newGamecode.includes('/')) {
      newGamecode = newGamecode.replace(/\//g, '-');
    }

    const gameExists = await GameOfUr.findOne({
      where: { passCode: newGamecode },
    });

    if (gameExists) {
      errors.push({ msg: "Couldn't generate gamecode. Please try again." });
      res.render('create-game-of-ur', { errors });
    } else {
      game = await GameOfUr.create({
        passCode: newGamecode,
        players: 0,
      });

      // The login() function is exposed on req object by passport and can be used to redirect registered user to user page. -passportjs.org
      req.login(game, (err) => {
        if (err) {
          res.render('create-game-of-ur', { gamecode: newGamecode });
        }

        const gameroom = `/game-of-ur/${game.passCode}`;

        res.redirect(gameroom);
      });
    }
  } catch (err) {
    errors.push({ msg: "Something happened. Couldn't generate gamecode." });
    console.log(err);
    res.render('create-game-of-ur', { errors });
  }
});

// Navigator.sendBeacon() in the client script is a 'POST'-request.
// Don't redirect to router.get('/logout'..). The logout with sendBeacon() won't happen then.
router.post('/logout', async (req, res) => {
  logoutActions(req, res);

  req.logout();
});

module.exports = router;
