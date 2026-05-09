const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("scoreDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const difficultySelect = document.getElementById("difficulty");
const timerDisplay = document.getElementById("timerDisplay");
const endScreen = document.getElementById("endScreen");
const finalText = document.getElementById("finalText");
const restartButton = document.getElementById("restartButton");
const questionsDisplay = document.getElementById("questionsDisplay");
const rulesPopup = document.getElementById("rulesPopup");
const rulesButton = document.getElementById("rulesButton");
const themeSelect = document.getElementById("theme");
const themeBox = document.getElementById("themeBox");
const themeNotice = document.getElementById("themeNotice");
const highScoreDisplay = document.getElementById("highScoreDisplay");

let selectedTheme ="";
let currentSettings = null;
let gameRunning = false;
let playerName = "";
let selectedDiff = "";
let backgroundMusic = null;
let screenFlashAlpha = 0;
let endlessRound = 0;

const player = {
    x: canvas.width / 2 - 14,
    y: canvas.height / 2 - 14,
    size: 28,
    speed: 3.8,
    lives: 3
};

const difficultySettings = {
  easy : {lives: 5, speed: 3.8, timer : 10 , obstacles: 0, resetObstacles :0, movingZones: false, music: "music/easy.flac", timerFlash : true},
  medium: {lives: 4, speed: 3.8, timer: 8, obstacles: 8, resetObstacles: 4, movingZones: false, music: "music/medium.flac", timerFlash : true},
  hard: {lives : 3 , speed: 3.8, timer: 6, obstacles: 15, resetObstacles: 10, movingZones: false, music: "music/hard.flac", timerFlash : true},
  arel: {lives: 2, speed: 3.8, timer: 5, obstacles: 20, resetObstacles: 20, movingZones:true, zoneSpeed:1, zoneShrinkRate: 0.25, minZoneW: 120,
     minZoneH: 45, music: "music/Arel.flac",timerFlash : true},
  endless: {lives: 3, speed: 3.8, timer: 12, obstacles: 8, resetObstacles: 3, movingZones: false, 
    music:"music/medium.flac", timerFlash: true, endless: true }
};

function applyEndlessDiff(){
  if(selectedDiff !== "endless") return;

  const round = endlessRound;

  //timer starting at 12 and slowly dropping
  const timerDrop = Math.min(4, Math.floor(round / 5));
  playerTimer = Math.max(8, 12 - timerDrop);

  //Questions 1-5 
  if(round < 5){
    obstacleCount = 8;
    resetObstacles = 3;

    currentSettings.movingZones = false;
    currentSettings.zoneSpeed = 0;
    currentSettings.zoneShrinkRate = 0;
    return;
  }

  //Questions 6-10
  if(round < 10){
    obstacleCount = 15;
    resetObstacles = 8;

    currentSettings.movingZones = false;
    currentSettings.zoneSpeed = 0;
    currentSettings.zoneShrinkRate = 0;
    return;
  }

  //Questions 10+ - Arel
  const arelLevel = Math.floor((round - 10) / 5);

  obstacleCount = Math.min(20, 16 + arelLevel);
  resetObstacles = Math.min(20,10 +arelLevel);

  currentSettings.movingZones = true;
  currentSettings.zoneSpeed = Math.min(3.5, 1 + arelLevel * 0.25);
  currentSettings.zoneShrinkRate = 0.25;
  currentSettings.minZoneW = 120;
  currentSettings.minZoneH = 45;
}

const myThemes = [
  {
    id: "general",
    displayName: "General Knowledge",
    file: "questions/questionsGeneral.json"
  },
  {
    id: "pop",
    displayName: "Pop Culture",
    file: "questions/questionsPop.json"
  },
  {
    id: "potter",
    displayName: "Hogwarts",
    file: "questions/questionsPotter.json"
  },
    {
    id: "gaming",
    displayName: "Games",
    file: "questions/questionsGames.json"
  },
    {
    id: "Tech_Gaming",
    displayName: "Tech and Gaming",
    file: "questions/questionsTechGame.json"
  }
];

themeSelect.innerHTML = `<option value="">Select Theme</option>`;

for(const theme of myThemes){
  themeSelect.innerHTML += `<option value="${theme.id}">${theme.displayName}</option>`;
}

difficultySelect.addEventListener("change", () =>{
  if(difficultySelect.value === "endless"){
    themeSelect.value = "";
    themeBox.classList.add("hidden");
    themeNotice.classList.remove("hidden");
  }else {
    themeBox.classList.remove("hidden");
    themeNotice.classList.add("hidden");
  }
});

startButton.addEventListener("click", () => {
  playerName = localStorage.getItem("username") || "Player";
  selectedDiff = difficultySelect.value;
  selectedTheme = themeSelect.value;

  if(selectedDiff === ""){
    alert("Please select a difficulty!");
    return;
  }
  if(selectedDiff !== "endless" && selectedTheme === ""){
    alert("Please select a theme!");
    return;
  }
  if(selectedDiff === "endless"){
    selectedTheme = "all";
  }

  rulesPopup.classList.remove("hidden");
  console.log(rulesPopup);
})

rulesButton.addEventListener("click", () => {
  rulesPopup.classList.add("hidden");
  startGame();
})



restartButton.addEventListener("click", () => {
  endScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  
  // Reset HUD displays
  scoreDisplay.textContent = "SCORE: 0";
  livesDisplay.textContent = "LIVES: 3";
  timerDisplay.textContent = "TIME: 10";
  questionsDisplay.textContent =`Q: 1/${questions.length}`;

  // Clear inputs
  difficultySelect.value = "";
});



// Collide with question box
const qb = { x: 50, y: 20, w: canvas.width - 100, h: 110 };

let questions = [];
let currQuestion = null;
let currQuestionIndex = 0;
let roundLocked = false;
let countdown = 0;

let timeLeft = 0;
let playerTimer = 10;
let timerInterval = null;


//To visualise feedback on answers
let resultCorrectIndex = null;
let resultChosenIndex = null;

let score = 0;
let particles = [];


function generateZones() {
  const cols = 2;
  const rows = 2;
  const topOffset = 160;
  const outerPad = 40;   // padding from canvas edges
  const innerPad = 150;  // padding from the center dividing lines
  const zw = 260;
  const zh = 90;

  const qw = canvas.width  / cols;
  const qh = (canvas.height - topOffset) / rows;

  const colors = ["#ff2d6f", "#ffcc00", "#00c8ff", "#bf5fff"];
  const labels = ["OPTION A", "OPTION B", "OPTION C", "OPTION D"];

  const zones = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;

      const qx = col * qw;
      const qy = topOffset + row * qh;

      // Clamp x: left quadrants hug left, right quadrants hug right
      const minX = qx + outerPad;
      const maxX = qx + qw - zw - innerPad;

      // Clamp y: top quadrants hug top, bottom quadrants hug bottom
      const minY = qy + outerPad;
      const maxY = qy + qh - zh - outerPad;

      const x = minX + Math.random() * Math.max(0, maxX - minX);
      const y = minY + Math.random() * Math.max(0, maxY - minY);

      zones.push({
        x: Math.floor(x),
        y: Math.floor(y),
        w: zw,
        h: zh,
        
        minW: currentSettings?.minZoneW || zw,
        minH: currentSettings?.minZoneH || zh,

        vx: currentSettings?.movingZones?(Math.random() < 0.5 ? -1 : 1) * currentSettings.zoneSpeed : 0,
        vy: currentSettings?.movingZones?(Math.random() < 0.5 ? -1 : 1) * currentSettings.zoneSpeed : 0,

        shrinkRate: currentSettings?.movingZones? currentSettings.zoneShrinkRate : 0,

        label: labels[i],
        neon: colors[i]
      });
    }
  }

  return zones;
}

