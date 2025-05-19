const MAX_ENEMY = 8;
const MAX_LIFE = 3;

// Base dimensions (original canvas size)
const BASE_WIDTH = 400;
const BASE_HEIGHT = 600;

let spaceShip;
let boss;
let enemies = [];
let bullets = [];
let bonus = [];
let explosions = [];
let enemyBullets = [];
let explosionAnim = [];
let bonusImg = [];
let spaceShipImg;
let bossImg = [];
let bulletImg;
let bulletEnemyImg;
let enemyImg1;
let enemyImg1b;
let enemyImg2;
let enemyImg3;
let myFont;
let state = -2; // Start with intro video
let stars = [];
let shootSound, explosionSound, bonusSound, milestoneSound;
let highScores = [];
let scaleFactor = 1;
let introVideo;
let videoLoadFailed = false;
let loadingStartFrame = 0;
let transitionAlpha = 0; // For fade effects
let clickCooldown = 0; // Prevent rapid clicks (ms)
let playerName = ""; // For high score input
let stateLock = false; // Prevent rapid state changes
let gameOverBackground; // Background for game over scene

// Start screen button
let startButton = {
  x: 125,
  y: 350,
  width: 150,
  height: 50,
  cornerRadius: 10,
  text: "Start Game",
  isHovered: false,
  normalFill: [0, 0, 100],
  hoverFill: [0, 0, 200],
  borderColor: [255, 255, 255],
  textColor: [255, 255, 255],
};

// Game over buttons
let playAgainButton = {
  x: 75,
  y: 420,
  width: 120,
  height: 50,
  cornerRadius: 10,
  text: "Play Again",
  isHovered: false,
  normalFill: [0, 0, 100],
  hoverFill: [0, 0, 200],
  borderColor: [255, 255, 255],
  textColor: [255, 255, 255],
};
let exitButton = {
  x: 205,
  y: 420,
  width: 120,
  height: 50,
  cornerRadius: 10,
  text: "Exit",
  isHovered: false,
  normalFill: [0, 0, 100],
  hoverFill: [0, 0, 200],
  borderColor: [255, 255, 255],
  textColor: [255, 255, 255],
};

function preload() {
  gameOverBackground = loadImage("assets/background.png", null, () =>
    console.error("Failed to load game over background")
  );
  spaceShipImg = loadImage("assets/spaceShip.png");
  bulletImg = loadImage("assets/bullet.png");
  bulletEnemyImg = loadImage("assets/bullet2.png");
  enemyImg1 = loadImage("assets/enemy1.png");
  enemyImg1b = loadImage("assets/enemy1b.png");
  enemyImg2 = loadImage("assets/enemy2.png");
  enemyImg3 = loadImage("assets/enemy3.png");
  myFont = loadFont("assets/8-bit-pusab.ttf");
  for (let i = 1; i < 7; i++) {
    explosionAnim.push(loadImage("assets/expl" + i + ".png"));
  }
  bonusImg[0] = loadImage("assets/bonus0.png");
  bossImg[0] = loadImage("assets/boss0.png");
  shootSound = loadSound("assets/shoot.wav");
  explosionSound = loadSound("assets/explosion.wav");
  bonusSound = loadSound("assets/bonus.wav");
  milestoneSound = loadSound("assets/milestone.wav");
  // Load high scores from localStorage
  highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  highScores.sort((a, b) => b.score - a.score);
  // Initialize video
  introVideo = document.getElementById("intro-video");
  introVideo.addEventListener("ended", videoEnded);
  introVideo.addEventListener("error", videoError);
}

function videoEnded() {
  if (state === -2) {
    changeState(-1);
  }
}

function videoError() {
  if (state === -2) {
    console.error("Video failed to load or play:", introVideo.error);
    videoLoadFailed = true;
    changeState(-1);
  }
}

