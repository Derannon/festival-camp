/* ===== CONFIG - REPLACE THESE ===== */
const CONFIG = {
  spotifyUrl: "https://open.spotify.com/playlist/2OH5uA1XF39Ehe2Zzl1cet?si=3190b6ebe938408e",
  mapsUrl: "https://maps.app.goo.gl/SzGQtX2s7pvHX6De6",
  playlistLabel: "Our Festival Playlist",

  /* GoatCounter domain */
  goatCounter: "https://festival-camp.goatcounter.com",

  /* CounterAPI Config */
  counterNamespace: "outdrink-camp-2026", // Dein eindeutiger Projektname
  globalBeerKey: "global-beer"
};
/* ===== END CONFIG ===== */


/* Utilities */
function animateNumber(el, from, to, ms = 700) {
  const start = performance.now();
  const diff = to - from;
  if (diff === 0) { el.textContent = to; return; }
  function step(now) {
    const t = Math.min(1, (now - start) / ms);
    const cur = Math.floor(from + diff * t);
    el.textContent = cur;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = to;
  }
  requestAnimationFrame(step);
}

// Helfer-Funktion für das heutige Datum (z.B. "daily-beer-2026-3-9")
function getTodayKey() {
  const today = new Date();
  return `daily-beer-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}


/* Confetti: short burst (one-time) */
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


/* === COUNTER API LOGIC === */

// Universelle Funktion: Standardmäßig wird gelesen. Wenn action = "/up", wird hochgezählt.
async function fetchCounter(key, action = "") {
  const url = `https://api.counterapi.dev/v1/${CONFIG.counterNamespace}/${key}${action}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.count;
  } catch (e) {
    console.error(`Fehler beim Abrufen von ${key}:`, e);
    return null; // Im Fehlerfall null zurückgeben
  }
}

// 1. Beim Seitenaufruf: Werte NUR LESEN und animieren
async function loadGlobalCounters() {
  const globalEl = document.getElementById("globalBeerCount");
  const dailyEl = document.getElementById("todayBeerCount");

  // Zeige "Lade..." an, während die Anfrage läuft
  globalEl.textContent = "Lade...";
  dailyEl.textContent = "Lade...";

  const globalCount = await fetchCounter(CONFIG.globalBeerKey);
  if (globalCount !== null) {
      globalEl.textContent = "0"; // Kurz auf 0 setzen, damit die Animation sauber startet
      animateNumber(globalEl, 0, globalCount, 700);
  } else {
      globalEl.textContent = "Fehler";
  }

  const dailyCount = await fetchCounter(getTodayKey());
  if (dailyCount !== null) {
      dailyEl.textContent = "0";
      animateNumber(dailyEl, 0, dailyCount, 700);
  } else {
      dailyEl.textContent = "Fehler";
  }
}

/* Beer counter (Lokaler Klick & Globales Update) */
let beerCount = parseInt(localStorage.getItem('beerCount') || "0", 10);
const beerEl = document.getElementById('beerCount');
animateNumber(beerEl, 0, beerCount);

document.getElementById('addBeer').addEventListener('click', async (e) => {
  const btn = e.target;
  
  // Verhindere mehrfache Klicks, während noch geladen wird
  if (btn.disabled) return;
  
  // Setze Button auf Lade-Status
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "Lade...";

  // Lokales Update (sofortiges visuelles Feedback für den eigenen Counter)
  const old = beerCount;
  beerCount = Math.min(9999, beerCount + 1);
  localStorage.setItem('beerCount', beerCount);
  animateNumber(beerEl, old, beerCount, 450);

  // 2. Beim Klick: Werte HOCHZÄHLEN ("/up"). 
  // Die API gibt dabei automatisch den brandaktuellen Gesamtstand zurück!
  const newGlobal = await fetchCounter(CONFIG.globalBeerKey, "/up");
  const newDaily = await fetchCounter(getTodayKey(), "/up");

  const globalEl = document.getElementById("globalBeerCount");
  const dailyEl = document.getElementById("todayBeerCount");

  // Animierter Übergang von der vorherigen angezeigten Zahl zur neuen, echten Zahl
  if (newGlobal !== null) {
      const currentDisplayedGlobal = parseInt(globalEl.textContent) || 0;
      animateNumber(globalEl, currentDisplayedGlobal, newGlobal, 500);
  }
  if (newDaily !== null) {
      const currentDisplayedDaily = parseInt(dailyEl.textContent) || 0;
      animateNumber(dailyEl, currentDisplayedDaily, newDaily, 500);
  }

  // Button wieder freigeben
  btn.textContent = originalText;
  btn.disabled = false;
});

document.getElementById('resetBeer').addEventListener('click', ()=>{
  beerCount = 0;
  localStorage.setItem('beerCount', 0);
  animateNumber(beerEl, 0, 0);
});


/* REAL Scan Counter using GoatCounter */
async function loadScanCount(){
  const scanEl = document.getElementById("scanCounter");
  if(!scanEl) return;

  try {
    const url = CONFIG.goatCounter + "/counter/TOTAL.json";
    const response = await fetch(url);
    const data = await response.json();

    let count = data.count || "0";
    count = parseInt(count.toString().replace(/,/g,''), 10);
    if(isNaN(count)) count = 0;

    animateNumber(scanEl, 0, count, 900);
    setTimeout(()=>{ scanEl.textContent = "#" + count; }, 900);
  }
  catch(err){
    console.error("Scan counter error:", err);
    scanEl.textContent = "#0";
  }
}


/* Header CTA links */
const navBtn = document.getElementById('navToMap');
const spotifyBtn = document.getElementById('openPlaylist');
const spotifyLink = document.getElementById('spotifyLink');

navBtn.href = CONFIG.mapsUrl;
spotifyBtn.href = CONFIG.spotifyUrl;
spotifyLink.href = CONFIG.spotifyUrl;

spotifyBtn.textContent = CONFIG.playlistLabel;
spotifyLink.textContent = CONFIG.playlistLabel;


/* Share button */
document.getElementById('shareBtn').addEventListener('click', async ()=>{
  const url = location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, text: "Find our camp!", url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard — share it in the group chat 🎉');
    }
  } catch(e){
    alert('Could not share — try copying the link: ' + url);
  }
});


/* Accessibility improvements */
(function accessibleFocus(){
  document.addEventListener('keyup', (e)=> {
    if (e.key === 'Tab') document.body.classList.add('show-focus');
  });
})();

// INIT: Zähler beim Laden der Seite abrufen
loadScanCount();
loadGlobalCounters();
