// game.js — Red Button Pro (korrigiert)
// Klick zählt zuverlässig; Anzeige zeigt Dezimalstellen bei kleinen Werten

// --- State ---
let state = {
  total: 0,
  cookies: 0,
  perClick: 1,
  bonus: 0,
  cps: 0,
  items: [],
  lastTick: Date.now()
};

const SHOP_COUNT = 100;
const SAVE_KEY = 'clickerx_red_v2';

// --- Helpers ---
function fmtShort(n){
  if(n >= 1e12) return (n/1e12).toFixed(2)+'T';
  if(n >= 1e9) return (n/1e9).toFixed(2)+'B';
  if(n >= 1e6) return (n/1e6).toFixed(2)+'M';
  if(n >= 1e3) return (n/1e3).toFixed(2)+'k';
  return Math.floor(n).toString();
}
// präzise Anzeige: wenn <1000 zeige 2 Dezimalstellen, sonst abgekürzt
function fmtDisplay(n){
  if(n < 1000) return Number(n).toFixed(2);
  return fmtShort(n);
}
function nowTime(){ return new Date().toLocaleTimeString(); }
function log(msg){
  const el = document.getElementById('log');
  const line = document.createElement('div');
  line.textContent = `[${nowTime()}] ${msg}`;
  el.prepend(line);
  while(el.children.length > 200) el.removeChild(el.lastChild);
}

// --- Shop generation ---
function genShop(){
  const items = [];
  for(let i=1;i<=SHOP_COUNT;i++){
    const name = `Addon #${i}`;
    const base = Math.max(5, Math.round(Math.pow(1.17, i) * (8 + i*4)));
    const cps = parseFloat((Math.pow(1.07, i) * (0.05 + i*0.04)).toFixed(3));
    items.push({ id:i, name, baseCost: base, cost: base, cps, count:0 });
  }
  return items;
}