function updateAnswerZones() {
  if (!currentSettings?.movingZones) return;
  if (roundLocked) return;

  const topBoundary = 160;

  for (const z of zones) {
    // Shrink from the center
    const centerX = z.x + z.w / 2;
    const centerY = z.y + z.h / 2;

    if (z.w > z.minW) {
      z.w -= z.shrinkRate;
    }

    if (z.h > z.minH) {
      z.h -= z.shrinkRate * 0.5;
    }

    z.x = centerX - z.w / 2;
    z.y = centerY - z.h / 2;

    // Move
    z.x += z.vx;
    z.y += z.vy;

    // Bounce off canvas walls
    if (z.x <= 0) {
      z.x = 0;
      z.vx *= -1;
    }

    if (z.x + z.w >= canvas.width) {
      z.x = canvas.width - z.w;
      z.vx *= -1;
    }

    if (z.y <= topBoundary) {
      z.y = topBoundary;
      z.vy *= -1;
    }

    if (z.y + z.h >= canvas.height) {
      z.y = canvas.height - z.h;
      z.vy *= -1;
    }
  }

  resolveZoneCollisions();
}

function resolveZoneCollisions() {
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const a = zones[i];
      const b = zones[j];

      const aCenterX = a.x + a.w / 2;
      const aCenterY = a.y + a.h / 2;
      const bCenterX = b.x + b.w / 2;
      const bCenterY = b.y + b.h / 2;

      const dx = aCenterX - bCenterX;
      const dy = aCenterY - bCenterY;

      const overlapX = a.w / 2 + b.w / 2 - Math.abs(dx);
      const overlapY = a.h / 2 + b.h / 2 - Math.abs(dy);

      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
          const push = overlapX / 2 + 1;

          if (dx < 0) {
            a.x -= push;
            b.x += push;
          } else {
            a.x += push;
            b.x -= push;
          }

          a.vx *= -1;
          b.vx *= -1;
        } else {
          const push = overlapY / 2 + 1;

          if (dy < 0) {
            a.y -= push;
            b.y += push;
          } else {
            a.y += push;
            b.y -= push;
          }

          a.vy *= -1;
          b.vy *= -1;
        }
      }
    }
  }
}

