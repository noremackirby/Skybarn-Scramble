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
{name:"Hay Bale Bridge",sky:["#0f2340","#173859"],goal:{c:46,r:6},spawns:{red:{c:1,r:20},blue:{c:4,r:20}},solids:[{c:0,r:21,w:12,h:3},{c:15,r:18,w:8,h:2},{c:26,r:15,w:8,h:2},{c:36,r:11,w:6,h:2},{c:43,r:8,w:5,h:2}]},
{name:"Windmill Spine",sky:["#162640","#245b7a"],goal:{c:46,r:5},spawns:{red:{c:1,r:20},blue:{c:3,r:20}},solids:[{c:0,r:21,w:10,h:3},{c:13,r:17,w:7,h:2},{c:22,r:19,w:7,h:2},{c:31,r:14,w:7,h:2},{c:39,r:10,w:5,h:2},{c:43,r:7,w:5,h:2}]},
{name:"Split Ravine",sky:["#13203c","#3a4d7a"],goal:{c:46,r:7},spawns:{red:{c:1,r:19},blue:{c:4,r:19}},solids:[{c:0,r:20,w:11,h:4},{c:15,r:17,w:7,h:2},{c:25,r:13,w:6,h:2},{c:34,r:17,w:7,h:2},{c:42,r:10,w:6,h:2}]},
{name:"Moon Silo",sky:["#10213a","#4b376c"],goal:{c:46,r:5},spawns:{red:{c:1,r:20},blue:{c:3,r:20}},solids:[{c:0,r:21,w:9,h:3},{c:12,r:18,w:7,h:2},{c:22,r:14,w:7,h:2},{c:31,r:10,w:7,h:2},{c:40,r:14,w:4,h:2},{c:43,r:8,w:5,h:2}]},
{name:"Barnstack Alley",sky:["#13263d","#406252"],goal:{c:46,r:6},spawns:{red:{c:1,r:20},blue:{c:4,r:20}},solids:[{c:0,r:21,w:12,h:3},{c:16,r:18,w:6,h:2},{c:24,r:15,w:6,h:2},{c:32,r:12,w:6,h:2},{c:40,r:9,w:8,h:2}]}
];

const playerConfigs={
red:{label:"Red",color:"#ff6b6b",left:"a",right:"d",jump:"w"},
blue:{label:"Blue",color:"#64b5ff",left:"arrowleft",right:"arrowright",jump:"arrowup"}
};

const state={phase:"ready",round:1,time:0,lastFrame:0,template:null,traps:[],projectiles:[],players:{red:createPlayer("red"),blue:createPlayer("blue")},draftQueue:[],currentDraft:null,draftOptions:[],hoverCell:null,runOrder:["red","blue"],activeRunner:null,completedRuns:[],eyeMessageTimer:0,eyeLine:"Intresting. . ."};

function createPlayer(id){return{id,x:0,y:0,w:24,h:30,vx:0,vy:0,grounded:false,jumpHeld:false,alive:true,score:0,outcome:null,surface:"normal"};}
function chooseRandomTemplate(){return templates[Math.floor(Math.random()*templates.length)];}
function chooseEyeLine(){return eyeLines[Math.floor(Math.random()*eyeLines.length)];}
function rectForCell(c,r,inset=0){return{x:c*CELL+inset,y:OFFSET_Y+r*CELL+inset,w:CELL-inset*2,h:CELL-inset*2};}
function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function canPlaceTrap(c,r){if(c<0||c>=COLS||r<0||r>=ROWS)return false;if(state.traps.some(t=>t.c===c&&t.r===r))return false;return ![state.template.goal,state.template.spawns.red,state.template.spawns.blue].some(s=>s.c===c&&s.r===r);}
function resetPlayerForRound(player){const spawn=state.template.spawns[player.id];player.x=spawn.c*CELL+8;player.y=OFFSET_Y+spawn.r*CELL+6;player.vx=0;player.vy=0;player.grounded=false;player.jumpHeld=false;player.alive=true;player.outcome=null;player.surface="normal";}
function resetAllPlayers(){Object.values(state.players).forEach(resetPlayerForRound);}
function currentRunner(){return state.activeRunner?state.players[state.activeRunner]:null;}

