const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 450;

// Gravity constant
const gravity = 0.5;

// Game variables
let platforms = [];
let player;
let circles = [];
let yellowCircles = [];
let greenCircles = [];
let timer = 60;
let score = 0;
let gameOver = false;
let isPaused = false;
let timerInterval;
let circleSpeed = 1;
let circleSpawnRate = 2000;
let slowMode = false;

// Player class
class Player {
  constructor() {
    this.width = 37.5;
    this.height = 50;
    this.x = 100;
    this.y = canvas.height - this.height - 10;
    this.vx = 0;
    this.vy = 0;
    this.speed = 6;
    this.jumpPower = -10;
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.isJumping = false;
  }

  draw() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (gameOver || isPaused) return;

    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.vy = 0;
      this.jumpCount = 0;
      this.isJumping = false;
    }

    this.draw();
  }

  jump() {
    if (this.jumpCount < this.maxJumps) {
      this.vy = this.jumpPower;
      this.jumpCount++;
      this.isJumping = true;
    }
  }
}

// Platform class
class Platform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
// Circle class
class Circle {
  constructor(x, radius, color = 'lightblue', speed = circleSpeed) {
    this.x = x;
    this.y = canvas.height;
    this.radius = radius;
    this.speed = speed; // Independent speed for each circle
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.y -= this.speed; // Always use its own speed
    this.draw();
  }
}



// Initialize platforms
platforms.push(new Platform(300, canvas.height - 100, 200, 20));
platforms.push(new Platform(550, canvas.height - 200, 200, 20));
platforms.push(new Platform(50, canvas.height - 200, 200, 20));
platforms.push(new Platform(0, canvas.height - 20, 800, 20));


// Key handling
const keys = {
  left: false,
  right: false,
  up: false,
};

window.addEventListener('keydown', (event) => {
  if (event.key === 'p') {
    togglePause(); // Toggle pause when "P" key is pressed
  }

  if (isPaused) return; // Ignore other key presses if paused

  switch (event.key) {
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'ArrowRight':
      keys.right = true;
      break;
    case 'ArrowUp':
      if (!player.isJumping || player.jumpCount < player.maxJumps) {
        player.jump();
      }
      break;
  }
});

window.addEventListener('keyup', (event) => {
  if (isPaused) return; // Ignore key releases if paused

  switch (event.key) {
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'ArrowRight':
      keys.right = false;
      break;
  }
});

// Spawn circles
function spawnCircle() {
  const x = Math.random() * (canvas.width - 30) + 15;
  circles.push(new Circle(x, 15));
  circles = circles.filter(circle => circle.y + circle.radius > 0);
}

function spawnYellowCircle() {
  const x = Math.random() * (canvas.width - 30) + 15;
  yellowCircles.push(new Circle(x, 15, 'yellow')); // 'yellow' works now!
  yellowCircles = yellowCircles.filter(circle => circle.y + circle.radius > 0);
}

function updateGreenCircles() {
  greenCircles.forEach((circle, index) => {
    circle.update();
    if (circle.y + circle.radius < 0) {
      greenCircles.splice(index, 1); // Remove if off-screen
    }
    if (
      player.x < circle.x + circle.radius &&
      player.x + player.width > circle.x - circle.radius &&
      player.y < circle.y + circle.radius &&
      player.y + player.height > circle.y - circle.radius
    ) {
      greenCircles.splice(index, 1); // Remove on collision
      activateSlowMode(); // Slow circles down
    }
  });
}

function spawnGreenCircle() {
  const x = Math.random() * (canvas.width - 30) + 15;
  greenCircles.push(new Circle(x, 15, 'lightgreen', 0.5)); // Green circles always stay slow
}


let greenCircleSpawnInterval;

function startSpawningGreenCircles() {
  if (!greenCircleSpawnInterval) {
    greenCircleSpawnInterval = setInterval(() => {
      if (!isPaused) {
        spawnGreenCircle();
      }
    }, 30000);
  }
}

// Slow mode activation
function activateSlowMode() {
  slowMode = true;
  circleSpeed /= 2; // Slow down the global speed
  circles.forEach(circle => circle.speed /= 2); // Slow down existing blue circles
  yellowCircles.forEach(circle => circle.speed /= 2); // Slow down existing yellow circles

  setTimeout(() => {
    slowMode = false;
    circleSpeed *= 2; // Restore global speed
    circles.forEach(circle => circle.speed *= 2); // Restore blue circles' speed
    yellowCircles.forEach(circle => circle.speed *= 2); // Restore yellow circles' speed
  }, 10000);
}



let circleSpawnInterval;
let yellowCircleSpawnInterval;

function startSpawningCircles() {
  if (circleSpawnInterval) return;
  circleSpawnInterval = setInterval(() => {
    if (!isPaused) {
      spawnCircle();
    }
  }, Math.max(50, circleSpawnRate));

  if (yellowCircleSpawnInterval) return;
  yellowCircleSpawnInterval = setInterval(() => {
    if (!isPaused) {
      spawnYellowCircle();
    }
  }, 10000);
}

