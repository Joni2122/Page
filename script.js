<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ClickerX — Mega Clicker</title>
  <style>
    :root{
      --bg:#0b1220; --card:#0f1724; --accent:#00e6ff; --accent2:#9b59ff;
      --muted:#9aa4b2; --glass: rgba(255,255,255,0.03);
    }
    *{box-sizing:border-box}
    html,body{height:100%;margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,Arial;background:linear-gradient(180deg,#071022,#07102a);color:#e6eef6}
    .wrap{max-width:1100px;margin:28px auto;padding:20px}
    header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
    h1{margin:0;font-size:20px}
    .top-stats{display:flex;gap:12px;align-items:center}
    .stat{background:var(--card);padding:10px 14px;border-radius:10px;color:var(--muted);font-size:14px}
    .big{font-size:28px;color:#fff;font-weight:700}
    .layout{display:grid;grid-template-columns:360px 1fr;gap:16px}
    .panel{background:var(--card);padding:14px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.4)}
    #clickerArea{display:flex;flex-direction:column;align-items:center;gap:12px}
    #bigBtn{width:260px;height:260px;border-radius:50%;background:linear-gradient(145deg,var(--accent),var(--accent2));border:none;color:#001;font-size:22px;font-weight:800;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center}
    #bigBtn:active{transform:scale(0.98)}
    .mini{display:flex;gap:8px;align-items:center}
    .controls{display:flex;gap:8px;flex-wrap:wrap}
    .btn{background:var(--glass);border:1px solid rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px;color:var(--muted);cursor:pointer}
    .btn.primary{background:linear-gradient(90deg,var(--accent),var(--accent2));color:#001;font-weight:700}
    .shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
    .item{background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.03);display:flex;flex-direction:column;gap:8px}
    .item .row{display:flex;justify-content:space-between;align-items:center}
    .item .name{font-weight:700}
    .cost{color:var(--muted);font-size:13px}
    .count{color:var(--accent);font-weight:700}
    .log{height:120px;overflow:auto;background:rgba(0,0,0,0.2);padding:8px;border-radius:8px;color:var(--muted);font-size:13px}
    footer{margin-top:18px;text-align:center;color:var(--muted);font-size:13px}
    .search{display:flex;gap:8px;margin-bottom:10px}
    input[type="search"]{flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03);background:transparent;color:#fff}
    .small{font-size:12px;color:var(--muted)}
    @media (max-width:900px){ .layout{grid-template-columns:1fr; } #bigBtn{width:200px;height:200px} }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>ClickerX — Mega Clicker</h1>
      <div class="top-stats">
        <div class="stat">Gesamt: <div id="totalDisplay" class="big">0</div></div>
        <div class="stat">CPS: <div id="cpsDisplay" class="big">0</div></div>
      </div>
    </header>

    <div class="layout">
      <div class="panel" id="clickerPanel">
        <div id="clickerArea">
          <button id="bigBtn">KLICK</button>
          <div class="mini">
            <div class="small">Pro Klick: <span id="perClick">1</span></div>
            <div class="small">Bonus: <span id="bonus">0</span></div>
          </div>
          <div class="controls">
            <button class="btn" id="saveBtn">Speichern</button>
            <button class="btn" id="loadBtn">Laden</button>
            <button class="btn" id="resetBtn">Reset</button>
            <button class="btn primary" id="buyMaxBtn">Buy Max</button>
          </div>
          <div style="width:100%;margin-top:8px">
            <div class="small">Log</div>
            <div id="log" class="log"></div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="display:flex;gap:8px;align-items:center">
            <div class="small">Shop</div>
            <div class="small" id="ownedSummary"></div>
          </div>
          <div class="search">
            <input id="filter" type="search" placeholder="Suche Addon (Name oder #)" />
            <button class="btn" id="sortBtn">Sort: Preis</button>
          </div>
        </div>

        <div id="shop" class="shop"></div>
      </div>
    </div>

    <footer>
      <div class="small">Speichert automatisch. Hotkeys: Leertaste = Klick, M = Buy Max, S = Save, L = Load, R = Reset</div>
    </footer>
  </div>

  <script src="game.js"></script>
</body>
</html>
