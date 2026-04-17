const gameShell = document.getElementById("gameShell");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const phaseLabel = document.getElementById("phaseLabel");
const templateLabel = document.getElementById("templateLabel");
const messageLabel = document.getElementById("messageLabel");
const redScoreLabel = document.getElementById("redScoreLabel");
const blueScoreLabel = document.getElementById("blueScoreLabel");
const roundLabel = document.getElementById("roundLabel");
const draftHeading = document.getElementById("draftHeading");
const draftLabel = document.getElementById("draftLabel");
const draftOptions = document.getElementById("draftOptions");
const startRoundButton = document.getElementById("startRoundButton");
const resetRoundButton = document.getElementById("resetRoundButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const newMatchButton = document.getElementById("newMatchButton");
const finishDraftButton = document.getElementById("finishDraftButton");
const mainMenuOverlay = document.getElementById("mainMenuOverlay");
const settingsOverlay = document.getElementById("settingsOverlay");
const menuStartButton = document.getElementById("menuStartButton");
const menuFullscreenButton = document.getElementById("menuFullscreenButton");
const resumeButton = document.getElementById("resumeButton");
const resetMatchButton = document.getElementById("resetMatchButton");
const returnMenuButton = document.getElementById("returnMenuButton");
const trapToggleList = document.getElementById("trapToggleList");
const menuTitle = document.getElementById("menuTitle");
const menuSubtitle = document.getElementById("menuSubtitle");

const GRID = 32;
const COLS = 60;
const ROWS = 30;
const WORLD_W = COLS * GRID;
const WORLD_H = ROWS * GRID;
const PLAYER_W = 24;
const PLAYER_H = 30;
const RUN_SPEED = 4.25;
const GRAVITY = 0.58;
const JUMP_VELOCITY = -13.2;
const FALL_LIMIT = WORLD_H + 180;
const TARGET_SCORE = 5;
const AUTO_ROUND_DELAY = 1600;
const SETTINGS_KEY = "`";
const keys = new Set();

const trapCatalog = [
  { id: "crate", name: "Crate", color: "#d99853", desc: "Solid wood block.", solid: true },
  { id: "spikes", name: "Spikes", color: "#ff6f61", desc: "Sharp floor hazard." },
  { id: "spring", name: "Spring", color: "#87f4d0", desc: "Launches runners up.", solid: true },
  { id: "slime", name: "Slime", color: "#96ef62", desc: "Sticky slow ground.", solid: true },
  { id: "ice", name: "Ice Tile", color: "#8ee0ff", desc: "Slippery footing.", solid: true },
  { id: "bumperL", name: "Left Bumper", color: "#ffd36b", desc: "Punches left.", solid: true },
  { id: "bumperR", name: "Right Bumper", color: "#ffd36b", desc: "Punches right.", solid: true },
  { id: "fan", name: "Fan", color: "#7ce0ff", desc: "Creates an updraft." },
  { id: "mine", name: "Mine", color: "#ff8c77", desc: "Explodes on contact." },
  { id: "warp", name: "Warp Gate", color: "#d8a7ff", desc: "Throws you back to spawn." },
  { id: "laser", name: "Laser Post", color: "#ff5e9c", desc: "Periodic vertical beam." },
  { id: "saw", name: "Saw Drone", color: "#d2d7df", desc: "Buzzing moving blade." },
  { id: "cannon", name: "Cannon", color: "#b98cff", desc: "Spits fireballs.", solid: true },
  { id: "crumble", name: "Crumble Block", color: "#c99563", desc: "Falls apart after a step.", solid: true },
  { id: "flame", name: "Flame Vent", color: "#ff8748", desc: "Timed fire burst." }
];
const ERASE_OPTION = { id: "erase", name: "Erase Trap", color: "#e9eef5", desc: "Remove one placed trap." };
const eyeLines = [
  "Intresting. . .",
  "The floor learned your weakness.",
  "I prefer when hope slips sideways.",
  "That landing sounded expensive.",
  "You were almost elegant. Almost.",
  "Failure lets you decorate my hunger.",
  "Run faster. I am blinking slower.",
  "I liked the part where you panicked.",
  "Your courage keeps tripping over itself.",
  "The bell is crueler when you can see it.",
  "I can feel you planning the jump.",
  "One of you tastes more nervous than the other.",
  "Every trap is just a memory waiting.",
  "I only reward the broken route.",
  "The maze bends better when you lose."
];
const eyeMoods = {
  hungry: { iris: "#9d6070", sclera: "#f1d5c2", ring: "rgba(255,98,131,0.32)", lid: 0.18, jitter: 0.6 },
  anticipation: { iris: "#ff9e6d", sclera: "#f4dfc9", ring: "rgba(255,197,122,0.34)", lid: 0.1, jitter: 1.1 },
  delighted: { iris: "#ff5e9c", sclera: "#f6d6d8", ring: "rgba(255,94,156,0.42)", lid: 0.06, jitter: 2.4 },
  annoyed: { iris: "#82c8ff", sclera: "#dce8ff", ring: "rgba(122,213,255,0.34)", lid: 0.28, jitter: 1.5 },
  glee: { iris: "#ff7c58", sclera: "#f8d7c6", ring: "rgba(255,140,119,0.4)", lid: 0.03, jitter: 2.9 }
};
const playerConfigs = {
  red: { label: "Red", color: "#ff6b6b", left: "a", right: "d", jump: "w" },
  blue: { label: "Blue", color: "#64b5ff", left: "arrowleft", right: "arrowright", jump: "arrowup" }
};

function p(c, r, w = 4, h = 1) { return { c, r, w, h }; }
function trap(id, c, r) { return { id, c, r, cooldown: 0, phase: Math.random() * Math.PI * 2, armed: true }; }

const templates = [
  { name: "Needle Steps", sky: ["#0e1b33", "#1d3d5a"], goal: { c: 54, r: 8 }, spawns: { red: { c: 2, r: 24 }, blue: { c: 5, r: 24 } }, platforms: [p(0, 26, 10, 2), p(13, 23, 6), p(22, 20, 6), p(31, 18, 5), p(39, 15, 6), p(48, 12, 5), p(54, 9, 5)], presets: [trap("fan", 23, 19), trap("laser", 40, 14)] },
  { name: "Long Drop Gallery", sky: ["#10273a", "#284f60"], goal: { c: 55, r: 10 }, spawns: { red: { c: 2, r: 25 }, blue: { c: 5, r: 25 } }, platforms: [p(0, 27, 11, 1), p(14, 24, 6), p(23, 21, 6), p(32, 18, 6), p(41, 15, 6), p(50, 12, 6)], presets: [trap("mine", 33, 17), trap("saw", 42, 14)] },
  { name: "Wick Spiral", sky: ["#161e3d", "#523f72"], goal: { c: 53, r: 7 }, spawns: { red: { c: 2, r: 24 }, blue: { c: 5, r: 24 } }, platforms: [p(0, 26, 9, 2), p(12, 22, 5), p(19, 18, 6), p(28, 15, 5), p(35, 12, 6), p(44, 10, 5), p(53, 8, 5)], presets: [trap("flame", 20, 17), trap("warp", 45, 9)] },
  { name: "Cage Runners", sky: ["#13263d", "#345f52"], goal: { c: 54, r: 11 }, spawns: { red: { c: 2, r: 24 }, blue: { c: 5, r: 24 } }, platforms: [p(0, 26, 10, 2), p(13, 23, 5), p(21, 20, 5), p(29, 18, 6), p(38, 16, 6), p(47, 13, 5), p(54, 11, 5)], presets: [trap("cannon", 30, 17), trap("ice", 48, 12)] },
  { name: "Thin Mercy", sky: ["#182240", "#2f4b7f"], goal: { c: 55, r: 9 }, spawns: { red: { c: 2, r: 25 }, blue: { c: 5, r: 25 } }, platforms: [p(0, 27, 11, 1), p(14, 24, 5), p(21, 21, 5), p(29, 18, 6), p(38, 15, 6), p(47, 12, 5), p(55, 9, 4)], presets: [trap("spring", 30, 17), trap("crumble", 48, 11)] },
  { name: "Skyline Pins", sky: ["#132340", "#3a5170"], goal: { c: 54, r: 6 }, spawns: { red: { c: 2, r: 24 }, blue: { c: 5, r: 24 } }, platforms: [p(0, 26, 10, 1), p(13, 22, 5), p(21, 18, 6), p(30, 15, 5), p(38, 12, 6), p(47, 9, 5), p(54, 7, 4)], presets: [trap("fan", 22, 17), trap("saw", 48, 8)] },
  { name: "Grin Ladder", sky: ["#181d36", "#60496e"], goal: { c: 53, r: 8 }, spawns: { red: { c: 2, r: 24 }, blue: { c: 5, r: 24 } }, platforms: [p(0, 26, 10, 2), p(13, 22, 6), p(22, 19, 5), p(30, 16, 6), p(39, 13, 5), p(47, 10, 5), p(53, 8, 5)], presets: [trap("laser", 31, 15), trap("spring", 48, 9)] },
  { name: "Quiet Teeth", sky: ["#102032", "#355a67"], goal: { c: 55, r: 10 }, spawns: { red: { c: 2, r: 24 }, blue: { c: 5, r: 24 } }, platforms: [p(0, 26, 10, 1), p(14, 23, 6), p(23, 20, 6), p(32, 17, 5), p(40, 14, 6), p(49, 12, 5), p(55, 10, 4)], presets: [trap("mine", 24, 19), trap("spikes", 50, 13)] },
  { name: "Chapel Gaps", sky: ["#1a213c", "#45506f"], goal: { c: 54, r: 7 }, spawns: { red: { c: 2, r: 25 }, blue: { c: 5, r: 25 } }, platforms: [p(0, 27, 11, 1), p(14, 24, 6), p(23, 21, 6), p(32, 18, 6), p(41, 14, 6), p(50, 10, 5), p(54, 7, 4)], presets: [trap("warp", 24, 20), trap("fan", 50, 9)] },
  { name: "Bell Hunger", sky: ["#11233b", "#2a465a"], goal: { c: 54, r: 6 }, spawns: { red: { c: 2, r: 24 }, blue: { c: 5, r: 24 } }, platforms: [p(0, 26, 10, 1), p(13, 22, 6), p(22, 18, 6), p(31, 14, 6), p(40, 11, 6), p(49, 8, 5), p(54, 6, 5)], presets: [trap("cannon", 32, 13), trap("flame", 50, 7)] }
];

const state = {
  phase: "home",
  previousPhase: null,
  round: 1,
  time: 0,
  lastFrame: 0,
  template: null,
  players: { red: createPlayer("red"), blue: createPlayer("blue") },
  traps: [],
  projectiles: [],
  particles: [],
  draftQueue: [],
  currentDraft: null,
  draftOptions: [],
  runOrder: ["red", "blue"],
  activeRunner: null,
  completedRuns: [],
  hoverCell: null,
  draftCards: [],
  enabledTrapIds: new Set(trapCatalog.map((entry) => entry.id)),
  eyeMood: "hungry",
  eyeLine: "Intresting. . .",
  eyeMessageTimer: 0,
  screenShake: 0,
  view: { x: 0, y: 0 },
  zoom: 1,
  autoRoundHandle: null
};

function createPlayer(id) { return { id, x: 0, y: 0, w: PLAYER_W, h: PLAYER_H, vx: 0, vy: 0, grounded: false, alive: true, score: 0, outcome: null, surface: "normal" }; }
function chooseRandomTemplate() { return templates[Math.floor(Math.random() * templates.length)]; }
function chooseEyeLine() { return eyeLines[Math.floor(Math.random() * eyeLines.length)]; }
function rectForCell(c, r, inset = 0) { return { x: c * GRID + inset, y: r * GRID + inset, w: GRID - inset * 2, h: GRID - inset * 2 }; }
function worldToScreenRect(rect) { return { x: (rect.x - state.view.x) * state.zoom, y: (rect.y - state.view.y) * state.zoom, w: rect.w * state.zoom, h: rect.h * state.zoom }; }
function intersects(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function trapDefinition(id) { return trapCatalog.find((entry) => entry.id === id) || ERASE_OPTION; }
function trapAtCell(c, r) { return state.traps.find((entry) => entry.c === c && entry.r === r) || null; }
function addParticles(x, y, color, count = 8, force = 1) { for (let i = 0; i < count; i += 1) { state.particles.push({ x, y, vx: (Math.random() - 0.5) * 6 * force, vy: (Math.random() - 0.5) * 6 * force, life: 0.5 + Math.random() * 0.5, color, size: 3 + Math.random() * 3 }); } }
function setEyeMood(mood, line = null) { state.eyeMood = mood; if (line) { state.eyeLine = line; state.eyeMessageTimer = 3.2; } }
function clearAutoRound() { if (state.autoRoundHandle) { clearTimeout(state.autoRoundHandle); state.autoRoundHandle = null; } }
function scheduleAutoRound() { clearAutoRound(); state.autoRoundHandle = setTimeout(() => { if (state.phase === "between" && !isAnyOverlayOpen()) startRound(); }, AUTO_ROUND_DELAY); }
function isAnyOverlayOpen() { return !mainMenuOverlay.classList.contains("hidden") || !settingsOverlay.classList.contains("hidden"); }
function refreshZoom() { state.zoom = document.fullscreenElement === gameShell ? 0.68 : 1; }
function buildTrapToggles() {
  trapToggleList.innerHTML = "";
  trapCatalog.forEach((entry) => {
    const label = document.createElement("label");
    label.className = "trap-toggle";
    label.innerHTML = `<input type="checkbox" checked data-trap-id="${entry.id}"><span><strong>${entry.name}</strong><br>${entry.desc}</span>`;
    trapToggleList.appendChild(label);
  });
  trapToggleList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.enabledTrapIds.add(input.dataset.trapId);
      else state.enabledTrapIds.delete(input.dataset.trapId);
      if (!state.enabledTrapIds.size) {
        input.checked = true;
        state.enabledTrapIds.add(input.dataset.trapId);
      }
    });
  });
}