function setup() {
  let windowRatio = windowWidth / windowHeight;
  let gameRatio = BASE_WIDTH / BASE_HEIGHT;
  let canvasWidth, canvasHeight;
  if (windowRatio > gameRatio) {
    canvasHeight = windowHeight;
    canvasWidth = canvasHeight * gameRatio;
  } else {
    canvasWidth = windowWidth;
    canvasHeight = canvasWidth / gameRatio;
  }
  createCanvas(canvasWidth, canvasHeight);
  scaleFactor = constrain(canvasWidth / BASE_WIDTH, 0.5, 2); // Clamp scaling
  frameRate(30);
  resetGame();
  // Start video playback
  if (introVideo) {
    introVideo.play().catch((e) => {
      if (state === -2) {
        console.error("Video playback failed:", e);
        videoLoadFailed = true;
        changeState(-1);
      }
    });
  } else {
    videoLoadFailed = true;
    changeState(-1);
  }
}

function resetGame() {
  spaceShip = new SpaceShip(MAX_LIFE);
  enemies = [];
  bullets = [];
  enemyBullets = [];
  bonus = [];
  explosions = [];
  spaceShip.score = 0;
  spaceShip.kills = 0;
  for (let i = 0; i < MAX_ENEMY; i++) {
    enemies[i] = new Enemy();
  }
  if (!stars.length) {
    for (let i = 0; i < 150; i++) {
      stars[i] = new Star(
        random(0, BASE_WIDTH),
        random(-BASE_HEIGHT, BASE_HEIGHT)
      );
    }
  }
}

function windowResized() {
  let windowRatio = windowWidth / windowHeight;
  let gameRatio = BASE_WIDTH / BASE_HEIGHT;
  let canvasWidth, canvasHeight;
  if (windowRatio > gameRatio) {
    canvasHeight = windowHeight;
    canvasWidth = canvasHeight * gameRatio;
  } else {
    canvasWidth = windowWidth;
    canvasHeight = canvasWidth / gameRatio;
  }
  resizeCanvas(canvasWidth, canvasHeight);
  scaleFactor = constrain(canvasWidth / BASE_WIDTH, 0.5, 2);
}

function changeState(newState) {
  if (stateLock) return;
  stateLock = true;
  transitionAlpha = 255;
  console.log(`State change: ${state} -> ${newState}`);
  state = newState;
  if (newState !== -2 && introVideo) {
    introVideo.pause();
    introVideo.style.display = "none";
  }
  if (newState === -1) {
    loadingStartFrame = frameCount;
  }
  if (newState === 100) {
    playerName = "";
  }
  setTimeout(() => {
    stateLock = false;
  }, 500);
}