function startNewMatch(){state.template=chooseRandomTemplate();state.traps=[];state.projectiles=[];state.round=1;state.phase="ready";state.currentDraft=null;state.draftOptions=[];state.draftQueue=[];state.hoverCell=null;state.completedRuns=[];state.activeRunner=null;state.time=0;Object.values(state.players).forEach(player=>{player.score=0;resetPlayerForRound(player);});messageLabel.textContent="Template locked. Press Start Round when you're ready.";updateUi();renderDraftOptions();}
function resetCurrentRound(){state.projectiles=[];state.currentDraft=null;state.draftOptions=[];state.draftQueue=[];state.completedRuns=[];state.activeRunner=null;resetAllPlayers();state.phase="ready";messageLabel.textContent="Round reset. Press Start Round to race again.";renderDraftOptions();updateUi();}
function startRound(){if(!state.template||!["ready","gameover"].includes(state.phase))return;if(state.phase==="gameover"){startNewMatch();return;}state.projectiles=[];state.currentDraft=null;state.draftOptions=[];state.draftQueue=[];state.hoverCell=null;state.completedRuns=[];resetAllPlayers();state.activeRunner=state.runOrder[0];state.phase="run";messageLabel.textContent=`${playerConfigs[state.activeRunner].label} runs first. Reach the bell or survive the traps.`;updateUi();renderDraftOptions();}

function randomTrapChoices(count){const pool=[...trapCatalog],picked=[];while(pool.length&&picked.length<count)picked.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);return picked;}
function queueDraftTurn(playerId){state.draftQueue.push(playerId);}
function beginNextDraftTurn(){if(!state.draftQueue.length){state.currentDraft=null;state.draftOptions=[];state.phase="ready";state.round+=1;messageLabel.textContent=`Round over. Scoreboard stands at Red ${state.players.red.score} - Blue ${state.players.blue.score}.`;renderDraftOptions();updateUi();return;}const playerId=state.draftQueue.shift();state.currentDraft={playerId,trapId:null,placementsLeft:1,placed:0};state.draftOptions=randomTrapChoices(3);state.phase="draft-select";draftHeading.textContent=`${playerConfigs[playerId].label} Trap Draft`;draftLabel.textContent=`${playerConfigs[playerId].label} lost that run. Choose 1 of 3 traps, then place it once.`;renderDraftOptions();updateUi();}
function finishDraftTurnEarly(){if(!state.currentDraft)return;state.eyeLine=chooseEyeLine();state.eyeMessageTimer=3.6;state.currentDraft=null;beginNextDraftTurn();}
function finishActiveRun(outcome){const player=currentRunner();if(!player)return;player.outcome=outcome;player.alive=false;state.completedRuns.push(player.id);if(outcome==="dead")queueDraftTurn(player.id);const nextId=state.runOrder.find(id=>!state.completedRuns.includes(id));if(nextId){state.activeRunner=nextId;resetPlayerForRound(state.players[nextId]);state.projectiles=[];messageLabel.textContent=`${playerConfigs[nextId].label} is up. Current score: Red ${state.players.red.score} - Blue ${state.players.blue.score}.`;return;}state.activeRunner=null;beginNextDraftTurn();}

function placeTrap(cell){if(state.phase!=="draft-place"||!state.currentDraft?.trapId)return;if(!canPlaceTrap(cell.c,cell.r)){draftLabel.textContent="That cell is blocked. Pick another one.";return;}state.traps.push({id:state.currentDraft.trapId,c:cell.c,r:cell.r,cooldown:0,timer:Math.random()*1.5});state.currentDraft.placed=1;state.currentDraft.placementsLeft=0;finishDraftTurnEarly();}

function updateUi(){phaseLabel.textContent={ready:"Ready Phase",run:"Run Phase","draft-select":"Trap Draft","draft-place":"Trap Placement",gameover:"Match Over"}[state.phase];templateLabel.textContent=`Template: ${state.template?.name??"--"}`;redScoreLabel.textContent=`Red: ${state.players.red.score}`;blueScoreLabel.textContent=`Blue: ${state.players.blue.score}`;roundLabel.textContent=state.phase==="run"&&state.activeRunner?`Turn: ${playerConfigs[state.activeRunner].label}`:`Round: ${state.round}`;finishDraftButton.style.display="none";if(state.phase==="ready"&&!state.currentDraft){draftHeading.textContent="Round Setup";draftLabel.textContent=`Between rounds: Red ${state.players.red.score} - Blue ${state.players.blue.score}.`;}}
function renderDraftOptions(){draftOptions.innerHTML="";if(!state.draftOptions.length){const empty=document.createElement("div");empty.className="small-note";empty.textContent="No trap choices active right now.";draftOptions.appendChild(empty);return;}state.draftOptions.forEach(trap=>{const button=document.createElement("button");button.type="button";button.className=`tool-button${state.currentDraft?.trapId===trap.id?" selected":""}`;button.innerHTML=`<strong>${trap.name}</strong><br><span>${trap.desc}</span>`;button.addEventListener("click",()=>{if(!state.currentDraft)return;state.currentDraft.trapId=trap.id;state.phase="draft-place";state.currentDraft.placementsLeft=1;state.currentDraft.placed=0;draftLabel.textContent=`Place 1 ${trap.name} trap for ${playerConfigs[state.currentDraft.playerId].label}.`;renderDraftOptions();updateUi();});draftOptions.appendChild(button);});}

