const canvas = document.getElementById("canvas-game");
const ctx = canvas.getContext("2d");

const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0,
  speed: 0,
  rotationSpeed: 5,
  // rocket firing indicator
  isFiring: false,
};

const asteroids = [];
const rockets = [];
let score = 0;
let lives = 3;
// points needed for an extra life
const pointsForExtraLife = 50;

let playerName = "";
let highScores = [];

const LOCAL_STORAGE_KEY = "highScores";

const scoresList = document.getElementById("scores-list");

function displayHighScores() {
  scoresList.innerHTML = "";

  // retrieve scores and player name from local storage
  const savedScores = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedScores) {
    const savedData = JSON.parse(savedScores);
    highScores = savedData.scores;
    playerName = savedData.playerName;
  }

  // sort scores in descending order
  highScores.sort((a, b) => b.score - a.score);

  // display scores in the HTML element
  if (highScores.length > 0) {
    scoresList.innerHTML = highScores
      .map(
        (entry, index) => `<li>${index + 1}. ${entry.name}: ${entry.score}</li>`
      )
      .join("");
  } else {
    scoresList.innerHTML = "<li>No scores yet.</li>";
  }
}

function saveHighScores() {
  // check if the player already exists in the scores array
  const existingPlayerIndex = highScores.findIndex(
    (entry) => entry.name === playerName
  );

  if (existingPlayerIndex !== -1) {
    // if the player exists, update the score only if the new score is higher
    if (score > highScores[existingPlayerIndex].score) {
      highScores[existingPlayerIndex].score = score;
    }
  } else {
    // if the player does not exist, add them to the array
    const newPlayer = { name: playerName, score };
    highScores.push(newPlayer);
  }

  // sort scores in descending order
  highScores.sort((a, b) => b.score - a.score);

  if (highScores.length > 5) {
    // keep only the top 5 scores
    highScores.length = 5;
  }

  // save scores and player name to local storage
  const savedData = { playerName, scores: highScores };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedData));

  displayHighScores();
}

function drawShip() {
  const { x, y, angle } = ship;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Math.PI / 180) * angle);

  // draw ship outline
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(10, 10);
  ctx.lineTo(-10, 10);
  ctx.closePath();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawAsteroids() {
  for (const asteroid of asteroids) {
    const { x, y, value } = asteroid;
    ctx.beginPath();
    // position x, position y, radius, fill, circle shape
    ctx.arc(x, y, 10 + value * 10, 0, Math.PI * 2);

    // random colors for asteroids (shades of red)
    ctx.fillStyle = `rgb(${255 - value * 50}, 0, 0)`;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    // value in the middle of the asteroid
    ctx.fillText(value, x - 5, y + 6);
  }
}

function generateAsteroid() {
  // generate asteroid value (1-4)
  const asteroidValue = Math.floor(Math.random() * 4) + 1;
  // initial position of the asteroid
  const asteroidX = Math.random() * canvas.width;

  // distribute asteroids from top and bottom of the screen
  // asteroid size (radius) <==> (10 + asteroidValue * 10)
  let asteroidY = 0;
  // 50% chance to come from the top or bottom
  if (Math.random() < 0.5) {
    // coming from the top
    asteroidY = 0 - (10 + asteroidValue * 10);
  } else {
    // coming from the bottom
    asteroidY = canvas.height + (10 + asteroidValue * 10);
  }

  // asteroid speed
  const asteroidSpeed = Math.random() * 3 + 1;

  asteroids.push({
    initialX: asteroidX,
    initialY: asteroidY,
    x: asteroidX,
    y: asteroidY,
    value: asteroidValue,
    speed: asteroidSpeed,
    isCollision: false,
  });
}

function updateAsteroids() {
  // 4% chance to appear for enough time between appearances
  if (Math.random() < 0.004) {
    generateAsteroid();
  }

  // depending on the initial position of the asteroid, we will move it on the screen
  asteroids.forEach((asteroid, index) => {
    // update position
    if (asteroid.initialY < 0) {
      // (top to bottom)
      asteroid.y += asteroid.speed;
    }
    if (asteroid.initialY > 0) {
      // (bottom to top)
      asteroid.y -= asteroid.speed;
    }
    if (asteroid.initialX < 200) {
      // (left to right)
      asteroid.x += asteroid.speed;
    }
    if (asteroid.initialX > 600) {
      // (right to left)
      asteroid.x -= asteroid.speed;
    }

    // remove asteroids that have gone off-screen
    if (
      asteroid.x < -10 - asteroid.value * 10 ||
      asteroid.x > canvas.width + (10 + asteroid.value * 10) ||
      asteroid.y < -10 - asteroid.value * 10 ||
      asteroid.y > canvas.height + (10 + asteroid.value * 10)
    ) {
      asteroids.splice(index, 1);
    }
  });
}