function playMusic(){
  stopMusic();

  if(!currentSettings || !currentSettings.music) return;

  backgroundMusic = new Audio(currentSettings.music);
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.05;

  backgroundMusic.play().catch(error => {
    console.error("Music Could not play:", error);
  });
}

function stopMusic(){
  if(backgroundMusic){
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic = null;
  }
}
function rectsOverlap(a, b, padding = 0) {
  return (
    a.x - padding < b.x + b.w &&
    a.x + a.w + padding > b.x &&
    a.y - padding < b.y + b.h &&
    a.y + a.h + padding > b.y
  );
}

function generateObstacles() {
  const obs = [];

  const ow = 70;
  const oh = 70;

  const leftBound = 20;
  const rightBound = canvas.width - ow - 20;
  const topBound = 180;
  const bottomBound = canvas.height - oh - 20;

  const resetX = canvas.width / 2 - player.size / 2;
  const resetY = canvas.height / 2 + 50;

  const playerResetSafeZone = {
    x: resetX - 120,
    y: resetY - 90,
    w: 240 + player.size,
    h: 180 + player.size
  };

  let spacing = 45;
  const maxAttemptsPerSpacing = 3000;

  while (obs.length < obstacleCount && spacing >= 0) {
    let attempts = 0;

    while (obs.length < obstacleCount && attempts < maxAttemptsPerSpacing) {
      attempts++;

      const candidate = {
        x: Math.floor(leftBound + Math.random() * (rightBound - leftBound)),
        y: Math.floor(topBound + Math.random() * (bottomBound - topBound)),
        w: ow,
        h: oh,
        reset: obs.length < resetObstacles
      };

      const hitsResetSafeZone = rectsOverlap(candidate, playerResetSafeZone);
      const tooCloseToOtherObstacle = obs.some(o => rectsOverlap(candidate, o, spacing));

      if (!hitsResetSafeZone && !tooCloseToOtherObstacle) {
        obs.push(candidate);
      }
    }

    // If it cannot fit all obstacles with the current spacing,
    // reduce spacing and keep trying.
    spacing -= 10;
  }

  return obs;
}