function updateGreenCircles() {
  greenCircles.forEach((circle, index) => {
    circle.update();
    if (circle.y + circle.radius < 0) {
      greenCircles.splice(index, 1);
    }
    if (
      player.x < circle.x + circle.radius &&
      player.x + player.width > circle.x - circle.radius &&
      player.y < circle.y + circle.radius &&
      player.y + player.height > circle.y - circle.radius
    ) {
      greenCircles.splice(index, 1);
      activateSlowMode();
    }
  });
}

// Start spawning green circles
startSpawningGreenCircles();




// Countdown timer function
function startTimer() {
  if (timerInterval) clearInterval(timerInterval); // Clear any existing timer interval
  timerInterval = setInterval(() => {
    if (timer > 0 && !gameOver && !isPaused) {
      timer--;
      circleSpeed += 0.05; // Increase speed more rapidly
      circleSpawnRate = Math.max(50, circleSpawnRate - 25); // Faster spawns too
    } else {
      if (timer <= 0) {
        gameOver = true;
        clearInterval(timerInterval);
      }
    }
  }, 1000);
}


// Toggle pause function
function togglePause() {
  isPaused = !isPaused;
  console.log(`Game is ${isPaused ? 'paused' : 'resumed'}`);

  if (!isPaused) {
    startTimer();
    startSpawningCircles();
    startSpawningGreenCircles();
  } else {
    clearInterval(timerInterval);
    clearInterval(circleSpawnInterval);
    clearInterval(yellowCircleSpawnInterval);
    clearInterval(greenCircleSpawnInterval);
    circleSpawnInterval = null;
    yellowCircleSpawnInterval = null;
    greenCircleSpawnInterval = null;
  }
}


function startSpawningGreenCircles() {
  if (!greenCircleSpawnInterval) {
    greenCircleSpawnInterval = setInterval(() => {
      if (!isPaused) {
        spawnGreenCircle();
      }
    }, 30000);
  }
}

// Game update loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    displayGameOver();
    return;
  }

  if (!isPaused) {
    // Update player movement
    if (keys.left) player.vx = -player.speed;
    else if (keys.right) player.vx = player.speed;
    else player.vx = 0;
    updateGreenCircles(); // Make sure green circles are updated

    player.update();

    // Remove circles that moved off the screen
    circles.forEach((circle, index) => {
      circle.update();
      if (circle.y + circle.radius < 0) {
        circles.splice(index, 1);
      }
      if (
        player.x < circle.x + circle.radius &&
        player.x + player.width > circle.x - circle.radius &&
        player.y < circle.y + circle.radius &&
        player.y + player.height > circle.y - circle.radius
      ) {
        circles.splice(index, 1); // Remove the circle
        score += 10; // Increase score
      }
    });
    // Update and draw yellow circles
    yellowCircles.forEach((circle, index) => {
      circle.update();
      if (circle.y + circle.radius < 0) {
        yellowCircles.splice(index, 1); // Remove if off-screen
      }
      if (
        player.x < circle.x + circle.radius &&
        player.x + player.width > circle.x - circle.radius &&
        player.y < circle.y + circle.radius &&
        player.y + player.height > circle.y - circle.radius
      ) {
        yellowCircles.splice(index, 1); // Remove the circle
        timer += 20; // Add 20 seconds to the timer
      }
    });

    greenCircles.forEach((circle, index) => {
      circle.y -= 0.5; // Keep green circles slow
      circle.update();

      if (circle.y + circle.radius < 0) {
        greenCircles.splice(index, 1); // Remove if off-screen
      }

      if (
        player.x < circle.x + circle.radius &&
        player.x + player.width > circle.x - circle.radius &&
        player.y < circle.y + circle.radius &&
        player.y + player.height > circle.y - circle.radius
      ) {
        greenCircles.splice(index, 1); // Remove on collision
        activateSlowMode(); // Slow down other circles
      }
    });




    // Draw and handle platform collision
    platforms.forEach((platform) => {
      platform.draw();

      // Check for collision with platform
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height > platform.y &&
        player.y + player.height <= platform.y + platform.height &&
        player.vy > 0
      ) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.jumpCount = 0; // Reset jump count when landing
        player.isJumping = false;
      }
    });
  }

  // Draw the timer
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText(`Time: ${timer}`, 10, 30);
  ctx.fillText(`Score: ${score}`, 10, 60);


  // Draw pause message if the game is paused
  if (isPaused) {
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText('Paused', canvas.width / 2 - 100, canvas.height / 2);
  }

  requestAnimationFrame(update);
}

// Display game over screen
function displayGameOver() {
  ctx.fillStyle = 'black';
  ctx.font = '48px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 120, canvas.height / 2 + 50);
}

// Initialize game objects
player = new Player();
startTimer();
update();
startSpawningCircles();