function drawRockets() {
  for (const rocket of rockets) {
    const { x, y } = rocket;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

function checkCollisions() {
  // check collision between asteroids
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = i + 1; j < asteroids.length; j++) {
      const asteroid1 = asteroids[i];
      const asteroid2 = asteroids[j];

      const distanceSquared =
        (asteroid1.x - asteroid2.x) ** 2 + (asteroid1.y - asteroid2.y) ** 2;
      const sumOfRadii = 10 + asteroid1.value * 10 + 10 + asteroid2.value * 10;
      const sumOfRadiiSquared = sumOfRadii ** 2;

      // compare with sum of radii squared to avoid square root
      if (distanceSquared <= sumOfRadiiSquared) {
        // change direction on collision
        asteroid1.initialX = -asteroid1.initialX;
        asteroid1.initialY = -asteroid1.initialY;
        asteroid2.initialX = -asteroid2.initialX;
        asteroid2.initialY = -asteroid2.initialY;

        // avoid overlap
        const overlap = sumOfRadii - Math.sqrt(distanceSquared);
        // overlap angle
        const angle = Math.atan2(
          asteroid1.y - asteroid2.y,
          asteroid1.x - asteroid2.x
        );
        const displacementX = (overlap / 2) * Math.cos(angle);
        const displacementY = (overlap / 2) * Math.sin(angle);

        // adjust positions of asteroids to prevent overlap
        asteroid1.x += displacementX;
        asteroid1.y += displacementY;
        asteroid2.x -= displacementX;
        asteroid2.y -= displacementY;
      }
    }
  }

  // check collision between asteroid and ship
  for (const asteroid of asteroids) {
    if (!asteroid.isCollision) {
      const distance = Math.sqrt(
        (ship.x - asteroid.x) ** 2 + (ship.y - asteroid.y) ** 2
      );
      // distance should be less than the circle radius and triangle size
      if (distance < 20 + asteroid.value * 10) {
        lives--;
        asteroid.isCollision = true;
        if (lives === 0) {
          // save score to storage
          saveHighScores();
          // reset score and lives
          lives = 3;
          score = 0;
        }
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;
      } else {
        asteroid.isCollision = false;
      }
    }
  }

  // check if the player has accumulated enough points for an extra life
  if (score >= pointsForExtraLife && lives < 3) {
    lives++;
    score -= pointsForExtraLife;
  }

  // check collision between asteroid and ship rockets
  for (let i = rockets.length - 1; i >= 0; i--) {
    const rocket = rockets[i];
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];
      const distance = Math.sqrt(
        (rocket.x - asteroid.x) ** 2 + (rocket.y - asteroid.y) ** 2
      );
      if (distance < 10 + asteroid.value * 10) {
        // remove rockets that hit asteroids
        rockets.splice(i, 1);
        // decrease asteroid value
        asteroid.value--;
        if (asteroid.value === 0) {
          // increase score when asteroid is completely destroyed
          score += 10;
          // remove destroyed asteroid
          asteroids.splice(j, 1);
        }
      }
    }
  }
}

document.addEventListener("keydown", function (event) {
  // handle pressed keys
  switch (event.key) {
    case "ArrowUp":
      // move up
      if (ship.y - 20 > 0) ship.y -= 3;
      break;
    case "ArrowDown":
      // move down
      if (ship.y + 12 < canvas.height) ship.y += 3;
      break;
    case "ArrowLeft":
      // move left
      if (ship.x - 10 > 1) ship.x -= 3;
      break;
    case "ArrowRight":
      // move right
      if (ship.x + 10 < canvas.width) ship.x += 3;
      break;
    case "z":
      // rotate left
      ship.angle -= ship.rotationSpeed;
      break;
    case "c":
      // rotate right
      ship.angle += ship.rotationSpeed;
      break;
    case "x":
      if (rockets.length < 3) {
        // calculate rocket position and add it to the rockets array
        const rocketX =
          ship.x + 15 * Math.cos((Math.PI / 180) * (ship.angle - 90));
        const rocketY =
          ship.y + 15 * Math.sin((Math.PI / 180) * (ship.angle - 90));
        rockets.push({
          x: rocketX,
          y: rocketY,
          angle: ship.angle,
        });
      }
      break;
  }
});