//Randomising the Answer boxes
function shuffleAnswers(question) {
  // Create array of answer/index pairs
  const pairs = question.answers.map((answer, i) => ({ answer, i }));

  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  // Return new question with shuffled answers and updated correct index
  return {
    ...question,
    answers: pairs.map(p => p.answer),
    correct: pairs.findIndex(p => p.i === question.correct)
  };
}
async function loadAllThemeQuestions(){
  const allQuestionSets = await Promise.all(
    myThemes.map(async theme => {
      const respone = await fetch(theme.file);

      if(!respone.ok){
        throw new Error(`Could not load ${theme.file}`);
      }

      return respone.json();
    })
  );
  return allQuestionSets.flat();
}
async function loadQuestions() {
   try {
    if (selectedDiff === "endless") {
      questions = await loadAllThemeQuestions();
    } else {
      const theme = myThemes.find(t => t.id === selectedTheme);

      if (!theme) {
        throw new Error("Theme not found");
      }

      const response = await fetch(theme.file);

      if (!response.ok) {
        throw new Error(`Could not load ${theme.file}`);
      }

      questions = await response.json();
    }

    if (!questions || questions.length === 0) {
      throw new Error("No questions loaded");
    }

    // Shuffle questions
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    if (selectedDiff !== "endless") {
      questions = questions.slice(0, 20);
    }

    currQuestion = shuffleAnswers(questions[0]);

    applyEndlessDiff();

    zones = generateZones();
    obstacles = generateObstacles();

    questionsDisplay.textContent =
      selectedDiff === "endless"
        ? `Q: ${endlessRound + 1}`
        : `Q: 1/${questions.length}`;

    startCountdown();

    return true;

  } catch (error) {
    console.error("Could not load the questions:", error);
    alert("Could not load questions. Check the console.");
    return false;
  }
}


function checkAnswer() {
  if (roundLocked) return;

  const inset = 30;

  for (const [i, z] of zones.entries()) {
    if (
      player.x + inset < z.x + z.w &&
      player.x + player.size - inset> z.x &&
      player.y + inset < z.y + z.h &&
      player.y + player.size  - inset > z.y
    ) {
      roundLocked = true;
      if(selectedDiff === "hard"){
        stopMusic();
      }
      resultCorrectIndex = currQuestion.correct;
      resultChosenIndex = i;


      if( i === currQuestion.correct){
        score++;
        scoreDisplay.textContent = `SCORE: ${score}`;
        spawnParticles(player.x, player.y, "#00ff88");
      }else{
        spawnParticles(player.x, player.y, "#ff2d6f");
        player.lives--;
        livesDisplay.textContent = `LIVES: ${player.lives}`;
        if(player.lives <= 0 ){
          setTimeout( () => endGame(), 1000);

          return;
        }
      }

      setTimeout(() => nextQuestion(), 1000);
      return;
    }
  }
}

