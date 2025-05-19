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
let shootSound, explosionSound, bonusSound;
let highScores = [];
let scaleFactor = 1;
let introVideo;
let videoLoadFailed = false;

// Start screen button
let startButton = {
  x: 125,
  y: 280,
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
  y: 280,
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
  y: 280,
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
  loadJSON(
    "assets/highscores.json",
    (data) => {
      highScores = Array.isArray(data) ? data : [];
      highScores.sort((a, b) => b.score - a.score);
    },
    () => {
      highScores = [];
    }
  );
  // Initialize video
  introVideo = document.getElementById("intro-video");
  introVideo.addEventListener("ended", () => {
    state = -1; // Transition to loading screen
  });
  introVideo.addEventListener("error", () => {
    console.error("Video failed to load or play:", introVideo.error);
    videoLoadFailed = true;
    state = -1; // Skip to loading screen
  });
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
  scaleFactor = canvasWidth / BASE_WIDTH;
  frameRate(30);
  spaceShip = new SpaceShip(MAX_LIFE);
  for (let i = 0; i < MAX_ENEMY; i++) {
    enemies[i] = new Enemy();
  }
  for (let i = 0; i < 150; i++) {
    stars[i] = new Star(
      random(0, BASE_WIDTH),
      random(-BASE_HEIGHT, BASE_HEIGHT)
    );
  }
  // Start video playback
  if (introVideo) {
    introVideo.play().catch((e) => {
      console.error("Video playback failed:", e);
      videoLoadFailed = true;
      state = -1;
    });
  } else {
    videoLoadFailed = true;
    state = -1;
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
  scaleFactor = canvasWidth / BASE_WIDTH;
}

function draw() {
  push();
  scale(scaleFactor);
  if (state == -2) {
    background(0);
    if (videoLoadFailed || !introVideo) {
      state = -1; // Skip to loading screen
    } else {
      introVideo.style.display = "block"; // Show video
    }
  } else if (state == -1) {
    if (introVideo) introVideo.style.display = "none"; // Hide video
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(24 / scaleFactor);
    text("Loading...", BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20 / scaleFactor);
    let progress = frameCount / 60;
    if (progress >= 1) {
      state = 0;
    }
    fill(100);
    rect(50, BASE_HEIGHT / 2, BASE_WIDTH - 100, 10 / scaleFactor);
    fill(255);
    rect(50, BASE_HEIGHT / 2, (BASE_WIDTH - 100) * progress, 10 / scaleFactor);
  } else if (state == 0) {
    if (introVideo) introVideo.style.display = "none";
    background(5, 0, 12);
    mouvementOfStars();
    fill(255);
    textFont(myFont);
    textSize(28 / scaleFactor);
    textStyle(BOLD);
    textAlign(CENTER);
    text("SpaceShooter", BASE_WIDTH / 2, 100 / scaleFactor);
    textSize(12 / scaleFactor);
    textStyle(NORMAL);
    text("Arrows to move", BASE_WIDTH / 2, 350 / scaleFactor);
    text("Space bar to fire", BASE_WIDTH / 2, 400 / scaleFactor);
    text(
      "By LittleBoxes - 2019",
      BASE_WIDTH / 2,
      BASE_HEIGHT - 30 / scaleFactor
    );
    drawLeaderboard(
      BASE_WIDTH / 2 - 100,
      150 / scaleFactor,
      200,
      120 / scaleFactor
    );
    startButton.isHovered =
      mouseX / scaleFactor >= startButton.x &&
      mouseX / scaleFactor <= startButton.x + startButton.width &&
      mouseY / scaleFactor >= startButton.y &&
      mouseY / scaleFactor <= startButton.y + startButton.height;
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
  } else if (state == 1) {
    if (introVideo) introVideo.style.display = "none";
    background(5, 0, 12);
    mouvementOfStars();
    spaceShip.show();
    spaceShip.move();
    if (spaceShip.life <= 0) {
      state = 99;
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
    if (introVideo) introVideo.style.display = "none";
    background(0);
    fill(255);
    textFont(myFont);
    textSize(12 / scaleFactor);
    textStyle(BOLD);
    textAlign(LEFT);
    text(spaceShip.score, 30, 30 / scaleFactor);
    textSize(32 / scaleFactor);
    textAlign(CENTER);
    text("GAME OVER", BASE_WIDTH / 2, 150 / scaleFactor);
    playAgainButton.isHovered =
      mouseX / scaleFactor >= playAgainButton.x &&
      mouseX / scaleFactor <= playAgainButton.x + playAgainButton.width &&
      mouseY / scaleFactor >= playAgainButton.y &&
      mouseY / scaleFactor <= playAgainButton.y + playAgainButton.height;
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
    exitButton.isHovered =
      mouseX / scaleFactor >= exitButton.x &&
      mouseX / scaleFactor <= exitButton.x + exitButton.width &&
      mouseY / scaleFactor >= exitButton.y &&
      mouseY / scaleFactor <= exitButton.y + exitButton.height;
    fill(exitButton.isHovered ? exitButton.hoverFill : exitButton.normalFill);
    stroke(exitButton.borderColor);
    strokeWeight(2 / scaleFactor);
    rect(
      exitButton.x,
      exitButton.y,
      exitButton.width,
      exitButton.height,
      exitButton.cornerRadius
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
      350 / scaleFactor,
      200,
      120 / scaleFactor
    );
  }
  pop();
}

function drawLeaderboard(x, y, width, height) {
  fill(0, 0, 100, 128);
  stroke(255);
  strokeWeight(2 / scaleFactor);
  rect(x, y, width, height, 10 / scaleFactor);
  noStroke();
  fill(255);
  textFont(myFont);
  textSize(16 / scaleFactor);
  textStyle(BOLD);
  textAlign(CENTER);
  text("High Scores", x + width / 2, y + 20 / scaleFactor);
  textSize(12 / scaleFactor);
  textStyle(NORMAL);
  let yOffset = y + 40 / scaleFactor;
  for (let i = 0; i < Math.min(5, highScores.length); i++) {
    let name =
      highScores[i] && highScores[i].name ? highScores[i].name : "Unknown";
    let score =
      highScores[i] && highScores[i].score != null ? highScores[i].score : 0;
    textAlign(LEFT);
    text(name, x + 10, yOffset);
    textAlign(RIGHT);
    text(score, x + width - 10, yOffset);
    yOffset += 20 / scaleFactor;
  }
}

function mousePressed() {
  if (state == 0 && startButton.isHovered) {
    state = 1;
  } else if (state == 99) {
    if (playAgainButton.isHovered) {
      if (
        spaceShip.score > 0 &&
        (highScores.length < 5 ||
          spaceShip.score > highScores[highScores.length - 1].score)
      ) {
        let playerName = prompt(
          "Enter your name for the high score:",
          "Player"
        );
        if (playerName) {
          highScores.push({ name: playerName, score: spaceShip.score });
          highScores.sort((a, b) => b.score - a.score);
          highScores = highScores.slice(0, 5);
          console.log(
            "Update assets/highscores.json with:",
            JSON.stringify(highScores, null, 2)
          );
        }
      }
      state = 1;
      enemies = [];
      bullets = [];
      enemyBullets = [];
      spaceShip.score = 0;
      setup();
    } else if (exitButton.isHovered) {
      state = 0;
    }
  }
}

function keyPressed() {
  if (state == 0) {
    if (keyCode === RETURN) {
      state = 1;
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
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) {
    spaceShip.direction = 0;
  } else if (keyCode === RIGHT_ARROW) {
    spaceShip.direction = 0;
  }
  if (keyCode === UP_ARROW) {
    spaceShip.upDown = 0;
  } else if (keyCode === DOWN_ARROW) {
    spaceShip.upDown = 0;
  }
}

function intersectWith(object1, object2) {
  let distance = dist(object1.x, object1.y, object2.x, object2.y);
  if (distance < object1.radius + object2.radius) {
    return true;
  } else {
    return false;
  }
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
          if (explosionSound.isLoaded()) explosionSound.play();
        }
      }
    }
  }
  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }
}

