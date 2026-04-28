const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: canvas.width / 2 - 14,
    y: canvas.height / 2 - 14,
    size: 28,
    speed: 3.8
};

function generateZones() {
  const cols = 2;
  const rows = 2;
  const topOffset = 160;
  const outerPad = 60;   // padding from canvas edges
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

  // Collide with question box
const qb = { x: 50, y: 20, w: canvas.width - 100, h: 110 };

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
}

function draw() {
  ctx.fillStyle = "#060609";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawZones();
  drawQuestionBox();
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
  for (const z of zones) {
    // Neon glow border
    ctx.save();
    ctx.shadowColor = z.neon;
    ctx.shadowBlur  = 20;
    ctx.strokeStyle = z.neon;
    ctx.lineWidth   = 2;
    ctx.strokeRect(z.x, z.y, z.w, z.h);
    ctx.restore();

    // Dark fill
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(z.x, z.y, z.w, z.h);

    // Label text
    ctx.save();
    ctx.font         = "9px 'Press Start 2P'";
    ctx.fillStyle    = z.neon;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor  = z.neon;
    ctx.shadowBlur   = 10;
    ctx.fillText(z.label, z.x + z.w / 2, z.y + z.h / 2);
    ctx.restore();
  }
}

function drawQuestionBox(){
    const qb = {
        x: 50,
        y:20,
        w: canvas.width - 100,
        h:110
    };

    ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(qb.x, qb.y, qb.w, qb.h);

  // Neon border
  ctx.save();
  ctx.shadowColor = "#00ffb4";
  ctx.shadowBlur  = 20;
  ctx.strokeStyle = "#00ffb4";
  ctx.lineWidth   = 2;
  ctx.strokeRect(qb.x, qb.y, qb.w, qb.h);
  ctx.restore();

  
  ctx.save();
  ctx.font         = "11px 'Press Start 2P'";
  ctx.fillStyle    = "#00ffb4";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor  = "#00ffb4";
  ctx.shadowBlur   = 10;
  ctx.fillText("QUESTION GOES HERE", canvas.width / 2, qb.y + qb.h / 2);
  ctx.restore();
}

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

document.fonts.ready.then(() => loop());