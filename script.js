const games = [

"Everyone drinks!",
"You must bring our camp a beer.",
"Find a stranger and cheers.",
"Shot time.",
"DJ chooses next song.",
"You drink twice.",
"Water break (boring).",
"Group cheers."

];

function drinkGame(){

let result = games[Math.floor(Math.random()*games.length)];

document.getElementById("gameResult").innerText = result;

}

// Fake scan counter
let scans = localStorage.getItem("scanCount");

if(!scans){

scans = Math.floor(Math.random()*200)+50;

}

scans++;

localStorage.setItem("scanCount", scans);

document.getElementById("counter").innerText = "#" + scans;
