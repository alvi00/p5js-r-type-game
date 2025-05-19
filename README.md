##SpaceShooter
Overview
SpaceShooter is a retro-style space shooter game. Built with p5.js, the game features a player-controlled spaceship battling waves of enemies, collecting bonuses, and earning high scores saved in localStorage. The game is designed to run locally via a Python HTTP server and is optimized for Chrome.

Requirements

Browser: Google Chrome
Python: Python 3.x (for running a local HTTP server).
Dependencies:
p5.js library (added)
Assets (images, sounds, font) in the assets/ folder.

Setup Instructions

Navigate to Project Directory

Start Local Server:
Run a Python HTTP server in cmd :python -m http.server 8000

Open Game:
Open Chrome and navigate to http://localhost:8000.
The game starts with an intro video (state -2), followed by the main menu (state 0).

Optional: Clear Leaderboard:
To reset high scores, open Chrome DevTools (Ctrl + Shift + I), go to Application > Local Storage > http://localhost:8000, and delete the highScores key.

Gameplay and Controls

Objective: Control a spaceship to destroy enemies, collect bonuses, and achieve a high score.
Controls:
Arrow Keys: Move the spaceship (left, right, up, down).
Spacebar: Fire bullets.
Enter: Start game from main menu (state 0) or submit high score (state 100).
Mouse: Click buttons (Start Game, Play Again, Exit).

Game States:
State -2: Intro video (click "Skip" to proceed).
State -1: Loading screen.
State 0: Main menu with leaderboard.
State 1: Gameplay (shoot enemies, collect bonuses).
State 99: Game over with leaderboard and buttons.
State 100: High score input for new top scores.

Features:
Enemies: Three types (type 1: 2 health, type 2: fast, type 3: shoots and moves sinusoidally).
Bonuses: Collect to gain extra lives.
Scoring: Earn 1–3 points per enemy, +50 bonus every 10 kills with a milestone sound.
Leaderboard: Displays top 5 scores with dynamic positions (1, 2, 3, etc.).
Background: Starfield (state 1) and background.png (state 99).
Sounds: Shooting, explosions, bonuses, and milestone sound (milestone.wav).

File Structure
SpaceShooter/
├── assets/
│ ├── 8-bit-pusab.ttf
│ ├── background.png
│ ├── bonus.wav
│ ├── bonus0.png
│ ├── boss0.png
│ ├── bullet.png
│ ├── bullet2.png
│ ├── enemy1.png
│ ├── enemy1b.png
│ ├── enemy2.png
│ ├── enemy3.png
│ ├── expl1.png
│ ├── expl2.png
│ ├── expl3.png
│ ├── expl4.png
│ ├── expl5.png
│ ├── expl6.png
│ ├── explosion.wav
│ ├── highscores.json
│ ├── intro.mp4
│ ├── milestone.wav
│ ├── scores.json
│ ├── shoot.wav
│ └── spaceShip.png
├── index.html
├── p5.min.js
├── p5.play.js
├── p5.sound.min.js
├── README.md
└── q1.js

Showcase Features:
Main Menu (state 0): Highlight leaderboard with dynamic position (req #8).
Gameplay (state 1): Kill 10 enemies to trigger milestone.wav and +50 points (req #10).
Game Over (state 99): Show background.png (req #4) and leaderboard.
High Score (state 100): Enter a name to save a new score.
Stability (req #9): Resize window to show scaleFactor and navigate states without crashes.
