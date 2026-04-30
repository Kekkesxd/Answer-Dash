const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const livesDisplay = document.getElementById("livesDisplay");

const player = {
    x: canvas.width / 2 - 14,
    y: canvas.height / 2 - 14,
    size: 28,
    speed: 3.8,
    lives: 3
};


// Collide with question box
const qb = { x: 50, y: 20, w: canvas.width - 100, h: 110 };

let questions = [];
let currQuestion = null;
let currQuestionIndex = 0;
let roundLocked = false;

//To visualise feedback on answers
let resultCorrectIndex = null;
let resultChosenIndex = null;

let score = 0;

function generateZones() {
  const cols = 2;
  const rows = 2;
  const topOffset = 160;
  const outerPad = 40;   // padding from canvas edges
  const innerPad = 150;  // padding from the center dividing lines
  const zw = 200;
  const zh = 80;

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

async function loadQuestions() {
  try{
    const response = await fetch("questions.json");
    questions = await response.json();
    currQuestion = questions[0];
    zones = generateZones();
  }catch(error){
    console.error("Could not load the questions", error);
  }
}
function checkAnswer() {
  if (roundLocked) return;

  for (const [i, z] of zones.entries()) {
    if (
      player.x < z.x + z.w &&
      player.x + player.size > z.x &&
      player.y < z.y + z.h &&
      player.y + player.size > z.y
    ) {
      roundLocked = true;
      resultCorrectIndex = currQuestion.correct;
      resultChosenIndex = i;


      if( i === currQuestion.correct){
        score++;
        scoreDisplay.textContent = `SCORE: ${score}`;
      }else{
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
    console.log("Game Over - out of questions");
    return;
  }

  currQuestion = questions[currQuestionIndex];
  zones = generateZones();
  roundLocked = false;
  resultCorrectIndex = null;
  resultChosenIndex = null;

  //Resetting the player to center
  player.x = canvas.width / 2 - player.size / 2;
  player.y = canvas.height / 2 - player.size /2;
}

function endGame(){
  console.log(`Game Over! Final score: ${score}`);
}

let zones = generateZones();
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
  if (keys["arrowup"]    || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"]  || keys["s"]) player.y += player.speed;
  if (keys["arrowleft"]  || keys["a"]) player.x -= player.speed; 
  if (keys["arrowright"] || keys["d"]) player.x += player.speed; 


  //keeping the player in boundary
  player.x = Math.max(0, Math.min(canvas.width  - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));



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

checkAnswer();
}

function draw() {
  ctx.fillStyle = "#060609";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawQuestionBox();
  drawZones();
  drawPlayer();
}

function drawPlayer() {
  ctx.save();
  ctx.shadowColor = "#bf5fff";
  ctx.shadowBlur  = 28;
  ctx.fillStyle   = "rgba(191, 95, 255, 0.8)";
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth   = 2;
  ctx.strokeRect(player.x, player.y, player.size, player.size);
  ctx.restore();
}

function drawZones() { 
  const radius = 8;
  for (const[i,z] of zones.entries()) {
    
    let fillColor = "rgba(0, 0, 0, 0.4)";
    
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

    // Dark fill

    ctx.beginPath();
    ctx.roundRect(z.x, z.y, z.w, z.h, radius);
    ctx.fillStyle = fillColor;
    ctx.fill();
   

    // Label text
    ctx.save();
    ctx.font         = "9px 'Press Start 2P'";
    ctx.fillStyle    = z.neon;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor  = z.neon;
    ctx.shadowBlur   = 10;
    ctx.fillText(currQuestion ? currQuestion.answers[i] : z.label, z.x + z.w / 2, z.y + z.h / 2);
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
}


function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

document.fonts.ready.then(() => { loadQuestions().then(() => loop());
});