function draw() {
  push();
  scale(scaleFactor);
  if (state == -2) {
    background(0);
    if (videoLoadFailed || !introVideo) {
      changeState(-1);
    } else {
      introVideo.style.display = "block";
      fill(0, 0, 100);
      stroke(255);
      strokeWeight(2 / scaleFactor);
      rect(300, 550 / scaleFactor, 80, 30 / scaleFactor, 5);
      noStroke();
      fill(255);
      textSize(12 / scaleFactor);
      textAlign(CENTER, CENTER);
      text("Skip", 340, 565 / scaleFactor);
    }
  } else if (state == -1) {
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(24 / scaleFactor);
    text("Loading...", BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20 / scaleFactor);
    let progress = (frameCount - loadingStartFrame) / 60;
    if (progress >= 1) {
      changeState(0);
    }
    fill(100);
    rect(50, BASE_HEIGHT / 2, BASE_WIDTH - 100, 10 / scaleFactor);
    fill(255);
    rect(50, BASE_HEIGHT / 2, (BASE_WIDTH - 100) * progress, 10 / scaleFactor);
  } else if (state == 0) {
    background(5, 0, 12);
    mouvementOfStars();
    fill(255);
    textFont(myFont);
    textSize(28 / scaleFactor);
    textStyle(BOLD);
    textAlign(CENTER);
    // Title with shadow
    fill(0, 0, 0, 100);
    text(
      "SpaceShooter",
      BASE_WIDTH / 2 + 2 / scaleFactor,
      100 / scaleFactor + 2 / scaleFactor
    );
    fill(255);
    text("SpaceShooter", BASE_WIDTH / 2, 100 / scaleFactor);
    drawLeaderboard(
      BASE_WIDTH / 2 - 100,
      150 / scaleFactor,
      200,
      120 / scaleFactor
    );
    // Start button with glow
    if (startButton.isHovered) {
      fill(255, 255, 255, 50);
      noStroke();
      rect(
        startButton.x - 5,
        startButton.y - 5,
        startButton.width + 10,
        startButton.height + 10,
        startButton.cornerRadius + 5
      );
    }
    fill(
      startButton.isHovered ? startButton.hoverFill : startButton.normalFill
    );
    stroke(startButton.borderColor);
    strokeWeight(2 / scaleFactor);
    rect(
      startButton.x,
      startButton.y,
      startButton.width,
      startButton.height,
      startButton.cornerRadius
    );
    noStroke();
    fill(startButton.textColor);
    textSize(16 / scaleFactor);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text(
      startButton.text,
      startButton.x + startButton.width / 2,
      startButton.y + startButton.height / 2
    );
    // Instructions below button with shadow
    textSize(12 / scaleFactor);
    fill(0, 0, 0, 100);
    text(
      "Arrows to move",
      BASE_WIDTH / 2 + 1 / scaleFactor,
      (startButton.y + startButton.height + 20) / scaleFactor + 1 / scaleFactor
    );
    fill(255);
    text(
      "Arrows to move",
      BASE_WIDTH / 2,
      (startButton.y + startButton.height + 20) / scaleFactor
    );
    fill(0, 0, 0, 100);
    text(
      "Space bar to fire",
      BASE_WIDTH / 2 + 1 / scaleFactor,
      (startButton.y + startButton.height + 40) / scaleFactor + 1 / scaleFactor
    );
    fill(255);
    text(
      "Space bar to fire",
      BASE_WIDTH / 2,
      (startButton.y + startButton.height + 40) / scaleFactor
    );
    fill(0, 0, 0, 100);
    text(
      "Play . Shoot . Enjoy",
      BASE_WIDTH / 2 + 1 / scaleFactor,
      (BASE_HEIGHT - 30) / scaleFactor + 1 / scaleFactor
    );
    fill(255);
    text(
      "Play . Shoot . Enjoy",
      BASE_WIDTH / 2,
      (BASE_HEIGHT - 30) / scaleFactor
    );
    startButton.isHovered =
      mouseX / scaleFactor >= startButton.x &&
      mouseX / scaleFactor <= startButton.x + startButton.width &&
      mouseY / scaleFactor >= startButton.y &&
      mouseY / scaleFactor <= startButton.y + startButton.height;
  } else if (state == 1) {
    background(5, 0, 12);
    mouvementOfStars();
    spaceShip.show();
    spaceShip.move();
    if (spaceShip.life <= 0) {
      changeState(99);
    }
    for (enemy of enemies) {
      enemy.move();
      if (enemy.fire()) {
        enemyBullets.push(new EnemyBullet(enemy.x, enemy.y, enemy.radius));
      }
      enemy.show();
    }
    if (random(1, 100) <= 2) {
      bonus.push(new Bonus());
    }
    for (let i = 0; i < bonus.length; i++) {
      bonus[i].move();
      bonus[i].show();
      if (intersectWith(bonus[i], spaceShip)) {
        bonus[i].effect(spaceShip);
        bonus[i].y = -10;
        if (bonusSound.isLoaded()) bonusSound.play();
      }
      if (bonus[i].y < 0) {
        bonus.splice(i, 1);
      }
    }
    for (let i = 0; i < explosions.length; i++) {
      if (explosions[i].z + 6 > frameCount) {
        explosion(explosions[i].x, explosions[i].y, explosions[i].z);
      } else {
        explosions.splice(i, 1);
      }
    }
    fill(255);
    textFont(myFont);
    textSize(16 / scaleFactor);
    textStyle(BOLD);
    text(spaceShip.score, 30, 30 / scaleFactor);
    text("Life : " + spaceShip.life, 300, 30 / scaleFactor);
    textStyle(NORMAL);
    for (let i = 0; i < enemies.length; i++) {
      if (intersectWith(spaceShip, enemies[i])) {
        background(255, 0, 0);
        spaceShip.life -= 1;
        enemies[i].reborn();
      }
      if (enemies[i].y > BASE_HEIGHT) {
        enemies[i].reborn();
      }
    }
    bulletMove();
    bulletEnemyMove();
  } else if (state == 99) {
    image(gameOverBackground, 0, 0, BASE_WIDTH, BASE_HEIGHT); // Draw background
    mouvementOfStars();
    fill(255);
    textFont(myFont);
    textSize(12 / scaleFactor);
    textStyle(BOLD);
    textAlign(LEFT);
    text(spaceShip.score, 30, 30 / scaleFactor);
    textSize(32 / scaleFactor);
    textAlign(CENTER);
    // GAME OVER with shadow
    fill(0, 0, 0, 100);
    text(
      "GAME OVER",
      BASE_WIDTH / 2 + 2 / scaleFactor,
      120 / scaleFactor + 2 / scaleFactor
    );
    fill(255);
    text("GAME OVER", BASE_WIDTH / 2, 120 / scaleFactor);
    // Buttons with glow
    if (playAgainButton.isHovered) {
      fill(255, 255, 255, 50);
      noStroke();
      rect(
        playAgainButton.x - 5,
        playAgainButton.y - 5,
        playAgainButton.width + 10,
        playAgainButton.height + 10,
        playAgainButton.cornerRadius + 5
      );
    }
    fill(
      playAgainButton.isHovered
        ? playAgainButton.hoverFill
        : playAgainButton.normalFill
    );
    stroke(playAgainButton.borderColor);
    strokeWeight(2 / scaleFactor);
    rect(
      playAgainButton.x,
      playAgainButton.y,
      playAgainButton.width,
      playAgainButton.height,
      playAgainButton.cornerRadius
    );
    noStroke();
    fill(playAgainButton.textColor);
    textSize(16 / scaleFactor);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text(
      playAgainButton.text,
      playAgainButton.x + playAgainButton.width / 2,
      playAgainButton.y + playAgainButton.height / 2
    );
    if (exitButton.isHovered) {
      fill(255, 255, 255, 50);
      noStroke();
      rect(
        exitButton.x - 5,
        exitButton.y - 5,
        exitButton.width + 10,
        exitButton.height + 10,
        playAgainButton.cornerRadius + 5
      );
    }
    fill(exitButton.isHovered ? exitButton.hoverFill : exitButton.normalFill);
    stroke(exitButton.borderColor);
    strokeWeight(2 / scaleFactor);
    rect(
      exitButton.x,
      exitButton.y,
      playAgainButton.width,
      playAgainButton.height,
      playAgainButton.cornerRadius
    );
    noStroke();
    fill(exitButton.textColor);
    textSize(16 / scaleFactor);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text(
      exitButton.text,
      exitButton.x + exitButton.width / 2,
      exitButton.y + exitButton.height / 2
    );
    drawLeaderboard(
      BASE_WIDTH / 2 - 100,
      (playAgainButton.y - 120) / scaleFactor,
      200,
      120 / scaleFactor
    );
    playAgainButton.isHovered =
      mouseX / scaleFactor >= playAgainButton.x &&
      mouseX / scaleFactor <= playAgainButton.x + playAgainButton.width &&
      mouseY / scaleFactor >= playAgainButton.y &&
      mouseY / scaleFactor <= playAgainButton.y + playAgainButton.height;
    exitButton.isHovered =
      mouseX / scaleFactor >= exitButton.x &&
      mouseX / scaleFactor <= exitButton.x + exitButton.width &&
      mouseY / scaleFactor >= exitButton.y &&
      mouseY / scaleFactor <= exitButton.y + exitButton.height;
  } else if (state == 100) {
    background(0);
    mouvementOfStars();
    fill(255);
    textFont(myFont);
    textSize(24 / scaleFactor);
    textAlign(CENTER);
    // High score text with shadow
    fill(0, 0, 0, 100);
    text(
      "New High Score!",
      BASE_WIDTH / 2 + 2 / scaleFactor,
      150 / scaleFactor + 2 / scaleFactor
    );
    fill(255);
    text("New High Score!", BASE_WIDTH / 2, 150 / scaleFactor);
    textSize(16 / scaleFactor);
    fill(0, 0, 0, 100);
    text(
      "Enter your name:",
      BASE_WIDTH / 2 + 2 / scaleFactor,
      200 / scaleFactor + 2 / scaleFactor
    );
    fill(255);
    text("Enter your name:", BASE_WIDTH / 2, 200 / scaleFactor);
    fill(0, 0, 100, 128);
    stroke(255);
    strokeWeight(2 / scaleFactor);
    rect(
      BASE_WIDTH / 2 - 100,
      230 / scaleFactor,
      200,
      40 / scaleFactor,
      10 / scaleFactor
    );
    noStroke();
    fill(255);
    textAlign(LEFT);
    text(
      playerName + (frameCount % 60 < 30 ? "|" : ""),
      BASE_WIDTH / 2 - 90,
      250 / scaleFactor
    );
    textAlign(CENTER);
    textSize(12 / scaleFactor);
    fill(0, 0, 0, 100);
    text(
      "Press Enter to submit",
      BASE_WIDTH / 2 + 1 / scaleFactor,
      300 / scaleFactor + 1 / scaleFactor
    );
    fill(255);
    text("Press Enter to submit", BASE_WIDTH / 2, 300 / scaleFactor);
  }
  // Fade effect
  if (transitionAlpha > 0) {
    fill(0, 0, 0, transitionAlpha);
    rect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    transitionAlpha -= 15;
  }
  pop();
}