function showMainMenu(title = "Skybarn Scramble", subtitle = "Choose which traps can appear in draft picks, then start the match.") {
  clearAutoRound();
  state.phase = "home";
  menuTitle.textContent = title;
  menuSubtitle.textContent = subtitle;
  mainMenuOverlay.classList.remove("hidden");
  settingsOverlay.classList.add("hidden");
  updateUi();
}

function hideMainMenu() {
  mainMenuOverlay.classList.add("hidden");
}

function toggleSettings() {
  if (state.phase === "home" || state.phase === "gameover") return;
  if (!settingsOverlay.classList.contains("hidden")) {
    settingsOverlay.classList.add("hidden");
    state.phase = state.previousPhase || "ready";
    updateUi();
    if (state.phase === "between") scheduleAutoRound();
    return;
  }
  clearAutoRound();
  state.previousPhase = state.phase;
  state.phase = "paused";
  settingsOverlay.classList.remove("hidden");
  updateUi();
}

function resetPlayerForRound(player) {
  const spawn = state.template.spawns[player.id];
  player.x = spawn.c * GRID + 4;
  player.y = spawn.r * GRID + 1;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.alive = true;
  player.outcome = null;
  player.surface = "normal";
}

function resetAllPlayers() {
  Object.values(state.players).forEach(resetPlayerForRound);
}