function getSolidRects(){const rects=state.template.solids.map(s=>({x:s.c*CELL,y:OFFSET_Y+s.r*CELL,w:s.w*CELL,h:s.h*CELL}));state.traps.forEach(trap=>{if(["crate","spring","slime","ice","bumperL","bumperR","cannon"].includes(trap.id)||(trap.id==="crumble"&&trap.cooldown<=0))rects.push(rectForCell(trap.c,trap.r,4));});return rects;}
function applyPlayerControls(player){const controls=playerConfigs[player.id],left=keys.has(controls.left),right=keys.has(controls.right),jump=keys.has(controls.jump);const accel=player.surface==="slime"?0.2:0.45,maxSpeed=player.surface==="ice"?6.2:player.surface==="slime"?2.2:4.7,friction=player.surface==="ice"?0.95:player.surface==="slime"?0.75:0.82;if(left)player.vx=Math.max(player.vx-accel,-maxSpeed);if(right)player.vx=Math.min(player.vx+accel,maxSpeed);if(!left&&!right){player.vx*=friction;if(Math.abs(player.vx)<0.05)player.vx=0;}if(jump&&player.grounded&&!player.jumpHeld){player.vy=-10.8;player.grounded=false;player.jumpHeld=true;}if(!jump)player.jumpHeld=false;}
function resolveSolidCollisions(player,axis){getSolidRects().forEach(rect=>{if(!intersects(player,rect))return;if(axis==="x"){player.x=player.vx>0?rect.x-player.w:rect.x+rect.w;player.vx=0;return;}if(player.vy>0){player.y=rect.y-player.h;player.vy=0;player.grounded=true;}else if(player.vy<0){player.y=rect.y+rect.h;player.vy=0;}});}
function movePlayer(player){player.vy+=0.58;player.x+=player.vx;resolveSolidCollisions(player,"x");player.y+=player.vy;player.grounded=false;resolveSolidCollisions(player,"y");if(player.y>OFFSET_Y+ROWS*CELL+60){messageLabel.textContent=`${playerConfigs[player.id].label} fell off the map.`;finishActiveRun("dead");}}

