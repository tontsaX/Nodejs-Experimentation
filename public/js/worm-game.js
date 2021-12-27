/**
 * A Canvas Worm Game
 */
let wormGame;
let scoreBoard;

const gameLoop = () => {
  if (wormGame.collision('borders') || wormGame.collision('worm')) {
    document.getElementById('message-board').innerHTML =
      'Game over. Refresh for new game.';
    wormGame.stop();
  } else {
    // scoreBoard.innerHTML = 'Score: ' + wormGame.score;
    scoreBoard.innerHTML = `Score: ${wormGame.score}`;

    wormGame.checkInput();
    setTimeout(() => {
      wormGame.update();
    }, 0);

    wormGame.clear();
    wormGame.draw();

    wormGame.animReq = window.requestAnimationFrame(gameLoop);
  }
};

function WormGame(canvas) {
  const game = this;
  game.canvas = canvas;
  game.playSpeed = 1;
  game.controls = { left: 37, up: 38, right: 39, down: 40 };

  game.score = 0;

  game.borders = {
    width: this.canvas.clientWidth,
    height: this.canvas.clientHeight,
    left: 0,
    top: 0,
    get right() {
      return this.left + this.width;
    },
    get bottom() {
      return this.top + this.height;
    },
  };

  game.worm = {
    width: 15,
    height: 15,
    length: 4,
    pieces: [],
    color: 'red',
    x: 60,
    y: 15,
    lastX: this.x,
    lastY: this.y,
    get xRight() {
      return this.x + this.width;
    },
    get yBottom() {
      return this.y + this.height;
    },
    speedX: 0,
    speedY: 0,
    // update: function () {
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
    },
    currentDirection: this.controls.right,
  };

  // function gamePiece(x, y, lastX, lastY) {
  class GamePiece {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.xRight = this.x + game.worm.width;
      this.yBottom = this.y + game.worm.height;
      this.lastX = x;
      this.lastY = y;
    }
  }

  game.setWormCoordinates = () => {
    game.worm.pieces[0].x = game.adjust(game.worm.x, game.worm.width);
    game.worm.pieces[0].y = game.adjust(game.worm.y, game.worm.height);

    if (
      game.worm.pieces[0].x !== game.worm.pieces[0].lastX ||
      game.worm.pieces[0].y !== game.worm.pieces[0].lastY
    ) {
      for (let i = 1; i < game.worm.pieces.length; i += 1) {
        game.worm.pieces[i].x = game.worm.pieces[i - 1].lastX;
        game.worm.pieces[i].y = game.worm.pieces[i - 1].lastY;
      }

      game.worm.pieces[0].lastX = game.worm.pieces[0].x;
      game.worm.pieces[0].lastY = game.worm.pieces[0].y;

      for (let i = 1; i < game.worm.pieces.length; i += 1) {
        game.worm.pieces[i].lastX = game.worm.pieces[i].x;
        game.worm.pieces[i].lastY = game.worm.pieces[i].y;
      }
    }
  };

  game.growWorm = () => {
    const lastPiece = game.worm.pieces[game.worm.pieces.length - 1];
    game.worm.pieces.push(new GamePiece(lastPiece.lastX, lastPiece.lastY));
  };

  game.treat = new GamePiece(150, 150, 0, 0);
  game.treat.color = 'green';

  game.treatOnBoard = false;

  game.start = () => {
    // initiateWorm
    let startX = game.worm.x;

    for (let i = 0; i < game.worm.length; i += 1) {
      game.worm.pieces.push(new GamePiece(startX, game.worm.y));
      startX -= game.worm.width;
    }

    // initiateGame
    game.context = game.canvas.getContext('2d');
    game.animReq = window.requestAnimationFrame(gameLoop);

    game.canvas.width = game.canvas.clientWidth;
    game.canvas.height = game.canvas.clientHeight;

    window.addEventListener('keydown', (e) => {
      game.key = e.keyCode;
    });
    window.addEventListener('keyup', (e) => {
      game.key = e.keyCode;
    });
  };

  game.stop = () => {
    window.cancelAnimationFrame(this.animReq);
    console.log('Game stopped. Game Over.');
  };

  game.update = () => {
    game.setWormCoordinates();

    if (game.collision('treat')) {
      game.growWorm();
      game.score += 1;

      do {
        game.treat.x = game.randomCoordinate(game.canvas.clientWidth);
        game.treat.y = game.randomCoordinate(game.canvas.clientHeight);
      } while (game.collision('worm', game.treat));
    }
  };

  game.draw = () => {
    // drawWorm
    game.context.fillStyle = game.worm.color;

    for (let i = 0; i < game.worm.pieces.length; i += 1) {
      game.context.fillRect(
        game.worm.pieces[i].x,
        game.worm.pieces[i].y,
        game.worm.width,
        game.worm.height
      );
    }

    // drawTreat
    game.context.fillStyle = game.treat.color;
    game.context.fillRect(
      game.treat.x,
      game.treat.y,
      game.worm.width,
      game.worm.height
    );
  };

  game.clear = () => {
    game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
  };

  game.collision = (target, collider = game.worm.pieces[0]) => {
    const checkCollision = (piece, collisionTarget) => {
      let hasCollided = true;
      if (piece.x !== collisionTarget.x || piece.y !== collisionTarget.y) {
        hasCollided = false;
      }
      return hasCollided;
    };

    let hasCollided = true;

    switch (target) {
      case 'borders':
        if (
          game.worm.x > game.borders.left - game.worm.width &&
          game.worm.xRight < game.borders.right + game.worm.width &&
          game.worm.y > game.borders.top - game.worm.width &&
          game.worm.yBottom < game.borders.bottom + game.worm.width
        ) {
          hasCollided = false;
        }
        break;

      case 'worm':
        for (let i = 1; i < game.worm.pieces.length; i += 1) {
          hasCollided = checkCollision(collider, game.worm.pieces[i]);
          if (hasCollided) {
            break;
          }
        }
        break;

      case 'treat':
        hasCollided = checkCollision(collider, game.treat);
        break;
      default:
    }

    return hasCollided;
  };

  game.checkInput = () => {
    if (wormGame.key && wormGame.key === game.controls.left) {
      if (game.worm.currentDirection !== game.controls.right) {
        game.worm.speedY = 0;
        game.worm.speedX = 0;
        game.worm.speedX -= game.playSpeed;
        game.worm.currentDirection = game.controls.left;
      }
    }

    if (wormGame.key && wormGame.key === game.controls.right) {
      if (game.worm.currentDirection !== game.controls.left) {
        game.worm.speedY = 0;
        game.worm.speedX = 0;
        game.worm.speedX += game.playSpeed;
        game.worm.currentDirection = game.controls.right;
      }
    }

    if (wormGame.key && wormGame.key === game.controls.up) {
      if (game.worm.currentDirection !== game.controls.down) {
        game.worm.speedX = 0;
        game.worm.speedY = 0;
        game.worm.speedY -= game.playSpeed;
        game.worm.currentDirection = game.controls.up;
      }
    }

    if (wormGame.key && wormGame.key === game.controls.down) {
      if (game.worm.currentDirection !== game.controls.up) {
        game.worm.speedX = 0;
        game.worm.speedY = 0;
        game.worm.speedY += game.playSpeed;
        game.worm.currentDirection = game.controls.down;
      }
    }

    game.worm.update();
  };

  game.halfPoint = (measurement) => measurement / 2;

  game.adjust = (coordinate, measurement) => {
    const modulo = coordinate % measurement;
    const halfPoint = game.halfPoint(measurement);
    let adjustment;

    if (modulo <= halfPoint) {
      adjustment = coordinate - modulo;
    } else if (modulo > halfPoint) {
      adjustment = coordinate + (measurement - modulo);
    }

    return adjustment;
  };

  game.randomCoordinate = (max) => {
    const coordinate = Math.floor(
      Math.random() * (max - (game.worm.width + 1))
    );
    return game.adjust(coordinate, game.worm.width);
  };
}

// startGame is called in body tag after the page has completely loaded
// eslint-disable-next-line no-unused-vars
const startGame = () => {
  scoreBoard = document.getElementById('score-board');
  wormGame = new WormGame(document.getElementById('game-board'));
  wormGame.playSpeed = 2;
  wormGame.start();
};