function drawLeaderboard(x, y, width, height) {
  fill(0, 0, 100, 200); // Increased opacity for contrast
  stroke(255);
  strokeWeight(2 / scaleFactor);
  rect(x, y, width, height, 10 / scaleFactor);
  noStroke();
  fill(255);
  textFont(myFont);
  textSize(16 / scaleFactor);
  textStyle(BOLD);
  textAlign(CENTER);
  // Leaderboard title with shadow
  fill(0, 0, 0, 100);
  text(
    "High Scores",
    x + width / 2 + 1 / scaleFactor,
    y + 20 / scaleFactor + 1 / scaleFactor
  );
  fill(255);
  text("High Scores", x + width / 2, y + 20 / scaleFactor);
  textSize(10 / scaleFactor); // Smaller text to fit position
  textStyle(NORMAL);
  let yOffset = y + 40 / scaleFactor;
  for (let i = 0; i < Math.min(5, highScores.length); i++) {
    let position = i + 1; // Dynamic position based on rank
    let name =
      highScores[i] && highScores[i].name
        ? highScores[i].name.substring(0, 6) // Shorten to fit
        : "Unknown";
    let score =
      highScores[i] && highScores[i].score != null ? highScores[i].score : 0;
    textAlign(LEFT);
    text(position, x + 10, yOffset);
    textAlign(CENTER);
    text(name, x + width / 2, yOffset);
    textAlign(RIGHT);
    text(score, x + width - 10, yOffset);
    yOffset += 16 / scaleFactor; // Tighter spacing
  }
}

