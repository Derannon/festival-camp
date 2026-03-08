
// Trinkspiel Generator

const games = [

"Everyone drinks",
"You drink twice",
"Bring our camp a beer",
"Find a stranger and cheers",
"Shot time",
"Dance battle",
"Water break",
"DJ chooses next song"

];

function drinkGame(){

const result = games[Math.floor(Math.random()*games.length)];

document.getElementById("gameResult").innerText = result;

}



// Bier Counter

let beerCount = localStorage.getItem("beerCount") || 0;

document.getElementById("beerCount").innerText = beerCount;

function addBeer(){

beerCount++;

localStorage.setItem("beerCount", beerCount);

document.getElementById("beerCount").innerText = beerCount;

}



// Scan Counter

let scans = localStorage.getItem("scanCounter");

if(!scans){

scans = Math.floor(Math.random()*150)+50;

}

scans++;

localStorage.setItem("scanCounter", scans);

document.getElementById("scanCounter").innerText = "Scan #" + scans;



// Party Konfetti

setTimeout(()=>{

for(let i=0;i<40;i++){

let conf = document.createElement("div");

conf.className="confetti";

document.body.appendChild(conf);

}

},1000);