function nextQuestion(){
  currQuestionIndex++;

  if(selectedDiff === "endless"){
    endlessRound++;
    
    
    if(currQuestionIndex >= questions.length){
      currQuestionIndex = 0;

      for(let i = questions.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }

    applyEndlessDiff();
      
  }else{
    if (currQuestionIndex >= questions.length){
      endGame();
      return;
    }
  }

  currQuestion = shuffleAnswers(questions[currQuestionIndex]);
  questionsDisplay.textContent= selectedDiff ==="endless"?`Q: ${endlessRound + 1}`
   :`Q: ${currQuestionIndex + 1}/${questions.length}`;
  zones = generateZones();
  obstacles = generateObstacles();
  roundLocked = false;
  resultCorrectIndex = null;
  resultChosenIndex = null;

  //Resetting the player to center
  player.x = canvas.width / 2 - player.size / 2;
  player.y = canvas.height / 2 + 50;

  startCountdown();
}

function startCountdown(){
  countdown = 3;
  roundLocked = true;
  timeLeft = playerTimer;
  timerDisplay.textContent = `TIME: ${timeLeft}`;

  const interval = setInterval(() => {
    countdown--;
    if(countdown <= 0){
      countdown = 0;
      roundLocked = false;
      clearInterval(interval);
      startTimer();
    }
  }, 1000);
}

function endGame(){
  stopMusic();

  gameRunning = false;
  clearInterval(timerInterval);

  if(selectedDiff === "endless"){
    sumbitLBScore(score).then(result => {
      console.log("Leaderboard result:", result);
    })
    .catch(error =>{
      console.error("Could not submit leaderboard score:", score);
    });
  }

  const isNewHigh = saveHighScore(score);
  const highScore = loadHighScore();

  highScoreDisplay.textContent = `BEST: ${highScore}`;

  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  finalText.innerHTML =
  `${playerName}, you scored <span style="color:#00ffb4">${score}</span> point(s)!<br><br>
   High Score: <span style="color:#ffcc00">${highScore}</span>
   ${isNewHigh ? '<br><br><span style="color:#ff2d6f">NEW HIGH SCORE!</span>' : ""}`;
}

function getHighScoreKey(){
  return `highscore_${selectedTheme}_${selectedDiff}`;
}

function loadHighScore(){
  return parseInt(localStorage.getItem(getHighScoreKey())) || 0;
}

function saveHighScore(newScore){
  const current = loadHighScore();
  if(newScore > current){
    localStorage.setItem(getHighScoreKey(), newScore);
    return true;
  }
  return false;
}

function startGame(){
  const settings = difficultySettings[selectedDiff];
  currentSettings = settings;
  if(selectedDiff !== "hard"){
  playMusic();
  }
  gameRunning = true;

  player.lives = settings.lives;
  player.speed = settings.speed;
  playerTimer = settings.timer;
  obstacleCount = settings.obstacles;
  resetObstacles = settings.resetObstacles;

  score = 0;
  currQuestionIndex = 0;
  endlessRound = 0;
  roundLocked = false;
  resultCorrectIndex = null;
  resultChosenIndex = null;

  scoreDisplay.textContent = `SCORE: ${score}`;
  livesDisplay.textContent = `LIVES: ${player.lives}`;
  questionsDisplay.textContent = `Q: 1/${questions.length}`;
  highScoreDisplay.textContent = `BEST: ${loadHighScore()}`;

  player.x = canvas.width  / 2 - player.size / 2;
  player.y = canvas.height / 2 + 50;
  
  startScreen.classList.add("hidden");

  loadQuestions().then((loaded)=> {
    if(loaded){
      gameScreen.classList.remove("hidden");
      loop()
    }else{
      gameRunning = false;
      gameScreen.classList.add("hidden");
      startScreen.classList.remove("hidden");
    }
  });
}

let zones = []
let obstacles = [];
let obstacleCount = 0;
let resetObstacles = 0;
const keys = {};

window.addEventListener("keydown", e => {
  if(!e.key) return;

  const key = e.key.toLocaleLowerCase();
  keys[key] = true;

  if (["arrowup","arrowdown","arrowleft","arrowright"].includes(key)) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", e => {
  if(!e.key) return;

  const key = e.key.toLocaleLowerCase();
  keys[key] = false;
});

function update() {
  if(screenFlashAlpha > 0){
    screenFlashAlpha -= 0.025;
  }
  if(!roundLocked){
   if (keys["arrowup"]    || keys["w"]) player.y -= player.speed;
   if (keys["arrowdown"]  || keys["s"]) player.y += player.speed;
   if (keys["arrowleft"]  || keys["a"]) player.x -= player.speed; 
   if (keys["arrowright"] || keys["d"]) player.x += player.speed; 
   
   for(let s = 0; s < 3; s++){
    particles.push({
      x: player.x + Math.random() * player.size,
      y: player.y + Math.random() * player.size,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      life: 0.8,
      size: Math.random() * 4 + 2,
      color: "#bf5fff"
   })
  }
}

//keeping the player in boundary
player.x = Math.max(0, Math.min(canvas.width  - player.size, player.x));
player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));


//Question Box collision
if (
  player.x < qb.x + qb.w &&
  player.x + player.size > qb.x &&
  player.y < qb.y + qb.h &&
  player.y + player.size > qb.y
) {
  // Push the player out from whichever side they entered
  const fromLeft   = (player.x + player.size) - qb.x;
  const fromRight  = (qb.x + qb.w) - player.x;
  const fromBottom = (qb.y + qb.h) - player.y;

  if (fromBottom < fromLeft && fromBottom < fromRight) {
    player.y = qb.y + qb.h + 2; // pushed down
  } else if (fromLeft < fromRight) {
    player.x = qb.x - player.size; // pushed left
  } else {
    player.x = qb.x + qb.w; // pushed right
  }
}

