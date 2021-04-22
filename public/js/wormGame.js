/**
 * A Canvas Worm Game
 */
var wormGame;
var scoreBoard;

function startGame() {
	scoreBoard = document.getElementById("scoreBoard");
	wormGame = new WormGame(document.getElementById("gameBoard"));
	wormGame.playSpeed = 2;
	wormGame.start();
}

function gameLoop() {
	if(wormGame.collision("borders") || wormGame.collision("worm")) {
		document.getElementById("msgBoard").innerHTML = "Game over. Refresh for new game.";
		wormGame.stop();
	} else {
		scoreBoard.innerHTML = "Score: " + wormGame.score;
		
		wormGame.checkInput();
		setTimeout(() => {wormGame.update()}, 0);
		
		wormGame.clear();
		wormGame.draw();
		
		wormGame.animReq = window.requestAnimationFrame(gameLoop); 
	}
}

function WormGame(canvas) {
	let game = this;
	game.canvas = canvas;
	game.playSpeed = 1;
	game.controls = {left: 37, up: 38, right: 39, down: 40};
	
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
		}
	};
	
	game.worm = {
		width: 15,
		height: 15,
		length: 4,
		pieces: [],
		color: "red",
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
		update: function() {
			this.x += this.speedX;
			this.y += this.speedY;
		},
		currentDirection: this.controls.right
	};
	
	game.setWormCoordinates = function() {
		game.worm.pieces[0].x = game.adjust(game.worm.x, game.worm.width);
		game.worm.pieces[0].y = game.adjust(game.worm.y, game.worm.height);
		
		if((game.worm.pieces[0].x != game.worm.pieces[0].lastX) 
			|| (game.worm.pieces[0].y != game.worm.pieces[0].lastY)) {
					
			for(i=1; i<game.worm.pieces.length; i++) {
				game.worm.pieces[i].x = game.worm.pieces[i-1].lastX;
				game.worm.pieces[i].y = game.worm.pieces[i-1].lastY;
			}
				
			game.worm.pieces[0].lastX = game.worm.pieces[0].x;
			game.worm.pieces[0].lastY = game.worm.pieces[0].y;
				
			for(i=1; i<game.worm.pieces.length; i++) {
				game.worm.pieces[i].lastX = game.worm.pieces[i].x;
				game.worm.pieces[i].lastY = game.worm.pieces[i].y;
			}	
		}
	}
	
	game.growWorm = function() {
		let lastPiece = game.worm.pieces[game.worm.pieces.length-1];
		game.worm.pieces.push(new gamePiece(lastPiece.lastX, lastPiece.lastY));
	}
	
	game.treat = new gamePiece(150,150,0,0);
	game.treat.color = "green";
	
	game.treatOnBoard = false;
	
	game.start = function() {
		// initiateWorm
		let x = game.worm.x;
		
		for(i=0; i < game.worm.length; i++) {
			game.worm.pieces.push(new gamePiece(x, game.worm.y));
			x -= game.worm.width;
		}
		
		// initiateGame
		game.context = game.canvas.getContext("2d");
		game.animReq = window.requestAnimationFrame(gameLoop);
		
		game.canvas.width = game.canvas.clientWidth;
		game.canvas.height = game.canvas.clientHeight;

		window.addEventListener('keydown', function (e) {
			game.key = e.keyCode;
	    })
	    window.addEventListener('keyup', function (e) {
			game.key = e.keyCode;
	    })
	}
	
	game.stop = function() {
		window.cancelAnimationFrame(this.animReq);
		console.log("Game stopped. Game Over.");
	}
	
	game.update = function() {
		game.setWormCoordinates();
		
		if(game.collision("treat")){
			game.growWorm();
			game.score += 1;
				
			do {
				game.treat.x = game.randomCoordinate(game.canvas.clientWidth);
				game.treat.y = game.randomCoordinate(game.canvas.clientHeight);
			} while(game.collision("worm", game.treat));
		}
	}
	
	game.draw = function() {
		// drawWorm
		game.context.fillStyle = game.worm.color;
		
		for(i=0; i<game.worm.pieces.length; i++) {
			game.context.fillRect(game.worm.pieces[i].x, game.worm.pieces[i].y, game.worm.width, game.worm.height);
		}
		
		// drawTreat
		game.context.fillStyle = game.treat.color;
		game.context.fillRect(game.treat.x, game.treat.y, game.worm.width, game.worm.height);
	}
	
	game.clear = function() {
		game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
	}
	
	game.collision = function(target, collider = game.worm.pieces[0]) {
		
		let collision = true;
		
		switch(target) {
			case "borders":
				if((game.worm.x > (game.borders.left - game.worm.width)) &&
				(game.worm.xRight < (game.borders.right + game.worm.width)) &&
				(game.worm.y > (game.borders.top - game.worm.width)) &&
				(game.worm.yBottom < (game.borders.bottom + game.worm.width))) {
					collision = false;
				}
			break;
			
			case "worm":
				for(i = 1; i < game.worm.pieces.length; i++) {
					collision = checkCollision(collider, game.worm.pieces[i]);
					if(collision) {
						break;
					}
				}
			break;
			
			case "treat":
				collision = checkCollision(collider, game.treat);
		}
		
		return collision;
		
		function checkCollision(piece, target) {
			let collision = true
			if((piece.x != target.x) || (piece.y != target.y)) {
				collision = false;
			}
			return collision;
		}
	}
	
	game.checkInput = function() {
		
		if(wormGame.key && wormGame.key == game.controls.left) {
			
			if(game.worm.currentDirection != game.controls.right) {
				game.worm.speedY = 0;
				game.worm.speedX = 0;
				game.worm.speedX -= game.playSpeed;
				game.worm.currentDirection = game.controls.left;
			}
			
		}
		
		if(wormGame.key && wormGame.key == game.controls.right) {
			
			if(game.worm.currentDirection != game.controls.left) {
				game.worm.speedY = 0;
				game.worm.speedX = 0;
				game.worm.speedX += game.playSpeed;
				game.worm.currentDirection = game.controls.right;
			}
			
		}
		
		if(wormGame.key && wormGame.key == game.controls.up) {
			
			if(game.worm.currentDirection != game.controls.down) {
				game.worm.speedX = 0;
				game.worm.speedY = 0;
				game.worm.speedY -= game.playSpeed;
				game.worm.currentDirection = game.controls.up;
			}
			
		}
		
		if(wormGame.key && wormGame.key == game.controls.down) {
			
			if(game.worm.currentDirection != game.controls.up) {
				game.worm.speedX = 0;
				game.worm.speedY = 0;
				game.worm.speedY += game.playSpeed;
				game.worm.currentDirection = game.controls.down;
			}
			
		}
		
		game.worm.update();
	}
	
	game.halfPoint = function(measurement) {
		return measurement/2;
	}
	
	game.adjust = function(coordinate, measurement) {
		let adjustment;
		let modulo = coordinate % measurement;
		let halfPoint = game.halfPoint(measurement);
		
		if(modulo <= halfPoint) {
			adjustment = coordinate - modulo;
		} else if(modulo > halfPoint) {
			adjustment = coordinate + (measurement - modulo);
		}

		return adjustment;
	}
	
	game.randomCoordinate = function(max) {
		let coordinate = Math.floor(Math.random() * (max-(game.worm.width + 1)));
		return game.adjust(coordinate, game.worm.width);
	}
	
	function gamePiece(x,y, lastX, lastY) {
		this.x = x;
		this.y = y;
		this.xRight = this.x + game.worm.width;
		this.yBottom = this.y + game.worm.height;
		this.lastX = x;
		this.lastY = y;
	}
}