function handleTrapInteractions(player,dt){player.surface="normal";const feet={x:player.x+4,y:player.y+player.h-3,w:player.w-8,h:6};state.traps.forEach(trap=>{const cell=rectForCell(trap.c,trap.r,4),pulse=Math.floor((state.time+trap.timer)*2)%2===0;if(trap.cooldown>0)trap.cooldown=Math.max(0,trap.cooldown-dt);if(["slime","ice","spring","crumble"].includes(trap.id)&&intersects(feet,cell)){if(trap.id==="slime")player.surface="slime";if(trap.id==="ice")player.surface="ice";if(trap.id==="spring"&&player.vy>=0){player.vy=-14;player.grounded=false;}if(trap.id==="crumble"&&trap.cooldown<=0&&player.grounded)trap.cooldown=2.8;}if(trap.id==="fan"&&intersects(player,{x:cell.x+8,y:cell.y-120,w:cell.w-16,h:124}))player.vy-=0.32;if(trap.id==="bumperL"&&intersects(player,cell))player.vx=-7;if(trap.id==="bumperR"&&intersects(player,cell))player.vx=7;if(trap.id==="warp"&&intersects(player,cell))resetPlayerForRound(player);if(trap.id==="spikes"&&intersects(player,{x:cell.x+2,y:cell.y+18,w:cell.w-4,h:18})){messageLabel.textContent=`${playerConfigs[player.id].label} hit spikes.`;finishActiveRun("dead");}if(trap.id==="mine"&&trap.cooldown<=0&&intersects(player,cell)){trap.cooldown=3;messageLabel.textContent=`${playerConfigs[player.id].label} triggered a mine.`;finishActiveRun("dead");}if(trap.id==="laser"&&pulse&&intersects(player,{x:cell.x+16,y:OFFSET_Y,w:8,h:ROWS*CELL})){messageLabel.textContent=`${playerConfigs[player.id].label} got clipped by a laser.`;finishActiveRun("dead");}if(trap.id==="flame"&&pulse&&intersects(player,{x:cell.x+10,y:cell.y-80,w:cell.w-20,h:84})){messageLabel.textContent=`${playerConfigs[player.id].label} got scorched.`;finishActiveRun("dead");}if(trap.id==="saw"){const sawX=cell.x+cell.w/2+Math.sin(state.time*2.3+trap.timer)*16,sawY=cell.y+cell.h/2;if(Math.hypot(player.x+player.w/2-sawX,player.y+player.h/2-sawY)<22){messageLabel.textContent=`${playerConfigs[player.id].label} got carved up by a saw.`;finishActiveRun("dead");}}});state.projectiles.forEach(projectile=>{if(intersects(player,projectile)){messageLabel.textContent=`${playerConfigs[player.id].label} was hit by a cannon shot.`;finishActiveRun("dead");}});}
function updateProjectiles(dt){state.traps.forEach(trap=>{if(trap.id!=="cannon")return;trap.cooldown=Math.max(0,trap.cooldown-dt);if(trap.cooldown<=0&&state.phase==="run"){const cell=rectForCell(trap.c,trap.r,4);state.projectiles.push({x:cell.x+10,y:cell.y+10,w:16,h:16,vx:190});trap.cooldown=2.2;}});state.projectiles.forEach(projectile=>{projectile.x+=projectile.vx*dt;});state.projectiles=state.projectiles.filter(projectile=>projectile.x<canvas.width+60);}
function updateRun(dt){const player=currentRunner();if(!player)return;updateProjectiles(dt);applyPlayerControls(player);movePlayer(player);if(state.phase!=="run"||player.id!==state.activeRunner)return;handleTrapInteractions(player,dt);if(state.phase!=="run"||player.id!==state.activeRunner)return;if(intersects(player,rectForCell(state.template.goal.c,state.template.goal.r,8))){player.score+=1;messageLabel.textContent=`${playerConfigs[player.id].label} reached the bell. Score is now Red ${state.players.red.score} - Blue ${state.players.blue.score}.`;finishActiveRun("scored");}}