//Obstacles Collision
for (const o of obstacles) {
  if (
    player.x < o.x + o.w &&
    player.x + player.size > o.x &&
    player.y < o.y + o.h &&
    player.y + player.size > o.y
  ) {
    if (o.reset && !roundLocked) {
      // Send player back to center
      player.x = canvas.width  / 2 - player.size / 2;
      player.y = canvas.height / 2 + 50;
      spawnParticles(player.x, player.y, "#ff8c00");
    } else if (!o.reset){
      const fromLeft   = (player.x + player.size) - o.x;
      const fromRight  = (o.x + o.w) - player.x;
      const fromTop    = (player.y + player.size) - o.y;
      const fromBottom = (o.y + o.h) - player.y;
      const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
      
      if (min === fromLeft)   player.x = o.x - player.size;
      if (min === fromRight)  player.x = o.x + o.w;
      if (min === fromTop)    player.y = o.y - player.size;
      if (min === fromBottom) player.y = o.y + o.h;
    }
  } 
}
updateAnswerZones();
checkAnswer();
}

function draw() {
  ctx.fillStyle = "#060609";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  
  drawGrid();
  drawQuestionBox(); 
  drawObstacles();
  drawZones();
  drawParticles();
  drawPlayer();
  drawScreenFlash();
  drawCountdown();
  drawScanlines();
}

function drawPlayer() {
  ctx.save();
  ctx.shadowColor = "#bf5fff";
  ctx.shadowBlur  = 28;
  ctx.fillStyle   = "rgba(191, 95, 255, 0.85)";
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth   = 2;
  ctx.strokeRect(player.x, player.y, player.size, player.size);
  ctx.restore();
}

function drawZones() { 
  const radius = 8;
  for (const[i,z] of zones.entries()) {
    
    let fillColor = "rgba(0, 0, 0, 0.75)";
    
    if(resultCorrectIndex !== null){
      if(i === resultCorrectIndex){
        fillColor = "rgba(0, 255, 100, 0.35)";
      }else if (i === resultChosenIndex && resultChosenIndex !== resultCorrectIndex){
        fillColor = "rgba(255, 40, 40, 0.35)";
      }
    }
  

    // Neon glow border
    ctx.save();
    ctx.shadowColor = z.neon;
    ctx.shadowBlur  = 20;
    ctx.strokeStyle = z.neon;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(z.x, z.y, z.w, z.h, radius);
    ctx.stroke();
    ctx.restore();

    // Dark fill - outer
    ctx.beginPath();
    ctx.roundRect(z.x, z.y, z.w, z.h, radius);
    ctx.fillStyle = fillColor;
    ctx.fill();
   

    // Label text
    ctx.save();
    ctx.font         = "11px 'Press Start 2P'";
    ctx.fillStyle    = z.neon;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor  = z.neon;
    ctx.shadowBlur   = 10;
    wrapText(currQuestion ? currQuestion.answers[i] : z.label, z.x + z.w / 2, z.y + z.h / 2, z.w - 20, 18);
    ctx.restore();
  }
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Center vertically
  const totalHeight = lines.length * lineHeight;
  let startY = y - totalHeight / 2 + lineHeight / 2;

  for (const l of lines) {
    ctx.fillText(l, x, startY);
    startY += lineHeight;
  }
}

function drawObstacles() {
  const radius = 6;

  for (const o of obstacles) {

    const color = o.reset ? "#ff8c00" : "#ff2d6f"
    // Fill
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, radius);
    ctx.fillStyle = o.reset ? "rgba(255, 140, 0 , 0.15)" : "rgba(255, 60, 60, 0.15)";
    ctx.fill();

    // Neon border
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = 16;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, radius);
    ctx.stroke();
    ctx.restore();

    if (o.reset) {
      ctx.save();
      ctx.font         = "16px 'Press Start 2P'";
      ctx.fillStyle    = "#ff8c00";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor  = "#ff8c00";
      ctx.shadowBlur   = 10;
      ctx.fillText("!", o.x + o.w / 2, o.y + o.h / 2);
      ctx.restore();
    }
  }
}

