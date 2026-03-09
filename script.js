/* ===== CONFIG - REPLACE THESE =====
 * Put your real links here:
 */
const CONFIG = {
  spotifyUrl: "https://open.spotify.com/playlist/2OH5uA1XF39Ehe2Zzl1cet?si=3190b6ebe938408e",
  mapsUrl: "https://maps.app.goo.gl/SzGQtX2s7pvHX6De6",
  playlistLabel: "Our Festival Playlist"
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

/* Confetti: short burst (one-time) */
(function confettiBurst(){
  // don't run confetti if user is on data-saver or reduced-motion
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
    // remove after animation
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

/* Beer counter (local only) */
let beerCount = parseInt(localStorage.getItem('beerCount') || "0",10);
const beerEl = document.getElementById('beerCount');
animateNumber(beerEl, 0, beerCount);

document.getElementById('addBeer').addEventListener('click', ()=>{
  const old = beerCount;
  beerCount = Math.min(9999, beerCount + 1);
  localStorage.setItem('beerCount', beerCount);
  animateNumber(beerEl, old, beerCount, 450);
});
document.getElementById('resetBeer').addEventListener('click', ()=>{
  beerCount = 0; localStorage.setItem('beerCount',0); animateNumber(beerEl, 0, 0);
});

/* Scan counter (local pseudo-counter) */
let scans = parseInt(localStorage.getItem('scanCounter') || '0', 10);
if (!scans) {
  // first-time install: random seed to look organic
  scans = Math.floor(Math.random()*250) + 60;
}
scans += 1; // increment per visit
localStorage.setItem('scanCounter', scans);
const scanEl = document.getElementById('scanCounter');
animateNumber(scanEl, scans - 1, scans, 800);
scanEl.textContent = `#${scans}`;

/* Header CTA links */
const navBtn = document.getElementById('navToMap');
const spotifyBtn = document.getElementById('openPlaylist');
const spotifyLink = document.getElementById('spotifyLink');

navBtn.href = CONFIG.mapsUrl;
spotifyBtn.href = CONFIG.spotifyUrl;
spotifyLink.href = CONFIG.spotifyUrl;
spotifyBtn.textContent = CONFIG.playlistLabel;
spotifyLink.textContent = CONFIG.playlistLabel;

/* Share button (mobile share / fallback copy) */
document.getElementById('shareBtn').addEventListener('click', async ()=>{
  const url = location.href;
  try {
    if (navigator.share) {
      await navigator.share({title: document.title, text:"Find our camp!", url});
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

async function loadScanCount(){

const response = await fetch(
"https://derannson.goatcounter.com/counter/TOTAL.json"
);

const data = await response.json();

document.getElementById("scanCounter").textContent = "#" + data.count;

}

loadScanCount();
