const cvs = document.getElementById("jeu");
const ctx = cvs.getContext("2d");

// GAME VARIABLES AND CONSTANTS
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 30;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 9;
let LIFE = 3;
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 3;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

/*---------------------------------------PADDLE---------------------------------------*/

const paddle = {
  x: cvs.width / 2 - PADDLE_WIDTH / 2,
  y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dx: 5,
};

// DRAW BALL
function drawPaddle() {
  ctx.fillStyle = "darkcyan";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

/*---------------------------------------BRICKS---------------------------------------*/

const brick = {
  brickNbRow: 2,
  brickNbColumn: 7,
  width: 75,
  height: 15,
  brickPaddingLeft: 15,
  brickPaddingTop: 20,
  brickMarginTop: 50,
  fillColor: "#837474ca",
};

let bricks = [];

// CREATE THE BRICKS
function createBricks() {
  for (let r = 0; r < brick.brickNbRow; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.brickNbColumn; c++) {
      bricks[r][c] = {
        x: c * (brick.brickPaddingLeft + brick.width) + brick.brickPaddingLeft,
        y:
          r * (brick.brickPaddingTop + brick.height) +
          brick.brickPaddingTop +
          brick.brickMarginTop,
        status: true,
      };
    }
  }
}

createBricks();

// DRAW THE BRICKS
function drawBricks() {
  for (let r = 0; r < brick.brickNbRow; r++) {
    for (let c = 0; c < brick.brickNbColumn; c++) {
      let b = bricks[r][c];
      // if the brick isn't broken
      if (b.status) {
        ctx.fillStyle = brick.fillColor;
        ctx.fillRect(b.x, b.y, brick.width, brick.height);

        ctx.strokeStyle = brick.strokeColor;
        ctx.strokeRect(b.x, b.y, brick.width, brick.height);
      }
    }
  }
}

/*---------------------------------------BALL---------------------------------------*/

const ball = {
  x: cvs.width / 2,
  y: paddle.y - BALL_RADIUS,
  radius: BALL_RADIUS,
  speed: 4,
  dx: 3 * (Math.random() * 2 - 1),
  dy: -3,
};

// DRAW THE BALL
function drawBall() {
  ctx.beginPath();

  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcd05";
  ctx.fill();

  ctx.strokeStyle = "#2e3548";
  ctx.stroke();

  ctx.closePath();
}

/*---------------------------------------FONCTIONALITE---------------------------------------*/

/*------------------Move Paddle------------------*/

// Control the paddle
document.addEventListener("keydown", function (event) {
  if (event.keyCode == 37) {
    leftArrow = true;
  } else if (event.keyCode == 39) {
    rightArrow = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.keyCode == 37) {
    leftArrow = false;
  } else if (event.keyCode == 39) {
    rightArrow = false;
  }
});

// MOVE PADDLE
function movePaddle() {
  if (rightArrow && paddle.x + paddle.width < cvs.width) {
    paddle.x += paddle.dx;
  } else if (leftArrow && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

/*------------------Move Ball------------------*/

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

/*------------------Ball and Wall Collision------------------*/

function ballWallCollision() {
  if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  if (ball.y + ball.radius > cvs.height) {
    LIFE--; // Lose life
    resetBall();
  }
}

// RESET THE BALL
function resetBall() {
  ball.x = cvs.width / 2;
  ball.y = paddle.y - BALL_RADIUS;
  ball.dx = 3 * (Math.random() * 2 - 1);
  ball.dy = -3;
  paddle.x = cvs.width / 2 - PADDLE_WIDTH / 2;
  paddle.y = cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT;
}

/*------------------Ball and Bricks Collision------------------*/

function ballBrickCollision() {
  for (let r = 0; r < brick.brickNbRow; r++) {
    for (let c = 0; c < brick.brickNbColumn; c++) {
      let b = bricks[r][c];
      // if the brick isn't broken
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          ball.dy = -ball.dy;
          b.status = false; // the brick is broken
          SCORE += SCORE_UNIT;
        }
      }
    }
  }
}

/*------------------Ball and paddle Collision------------------*/

function ballPaddleCollision() {
  if (
    ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    paddle.y < paddle.y + paddle.height &&
    ball.y > paddle.y
  ) {
    // Check where the ball hit the paddle
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);

    // Normalize the values
    collidePoint = collidePoint / (paddle.width / 2);

    // Calculate the angle of the ball
    let angle = (collidePoint * Math.PI) / 3;

    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }
}