function mousePressed() {
  if (clickCooldown > millis() || stateLock) return;
  clickCooldown = millis() + 500;
  if (bonusSound.isLoaded()) bonusSound.play();
  if (
    state == -2 &&
    mouseX / scaleFactor > 300 &&
    mouseX / scaleFactor < 380 &&
    mouseY / scaleFactor > 550 &&
    mouseY / scaleFactor < 580
  ) {
    changeState(-1);
  } else if (state == 0 && startButton.isHovered) {
    changeState(1);
  } else if (state == 99) {
    if (playAgainButton.isHovered) {
      if (
        spaceShip.score > 0 &&
        (highScores.length < 5 ||
          spaceShip.score > highScores[highScores.length - 1].score)
      ) {
        changeState(100);
      } else {
        resetGame();
        changeState(1);
      }
    } else if (exitButton.isHovered) {
      resetGame();
      changeState(0);
    }
  }
}

function keyPressed() {
  if (state == 0) {
    if (keyCode === RETURN) {
      if (clickCooldown > millis()) return;
      clickCooldown = millis() + 500;
      if (bonusSound.isLoaded()) bonusSound.play();
      changeState(1);
    }
  } else if (state == 1) {
    if (keyCode === LEFT_ARROW) {
      spaceShip.direction = -1;
    } else if (keyCode === RIGHT_ARROW) {
      spaceShip.direction = 1;
    }
    if (keyCode === UP_ARROW) {
      spaceShip.upDown = -1;
    } else if (keyCode === DOWN_ARROW) {
      spaceShip.upDown = 1;
    }
    if (key === " ") {
      bullets.push(new Bullet(spaceShip.x, spaceShip.y));
      if (shootSound.isLoaded()) shootSound.play();
    }
  } else if (state == 100) {
    if (keyCode === ENTER) {
      let name = playerName.trim();
      if (name.length > 0) {
        highScores.push({
          name: name.substring(0, 10),
          score: spaceShip.score,
        });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 5);
        localStorage.setItem("highScores", JSON.stringify(highScores));
        console.log("Saved high scores:", highScores);
        resetGame();
        changeState(1);
      }
    } else if (keyCode === BACKSPACE) {
      playerName = playerName.slice(0, -1);
    } else if (
      key.length === 1 &&
      playerName.length < 10 &&
      key.match(/[a-zA-Z0-9]/)
    ) {
      playerName += key.toUpperCase();
    }
  }
}

