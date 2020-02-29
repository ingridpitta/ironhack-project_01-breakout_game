let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth / 1.1;
canvas.height = window.innerHeight / 1.1;

const gameState = {
  paused: 0,
  running: 1,
  menu: 2,
  gameOver: 3,
  newLevel: 4,
  won: 5,
  init: 6
};

//Levels
const level1 = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 0, 1, 1]
];

const level2 = [
  [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const level3 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

class Ball {
  constructor(game) {
    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;
    this.game = game;
    this.size = 16;
    this.reset();
  }

  //Initial position and speed
  reset = () => {
    this.position = { x: 10, y: 400 };

    //Increase speed with levels
    if (this.game.currentLevel === 0) {
      this.speed = { x: 4, y: -2 };
    }
    if (this.game.currentLevel === 1) {
      this.speed = { x: 6, y: -3 };
    }
    if (this.game.currentLevel === 2) {
      this.speed = { x: 8, y: -4 };
    }
  };

  draw = ctx => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  };

  update = () => {
    //Updade position
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;

    //Revert speed to prevent ball to go outside the game area on X axis
    if (this.position.x + this.size > this.gameWidth || this.position.x < 0) {
      this.speed.x = -this.speed.x;
    }

    //Revert speed to prevent ball to go outside the game area on Y axis (top)
    if (this.position.y < 0) {
      this.speed.y = -this.speed.y;
    }

    //Lose life (ball is outside the game area on Y axis (bottom))
    if (this.position.y + this.size > this.gameHeight) {
      this.game.lives--;
      this.reset();
    }

    //Detect collision with paddle
    if (detectCollision(this, this.game.paddle)) {
      this.speed.y = -this.speed.y;
      this.position.y = this.game.paddle.position.y - this.size;
    }
  };
}

class Paddle {
  constructor(game) {
    this.gameWidth = game.gameWidth;
    this.width = 150;
    this.height = 20;

    this.maxSpeed = 7;
    this.speed = 0;

    this.position = {
      x: game.gameWidth / 2 - this.width / 2,
      y: game.gameHeight - this.height - 10
    };
  }

  moveLeft = () => {
    this.speed = -this.maxSpeed;
  };

  moveRight = () => {
    this.speed = this.maxSpeed;
  };

  stop = () => {
    this.speed = 0;
  };

  draw = ctx => {
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  };

  update = () => {
    this.position.x += this.speed;

    if (this.position.x < 0) this.position.x = 0;

    if (this.position.x + this.width > this.gameWidth)
      this.position.x = this.gameWidth - this.width;
  };
}

class InputHandler {
  constructor(paddle, game) {
    document.addEventListener("keydown", event => {
      switch (event.keyCode) {
        //ArrowLeft
        case 37:
          paddle.moveLeft();
          break;
        //ArrowRight
        case 39:
          paddle.moveRight();
          break;
        //Esc
        case 27:
          //Pause and unpause the game
          game.togglePause();
          break;
        //Spacebar
        case 32:
          game.start();
          break;
      }
    });

    //Stop paddle movement on keyup
    document.addEventListener("keyup", event => {
      switch (event.keyCode) {
        case 37:
          if (paddle.speed < 0) paddle.stop();
          break;

        case 39:
          if (paddle.speed > 0) paddle.stop();
          break;
      }
    });
  }
}

class Brick {
  constructor(game, position) {
    this.game = game;
    this.position = position;
    this.width = 100;
    this.height = 15;
    this.markedForDeletion = false;
  }

  update = () => {
    //Detect collision with Brick
    if (detectCollision(this.game.ball, this)) {
      this.game.ball.speed.y = -this.game.ball.speed.y;
      this.markedForDeletion = true;
      this.game.score += 10;
    }
  };

  draw = ctx => {
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  };
}

class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gameState = gameState.init;
    this.ball = new Ball(this);
    this.paddle = new Paddle(this);
    this.gameObjects = [];
    this.bricks = [];
    this.lives = 5;
    this.score = 0;
    this.levels = [level1, level2, level3];
    this.currentLevel = 0;

    //key event listener
    new InputHandler(this.paddle, this);
  }

  start = () => {
    if (
      this.gameState !== gameState.menu &&
      this.gameState !== gameState.newLevel
    ) {
      return;
    }

    this.bricks = buildLevel(this, this.levels[this.currentLevel]);
    this.ball.reset();
    this.gameObjects = [this.ball, this.paddle];
    this.gameState = gameState.running;
  };

  update = () => {
    if (this.lives === 0) this.gameState = gameState.gameOver;
    if (this.gameState === gameState.init) {
      setTimeout(() => { 
        this.gameState = gameState.menu
      },1200)
      return
    };

    if (
      this.gameState === gameState.paused ||
      this.gameState === gameState.menu ||
      this.gameState === gameState.gameOver
    )
      return;

    // Check if won else increase level
    if (this.bricks.length === 0 && this.currentLevel < this.levels.length) {
      if (this.currentLevel === this.levels.length - 1) {
        this.gameState = gameState.won;
      } else {
        this.currentLevel++;
        this.gameState = gameState.newLevel;
        this.start();
      }
    }

    //Update objetcs(ball, paddle and bricks)
    [...this.gameObjects, ...this.bricks].forEach(object => object.update());

    //Show only bricks untouched
    this.bricks = this.bricks.filter(brick => !brick.markedForDeletion);
  };

  draw = ctx => {
    //Draw objects (ball, padle and bricks)
    [...this.gameObjects, ...this.bricks].forEach(object => object.draw(ctx));

    //Show game infos on canvas screen
    //Score
    ctx.font = "30px Fugaz One";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${this.score}`, canvas.width / 28, canvas.height / 12);

    //Lives
    ctx.font = "30px Fugaz One";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(
      `LIVES: ${this.lives}`,
      canvas.width / 1.15,
      canvas.height / 12
    );

    //Current Level
    ctx.font = "30px Fugaz One";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(
      `LEVEL: ${this.currentLevel + 1}`,
      canvas.width / 2.2,
      canvas.height / 12
    );

    // Game status messages
    //Paused
    if (this.gameState === gameState.paused) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      ctx.font = "30px Fugaz One";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", this.gameWidth / 2, this.gameHeight / 2);
    }

    //Window Load
    if (this.gameState === gameState.init) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();

      ctx.font = "50px Fugaz One";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Breakout Game", this.gameWidth / 2, this.gameHeight / 2);
    }

    //Start Menu
    if (this.gameState === gameState.menu) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();

      ctx.font = "30px Fugaz One";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Press SPACEBAR to Start", this.gameWidth / 2, this.gameHeight / 2);
    }

    //Game Over
    if (this.gameState === gameState.gameOver) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();

      ctx.font = "30px Fugaz One";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        `GAME OVER! SCORE: ${this.score}`,
        this.gameWidth / 2,
        this.gameHeight / 2
      );
    }

    //Winner
    if (this.gameState === gameState.won) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      ctx.font = "30px Fugaz One";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        `YOU WON!!! SCORE: ${this.score}`,
        this.gameWidth / 2,
        this.gameHeight / 2
      );
    }
  };

  //Toggle pause state
  togglePause = () => {
    if (this.gameState === gameState.paused) {
      this.gameState = gameState.running;
    } else if (this.gameState === gameState.running) {
      this.gameState = gameState.paused;
    } else {
     return
    }
  };
}

detectCollision = (ball, gameObject) => {
  let bottomBall = ball.position.y + ball.size;
  let topBall = ball.position.y;

  let topObject = gameObject.position.y;
  let leftSideObject = gameObject.position.x;
  let rightSideObject = gameObject.position.x + gameObject.width;
  let bottomObject = gameObject.position.y + gameObject.height;

  if (
    bottomBall >= topObject &&
    topBall <= bottomObject &&
    ball.position.x >= leftSideObject &&
    ball.position.x + ball.size <= rightSideObject
  ) {
    return true;
  } else {
    return false;
  }
};

//Populate screen with bricks according to current level
buildLevel = (game, level) => {
  let bricks = [];

  level.forEach((row, rowIndex) => {
    row.forEach((brick, brickIndex) => {
      if (brick === 1) {
        let position = {
          x: canvas.width / 30 + 110 * brickIndex,
          y: 80 + 25 * rowIndex
        };
        bricks.push(new Brick(game, position));
      }
    });
  });

  return bricks;
};

//Create new game
let game = new Game(canvas.width, canvas.height);

//Start game and game update
gameUpdate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.update();
  game.draw(ctx);

  requestAnimationFrame(gameUpdate);
};
requestAnimationFrame(gameUpdate);
