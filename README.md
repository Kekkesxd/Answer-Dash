# Answer Dash 🎮

A fast-paced neon arcade trivia game where you physically move your player to the correct answer zone before the timer runs out.

---

## How to Play

Use **WASD** or the **Arrow Keys** to move your player around the canvas. A question appears at the top of the screen — run to the answer zone that matches the correct answer before time runs out.

- Land on the **correct zone** → score a point
- Land on the **wrong zone** → lose a life
- **Run out of time** → lose a life
- **Hit an orange obstacle** → teleported back to center
- Lose all your lives → game over

---

## Features

- 4 question themes — General Knowledge, Pop Culture, Harry Potter, Gaming
- 3 difficulty levels — Easy, Medium, Hard
- 20 random questions selected per game from a pool of 30+
- Questions and answers shuffled every game so no two runs are the same
- Randomised answer zones that change position each round
- Obstacles that scatter across the canvas per round
- Reset obstacles (orange with !) that teleport you back to center
- 3 second countdown before each round locks player movement
- Round timer that turns red at 3 seconds
- High score tracking per theme and difficulty using localStorage
- Particle trail following the player
- Burst particles on correct and wrong answers
- Neon dark arcade aesthetic with gradient background, grid and scanlines
- Rules popup before the game starts
- Full start, game and end screen flow

---

## Difficulty Scaling

| Difficulty | Lives | Timer | Obstacles | Reset Obstacles |
|------------|-------|-------|-----------|-----------------|
| Easy       | 5     | 10s   | 0         | 0               |
| Medium     | 4     | 8s    | 8         | 4               |
| Hard       | 3     | 6s    | 10        | 10              |

---

## File Structure

```
answer-dash/
├── index.html
├── style.css
├── game.js
└── questions/
    ├── questionsGeneral.json
    ├── questionsPop.json
    ├── questionsPotter.json
    └── questionsGames.json
```

---

## Running the Game

This game uses `fetch()` to load question files so it must be served over a local server — opening `index.html` directly in the browser won't work.

**Recommended:** Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code. Right click `index.html` and select **Open with Live Server**.

---

## Adding Questions

Each JSON file follows this structure:

```json
[
  {
    "question": "Your question here?",
    "answers": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 1
  }
]
```

`correct` is the **zero-based index** of the right answer — so `0` = first answer, `1` = second, and so on. The game automatically shuffles questions and picks 10 random ones per game, so you can add as many as you like.

---

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move up |
| S / Arrow Down | Move down |
| A / Arrow Left | Move left |
| D / Arrow Right | Move right |

---

## Built With

- Vanilla JavaScript
- HTML5 Canvas
- CSS3
- Google Fonts — Press Start 2P
- localStorage for high score persistence

---

## Screenshots

> Start screen: <img width="1006" height="604" alt="image" src="https://github.com/user-attachments/assets/10fcb541-930f-4434-b7c1-1ae9dec47c3b" />
> Rules popup: <img width="704" height="394" alt="image" src="https://github.com/user-attachments/assets/2c98d606-d7de-480d-82e8-e22a7c3d65e6" />
> Gameplay: <img width="1530" height="631" alt="image" src="https://github.com/user-attachments/assets/b2fafa6d-14c4-4ab2-b312-cae0a1aaf765" />
> End screen: <img width="1008" height="605" alt="image" src="https://github.com/user-attachments/assets/0ba64272-8fa3-4626-b501-6773f66e7566" />


---

## Future Ideas

- Score multiplier for fast answers
- Moving zones on hard difficulty
- Sound effects
- Mobile on-screen controls
- Custom question input
- More question themes
