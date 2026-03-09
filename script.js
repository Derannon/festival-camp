/* ===== CONFIG ===== */
const CONFIG = {
  spotifyUrl: "https://open.spotify.com/playlist/2OH5uA1XF39Ehe2Zzl1cet?si=3190b6ebe938408e",
  mapsUrl: "https://maps.app.goo.gl/SzGQtX2s7pvHX6De6",
  playlistLabel: "Our Festival Playlist",

  goatCounter: "https://festival-camp.goatcounter.com",

  /* CounterAPI v2 */
  globalBeerGet:  "https://api.counterapi.dev/v2/outdrink/beer",
  globalBeerUp:   "https://api.counterapi.dev/v2/outdrink/beer/up",
  dailyBeerGet:   "https://api.counterapi.dev/v2/outdrink/beer-today",
  dailyBeerUp:    "https://api.counterapi.dev/v2/outdrink/beer-today/up"
};
/* ===== END CONFIG ===== */

/* Utilities */
function animateNumber(el, from, to, ms = 700) {
  const start = performance.now();
  const diff = to - from;
  function step(now) {
    const t = Math.min(1, (now - start) / ms);
    const cur = Math.floor(from + diff * t);
    el.textContent = cur;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = to;
  }
  requestAnimationFrame(step);
}

function getNumberFromEl(el) {
  if(!el) return 0;
  const txt = el.textContent || "";
  const digits = txt.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/* Confetti */
(function confettiBurst(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const container = document.getElementById('confetti-container');
  if (!container) return;
  const colors = ['#ffd000','#ff4d8b','#00e5ff','#7cff6b'];
  const count = 28;
  for(let i=0;i<count;i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = (10 + Math.random()*80) + '%';
    piece.style.top = (-10 - Math.random()*30) + 'px';
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.transform = `rotate(${Math.random()*360}deg)`;
    piece.style.width = (6 + Math.random()*10) + 'px';
    piece.style.height = (6 + Math.random()*10) + 'px';
    piece.style.animationDuration = (900 + Math.random()*700) + 'ms';
    container.appendChild(piece);
    setTimeout(()=> piece.remove(), 2500);
  }
})();

/* Game logic */
const games = [
  "Everyone drinks!",
  "You drink twice.",
  "Bring our camp a beer.",
  "Find a stranger and cheers.",
  "Shot time — DJ picks the song.",
  "Dance battle — loser drinks.",
  "Water break (boring).",
  "Group cheers — bottoms up!"
];
document.getElementById('gameBtn').addEventListener('click', ()=>{
  const r = games[Math.floor(Math.random()*games.length)];
  const el = document.getElementById('gameResult');
  el.textContent = r;
  el.classList.add('pop');
  setTimeout(()=> el.classList.remove('pop'), 900);
});

/* Local Beer Counter */
let beerCount = parseInt(localStorage.getItem('beerCount') || "0",10);
const beerEl = document.getElementById('beerCount');
animateNumber(beerEl, 0, beerCount);

document.getElementById('addBeer').addEventListener('click', async ()=>{
  const old = beerCount;
  beerCount = Math.min(9999, beerCount + 1);
  localStorage.setItem('beerCount', beerCount);
  animateNumber(beerEl, old, beerCount, 450);

  // Global + daily counters
  incrementGlobalBeer();
  incrementDailyBeer();
});

document.getElementById('resetBeer').addEventListener('click', ()=>{
  beerCount = 0;
  localStorage.setItem('beerCount',0);
  animateNumber(beerEl, 0, 0);
});

/* CounterAPI v2 functions */
async function loadGlobalBeerCount(){
  try {
    const res = await fetch(CONFIG.globalBeerGet);
    const json = await res.json();
    const newVal = (json && json.data && typeof json.data.up_count === 'number')
      ? json.data.up_count : 0;
    const el = document.getElementById("globalBeerCount");
    const cur = getNumberFromEl(el);
    animateNumber(el, cur, newVal, 700);
    setTimeout(()=> el.textContent = newVal, 700);
  } catch(e) {
    console.error("loadGlobalBeerCount error", e);
  }
}

async function loadDailyBeerCount(){
  try {
    const res = await fetch(CONFIG.dailyBeerGet);
    const json = await res.json();
    const newVal = (json && json.data && typeof json.data.up_count === 'number')
      ? json.data.up_count : 0;
    const el = document.getElementById("todayBeerCount");
    const cur = getNumberFromEl(el);
    animateNumber(el, cur, newVal, 700);
    setTimeout(()=> el.textContent = newVal, 700);
  } catch(e) {
    console.error("loadDailyBeerCount error", e);
  }
}

async function incrementGlobalBeer(){
  try {
    const res = await fetch(CONFIG.globalBeerUp);
    const json = await res.json();
    const newVal = (json && json.data && typeof json.data.up_count === 'number')
      ? json.data.up_count : null;
    if(newVal!==null){
      const el = document.getElementById("globalBeerCount");
      const cur = getNumberFromEl(el);
      animateNumber(el, cur, newVal, 500);
      setTimeout(()=> el.textContent = newVal, 500);
    }
  } catch(e) { console.error("incrementGlobalBeer error", e); }
}

async function incrementDailyBeer(){
  try {
    const res = await fetch(CONFIG.dailyBeerUp);
    const json = await res.json();
    const newVal = (json && json.data && typeof json.data.up_count === 'number')
      ? json.data.up_count : null;
    if(newVal!==null){
      const el = document.getElementById("todayBeerCount");
      const cur = getNumberFromEl(el);
      animateNumber(el, cur, newVal, 500);
      setTimeout(()=> el.textContent = newVal, 500);
    }
  } catch(e) { console.error("incrementDailyBeer error", e); }
}

/* GoatCounter scan counter */
async function loadScanCount(){
  const scanEl = document.getElementById("scanCounter");
  if(!scanEl) return;
  try {
    const url = CONFIG.goatCounter + "/counter/TOTAL.json";
    const response = await fetch(url);
    const data = await response.json();
    let count = parseInt((data.count || "0").toString().replace(/,/g,''),10);
    if(isNaN(count)) count = 0;
    animateNumber(scanEl, 0, count, 900);
    setTimeout(()=> scanEl.textContent = "#" + count,900);
  } catch(err){
    console.error("Scan counter error:", err);
    scanEl.textContent = "#0";
  }
}
loadScanCount();

/* Header links */
document.getElementById('navToMap').href = CONFIG.mapsUrl;
document.getElementById('openPlaylist').href = CONFIG.spotifyUrl;
document.getElementById('spotifyLink').href = CONFIG.spotifyUrl;
document.getElementById('openPlaylist').textContent = CONFIG.playlistLabel;
document.getElementById('spotifyLink').textContent = CONFIG.playlistLabel;

/* Share button */
document.getElementById('shareBtn').addEventListener('click', async ()=>{
  const url = location.href;
  try{
    if(navigator.share){
      await navigator.share({title: document.title, text:"Find our camp!", url});
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard — share it in the group chat 🎉');
    }
  } catch(e){
    alert('Could not share — try copying the link: ' + url);
  }
});

/* Accessibility focus */
(function accessibleFocus(){
  document.addEventListener('keyup', (e)=> {
    if(e.key==='Tab') document.body.classList.add('show-focus');
  });
})();

/* Initial load */
loadGlobalBeerCount();
loadDailyBeerCount();