function currentRunner() {
  return state.activeRunner ? state.players[state.activeRunner] : null;
}

function startNewMatch() {
  clearAutoRound();
  state.template = chooseRandomTemplate();
  state.traps = state.template.presets.map((entry) => ({ ...entry }));
  state.projectiles = [];
  state.particles = [];
  state.round = 1;
  state.currentDraft = null;
  state.draftOptions = [];
  state.draftQueue = [];
  state.completedRuns = [];
  state.activeRunner = null;
  state.phase = "ready";
  state.time = 0;
  state.eyeMood = "hungry";
  state.eyeLine = chooseEyeLine();
  state.eyeMessageTimer = 2.6;
  Object.values(state.players).forEach((player) => {
    player.score = 0;
    resetPlayerForRound(player);
  });
  messageLabel.textContent = "A new map waits behind the eyelid. Press Start Match.";
  updateUi();
  renderSidebarDraft();
}

function resetCurrentRound() {
  clearAutoRound();
  state.currentDraft = null;
  state.draftOptions = [];
  state.draftQueue = [];
  state.projectiles = [];
  state.particles = [];
  state.completedRuns = [];
  state.activeRunner = null;
  resetAllPlayers();
  state.phase = "ready";
  messageLabel.textContent = "Round reset. The eye rewound the room.";
  setEyeMood("hungry", chooseEyeLine());
  updateUi();
  renderSidebarDraft();
}

function startRound() {
  if (!state.template || !["ready", "between"].includes(state.phase)) return;
  clearAutoRound();
  state.currentDraft = null;
  state.draftOptions = [];
  state.projectiles = [];
  state.particles = [];
  state.completedRuns = [];
  resetAllPlayers();
  state.activeRunner = state.runOrder[0];
  state.phase = "run";
  messageLabel.textContent = "Red runs first. Blue waits. The eye keeps score.";
  setEyeMood("anticipation", chooseEyeLine());
  updateUi();
  renderSidebarDraft();
}

function randomTrapChoices(count) {
  const pool = trapCatalog.filter((entry) => state.enabledTrapIds.has(entry.id));
  const source = pool.length ? [...pool] : [...trapCatalog];
  const picked = [];
  while (source.length && picked.length < count) {
    const index = Math.floor(Math.random() * source.length);
    picked.push(source.splice(index, 1)[0]);
  }
  return picked;
}

function queueDraftTurn(playerId) {
  state.draftQueue.push(playerId);
}

function beginNextDraftTurn() {
  if (!state.draftQueue.length) {
    state.currentDraft = null;
    state.draftOptions = [];
    state.phase = "between";
    state.round += 1;
    messageLabel.textContent = `Scoreboard: Red ${state.players.red.score} - Blue ${state.players.blue.score}. Next round begins automatically.`;
    updateUi();
    renderSidebarDraft();
    scheduleAutoRound();
    return;
  }
  const playerId = state.draftQueue.shift();
  state.currentDraft = { playerId, selected: null };
  state.draftOptions = [...randomTrapChoices(3), ERASE_OPTION];
  state.phase = "draft-select";
  draftHeading.textContent = `${playerConfigs[playerId].label} Trap Draft`;
  draftLabel.textContent = `${playerConfigs[playerId].label} lost that run. Click 1 of the 3 trap cards, or erase a trap.`;
  setEyeMood("glee", chooseEyeLine());
  updateUi();
  renderSidebarDraft();
}

