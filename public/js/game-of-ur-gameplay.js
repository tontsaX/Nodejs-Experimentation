(() => {
  const gameBoard = document.querySelectorAll('#game-board td');
  const dice = document.querySelector('#dice');

  // kahdenvälisessä pelissä tarvitsee tarkistaa,
  // että toisella puolella activeTurn on false
  let activeTurn = true;
  // tila riippuu activeTurn tilasta
  //   let hasThrownDices = false;
  let gamePieceLastParent = {};

  const player = document.querySelector('h1');
  let playerBooth = {};
  let playerGamePieceClass = '';

  let enemyBooth = {};
  let enemyGamePieceClass = '';

  let gamePieces = {};
  let selectedGamePiece = {};

  let gameRoad = [];

  /** Set Up The Game */

  const initializeGameRoad = (playerName) => {
    let gamePanels = 4;
    let gameStartIndex = 4;
    let gameEndIndex = 8;

    if (playerName === 'Akkad') {
      gameStartIndex += 20;
      gameEndIndex += 20;
    }

    gameRoad[0] = 0;

    /** Fill in starting panels from the first or third row of the board. */
    for (let i = 1; i <= gamePanels; i += 1) {
      gameRoad[i] = gameBoard.item(gameStartIndex).id;
      gameStartIndex -= 1;
    }

    /** Fill in the middle panels from the second row of the board. */
    gamePanels += 8;

    for (let i = gameRoad.length; i <= gamePanels; i += 1) {
      gameRoad[i] = gameBoard.item(i + 6).id;
    }

    /** Fill in the end panels from the first or third row of the board. */
    gamePanels += 3;

    for (let i = gameRoad.length; i <= gamePanels; i += 1) {
      gameRoad[i] = gameBoard.item(gameEndIndex).id;
      gameEndIndex -= 1;
    }

    return gameRoad;
  };

  /** Determine playable player. */
  switch (player.innerText) {
    case 'Uruk':
      gamePieces = document.querySelectorAll('#red-pieces li img');
      playerGamePieceClass = 'game-piece red';
      enemyGamePieceClass = 'game-piece black';

      playerBooth = document.querySelector('#red-booth');
      enemyBooth = document.querySelector('#black-booth');

      gameRoad = initializeGameRoad('Uruk');
      break;
    case 'Akkad':
      gamePieces = document.querySelectorAll('#black-pieces li img');
      playerGamePieceClass = 'game-piece black';
      enemyGamePieceClass = 'game-piece red';

      playerBooth = document.querySelector('#black-booth');
      enemyBooth = document.querySelector('#red-booth');

      gameRoad = initializeGameRoad('Akkad');
      break;
    default:
  }

  const highlightGamePiece = (gamePieceToHighlight) => {
    gamePieces.forEach((gamePiece) => {
      const gamePieceRef = gamePiece;
      gamePieceRef.style.backgroundColor = '';
    });

    gameBoard.forEach((gamePanel) => {
      const gamePanelRef = gamePanel;
      gamePanelRef.style.backgroundColor = '';
    });

    /** Game board panels have <img>-elements on them.
     *  Setting gamePiece-element's' background color
     *	hides a game board panel's picture from view.
     */
    const thlGamePieceRef = gamePieceToHighlight;

    if (thlGamePieceRef.parentElement.nodeName === 'TD') {
      thlGamePieceRef.parentElement.style.backgroundColor = 'powderblue';
    } else {
      thlGamePieceRef.style.backgroundColor = 'powderblue';
    }
  };

  /** The parameter gamePiece is the <img>-element inside player booth <ul> <li> element. */
  const highlightDestination = (movingGamePiece) => {
    const diceValue = parseInt(
      document.getElementById('dice-value').innerText,
      10
    );

    let destinationPanel = {};

    const isGamePieceInBooth = (gamePiece) =>
      gamePiece.parentElement.className === 'game-pieces';

    const isDestinationHaven = () =>
      destinationPanel.className.includes('haven');

    const isHavenOccupied = () =>
      destinationPanel.lastElementChild.className.includes('game-piece');

    if (diceValue !== 0) {
      let destinationId = 0;
      const movingGamePieceParent = movingGamePiece.parentElement;

      if (isGamePieceInBooth(movingGamePieceParent)) {
        destinationId = gameRoad[diceValue];
      } else {
        const gamePieceLocation = movingGamePieceParent.id;
        const gameRoadLocation = gameRoad.indexOf(gamePieceLocation);
        destinationId = gameRoad[gameRoadLocation + diceValue];
      }

      destinationPanel = document.getElementById(destinationId);

      if (isDestinationHaven() && isHavenOccupied()) {
        const gameRoadLocation = gameRoad.indexOf(destinationId) + 1;
        destinationId = gameRoad[gameRoadLocation];
        destinationPanel = document.getElementById(destinationId);
      }

      /** Check if the destination panel has own game piece on it. */
      if (
        destinationPanel.lastElementChild.className !== playerGamePieceClass
      ) {
        destinationPanel.style.backgroundColor = 'powderblue';
      }
    }
  };

  const addGamePieceListener = (gamePiece) => {
    gamePiece.addEventListener('click', () => {
      highlightGamePiece(gamePiece);
      highlightDestination(gamePiece);
      selectedGamePiece = gamePiece;

      gamePieceLastParent = gamePiece.parentElement;
    });
  };

  gamePieces.forEach((gamePiece) => addGamePieceListener(gamePiece));

  const eatEnemyGamePiece = (enemyGamePiece) => {
    const enemyGamePieceElement = document.createElement('li');
    const enemyNoElement = enemyBooth.querySelector('.pieces-in-booth');
    let enemyNo = parseInt(enemyNoElement.innerText, 10);

    enemyNo += 1;
    enemyNoElement.innerText = enemyNo;
    enemyGamePiece.removeAttribute('class');

    enemyGamePieceElement.appendChild(enemyGamePiece);
    enemyBooth.querySelector('.game-pieces').appendChild(enemyGamePieceElement);
  };

  const putGamePieceOnGamePanel = (gamePanelToPutPieceOn) => {
    const cloneGamePiece = selectedGamePiece.cloneNode();
    selectedGamePiece.remove();

    cloneGamePiece.className = playerGamePieceClass;
    cloneGamePiece.style.backgroundColor = '';
    addGamePieceListener(cloneGamePiece);

    gamePanelToPutPieceOn.appendChild(cloneGamePiece);
    gameBoard.forEach((gamePanel) => {
      //   let gamePanelBackgroundColor = gamePanel.style.backgroundColor;
      //   gamePanelBackgroundColor = '';
      //   return gamePanelBackgroundColor;
      const gamePanelRef = gamePanel;
      gamePanelRef.style.backgroundColor = '';
      // gamePanel.style.backgroundColor = '';
    });

    // SOCKET STUFF=====================================================================================0
    // FILL THE INFORMATION SHARE OBJECT
  };

  /** Game dices are tetrahedron shaped and each of them have two corners
   *  painted white to represent movement points. */
  const throwDices = () => {
    const numberOfDices = 4;
    let diceValue = 0;
    for (let i = 1; i <= numberOfDices; i += 1) {
      diceValue += Math.floor(Math.random() * 2);
    }
    return diceValue;
  };

  const diceBtn = dice.querySelector('#dice-btn');
  diceBtn.onclick = () => {
    // if (!hasThrownDices) {
    dice.querySelector('#dice-value').innerText = throwDices();
    diceBtn.style.backgroundColor = 'grey';
    //			hasThrownDices = true;
    // }
  };

  const addGamePanelListener = (gamePanel) => {
    gamePanel.addEventListener('click', () => {
      if (gamePanel.style.backgroundColor === 'powderblue') {
        /** Check if the game panel has other game pieces on it. */
        switch (gamePanel.lastElementChild.className) {
          case enemyGamePieceClass:
            eatEnemyGamePiece(gamePanel.lastElementChild);
            putGamePieceOnGamePanel(gamePanel);
            break;
          case playerGamePieceClass:
            /** Room for something lovely. */
            break;
          default:
            putGamePieceOnGamePanel(gamePanel);
        }

        /** If gamePanel has a rosette, let the player throw dices again. */
        if (gamePanel.className.includes('rosette')) {
          diceBtn.style.backgroundColor = 'green';
          // hasThrownDices = false;
        } else if (gamePanel.className.includes('home')) {
          /** If game panel is home, increase the home number and remove the game piece at home. */
          let piecesAtHome = parseInt(
            playerBooth.querySelector('.pieces-at-home').innerText,
            10
          );
          piecesAtHome += 1;
          playerBooth.querySelector('.pieces-at-home').innerText = piecesAtHome;

          gamePanel.lastElementChild.remove();
        }

        /** If game piece last parent was player booth, decrease booth number. */
        if (gamePieceLastParent.parentElement.className === 'game-pieces') {
          let piecesInBooth = parseInt(
            playerBooth.querySelector('.pieces-in-booth').innerText,
            10
          );
          piecesInBooth -= 1;
          playerBooth.querySelector('.pieces-in-booth').innerText =
            piecesInBooth;
        }
      }
    });
  };

  gameBoard.forEach((gamePanel) => addGamePanelListener(gamePanel));

  const endTurn = () => {
    dice.querySelector('#dice-value').innerText = 0;
    activeTurn = false;

    // SOCKET STUFF===========================================================================================
    // SEND activeTurn SIGNAL TO THE OTHER PLAYER
    console.log('send activeTurn state to the other player', activeTurn);
  };

  const createEndTurnBtn = () => {
    const endTurnBtn = document.createElement('button');
    endTurnBtn.innerHTML = 'End turn';
    endTurnBtn.type = 'button';
    endTurnBtn.onclick = () => {
      endTurn();
    };
    return endTurnBtn;
  };

  playerBooth.querySelector('.end-turn-btn').appendChild(createEndTurnBtn());
})();