function updateGame() {
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // update ship position based on speed and angle
  ship.x += ship.speed * Math.cos((Math.PI / 180) * ship.angle);
  ship.y += ship.speed * Math.sin((Math.PI / 180) * ship.angle);

  drawShip();
  drawAsteroids();
  updateAsteroids();
  drawRockets();

  for (let i = rockets.length - 1; i >= 0; i--) {
    // initial angle = 0 (shoots to the right) => subtract 90 degrees
    rockets[i].x += 5 * Math.cos((Math.PI / 180) * (rockets[i].angle - 90));
    rockets[i].y += 5 * Math.sin((Math.PI / 180) * (rockets[i].angle - 90));
    // remove rockets that go off-screen
    if (
      rockets[i].x < 0 ||
      rockets[i].x > canvas.width ||
      rockets[i].y < 0 ||
      rockets[i].y > canvas.height
    ) {
      rockets.splice(i, 1);
    }
  }

  checkCollisions();

  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Lives: " + lives, 10, 40);

  // continue the animation
  requestAnimationFrame(updateGame);
}

//////////////////////TOUCHSCREEN///////////////////////////////
// for screens < 768px
// swipe on the screen => rotate ship
// button press => move and shoot
let touchStartX = null;
let touchStartY = null;

// handle touch events
function handleTouchStart(event) {
  event.preventDefault();

  const touches = event.changedTouches[0];
  touchStartX = touches.clientX;
  touchStartY = touches.clientY;
}

function handleTouchMove(event) {
  if (!touchStartX || !touchStartY) {
    return;
  }

  event.preventDefault();

  const touches = event.changedTouches[0];
  const touchEndX = touches.clientX;
  const touchEndY = touches.clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // for ship control
  const sensitivity = 5;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > sensitivity) {
      // rotate right
      ship.angle += ship.rotationSpeed;
    } else if (deltaX < -sensitivity) {
      // rotate left
      ship.angle -= ship.rotationSpeed;
    }
  } else {
    // rotate up or down depending on the initial angle
    if (ship.angle > 0) {
      if (deltaY > sensitivity) {
        ship.angle += ship.rotationSpeed;
      } else if (deltaY < -sensitivity) {
        ship.angle -= ship.rotationSpeed;
      }
    } else {
      if (deltaY > sensitivity) {
        ship.angle -= ship.rotationSpeed;
      } else if (deltaY < -sensitivity) {
        ship.angle += ship.rotationSpeed;
      }
    }
  }

  // update initial touch coordinates for the next move
  touchStartX = touchEndX;
  touchStartY = touchEndY;
}

function handleTouchEnd(event) {
  touchStartX = null;
  touchStartY = null;
}

canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

const upButton = document.getElementById("button-up");
const downButton = document.getElementById("button-down");
const leftButton = document.getElementById("button-left");
const rightButton = document.getElementById("button-right");
const fireButton = document.getElementById("fire-button");

let moveInterval = null;

function handleUpButtonTouchStart() {
  moveInterval = setInterval(() => {
    if (ship.y - 20 > 0) ship.y -= 5;
  }, 100);
}

function handleDownButtonTouchStart() {
  moveInterval = setInterval(() => {
    if (ship.y + 12 < canvas.height) ship.y += 5;
  }, 100);
}

function handleLeftButtonTouchStart() {
  moveInterval = setInterval(() => {
    if (ship.x - 10 > 1) ship.x -= 5;
  }, 100);
}

function handleRightButtonTouchStart() {
  moveInterval = setInterval(() => {
    if (ship.x + 10 < canvas.width) ship.x += 5;
  }, 100);
}

function handleFireButton() {
  if (rockets.length < 3) {
    const rocketX = ship.x + 15 * Math.cos((Math.PI / 180) * (ship.angle - 90));
    const rocketY = ship.y + 15 * Math.sin((Math.PI / 180) * (ship.angle - 90));
    rockets.push({
      x: rocketX,
      y: rocketY,
      angle: ship.angle,
    });
  }
}

function handleButtonTouchEnd() {
  clearInterval(moveInterval);
}

upButton.addEventListener("touchstart", handleUpButtonTouchStart);
downButton.addEventListener("touchstart", handleDownButtonTouchStart);
leftButton.addEventListener("touchstart", handleLeftButtonTouchStart);
rightButton.addEventListener("touchstart", handleRightButtonTouchStart);
fireButton.addEventListener("touchstart", handleFireButton);

upButton.addEventListener("touchend", handleButtonTouchEnd);
downButton.addEventListener("touchend", handleButtonTouchEnd);
leftButton.addEventListener("touchend", handleButtonTouchEnd);
rightButton.addEventListener("touchend", handleButtonTouchEnd);

//////////////////////////////////////////////////////////////////

displayHighScores();

// request player's name at the beginning of the game (on refresh)
playerName = prompt("Enter player name:");

updateGame();