function drawQuestionBox(){

  const radius = 8;
  
  
  ctx.beginPath();
  ctx.roundRect(qb.x, qb.y, qb.w, qb.h, radius);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fill();

  // Neon border
  ctx.save();
  ctx.shadowColor = "#b700ff";
  ctx.shadowBlur  = 20;
  ctx.strokeStyle = "#b700ff";
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.roundRect(qb.x, qb.y, qb.w, qb.h, radius);
  ctx.stroke();
  ctx.restore();

  
  ctx.save();
  ctx.font         = "11px 'Press Start 2P'";
  ctx.fillStyle    = "#00ffb4";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor  = "#00ffb4";
  ctx.shadowBlur   = 10;
  wrapText(currQuestion ? currQuestion.question: "Loading....", canvas.width / 2, qb.y + qb.h / 2, qb.w - 40, 22);
  ctx.restore();

  // Timer
 ctx.save();
 ctx.font         = "10px 'Press Start 2P'";
 ctx.fillStyle    = timeLeft <= 3 ? "#ff2d6f" : "#00ffb4";
 ctx.shadowColor  = timeLeft <= 3 ? "#ff2d6f" : "#00ffb4";
 ctx.shadowBlur   = 10;
 ctx.textAlign    = "right";
 ctx.textBaseline = "middle";
 ctx.restore();
}

function drawBackground() {
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  bg.addColorStop(0, "#14002e");   // purple
  bg.addColorStop(0.35, "#061a40"); // deep blue
  bg.addColorStop(0.7, "#001f2f");  // teal/navy
  bg.addColorStop(1, "#2e003e");    // magenta-purple

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft colorful glow spots
  const glow1 = ctx.createRadialGradient(150, 180, 20, 150, 180, 260);
  glow1.addColorStop(0, "rgba(255, 45, 111, 0.25)");
  glow1.addColorStop(1, "rgba(255, 45, 111, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow2 = ctx.createRadialGradient(canvas.width - 180, canvas.height - 120, 20, canvas.width - 180, canvas.height - 120, 300);
  glow2.addColorStop(0, "rgba(0, 200, 255, 0.25)");
  glow2.addColorStop(1, "rgba(0, 200, 255, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
  const gridSize = 40;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth   = 1;

  // Vertical lines
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawScanlines() {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle   = "#000000";

  for (let y = 0; y < canvas.height; y += 3) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

  ctx.restore();
}

function spawnParticles(x,y,color){
  for (let i = 0; i < 10; i++ ){
    particles.push({
      x: x + Math.random() * 28,
      y: y + Math.random() * 28,
      vx: (Math.random() - 0.5) * 3.5,
      vy: (Math.random() - 0.5) * 3.5,
      life: 1,
      color
    })
  }
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x    += p.vx;
    p.y    += p.vy;
    p.life -= 0.035;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.life * 0.9;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = p.color;
    ctx.fillRect(p.x, p.y, p.size || 3, p.size || 3);
    ctx.restore();
  }
}

function drawCountdown() {
  if (countdown <= 0) return;

  ctx.save();
  ctx.font         = "72px 'Press Start 2P'";
  ctx.fillStyle    = "#00ffb4";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor  = "#00ffb4";
  ctx.shadowBlur   = 40;
  ctx.globalAlpha  = 0.9;
  ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function drawScreenFlash() {
  if (screenFlashAlpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = screenFlashAlpha;
  ctx.fillStyle = "#ff2d6f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function startTimer(){
  clearInterval(timerInterval);
  timeLeft = playerTimer;

  if(selectedDiff === "hard"){
    playMusic();
  }

  timerDisplay.textContent = `TIME: ${timeLeft}`;
  timerDisplay.style.color = "#00ffb4";
  timerDisplay.style.textShadow = "0 0 10px #00ffb4";
  
  timerInterval = setInterval( () => {
    if(roundLocked) return;
    timeLeft--;
    timerDisplay.textContent = `TIME: ${timeLeft}`;
    timerDisplay.style.color = timeLeft <= 3 ? "#ff2d6f" : "#00ffb4";
    timerDisplay.style.textShadow = timeLeft <= 3 ? "0 0 10px #ff2d6f" : "0 0 10px #00ffb4";
    if(currentSettings?.timerFlash && timeLeft <= 3){
      screenFlashAlpha = 0.25;
    }
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      roundLocked = true;
      if(selectedDiff === "hard"){
        stopMusic();
      }
      resultCorrectIndex = currQuestion.correct;
      resultChosenIndex = null;

      player.lives--;
      livesDisplay.textContent = `LIVES: ${player.lives}`;

      if(player.lives <= 0){
        setTimeout(()=> endGame(), 1000);
        return;
      }

      setTimeout( () => nextQuestion(), 1000);
    }
  }, 1000);
  
}

function loop(){
  if(!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

document.fonts.ready.then(() => {});