function drawBackground(){const sky=ctx.createLinearGradient(0,0,0,canvas.height);sky.addColorStop(0,state.template.sky[0]);sky.addColorStop(1,state.template.sky[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,canvas.width,canvas.height);const eyeX=canvas.width/2,eyeY=canvas.height*0.28,eyeW=canvas.width*0.82,eyeH=canvas.height*0.7;ctx.fillStyle="rgba(255,244,226,0.22)";ctx.beginPath();ctx.ellipse(eyeX,eyeY,eyeW/2,eyeH/2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,236,214,0.3)";ctx.lineWidth=14;ctx.stroke();ctx.fillStyle="rgba(17,20,31,0.44)";ctx.beginPath();ctx.ellipse(eyeX,eyeY,eyeW*0.18,eyeH*0.24,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,0.08)";ctx.beginPath();ctx.arc(eyeX-eyeW*0.08,eyeY-eyeH*0.1,44,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.08)";for(let c=0;c<=COLS;c+=1){ctx.beginPath();ctx.moveTo(c*CELL,OFFSET_Y);ctx.lineTo(c*CELL,OFFSET_Y+ROWS*CELL);ctx.stroke();}for(let r=0;r<=ROWS;r+=1){ctx.beginPath();ctx.moveTo(0,OFFSET_Y+r*CELL);ctx.lineTo(COLS*CELL,OFFSET_Y+r*CELL);ctx.stroke();}}
function drawWatcherEye(){const target=state.activeRunner?state.players[state.activeRunner]:null;const eyeX=canvas.width/2,eyeY=canvas.height*0.28,irisW=canvas.width*0.2,irisH=canvas.height*0.22;const tx=target?target.x+target.w/2:eyeX;const ty=target?target.y+target.h/2:eyeY+120;const dx=Math.max(-98,Math.min(98,(tx-eyeX)*0.075));const dy=Math.max(-54,Math.min(54,(ty-eyeY)*0.05));ctx.fillStyle="rgba(111,176,255,0.68)";ctx.beginPath();ctx.ellipse(eyeX+dx,eyeY+dy,irisW/2,irisH/2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(14,15,18,0.96)";ctx.beginPath();ctx.ellipse(eyeX+dx,eyeY+dy,irisW*0.16,irisH*0.38,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,0.82)";ctx.beginPath();ctx.arc(eyeX+dx-34,eyeY+dy-28,18,0,Math.PI*2);ctx.fill();if(state.eyeMessageTimer>0){ctx.fillStyle="rgba(8,14,24,0.82)";ctx.fillRect(canvas.width/2-420,30,840,58);ctx.fillStyle="#f6e7b2";ctx.font="700 34px Trebuchet MS";ctx.textAlign="center";ctx.fillText(state.eyeLine,canvas.width/2,68);ctx.textAlign="start";}}
function drawDraftOverlay(){if(!state.draftOptions.length||!["draft-select","draft-place"].includes(state.phase))return;const cardW=170, gap=18, total=cardW*3+gap*2, startX=(canvas.width-total)/2, y=canvas.height-94;state.draftOptions.forEach((trap,index)=>{const x=startX+index*(cardW+gap);ctx.fillStyle=state.currentDraft?.trapId===trap.id?"rgba(135,244,208,0.28)":"rgba(8,14,24,0.76)";ctx.fillRect(x,y,cardW,72);ctx.strokeStyle=state.currentDraft?.trapId===trap.id?"#87f4d0":"rgba(246,231,178,0.3)";ctx.lineWidth=2;ctx.strokeRect(x,y,cardW,72);ctx.fillStyle=trap.color;ctx.fillRect(x+10,y+12,18,18);ctx.fillStyle="#f6e7b2";ctx.font="700 18px Trebuchet MS";ctx.fillText(trap.name,x+38,y+28);ctx.font="14px Trebuchet MS";ctx.fillText(trap.desc,x+12,y+52);});}
function drawSolids(){state.template.solids.forEach(solid=>{const rect={x:solid.c*CELL,y:OFFSET_Y+solid.r*CELL,w:solid.w*CELL,h:solid.h*CELL};ctx.fillStyle="#7b5a3e";ctx.fillRect(rect.x,rect.y,rect.w,rect.h);ctx.fillStyle="#d6a069";ctx.fillRect(rect.x,rect.y,rect.w,8);});}
function drawGoal(){const rect=rectForCell(state.template.goal.c,state.template.goal.r,8);ctx.fillStyle="rgba(124, 224, 255, 0.18)";ctx.fillRect(rect.x-12,rect.y-12,rect.w+24,rect.h+24);ctx.fillStyle="#f6e7b2";ctx.fillRect(rect.x+10,rect.y-18,6,58);ctx.fillStyle="#ff8c77";ctx.beginPath();ctx.moveTo(rect.x+16,rect.y-16);ctx.lineTo(rect.x+44,rect.y-4);ctx.lineTo(rect.x+16,rect.y+10);ctx.closePath();ctx.fill();}
function drawTrap(trap){const rect=rectForCell(trap.c,trap.r,4),pulse=Math.floor((state.time+trap.timer)*2)%2===0;ctx.fillStyle=trapCatalog.find(entry=>entry.id===trap.id).color;if(["crate","slime","ice","spring","bumperL","bumperR","cannon","crumble"].includes(trap.id)){if(trap.id==="crumble"&&trap.cooldown>0)ctx.globalAlpha=0.25;ctx.fillRect(rect.x,rect.y,rect.w,rect.h);ctx.globalAlpha=1;}if(trap.id==="spikes"){for(let i=0;i<4;i+=1){ctx.beginPath();ctx.moveTo(rect.x+i*8+4,rect.y+rect.h);ctx.lineTo(rect.x+i*8+8,rect.y+6);ctx.lineTo(rect.x+i*8+12,rect.y+rect.h);ctx.closePath();ctx.fill();}}if(trap.id==="spring"){ctx.strokeStyle="#0b1322";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(rect.x+6,rect.y+28);ctx.lineTo(rect.x+12,rect.y+18);ctx.lineTo(rect.x+18,rect.y+28);ctx.lineTo(rect.x+24,rect.y+18);ctx.lineTo(rect.x+30,rect.y+28);ctx.stroke();}if(trap.id==="slime"){ctx.fillStyle="rgba(0,0,0,0.16)";ctx.fillRect(rect.x,rect.y+18,rect.w,14);}if(trap.id==="ice"){ctx.fillStyle="rgba(255,255,255,0.38)";ctx.fillRect(rect.x+4,rect.y+6,rect.w-8,12);}if(trap.id==="bumperL"||trap.id==="bumperR"){ctx.fillStyle="#0b1322";ctx.beginPath();if(trap.id==="bumperL"){ctx.moveTo(rect.x+8,rect.y+18);ctx.lineTo(rect.x+24,rect.y+8);ctx.lineTo(rect.x+24,rect.y+28);}else{ctx.moveTo(rect.x+28,rect.y+18);ctx.lineTo(rect.x+12,rect.y+8);ctx.lineTo(rect.x+12,rect.y+28);}ctx.closePath();ctx.fill();}if(trap.id==="fan"||trap.id==="mine"){ctx.beginPath();ctx.arc(rect.x+16,rect.y+16,12,0,Math.PI*2);ctx.fill();}if(trap.id==="warp"){ctx.strokeStyle="#d8a7ff";ctx.lineWidth=4;ctx.beginPath();ctx.arc(rect.x+16,rect.y+16,14,0,Math.PI*2);ctx.stroke();}if(trap.id==="laser"&&pulse)ctx.fillRect(rect.x+14,OFFSET_Y,4,ROWS*CELL);if(trap.id==="saw"){const x=rect.x+16+Math.sin(state.time*2.3+trap.timer)*16;ctx.beginPath();ctx.arc(x,rect.y+16,12,0,Math.PI*2);ctx.fill();}if(trap.id==="cannon"){ctx.fillStyle="#0b1322";ctx.fillRect(rect.x+14,rect.y+8,18,10);}if(trap.id==="flame"&&pulse)ctx.fillRect(rect.x+12,rect.y-48,8,52);}
function drawPlayers(){if(state.activeRunner&&state.phase==="run"){const player=state.players[state.activeRunner];ctx.fillStyle=playerConfigs[player.id].color;ctx.fillRect(player.x,player.y,player.w,player.h);ctx.fillStyle="#0b1322";ctx.fillRect(player.x+6,player.y+8,4,4);ctx.fillRect(player.x+14,player.y+8,4,4);}else{Object.values(state.players).forEach(player=>{ctx.fillStyle=playerConfigs[player.id].color;ctx.globalAlpha=0.25;ctx.fillRect(player.x,player.y,player.w,player.h);ctx.globalAlpha=1;});}}
function drawHoverCell(){if(state.phase!=="draft-place"||!state.hoverCell)return;const rect=rectForCell(state.hoverCell.c,state.hoverCell.r,2);ctx.strokeStyle=canPlaceTrap(state.hoverCell.c,state.hoverCell.r)?"#87f4d0":"#ff6f61";ctx.lineWidth=3;ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);}
function drawProjectiles(){ctx.fillStyle="#ffcf73";state.projectiles.forEach(projectile=>{ctx.beginPath();ctx.arc(projectile.x+8,projectile.y+8,8,0,Math.PI*2);ctx.fill();});}
function drawScene(){drawBackground();drawWatcherEye();drawSolids();state.traps.forEach(drawTrap);drawGoal();drawProjectiles();drawPlayers();drawHoverCell();drawDraftOverlay();}
function tick(timestamp){const dt=Math.min(((timestamp-state.lastFrame)||16)/1000,0.032);state.lastFrame=timestamp;state.time+=dt;state.eyeMessageTimer=Math.max(0,state.eyeMessageTimer-dt);if(state.phase==="run")updateRun(dt);drawScene();requestAnimationFrame(tick);}

window.addEventListener("keydown",event=>{const key=event.key.toLowerCase();keys.add(key);if(["arrowleft","arrowright","arrowup"].includes(key))event.preventDefault();});
window.addEventListener("keyup",event=>{keys.delete(event.key.toLowerCase());});
canvas.addEventListener("mousemove",event=>{const rect=canvas.getBoundingClientRect();const x=(event.clientX-rect.left)*(canvas.width/rect.width);const y=(event.clientY-rect.top)*(canvas.height/rect.height);const c=Math.floor(x/CELL),r=Math.floor((y-OFFSET_Y)/CELL);state.hoverCell=c>=0&&c<COLS&&r>=0&&r<ROWS?{c,r}:null;});
canvas.addEventListener("click",()=>{if(state.hoverCell)placeTrap(state.hoverCell);});
startRoundButton.addEventListener("click",startRound);
resetRoundButton.addEventListener("click",resetCurrentRound);
newMatchButton.addEventListener("click",startNewMatch);
finishDraftButton.addEventListener("click",finishDraftTurnEarly);

startNewMatch();
requestAnimationFrame(tick);
