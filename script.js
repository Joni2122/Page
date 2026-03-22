// script.js
// Partikelhintergrund + Mini Demo (robust, ohne externe Abhängigkeiten)

const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, particles = [];

function resizeCanvas(){
  W = canvas.width = innerWidth;
  H = canvas.height = Math.max(200, Math.floor(innerHeight * 0.62));
}
addEventListener('resize', () => { resizeCanvas(); initParticles(); centerPlayer(); });
resizeCanvas();

function rand(min, max){ return Math.random() * (max - min) + min; }

class Particle {
  constructor(){
    this.reset();
  }
  reset(){
    this.x = rand(0, W);
    this.y = rand(0, H);
    this.vx = rand(-0.35, 0.35);
    this.vy = rand(-0.25, 0.25);
    this.r = rand(0.6, 2.4);
    this.h = rand(160, 220);
  }
  step(){
    this.x += this.vx;
    this.y += this.vy;
    if(this.x < -10) this.x = W + 10;
    if(this.x > W + 10) this.x = -10;
    if(this.y < -10) this.y = H + 10;
    if(this.y > H + 10) this.y = -10;
  }
  draw(){
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
    g.addColorStop(0, `hsla(${this.h},100%,60%,0.9)`);
    g.addColorStop(1, `hsla(${this.h},100%,60%,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles(){
  particles = [];
  const count = Math.max(60, Math.floor((W * H) / 12000));
  for(let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

function loop(){
  ctx.clearRect(0, 0, W, H);
  for(const p of particles){ p.step(); p.draw(); }
  requestAnimationFrame(loop);
}
loop();

// Mini Demo: bewegbarer Kasten
const player = document.getElementById('player');
const area = document.getElementById('gameArea');

function centerPlayer(){
  const rect = area.getBoundingClientRect();
  // set area width responsive
  area.style.width = Math.min(900, innerWidth - 40) + 'px';
  const r = area.getBoundingClientRect();
  px = (r.width - 36) / 2;
  py = (r.height - 36) / 2;
  player.style.transform = `translate(${px}px, ${py}px)`;
}
centerPlayer();

let px = 0, py = 0;
const speed = 6;
const keys = {};

addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Touch support: tap to move player to touch position
area.addEventListener('pointerdown', (ev) => {
  const rect = area.getBoundingClientRect();
  const tx = ev.clientX - rect.left - 18;
  const ty = ev.clientY - rect.top - 18;
  // animate toward touch
  animateMoveTo(tx, ty);
});

let moveAnim = null;
function animateMoveTo(tx, ty){
  if(moveAnim) cancelAnimationFrame(moveAnim);
  function step(){
    const dx = tx - px, dy = ty - py;
    const dist = Math.hypot(dx, dy);
    if(dist < 2) return;
    const vx = (dx / dist) * Math.min(12, dist);
    const vy = (dy / dist) * Math.min(12, dist);
    px += vx; py += vy;
    clampAndApply();
    moveAnim = requestAnimationFrame(step);
  }
  step();
}

function clampAndApply(){
  const rect = area.getBoundingClientRect();
  px = Math.max(0, Math.min(px, rect.width - 36));
  py = Math.max(0, Math.min(py, rect.height - 36));
  player.style.transform = `translate(${px}px, ${py}px)`;
}

function gameTick(){
  if(keys['arrowup'] || keys['w']) py -= speed;
  if(keys['arrowdown'] || keys['s']) py += speed;
  if(keys['arrowleft'] || keys['a']) px -= speed;
  if(keys['arrowright'] || keys['d']) px += speed;
  clampAndApply();
  requestAnimationFrame(gameTick);
}
gameTick();

// Start button scrolls to demo
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
});
