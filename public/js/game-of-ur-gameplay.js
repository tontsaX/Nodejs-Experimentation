(function playTheRoyalGameOfUr() {
	const gameBoard = document.querySelectorAll("#game-board td");
	const dice = document.querySelector("#dice");

	// kahdenvölisessä pelissä tarvitsee tarkistaa, 
	// että toisella puolella activeTurn on false
	var activeTurn = true;
	// tila riippuu activeTurn tilasta
	var hasThrownDices = false;
	var gamePieceLastParent = {};

	let player = document.querySelector("h1");
	let playerBooth = {};
	let playerGamePieceClass = "";

	let enemyBooth = {};
	let enemyGamePieceClass = "";

	let gamePieces = {};
	let selectedGamePiece = {};

	let gameRoad = [];

	/** Set Up The Game */

	/** Determine playable player. */
	switch (player.innerText) {
		case "Uruk":
			gamePieces = document.querySelectorAll("#red-pieces li img");
			playerGamePieceClass = "game-piece red";
			enemyGamePieceClass = "game-piece black";

			playerBooth = document.querySelector("#red-booth");
			enemyBooth = document.querySelector("#black-booth");

			gameRoad = initializeGameRoad("Uruk");
			break;
		case "Akkad":
			gamePieces = document.querySelectorAll("#black-pieces li img");
			playerGamePieceClass = "game-piece black";
			enemyGamePieceClass = "game-piece red";

			playerBooth = document.querySelector("#black-booth");
			enemyBooth = document.querySelector("#red-booth");

			gameRoad = initializeGameRoad("Akkad");
	}

	gamePieces.forEach(gamePiece => addGamePieceListener(gamePiece));
	gameBoard.forEach(gamePanel => addGamePanelListener(gamePanel));

	playerBooth.querySelector(".end-turn-btn").appendChild(createEndTurnBtn());

	let diceBtn = dice.querySelector("#dice-btn");
	diceBtn.onclick = function () {
		if (!hasThrownDices) {
			dice.querySelector("#dice-value").innerText = throwDices();
			diceBtn.style.backgroundColor = "grey";
			//			hasThrownDices = true;
		}
	};

	function initializeGameRoad(playerName) {
		let gamePanels = 4;
		let gameStartIndex = 4;
		let gameEndIndex = 8;

		if (playerName === "Akkad") {
			gameStartIndex += 20;
			gameEndIndex += 20;
		}

		gameRoad[0] = 0;

		/** Fill in starting panels from the first or third row of the board. */
		for (i = 1; i <= gamePanels; i++) {
			gameRoad[i] = gameBoard.item(gameStartIndex).id;
			gameStartIndex--;
		}

		/** Fill in the middle panels from the second row of the board. */
		gamePanels += 8;

		for (i = gameRoad.length; i <= gamePanels; i++) {
			gameRoad[i] = gameBoard.item(i + 6).id;
		}

		/** Fill in the end panels from the first or third row of the board. */
		gamePanels += 3;

		for (i = gameRoad.length; i <= gamePanels; i++) {
			gameRoad[i] = gameBoard.item(gameEndIndex).id;
			gameEndIndex--;
		}

		return gameRoad;
	}

	/** Game dices are tetrahedron shaped and each of them have two corners 
	 *  painted white to represent movement points. */
	function throwDices() {
		let numberOfDices = 4;
		let diceValue = 0;
		for (i = 1; i <= numberOfDices; i++) {
			diceValue += Math.floor(Math.random() * 2);
		}
		return diceValue;
	}

	function createEndTurnBtn() {
		let endTurnBtn = document.createElement("button");
		endTurnBtn.innerHTML = "End turn";
		endTurnBtn.type = "button";
		endTurnBtn.onclick = () => {
			endTurn();
		};
		return endTurnBtn;
	}

	function endTurn() {
		dice.querySelector("#dice-value").innerText = 0;
		activeTurn = false;

		// SOCKET STUFF===========================================================================================
		// SEND activeTurn SIGNAL TO THE OTHER PLAYER
	}

	function addGamePieceListener(gamePiece) {
		gamePiece.addEventListener('click', () => {
			highlightGamePiece(gamePiece);
			highlightDestination(gamePiece);
			selectedGamePiece = gamePiece;

			gamePieceLastParent = gamePiece.parentElement;
		});
	}

	function addGamePanelListener(gamePanel) {
		gamePanel.addEventListener('click', () => {

			if (gamePanel.style.backgroundColor === "powderblue") {

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
				if (gamePanel.className.includes("rosette")) {
					diceBtn.style.backgroundColor = "green";
					//hasThrownDices = false;
				}
				/** If game panel is home, increase the home number and remove the game piece at home. */
				else if (gamePanel.className.includes("home")) {
					let piecesAtHome = parseInt(playerBooth.querySelector(".pieces-at-home").innerText);
					piecesAtHome++;
					playerBooth.querySelector(".pieces-at-home").innerText = piecesAtHome;

					gamePanel.lastElementChild.remove();
				}

				/** If game piece last parent was player booth, decrease booth number. */
				if (gamePieceLastParent.parentElement.className === "game-pieces") {
					let piecesInBooth = parseInt(playerBooth.querySelector(".pieces-in-booth").innerText);
					piecesInBooth--;
					playerBooth.querySelector(".pieces-in-booth").innerText = piecesInBooth;
				}
			}
		});
	}

	function putGamePieceOnGamePanel(gamePanel) {
		let cloneGamePiece = selectedGamePiece.cloneNode();
		selectedGamePiece.remove();

		cloneGamePiece.className = playerGamePieceClass;
		cloneGamePiece.style.backgroundColor = "";
		addGamePieceListener(cloneGamePiece);

		gamePanel.appendChild(cloneGamePiece);
		gameBoard.forEach(gamePanel => gamePanel.style.backgroundColor = "");

		// SOCKET STUFF=====================================================================================0
		// FILL THE INFORMATION SHARE OBJECT
	}

	function highlightGamePiece(gamePiece) {
		gamePieces.forEach(gamePiece => gamePiece.style.backgroundColor = "");
		gameBoard.forEach(gamePanel => gamePanel.style.backgroundColor = "");

		/** Game board panels have <img>-elements on them. 
		 *  Setting gamePiece-element's' background color 
		 *	hides a game board panel's picture from view. 
		 */
		if (gamePiece.parentElement.nodeName === "TD") {
			gamePiece.parentElement.style.backgroundColor = "powderblue";
		}
		else {
			gamePiece.style.backgroundColor = "powderblue";
		}
	}

	/** The parameter gamePiece is the <img>-element inside player booth <ul> <li> element. */
	function highlightDestination(gamePiece) {
		let diceValue = parseInt(document.getElementById("dice-value").innerText, 10);
		let destinationPanel = {};

		if (diceValue != 0) {
			let destinationId = 0;
			let gamePieceParent = gamePiece.parentElement;

			if (_isGamePieceInBooth(gamePieceParent)) {
				destinationId = gameRoad[diceValue];
			}
			else {
				let gamePieceLocation = gamePieceParent.id;
				let gameRoadLocation = gameRoad.indexOf(gamePieceLocation);
				destinationId = gameRoad[gameRoadLocation + diceValue];
			}

			destinationPanel = document.getElementById(destinationId);

			if (_isDestinationHaven() && _isHavenOccupied()) {
				let gameRoadLocation = gameRoad.indexOf(destinationId) + 1;
				destinationId = gameRoad[gameRoadLocation];
				destinationPanel = document.getElementById(destinationId);
			}

			/** Check if the destination panel has own game piece on it. */
			if (destinationPanel.lastElementChild.className != playerGamePieceClass) {
				destinationPanel.style.backgroundColor = "powderblue";
			}
		}

		function _isGamePieceInBooth(gamePiece) {
			return gamePiece.parentElement.className === "game-pieces";
		}

		function _isDestinationHaven() {
			return destinationPanel.className.includes("haven");
		}

		function _isHavenOccupied() {
			return destinationPanel.lastElementChild.className.includes("game-piece");
		}
	}

	function eatEnemyGamePiece(enemyGamePiece) {
		let enemyNoElement = enemyBooth.querySelector(".pieces-in-booth");
		let enemyNo = parseInt(enemyNoElement.innerText);
		let enemyGamePieceElement = document.createElement("li");

		enemyNo++;
		enemyNoElement.innerText = enemyNo;
		enemyGamePiece.removeAttribute("class");

		enemyGamePieceElement.appendChild(enemyGamePiece);
		enemyBooth.querySelector(".game-pieces").appendChild(enemyGamePieceElement);
	}

})();