function finishDraftTurn(line = null) {
  state.currentDraft = null;
  if (line) {
    state.eyeLine = line;
    state.eyeMessageTimer = 2.8;
  }
  beginNextDraftTurn();
}

function finishActiveRun(outcome, line = null) {
  const player = currentRunner();
  if (!player) return;
  player.alive = false;
  player.outcome = outcome;
  state.completedRuns.push(player.id);

  if (outcome === "goal") {
    player.score += 1;
    setEyeMood("annoyed", line || "You escaped my hand this once.");
  } else {
    queueDraftTurn(player.id);
    setEyeMood("delighted", line || chooseEyeLine());
  }

  const winner = Object.values(state.players).find((entry) => entry.score >= TARGET_SCORE);
  const nextId = state.runOrder.find((id) => !state.completedRuns.includes(id));

  if (winner && !nextId) {
    state.phase = "gameover";
    showMainMenu(`${playerConfigs[winner.id].label} Wins`, "The eye wants another match. Tune the trap pool or start again.");
    return;
  }

  if (nextId) {
    state.activeRunner = nextId;
    resetPlayerForRound(state.players[nextId]);
    state.projectiles = [];
    messageLabel.textContent = `${playerConfigs[nextId].label} runs now. Score: Red ${state.players.red.score} - Blue ${state.players.blue.score}.`;
    updateUi();
    return;
  }

  state.activeRunner = null;
  beginNextDraftTurn();
}

function canPlaceTrap(c, r) {
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
  if (trapAtCell(c, r)) return false;
  if (state.template.goal.c === c && state.template.goal.r === r) return false;
  if (state.template.spawns.red.c === c && state.template.spawns.red.r === r) return false;
  if (state.template.spawns.blue.c === c && state.template.spawns.blue.r === r) return false;
  return !state.template.platforms.some((platform) => c >= platform.c && c < platform.c + platform.w && r >= platform.r && r < platform.r + platform.h);
}

function tryUseDraftAtCell(c, r) {
  if (state.phase !== "draft-place" || !state.currentDraft?.selected) return;
  const option = state.currentDraft.selected;
  if (option.id === "erase") {
    const victim = trapAtCell(c, r);
    if (!victim) {
      draftLabel.textContent = "Erase mode needs an existing trap on that cell.";
      return;
    }
    state.traps = state.traps.filter((entry) => entry !== victim);
    addParticles(c * GRID + GRID / 2, r * GRID + GRID / 2, "#ffffff", 16, 1.2);
    finishDraftTurn("Intresting. . .");
    return;
  }
  if (!canPlaceTrap(c, r)) {
    draftLabel.textContent = "That cell cannot take a trap.";
    return;
  }
  state.traps.push({ id: option.id, c, r, cooldown: 0, phase: Math.random() * Math.PI * 2, armed: true });
  addParticles(c * GRID + GRID / 2, r * GRID + GRID / 2, option.color, 14, 1.1);
  finishDraftTurn("Intresting. . .");
}

function getPlatformRects() {
  return state.template.platforms.map((platform) => ({ x: platform.c * GRID, y: platform.r * GRID, w: platform.w * GRID, h: platform.h * GRID, kind: "platform" }));
}

function getSolidTrapRects() {
  return state.traps.flatMap((entry) => {
    const def = trapDefinition(entry.id);
    if (!def.solid) return [];
    if (entry.id === "crumble" && entry.cooldown > 0) return [];
    return [{ x: entry.c * GRID, y: entry.r * GRID, w: GRID, h: GRID, kind: entry.id, trapRef: entry }];
  });
}

function getSolidRects() {
  return [...getPlatformRects(), ...getSolidTrapRects()];
}

function killRunner(reason) {
  const player = currentRunner();
  if (!player || !player.alive) return;
  addParticles(player.x + player.w / 2, player.y + player.h / 2, playerConfigs[player.id].color, 18, 1.5);
  state.screenShake = 18;
  finishActiveRun("dead", reason);
}

function handleGoal(player) {
  const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
  const bell = rectForCell(state.template.goal.c, state.template.goal.r, 2);
  if (intersects(rect, bell)) {
    addParticles(bell.x + bell.w / 2, bell.y + bell.h / 2, "#ffcf73", 18, 1.6);
    finishActiveRun("goal", "The bell rang anyway. I hate that sound.");
  }
}
function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.x += particle.vx * 60 * dt;
    particle.y += particle.vy * 60 * dt;
    particle.vy += 0.08;
    particle.life -= dt;
    return particle.life > 0;
  });
}

function updateProjectiles(dt, playerRect) {
  state.projectiles = state.projectiles.filter((projectile) => {
    projectile.x += projectile.vx * 60 * dt;
    projectile.y += projectile.vy * 60 * dt;
    projectile.life -= dt;
    if (projectile.life <= 0 || projectile.x < -80 || projectile.x > WORLD_W + 80 || projectile.y > WORLD_H + 80) return false;
    if (intersects(playerRect, projectile)) {
      addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, "#ffcf73", 10, 1.4);
      killRunner("The shot found your ribs.");
      return false;
    }
    return true;
  });
}

function updateTrapTimers(dt) {
  state.traps.forEach((entry) => {
    if (entry.cooldown > 0) entry.cooldown = Math.max(0, entry.cooldown - dt);
    if (entry.id === "cannon") {
      entry.phase += dt;
      if (entry.phase >= 2.6) {
        entry.phase = 0;
        state.projectiles.push({ x: entry.c * GRID + GRID, y: entry.r * GRID + 10, w: 14, h: 14, vx: 4.8, vy: -0.35, life: 8 });
      }
    }
  });
}

