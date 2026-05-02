const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("scoreDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const playerNameInput = document.getElementById("playerName");
const difficultySelect = document.getElementById("difficulty");
const timerDisplay = document.getElementById("timerDisplay");
const endScreen = document.getElementById("endScreen");
const finalText = document.getElementById("finalText");
const restartButton = document.getElementById("restartButton");
const questionsDisplay = document.getElementById("questionsDisplay");
const rulesPopup = document.getElementById("rulesPopup");
const rulesButton = document.getElementById("rulesButton");
const themeSelect = document.getElementById("theme");

let selectedTheme ="";

let gameRunning = false;
let playerName = "";
let selectedDiff = "";

const player = {
    x: canvas.width / 2 - 14,
    y: canvas.height / 2 - 14,
    size: 28,
    speed: 3.8,
    lives: 3
};

const difficultySettings = {
  easy : {lives: 5, speed: 3.8, timer : 10 , obstacles: 4},
  medium: {lives: 4, speed: 3.8, timer: 8, obstacles: 8},
  hard: {lives : 3 , speed: 3.8, timer: 6, obstacles: 10}
}

const themeFiles ={
  general : "questions/questionsGeneral.json",
  pop: "questions/questionsPop.json",
  potter: "questions/questionsPotter.json",
  gaming: "questions/questionsGames.json"
};

startButton.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();
  selectedDiff = difficultySelect.value;
  selectedTheme = themeSelect.value;

  if(playerName === ""){
    alert("Please Enter your name!");
    return;
  }

  if(selectedDiff == ""){
    alert("Please select a difficulty!");
    return;
  }
  if(selectedTheme === ""){
    alert("Please select a theme!");
    return;
  }

  startScreen.classList.add("hidden");
  rulesPopup.classList.remove("hidden");
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
  playerNameInput.value  = "";
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
        label: labels[i],
        neon: colors[i]
      });
    }
  }

  return zones;
}

function generateObstacles() {
  const obs = [];
  const ow  = 70;
  const oh  = 70;

  // Grid auto-sizes to always fit obstacleCount
  const cols   = Math.ceil(Math.sqrt(obstacleCount * 2));
  const rows   = Math.ceil(obstacleCount / cols);
  const startY = 180;
  const cellW  = canvas.width  / cols;
  const cellH  = (canvas.height - startY) / rows;
  const pad    = 40;

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ r, c });
    }
  }

  // Fisher-Yates shuffle
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  for (let i = 0; i < obstacleCount; i++) {
    const cell  = cells[i];
    const cellX = cell.c * cellW;
    const cellY = startY + cell.r * cellH;

    const x = cellX + pad + Math.random() * Math.max(0, cellW - ow - pad * 2);
    const y = cellY + pad + Math.random() * Math.max(0, cellH - oh - pad * 2);

    obs.push({
      x: Math.floor(x),
      y: Math.floor(y),
      w: ow,
      h: oh
    });
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

async function loadQuestions() {
  try{
    const response = await fetch(themeFiles[selectedTheme]);
    questions = await response.json();

    //shuffling the questions
    for (let i = questions.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i+1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    questions = questions.slice(0,10);
    currQuestion = shuffleAnswers(questions[0]);
    zones = generateZones();
    obstacles = generateObstacles();
    questionsDisplay.textContent = `Q: 1/${questions.length}`;
    startCountdown();
  }catch(error){
    console.error("Could not load the questions", error);
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
  if(currQuestionIndex >= questions.length){
    endGame();
    return;
  }

  currQuestion = shuffleAnswers(questions[currQuestionIndex]);
  questionsDisplay.textContent= `Q: ${currQuestionIndex + 1}/${questions.length}`;
  zones = generateZones();
  obstacles = generateObstacles();
  roundLocked = false;
  resultCorrectIndex = null;
  resultChosenIndex = null;

  //Resetting the player to center
  player.x = canvas.width / 2 - player.size / 2;
  player.y = canvas.height / 2 - player.size /2;

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
  gameRunning = false;
  clearInterval(timerInterval);
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  finalText.textContent = `${playerName}, you scored ${score} point(s)!`;
}

function startGame(){
  const settings = difficultySettings[selectedDiff];
  
  gameRunning = true;

  player.lives = settings.lives;
  player.speed = settings.speed;
  playerTimer = settings.timer;
  obstacleCount = settings.obstacles;

  score = 0;
  currQuestionIndex = 0;
  roundLocked = false;
  resultCorrectIndex = null;
  resultChosenIndex = null;

  scoreDisplay.textContent = `SCORE: ${score}`;
  livesDisplay.textContent = `LIVES: ${player.lives}`;
  questionsDisplay.textContent = `Q: 1/${questions.length}`;

  player.x = canvas.width  / 2 - player.size / 2;
  player.y = canvas.height / 2 - player.size / 2;

  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  loadQuestions().then(() => loop());
}

let zones = generateZones();
let obstacles = [];
let obstacleCount = 0;
const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (["arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function update() {
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
    // Fill
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, radius);
    ctx.fillStyle = "rgba(255, 60, 60, 0.15)";
    ctx.fill();

    // Neon border
    ctx.save();
    ctx.shadowColor = "#ff2d6f";
    ctx.shadowBlur  = 16;
    ctx.strokeStyle = "#ff2d6f";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, radius);
    ctx.stroke();
    ctx.restore();
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
  ctx.fillText(currQuestion ? currQuestion.question: "Loading....", canvas.width / 2, qb.y + qb.h / 2);
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

function startTimer(){
  clearInterval(timerInterval);
  timeLeft = playerTimer;

  timerDisplay.textContent = `TIME: ${timeLeft}`;
  timerDisplay.style.color = "#00ffb4";
  timerDisplay.style.textShadow = "0 0 10px #00ffb4";
  
  timerInterval = setInterval( () => {
    if(roundLocked) return;
    timeLeft--;
    timerDisplay.textContent = `TIME: ${timeLeft}`;
    timerDisplay.style.color = timeLeft <= 3 ? "#ff2d6f" : "#00ffb4";
    timerDisplay.style.textShadow = timeLeft <= 3 ? "0 0 10px #ff2d6f" : "0 0 10px #00ffb4";
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      roundLocked = true;
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