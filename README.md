

# SpaceShooter

##  Overview  
**SpaceShooter** is a retro-style arcade space shooter built using **p5.js**. The player controls a spaceship, battles waves of enemies, collects bonuses, and earns high scores that persist using `localStorage`. The game runs locally via a Python HTTP server and is optimized for Google Chrome.

---

##  Requirements

- **Browser:** Google Chrome  
- **Python:** Python 3.x (used to run local HTTP server)  
- **Dependencies:**  
  - `p5.js` library (included in project)  
  - Game assets (images, sounds, font) in the `assets/` folder

---

##  Setup Instructions

1. **Navigate to Project Directory**  
   Open your terminal or command prompt in the project folder.

2. **Start Local Server**  
   Run the following command:
```

python -m http.server 8000

```

3. **Open the Game in Browser**  
Launch Google Chrome and visit:  
```

[http://localhost:8000](http://localhost:8000)

```

The game starts with an **intro video** (`state -2`), then transitions to the **main menu** (`state 0`).

4. **Optional: Reset Leaderboard**  
- Open **Chrome DevTools** (`Ctrl + Shift + I`)
- Go to **Application > Local Storage > http://localhost:8000**
- Delete the `highScores` key to clear scores

---

## 🎮 Gameplay and Controls

- **Objective:** Destroy enemies, collect bonuses, and rack up high scores.

- **Controls:**
- `Arrow Keys:` Move spaceship (left, right, up, down)  
- `Spacebar:` Shoot bullets  
- `Enter:` Start game or submit score  
- `Mouse:` Click buttons like Start Game, Play Again, Exit

---

##  Game States

| State   | Description |
|---------|-------------|
| -2      | Intro video (click **Skip** to proceed) |
| -1      | Loading screen |
| 0       | Main menu with leaderboard |
| 1       | Gameplay |
| 99      | Game over screen with buttons + leaderboard |
| 100     | High score name input |

---

##  Features

- **Enemies:**  
- Type 1: 2 health  
- Type 2: Fast  
- Type 3: Shoots and moves in a sinusoidal pattern

- **Bonuses:**  
- Collect to gain extra lives

- **Scoring:**  
- +1 to +3 per enemy  
- +50 bonus every 10 kills (with `milestone.wav`)

- **Leaderboard:**  
- Top 5 scores  
- Dynamically displays ranks (1st, 2nd, 3rd...)

- **Backgrounds:**  
- `state 1`: Animated starfield  
- `state 99`: Static background from `background.png`

- **Sound Effects:**  
- Shooting (`shoot.wav`)  
- Explosions (`explosion.wav`)  
- Bonuses (`bonus.wav`)  
- Milestone kill bonus (`milestone.wav`)

---

##  File Structure

```

SpaceShooter/
├── assets/
│   ├── 8-bit-pusab.ttf
│   ├── background.png
│   ├── bonus.wav
│   ├── bonus0.png
│   ├── boss0.png
│   ├── bullet.png
│   ├── bullet2.png
│   ├── enemy1.png
│   ├── enemy1b.png
│   ├── enemy2.png
│   ├── enemy3.png
│   ├── expl1.png - expl6.png
│   ├── explosion.wav
│   ├── highscores.json
│   ├── intro.mp4
│   ├── milestone.wav
│   ├── scores.json
│   ├── shoot.wav
│   └── spaceShip.png
├── index.html
├── p5.min.js
├── p5.play.js
├── p5.sound.min.js
├── README.md
└── q1.js

```

---

Built with p5.js