// --- UI ---
function renderShop(filter='', sortBy='cost'){
  const shop = document.getElementById('shop');
  shop.innerHTML = '';
  let list = state.items.slice();

  if(filter){
    const f = filter.toLowerCase();
    list = list.filter(it => it.name.toLowerCase().includes(f) || String(it.id).includes(f));
  }

  if(sortBy === 'cost') list.sort((a,b)=>a.cost-b.cost);
  if(sortBy === 'cps') list.sort((a,b)=>b.cps-a.cps);
  if(sortBy === 'id') list.sort((a,b)=>a.id-b.id);

  for(const it of list){
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="row"><div class="name">${it.name}</div><div class="count">x${it.count}</div></div>
      <div class="row"><div class="cost">CPS: ${it.cps}</div><div class="cost">Preis: ${fmtDisplay(it.cost)}</div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn buyBtn" data-id="${it.id}">Kaufen</button>
        <button class="btn" data-id="${it.id}" data-action="max">Max</button>
      </div>
    `;
    shop.appendChild(div);
  }
}

function updateUI(){
  document.getElementById('totalDisplay').textContent = fmtDisplay(state.total);
  document.getElementById('cpsDisplay').textContent = state.cps.toFixed(2);
  document.getElementById('cookieDisplay').textContent = fmtDisplay(state.cookies);
  document.getElementById('perClick').textContent = state.perClick;
  document.getElementById('bonus').textContent = state.bonus;
  document.getElementById('ownedSummary').textContent = `Addons: ${state.items.reduce((s,i)=>s+i.count,0)}`;

  // update visible items quickly
  document.querySelectorAll('#shop .item').forEach(el=>{
    const name = el.querySelector('.name')?.textContent;
    const it = state.items.find(x=>x.name === name);
    if(!it) return;
    el.querySelector('.count').textContent = `x${it.count}`;
    const costEls = el.querySelectorAll('.cost');
    if(costEls.length >= 2) costEls[1].textContent = `Preis: ${fmtDisplay(it.cost)}`;
  });
}

// --- Game logic ---
function recalcCPS(){
  state.cps = state.items.reduce((s,it)=>s + it.cps * it.count, 0) + state.bonus;
}

function tick(){
  const now = Date.now();
  const dt = (now - state.lastTick) / 1000;
  if(dt > 0){
    const gain = state.cps * dt;
    state.cookies += gain;
    state.total += gain;
    state.lastTick = now;
  }
  updateUI();
  requestAnimationFrame(tick);
}

// --- Click handling with visual feedback ---
function doClick(){
  const gain = state.perClick;
  state.cookies += gain;
  state.total += gain;

  // visual feedback on button
  const bigBtn = document.getElementById('bigBtn');
  bigBtn.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.08)' },
    { transform: 'scale(1)' }
  ], { duration: 140, easing: 'cubic-bezier(.2,.8,.2,1)' });

  // floating +text
  const flash = document.createElement('div');
  flash.textContent = `+${gain}`;
  flash.style.position = 'absolute';
  flash.style.top = '18%';
  flash.style.left = '50%';
  flash.style.transform = 'translateX(-50%)';
  flash.style.color = '#fff';
  flash.style.fontWeight = '900';
  flash.style.pointerEvents = 'none';
  flash.style.textShadow = '0 2px 8px rgba(0,0,0,0.6)';
  flash.style.fontSize = '18px';
  document.getElementById('bigBtn').appendChild(flash);
  flash.animate([{opacity:1, transform:'translateY(0)'},{opacity:0, transform:'translateY(-48px)'}], {duration:700}).onfinish = ()=> flash.remove();

  log(`Klick +${gain}`);
  updateUI();
}

// --- Buying ---
function buyItem(id, qty=1){
  const it = state.items.find(x=>x.id===id);
  if(!it) return;
  let bought = 0;
  for(let i=0;i<qty;i++){
    if(state.cookies >= it.cost){
      state.cookies -= it.cost;
      it.count++;
      it.cost = Math.ceil(it.baseCost * Math.pow(1.15, it.count));
      bought++;
    } else break;
  }
  if(bought>0){
    recalcCPS();
    log(`Gekauft ${it.name} x${bought}`);
    updateUI();
  } else {
    log(`Nicht genug Cookies für ${it.name}`);
  }
}

function buyMax(id){
  const it = state.items.find(x=>x.id===id);
  if(!it) return;
  let bought = 0;
  while(state.cookies >= it.cost){
    state.cookies -= it.cost;
    it.count++;
    it.cost = Math.ceil(it.baseCost * Math.pow(1.15, it.count));
    bought++;
    if(bought > 100000) break;
  }
  if(bought>0){
    recalcCPS();
    log(`BuyMax ${it.name} x${bought}`);
    updateUI();
  } else log('BuyMax: nichts gekauft');
}

function buyMaxAll(){
  const sorted = state.items.slice().sort((a,b)=>a.cost-b.cost);
  let totalBought = 0;
  for(const it of sorted){
    while(state.cookies >= it.cost){
      state.cookies -= it.cost;
      it.count++;
      it.cost = Math.ceil(it.baseCost * Math.pow(1.15, it.count));
      totalBought++;
      if(totalBought > 100000) break;
    }
  }
  if(totalBought>0){
    recalcCPS();
    log(`BuyMaxAll: gekauft x${totalBought}`);
    updateUI();
  } else log('BuyMaxAll: nichts gekauft');
}

// --- Save / Load / Reset ---
function saveGame(){
  const data = {
    total: state.total,
    cookies: state.cookies,
    perClick: state.perClick,
    bonus: state.bonus,
    items: state.items.map(it=>({id:it.id,count:it.count,cost:it.cost}))
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  log('Spiel gespeichert');
}

function loadGame(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw){ log('Kein Save gefunden'); return; }
  try{
    const data = JSON.parse(raw);
    state.total = data.total || 0;
    state.cookies = data.cookies || 0;
    state.perClick = data.perClick || 1;
    state.bonus = data.bonus || 0;
    for(const s of data.items || []){
      const it = state.items.find(x=>x.id===s.id);
      if(it){ it.count = s.count || 0; it.cost = s.cost || it.cost; }
    }
    recalcCPS();
    renderShop();
    updateUI();
    log('Save geladen');
  }catch(e){
    log('Fehler beim Laden des Saves');
  }
}

function resetGame(){
  if(!confirm('Reset? Alle Fortschritte gehen verloren.')) return;
  state = { total:0, cookies:0, perClick:1, bonus:0, cps:0, items:[], lastTick:Date.now() };
  state.items = genShop();
  recalcCPS();
  renderShop();
  updateUI();
  localStorage.removeItem(SAVE_KEY);
  log('Spiel zurückgesetzt');
}

// --- Init & Hooks ---
let currentSort = 'cost';
function init(){
  state.items = genShop();

  // try load
  const raw = localStorage.getItem(SAVE_KEY);
  if(raw){
    try{
      const parsed = JSON.parse(raw);
      state.total = parsed.total || 0;
      state.cookies = parsed.cookies || 0;
      state.perClick = parsed.perClick || 1;
      state.bonus = parsed.bonus || 0;
      for(const s of parsed.items || []){
        const it = state.items.find(x=>x.id===s.id);
        if(it){ it.count = s.count || 0; it.cost = s.cost || it.cost; }
      }
    }catch(e){ console.warn('Save corrupt'); }
  }

  recalcCPS();
  renderShop();
  updateUI();

  // hooks
  document.getElementById('bigBtn').addEventListener('click', doClick);
  document.getElementById('saveBtn').addEventListener('click', saveGame);
  document.getElementById('loadBtn').addEventListener('click', loadGame);
  document.getElementById('resetBtn').addEventListener('click', resetGame);
  document.getElementById('buyMaxBtn').addEventListener('click', buyMaxAll);

  document.getElementById('filter').addEventListener('input', (e)=> renderShop(e.target.value, currentSort));
  document.getElementById('sortBtn').addEventListener('click', ()=>{
    if(currentSort === 'cost') currentSort = 'cps';
    else if(currentSort === 'cps') currentSort = 'id';
    else currentSort = 'cost';
    document.getElementById('sortBtn').textContent = 'Sort: ' + (currentSort === 'cost' ? 'Preis' : currentSort === 'cps' ? 'CPS' : 'ID');
    renderShop(document.getElementById('filter').value, currentSort);
  });

  // delegated shop clicks
  document.getElementById('shop').addEventListener('click', (e)=>{
    const buy = e.target.closest('.buyBtn');
    if(buy){ buyItem(parseInt(buy.dataset.id)); return; }
    const max = e.target.closest('button[data-action="max"]');
    if(max){ buyMax(parseInt(max.dataset.id)); return; }
  });

  // keyboard shortcuts
  addEventListener('keydown', (e)=>{
    if(e.code === 'Space'){ e.preventDefault(); doClick(); }
    if(e.key.toLowerCase() === 'm') buyMaxAll();
    if(e.key.toLowerCase() === 's') saveGame();
    if(e.key.toLowerCase() === 'l') loadGame();
    if(e.key.toLowerCase() === 'r') resetGame();
  });

  state.lastTick = Date.now();
  requestAnimationFrame(tick);
  setInterval(saveGame, 10000);
}

// start
init();
