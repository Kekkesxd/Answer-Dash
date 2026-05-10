# Answer Dash 🎮

A fast-paced neon arcade trivia game where players move across the canvas to choose the correct answer before the timer runs out.

Answer Dash combines trivia, movement, obstacles, difficulty scaling, login authentication, and a leaderboard system into one arcade-style browser game.

---

## Live Flow

The project uses two main frontend pages:

- `login.html` — login and register screen
- `index.html` — protected game page

When a user logs in, the backend sends a JWT token in an `httpOnly` cookie. The game page checks whether the token is valid before allowing access. If the token is missing or expired, the user is redirected back to `login.html`.

---

## How to Play

Use **WASD** or the **Arrow Keys** to move your player around the canvas.

A question appears at the top of the screen. Four answer zones appear around the play area. Move into the zone that matches the correct answer before time runs out.

- Correct answer → score a point
- Wrong answer → lose a life
- Timer reaches zero → lose a life
- Red obstacles → block your path
- Orange `!` obstacles → reset you back to the center
- Lose all lives → game over

---

## Features

- Login and register system
- JWT cookie authentication
- Protected game page
- Logout button
- Start-screen leaderboard button
- Game-over leaderboard panel
- Online leaderboard backed by PostgreSQL
- Local high score tracking by theme and difficulty
- Multiple trivia themes loaded from JSON files
- Random question order every run
- Randomized answer order every question
- Randomized answer-zone positions
- Obstacle generation with spacing logic
- Reset obstacles that teleport the player
- Countdown before each round
- Timer warning flash when time is low
- Particle trails and answer feedback effects
- Neon arcade UI with gradient background, grid overlay, and scanlines
- Rules popup before each game
- Separate start, gameplay, leaderboard, and game-over screens

---

## Themes

The game currently supports these question themes:

- General Knowledge
- Pop Culture
- Hogwarts
- Games
- Tech and Gaming

In **Endless Mode**, the game mixes questions from all available themes.

---

## Difficulty Modes

| Difficulty | Lives | Timer | Obstacles | Reset Obstacles | Notes |
|------------|-------|-------|-----------|-----------------|-------|
| Easy       | 5     | 10s   | 0         | 0               | Beginner-friendly |
| Medium     | 4     | 8s    | 8         | 4               | Standard mode |
| Hard       | 3     | 6s    | 15        | 10              | Faster and more punishing |
| Arel       | 2     | 5s    | 20        | 20              | Moving and shrinking zones |
| Endless    | 3     | Scaling | Scaling | Scaling | Uses all themes and gets harder over time |

---

## Endless Mode

Endless Mode is designed as the main leaderboard mode.

It starts with medium-style difficulty, then gradually becomes harder:

- Early rounds use normal obstacles
- Later rounds increase obstacle count
- Higher rounds enable Arel-style moving and shrinking answer zones
- Questions loop and reshuffle after the full pool is used

---

## Leaderboard

The backend stores scores in PostgreSQL.

The leaderboard:

- Shows the top scores
- Displays player names and scores
- Can be opened from the start screen
- Also appears on the game-over screen
- Uses authenticated users when submitting scores

---

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move up |
| S / Arrow Down | Move down |
| A / Arrow Left | Move left |
| D / Arrow Right | Move right |

---

## Project Structure

```txt
answer-dash/
├── src/
│   ├── index.html
│   ├── login.html
│   ├── style.css
│   ├── api.js
│   ├── auth.js
│   ├── game.js
│   ├── questions/
│   │   ├── questionsGeneral.json
│   │   ├── questionsPop.json
│   │   ├── questionsPotter.json
│   │   ├── questionsGames.json
│   │   └── questionsTechGame.json
│   └── music/
│
├── server/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── leaderboardController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── leaderboardRoutes.js
│   └── services/
│       ├── authService.js
│       └── leaderboardService.js
│
├── package.json
└── README.md
```

---

## Backend API

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive auth cookie |
| GET | `/api/auth/currUser` | Check the current logged-in user |
| POST | `/api/auth/logout` | Clear the auth cookie |

### Leaderboard Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get top leaderboard scores |
| POST | `/api/leaderboard` | Submit a score for the logged-in user |

---

## Environment Variables

The backend expects environment variables for authentication and database access.

Example:

```env
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_postgres_connection_string
PORT=3000
NODE_ENV=production
```

Depending on your `db.js` setup, the database connection may use either `DATABASE_URL`, `DB_URL`, or separate database variables.

---

## Running Locally

Because the frontend loads JSON files with `fetch()`, do not open the HTML files directly from the file system.

Use a local server such as VS Code Live Server for the frontend.

For the backend:

```bash
npm install
npm start
```

Or use the script configured in `package.json`.

Make sure your frontend `api.js` points to the correct backend URL:

```js
const API_URL = "http://localhost:3000";
```

For deployment, update it to the deployed backend URL.

---

## Adding Questions

Each question JSON file follows this structure:

```json
[
  {
    "question": "What game features Master Chief?",
    "answers": ["Destiny", "Halo", "Call of Duty", "Gears of War"],
    "correct": 1
  }
]
```

`correct` is the zero-based index of the correct answer before shuffling.

Examples:

- `0` = first answer
- `1` = second answer
- `2` = third answer
- `3` = fourth answer

The game automatically shuffles answer order during gameplay while preserving the correct answer.

---

## Built With

- HTML5 Canvas
- CSS3
- Vanilla JavaScript
- Node.js
- Express
- PostgreSQL
- bcryptjs
- JSON Web Tokens
- Cookie-based authentication
- Google Fonts — Press Start 2P

---

## Deployment Notes

The backend can serve the frontend files from the `src` folder using Express static hosting.

If using GitHub Pages for the frontend, the deployed folder must contain an `index.html` file at its root. GitHub Pages will not automatically open `login.html`.

Recommended frontend flow:

```txt
User opens index.html
→ game.js checks /api/auth/currUser
→ valid token: stay on game page
→ invalid token: redirect to login.html
```

---

## Screenshots

Add updated screenshots here after the final UI is stable.

Suggested screenshots:

- Login screen:
<img width="1273" height="768" alt="image" src="https://github.com/user-attachments/assets/d7e8118e-8e74-4994-80b1-7e54cbfa0a01" />
<img width="1261" height="759" alt="image" src="https://github.com/user-attachments/assets/f139ce76-928b-4e30-b228-a807ceaa97b5" />

- Start screen:
<img width="1266" height="762" alt="image" src="https://github.com/user-attachments/assets/689a05d9-19f6-4624-9a00-081a6a2c850d" />

- Rules popup:
<img width="1283" height="778" alt="image" src="https://github.com/user-attachments/assets/baa04fbf-d9d6-459f-ad2d-72b65d24557b" />

- Gameplay:
<img width="1544" height="655" alt="image" src="https://github.com/user-attachments/assets/3d70f050-727b-4f3f-a572-e2ffef941e4f" />

- Leaderboard popup:
<img width="1022" height="623" alt="image" src="https://github.com/user-attachments/assets/dcd0ff87-5c3a-4198-84a3-23c614bc5666" />


- Game-over screen with leaderboard:
<img width="1021" height="620" alt="image" src="https://github.com/user-attachments/assets/2fa6b47a-06bc-4377-9e02-d115ef89603c" />
---

## Future Ideas

- Score multipliers for fast answers
- More question themes
- More music and sound effects
- Mobile controls
- Admin question editor
- Difficulty-specific leaderboard filters
- Theme-specific leaderboard filters
- Player profile stats