function handleTrapInteractions(player, playerRect, dt) {
  player.surface = "normal";
  for (const entry of state.traps) {
    const cellRect = { x: entry.c * GRID, y: entry.r * GRID, w: GRID, h: GRID };
    const touching = intersects(playerRect, cellRect);
    const pulse = Math.sin(state.time * 3 + entry.phase) > 0;

    if (entry.id === "spikes" && touching) { killRunner("The spikes were patient."); return; }
    if (entry.id === "spring" && touching && player.vy >= 0) { player.vy = -16; player.grounded = false; addParticles(cellRect.x + 16, cellRect.y + 16, "#87f4d0", 10, 1.2); }
    if (entry.id === "slime" && touching) player.surface = "slime";
    if (entry.id === "ice" && touching) player.surface = "ice";
    if (entry.id === "bumperL" && touching) { player.vx = -8.4; addParticles(cellRect.x + 16, cellRect.y + 16, "#ffd36b", 8, 1); }
    if (entry.id === "bumperR" && touching) { player.vx = 8.4; addParticles(cellRect.x + 16, cellRect.y + 16, "#ffd36b", 8, 1); }
    if (entry.id === "fan") {
      const area = { x: cellRect.x - 8, y: cellRect.y - 96, w: GRID + 16, h: 128 };
      if (intersects(playerRect, area)) {
        player.vy -= 0.45;
        addParticles(player.x + player.w / 2, player.y + player.h, "rgba(124,224,255,0.7)", 1, 0.2);
      }
    }
    if (entry.id === "mine" && touching && entry.cooldown <= 0) { entry.cooldown = 3.2; addParticles(cellRect.x + 16, cellRect.y + 16, "#ff8c77", 18, 1.8); state.screenShake = 24; killRunner("The mine approved of your timing."); return; }
    if (entry.id === "warp" && touching && entry.cooldown <= 0) {
      entry.cooldown = 1.2;
      addParticles(cellRect.x + 16, cellRect.y + 16, "#d8a7ff", 16, 1.2);
      const spawn = state.template.spawns[player.id];
      player.x = spawn.c * GRID + 4;
      player.y = spawn.r * GRID + 1;
      player.vx = 0;
      player.vy = 0;
    }
    if (entry.id === "laser" && pulse) {
      const beam = { x: cellRect.x + 12, y: 0, w: 8, h: WORLD_H };
      if (intersects(playerRect, beam)) { addParticles(player.x + player.w / 2, player.y + player.h / 2, "#ff5e9c", 14, 1.4); killRunner("The beam found the soft parts."); return; }
    }
    if (entry.id === "saw") {
      const sawX = cellRect.x + 16 + Math.sin(state.time * 2.7 + entry.phase) * 24;
      const sawRect = { x: sawX - 13, y: cellRect.y + 3, w: 26, h: 26 };
      if (intersects(playerRect, sawRect)) { addParticles(sawX, cellRect.y + 16, "#d2d7df", 16, 1.5); killRunner("The saw had excellent manners."); return; }
    }
    if (entry.id === "crumble" && touching && entry.cooldown <= 0 && player.vy >= 0) { entry.cooldown = 2.8; addParticles(cellRect.x + 16, cellRect.y + 16, "#c99563", 10, 1); }
    if (entry.id === "flame" && pulse) {
      const flame = { x: cellRect.x + 10, y: cellRect.y - 60, w: 12, h: 64 };
      if (intersects(playerRect, flame)) { addParticles(cellRect.x + 16, cellRect.y - 20, "#ff8748", 14, 1.4); killRunner("The flame chose you."); return; }
    }
  }
  updateProjectiles(dt, playerRect);
}

function moveRunner(player, dt) {
  const config = playerConfigs[player.id];
  const left = keys.has(config.left);
  const right = keys.has(config.right);
  const jump = keys.has(config.jump) || keys.has(" ");
  const accel = player.surface === "slime" ? 0.38 : 0.64;
  const maxSpeed = player.surface === "slime" ? 2.3 : RUN_SPEED;
  const friction = player.surface === "ice" ? 0.985 : (player.surface === "slime" ? 0.7 : 0.82);

  if (left) player.vx -= accel;
  if (right) player.vx += accel;
  if (!left && !right) player.vx *= friction;
  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

  if (jump && player.grounded) {
    player.vy = JUMP_VELOCITY;
    player.grounded = false;
    addParticles(player.x + player.w / 2, player.y + player.h, playerConfigs[player.id].color, 8, 0.9);
  }

  player.vy += GRAVITY;
  player.vy = Math.min(player.vy, 16);

  let nextX = player.x + player.vx * 60 * dt;
  let rect = { x: nextX, y: player.y, w: player.w, h: player.h };
  for (const solid of getSolidRects()) {
    if (!intersects(rect, solid)) continue;
    if (player.vx > 0) nextX = solid.x - player.w;
    if (player.vx < 0) nextX = solid.x + solid.w;
    player.vx = 0;
    rect.x = nextX;
  }
  player.x = Math.max(0, Math.min(WORLD_W - player.w, nextX));

  let nextY = player.y + player.vy * 60 * dt;
  rect = { x: player.x, y: nextY, w: player.w, h: player.h };
  player.grounded = false;
  for (const solid of getSolidRects()) {
    if (!intersects(rect, solid)) continue;
    if (player.vy > 0) {
      nextY = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
      if (solid.kind === "ice") player.surface = "ice";
      if (solid.kind === "slime") player.surface = "slime";
    } else if (player.vy < 0) {
      nextY = solid.y + solid.h;
      player.vy = 0;
    }
    rect.y = nextY;
  }
  player.y = nextY;
}

function updateRun(dt) {
  const player = currentRunner();
  if (!player || !player.alive) return;
  updateTrapTimers(dt);
  moveRunner(player, dt);
  const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
  handleTrapInteractions(player, rect, dt);
  if (!player.alive) return;
  handleGoal(player);
  if (!player.alive) return;
  if (player.y > FALL_LIMIT) killRunner("The pit accepted your confession.");
}

function updateCamera() {
  const player = currentRunner();
  const viewW = canvas.width / state.zoom;
  const viewH = canvas.height / state.zoom;
  const targetX = player ? player.x + player.w / 2 - viewW / 2 : WORLD_W / 2 - viewW / 2;
  const targetY = player ? player.y + player.h / 2 - viewH / 2 : WORLD_H / 2 - viewH / 2;
  state.view.x += (Math.max(0, Math.min(WORLD_W - viewW, targetX)) - state.view.x) * 0.12;
  state.view.y += (Math.max(0, Math.min(WORLD_H - viewH, targetY)) - state.view.y) * 0.12;
}