function bulletEnemyMove() {
  for (bullet of enemyBullets) {
    bullet.move();
    bullet.show();
    if (intersectWith(bullet, spaceShip)) {
      bullet.y = BASE_HEIGHT + 10;
      spaceShip.life -= 1;
      background(255, 0, 0);
    }
  }
  for (let i = 0; i < enemyBullets.length; i++) {
    if (enemyBullets[i].y > BASE_HEIGHT) {
      enemyBullets.splice(i, 1);
    }
  }
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
    this.radius = 22;
  }

  show() {
    image(spaceShipImg, this.x - this.radius, this.y - this.radius);
  }

  move() {
    if (this.x >= 10 && this.x <= BASE_WIDTH - 10) {
      this.x += this.speed * this.direction;
    } else if (this.x < 10) {
      this.x = 10;
    } else if (this.x > BASE_WIDTH - 10) {
      this.x = BASE_WIDTH - 10;
    }
    if (this.y >= BASE_HEIGHT - 300 && this.y <= BASE_HEIGHT - 30) {
      this.y += this.speed * this.upDown;
    } else if (this.y > BASE_HEIGHT - 30) {
      this.y = BASE_HEIGHT - 30;
    } else if (this.y < BASE_HEIGHT - 300) {
      this.y = BASE_HEIGHT - 300;
    }
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
    this.image = {};
    if (enemyLottery >= 1 && enemyLottery < 4) {
      this.type = 1;
      this.speed = random(4, 8);
      this.image = enemyImg1;
      this.life = 2;
      this.point = 2;
      this.radius = 20;
      this.dirPostHit =
        Math.pow(-1, Math.round(random(1, 2))) * random(0.2, 0.5);
    } else if (enemyLottery >= 4 && enemyLottery < 9) {
      this.type = 2;
      this.speed = random(8, 12);
      this.image = enemyImg2;
      this.life = 1;
      this.point = 1;
      this.radius = 18;
    } else if (enemyLottery >= 9 && enemyLottery <= 10) {
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
    if (this.type == 3) {
      if (random(0, 25) < 1 && this.y > 0) {
        return true;
      }
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