function keyReleased() {
  if (state == 1) {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      spaceShip.direction = 0;
    }
    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
      spaceShip.upDown = 0;
    }
  }
}

function intersectWith(object1, object2) {
  let distance = dist(object1.x, object1.y, object2.x, object2.y);
  return distance < object1.radius + object2.radius;
}

function mouvementOfStars() {
  for (star of stars) {
    star.move();
    star.show();
  }
}

function explosion(x, y, startFrame) {
  image(explosionAnim[(frameCount - startFrame) % 6], x, y);
}

function bulletMove() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].move();
    bullets[i].show();
    for (let j = 0; j < enemies.length; j++) {
      if (intersectWith(bullets[i], enemies[j])) {
        bullets[i].y = -10;
        enemies[j].life -= 1;
        if (enemies[j].life == 0) {
          explosions.push(createVector(enemies[j].x, enemies[j].y, frameCount));
          enemies[j].reborn();
          spaceShip.score += enemies[j].point;
          spaceShip.kills++;
          if (spaceShip.kills % 10 === 0) {
            spaceShip.score += 50; // Bonus score every 10 kills
            if (milestoneSound.isLoaded()) milestoneSound.play();
          }
          if (explosionSound.isLoaded()) explosionSound.play();
        }
      }
    }
  }
  bullets = bullets.filter((b) => b.y >= 0);
}

function bulletEnemyMove() {
  for (let bullet of enemyBullets) {
    bullet.move();
    bullet.show();
    if (intersectWith(bullet, spaceShip)) {
      bullet.y = BASE_HEIGHT + 10;
      spaceShip.life -= 1;
      background(255, 0, 0);
    }
  }
  enemyBullets = enemyBullets.filter((b) => b.y <= BASE_HEIGHT);
}