function drawWorldRect(rect, color, glow = false) {
  const screen = worldToScreenRect(rect);
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 18; }
  ctx.fillStyle = color;
  ctx.fillRect(screen.x, screen.y, screen.w, screen.h);
  ctx.shadowBlur = 0;
}

function drawBackground() {
  const sky = state.template?.sky || ["#081018", "#13253d"];
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, sky[0]);
  gradient.addColorStop(1, sky[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 22; i += 1) {
    const x = ((i * 137 + state.time * 18) % (canvas.width + 200)) - 100;
    const y = (i * 43) % canvas.height;
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWatcherEye() {
  const mood = eyeMoods[state.eyeMood] || eyeMoods.hungry;
  const runner = currentRunner();
  const targetWorldX = runner ? runner.x + runner.w / 2 : WORLD_W / 2;
  const targetWorldY = runner ? runner.y + runner.h / 2 : WORLD_H / 2;
  const targetX = ((targetWorldX / WORLD_W) - 0.5) * canvas.width * 0.18;
  const targetY = ((targetWorldY / WORLD_H) - 0.5) * canvas.height * 0.14;
  const jitterX = Math.sin(state.time * 6.4) * mood.jitter * 4;
  const jitterY = Math.cos(state.time * 8.2) * mood.jitter * 3;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const eyeW = canvas.width * 0.96;
  const eyeH = canvas.height * 0.84;
  const lidDepth = mood.lid * eyeH;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath();
  ctx.ellipse(0, 0, eyeW * 0.52, eyeH * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
  const glow = ctx.createRadialGradient(0, 0, eyeW * 0.06, 0, 0, eyeW * 0.55);
  glow.addColorStop(0, mood.ring);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, eyeW * 0.58, eyeH * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mood.sclera;
  ctx.beginPath();
  ctx.moveTo(-eyeW / 2, 0);
  ctx.quadraticCurveTo(0, -eyeH / 2 + lidDepth, eyeW / 2, 0);
  ctx.quadraticCurveTo(0, eyeH / 2 - lidDepth, -eyeW / 2, 0);
  ctx.fill();
  ctx.fillStyle = mood.iris;
  ctx.beginPath();
  ctx.ellipse(targetX * 0.85 + jitterX, targetY * 0.65 + jitterY, eyeW * 0.17, eyeH * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b1322";
  ctx.beginPath();
  ctx.ellipse(targetX + jitterX * 1.2, targetY + jitterY * 1.1, eyeW * 0.08, eyeH * 0.17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(60,11,18,0.45)";
  ctx.lineWidth = 8;
  for (let i = -5; i <= 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-eyeW * 0.34, i * 20);
    ctx.quadraticCurveTo(-eyeW * 0.14, i * 15 + 8, -eyeW * 0.02, i * 11);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeW * 0.34, i * 20);
    ctx.quadraticCurveTo(eyeW * 0.14, i * 15 + 8, eyeW * 0.02, i * 11);
    ctx.stroke();
  }
  ctx.restore();

  if (state.eyeMessageTimer > 0) {
    ctx.fillStyle = "rgba(8,14,24,0.56)";
    ctx.fillRect(0, 12, canvas.width, 48);
    ctx.fillStyle = "#f6e7b2";
    ctx.font = "700 26px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(state.eyeLine, canvas.width / 2, 44);
    ctx.textAlign = "left";
  }
}
function drawSolids() {
  state.template.platforms.forEach((platform) => {
    const rect = { x: platform.c * GRID, y: platform.r * GRID, w: platform.w * GRID, h: platform.h * GRID };
    drawWorldRect(rect, "rgba(137,105,74,0.92)");
    drawWorldRect({ x: rect.x, y: rect.y, w: rect.w, h: 6 }, "#d6a069");
  });
}

function drawGoal() {
  const rect = rectForCell(state.template.goal.c, state.template.goal.r, 3);
  drawWorldRect({ x: rect.x - 10, y: rect.y - 12, w: rect.w + 20, h: rect.h + 22 }, "rgba(124,224,255,0.14)", true);
  drawWorldRect({ x: rect.x + 10, y: rect.y - 16, w: 8, h: 54 }, "#f6e7b2");
  const screen = worldToScreenRect(rect);
  ctx.fillStyle = "#ff8c77";
  ctx.beginPath();
  ctx.moveTo(screen.x + 18, screen.y - 12 * state.zoom);
  ctx.lineTo(screen.x + 48, screen.y - 2 * state.zoom);
  ctx.lineTo(screen.x + 18, screen.y + 12 * state.zoom);
  ctx.closePath();
  ctx.fill();
}

function drawTrap(entry) {
  const rect = rectForCell(entry.c, entry.r, 2);
  const screen = worldToScreenRect(rect);
  const def = trapDefinition(entry.id);
  const pulse = Math.sin(state.time * 3 + entry.phase) > 0;

  if (["crate", "slime", "ice", "spring", "bumperL", "bumperR", "cannon", "crumble"].includes(entry.id)) {
    ctx.globalAlpha = entry.id === "crumble" && entry.cooldown > 0 ? 0.28 : 1;
    ctx.fillStyle = def.color;
    ctx.fillRect(screen.x, screen.y, screen.w, screen.h);
    ctx.globalAlpha = 1;
  }
  if (entry.id === "spikes") {
    ctx.fillStyle = def.color;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(screen.x + (4 + i * 8) * state.zoom, screen.y + screen.h);
      ctx.lineTo(screen.x + (8 + i * 8) * state.zoom, screen.y + 8 * state.zoom);
      ctx.lineTo(screen.x + (12 + i * 8) * state.zoom, screen.y + screen.h);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (entry.id === "spring") {
    ctx.strokeStyle = "#0b1322";
    ctx.lineWidth = 3 * state.zoom;
    ctx.beginPath();
    ctx.moveTo(screen.x + 4 * state.zoom, screen.y + 25 * state.zoom);
    ctx.lineTo(screen.x + 10 * state.zoom, screen.y + 13 * state.zoom);
    ctx.lineTo(screen.x + 16 * state.zoom, screen.y + 25 * state.zoom);
    ctx.lineTo(screen.x + 22 * state.zoom, screen.y + 13 * state.zoom);
    ctx.lineTo(screen.x + 28 * state.zoom, screen.y + 25 * state.zoom);
    ctx.stroke();
  }
  if (entry.id === "slime") {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(screen.x, screen.y + 18 * state.zoom, screen.w, 10 * state.zoom);
  }
  if (entry.id === "ice") {
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.fillRect(screen.x + 4 * state.zoom, screen.y + 5 * state.zoom, screen.w - 8 * state.zoom, 10 * state.zoom);
  }
  if (entry.id === "bumperL" || entry.id === "bumperR") {
    ctx.fillStyle = "#0b1322";
    ctx.beginPath();
    if (entry.id === "bumperL") {
      ctx.moveTo(screen.x + 8 * state.zoom, screen.y + 16 * state.zoom);
      ctx.lineTo(screen.x + 24 * state.zoom, screen.y + 8 * state.zoom);
      ctx.lineTo(screen.x + 24 * state.zoom, screen.y + 24 * state.zoom);
    } else {
      ctx.moveTo(screen.x + 24 * state.zoom, screen.y + 16 * state.zoom);
      ctx.lineTo(screen.x + 8 * state.zoom, screen.y + 8 * state.zoom);
      ctx.lineTo(screen.x + 8 * state.zoom, screen.y + 24 * state.zoom);
    }
    ctx.closePath();
    ctx.fill();
  }
  if (entry.id === "fan") {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(screen.x + 16 * state.zoom, screen.y + 16 * state.zoom, 11 * state.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(124,224,255,0.54)";
    ctx.strokeRect(screen.x + 10 * state.zoom, screen.y - 62 * state.zoom, 12 * state.zoom, 68 * state.zoom);
  }
  if (entry.id === "mine") {
    ctx.fillStyle = entry.cooldown > 0 ? "rgba(255,140,119,0.35)" : def.color;
    ctx.beginPath();
    ctx.arc(screen.x + 16 * state.zoom, screen.y + 16 * state.zoom, 11 * state.zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  if (entry.id === "warp") {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 4 * state.zoom;
    ctx.beginPath();
    ctx.arc(screen.x + 16 * state.zoom, screen.y + 16 * state.zoom, 12 * state.zoom, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (entry.id === "laser") {
    ctx.fillStyle = pulse ? "rgba(255,94,156,0.86)" : "rgba(255,94,156,0.24)";
    ctx.fillRect(screen.x + 14 * state.zoom, 0, 4 * state.zoom, canvas.height);
    ctx.fillStyle = def.color;
    ctx.fillRect(screen.x + 8 * state.zoom, screen.y + 8 * state.zoom, 16 * state.zoom, 16 * state.zoom);
  }
  if (entry.id === "saw") {
    const sawX = screen.x + 16 * state.zoom + Math.sin(state.time * 2.7 + entry.phase) * 24 * state.zoom;
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(sawX, screen.y + 16 * state.zoom, 12 * state.zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  if (entry.id === "cannon") {
    ctx.fillStyle = "#0b1322";
    ctx.fillRect(screen.x + 12 * state.zoom, screen.y + 8 * state.zoom, 18 * state.zoom, 10 * state.zoom);
  }
  if (entry.id === "flame") {
    ctx.fillStyle = pulse ? "rgba(255,135,72,0.9)" : "rgba(255,135,72,0.24)";
    ctx.fillRect(screen.x + 12 * state.zoom, screen.y - 54 * state.zoom, 8 * state.zoom, 58 * state.zoom);
  }
}

function drawPlayers() {
  const player = currentRunner();
  if (!player) return;
  const body = worldToScreenRect({ x: player.x, y: player.y, w: player.w, h: player.h });
  ctx.fillStyle = playerConfigs[player.id].color;
  ctx.fillRect(body.x, body.y, body.w, body.h);
  ctx.fillStyle = "#0b1322";
  ctx.fillRect(body.x + 6 * state.zoom, body.y + 8 * state.zoom, 4 * state.zoom, 4 * state.zoom);
  ctx.fillRect(body.x + 14 * state.zoom, body.y + 8 * state.zoom, 4 * state.zoom, 4 * state.zoom);
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.fillRect((particle.x - state.view.x) * state.zoom, (particle.y - state.view.y) * state.zoom, particle.size * state.zoom, particle.size * state.zoom);
  });
  ctx.globalAlpha = 1;
}

function drawProjectiles() {
  state.projectiles.forEach((entry) => {
    const rect = worldToScreenRect(entry);
    ctx.fillStyle = "#ffcf73";
    ctx.shadowColor = "#ffcf73";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 7 * state.zoom, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function getDraftCardRects() {
  if (!state.draftOptions.length || !["draft-select", "draft-place"].includes(state.phase)) return [];
  const cardW = 210;
  const cardH = 88;
  const gap = 18;
  const total = state.draftOptions.length * cardW + (state.draftOptions.length - 1) * gap;
  const startX = (canvas.width - total) / 2;
  const y = canvas.height - 114;
  return state.draftOptions.map((option, index) => ({ option, x: startX + index * (cardW + gap), y, w: cardW, h: cardH }));
}

function drawDraftOverlay() {
  if (!state.draftOptions.length || !["draft-select", "draft-place"].includes(state.phase)) {
    state.draftCards = [];
    return;
  }
  state.draftCards = getDraftCardRects();
  state.draftCards.forEach((card) => {
    const selected = state.currentDraft?.selected?.id === card.option.id;
    ctx.fillStyle = selected ? "rgba(135,244,208,0.34)" : "rgba(8,14,24,0.84)";
    ctx.fillRect(card.x, card.y, card.w, card.h);
    ctx.strokeStyle = selected ? "#87f4d0" : "rgba(246,231,178,0.24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x, card.y, card.w, card.h);
    ctx.fillStyle = card.option.color;
    ctx.fillRect(card.x + 12, card.y + 14, 22, 22);
    ctx.fillStyle = "#f6e7b2";
    ctx.font = "700 18px Trebuchet MS";
    ctx.fillText(card.option.name, card.x + 44, card.y + 32);
    ctx.font = "14px Trebuchet MS";
    ctx.fillText(card.option.desc, card.x + 14, card.y + 58);
  });
}

function drawPlacementGhost() {
  if (state.phase !== "draft-place" || !state.currentDraft?.selected || !state.hoverCell) return;
  const option = state.currentDraft.selected;
  const rect = worldToScreenRect(rectForCell(state.hoverCell.c, state.hoverCell.r, 2));
  const valid = option.id === "erase" ? Boolean(trapAtCell(state.hoverCell.c, state.hoverCell.r)) : canPlaceTrap(state.hoverCell.c, state.hoverCell.r);
  ctx.globalAlpha = 0.46;
  ctx.fillStyle = option.id === "erase" ? "#ffffff" : option.color;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = valid ? "#87f4d0" : "#ff6f61";
  ctx.lineWidth = 3;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function drawScene() {
  if (state.screenShake > 0) {
    ctx.save();
    ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
  }
  drawBackground();
  if (state.template) {
    drawWatcherEye();
    drawSolids();
    state.traps.forEach(drawTrap);
    drawGoal();
    drawProjectiles();
    drawPlayers();
    drawParticles();
    drawPlacementGhost();
    drawDraftOverlay();
  }
  if (state.screenShake > 0) {
    ctx.restore();
    state.screenShake = Math.max(0, state.screenShake - 1.2);
  }
}

function updateUi() {
  const phaseNames = { home: "Main Menu", ready: "Ready Phase", run: "Run Phase", between: "Next Round", paused: "Paused", "draft-select": "Trap Draft", "draft-place": "Trap Placement", gameover: "Match Over" };
  phaseLabel.textContent = phaseNames[state.phase] || state.phase;
  templateLabel.textContent = `Template: ${state.template?.name || "--"}`;
  redScoreLabel.textContent = `Red: ${state.players.red.score}`;
  blueScoreLabel.textContent = `Blue: ${state.players.blue.score}`;
  roundLabel.textContent = state.phase === "run" && state.activeRunner ? `Turn: ${playerConfigs[state.activeRunner].label}` : `Round: ${state.round}`;
  finishDraftButton.style.display = "none";
  startRoundButton.disabled = !["ready", "between"].includes(state.phase);
  resetRoundButton.disabled = state.phase === "home";
  if (["ready", "between"].includes(state.phase) && !state.currentDraft) {
    draftHeading.textContent = "Round Setup";
    draftLabel.textContent = `Between rounds: Red ${state.players.red.score} - Blue ${state.players.blue.score}.`;
  }
}

function renderSidebarDraft() {
  draftOptions.innerHTML = "";
  if (!state.draftOptions.length) {
    const note = document.createElement("div");
    note.className = "small-note";
    note.textContent = "Draft cards also appear on the game screen when a player loses.";
    draftOptions.appendChild(note);
    return;
  }
  state.draftOptions.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tool-button${state.currentDraft?.selected?.id === option.id ? " selected" : ""}`;
    button.innerHTML = `<strong>${option.name}</strong><br><span>${option.desc}</span>`;
    button.addEventListener("click", () => selectDraftOption(option.id));
    draftOptions.appendChild(button);
  });
}

function selectDraftOption(id) {
  if (!state.currentDraft) return;
  state.currentDraft.selected = state.draftOptions.find((option) => option.id === id) || null;
  state.phase = "draft-place";
  if (id === "erase") draftLabel.textContent = `Erase mode selected for ${playerConfigs[state.currentDraft.playerId].label}. Click an existing trap to remove it.`;
  else draftLabel.textContent = `Place 1 ${state.currentDraft.selected.name} trap for ${playerConfigs[state.currentDraft.playerId].label}.`;
  updateUi();
  renderSidebarDraft();
}

function canvasPointToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  return { x, y, worldX: x / state.zoom + state.view.x, worldY: y / state.zoom + state.view.y };
}

function handleCanvasMove(event) {
  const point = canvasPointToWorld(event);
  state.hoverCell = { c: Math.floor(point.worldX / GRID), r: Math.floor(point.worldY / GRID) };
}

function handleCanvasClick(event) {
  const point = canvasPointToWorld(event);
  const clickedCard = state.draftCards.find((card) => point.x >= card.x && point.x <= card.x + card.w && point.y >= card.y && point.y <= card.y + card.h);
  if (clickedCard) { selectDraftOption(clickedCard.option.id); return; }
  if (state.phase === "draft-place" && state.hoverCell) tryUseDraftAtCell(state.hoverCell.c, state.hoverCell.r);
}

async function toggleFullscreen() {
  if (document.fullscreenElement === gameShell) { await document.exitFullscreen(); return; }
  if (gameShell.requestFullscreen) await gameShell.requestFullscreen();
}

function tick(timestamp) {
  const dt = Math.min(((timestamp - state.lastFrame) || 16) / 1000, 0.032);
  state.lastFrame = timestamp;
  state.time += dt;
  state.eyeMessageTimer = Math.max(0, state.eyeMessageTimer - dt);
  refreshZoom();
  updateParticles(dt);
  if (state.phase === "run") updateRun(dt);
  updateCamera();
  drawScene();
  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === SETTINGS_KEY && !event.repeat) { toggleSettings(); event.preventDefault(); return; }
  keys.add(key);
  if (["arrowleft", "arrowright", "arrowup", " "].includes(key)) event.preventDefault();
});
window.addEventListener("keyup", (event) => { keys.delete(event.key.toLowerCase()); });
canvas.addEventListener("mousemove", handleCanvasMove);
canvas.addEventListener("click", handleCanvasClick);
startRoundButton.addEventListener("click", startRound);
resetRoundButton.addEventListener("click", resetCurrentRound);
fullscreenButton.addEventListener("click", () => { toggleFullscreen().catch(() => {}); });
newMatchButton.addEventListener("click", () => { startNewMatch(); showMainMenu(); });
finishDraftButton.addEventListener("click", () => {});
menuStartButton.addEventListener("click", () => { hideMainMenu(); startNewMatch(); startRound(); });
menuFullscreenButton.addEventListener("click", () => { toggleFullscreen().catch(() => {}); });
resumeButton.addEventListener("click", () => toggleSettings());
resetMatchButton.addEventListener("click", () => { settingsOverlay.classList.add("hidden"); startNewMatch(); startRound(); });
returnMenuButton.addEventListener("click", () => { settingsOverlay.classList.add("hidden"); startNewMatch(); showMainMenu(); });
document.addEventListener("fullscreenchange", refreshZoom);

buildTrapToggles();
startNewMatch();
showMainMenu();
requestAnimationFrame(tick);
