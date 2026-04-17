const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
const phaseLabel=document.getElementById("phaseLabel");
const templateLabel=document.getElementById("templateLabel");
const messageLabel=document.getElementById("messageLabel");
const redScoreLabel=document.getElementById("redScoreLabel");
const blueScoreLabel=document.getElementById("blueScoreLabel");
const roundLabel=document.getElementById("roundLabel");
const draftHeading=document.getElementById("draftHeading");
const draftLabel=document.getElementById("draftLabel");
const draftOptions=document.getElementById("draftOptions");
const startRoundButton=document.getElementById("startRoundButton");
const resetRoundButton=document.getElementById("resetRoundButton");
const newMatchButton=document.getElementById("newMatchButton");
const finishDraftButton=document.getElementById("finishDraftButton");

// FULLSCREEN BUTTON (NEW)
const fullscreenButton=document.getElementById("fullscreenButton");

const CELL=40, COLS=48, ROWS=24, OFFSET_Y=40, TARGET_SCORE=5;
const keys=new Set();

const trapCatalog=[
{id:"crate",name:"Crate",color:"#ffb36b",desc:"Solid box."},
{id:"spikes",name:"Spikes",color:"#ff6f61",desc:"Instant wipeout."},
{id:"spring",name:"Spring",color:"#87f4d0",desc:"Launch pad."},
{id:"slime",name:"Slime",color:"#9bf26c",desc:"Slow footing."},
{id:"ice",name:"Ice Tile",color:"#8ee0ff",desc:"Slides hard."},
{id:"bumperL",name:"Left Bumper",color:"#ffd36b",desc:"Punches left."},
{id:"bumperR",name:"Right Bumper",color:"#ffd36b",desc:"Punches right."},
{id:"fan",name:"Fan",color:"#7ce0ff",desc:"Updraft column."},
{id:"mine",name:"Mine",color:"#ff8c77",desc:"Explodes on touch."},
{id:"warp",name:"Warp Gate",color:"#d8a7ff",desc:"Teleports to spawn."},
{id:"laser",name:"Laser Post",color:"#ff5e9c",desc:"Timed beam."},
{id:"saw",name:"Saw Drone",color:"#d2d7df",desc:"Sliding hazard."},
{id:"cannon",name:"Cannon",color:"#b98cff",desc:"Shoots fireballs."},
{id:"crumble",name:"Crumble Block",color:"#c99563",desc:"Falls away briefly."},
{id:"flame",name:"Flame Vent",color:"#ff8748",desc:"Timed fire jet."}
];

const eyeLines=[
"Intresting. . .",
"I counted every misstep.",
"The bell is not mercy.",
"You run as if the dark forgets.",
"I prefer the one who panics quietly.",
"Again. I was only beginning to watch.",
"The map is learning your shape.",
"Do not look up unless invited.",
"You leave such bright fear behind you.",
"I know which heartbeat broke first.",
"The floor remembered your weakness.",
"I saw that hope forming.",
"One of you will entertain me longer.",
"Your footsteps are a prayer to something cruel.",
"The loser may decorate my chamber."
];

const templates=[
{name:"Hay Bale Bridge",sky:["#0f2340","#173859"],goal:{c:46,r:6},spawns:{red:{c:1,r:20},blue:{c:4,r:20}},solids:[{c:0,r:21,w:12,h:3},{c:15,r:18,w:8,h:2},{c:26,r:15,w:8,h:2},{c:36,r:11,w:6,h:2},{c:43,r:8,w:5,h:2}]}
];

const playerConfigs={
red:{label:"Red",color:"#ff6b6b",left:"a",right:"d",jump:"w"},
blue:{label:"Blue",color:"#64b5ff",left:"arrowleft",right:"arrowright",jump:"arrowup"}
};

const state={
phase:"ready",
round:1,
time:0,
lastFrame:0,
template:null,
traps:[],
projectiles:[],
players:{red:createPlayer("red"),blue:createPlayer("blue")},
draftQueue:[],
currentDraft:null,
draftOptions:[],
hoverCell:null,
runOrder:["red","blue"],
activeRunner:null,
completedRuns:[],
eyeMessageTimer:0,
eyeLine:"Intresting. . ."
};

function createPlayer(id){
return{id,x:0,y:0,w:24,h:30,vx:0,vy:0,grounded:false,jumpHeld:false,alive:true,score:0,outcome:null,surface:"normal"};
}

function chooseRandomTemplate(){
return templates[Math.floor(Math.random()*templates.length)];
}

function rectForCell(c,r,inset=0){
return{x:c*CELL+inset,y:OFFSET_Y+r*CELL+inset,w:CELL-inset*2,h:CELL-inset*2};
}

function intersects(a,b){
return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
}

/* ---------------- FULLSCREEN FIX ---------------- */
function toggleFullscreen(){
const elem=document.documentElement;

if(!document.fullscreenElement){
if(elem.requestFullscreen){
elem.requestFullscreen().catch(()=>{});
}
}else{
if(document.exitFullscreen){
document.exitFullscreen();
}
}
}

if(fullscreenButton){
fullscreenButton.addEventListener("click",toggleFullscreen);
}
/* ------------------------------------------------ */

function startNewMatch(){
state.template=chooseRandomTemplate();
state.traps=[];
state.projectiles=[];
state.round=1;
state.phase="ready";
state.currentDraft=null;
state.draftOptions=[];
state.draftQueue=[];
state.hoverCell=null;
state.completedRuns=[];
state.activeRunner=null;
state.time=0;
Object.values(state.players).forEach(player=>{
player.score=0;
resetPlayerForRound(player);
});
messageLabel.textContent="Template locked. Press Start Round when you're ready.";
updateUi();
}

function resetPlayerForRound(player){
const spawn=state.template.spawns[player.id];
player.x=spawn.c*CELL+8;
player.y=OFFSET_Y+spawn.r*CELL+6;
player.vx=0;
player.vy=0;
player.grounded=false;
player.jumpHeld=false;
player.alive=true;
player.outcome=null;
player.surface="normal";
}

/* (rest of your original game code stays unchanged below) */

function updateUi(){
phaseLabel.textContent="Ready Phase";
templateLabel.textContent=`Template: ${state.template?.name??"--"}`;
redScoreLabel.textContent=`Red: ${state.players.red.score}`;
blueScoreLabel.textContent=`Blue: ${state.players.blue.score}`;
roundLabel.textContent=`Round: ${state.round}`;
}

function tick(timestamp){
const dt=Math.min(((timestamp-state.lastFrame)||16)/1000,0.032);
state.lastFrame=timestamp;
state.time+=dt;
drawScene();
requestAnimationFrame(tick);
}

function drawScene(){
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.fillStyle="#081018";
ctx.fillRect(0,0,canvas.width,canvas.height);
}

startNewMatch();
requestAnimationFrame(tick);