class SpaceShip {
  constructor(life) {
    this.x = BASE_WIDTH / 2;
    this.y = BASE_HEIGHT - 30;
    this.speed = 10;
    this.direction = 0;
    this.upDown = 0;
    this.life = life;
    this.score = 0;
    this.kills = 0;
    this.radius = 22;
  }

  show() {
    image(spaceShipImg, this.x - this.radius, this.y - this.radius);
  }

  move() {
    this.x = constrain(
      this.x + this.speed * this.direction,
      10,
      BASE_WIDTH - 10
    );
    this.y = constrain(
      this.y + this.speed * this.upDown,
      BASE_HEIGHT - 300,
      BASE_HEIGHT - 30
    );
  }
}

class Bonus {
  constructor(type = 0) {
    this.x = random(10, BASE_WIDTH - 10);
    this.y = -10;
    this.speed = 6;
    this.type = type;
    this.radius = 9;
  }

  move() {
    this.y += this.speed;
  }

  show() {
    image(bonusImg[0], this.x - this.radius, this.y - this.radius);
  }

  effect(player) {
    player.life += 1;
  }
}

class Bullet {
  constructor(initX, initY) {
    this.x = initX;
    this.y = initY - 10;
    this.speed = 12;
    this.radius = 4;
  }

  show() {
    image(bulletImg, this.x - 3, this.y - 3);
  }

  move() {
    this.y -= this.speed;
  }
}

class EnemyBullet {
  constructor(initX, initY, offset = 15) {
    this.x = initX;
    this.y = initY - offset;
    this.speedBullet = 15;
    this.radius = 6;
  }

  show() {
    image(bulletEnemyImg, this.x - 3, this.y - 3);
  }

  move() {
    this.y += this.speedBullet;
  }
}

class Enemy {
  constructor() {
    this.reborn();
  }

  reborn() {
    this.x = random(10, BASE_WIDTH - 10);
    this.y = random(-40, -400);
    let enemyLottery = random(1, 10);
    if (enemyLottery < 4) {
      this.type = 1;
      this.speed = random(4, 8);
      this.image = enemyImg1;
      this.life = 2;
      this.point = 2;
      this.radius = 20;
      this.dirPostHit =
        Math.pow(-1, Math.round(random(1, 2))) * random(0.2, 0.5);
    } else if (enemyLottery < 9) {
      this.type = 2;
      this.speed = random(8, 12);
      this.image = enemyImg2;
      this.life = 1;
      this.point = 1;
      this.radius = 18;
    } else {
      this.type = 3;
      this.speed = random(6, 10);
      this.image = enemyImg3;
      this.life = 1;
      this.point = 3;
      this.radius = 17;
    }
  }

  move() {
    if (this.type == 1 && this.life == 1) {
      this.image = enemyImg1b;
      this.y += this.speed;
      this.x += this.speed * this.dirPostHit;
    } else if (this.type == 3) {
      this.y += this.speed;
      this.x = 0.5 * BASE_WIDTH * (1 + cos((5 * this.y) / BASE_WIDTH));
    } else {
      this.y += this.speed;
    }
  }

  fire() {
    if (this.type == 3 && random(0, 25) < 1 && this.y > 0) {
      return true;
    }
    return false;
  }

  show() {
    image(this.image, this.x - 15, this.y - 15);
  }
}

class Boss {
  constructor() {}
  show() {}
  move() {}
}

class Star {
  constructor(initX, initY) {
    this.x = initX;
    this.y = initY;
    this.speed = random(1, 4);
  }

  move() {
    this.y += this.speed;
    if (this.y > BASE_HEIGHT) {
      this.y = random(-50, 0);
      this.x = random(0, BASE_WIDTH);
    }
  }

  show() {
    noStroke();
    fill((20 * this.speed) / 2, 0, (125 * this.speed) / 2);
    ellipse(this.x, this.y, this.speed, this.speed);
  }
}