/*---------------------------------------PAUSE---------------------------------------*/

// Initialize game state
let isPaused = false;

// Listen for "esc" key press
document.addEventListener("keyup", function (event) {
  if (event.keyCode === 27) { // If "esc" key is pressed
    if (!isPaused) { // Pause the game if it is not already paused
      pauseGame();
    } 
  }
});

// SELECT ELEMENTS
const pause = document.getElementById("pause");
const pause1 = document.getElementById("pause1");
const restart = document.getElementById("restart");
const resume = document.getElementById("resume");

// SHOW PAUSE MENU
function showPause() {
  pause.style.display = "block";
  pause1.style.display = "block";
  restart.style.display = "block";
  resume.style.display = "block";
}

// HIDE PAUSE MENU
function hidePause() {
  pause.style.display = "none";
  pause1.style.display = "none";
  restart.style.display = "none";
  resume.style.display = "none";
}

// PAUSE THE GAME
function pauseGame() {
  isPaused = true; // Set game state to paused
  showPause(); // Show pause menu
}

// RESUME THE the game
function resumeGame() {
  isPaused = false; // Set game state to not paused
  hidePause(); // Hide pause menu
}

// CLICK ON RESTART BUTTON
restart.addEventListener("click", function () {
  location.reload(); // reload the page
});

// CLICK ON RESUME BUTTON
resume.addEventListener("click", function () {
  resumeGame(); // Resume the game
});

/*---------------------------------------MESSAGE---------------------------------------*/

// Select elements
const message = document.getElementById("message"); 
const credits = document.getElementById("credits"); 

// Waiting for space key press
document.addEventListener("keydown", function(event) {
  // Show the message
  showMessage(); 
  if (event.keyCode === 32) {    
    // Hide the message
    hideMessage();
    // Start the game
    main();
  }
});

// FUNCTION FOR SHOW MESSAGE
 function showMessage() {
  message.style.display = "block";
  credits.style.display = "block"
} 

// FUNCTION FOR HIDE MESSAGE
 function hideMessage() {
  message.style.display = "none";
  credits.style.display = "none"
} 

/*---------------------------------------GAME OVER---------------------------------------*/

// GAME OVER
function gameOver() {
  if (LIFE <= 0) {
    showYouLose();
    GAME_OVER = true;
  }
}

/*-----SHOW GAME OVER MESSAGE-----*/

// Select elements
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("won");
const youlose = document.getElementById("lose");
const restart1 = document.getElementById("restart1");

// Click on play again button
restart1.addEventListener("click", function () {
  location.reload(); // reload the page
});

// SHOW YOU WIN
function showYouWin() {
  gameover.style.display = "block";
  youwin.style.display = "block";
}

// SHOW YOU LOSE
function showYouLose() {
  gameover.style.display = "block";
  youlose.style.display = "block";
}

/*---------------------------------------LEVELS---------------------------------------*/

// LEVEL UP
function levelUp() {
  let isLevelDone = true;

  // check if all the bricks are broken
  for (let r = 0; r < brick.brickNbRow; r++) {
    for (let c = 0; c < brick.brickNbColumn; c++) {
      isLevelDone = isLevelDone && !bricks[r][c].status;
    }
  }

  if (isLevelDone) {
    if (LEVEL >= MAX_LEVEL) {
      showYouWin();
      GAME_OVER = true;
      return;
    }
    brick.brickNbRow++;
    brick.brickNbRow++;
    createBricks();
    ball.speed += 1;
    resetBall();
    LEVEL++;
  }
}

/*---------------------------------------GAME---------------------------------------*/

// DRAW FUNCTION
function draw() {
  drawBall();

  drawBricks();

  drawPaddle();

  ctx.fillStyle = "#0095DD";
  ctx.font = "16px Arial";
  // Show score
  ctx.fillText("Score: " + SCORE, 250, 20);
  // Show lives
  ctx.fillText("Life: " + LIFE, 400, 20);
  // Show level
  ctx.fillText("Levels: " + LEVEL, 550, 20);
}

// UPDATE GAME FUNCTION
function update() {
  movePaddle();

  moveBall();

  ballWallCollision();

  ballPaddleCollision();

  ballBrickCollision();

  gameOver();

  levelUp();
}

// GAME MAIN
function main() {
  // Clear the canvas
  ctx.drawImage(BG_IMG, 0, 0);

  draw();

  update();

  if (!GAME_OVER) {
    requestAnimationFrame(main);
  }
}
