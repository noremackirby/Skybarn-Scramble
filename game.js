const gameShell = document.getElementById("gameShell");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const eyeDialogOverlay = document.getElementById("eyeDialogOverlay");
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
const menuRematchButton = document.getElementById("menuRematchButton");
const menuFullscreenButton = document.getElementById("menuFullscreenButton");
const menuBackButton = document.getElementById("menuBackButton");
const menuEntrySection = document.getElementById("menuEntrySection");
const menuSetupSection = document.getElementById("menuSetupSection");
const chooseVersusButton = document.getElementById("chooseVersusButton");
const chooseStoryButton = document.getElementById("chooseStoryButton");
const entryBuilderButton = document.getElementById("entryBuilderButton");
const openBuilderButton = document.getElementById("openBuilderButton");
const resumeButton = document.getElementById("resumeButton");
const resetMatchButton = document.getElementById("resetMatchButton");
const returnMenuButton = document.getElementById("returnMenuButton");
const zoomSlider = document.getElementById("zoomSlider");
const zoomValueLabel = document.getElementById("zoomValueLabel");
const trapToggleList = document.getElementById("trapToggleList");
const menuTitle = document.getElementById("menuTitle");
const menuSubtitle = document.getElementById("menuSubtitle");
const playModeSelect = document.getElementById("playModeSelect");
const storyInfoSection = document.getElementById("storyInfoSection");
const storyModeLabel = document.getElementById("storyModeLabel");
const gameModeSelect = document.getElementById("gameModeSelect");
const aiDifficultySection = document.getElementById("aiDifficultySection");
const aiDifficultySelect = document.getElementById("aiDifficultySelect");
const targetScoreInput = document.getElementById("targetScoreInput");
const mapList = document.getElementById("mapList");
const selectedMapLabel = document.getElementById("selectedMapLabel");

const GRID = 32;
const PLAYER_W = 24;
const PLAYER_H = 30;
const RUN_SPEED = 4.4;
const GRAVITY = 0.58;
const JUMP_VELOCITY = -13.2;
const AUTO_ROUND_DELAY = 1600;
const SETTINGS_KEY = "`";
const LOCAL_MAP_KEY = "skybarn-custom-maps-v1";
const PLAYTEST_MAP_KEY = "skybarn-playtest-map-v1";
const DEFAULT_TARGET_SCORE = 5;
const ROTATIONS = [0, 90, 180, 270];
const MAX_PARTICLES = 520;
const MORTAR_GRAVITY = 0.18;
const MORTAR_BLAST_RADIUS = GRID * 1.5;
const SPAWN_IFRAME_TIME = 1;
const WORMHOLE_COOLDOWN = 0.45;
const DEVOUT_RADIUS = 10;
const FULLSCREEN_ZOOM_KEY = "skybarn-fullscreen-zoom-v1";
const keys = new Set();

const trapCatalog = [
  { id: "crate", name: "Crate", color: "#d99853", desc: "Solid wood block.", solid: true, placement: "free", rotatable: false, length: 1 },
  { id: "spikes", name: "Spikes", color: "#ff6f61", desc: "3-wide hazard strip that must stick to solid surfaces.", solid: false, placement: "surface", rotatable: true, length: 3 },
  { id: "slime", name: "Slime Layer", color: "#96ef62", desc: "3-wide layer for solid surfaces. Slows by 75%.", solid: false, placement: "surface", rotatable: true, length: 3 },
  { id: "ice", name: "Ice Sheet", color: "#8ee0ff", desc: "3-wide slick surface. Faster, but much less control.", solid: false, placement: "surface", rotatable: true, length: 3 },
  { id: "button", name: "Pressure Plate", color: "#7ee6b5", desc: "Map-maker trigger plate.", solid: false, placement: "free", rotatable: false, length: 1, makerOnly: true, usesChannel: true },
  { id: "lever", name: "Lever", color: "#ffc96f", desc: "Map-maker toggle trigger.", solid: false, placement: "free", rotatable: false, length: 1, makerOnly: true, usesChannel: true },
  { id: "door", name: "Door", color: "#8f9fb8", desc: "Map-maker door block.", solid: true, placement: "free", rotatable: false, length: 1, makerOnly: true, usesChannel: true },
  { id: "mover", name: "Mover", color: "#7ac8ff", desc: "Map-maker moving block.", solid: true, placement: "free", rotatable: true, length: 1, makerOnly: true, usesChannel: true },
  { id: "fan", name: "Updraft", color: "#7ce0ff", desc: "Much stronger lift field.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "mine", name: "Mine", color: "#ff8c77", desc: "Explodes on contact.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "laser", name: "Laser Post", color: "#ff5e9c", desc: "Periodic beam hazard.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "saw", name: "Saw Drone", color: "#d2d7df", desc: "Buzzing moving blade.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "buzzsaw", name: "Buzzsaw", color: "#ff8c61", desc: "Turns around when it reaches blocking geometry.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "cannon", name: "Cannon", color: "#b98cff", desc: "Spits projectiles.", solid: true, placement: "free", rotatable: true, length: 1 },
  { id: "missile", name: "Missile Shrine", color: "#ffb48a", desc: "Launches a homing missile that hunts the runner.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "rocket", name: "Rocket Rail", color: "#ffd36b", desc: "A rideable rocket zips along a fixed lane.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "snare", name: "Thorn Snare", color: "#93d36a", desc: "Grabs the runner and ruins their movement.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "mortar", name: "Mortar Idol", color: "#c7d2e2", desc: "Lobs an arcing shell through the room.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "devoutDash", name: "Dash Devout", color: "#b4ff9a", desc: "Locks on, then lunges at the runner's last seen position.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "devoutCrawler", name: "Crawler Devout", color: "#9ef4c8", desc: "A tiny eye that ricochets around the room.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "devoutRanger", name: "Ranger Devout", color: "#ff8a98", desc: "Keeps its distance, blinks, and fires bloody bullets.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "oneway", name: "One Way Block", color: "#d7f0ff", desc: "Passes runners in one direction only.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "flame", name: "Fire Jet", color: "#ff8748", desc: "Shoots a temporary 3-block flame column.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "shock", name: "Tesla Coil", color: "#f7e07a", desc: "Throws erratic zigzag lightning bolts.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "gravity", name: "Black Hole", color: "#96a7ff", desc: "Drags runners inward with a hungry pull.", solid: false, placement: "free", rotatable: false, length: 1 }
];
const ERASE_OPTION = { id: "erase", name: "Erase Trap", color: "#e9eef5", desc: "Remove one placed trap.", placement: "erase", rotatable: false, length: 1 };
const eyeLines = [
  "Intresting. . .",
  "That finish tile is the only mercy here.",
  "You slide like regret on wet glass.",
  "I watched that dash. It was almost clever.",
  "The floor is learning your weight.",
  "Failure still decorates my maze best.",
  "Your route looked better before fear touched it.",
  "I can hear the cooldown ticking in your chest.",
  "Every custom map is another room in my body.",
  "Choose carefully. I enjoy your architecture.",
  "You look brighter right before the trap takes you.",
  "The black hole hums when it tastes panic.",
  "I love when the tesla bites the air by surprise.",
  "Your feet are such honest liars.",
  "The room keeps a ledger. Your mistakes are in bold.",
  "Every restart pulls the walls a little closer.",
  "You are getting faster at disappointment.",
  "The checkpoint only counts if you live long enough to deserve it.",
  "Some traps are cruel. Your timing is kinder to them than to yourself.",
  "I admire how bravely you keep feeding the same gap.",
  "There is a version of you that clears this. I have not met them yet."
];
const eyeReactions = {
  missile: { mood: "ecstatic", lines: ["The shrine curved toward your panic beautifully.", "You heard the missile thinking too late."] },
  mine: { mood: "glee", lines: ["A bigger blast makes a louder lesson.", "The mine turned one mistake into a crater."] },
  saw: { mood: "delighted", lines: ["The saw sang across the rail just for you.", "Every tooth on that blade knew your name."] },
  buzzsaw: { mood: "glee", lines: ["The buzzsaw kissed the wall, turned, and came back for the rest of you.", "That blade learned the room faster than you did."] },
  slimefail: { mood: "curious", lines: ["Slime makes cowards of knees and ankles alike.", "You drowned in hesitation before you reached the pit."] },
  goal: { mood: "wrath", lines: ["You touched the finish and I hated it instantly.", "The checkered tile betrayed me again."] },
  tesla: { mood: "glee", lines: ["The tesla coil traced your outline in ruin.", "Crooked lightning suits crooked routes."] },
  mortar: { mood: "hungry", lines: ["A shell from above. Such a clean interruption.", "The mortar measured your arc and answered it."] },
  flame: { mood: "glee", lines: ["That fire jet waited for the exact wrong second.", "You stood in the breath of the room."] },
  laser: { mood: "annoyed", lines: ["A straight beam for a crooked runner.", "You still tried to argue with a line of light."] },
  rocket: { mood: "delighted", lines: ["You mistook exhaust for kindness.", "The rocket kept its promise. You did not."] },
  spikes: { mood: "hungry", lines: ["Spikes are honest. They never pretend to forgive.", "Those points were waiting before you were born."] },
  generic: { mood: "delighted", lines: ["Failure still decorates my maze best.", "You make collapsing look ceremonial."] }
};
const eyeMoods = {
  hungry: { iris: "#9d6070", sclera: "#f1d5c2", ring: "rgba(255,98,131,0.32)", lid: 0.18, lowerLid: 0.08, jitter: 0.6, pupil: 1, tilt: 0, pinch: 0.08 },
  anticipation: { iris: "#ff9e6d", sclera: "#f4dfc9", ring: "rgba(255,197,122,0.34)", lid: 0.1, lowerLid: 0.06, jitter: 1.1, pupil: 0.92, tilt: 0.04, pinch: 0.04 },
  delighted: { iris: "#ff5e9c", sclera: "#f6d6d8", ring: "rgba(255,94,156,0.42)", lid: 0.06, lowerLid: 0.1, jitter: 2.4, pupil: 0.84, tilt: -0.03, pinch: 0.02 },
  annoyed: { iris: "#82c8ff", sclera: "#dce8ff", ring: "rgba(122,213,255,0.34)", lid: 0.28, lowerLid: 0.16, jitter: 1.5, pupil: 0.76, tilt: 0.08, pinch: 0.14 },
  glee: { iris: "#ff7c58", sclera: "#f8d7c6", ring: "rgba(255,140,119,0.4)", lid: 0.03, lowerLid: 0.04, jitter: 2.9, pupil: 0.72, tilt: -0.07, pinch: 0.02 },
  wrath: { iris: "#ff3d3d", sclera: "#f3d0cf", ring: "rgba(255,61,61,0.48)", lid: 0.38, lowerLid: 0.2, jitter: 3.4, pupil: 0.62, tilt: 0.12, pinch: 0.18 },
  curious: { iris: "#c7a7ff", sclera: "#efe6ff", ring: "rgba(199,167,255,0.42)", lid: 0.14, lowerLid: 0.05, jitter: 1.8, pupil: 1.18, tilt: -0.05, pinch: 0.06 },
  ecstatic: { iris: "#ffd36b", sclera: "#fff0cb", ring: "rgba(255,211,107,0.5)", lid: 0.02, lowerLid: 0.02, jitter: 4.2, pupil: 0.56, tilt: -0.11, pinch: 0.01 }
};
const playerConfigs = {
  red: { label: "Red", color: "#ff6b6b", left: "a", right: "d", jump: "w", dash: "s" },
  blue: { label: "Blue", color: "#64b5ff", left: "arrowleft", right: "arrowright", jump: "arrowup", dash: "arrowdown" },
  purple: { label: "Purple", color: "#b27cff", left: "j", right: "l", jump: "i", dash: "k" }
};
const aiProfiles = {
  easy: { reaction: 0.24, jumpBias: 0.78, dashBias: 0.25, trapSkill: 0.4, routeLookahead: 3 },
  medium: { reaction: 0.14, jumpBias: 0.9, dashBias: 0.55, trapSkill: 0.68, routeLookahead: 4 },
  hard: { reaction: 0.07, jumpBias: 0.97, dashBias: 0.82, trapSkill: 0.88, routeLookahead: 5 }
};

function makeStoryLevel(id, name, relic, template, checkpoints, dialog = []) {
  return { id, name, relic, template, checkpoints, dialog };
}

function p(c, r, w = 4, h = 1) { return { c, r, w, h }; }
function trap(id, c, r, rotation = 0, meta = {}) { return { id, c, r, rotation, cooldown: 0, phase: Math.random() * Math.PI * 2, ...meta }; }
function makeTemplate(id, name, orientation, sky, goal, spawns, platforms, presets = [], meta = {}) {
  const platformObjects = platforms.map((entry) => p(entry[0], entry[1], entry[2], entry[3] || 1));
  const ironPlatformObjects = (meta.ironPlatforms || []).map((entry) => p(entry[0], entry[1], entry[2], entry[3] || 1));
  const storySpawn = spawns.story || spawns.red;
  const allPlatformObjects = [...platformObjects, ...ironPlatformObjects];
  const derivedCols = Math.max(goal[0] + (goal[2] || 4) + 4, spawns.red[0] + 6, spawns.blue[0] + 6, storySpawn[0] + 6, ...allPlatformObjects.map((entry) => entry.c + entry.w + 2));
  const derivedRows = Math.max(goal[1] + 6, spawns.red[1] + 6, spawns.blue[1] + 6, storySpawn[1] + 6, ...allPlatformObjects.map((entry) => entry.r + entry.h + 4));
  return {
    id,
    name,
    orientation,
    sky,
    goal: { c: goal[0], r: goal[1], w: goal[2] || 4 },
    spawns: {
      red: { c: spawns.red[0], r: spawns.red[1] },
      blue: { c: spawns.blue[0], r: spawns.blue[1] },
      story: { c: storySpawn[0], r: storySpawn[1] }
    },
    checkpoints: (meta.checkpoints || []).map((entry) => ({ c: entry[0], r: entry[1] })),
    platforms: platformObjects,
    ironPlatforms: ironPlatformObjects,
    presets: presets.map((entry) => Array.isArray(entry)
      ? trap(entry[0], entry[1], entry[2], entry[3] || 0, entry[4] ? { channel: entry[4] } : {})
      : trap(entry.id, entry.c, entry.r, entry.rotation || 0, entry.channel ? { channel: entry.channel } : {})),
    bounds: { cols: meta.cols || derivedCols, rows: meta.rows || derivedRows },
    noDraft: Boolean(meta.noDraft),
    suddenDeath: Boolean(meta.suddenDeath)
  };
}

const builtinTemplates = [
  makeTemplate("h1", "Needle Steps", "horizontal", ["#0e1b33", "#1d3d5a"], [54, 9, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10, 2], [13, 23, 6], [22, 20, 6], [31, 18, 5], [39, 15, 6], [48, 12, 5]], [["fan", 23, 19, 0], ["laser", 40, 14, 0]]),
  makeTemplate("h2", "Long Drop Gallery", "horizontal", ["#10273a", "#284f60"], [55, 11, 4], { red: [2, 25], blue: [5, 25] }, [[0, 27, 11], [14, 24, 6], [23, 21, 6], [32, 18, 6], [41, 15, 6], [50, 12, 6]], [["mine", 33, 17], ["saw", 42, 14]]),
  makeTemplate("h3", "Wick Spiral", "horizontal", ["#161e3d", "#523f72"], [53, 8, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 9, 2], [12, 22, 5], [19, 18, 6], [28, 15, 5], [35, 12, 6], [44, 10, 5]], [["flame", 20, 17, 0], ["laser", 45, 9, 90]]),
  makeTemplate("h4", "Cage Runners", "horizontal", ["#13263d", "#345f52"], [54, 12, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10, 2], [13, 23, 5], [21, 20, 5], [29, 18, 6], [38, 16, 6], [47, 13, 5]], [["cannon", 30, 17, 0], ["ice", 47, 12, 0]]),
  makeTemplate("h5", "Thin Mercy", "horizontal", ["#182240", "#2f4b7f"], [55, 10, 4], { red: [2, 25], blue: [5, 25] }, [[0, 27, 11], [14, 24, 5], [21, 21, 5], [29, 18, 6], [38, 15, 6], [47, 12, 5]], [["fan", 29, 17, 0], ["crate", 48, 11]]),
  makeTemplate("h6", "Skyline Pins", "horizontal", ["#132340", "#3a5170"], [54, 7, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10], [13, 22, 5], [21, 18, 6], [30, 15, 5], [38, 12, 6], [47, 9, 5]], [["fan", 22, 17, 0], ["saw", 48, 8]]),
  makeTemplate("h7", "Grin Ladder", "horizontal", ["#181d36", "#60496e"], [53, 9, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10, 2], [13, 22, 6], [22, 19, 5], [30, 16, 6], [39, 13, 5], [47, 10, 5]], [["laser", 31, 15, 90], ["fan", 48, 9, 90]]),
  makeTemplate("h8", "Quiet Teeth", "horizontal", ["#102032", "#355a67"], [55, 11, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10], [14, 23, 6], [23, 20, 6], [32, 17, 5], [40, 14, 6], [49, 12, 5]], [["mine", 24, 19], ["spikes", 49, 11, 0]]),
  makeTemplate("h9", "Chapel Gaps", "horizontal", ["#1a213c", "#45506f"], [54, 8, 4], { red: [2, 25], blue: [5, 25] }, [[0, 27, 11], [14, 24, 6], [23, 21, 6], [32, 18, 6], [41, 14, 6], [50, 10, 5]], [["laser", 24, 20, 0], ["fan", 50, 9, 0]]),
  makeTemplate("h10", "Bell Hunger", "horizontal", ["#11233b", "#2a465a"], [54, 7, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10], [13, 22, 6], [22, 18, 6], [31, 14, 6], [40, 11, 6], [49, 8, 5]], [["cannon", 32, 13, 0], ["flame", 50, 7, 0]]),
  makeTemplate("v1", "Tower Puncture", "vertical", ["#142245", "#28436c"], [26, 4, 4], { red: [25, 26], blue: [29, 26] }, [[22, 27, 12, 2], [24, 23, 6], [30, 20, 5], [22, 17, 6], [30, 14, 5], [23, 11, 6], [28, 8, 5]], [["fan", 25, 22, 0], ["laser", 31, 13, 90]]),
  makeTemplate("v2", "Lantern Shaft", "vertical", ["#17253f", "#4b4d76"], [28, 3, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [22, 24, 5], [30, 21, 5], [24, 18, 5], [32, 15, 5], [23, 12, 6], [30, 8, 5], [26, 5, 5]], [["saw", 24, 17], ["mine", 31, 20]]),
  makeTemplate("v3", "Pillar Gullet", "vertical", ["#10263f", "#375f6b"], [27, 4, 4], { red: [23, 26], blue: [28, 26] }, [[20, 27, 14, 2], [21, 23, 6], [30, 20, 4], [22, 17, 5], [29, 14, 5], [23, 11, 5], [30, 8, 4]], [["flame", 31, 13, 0], ["gravity", 25, 16]]),
  makeTemplate("v4", "Stained Climb", "vertical", ["#141e36", "#60496e"], [29, 4, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [25, 24, 4], [31, 21, 4], [23, 18, 4], [30, 15, 4], [24, 12, 4], [31, 9, 4], [26, 6, 4]], [["laser", 31, 20, 90], ["fan", 23, 17, 90]]),
  makeTemplate("v5", "Crown Well", "vertical", ["#17233a", "#2c526a"], [26, 3, 4], { red: [23, 26], blue: [28, 26] }, [[21, 27, 13, 2], [22, 24, 5], [29, 21, 5], [23, 18, 5], [30, 15, 5], [24, 12, 5], [29, 9, 5], [24, 6, 5]], [["crate", 29, 20], ["fan", 24, 11, 0]]),
  makeTemplate("v6", "Needle Choir", "vertical", ["#101f35", "#4d557a"], [28, 4, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [24, 24, 5], [31, 22, 4], [23, 19, 5], [30, 16, 4], [24, 13, 5], [31, 10, 4], [25, 7, 5]], [["spikes", 24, 23, 0], ["shock", 31, 15]]),
  makeTemplate("v7", "Chimney Teeth", "vertical", ["#112640", "#35556e"], [27, 4, 4], { red: [23, 26], blue: [28, 26] }, [[21, 27, 13, 2], [22, 24, 5], [30, 21, 5], [22, 18, 5], [30, 15, 5], [22, 12, 5], [30, 9, 5]], [["laser", 23, 17, 0], ["mine", 31, 14]]),
  makeTemplate("v8", "Pale Elevator", "vertical", ["#182240", "#355b78"], [29, 5, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [27, 24, 5], [22, 21, 5], [30, 18, 5], [23, 15, 5], [31, 12, 4], [24, 9, 5], [29, 6, 5]], [["gravity", 27, 17], ["fan", 24, 8, 0]]),
  makeTemplate("v9", "Ash Ladder", "vertical", ["#161f38", "#44516c"], [26, 4, 4], { red: [23, 26], blue: [28, 26] }, [[21, 27, 13, 2], [22, 24, 5], [29, 21, 5], [23, 18, 5], [30, 15, 5], [24, 12, 5], [29, 9, 5], [24, 6, 5]], [["cannon", 30, 14, 180], ["shock", 24, 11]]),
  makeTemplate("v10", "Choir Drop", "vertical", ["#10243d", "#2f4f66"], [28, 3, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [23, 24, 5], [31, 21, 4], [24, 18, 5], [32, 15, 4], [25, 12, 5], [31, 9, 4], [27, 6, 4]], [["flame", 31, 20, 0], ["slime", 25, 11, 0]])
  ];

function span(list, id, start, end, row, rotation = 0) {
  for (let c = start; c <= end; c += 1) list.push([id, c, row, rotation]);
}
function column(list, id, col, start, end, rotation = 0) {
  for (let r = start; r <= end; r += 1) list.push([id, col, r, rotation]);
}
function rectFill(list, id, c, r, w, h, rotation = 0) {
  for (let rr = 0; rr < h; rr += 1) for (let cc = 0; cc < w; cc += 1) list.push([id, c + cc, r + rr, rotation]);
}
function storyBoxPlatforms() {
  return [
    [51, 0, 4, 1],
    [5, 3, 1, 1],
    [10, 4, 2, 1],
    [0, 5, 6, 1],
    [8, 15, 1, 1],
    [11, 18, 3, 1],
    [17, 18, 3, 1],
    [23, 18, 3, 1],
    [50, 18, 1, 1],
    [48, 22, 1, 1],
    [0, 23, 5, 1]
  ];
}
function baseStoryCrates() {
  const presets = [];
  span(presets, "crate", 0, 55, 0);
  column(presets, "crate", 0, 1, 4);
  column(presets, "crate", 0, 15, 22);
  column(presets, "crate", 4, 18, 22);
  span(presets, "crate", 5, 7, 18);
  span(presets, "crate", 0, 31, 15);
  column(presets, "crate", 5, 19, 23);
  column(presets, "crate", 6, 19, 23);
  column(presets, "crate", 7, 19, 23);
  span(presets, "crate", 7, 31, 23);
  column(presets, "crate", 31, 18, 23);
  column(presets, "crate", 32, 18, 23);
  column(presets, "crate", 33, 18, 23);
  span(presets, "crate", 32, 50, 15);
  span(presets, "crate", 33, 49, 23);
  column(presets, "crate", 49, 18, 23);
  column(presets, "crate", 50, 4, 23);
  span(presets, "crate", 51, 55, 23);
  column(presets, "crate", 55, 0, 23);
  span(presets, "crate", 5, 49, 4);
  return presets;
}
function removeCells(presets, cells) {
  const blocked = new Set(cells.map(([c, r]) => `${c},${r}`));
  return presets.filter((entry) => !(entry[0] === "crate" && blocked.has(`${entry[1]},${entry[2]}`)));
}
function storyDialog(levelName, relic, threat) {
  return [
    `Another corridor, another promise. Break my chain and I spare your soul from the furnace below.`,
    `${levelName} carries the ${relic}. Reach the key, snap the lock, and maybe I let damnation miss you once.`,
    threat
  ];
}
function createStoryBoxLevel(id, name, relic, sky, hazardBuilder, checkpoints, dialogTail) {
  let presets = baseStoryCrates();
  const extras = [];
  const carveCells = [];
  hazardBuilder(extras, carveCells);
  presets = removeCells(presets, carveCells).concat(extras);
  return makeStoryLevel(
    id,
    name,
    relic,
    makeTemplate(id, name, "horizontal", sky, [1, 4, 4], { red: [2, 22], blue: [2, 22], story: [2, 22] }, storyBoxPlatforms(), presets, { cols: 56, rows: 26, noDraft: true }),
    checkpoints,
    storyDialog(name, relic, dialogTail)
  );
}
const storyLevels = [];

const state = {
  phase: "home",
  previousPhase: null,
  mode: "versus",
  round: 1,
  time: 0,
  lastFrame: 0,
  template: null,
  targetScore: DEFAULT_TARGET_SCORE,
  gameMode: "single",
  aiDifficulty: "medium",
  selectedMapId: builtinTemplates[0].id,
  menuStage: "entry",
  players: { red: createPlayer("red"), blue: createPlayer("blue"), purple: createPlayer("purple") },
  traps: [],
  projectiles: [],
  mortarBursts: [],
  particles: [],
  draftQueue: [],
  currentDraft: null,
  draftOptions: [],
  runOrder: ["red", "blue"],
  activeRunner: null,
  completedRuns: [],
  runRecords: [],
  currentRunTime: 0,
  hoverCell: null,
  draftCards: [],
  enabledTrapIds: new Set(trapCatalog.filter((entry) => !entry.makerOnly).map((entry) => entry.id)),
  activeChannels: new Set(),
  eyeMood: "hungry",
  eyeLine: "Intresting. . .",
  eyeMessageTimer: 0,
  screenShake: 0,
  lastWinnerId: null,
  view: { x: 0, y: 0 },
  zoom: 1,
  fullscreenZoom: loadFullscreenZoomPref(),
  autoRoundHandle: null,
  customMaps: [],
  ai: { thinkTimer: 0, controls: { left: false, right: false, jump: false, dash: false }, draftTimer: 0 },
  story: {
    levelIndex: 0,
    attempts: 0,
    totalAttempts: 0,
    checkpointIndex: -1,
    checkpoint: null,
    relics: [],
    chainsBroken: 0,
    justRespawned: false,
    customTemplateId: null,
    pendingIntro: false,
    cutsceneIndex: 0,
    cutsceneLines: [],
    pendingAdvance: null,
    breakTimer: 0
  }
};
let audioCtx = null;
let audioUnlocked = false;

function createPlayer(id) {
  return { id, x: 0, y: 0, w: PLAYER_W, h: PLAYER_H, vx: 0, vy: 0, grounded: false, alive: true, score: 0, outcome: null, surface: "normal", facing: id === "red" ? 1 : -1, dashTimer: 0, dashCooldown: 0, dashDirection: 0, snareTimer: 0, slimeTouchTimer: 0, lastDeathCause: null, emberTimer: 0, spawnShield: 0, wormholeCooldown: 0 };
}
function activePlayerIds() { return state.gameMode === "cpu" ? ["blue", "purple"] : state.gameMode === "single" ? ["red", "blue"] : ["red", "blue"]; }
function isAIPlayer(id) { return state.gameMode === "cpu" ? id === "blue" || id === "purple" : state.gameMode === "single" ? id === "blue" : false; }
function displayLabel(id) {
  if (id === "blue" && isAIPlayer("blue")) return "Green";
  return playerConfigs[id].label;
}
function displayColor(id) {
  if (id === "blue" && isAIPlayer("blue")) return "#53e37a";
  return playerConfigs[id].color;
}
function currentStoryLevel() {
  const selectedTemplate = state.template || findTemplateById(state.selectedMapId);
  if (!selectedTemplate) return null;
  const builtinStory = storyLevels.find((entry) => entry.template.id === selectedTemplate.id);
  if (builtinStory) return builtinStory;
  return {
    id: selectedTemplate.id,
    name: selectedTemplate.name,
    relic: "Route Sigil",
    template: selectedTemplate,
    checkpoints: selectedTemplate.checkpoints || [],
    dialog: [
      "Choose any chamber you want. The eye no longer decides the order.",
      `${selectedTemplate.name} is open. Reach the goal and claim the sigil inside.`,
      "Prove the map is survivable, in whatever order pleases you."
    ]
  };
}
function storyChainTotal() { return 1; }
function storyStartSpawn() { return state.story.checkpoint || state.template?.spawns?.story || state.template?.spawns?.red || { c: 2, r: 2 }; }
function storyAttemptLine() {
  const attempts = state.story.attempts;
  if (attempts <= 0) return "Attempt 1. Hope still fits in your mouth.";
  if (attempts === 1) return "Attempt 2. The room has your measure now.";
  if (attempts === 2) return "Attempt 3. Surprise is already rotting into habit.";
  if (attempts === 3) return "Attempt 4. Your confidence has started shedding in strips.";
  if (attempts === 4) return "Attempt 5. Five tries is the first real prayer.";
  if (attempts < 8) return `Attempt ${attempts + 1}. Early stumbles always look the most innocent.`;
  if (attempts < 12) return `Attempt ${attempts + 1}. You are in the learning phase, which is what losers call bleeding slowly.`;
  if (attempts < 16) return `Attempt ${attempts + 1}. Even your checkpoint is beginning to sound nervous.`;
  if (attempts < 22) return `Attempt ${attempts + 1}. This chamber can now predict your panic before your body does.`;
  if (attempts < 30) return `Attempt ${attempts + 1}. Stubbornness is carrying you farther than skill for the moment.`;
  if (attempts < 40) return `Attempt ${attempts + 1}. The walls know your route so well they are humming along.`;
  if (attempts < 55) return `Attempt ${attempts + 1}. You have crossed from persistence into ritual.`;
  if (attempts < 75) return `Attempt ${attempts + 1}. At this milestone I usually start charging rent.`;
  return `Attempt ${attempts + 1}. If suffering has refined you into anything useful, I will be the first to notice.`;
}
function getStorySelectableTemplates() {
  return getAllTemplates().filter((entry) => entry.name?.toLowerCase().includes("story"));
}
function beginStoryCutscene() {
  const level = currentStoryLevel();
  if (!level) return;
  state.story.cutsceneLines = level.dialog?.length ? [...level.dialog, storyAttemptLine()] : [
    "Another chain. Another bargain.",
    `Reach the key in ${level.name} and I may spare your soul from damnation.`,
    "Prove you still deserve escape.",
    storyAttemptLine()
  ];
  state.story.cutsceneIndex = 0;
  state.story.pendingIntro = false;
  state.phase = "cutscene";
  setEyeMood("curious", state.story.cutsceneLines[0]);
  messageLabel.textContent = `${level.name}. The eye has something to say.`;
  updateUi();
}
function syncEyeDialogOverlay() {
  if (!eyeDialogOverlay) return;
  if (state.eyeMessageTimer > 0 && state.eyeLine) {
    eyeDialogOverlay.textContent = state.eyeLine;
    eyeDialogOverlay.classList.remove("hidden");
    return;
  }
  eyeDialogOverlay.textContent = "";
  eyeDialogOverlay.classList.add("hidden");
}
function advanceStoryCutscene() {
  if (state.phase !== "cutscene") return;
  state.story.cutsceneIndex += 1;
  if (state.story.cutsceneIndex >= state.story.cutsceneLines.length) {
    state.phase = "run";
    const level = currentStoryLevel();
    messageLabel.textContent = `${level.name}. Attempt ${state.story.attempts + 1}. Reach the key and break the chain.`;
    setEyeMood("anticipation", chooseEyeLine());
    updateUi();
    return;
  }
  setEyeMood("curious", state.story.cutsceneLines[state.story.cutsceneIndex]);
}
function triggerStoryChainBreak(storyWinner, nextLevel) {
  state.story.pendingAdvance = { storyWinner, nextLevel };
  state.story.breakTimer = 2.7;
  state.phase = "story-break";
  setEyeMood("ecstatic", `The ${storyWinner.relic} is yours. The route gave way at last.`);
  messageLabel.textContent = nextLevel
    ? `${storyWinner.relic} claimed. ${storyChainTotal() - state.story.chainsBroken} clears remain.`
    : `${storyWinner.relic} claimed. Story clear complete.`;
  updateUi();
}
function resolveStoryChainBreak() {
  const pending = state.story.pendingAdvance;
  if (!pending) return;
  const { storyWinner } = pending;
  state.story.pendingAdvance = null;
  state.story.breakTimer = 0;
  showMainMenu("Soul Unbound", `You cleared ${storyWinner.name} and claimed the ${storyWinner.relic}. Pick any story map and go again.`, "setup");
}
function currentAiProfile() { return aiProfiles[state.aiDifficulty] || aiProfiles.medium; }
function updateModeVisibility() {
  const storyMode = playModeSelect.value === "story";
  const aiEnabled = !storyMode && (gameModeSelect.value === "single" || gameModeSelect.value === "cpu");
  storyInfoSection.classList.toggle("hidden", !storyMode);
  gameModeSelect.closest(".menu-section").classList.toggle("hidden", storyMode);
  aiDifficultySection.classList.toggle("hidden", !aiEnabled);
  aiDifficultySelect.disabled = !aiEnabled;
  targetScoreInput.closest(".menu-section").classList.toggle("hidden", storyMode);
  trapToggleList.closest(".menu-section").classList.toggle("hidden", storyMode);
  mapList.closest(".menu-section").classList.toggle("hidden", false);
  if (storyMode) {
    const available = getStorySelectableTemplates();
    if (!available.some((entry) => entry.id === state.selectedMapId)) state.selectedMapId = available[0]?.id || state.selectedMapId;
  } else if (!getAllTemplates().some((entry) => entry.id === state.selectedMapId)) {
    state.selectedMapId = builtinTemplates[0].id;
  }
  storyModeLabel.textContent = storyMode
    ? `Choose any map for Story Mode. Attempts are tracked per map, and each story run stands on its own.`
    : storyModeLabel.textContent;
}
function scoreLine() {
  const ids = activePlayerIds();
  return ids.map((id) => `${displayLabel(id)} ${state.players[id].score}`).join(" - ");
}
function setMenuStage(stage, forcedMode = null) {
  state.menuStage = stage;
  if (forcedMode) playModeSelect.value = forcedMode;
  const setupVisible = stage === "setup";
  menuEntrySection.classList.toggle("hidden", setupVisible);
  menuSetupSection.classList.toggle("hidden", !setupVisible);
  menuBackButton.classList.toggle("hidden", !setupVisible);
  menuStartButton.classList.toggle("hidden", !setupVisible);
  openBuilderButton.classList.toggle("hidden", !setupVisible);
  if (setupVisible) {
    menuSubtitle.textContent = playModeSelect.value === "story"
      ? "Choose your story map and then begin the gauntlet."
      : "Choose traps, points, and a map before starting the match.";
  } else {
    menuSubtitle.textContent = "Choose between Versus Mode or Story Mode to continue.";
  }
  if (setupVisible) {
    updateModeVisibility();
    buildMapList();
  }
}
function chooseEyeLine() { return eyeLines[Math.floor(Math.random() * eyeLines.length)]; }
function rectForCell(c, r, inset = 0) { return { x: c * GRID + inset, y: r * GRID + inset, w: GRID - inset * 2, h: GRID - inset * 2 }; }
function worldToScreenRect(rect) { return { x: (rect.x - state.view.x) * state.zoom, y: (rect.y - state.view.y) * state.zoom, w: rect.w * state.zoom, h: rect.h * state.zoom }; }
function intersects(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function trapDefinition(id) { return trapCatalog.find((entry) => entry.id === id) || ERASE_OPTION; }
function isMechanicalTrapId(id) { return ["button", "lever", "door", "mover"].includes(id); }
function trapChannel(entry) { return Number(entry?.channel) || 0; }
function channelActive(channel) { return channel > 0 && state.activeChannels.has(channel); }
function doorOpen(entry) { return entry.id === "door" && channelActive(trapChannel(entry)); }
function getAllTemplates() { return [...builtinTemplates, ...state.customMaps]; }
function getSelectableTemplates() { return playModeSelect.value === "story" ? getStorySelectableTemplates() : getAllTemplates(); }
function findTemplateById(id) { return [...getAllTemplates(), ...storyLevels.map((level) => level.template)].find((entry) => entry.id === id) || builtinTemplates[0]; }
function rotationVector(rotation) { if (rotation === 90) return { x: 1, y: 0 }; if (rotation === 180) return { x: 0, y: 1 }; if (rotation === 270) return { x: -1, y: 0 }; return { x: 0, y: -1 }; }
function supportOffset(rotation) { if (rotation === 90) return { x: -1, y: 0 }; if (rotation === 180) return { x: 0, y: -1 }; if (rotation === 270) return { x: 1, y: 0 }; return { x: 0, y: 1 }; }
function isHorizontalRotation(rotation) { return rotation === 0 || rotation === 180; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function ensureAudioContext() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioCtx = new AudioCtor();
  }
  return audioCtx;
}
function unlockAudio() {
  const ctxRef = ensureAudioContext();
  if (!ctxRef) return;
  if (ctxRef.state === "suspended") ctxRef.resume().catch(() => {});
  audioUnlocked = true;
}
function playSound(kind, options = {}) {
  const ctxRef = ensureAudioContext();
  if (!ctxRef || !audioUnlocked) return;
  const now = ctxRef.currentTime;
  const gainNode = ctxRef.createGain();
  const filter = ctxRef.createBiquadFilter();
  const osc = ctxRef.createOscillator();
  const oscB = ctxRef.createOscillator();
  gainNode.gain.value = 0.0001;
  filter.type = "lowpass";
  filter.frequency.value = options.cutoff || 1800;
  osc.connect(gainNode);
  oscB.connect(gainNode);
  gainNode.connect(filter);
  filter.connect(ctxRef.destination);
  const duration = options.duration || 0.14;
  if (kind === "jump") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + duration);
    oscB.type = "sine";
    oscB.frequency.setValueAtTime(180, now);
    oscB.frequency.exponentialRampToValueAtTime(240, now + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
  } else if (kind === "dash") {
    osc.type = "square";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + duration);
    oscB.type = "sawtooth";
    oscB.frequency.setValueAtTime(210, now);
    oscB.frequency.exponentialRampToValueAtTime(95, now + duration);
    filter.frequency.value = 1200;
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.012);
  } else if (kind === "score") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + duration * 0.55);
    oscB.type = "triangle";
    oscB.frequency.setValueAtTime(560, now);
    oscB.frequency.exponentialRampToValueAtTime(980, now + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.055, now + 0.015);
  } else if (kind === "mine") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + duration);
    oscB.type = "square";
    oscB.frequency.setValueAtTime(45, now);
    oscB.frequency.exponentialRampToValueAtTime(22, now + duration);
    filter.frequency.value = 800;
    gainNode.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
  } else if (kind === "trap") {
    osc.type = "square";
    osc.frequency.setValueAtTime(options.pitch || 260, now);
    osc.frequency.exponentialRampToValueAtTime((options.pitch || 260) * 0.72, now + duration);
    oscB.type = "triangle";
    oscB.frequency.setValueAtTime((options.pitch || 260) * 1.6, now);
    oscB.frequency.exponentialRampToValueAtTime((options.pitch || 260) * 0.8, now + duration);
    gainNode.gain.exponentialRampToValueAtTime(options.volume || 0.035, now + 0.008);
  } else if (kind === "eye") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(options.pitch || 160, now);
    osc.frequency.exponentialRampToValueAtTime((options.pitch || 160) * 0.84, now + duration);
    oscB.type = "triangle";
    oscB.frequency.setValueAtTime((options.pitch || 160) * 1.5, now);
    oscB.frequency.exponentialRampToValueAtTime((options.pitch || 160) * 0.65, now + duration);
    filter.frequency.value = 900;
    gainNode.gain.exponentialRampToValueAtTime(options.volume || 0.03, now + 0.01);
  } else {
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    oscB.type = "sine";
    oscB.frequency.setValueAtTime(330, now);
    gainNode.gain.exponentialRampToValueAtTime(0.03, now + 0.01);
  }
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  oscB.start(now);
  osc.stop(now + duration + 0.03);
  oscB.stop(now + duration + 0.03);
}
function randomChoice(list) { return list[Math.floor(Math.random() * list.length)]; }
function eyeReactionFor(cause, fallbackLine = null) {
  const reaction = eyeReactions[cause] || eyeReactions.generic;
  return { mood: reaction.mood, line: fallbackLine || randomChoice(reaction.lines) };
}
function fireJetState(entry) {
  const cycle = (state.time + (entry.phase || 0)) % 5.4;
  if (cycle < 1.8) return "off";
  if (cycle < 2.4) return "flicker";
  if (cycle < 4.2) return "on";
  return "cooldown";
}
function addParticles(x, y, color, count = 8, force = 1) {
  const budgetFactor = currentParticleBudgetFactor();
  const roomLeft = Math.max(0, MAX_PARTICLES - state.particles.length);
  const finalCount = Math.min(roomLeft, Math.max(0, Math.round(count * budgetFactor)));
  for (let i = 0; i < finalCount; i += 1) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6 * force,
      vy: (Math.random() - 0.5) * 6 * force,
      life: 0.45 + Math.random() * 0.5,
      color,
      size: 3 + Math.random() * 3
    });
  }
}
function setEyeMood(mood, line = null) {
  state.eyeMood = mood;
  if (line) {
    state.eyeLine = line;
    state.eyeMessageTimer = 3.2;
    playSound("eye", { pitch: 140 + Math.random() * 70, volume: 0.028, duration: 0.24 });
  }
  syncEyeDialogOverlay();
}
function clearAutoRound() { if (state.autoRoundHandle) { clearTimeout(state.autoRoundHandle); state.autoRoundHandle = null; } }
function scheduleAutoRound() { clearAutoRound(); state.autoRoundHandle = setTimeout(() => { if (state.phase === "between" && !isAnyOverlayOpen()) startRound(); }, AUTO_ROUND_DELAY); }
function isAnyOverlayOpen() { return !mainMenuOverlay.classList.contains("hidden") || !settingsOverlay.classList.contains("hidden"); }
function loadFullscreenZoomPref() {
  const raw = Number(localStorage.getItem(FULLSCREEN_ZOOM_KEY));
  return Number.isFinite(raw) ? clamp(raw, 0.45, 1) : 0.68;
}
function updateZoomLabel() {
  if (zoomValueLabel) zoomValueLabel.textContent = `${Math.round(state.fullscreenZoom * 100)}%`;
}
function refreshZoom() { state.zoom = document.fullscreenElement === gameShell ? state.fullscreenZoom : 1; }
function currentRunner() { return state.activeRunner ? state.players[state.activeRunner] : null; }
function currentWorldCols() { return state.template?.bounds?.cols || 60; }
function currentWorldRows() { return state.template?.bounds?.rows || 30; }
function currentWorldW() { return currentWorldCols() * GRID; }
function currentWorldH() { return currentWorldRows() * GRID; }
function currentViewBounds(padding = 0) {
  return {
    x: state.view.x - padding,
    y: state.view.y - padding,
    w: canvas.width / state.zoom + padding * 2,
    h: canvas.height / state.zoom + padding * 2
  };
}
function rectVisibleInView(rect, padding = 0) { return intersects(rect, currentViewBounds(padding)); }
function currentVisualDensity() { return state.traps.length + state.projectiles.length * 2 + state.particles.length * 0.2; }
function currentParticleBudgetFactor() {
  return currentVisualDensity() > 80 ? 0.4 : currentVisualDensity() > 55 ? 0.58 : currentVisualDensity() > 32 ? 0.76 : 1;
}
function parseNumberList(text, expected) {
  const parts = text.split(",").map((entry) => Number(entry.trim()));
  if (parts.some((value) => Number.isNaN(value)) || (expected && parts.length < expected)) throw new Error(`Expected ${expected} numeric values.`);
  return parts;
}

function parseLineList(text, expected) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split(",").map((entry) => entry.trim());
    if (parts.length < expected) throw new Error(`Bad line: ${line}`);
    return parts;
  });
}

function normalizeCustomMap(raw) {
  const presets = Array.isArray(raw.presets) ? raw.presets : [];
  const mergedPlatforms = [...(raw.platforms || []), ...(raw.ironPlatforms || [])];
  const migratedPresets = presets.map((entry) => {
    const sourceId = Array.isArray(entry) ? entry[0] : entry.id;
    const sourceC = Array.isArray(entry) ? entry[1] : entry.c;
    const sourceR = Array.isArray(entry) ? entry[2] : entry.r;
    const sourceRotation = Array.isArray(entry) ? entry[3] : entry.rotation;
    const sourceChannel = Array.isArray(entry) ? entry[4] : entry.channel;
    const migratedId = sourceId === "spring" ? "fan"
      : sourceId === "booster" ? "fan"
      : sourceId === "crumble" || sourceId === "blink" ? "crate"
      : sourceId === "press" ? "rocket"
      : sourceId === "jaw" ? "snare"
      : sourceId === "orbiter" ? "rocket"
      : sourceId === "dropper" ? "mortar"
      : sourceId === "dart" ? "laser"
      : sourceId === "pulse" ? "shock"
      : sourceId === "piston" ? "oneway"
      : sourceId === "wormholeAmber" || sourceId === "wormholeCyan" || sourceId === "wormholeViolet" ? "laser"
      : sourceId === "warp" || sourceId === "hex" ? "laser"
      : sourceId;
    return { id: migratedId, c: sourceC, r: sourceR, rotation: sourceRotation || 0, channel: Number(sourceChannel) || undefined };
  });
  return makeTemplate(
    raw.id,
    raw.name,
    raw.orientation || "horizontal",
    raw.sky || ["#10253d", "#2d4c67"],
    [raw.goal.c, raw.goal.r, raw.goal.w || 4],
    {
      red: [raw.spawns.red.c, raw.spawns.red.r],
      blue: [raw.spawns.blue.c, raw.spawns.blue.r],
      story: raw.spawns.story ? [raw.spawns.story.c, raw.spawns.story.r] : [raw.spawns.red.c, raw.spawns.red.r]
    },
    mergedPlatforms.map((entry) => [entry.c, entry.r, entry.w, entry.h]),
    migratedPresets.map((entry) => ({ id: entry.id, c: entry.c, r: entry.r, rotation: entry.rotation || 0, channel: entry.channel })),
    {
      cols: raw.bounds?.cols,
      rows: raw.bounds?.rows,
      ironPlatforms: [],
      checkpoints: (raw.checkpoints || []).map((entry) => [entry.c, entry.r]),
      noDraft: raw.noDraft,
      suddenDeath: raw.suddenDeath
    }
  );
}

function loadCustomMaps() {
  try {
    const raw = localStorage.getItem(LOCAL_MAP_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map(normalizeCustomMap);
  } catch (error) {
    return [];
  }
}

function loadPlaytestMap() {
  try {
    const raw = localStorage.getItem(PLAYTEST_MAP_KEY);
    if (!raw) return null;
    return normalizeCustomMap(JSON.parse(raw));
  } catch (error) {
    return null;
  }
}

function saveCustomMaps() {
  localStorage.setItem(LOCAL_MAP_KEY, JSON.stringify(state.customMaps));
}

function builderDimensions(orientation) {
  return orientation === "vertical" ? { cols: 28, rows: 38 } : { cols: 56, rows: 26 };
}

function createBlankBuilder(orientation = "horizontal") {
  const dims = builderDimensions(orientation);
  const cells = new Set();
  for (let c = 0; c < dims.cols; c += 1) {
    cells.add(`${c},${dims.rows - 1}`);
    cells.add(`${c},${dims.rows - 2}`);
  }
  return {
    orientation,
    cols: dims.cols,
    rows: dims.rows,
    platforms: cells,
    presets: [],
    spawns: { red: { c: 2, r: dims.rows - 4 }, blue: { c: 5, r: dims.rows - 4 } },
    goal: { c: dims.cols - 6, r: Math.max(2, dims.rows - 8), w: 4 },
    tool: "platform",
    trapId: trapCatalog[0].id,
    rotation: 0,
    dragging: false
  };
}

function populateBuilderTrapSelect() {
  builderTrapSelect.innerHTML = "";
  trapCatalog.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.name;
    builderTrapSelect.appendChild(option);
  });
}

function setBuilderTool(tool) {
  state.builder.tool = tool;
  builderToolButtons.forEach((button) => button.classList.toggle("selected", button.dataset.builderTool === tool));
}

function builderTrapAt(c, r) {
  return state.builder.presets.find((entry) => trapCells(entry).some((cell) => cell.c === c && cell.r === r)) || null;
}

function eraseBuilderAt(c, r) {
  state.builder.platforms.delete(`${c},${r}`);
  state.builder.presets = state.builder.presets.filter((entry) => !trapCells(entry).some((cell) => cell.c === c && cell.r === r));
  if (state.builder.spawns.red.c === c && state.builder.spawns.red.r === r) state.builder.spawns.red = { c: 2, r: state.builder.rows - 4 };
  if (state.builder.spawns.blue.c === c && state.builder.spawns.blue.r === r) state.builder.spawns.blue = { c: 5, r: state.builder.rows - 4 };
  if (r === state.builder.goal.r && c >= state.builder.goal.c && c < state.builder.goal.c + state.builder.goal.w) state.builder.goal = { c: Math.max(0, state.builder.cols - 6), r: Math.max(2, state.builder.rows - 8), w: 4 };
}

function applyBuilderTool(c, r) {
  if (!state.builder) return;
  if (c < 0 || c >= state.builder.cols || r < 0 || r >= state.builder.rows) return;
  const key = `${c},${r}`;
  if (state.builder.tool === "platform") state.builder.platforms.add(key);
  if (state.builder.tool === "erase") eraseBuilderAt(c, r);
  if (state.builder.tool === "red") state.builder.spawns.red = { c, r };
  if (state.builder.tool === "blue") state.builder.spawns.blue = { c, r };
  if (state.builder.tool === "goal") state.builder.goal = { c: clamp(c, 0, state.builder.cols - 4), r, w: 4 };
  if (state.builder.tool === "trap") {
    state.builder.presets = state.builder.presets.filter((entry) => !trapCells(entry).some((cell) => cell.c === c && cell.r === r));
    state.builder.presets.push(trap(state.builder.trapId, c, r, state.builder.rotation));
  }
  renderBuilderBoard();
}

function renderBuilderBoard() {
  if (!state.builder) return;
  builderBoard.innerHTML = "";
  builderBoard.style.setProperty("--builder-cols", String(state.builder.cols));
  for (let r = 0; r < state.builder.rows; r += 1) {
    for (let c = 0; c < state.builder.cols; c += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "builder-cell";
      cell.dataset.c = String(c);
      cell.dataset.r = String(r);
      if (state.builder.platforms.has(`${c},${r}`)) cell.classList.add("platform");
      if (r === state.builder.goal.r && c >= state.builder.goal.c && c < state.builder.goal.c + state.builder.goal.w) cell.classList.add("goal");
      if (state.builder.spawns.red.c === c && state.builder.spawns.red.r === r) cell.classList.add("red");
      if (state.builder.spawns.blue.c === c && state.builder.spawns.blue.r === r) cell.classList.add("blue");
      const preset = builderTrapAt(c, r);
      if (preset) {
        cell.classList.add("trap");
        cell.style.background = trapDefinition(preset.id).color;
        cell.title = `${trapDefinition(preset.id).name}${preset.rotation ? ` ${preset.rotation}°` : ""}`;
      }
      builderBoard.appendChild(cell);
    }
  }
}

function rebuildBuilderForOrientation(orientation) {
  state.builder = createBlankBuilder(orientation);
  builderRotationSelect.value = "0";
  builderTrapSelect.value = state.builder.trapId;
  setBuilderTool("platform");
  renderBuilderBoard();
}

function compressPlatformCells(platformSet) {
  const rows = new Map();
  [...platformSet].forEach((entry) => {
    const [c, r] = entry.split(",").map(Number);
    if (!rows.has(r)) rows.set(r, []);
    rows.get(r).push(c);
  });
  const result = [];
  [...rows.entries()].sort((a, b) => a[0] - b[0]).forEach(([r, cols]) => {
    cols.sort((a, b) => a - b);
    let start = cols[0];
    let prev = cols[0];
    for (let i = 1; i <= cols.length; i += 1) {
      const value = cols[i];
      if (value === prev + 1) {
        prev = value;
        continue;
      }
      result.push([start, r, prev - start + 1, 1]);
      start = value;
      prev = value;
    }
  });
  return result;
}

function buildTrapToggles() {
  trapToggleList.innerHTML = "";
  trapCatalog.filter((entry) => !entry.makerOnly).forEach((entry) => {
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

function drawMapThumbnail(entry, canvasEl) {
  const preview = canvasEl.getContext("2d");
  const w = canvasEl.width;
  const h = canvasEl.height;
  const worldCols = entry.bounds?.cols || 60;
  const worldRows = entry.bounds?.rows || 30;
  const sx = w / worldCols;
  const sy = h / worldRows;
  const grad = preview.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, entry.sky[0]);
  grad.addColorStop(1, entry.sky[1]);
  preview.fillStyle = grad;
  preview.fillRect(0, 0, w, h);
  entry.platforms.forEach((platform) => {
    preview.fillStyle = "#8f6a49";
    preview.fillRect(platform.c * sx, platform.r * sy, platform.w * sx, platform.h * sy);
    preview.fillStyle = "#d6a069";
    preview.fillRect(platform.c * sx, platform.r * sy, platform.w * sx, Math.max(1, sy * 0.24));
  });
  preview.fillStyle = "#f4f2ef";
  preview.fillRect(entry.goal.c * sx, entry.goal.r * sy, entry.goal.w * sx, sy);
  for (let i = 0; i < entry.goal.w; i += 1) {
    preview.fillStyle = i % 2 === 0 ? "#10161f" : "#f4f2ef";
    preview.fillRect((entry.goal.c + i) * sx, entry.goal.r * sy, sx, sy * 0.5);
    preview.fillStyle = i % 2 === 0 ? "#f4f2ef" : "#10161f";
    preview.fillRect((entry.goal.c + i) * sx, entry.goal.r * sy + sy * 0.5, sx, sy * 0.5);
  }
  entry.presets.slice(0, 12).forEach((trapEntry) => {
    const def = trapDefinition(trapEntry.id);
    preview.fillStyle = def.color || "#ffffff";
    preview.fillRect(trapEntry.c * sx + 1, trapEntry.r * sy + 1, Math.max(2, sx - 2), Math.max(2, sy - 2));
  });
  preview.fillStyle = "#ff6b6b";
  preview.fillRect(entry.spawns.red.c * sx + 1, entry.spawns.red.r * sy + 1, Math.max(2, sx - 2), Math.max(2, sy - 2));
  preview.fillStyle = "#53e37a";
  preview.fillRect(entry.spawns.blue.c * sx + 1, entry.spawns.blue.r * sy + 1, Math.max(2, sx - 2), Math.max(2, sy - 2));
  if (entry.spawns.story) {
    preview.fillStyle = "#ffd36b";
    preview.fillRect(entry.spawns.story.c * sx + 2, entry.spawns.story.r * sy + 2, Math.max(2, sx - 4), Math.max(2, sy - 4));
  }
}

function buildMapList() {
  mapList.innerHTML = "";
  getSelectableTemplates().forEach((entry) => {
    const wrap = document.createElement("div");
    wrap.className = "map-entry";
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tool-button map-button${state.selectedMapId === entry.id ? " selected" : ""}`;
    button.title = `${entry.name}: ${entry.orientation === "vertical" ? "Vertical" : "Horizontal"} map${entry.noDraft ? ", fixed traps" : ""}${entry.suddenDeath ? ", sudden death" : ""}`;
    const thumbFrame = document.createElement("div");
    thumbFrame.className = "map-thumb-frame";
    const thumb = document.createElement("canvas");
    thumb.className = "map-thumb";
    thumb.width = 224;
    thumb.height = 126;
    drawMapThumbnail(entry, thumb);
    const copy = document.createElement("div");
    copy.className = "map-copy";
    copy.innerHTML = `<strong>${entry.name}</strong><span>${entry.orientation === "vertical" ? "Vertical" : "Horizontal"}${entry.noDraft ? " · Fixed Traps" : ""}${entry.suddenDeath ? " · Sudden Death" : ""}${entry.id.startsWith("custom-") ? " · Custom" : ""}</span>`;
    thumbFrame.appendChild(thumb);
    button.appendChild(thumbFrame);
    button.appendChild(copy);
    button.addEventListener("click", () => selectMap(entry.id));
    wrap.appendChild(button);
    if (entry.id.startsWith("custom-")) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "button ghost map-delete";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteCustomMap(entry.id);
      });
      wrap.appendChild(deleteButton);
    }
    mapList.appendChild(wrap);
  });
  const selected = findTemplateById(state.selectedMapId);
  selectedMapLabel.textContent = playModeSelect.value === "story"
    ? `Selected story map: ${selected.name}${selected.id.startsWith("custom-") ? " · custom" : ""}`
    : `Selected map: ${selected.name} · ${selected.orientation} layout${selected.noDraft ? " · fixed traps" : ""}${selected.suddenDeath ? " · first finisher wins" : ""}`;
}

function selectMap(id) {
  state.selectedMapId = id;
  buildMapList();
}

function deleteCustomMap(id) {
  state.customMaps = state.customMaps.filter((entry) => entry.id !== id);
  saveCustomMaps();
  const available = getSelectableTemplates();
  if (!available.some((entry) => entry.id === state.selectedMapId)) state.selectedMapId = available[0]?.id || builtinTemplates[0].id;
  buildMapList();
  selectedMapLabel.textContent = "Custom map deleted.";
}

function parseBuilderPreset(parts) {
  const rotation = Number(parts[3] || 0);
  if (!trapCatalog.some((entry) => entry.id === parts[0])) throw new Error(`Unknown trap: ${parts[0]}`);
  return [parts[0], Number(parts[1]), Number(parts[2]), Number.isNaN(rotation) ? 0 : rotation];
}

function saveBuilderMap() {
  try {
    if (!state.builder) rebuildBuilderForOrientation(builderOrientationInput.value);
    const name = builderNameInput.value.trim() || `Custom ${state.customMaps.length + 1}`;
    const orientation = state.builder.orientation;
    const sky = builderSkyInput.value.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (sky.length < 2) throw new Error("Sky colors need two comma-separated hex values.");
    const platforms = compressPlatformCells(state.builder.platforms);
    if (!platforms.length) throw new Error("Add at least one platform tile before saving.");
    const presets = state.builder.presets.map((entry) => [entry.id, entry.c, entry.r, entry.rotation || 0]);
    const customMap = makeTemplate(
      `custom-${Date.now()}`,
      name,
      orientation,
      sky.slice(0, 2),
      [state.builder.goal.c, state.builder.goal.r, state.builder.goal.w],
      {
        red: [state.builder.spawns.red.c, state.builder.spawns.red.r],
        blue: [state.builder.spawns.blue.c, state.builder.spawns.blue.r]
      },
      platforms,
      presets
    );
    state.customMaps.push(customMap);
    saveCustomMaps();
    selectMap(customMap.id);
    builderStatus.textContent = `Saved ${name}. It is now selectable from the list above.`;
  } catch (error) {
    builderStatus.textContent = error.message;
  }
}

function clearBuilderMap() {
  if (!state.builder) return;
  state.builder.platforms.clear();
  state.builder.presets = [];
  renderBuilderBoard();
  builderStatus.textContent = "Builder cleared. Paint a fresh layout.";
}

function handleBuilderBoardPointer(event) {
  const cell = event.target.closest(".builder-cell");
  if (!cell || !state.builder) return;
  const c = Number(cell.dataset.c);
  const r = Number(cell.dataset.r);
  if (Number.isNaN(c) || Number.isNaN(r)) return;
  applyBuilderTool(c, r);
}

function unloadLiveMapState() {
  clearAutoRound();
  state.template = null;
  state.traps = [];
  state.projectiles = [];
  state.particles = [];
  state.activeRunner = null;
  state.currentDraft = null;
  state.draftOptions = [];
  state.draftQueue = [];
  state.completedRuns = [];
  state.hoverCell = null;
}

function showMainMenu(title = "Skybarn Scramble", subtitle = "Choose between Versus Mode or Story Mode to continue.", stageOverride = null) {
  unloadLiveMapState();
  const wasGameOver = state.phase === "gameover";
  state.phase = "home";
  menuTitle.textContent = title;
  menuSubtitle.textContent = subtitle;
  playModeSelect.value = state.mode;
  gameModeSelect.value = state.gameMode;
  aiDifficultySelect.value = state.aiDifficulty;
  targetScoreInput.value = String(state.targetScore);
  mainMenuOverlay.classList.remove("hidden");
  settingsOverlay.classList.add("hidden");
  setMenuStage(stageOverride || (wasGameOver ? "setup" : "entry"));
  menuSubtitle.textContent = subtitle;
  menuRematchButton.classList.toggle("hidden", !wasGameOver || state.menuStage !== "setup");
  updateUi();
}

function hideMainMenu() {
  mainMenuOverlay.classList.add("hidden");
}

function showBuilderMenu() {
  window.location.href = "map-maker.html";
}

function hideBuilderMenu() {
  mainMenuOverlay.classList.remove("hidden");
  buildMapList();
}

function rematchMatch() {
  hideMainMenu();
  startNewMatch();
  startRound();
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
  const fallbackSpawn = player.id === "purple" ? (state.template.spawns.red || state.template.spawns.blue) : state.template.spawns.blue;
  const storySpawn = player.id === "red" && state.mode === "story" ? storyStartSpawn() : null;
  const spawn = storySpawn || state.template.spawns[player.id] || fallbackSpawn;
  player.x = spawn.c * GRID + 4;
  player.y = spawn.r * GRID + 1;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.alive = true;
  player.outcome = null;
  player.surface = "normal";
  player.dashTimer = 0;
  player.dashCooldown = 0;
  player.dashDirection = player.facing || 1;
  player.snareTimer = 0;
  player.slimeTouchTimer = 0;
  player.lastDeathCause = null;
  player.emberTimer = 0;
  player.spawnShield = SPAWN_IFRAME_TIME;
  player.wormholeCooldown = 0;
}

function resetAllPlayers() {
  Object.values(state.players).forEach(resetPlayerForRound);
}

function startNewMatch() {
  clearAutoRound();
  state.mode = playModeSelect.value === "story" ? "story" : "versus";
  state.gameMode = ["two", "cpu"].includes(gameModeSelect.value) ? gameModeSelect.value : "single";
  state.aiDifficulty = aiDifficultySelect.value in aiProfiles ? aiDifficultySelect.value : "medium";
  state.targetScore = clamp(Number(targetScoreInput.value) || DEFAULT_TARGET_SCORE, 1, 15);
  if (state.mode === "story") {
    state.story.customTemplateId = state.selectedMapId;
    state.story.levelIndex = -1;
    state.story.attempts = 0;
    state.story.totalAttempts = 0;
    state.story.checkpointIndex = -1;
    state.story.checkpoint = null;
    state.story.relics = [];
    state.story.chainsBroken = 0;
    state.story.justRespawned = false;
    state.story.pendingIntro = true;
    state.story.cutsceneIndex = 0;
    state.story.cutsceneLines = [];
    state.story.pendingAdvance = null;
    state.story.breakTimer = 0;
    state.template = findTemplateById(state.selectedMapId);
  } else {
    state.story.customTemplateId = null;
    state.template = findTemplateById(state.selectedMapId);
  }
  state.runOrder = activePlayerIds();
  state.traps = state.template.presets.map((entry) => ({ ...entry }));
  state.activeChannels = new Set();
  state.projectiles = [];
  state.mortarBursts = [];
  state.particles = [];
  state.round = 1;
  state.currentDraft = null;
  state.draftOptions = [];
  state.draftQueue = [];
  state.completedRuns = [];
  state.runRecords = [];
  state.currentRunTime = 0;
  state.activeRunner = null;
  state.phase = "ready";
  state.time = 0;
  state.eyeMood = "hungry";
  state.eyeLine = chooseEyeLine();
  state.eyeMessageTimer = 2.6;
  syncEyeDialogOverlay();
  state.lastWinnerId = null;
  state.ai.thinkTimer = 0;
  state.ai.draftTimer = 0;
  state.ai.controls = { left: false, right: false, jump: false, dash: false };
  Object.values(state.players).forEach((player) => {
    player.score = 0;
    resetPlayerForRound(player);
  });
  messageLabel.textContent = state.mode === "story"
    ? `Story Mode: ${currentStoryLevel().name}. Attempts: ${state.story.attempts}. Clear the map and earn the ${currentStoryLevel().relic}.`
    : state.template.noDraft
    ? `Map locked: ${state.template.name}. Fixed traps only. First player to touch the goal wins the entire match.`
    : `Map locked: ${state.template.name}. ${state.gameMode === "single" ? `Red vs Green (${state.aiDifficulty})` : state.gameMode === "cpu" ? `Green vs Purple (${state.aiDifficulty})` : "Red vs Blue"}. First to ${state.targetScore} wins.`;
  updateUi();
  renderSidebarDraft();
}

function startConfiguredMatch() {
  hideMainMenu();
  startNewMatch();
  startRound();
}

function resetCurrentRound() {
  clearAutoRound();
  state.currentDraft = null;
  state.draftOptions = [];
  state.draftQueue = [];
  state.projectiles = [];
  state.mortarBursts = [];
  state.particles = [];
  state.completedRuns = [];
  state.runRecords = [];
  state.currentRunTime = 0;
  state.activeRunner = null;
  state.ai.thinkTimer = 0;
  state.ai.draftTimer = 0;
  state.ai.controls = { left: false, right: false, jump: false, dash: false };
  if (state.mode === "story") {
    state.story.attempts = 0;
    state.story.checkpointIndex = -1;
    state.story.checkpoint = null;
    state.story.justRespawned = false;
  }
  resetAllPlayers();
  state.phase = "ready";
  messageLabel.textContent = state.mode === "story" ? "Story level reset. The eye swallowed your progress and spat you back at the start." : "Round reset. The eye rewound the room.";
  setEyeMood("hungry", chooseEyeLine());
  syncEyeDialogOverlay();
  updateUi();
  renderSidebarDraft();
}

function startRound() {
  if (!state.template || !["ready", "between"].includes(state.phase)) return;
  clearAutoRound();
  state.currentDraft = null;
  state.draftOptions = [];
  state.projectiles = [];
  state.mortarBursts = [];
  state.particles = [];
  state.completedRuns = [];
  state.runRecords = [];
  state.currentRunTime = 0;
  resetAllPlayers();
  state.activeRunner = state.mode === "story" ? "red" : state.runOrder[0];
  state.phase = "run";
  state.ai.thinkTimer = 0;
  if (state.mode === "story" && state.story.pendingIntro) {
    beginStoryCutscene();
    renderSidebarDraft();
    return;
  }
  messageLabel.textContent = state.mode === "story"
    ? `${currentStoryLevel().name}. Attempts: ${state.story.attempts}. Reach the goal and clear the route.`
    : `${displayLabel(state.runOrder[0])} runs first. ${state.gameMode !== "two" ? `${state.aiDifficulty} AI is active.` : `First to ${state.targetScore} wins.`}`;
  setEyeMood("anticipation", chooseEyeLine());
  syncEyeDialogOverlay();
  updateUi();
  renderSidebarDraft();
}

function randomTrapChoices(count, excludedIds = []) {
  const excluded = new Set(excludedIds);
  const available = trapCatalog.filter((entry) => !entry.makerOnly);
  const pool = available.filter((entry) => state.enabledTrapIds.has(entry.id) && !excluded.has(entry.id));
  const source = pool.length ? [...pool] : available.filter((entry) => !excluded.has(entry.id));
  const picked = [];
  while (source.length && picked.length < count) picked.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  return picked;
}

function queueDraftTurn(playerId, placements = 1) {
  if (!playerId) return;
  state.draftQueue.push({ playerId, placements });
}

function rerollDraftOptions(excludedIds = []) {
  state.draftOptions = [...randomTrapChoices(3, excludedIds), ERASE_OPTION];
}

function beginNextDraftTurn() {
  if (state.template?.noDraft) {
    state.currentDraft = null;
    state.draftOptions = [];
    state.phase = "between";
    state.round += 1;
    messageLabel.textContent = `${state.template.name} has fixed traps only. Next run begins automatically.`;
    updateUi();
    renderSidebarDraft();
    scheduleAutoRound();
    return;
  }
  if (!state.draftQueue.length) {
    state.currentDraft = null;
    state.draftOptions = [];
    state.phase = "between";
    state.round += 1;
    messageLabel.textContent = `Scoreboard: ${scoreLine()}. First to ${state.targetScore}. Next round begins automatically.`;
    updateUi();
    renderSidebarDraft();
    scheduleAutoRound();
    return;
  }
  const turn = state.draftQueue.shift();
  const playerId = turn.playerId;
  state.currentDraft = { playerId, selected: null, rotation: 0, placementsLeft: turn.placements };
  rerollDraftOptions();
  state.phase = "draft-select";
  state.ai.draftTimer = 0;
  draftHeading.textContent = `${displayLabel(playerId)} Controls The Draft`;
  draftLabel.textContent = `${displayLabel(playerId)} earned ${turn.placements} trap placement${turn.placements === 1 ? "" : "s"}. Pick 1 of 3 for the next placement.`;
  messageLabel.textContent = `${displayLabel(playerId)} is placing traps now. ${turn.placements} placements remaining.`;
  setEyeMood("glee", chooseEyeLine());
  updateUi();
  renderSidebarDraft();
}

function finishDraftTurn(line = null, usedOptionId = null) {
  const morePlacements = state.currentDraft && state.currentDraft.placementsLeft > 0;
  if (morePlacements) {
    const rerollExclusions = usedOptionId && usedOptionId !== "erase" ? [usedOptionId] : [];
    state.currentDraft.selected = null;
    state.currentDraft.rotation = 0;
    rerollDraftOptions(rerollExclusions);
    state.phase = "draft-select";
    draftLabel.textContent = `${displayLabel(state.currentDraft.playerId)} has ${state.currentDraft.placementsLeft} placement(s) left. Pick a new trap card for the next drop.`;
    messageLabel.textContent = `${displayLabel(state.currentDraft.playerId)} is still placing traps. ${state.currentDraft.placementsLeft} placement(s) left.`;
    if (line) {
      state.eyeLine = line;
      state.eyeMessageTimer = 2.8;
      playSound("eye", { pitch: 132, volume: 0.026, duration: 0.22 });
    }
    updateUi();
    renderSidebarDraft();
    return;
  }
  state.currentDraft = null;
  if (line) {
    state.eyeLine = line;
    state.eyeMessageTimer = 2.8;
    playSound("eye", { pitch: 132, volume: 0.026, duration: 0.22 });
  }
  beginNextDraftTurn();
}

function finishActiveRun(outcome, line = null, cause = outcome === "goal" ? "goal" : "generic") {
  const player = currentRunner();
  if (!player) return;
  if (state.mode === "story") {
    if (outcome === "goal") {
      state.story.relics.push(currentStoryLevel().relic);
      state.story.chainsBroken += 1;
      state.story.justRespawned = false;
      const storyWinner = currentStoryLevel();
      state.lastWinnerId = "red";
      triggerStoryChainBreak(storyWinner, null);
      return;
    }
    state.story.attempts += 1;
    state.story.totalAttempts += 1;
    state.story.justRespawned = true;
    resetPlayerForRound(player);
    state.projectiles = [];
    state.mortarBursts = [];
    state.particles = [];
    state.currentRunTime = 0;
    messageLabel.textContent = state.story.checkpoint
      ? `Attempt ${state.story.attempts + 1} begins from checkpoint ${state.story.checkpointIndex + 1}.`
      : `Attempt ${state.story.attempts + 1} begins. The gauntlet restarts from the beginning.`;
    setEyeMood("wrath", storyAttemptLine());
    updateUi();
    return;
  }
  player.alive = false;
  player.outcome = outcome;
  player.lastDeathCause = cause;
  const goalRect = getGoalRect();
  const playerCenterX = player.x + player.w / 2;
  const playerCenterY = player.y + player.h / 2;
  const goalCenterX = goalRect.x + goalRect.w / 2;
  const goalCenterY = goalRect.y + goalRect.h / 2;
  const progress = -Math.hypot(goalCenterX - playerCenterX, goalCenterY - playerCenterY);
  state.runRecords.push({ id: player.id, outcome, time: state.currentRunTime, progress });
  state.completedRuns.push(player.id);
  if (outcome === "goal") {
    player.score += 1;
    const reaction = eyeReactionFor(cause, line);
    setEyeMood(reaction.mood, reaction.line);
    playSound("score", { duration: 0.22 });
    if (state.template?.suddenDeath) {
      state.lastWinnerId = player.id;
      state.phase = "gameover";
      showMainMenu(`${displayLabel(player.id)} Wins`, `${state.template.name} is sudden death. First to the goal takes the whole match.`);
      return;
    }
  } else {
    const reaction = eyeReactionFor(cause, line);
    setEyeMood(reaction.mood, reaction.line);
  }
  const winner = activePlayerIds().map((id) => state.players[id]).find((entry) => entry.score >= state.targetScore);
  const nextId = state.runOrder.find((id) => !state.completedRuns.includes(id));
  if (winner && !nextId) {
    state.lastWinnerId = winner.id;
    state.phase = "gameover";
    showMainMenu(`${displayLabel(winner.id)} Wins`, `First to ${state.targetScore} is complete. Adjust the map or traps and start again.`);
    return;
  }
  if (nextId) {
    state.activeRunner = nextId;
    state.ai.thinkTimer = 0;
    state.currentRunTime = 0;
    resetPlayerForRound(state.players[nextId]);
    state.projectiles = [];
    state.mortarBursts = [];
    messageLabel.textContent = `${displayLabel(nextId)} runs now. Score: ${scoreLine()}.`;
    updateUi();
    return;
  }
  state.activeRunner = null;
  if (!state.template?.noDraft) {
    const rankedRecords = [...state.runRecords].sort((a, b) => {
      const outcomeRank = { goal: 2, dead: 1 };
      const byOutcome = (outcomeRank[b.outcome] || 0) - (outcomeRank[a.outcome] || 0);
      if (byOutcome !== 0) return byOutcome;
      if (a.outcome === "goal" && b.outcome === "goal") return a.time - b.time;
      if (a.progress !== b.progress) return b.progress - a.progress;
      return a.time - b.time;
    });
    state.lastWinnerId = rankedRecords[0]?.id || null;
    rankedRecords.forEach((record) => queueDraftTurn(record.id, record.outcome === "goal" ? 2 : 1));
  }
  beginNextDraftTurn();
}
function trapCells(entry) {
  const def = trapDefinition(entry.id);
  const length = def.length || 1;
  if (length === 1) return [{ c: entry.c, r: entry.r }];
  const cells = [];
  const horizontal = isHorizontalRotation(entry.rotation || 0);
  for (let i = 0; i < length; i += 1) cells.push(horizontal ? { c: entry.c + i, r: entry.r } : { c: entry.c, r: entry.r + i });
  return cells;
}

function trapAtCell(c, r) {
  return state.traps.find((entry) => trapCells(entry).some((cell) => cell.c === c && cell.r === r)) || null;
}

function isDevoutId(id) {
  return ["devoutDash", "devoutCrawler", "devoutRanger"].includes(id);
}

function devoutAggroRange(entry) {
  return entry.id === "devoutRanger" ? GRID * 7.5 : entry.id === "devoutDash" ? GRID * 5.75 : GRID * 4.75;
}

function ensureDevoutState(entry) {
  if (!isDevoutId(entry.id)) return null;
  const baseX = entry.c * GRID + 16;
  const baseY = entry.r * GRID + 16;
  if (!entry.devoutState) {
    const angle = Math.random() * Math.PI * 2;
    entry.devoutState = {
      x: baseX,
      y: baseY,
      vx: Math.cos(angle) * 2.4,
      vy: Math.sin(angle) * 2.1,
      aggro: false,
      aggroLocked: false,
      resetPending: false,
      cooldown: 0.6 + Math.random() * 0.7,
      attackTimer: 0,
      chargeTimer: 0,
      chargeDuration: 0,
      chargeType: null,
      blinkTimer: 1.1 + Math.random() * 0.8,
      targetX: baseX,
      targetY: baseY
    };
  }
  return entry.devoutState;
}

function getDevoutRect(entry, radius = DEVOUT_RADIUS) {
  const devout = ensureDevoutState(entry);
  return devout ? { x: devout.x - radius, y: devout.y - radius, w: radius * 2, h: radius * 2 } : trapCellRects(entry)[0];
}

function isWormholeId(id) {
  return ["wormholeAmber", "wormholeCyan", "wormholeViolet"].includes(id);
}

function getPairedWormhole(entry) {
  if (!entry || !isWormholeId(entry.id)) return null;
  const siblings = state.traps.filter((trapEntry) => trapEntry.id === entry.id);
  if (siblings.length < 2) return null;
  const index = siblings.indexOf(entry);
  if (index < 0) return null;
  const pairIndex = index % 2 === 0 ? index + 1 : index - 1;
  return siblings[pairIndex] || null;
}

function pulseTrapState(entry) {
  const cycle = (state.time + (entry.phase || 0)) % 2.8;
  if (cycle < 1.7) return { mode: "idle", radius: 0 };
  if (cycle < 2.2) return { mode: "charge", radius: GRID * (0.4 + (cycle - 1.7) * 1.2) };
  return { mode: "burst", radius: GRID * (1.1 + (cycle - 2.2) * 2.8) };
}

function pistonTrapRect(entry) {
  const cycle = (state.time + (entry.phase || 0)) % 2.6;
  if (cycle < 1.1 || cycle > 2.2) return null;
  const dir = rotationVector(entry.rotation || 0);
  const amount = cycle < 1.55 ? (cycle - 1.1) / 0.45 : (2.2 - cycle) / 0.65;
  const length = Math.max(0.55, amount) * GRID * 3;
  const baseX = entry.c * GRID;
  const baseY = entry.r * GRID;
  if (dir.x > 0) return { x: baseX, y: baseY + 4, w: GRID + length, h: GRID - 8 };
  if (dir.x < 0) return { x: baseX - length, y: baseY + 4, w: GRID + length, h: GRID - 8 };
  if (dir.y > 0) return { x: baseX + 4, y: baseY, w: GRID - 8, h: GRID + length };
  return { x: baseX + 4, y: baseY - length, w: GRID - 8, h: GRID + length };
}

function moverOffset(entry) {
  const dir = rotationVector(entry.rotation || 0);
  const progress = clamp(entry.moverProgress || 0, 0, 1);
  return { x: dir.x * GRID * 3 * progress, y: dir.y * GRID * 3 * progress };
}

function updateMechanicalTrapState(playerRect, dt) {
  const activeChannels = new Set();
  state.traps.forEach((entry) => {
    if (entry.id === "button") {
      const rect = { x: entry.c * GRID + 4, y: entry.r * GRID + 4, w: GRID - 8, h: GRID - 8 };
      const pressed = Boolean(playerRect) && intersects(playerRect, rect);
      entry.pressed = pressed;
      if (pressed && trapChannel(entry)) activeChannels.add(trapChannel(entry));
      return;
    }
    if (entry.id === "lever") {
      entry.triggerCooldown = Math.max(0, (entry.triggerCooldown || 0) - dt);
      const rect = { x: entry.c * GRID + 4, y: entry.r * GRID + 4, w: GRID - 8, h: GRID - 8 };
      if (Boolean(playerRect) && intersects(playerRect, rect) && entry.triggerCooldown <= 0) {
        entry.toggleState = !entry.toggleState;
        entry.triggerCooldown = 0.35;
        addParticles(entry.c * GRID + 16, entry.r * GRID + 16, "#ffc96f", 8, 0.8);
      }
      if (entry.toggleState && trapChannel(entry)) activeChannels.add(trapChannel(entry));
      return;
    }
  });
  state.activeChannels = activeChannels;
  const moverTouchActive = Boolean(playerRect) && state.traps.some((entry) => {
    if (entry.id !== "mover" || !channelActive(trapChannel(entry))) return false;
    return trapCellRects(entry).some((rect) => intersects(playerRect, rect));
  });
  state.traps.forEach((entry) => {
    if (entry.id === "mover") {
      const direction = channelActive(trapChannel(entry)) && moverTouchActive ? 1 : -1;
      entry.moverProgress = clamp((entry.moverProgress || 0) + direction * dt * 1.8, 0, 1);
    }
  });
}

function teleportPlayer(player, source, target) {
  player.x = target.c * GRID + (GRID - player.w) / 2;
  player.y = target.r * GRID + (GRID - player.h) / 2;
  player.wormholeCooldown = WORMHOLE_COOLDOWN;
  addParticles(source.c * GRID + 16, source.r * GRID + 16, trapDefinition(source.id).color, 12, 1);
  addParticles(target.c * GRID + 16, target.r * GRID + 16, trapDefinition(target.id).color, 16, 1.2);
}

function teleportProjectile(projectile, source, target) {
  const dx = projectile.vx || 0;
  const dy = projectile.vy || 0;
  const dist = Math.max(1, Math.hypot(dx, dy));
  projectile.x = target.c * GRID + 16 + (dx / dist) * 14 - projectile.w / 2;
  projectile.y = target.r * GRID + 16 + (dy / dist) * 14 - projectile.h / 2;
  projectile.teleportCooldown = WORMHOLE_COOLDOWN;
  addParticles(source.c * GRID + 16, source.r * GRID + 16, trapDefinition(source.id).color, 8, 0.8);
  addParticles(target.c * GRID + 16, target.r * GRID + 16, trapDefinition(target.id).color, 10, 0.9);
}

function isFreshTrap(entry) {
  return (entry.placedRound || 0) >= state.round;
}

function roundWinnerId() {
  if (state.runRecords.length < 2) return null;
  const ranked = [...state.runRecords].sort((a, b) => {
    const outcomeRank = { goal: 2, dead: 1 };
    const byOutcome = (outcomeRank[b.outcome] || 0) - (outcomeRank[a.outcome] || 0);
    if (byOutcome !== 0) return byOutcome;
    if (a.outcome === "goal" && b.outcome === "goal") return a.time - b.time;
    if (a.progress !== b.progress) return b.progress - a.progress;
    return a.time - b.time;
  });
  return ranked[0]?.id || null;
}

function goalCells() {
  return Array.from({ length: state.template.goal.w }, (_, index) => ({ c: state.template.goal.c + index, r: state.template.goal.r }));
}

function isGoalCell(c, r) {
  return goalCells().some((cell) => cell.c === c && cell.r === r);
}

function storyCheckpointRects() {
  const level = currentStoryLevel();
  const checkpoints = level?.checkpoints || state.template?.checkpoints || [];
  return checkpoints.map((entry, index) => ({ index, x: entry.c * GRID, y: entry.r * GRID, w: GRID, h: GRID * 1.4 }));
}

function getAllTemplatePlatforms(template = state.template) {
  if (!template) return [];
  return [
    ...(template.platforms || []).map((entry) => ({ ...entry, material: "wood" })),
    ...(template.ironPlatforms || []).map((entry) => ({ ...entry, material: "wood" }))
  ];
}

function isBaseSolidAtCell(c, r) {
  const onPlatform = getAllTemplatePlatforms().some((platform) => c >= platform.c && c < platform.c + platform.w && r >= platform.r && r < platform.r + platform.h);
  return onPlatform || isGoalCell(c, r);
}

function getGoalRect() {
  return { x: state.template.goal.c * GRID, y: state.template.goal.r * GRID, w: state.template.goal.w * GRID, h: GRID, kind: "goal" };
}

function isSolidAtCell(c, r, ignoreTrap = null) {
  if (isBaseSolidAtCell(c, r)) return true;
  return state.traps.some((entry) => {
    if (entry === ignoreTrap) return false;
    const def = trapDefinition(entry.id);
    if (!def.solid) return false;
    if (doorOpen(entry)) return false;
    if (entry.id === "blink" && entry.state === "gone") return false;
    return trapCells(entry).some((cell) => cell.c === c && cell.r === r);
  });
}

function isPhysicalBarrierCell(c, r, ignoreTrap = null) {
  if (isBaseSolidAtCell(c, r)) return true;
  return state.traps.some((entry) => {
    if (entry === ignoreTrap) return false;
    const def = trapDefinition(entry.id);
    if (!(def.solid || entry.id === "oneway")) return false;
    if (doorOpen(entry)) return false;
    if (entry.id === "blink" && entry.state === "gone") return false;
    return trapCells(entry).some((cell) => cell.c === c && cell.r === r);
  });
}

function canPlaceTrap(c, r, trapId, rotation = 0) {
  if (state.template?.noDraft) return false;
  const def = trapDefinition(trapId);
  const mock = { id: trapId, c, r, rotation };
  const cells = trapCells(mock);
  if (cells.some((cell) => cell.c < 0 || cell.c >= currentWorldCols() || cell.r < 0 || cell.r >= currentWorldRows())) return false;
  if (cells.some((cell) => trapAtCell(cell.c, cell.r))) return false;
  if (cells.some((cell) => isGoalCell(cell.c, cell.r))) return false;
  if (cells.some((cell) => activePlayerIds().some((id) => {
    const spawn = state.template.spawns[id] || (id === "purple" ? (state.template.spawns.red || state.template.spawns.blue) : state.template.spawns.blue);
    return cell.c === spawn.c && cell.r === spawn.r;
  }))) return false;
  if (def.placement === "surface") {
    const support = supportOffset(rotation);
    return cells.every((cell) => !isBaseSolidAtCell(cell.c, cell.r) && isSolidAtCell(cell.c + support.x, cell.r + support.y));
  }
  return cells.every((cell) => !isBaseSolidAtCell(cell.c, cell.r));
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
    if (isFreshTrap(victim)) {
      draftLabel.textContent = "Recently placed traps are protected from erase for this round.";
      return;
    }
    state.traps = state.traps.filter((entry) => entry !== victim);
    addParticles(c * GRID + GRID / 2, r * GRID + GRID / 2, "#ffffff", 16, 1.2);
    state.currentDraft.placementsLeft = Math.max(0, state.currentDraft.placementsLeft - 1);
    finishDraftTurn("Intresting. . .", option.id);
    return;
  }
  if (!canPlaceTrap(c, r, option.id, state.currentDraft.rotation)) {
    draftLabel.textContent = "That rotation or cell cannot take this trap.";
    return;
  }
  state.traps.push({ id: option.id, c, r, rotation: state.currentDraft.rotation, cooldown: 0, phase: Math.random() * Math.PI * 2, placedRound: state.round });
  addParticles(c * GRID + GRID / 2, r * GRID + GRID / 2, option.color, 14, 1.1);
  state.currentDraft.placementsLeft = Math.max(0, state.currentDraft.placementsLeft - 1);
  finishDraftTurn("Intresting. . .", option.id);
}

function getPlatformRects() {
  const base = getAllTemplatePlatforms().map((platform) => ({
    x: platform.c * GRID,
    y: platform.r * GRID,
    w: platform.w * GRID,
    h: platform.h * GRID,
    kind: platform.material === "iron" ? "iron" : "platform"
  }));
  return [...base, getGoalRect()];
}

function getSolidTrapRects() {
  return state.traps.flatMap((entry) => {
    const def = trapDefinition(entry.id);
    if (entry.id === "piston") {
      const rect = pistonTrapRect(entry);
      return rect ? [{ ...rect, kind: "piston", trapRef: entry }] : [];
    }
    if (!def.solid && entry.id !== "rocket") return [];
    if (doorOpen(entry)) return [];
    if (entry.id === "blink" && entry.state === "gone") return [];
    if (entry.id === "rocket") {
      const rocket = getRocketState(entry);
      return [{ x: rocket.x - 20, y: rocket.y - 10, w: 40, h: 20, kind: "rocket", trapRef: entry }];
    }
    return trapCellRects(entry).map((rect) => ({ ...rect, kind: entry.id, trapRef: entry }));
  });
}

function getProjectileBarrierRects() {
  return getSolidTrapRects().filter((rect) => rect.kind !== "rocket");
}

function getSolidRects() {
  return [...getPlatformRects(), ...getSolidTrapRects()];
}

function rectContainsPoint(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function hasLineOfSight(x1, y1, x2, y2, ignoreTrap = null) {
  const blockers = getSolidRects().filter((rect) => rect.kind !== "goal" && rect.trapRef !== ignoreTrap);
  const distance = Math.max(1, Math.hypot(x2 - x1, y2 - y1));
  const samples = Math.max(3, Math.ceil(distance / 12));
  for (let step = 1; step < samples; step += 1) {
    const t = step / samples;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    if (blockers.some((rect) => rectContainsPoint(rect, px, py))) return false;
  }
  return true;
}

function getOneWayTrapRects() {
  return state.traps
    .filter((entry) => entry.id === "oneway")
    .flatMap((entry) => trapCellRects(entry).map((rect) => ({ ...rect, rotation: entry.rotation || 0, trapRef: entry, kind: "oneway" })));
}

function getSawRail(entry) {
  const support = state.template.platforms.find((platform) => entry.c >= platform.c && entry.c < platform.c + platform.w && platform.r === entry.r + 1);
  if (!support) return { startX: entry.c * GRID + 16, endX: entry.c * GRID + 16, y: entry.r * GRID + 16 };
  return {
    startX: support.c * GRID + 16,
    endX: (support.c + support.w) * GRID - 16,
    y: entry.r * GRID + 16
  };
}

function getSawState(entry) {
  const rail = getSawRail(entry);
  const span = Math.max(0, rail.endX - rail.startX);
  const ratio = span <= 0 ? 0 : (Math.sin(state.time * 1.45 + (entry.phase || 0)) + 1) * 0.5;
  return { x: rail.startX + span * ratio, y: rail.y, rail };
}

function getBuzzsawRail(entry) {
  const vertical = !isHorizontalRotation(entry.rotation || 0);
  let startBlock = -1;
  let endBlock = vertical ? currentWorldRows() : currentWorldCols();
  for (let step = (vertical ? entry.r : entry.c) - 1; step >= 0; step -= 1) {
    const c = vertical ? entry.c : step;
    const r = vertical ? step : entry.r;
    if (isPhysicalBarrierCell(c, r, entry)) {
      startBlock = step;
      break;
    }
  }
  for (let step = (vertical ? entry.r : entry.c) + 1; step < (vertical ? currentWorldRows() : currentWorldCols()); step += 1) {
    const c = vertical ? entry.c : step;
    const r = vertical ? step : entry.r;
    if (isPhysicalBarrierCell(c, r, entry)) {
      endBlock = step;
      break;
    }
  }
  const start = (startBlock + 1) * GRID + 16;
  const end = Math.max(start, endBlock * GRID - 16);
  return {
    vertical,
    start,
    end,
    fixedX: entry.c * GRID + 16,
    fixedY: entry.r * GRID + 16
  };
}

function getBuzzsawState(entry) {
  const rail = getBuzzsawRail(entry);
  const travel = clamp(entry.travel ?? (rail.vertical ? entry.r * GRID + 16 : entry.c * GRID + 16), rail.start, rail.end);
  return rail.vertical
    ? { x: rail.fixedX, y: travel, rail }
    : { x: travel, y: rail.fixedY, rail };
}

function getRocketState(entry) {
  const vertical = !isHorizontalRotation(entry.rotation || 0);
  const travel = (Math.sin(state.time * 0.34 + (entry.phase || 0)) + 1) * 0.5;
  const startX = vertical ? entry.c * GRID + 16 : 20;
  const endX = vertical ? entry.c * GRID + 16 : currentWorldW() - 20;
  const startY = vertical ? 20 : entry.r * GRID + 16;
  const endY = vertical ? currentWorldH() - 20 : entry.r * GRID + 16;
  const x = startX + (endX - startX) * travel;
  const y = startY + (endY - startY) * travel;
  const dir = vertical ? { x: 0, y: Math.cos(state.time * 0.34 + (entry.phase || 0)) >= 0 ? 1 : -1 } : { x: Math.cos(state.time * 0.34 + (entry.phase || 0)) >= 0 ? 1 : -1, y: 0 };
  return {
    dir,
    vertical,
    startX,
    endX,
    startY,
    endY,
    x,
    y,
    flameX: x - dir.x * 22,
    flameY: y - dir.y * 22
  };
}

function getTemplatePlatformCells(template = state.template) {
  if (!template) return new Set();
  if (template._platformCellSet) return template._platformCellSet;
  const cellSet = new Set();
  getAllTemplatePlatforms(template).forEach((platform) => {
    for (let rr = 0; rr < platform.h; rr += 1) {
      for (let cc = 0; cc < platform.w; cc += 1) cellSet.add(`${platform.c + cc},${platform.r + rr}`);
    }
  });
  template._platformCellSet = cellSet;
  return cellSet;
}

function trapVisualRect(entry) {
  if (isDevoutId(entry.id)) {
    const devout = ensureDevoutState(entry);
    const range = devoutAggroRange(entry);
    return { x: devout.x - range - 24, y: devout.y - range - 24, w: range * 2 + 48, h: range * 2 + 48 };
  }
  const motion = getTrapMotionOffset(entry);
  if (entry.id === "laser") {
    const baseRect = { x: entry.c * GRID + motion.x, y: entry.r * GRID + motion.y, w: GRID, h: GRID };
    return (entry.rotation || 0) === 90 || (entry.rotation || 0) === 270
      ? { x: 0, y: baseRect.y + 8, w: currentWorldW(), h: 16 }
      : { x: baseRect.x + 8, y: 0, w: 16, h: currentWorldH() };
  }
  if (entry.id === "saw") {
    const saw = getSawState(entry);
    return { x: saw.rail.startX - 18, y: saw.y - 18, w: (saw.rail.endX - saw.rail.startX) + 36, h: 36 };
  }
  if (entry.id === "buzzsaw") {
    const buzzsaw = getBuzzsawState(entry);
    return buzzsaw.rail.vertical
      ? { x: buzzsaw.x - 18, y: buzzsaw.rail.start - 18, w: 36, h: (buzzsaw.rail.end - buzzsaw.rail.start) + 36 }
      : { x: buzzsaw.rail.start - 18, y: buzzsaw.y - 18, w: (buzzsaw.rail.end - buzzsaw.rail.start) + 36, h: 36 };
  }
  if (entry.id === "rocket") {
    const rocket = getRocketState(entry);
    return {
      x: Math.min(rocket.startX, rocket.endX) - 30,
      y: Math.min(rocket.startY, rocket.endY) - 30,
      w: Math.abs(rocket.endX - rocket.startX) + 60,
      h: Math.abs(rocket.endY - rocket.startY) + 60
    };
  }
  const cells = trapCells(entry);
  const minC = Math.min(...cells.map((cell) => cell.c));
  const minR = Math.min(...cells.map((cell) => cell.r));
  const maxC = Math.max(...cells.map((cell) => cell.c));
  const maxR = Math.max(...cells.map((cell) => cell.r));
  return {
    x: minC * GRID + motion.x,
    y: minR * GRID + motion.y,
    w: (maxC - minC + 1) * GRID,
    h: (maxR - minR + 1) * GRID
  };
}

function projectileVisible(entry) {
  return rectVisibleInView({ x: entry.x, y: entry.y, w: entry.w, h: entry.h }, 120);
}

function getTrapMotionOffset(entry) {
  if (entry.id === "rocket") return { x: 0, y: 0 };
  if (entry.id === "mover") return moverOffset(entry);
  const rails = state.traps.filter((trapEntry) => trapEntry.id === "rocket");
  for (const rail of rails) {
    const rocket = getRocketState(rail);
    if (rocket.vertical && entry.c === rail.c) return { x: 0, y: rocket.y - (rail.r * GRID + 16) };
    if (!rocket.vertical && entry.r === rail.r) return { x: rocket.x - (rail.c * GRID + 16), y: 0 };
  }
  return { x: 0, y: 0 };
}

function trapCellRects(entry) {
  const offset = getTrapMotionOffset(entry);
  return trapCells(entry).map((cell) => ({
    x: cell.c * GRID + offset.x,
    y: cell.r * GRID + offset.y,
    w: GRID,
    h: GRID
  }));
}

function playerInvulnerable(player) {
  return player.dashTimer > 0 || player.spawnShield > 0;
}

function killRunner(reason, cause = "generic") {
  const player = currentRunner();
  if (!player || !player.alive || playerInvulnerable(player)) return;
  if (cause === "devout") {
    state.traps.forEach((entry) => {
      if (!isDevoutId(entry.id)) return;
      const devout = ensureDevoutState(entry);
      devout.resetPending = true;
      devout.aggroLocked = false;
      devout.aggro = false;
      devout.attackTimer = 0;
      devout.chargeTimer = 0;
      devout.chargeType = null;
    });
  }
  addParticles(player.x + player.w / 2, player.y + player.h / 2, displayColor(player.id), 18, 1.5);
  state.screenShake = 18;
  playSound(cause === "mine" ? "mine" : "trap", { pitch: cause === "saw" ? 180 : cause === "missile" ? 150 : 220, volume: 0.05, duration: 0.2 });
  finishActiveRun("dead", reason, cause);
}

function handleGoal(player) {
  const goal = getGoalRect();
  const feet = { x: player.x + 4, y: player.y + player.h - 4, w: player.w - 8, h: 8 };
  if (player.grounded && intersects(feet, goal)) {
    addParticles(goal.x + goal.w / 2, goal.y + goal.h / 2, "#ffcf73", 18, 1.6);
    finishActiveRun("goal", state.mode === "story" ? "The key turned in the lock. Irritating." : "The checkered tile accepted you. Irritating.", "goal");
  }
}

function updateStoryCheckpoint(player) {
  const checkpoints = state.template?.checkpoints || currentStoryLevel()?.checkpoints || [];
  if (!checkpoints.length) return;
  const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };
  const playerCenterY = player.y + player.h * 0.5;
  storyCheckpointRects().forEach((checkpointRect) => {
    if (checkpointRect.index <= state.story.checkpointIndex) return;
    if (!intersects(playerRect, checkpointRect)) return;
    const checkpoint = checkpoints[checkpointRect.index];
    if (!checkpoint || playerCenterY > checkpointRect.y + checkpointRect.h) return;
    state.story.checkpointIndex = checkpointRect.index;
    state.story.checkpoint = { c: checkpoint.c, r: checkpoint.r };
    addParticles(checkpointRect.x + checkpointRect.w / 2, checkpointRect.y + checkpointRect.h / 2, "#91d7ff", 18, 1.4);
    setEyeMood("curious", `Checkpoint ${checkpointRect.index + 1}. Fine. Bleed from here instead.`);
    messageLabel.textContent = `Checkpoint ${checkpointRect.index + 1} reached.`;
  });
}

function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.x += particle.vx * 60 * dt;
    particle.y += particle.vy * 60 * dt;
    particle.vy += 0.08;
    particle.life -= dt;
    return particle.life > 0;
  });
  state.mortarBursts = state.mortarBursts.filter((burst) => {
    burst.life -= dt;
    return burst.life > 0;
  });
  if (state.particles.length > MAX_PARTICLES) state.particles = state.particles.slice(state.particles.length - MAX_PARTICLES);
}

function explodeMortar(projectile, playerRect = null) {
  const centerX = projectile.x + projectile.w / 2;
  const centerY = projectile.y + projectile.h / 2;
  addParticles(centerX, centerY, "#d9e4f2", 22, 1.8);
  addParticles(centerX, centerY, "rgba(255,240,225,0.8)", 12, 0.9);
  state.mortarBursts.push({ x: centerX, y: centerY, radius: MORTAR_BLAST_RADIUS, life: 0.22, maxLife: 0.22 });
  state.screenShake = Math.max(state.screenShake, 12);
  playSound("trap", { pitch: 118, volume: 0.045, duration: 0.16 });
  if (!playerRect || playerInvulnerable(currentRunner())) return false;
  const closestX = clamp(centerX, playerRect.x, playerRect.x + playerRect.w);
  const closestY = clamp(centerY, playerRect.y, playerRect.y + playerRect.h);
  const dx = centerX - closestX;
  const dy = centerY - closestY;
  return dx * dx + dy * dy <= MORTAR_BLAST_RADIUS * MORTAR_BLAST_RADIUS;
}

function updateProjectiles(dt, playerRect) {
  state.projectiles = state.projectiles.filter((projectile) => {
    projectile.teleportCooldown = Math.max(0, (projectile.teleportCooldown || 0) - dt);
    if (projectile.kind === "missile") {
      const runner = currentRunner();
      if (runner) {
        const dx = (runner.x + runner.w / 2) - (projectile.x + projectile.w / 2);
        const dy = (runner.y + runner.h / 2) - (projectile.y + projectile.h / 2);
        const dist = Math.max(1, Math.hypot(dx, dy));
        projectile.vx += (dx / dist) * dt * 9;
        projectile.vy += (dy / dist) * dt * 9;
        const speed = Math.hypot(projectile.vx, projectile.vy);
        if (speed > 6.4) {
          projectile.vx = (projectile.vx / speed) * 6.4;
          projectile.vy = (projectile.vy / speed) * 6.4;
        }
      }
      addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, "rgba(255,180,138,0.45)", 1, 0.08);
    }
    if (projectile.kind === "mortar") {
      projectile.vy += MORTAR_GRAVITY;
      addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, "rgba(217,228,242,0.42)", 1, 0.12);
    }
    if (projectile.kind === "tesla") {
      projectile.drift = (projectile.drift || 0) + dt * 18;
      projectile.vx += Math.cos(projectile.drift) * (projectile.zigzag || 0) * dt;
      projectile.vy += Math.sin(projectile.drift * 1.3) * (projectile.zigzag || 0) * dt;
      projectile.vx = clamp(projectile.vx, -6.2, 6.2);
      projectile.vy = clamp(projectile.vy, -6.2, 6.2);
      addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, "rgba(247,224,122,0.55)", 1, 0.08);
    }
    projectile.x += projectile.vx * 60 * dt;
    projectile.y += projectile.vy * 60 * dt;
    projectile.life -= dt;
    if (projectile.life <= 0 || projectile.x < -80 || projectile.x > currentWorldW() + 80 || projectile.y > currentWorldH() + 80) return false;
    const projectileRect = { x: projectile.x, y: projectile.y, w: projectile.w, h: projectile.h };
    if (projectile.teleportCooldown <= 0) {
      for (const entry of state.traps) {
        if (!isWormholeId(entry.id)) continue;
        const paired = getPairedWormhole(entry);
        if (!paired) continue;
        const wormholeRect = { x: entry.c * GRID + 4, y: entry.r * GRID + 4, w: GRID - 8, h: GRID - 8 };
        if (!intersects(projectileRect, wormholeRect)) continue;
        teleportProjectile(projectile, entry, paired);
        break;
      }
    }
    const postTeleportRect = { x: projectile.x, y: projectile.y, w: projectile.w, h: projectile.h };
    if (["cannon", "missile", "tesla", "dart", "devout-bullet"].includes(projectile.kind)) {
      const barrierHit = getProjectileBarrierRects().some((solid) => solid.kind !== "goal" && solid.trapRef !== projectile.sourceTrap && intersects(postTeleportRect, solid));
      if (barrierHit) {
        addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, projectile.color || "#ffffff", 10, 1);
        return false;
      }
    }
    if (projectile.kind === "mortar") {
      const shellRect = { x: projectile.x, y: projectile.y, w: projectile.w, h: projectile.h };
      const hitBlock = getProjectileBarrierRects().some((solid) => solid.kind !== "goal" && solid.trapRef !== projectile.sourceTrap && intersects(shellRect, solid));
      if (hitBlock) {
        if (explodeMortar(projectile, playerRect)) {
          killRunner("The mortar shell burst close enough to peel the route right off you.", "mortar");
        }
        return false;
      }
    }
    if (!playerInvulnerable(currentRunner()) && intersects(playerRect, projectile)) {
      addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, projectile.kind === "tesla" ? "#f7e07a" : projectile.kind === "missile" ? "#ffb48a" : projectile.kind === "mortar" ? "#d9e4f2" : projectile.kind === "devout-bullet" ? "#ff7b8e" : "#ffcf73", 10, 1.4);
      if (projectile.kind === "mortar") explodeMortar(projectile, playerRect);
      killRunner(projectile.kind === "tesla" ? "The tesla coil spit a crooked bolt straight through your route." : projectile.kind === "missile" ? "The missile shrine corrected every mistake you made." : projectile.kind === "mortar" ? "The mortar idol dropped a shell right on your head." : projectile.kind === "devout-bullet" ? "The ranger devout blinked and threaded a bloodshot bullet through you." : "The shot found your ribs.", projectile.kind === "tesla" ? "tesla" : projectile.kind === "missile" ? "missile" : projectile.kind === "mortar" ? "mortar" : projectile.kind === "devout-bullet" ? "devout" : "generic");
      return false;
    }
    return true;
  });
}

function bounceDevoutAxis(entry, devout, axis, amount) {
  const previous = axis === "x" ? devout.x : devout.y;
  if (axis === "x") devout.x += amount;
  else devout.y += amount;
  const rect = getDevoutRect(entry);
  const blocked = rect.x < 0
    || rect.y < 0
    || rect.x + rect.w > currentWorldW()
    || rect.y + rect.h > currentWorldH()
    || getSolidRects().some((solid) => solid.trapRef !== entry && solid.kind !== "goal" && intersects(rect, solid));
  if (blocked) {
    if (axis === "x") {
      devout.x = previous;
      devout.vx *= -1;
    } else {
      devout.y = previous;
      devout.vy *= -1;
    }
  }
}

function updateDevouts(dt, playerRect) {
  const player = currentRunner();
  if (!playerRect) return;
  const targetX = playerRect.x + playerRect.w / 2;
  const targetY = playerRect.y + playerRect.h / 2;
  state.traps.forEach((entry) => {
    if (!isDevoutId(entry.id)) return;
    const devout = ensureDevoutState(entry);
    const anchorX = entry.c * GRID + 16;
    const anchorY = entry.r * GRID + 16;
    const dx = targetX - devout.x;
    const dy = targetY - devout.y;
    const distance = Math.hypot(dx, dy);
    const seesPlayer = player && player.alive && distance <= devoutAggroRange(entry) && hasLineOfSight(devout.x, devout.y, targetX, targetY, entry);
    if ((!player || !player.alive) && devout.resetPending) {
      devout.x += (anchorX - devout.x) * Math.min(1, dt * 5.4);
      devout.y += (anchorY - devout.y) * Math.min(1, dt * 5.4);
      if (Math.abs(anchorX - devout.x) < 1.2 && Math.abs(anchorY - devout.y) < 1.2) {
        devout.x = anchorX;
        devout.y = anchorY;
        devout.resetPending = false;
      }
      devout.aggroLocked = false;
      devout.aggro = false;
      return;
    }
    if (!player || !player.alive) {
      devout.aggro = false;
      return;
    }
    if (entry.id !== "devoutCrawler" && seesPlayer) devout.aggroLocked = true;
    if (entry.id !== "devoutCrawler") devout.aggro = Boolean(devout.aggroLocked && player && player.alive);
    devout.cooldown = Math.max(0, (devout.cooldown || 0) - dt);
    devout.attackTimer = Math.max(0, (devout.attackTimer || 0) - dt);
    devout.chargeTimer = Math.max(0, (devout.chargeTimer || 0) - dt);
    devout.blinkTimer = Math.max(0, (devout.blinkTimer || 0) - dt);

    if (entry.id === "devoutCrawler") {
      if (Math.abs(devout.vx) < 1.2) devout.vx = (Math.random() < 0.5 ? -1 : 1) * 2.6;
      if (Math.abs(devout.vy) < 1.2) devout.vy = (Math.random() < 0.5 ? -1 : 1) * 2.2;
      bounceDevoutAxis(entry, devout, "x", devout.vx * 60 * dt);
      bounceDevoutAxis(entry, devout, "y", devout.vy * 60 * dt);
      return;
    }

    if (!devout.aggro) {
      const driftX = anchorX + Math.sin(state.time * 1.6 + (entry.phase || 0)) * 12;
      const driftY = anchorY + Math.cos(state.time * 1.2 + (entry.phase || 0) * 0.7) * 8;
      devout.x += (driftX - devout.x) * Math.min(1, dt * 2.8);
      devout.y += (driftY - devout.y) * Math.min(1, dt * 2.8);
      return;
    }

    if (entry.id === "devoutDash") {
      if (devout.attackTimer > 0) {
        devout.x += devout.vx * 60 * dt;
        devout.y += devout.vy * 60 * dt;
      } else if (devout.chargeTimer > 0) {
        const holdX = anchorX + Math.cos(state.time * 16 + (entry.phase || 0)) * 3;
        const holdY = anchorY + Math.sin(state.time * 18 + (entry.phase || 0)) * 3;
        devout.x += (holdX - devout.x) * Math.min(1, dt * 10);
        devout.y += (holdY - devout.y) * Math.min(1, dt * 10);
        if (Math.sin(state.time * 28) > 0.35) addParticles(devout.x, devout.y, "rgba(180,255,154,0.26)", 1, 0.08);
        if (devout.chargeTimer <= dt) {
          const aimX = devout.targetX - devout.x;
          const aimY = devout.targetY - devout.y;
          const aimDistance = Math.max(1, Math.hypot(aimX, aimY));
          devout.vx = (aimX / aimDistance) * 10.4;
          devout.vy = (aimY / aimDistance) * 10.4;
          devout.attackTimer = 0.42;
          devout.chargeType = null;
          playSound("eye", { pitch: 250, volume: 0.02, duration: 0.08 });
        }
      } else {
        const retreatDistance = GRID * 2.8;
        const retreatDx = targetX - devout.x;
        const retreatDy = targetY - devout.y;
        const retreatLen = Math.max(1, Math.hypot(retreatDx, retreatDy));
        const stageX = targetX - (retreatDx / retreatLen) * retreatDistance;
        const stageY = targetY - (retreatDy / retreatLen) * retreatDistance;
        devout.x += clamp(stageX - devout.x, -5.2, 5.2) * Math.min(1, dt * 3.8);
        devout.y += clamp(stageY - devout.y, -5.2, 5.2) * Math.min(1, dt * 3.8);
        if (devout.cooldown <= 0 && distance > 8) {
          devout.targetX = targetX;
          devout.targetY = targetY;
          devout.chargeDuration = 0.48;
          devout.chargeTimer = devout.chargeDuration;
          devout.chargeType = "dash";
          devout.cooldown = 1.15;
          playSound("eye", { pitch: 220, volume: 0.018, duration: 0.12 });
        }
      }
      return;
    }

    const desiredDistance = GRID * 3.2;
    const orbit = state.time * 1.8 + (entry.phase || 0);
    const desiredX = targetX + Math.cos(orbit) * desiredDistance;
    const desiredY = targetY - GRID * 0.7 + Math.sin(orbit * 1.2) * (GRID * 1.1);
    if (devout.chargeTimer > 0) {
      const holdX = targetX + Math.cos(orbit) * (desiredDistance + GRID * 0.4);
      const holdY = targetY - GRID * 0.9 + Math.sin(orbit * 1.2) * (GRID * 1.35);
      devout.x += clamp(holdX - devout.x, -3.6, 3.6) * Math.min(1, dt * 3.2);
      devout.y += clamp(holdY - devout.y, -3.6, 3.6) * Math.min(1, dt * 3.2);
      if (Math.sin(state.time * 24) > 0.55) addParticles(devout.x, devout.y, "rgba(255,138,152,0.32)", 1, 0.08);
      if (devout.chargeTimer <= dt) {
        const shotX = targetX - devout.x;
        const shotY = targetY - devout.y;
        const shotDistance = Math.max(1, Math.hypot(shotX, shotY));
        state.projectiles.push({
          kind: "devout-bullet",
          color: "#ff7b8e",
          x: devout.x - 4,
          y: devout.y - 4,
          w: 8,
          h: 8,
          vx: (shotX / shotDistance) * 7.4,
          vy: (shotY / shotDistance) * 7.4,
          life: 3.8,
          sourceTrap: entry
        });
        addParticles(devout.x, devout.y, "rgba(255,138,152,0.8)", 10, 0.85);
        devout.cooldown = 1.1;
        devout.chargeType = null;
        devout.blinkTimer = 1.1;
        playSound("eye", { pitch: 205, volume: 0.02, duration: 0.11 });
      }
    } else {
      devout.x += clamp(desiredX - devout.x, -4.4, 4.4) * Math.min(1, dt * 3.8);
      devout.y += clamp(desiredY - devout.y, -4.4, 4.4) * Math.min(1, dt * 3.8);
      if (devout.cooldown <= 0 && hasLineOfSight(devout.x, devout.y, targetX, targetY, entry)) {
        devout.chargeDuration = 0.52;
        devout.chargeTimer = devout.chargeDuration;
        devout.chargeType = "ranger";
        playSound("eye", { pitch: 182, volume: 0.018, duration: 0.12 });
      }
    }
  });
}

function updateTrapTimers(dt) {
  state.traps.forEach((entry) => {
    if (entry.cooldown > 0) entry.cooldown = Math.max(0, entry.cooldown - dt);
    if (entry.blastTimer > 0) entry.blastTimer = Math.max(0, entry.blastTimer - dt);
    if (entry.id === "blink") {
      const cycle = (state.time + (entry.phase || 0)) % 3.6;
      entry.state = cycle < 2 ? "solid" : "gone";
    }
    if (entry.id === "cannon") {
      entry.phase += dt;
      if (entry.phase >= 2.4) {
        entry.phase = 0;
        playSound("trap", { pitch: 190, volume: 0.018, duration: 0.12 });
        const dir = rotationVector(entry.rotation || 0);
        const motion = getTrapMotionOffset(entry);
        state.projectiles.push({ kind: "cannon", color: "#ffcf73", x: entry.c * GRID + 9 + motion.x, y: entry.r * GRID + 9 + motion.y, w: 14, h: 14, vx: dir.x * 5.5, vy: dir.y * 5.5, life: 7, sourceTrap: entry });
      }
    }
    if (entry.id === "missile") {
      entry.phase = (entry.phase || 0) + dt;
      if (entry.phase >= 3.1) {
        entry.phase = 0;
        playSound("trap", { pitch: 122, volume: 0.02, duration: 0.22 });
        const motion = getTrapMotionOffset(entry);
        state.projectiles.push({
          kind: "missile",
          color: "#ffb48a",
          x: entry.c * GRID + 12 + motion.x,
          y: entry.r * GRID + 12 + motion.y,
          w: 18,
          h: 12,
          vx: 2.6,
          vy: 0,
          life: 5.4,
          sourceTrap: entry
        });
      }
    }
    if (entry.id === "mortar") {
      entry.phase = (entry.phase || 0) + dt;
      if (entry.phase >= 2.5) {
        entry.phase = 0;
        playSound("trap", { pitch: 150, volume: 0.02, duration: 0.14 });
        const motion = getTrapMotionOffset(entry);
        const startX = entry.c * GRID + 11 + motion.x;
        const startY = entry.r * GRID + 11 + motion.y;
        let vx = 0;
        let vy = -6.2;
        const runner = currentRunner();
        if (runner) {
          const targetX = runner.x + runner.w / 2;
          const targetY = runner.y + runner.h * 0.35;
          const dx = targetX - startX;
          const dy = targetY - startY;
          const frames = clamp(Math.abs(dx) / 4.2 + Math.max(18, Math.abs(dy) / 3.1), 28, 72);
          vx = clamp(dx / frames, -7.4, 7.4);
          vy = clamp((dy - 0.5 * MORTAR_GRAVITY * frames * frames) / frames, -11.5, -4.2);
        } else {
          const dir = rotationVector(entry.rotation || 0);
          const spread = (Math.random() * 2 - 1) * 1.2;
          vx = dir.x * (4.8 + Math.random() * 1.8) + (dir.x === 0 ? 1.8 + spread : spread);
          vy = dir.y * 3.8 - (6.2 + Math.random() * 1.8);
        }
        state.projectiles.push({
          kind: "mortar",
          color: "#c7d2e2",
          x: startX,
          y: startY,
          w: 12,
          h: 12,
          vx,
          vy,
          life: 3.8,
          sourceTrap: entry
        });
      }
    }
    if (entry.id === "dart") {
      entry.phase = (entry.phase || 0) + dt;
      if (entry.phase >= 1.35) {
        entry.phase = 0;
        const motion = getTrapMotionOffset(entry);
        const dir = rotationVector(entry.rotation || 0);
        playSound("trap", { pitch: 240, volume: 0.018, duration: 0.08 });
        state.projectiles.push({
          kind: "dart",
          color: "#ffe37d",
          x: entry.c * GRID + 12 + motion.x,
          y: entry.r * GRID + 12 + motion.y,
          w: 8,
          h: 8,
          vx: dir.x * 9.4,
          vy: dir.y * 9.4,
          life: 3,
          sourceTrap: entry
        });
      }
    }
    if (entry.id === "pulse" && pulseTrapState(entry).mode === "charge" && Math.random() < 0.08) {
      addParticles(entry.c * GRID + 16, entry.r * GRID + 16, "#ff83cd", 2, 0.35);
    }
    if (entry.id === "shock") {
      entry.phase = (entry.phase || 0) + dt;
      if (entry.phase >= 1.05) {
        entry.phase = 0;
        playSound("trap", { pitch: 280, volume: 0.018, duration: 0.1 });
        const motion = getTrapMotionOffset(entry);
        for (let bolt = 0; bolt < 2; bolt += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 7.2 + Math.random() * 2.6;
          state.projectiles.push({
            kind: "tesla",
            color: "#f7e07a",
            x: entry.c * GRID + 12 + motion.x,
            y: entry.r * GRID + 12 + motion.y,
            w: 10,
            h: 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 7.2,
            zigzag: (Math.random() * 2 - 1) * 1.2,
            drift: Math.random() * Math.PI * 2,
            sourceTrap: entry
          });
        }
      }
    }
    if (entry.id === "buzzsaw") {
      const rail = getBuzzsawRail(entry);
      if (entry.travel == null) entry.travel = clamp(rail.vertical ? entry.r * GRID + 16 : entry.c * GRID + 16, rail.start, rail.end);
      if (!entry.travelDir) entry.travelDir = Math.random() < 0.5 ? -1 : 1;
      const speed = 132;
      entry.travel += entry.travelDir * speed * dt;
      if (entry.travel >= rail.end) {
        entry.travel = rail.end;
        entry.travelDir = -1;
      }
      if (entry.travel <= rail.start) {
        entry.travel = rail.start;
        entry.travelDir = 1;
      }
    }
    if (entry.id === "flame" && fireJetState(entry) === "flicker" && Math.random() < 0.18) {
      addParticles(entry.c * GRID + 16, entry.r * GRID + 10, "#ffb36b", 2, 0.4);
    }
  });
}

function getPlayerControls(player, dt) {
  if (!isAIPlayer(player.id)) {
    const config = playerConfigs[player.id];
    return {
      left: keys.has(config.left),
      right: keys.has(config.right),
      jump: keys.has(config.jump) || keys.has(" "),
      dash: keys.has(config.dash)
    };
  }
  return getAiControls(player, dt);
}

function pointOnSurface(x, y, maxDrop = 72) {
  const probe = { x, y, w: 4, h: maxDrop };
  return getSolidRects().find((solid) => intersects(probe, solid));
}

function nearestPlatformAbove(player) {
  const playerCenterX = player.x + player.w / 2;
  return getAllTemplatePlatforms()
    .filter((platform) => playerCenterX >= platform.c * GRID - GRID && playerCenterX <= (platform.c + platform.w) * GRID + GRID && platform.r * GRID < player.y - GRID)
    .sort((a, b) => b.r - a.r)[0] || null;
}

function aiDangerZone(entry) {
  const baseRect = { x: entry.c * GRID, y: entry.r * GRID, w: GRID, h: GRID };
  if (isDevoutId(entry.id)) {
    const rect = getDevoutRect(entry, DEVOUT_RADIUS + 6);
    return { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
  }
  if (entry.id === "mine") return { x: baseRect.x - GRID * 2, y: baseRect.y - GRID * 2, w: GRID * 5, h: GRID * 5 };
  if (entry.id === "spikes") {
    const cells = trapCells(entry);
    return { x: cells[0].c * GRID, y: cells[0].r * GRID, w: cells.length * GRID, h: GRID };
  }
  if (entry.id === "saw") {
    const saw = getSawState(entry);
    return { x: saw.rail.startX - 18, y: saw.y - 18, w: (saw.rail.endX - saw.rail.startX) + 36, h: 36 };
  }
  if (entry.id === "buzzsaw") {
    const buzzsaw = getBuzzsawState(entry);
    return buzzsaw.rail.vertical
      ? { x: buzzsaw.x - 18, y: buzzsaw.rail.start - 18, w: 36, h: (buzzsaw.rail.end - buzzsaw.rail.start) + 36 }
      : { x: buzzsaw.rail.start - 18, y: buzzsaw.y - 18, w: (buzzsaw.rail.end - buzzsaw.rail.start) + 36, h: 36 };
  }
  if (entry.id === "laser") {
    const rot = entry.rotation || 0;
    return rot === 90 || rot === 270 ? { x: 0, y: baseRect.y + 8, w: currentWorldW(), h: 16 } : { x: baseRect.x + 8, y: 0, w: 16, h: currentWorldH() };
  }
  if (entry.id === "dart") {
    const dir = rotationVector(entry.rotation || 0);
    return dir.y !== 0
      ? { x: baseRect.x + 10, y: dir.y < 0 ? baseRect.y - GRID * 4 : baseRect.y, w: 12, h: GRID * 5 }
      : { x: dir.x < 0 ? baseRect.x - GRID * 4 : baseRect.x, y: baseRect.y + 10, w: GRID * 5, h: 12 };
  }
  if (entry.id === "pulse") {
    const pulse = pulseTrapState(entry);
    return { x: baseRect.x + 16 - pulse.radius, y: baseRect.y + 16 - pulse.radius, w: pulse.radius * 2, h: pulse.radius * 2 };
  }
  if (entry.id === "piston") {
    return pistonTrapRect(entry) || { x: baseRect.x, y: baseRect.y, w: baseRect.w, h: baseRect.h };
  }
  if (entry.id === "flame" && fireJetState(entry) === "on") {
    const dir = rotationVector(entry.rotation || 0);
    return dir.y !== 0
      ? { x: baseRect.x + 6, y: dir.y < 0 ? baseRect.y - GRID * 3 : baseRect.y, w: 20, h: GRID * 4 }
      : { x: dir.x < 0 ? baseRect.x - GRID * 3 : baseRect.x, y: baseRect.y + 6, w: GRID * 4, h: 20 };
  }
  if (entry.id === "rocket") {
    const rocket = getRocketState(entry);
    return { x: rocket.flameX - 14, y: rocket.flameY - 14, w: 28, h: 28 };
  }
  if (entry.id === "pulse") {
    const pulse = pulseTrapState(entry);
    const radius = Math.max(GRID * 0.6, pulse.radius || GRID * 0.6);
    return { x: entry.c * GRID + 16 - radius, y: entry.r * GRID + 16 - radius, w: radius * 2, h: radius * 2 };
  }
  if (entry.id === "piston") {
    const rect = pistonTrapRect(entry);
    if (rect) return rect;
  }
  if (entry.id === "gravity") return { x: baseRect.x - 40, y: baseRect.y - 40, w: GRID + 80, h: GRID + 80 };
  return { x: baseRect.x, y: baseRect.y, w: baseRect.w, h: baseRect.h };
}

function aiWallAhead(player, direction) {
  return getSolidRects().some((solid) => solid.kind !== "goal" && intersects({ x: player.x + direction * 18, y: player.y + 4, w: player.w, h: player.h - 8 }, solid));
}

function aiHazardAhead(player, direction, range = GRID * 2.5) {
  const zone = {
    x: direction >= 0 ? player.x + player.w : player.x - range,
    y: player.y - GRID * 0.6,
    w: range,
    h: player.h + GRID * 1.1
  };
  return state.traps.some((entry) => {
    if (!["mine", "spikes", "flame", "saw", "buzzsaw", "laser", "rocket", "gravity", "snare", "pulse", "piston", "dart", "devoutDash", "devoutCrawler", "devoutRanger"].includes(entry.id)) return false;
    return intersects(zone, aiDangerZone(entry));
  });
}

function aiProjectileThreat(player, direction) {
  return state.projectiles.some((projectile) => {
    const closeY = Math.abs((projectile.y + projectile.h / 2) - (player.y + player.h / 2)) < GRID * 1.8;
    const ahead = direction >= 0
      ? projectile.x >= player.x - 24 && projectile.x <= player.x + GRID * 4.2
      : projectile.x + projectile.w <= player.x + player.w + 24 && projectile.x + projectile.w >= player.x - GRID * 4.2;
    const incoming = direction >= 0
      ? projectile.vx < 0 || ["missile", "devout-bullet"].includes(projectile.kind)
      : projectile.vx > 0 || ["missile", "devout-bullet"].includes(projectile.kind);
    return closeY && ahead && incoming;
  });
}

function aiShouldJump(player, direction, profile, goalRect) {
  if (!player.grounded) return false;
  const feetX = direction >= 0 ? player.x + player.w + 16 : player.x - 16;
  const supportAhead = pointOnSurface(feetX, player.y + player.h + 2, 88);
  const highGoal = goalRect.y + goalRect.h < player.y - GRID * 0.75;
  const wallAhead = aiWallAhead(player, direction);
  const hazardAhead = aiHazardAhead(player, direction, GRID * 2.2);
  const climbTarget = nearestPlatformAbove(player);
  if (!supportAhead) return true;
  if (hazardAhead) return true;
  if (climbTarget && Math.abs((climbTarget.c + climbTarget.w / 2) * GRID - (player.x + player.w / 2)) < GRID * (2.2 + profile.routeLookahead * 0.5)) return true;
  if (highGoal && Math.abs(goalRect.x + goalRect.w / 2 - (player.x + player.w / 2)) < GRID * (3 + profile.routeLookahead)) return Math.random() < profile.jumpBias;
  return wallAhead && Math.random() < profile.jumpBias;
}

function aiShouldDash(player, direction, profile) {
  if (player.dashCooldown > 0 || player.dashTimer > 0) return false;
  if (aiProjectileThreat(player, direction) && Math.random() < profile.dashBias) return true;
  const nearbyHazard = aiHazardAhead(player, direction, GRID * 1.6);
  return nearbyHazard && Math.random() < profile.dashBias * 0.72;
}

function getAiControls(player, dt) {
  const profile = currentAiProfile();
  state.ai.thinkTimer = Math.max(0, state.ai.thinkTimer - dt);
  if (state.ai.thinkTimer > 0) return state.ai.controls;

  const goalRect = getGoalRect();
  const centerX = player.x + player.w / 2;
  const targetX = goalRect.x + goalRect.w / 2;
  const direction = targetX >= centerX ? 1 : -1;
  const controls = { left: false, right: false, jump: false, dash: false };

  if (direction < 0) controls.left = true;
  else controls.right = true;

  const hazardAhead = aiHazardAhead(player, direction, GRID * (1.8 + profile.routeLookahead * 0.35));
  const projectileThreat = aiProjectileThreat(player, direction);
  const verticalNeed = goalRect.y + goalRect.h < player.y - GRID * 0.5;
  const sameColumn = Math.abs(targetX - centerX) < GRID * (2 + profile.routeLookahead * 0.4);
  const climbTarget = nearestPlatformAbove(player);
  if (climbTarget && player.grounded) {
    const climbCenter = (climbTarget.c + climbTarget.w / 2) * GRID;
    controls.left = climbCenter < centerX;
    controls.right = climbCenter >= centerX;
  }
  if (aiShouldJump(player, direction, profile, goalRect) || (verticalNeed && sameColumn && Math.random() < profile.jumpBias)) controls.jump = true;
  if ((projectileThreat || hazardAhead) && aiShouldDash(player, direction, profile)) controls.dash = true;
  if (hazardAhead && !controls.jump && player.grounded && profile === aiProfiles.easy && Math.random() < 0.24) {
    controls.left = direction > 0;
    controls.right = direction < 0;
  }

  const errorChance = profile === aiProfiles.easy ? 0.12 : profile === aiProfiles.medium ? 0.05 : 0.02;
  if (Math.random() < errorChance) {
    const veerLeft = Math.random() < 0.5;
    controls.left = veerLeft;
    controls.right = !veerLeft;
    controls.jump = Math.random() < 0.2;
  }

  state.ai.controls = controls;
  state.ai.thinkTimer = profile.reaction;
  return controls;
}

function candidateDraftPlacements(option) {
  const spots = [];
  const spawnPlatforms = new Set();
  const goalPlatforms = new Set();
  getAllTemplatePlatforms().forEach((platform, index) => {
    if (activePlayerIds().some((id) => {
      const spawn = state.template.spawns[id] || state.template.spawns.blue;
      return spawn && spawn.c >= platform.c && spawn.c < platform.c + platform.w && spawn.r >= platform.r - 2 && spawn.r <= platform.r;
    })) spawnPlatforms.add(index);
    if (state.template.goal.c + state.template.goal.w > platform.c && state.template.goal.c < platform.c + platform.w && state.template.goal.r >= platform.r - 2 && state.template.goal.r <= platform.r) {
      goalPlatforms.add(index);
    }
  });
  getAllTemplatePlatforms().forEach((platform, index) => {
    if (spawnPlatforms.has(index) || goalPlatforms.has(index)) return;
    for (let offset = 0; offset < platform.w; offset += 1) {
      const c = platform.c + offset;
      const r = platform.r - 1;
      const laneBias = offset / Math.max(1, platform.w - 1);
      spots.push({ c, r, platformIndex: index, platform, laneBias, edgeBias: Math.min(laneBias, 1 - laneBias) });
    }
  });
  return spots;
}

function aiPlacementScore(option, candidate, rotation) {
  const goalCenter = state.template.goal.c + state.template.goal.w * 0.5;
  const platformCenter = candidate.platform.c + candidate.platform.w * 0.5;
  let score = -Math.abs(platformCenter - goalCenter) * 0.18;
  const towardGoal = goalCenter >= candidate.c ? 90 : 270;
  const verticalGoal = state.template.goal.r < candidate.r ? 0 : 180;
  const sameLane = Math.abs(candidate.platform.r - state.template.goal.r) < 6;
  const surfaceHorizontal = rotation === 0 || rotation === 180;
  if (candidate.platform.w >= 5) score += 2.4;
  if (candidate.platform.r < state.template.spawns.red.r - 3) score += 1.1;
  if (option.id === "mine") score += 2.5 + candidate.edgeBias * 2.2;
  if (option.id === "spikes" || option.id === "slime" || option.id === "ice") score += 2.1 + candidate.edgeBias * 2.5 + (surfaceHorizontal ? 1.6 : 0.1);
  if (option.id === "snare") score += 2.8 + candidate.edgeBias * 1.8 + (sameLane ? 1.2 : 0);
  if (option.id === "laser") score += (rotation === verticalGoal || rotation === towardGoal ? 3.8 : 0.4) + (sameLane ? 1.1 : 0);
  if (option.id === "cannon" || option.id === "flame" || option.id === "fan" || option.id === "mortar") score += (rotation === towardGoal || rotation === verticalGoal ? 3.4 : 0.3) + (sameLane ? 0.8 : 0);
  if (option.id === "rocket") score += (isHorizontalRotation(rotation) ? 2.5 : 1.8) + Math.abs(platformCenter - goalCenter) * 0.02;
  if (option.id === "crate" || option.id === "blink") score += candidate.edgeBias * 1.2;
  score += Math.sin((candidate.c + candidate.r + rotation) * 1.7) * 0.08;
  return score;
}

function chooseAiDraftOption() {
  const profile = currentAiProfile();
  const weighted = [...state.draftOptions].sort((a, b) => {
    const score = (option) => {
      const eraseBias = state.traps.filter((entry) => !isFreshTrap(entry)).length >= 10 ? 8 : 0;
      const trapBias = { mine: 9, laser: 8, missile: 7, shock: 7, flame: 7, gravity: 6, rocket: 6, snare: 7, mortar: 6, devoutDash: 7, devoutCrawler: 6, devoutRanger: 8, fan: 5, saw: 5, buzzsaw: 6, spikes: 6, cannon: 5, slime: 4, ice: 3, crate: 2, oneway: 4, erase: 3 }[option.id] || 1;
      return trapBias + (option.id === "erase" ? eraseBias : 0) + Math.random() * (1 - profile.trapSkill) * 0.7;
    };
    return score(b) - score(a);
  });
  return weighted[0];
}

function executeAiDraftStep(dt) {
  if (!state.currentDraft || !isAIPlayer(state.currentDraft.playerId)) return;
  state.ai.draftTimer += dt;
  const profile = currentAiProfile();
  const delay = profile === aiProfiles.easy ? 0.5 : profile === aiProfiles.medium ? 0.32 : 0.18;
  if (state.ai.draftTimer < delay) return;
  state.ai.draftTimer = 0;

  if (state.phase === "draft-select") {
    const choice = chooseAiDraftOption();
    if (choice) selectDraftOption(choice.id);
    return;
  }
  if (state.phase !== "draft-place" || !state.currentDraft.selected) return;

  const option = state.currentDraft.selected;
  const candidates = candidateDraftPlacements(option);
  let bestPlacement = null;
  for (const candidate of candidates) {
    const rotations = option.rotatable ? [0, 90, 180, 270] : [0];
    for (const rotation of rotations) {
      if (option.id === "erase" || !canPlaceTrap(candidate.c, candidate.r, option.id, rotation)) continue;
      const score = aiPlacementScore(option, candidate, rotation);
      if (!bestPlacement || score > bestPlacement.score) bestPlacement = { ...candidate, rotation, score };
    }
  }
  if (bestPlacement) {
    state.currentDraft.rotation = bestPlacement.rotation;
    tryUseDraftAtCell(bestPlacement.c, bestPlacement.r);
    return;
  }

  if (option.id === "erase") {
    const erasable = state.traps.filter((entry) => !isFreshTrap(entry));
    const victim = erasable.find((entry) => Math.abs(entry.c - state.template.goal.c) < 12 || Math.abs(entry.r - state.template.goal.r) < 8) || erasable[0];
    if (victim) {
      tryUseDraftAtCell(victim.c, victim.r);
      return;
    }
  }

  finishDraftTurn("Intresting. . .");
}

function handleTrapInteractions(player, playerRect, dt) {
  player.surface = "normal";
  const playerInfluenceRect = { x: playerRect.x - GRID * 6, y: playerRect.y - GRID * 5, w: playerRect.w + GRID * 12, h: playerRect.h + GRID * 10 };
  const destroyedDevouts = new Set();
  updateDevouts(dt, playerRect);
  for (const entry of state.traps) {
    if (destroyedDevouts.has(entry)) continue;
    if (!intersects(playerInfluenceRect, trapVisualRect(entry)) && !["laser", "rocket"].includes(entry.id)) continue;
    if (isDevoutId(entry.id)) {
      const devoutRect = getDevoutRect(entry);
      if (player.dashTimer > 0 && intersects(playerRect, devoutRect)) {
        destroyedDevouts.add(entry);
        addParticles(devoutRect.x + devoutRect.w / 2, devoutRect.y + devoutRect.h / 2, trapDefinition(entry.id).color, 18, 1.4);
        playSound("eye", { pitch: 260, volume: 0.018, duration: 0.08 });
        continue;
      }
      if (intersects(playerRect, devoutRect) && !playerInvulnerable(player)) {
        killRunner(entry.id === "devoutDash"
          ? "The dash devout read your line and speared straight through it."
          : entry.id === "devoutRanger"
            ? "The ranger devout kept its distance until the room ran out of it."
            : "The crawler devout bounced through you like it knew the room better than you did.", "devout");
        return;
      }
      continue;
    }
    const cells = trapCells(entry);
    const rects = trapCellRects(entry);
    const pulse = Math.sin(state.time * 3 + entry.phase) > 0;
    for (let index = 0; index < cells.length; index += 1) {
      const cell = cells[index];
      const cellRect = rects[index];
      const touching = intersects(playerRect, cellRect);
      if (entry.id === "spikes" && touching && !playerInvulnerable(player)) { killRunner("The spikes were exactly where you deserved them.", "spikes"); return; }
      if (entry.id === "slime" && touching) {
        player.surface = "slime";
        player.slimeTouchTimer = 0.75;
      }
      if (entry.id === "ice" && touching) player.surface = "ice";
      if (entry.id === "mine" && entry.cooldown <= 0) {
          const blast = { x: cellRect.x - GRID * 2, y: cellRect.y - GRID * 2, w: GRID * 5, h: GRID * 5 };
          const projectileHit = state.projectiles.some((projectile) => intersects(projectile, blast));
          if ((intersects(playerRect, blast) && !playerInvulnerable(player)) || projectileHit) {
            entry.cooldown = 3.2;
            entry.blastTimer = 0.45;
            state.projectiles = state.projectiles.filter((projectile) => !intersects(projectile, blast));
            addParticles(cellRect.x + 16, cellRect.y + 16, "#ff8c77", 28, 2.4);
            state.screenShake = 26;
            playSound("mine", { duration: 0.24 });
            if (!playerInvulnerable(player) && intersects(playerRect, blast)) { killRunner("The mine took far more than a single step to anger.", "mine"); return; }
          }
        }
        if (entry.id === "flame" && fireJetState(entry) === "on") {
          const dir = rotationVector(entry.rotation || 0);
          const flameRect = dir.y !== 0
            ? { x: cellRect.x + 6, y: dir.y < 0 ? cellRect.y - GRID * 3 : cellRect.y, w: 20, h: GRID * 3 + GRID }
            : { x: dir.x < 0 ? cellRect.x - GRID * 3 : cellRect.x, y: cellRect.y + 6, w: GRID * 3 + GRID, h: 20 };
        if (intersects(playerRect, flameRect) && !playerInvulnerable(player)) { addParticles(cellRect.x + 16, cellRect.y + 16, "#ff8748", 20, 1.8); killRunner("The fire jet carved a line through the air and you were in it.", "flame"); return; }
      }
      if (entry.id === "gravity" && intersects(playerRect, { x: cellRect.x - 40, y: cellRect.y - 40, w: GRID + 80, h: GRID + 80 })) {
        const centerX = cellRect.x + 16;
        const centerY = cellRect.y + 16;
        const dx = centerX - (player.x + player.w / 2);
        const dy = centerY - (player.y + player.h / 2);
        const dist = Math.max(12, Math.hypot(dx, dy));
        player.vx += (dx / dist) * 0.55;
        player.vy += (dy / dist) * 0.55;
        if (dist < 20) addParticles(centerX, centerY, "#96a7ff", 1, 0.15);
      }
      if (entry.id === "snare" && touching) {
        player.snareTimer = Math.max(player.snareTimer, 1.25);
        addParticles(cellRect.x + 16, cellRect.y + 16, "#93d36a", 1, 0.05);
      }
    }
    const motion = getTrapMotionOffset(entry);
    const baseRect = { x: entry.c * GRID + motion.x, y: entry.r * GRID + motion.y, w: GRID, h: GRID };
    if (isWormholeId(entry.id) && player.wormholeCooldown <= 0 && intersects(playerRect, { x: baseRect.x + 4, y: baseRect.y + 4, w: GRID - 8, h: GRID - 8 })) {
      const paired = getPairedWormhole(entry);
      if (paired) {
        teleportPlayer(player, entry, paired);
        return;
      }
    }
    if (entry.id === "fan") {
      const dir = rotationVector(entry.rotation || 0);
      const area = dir.y !== 0 ? { x: baseRect.x - 16, y: dir.y < 0 ? baseRect.y - 128 : baseRect.y, w: GRID + 32, h: 128 } : { x: dir.x < 0 ? baseRect.x - 128 : baseRect.x, y: baseRect.y - 16, w: 128, h: GRID + 32 };
      if (intersects(playerRect, area)) {
        player.vx += dir.x * 0.45;
        player.vy += dir.y * 1.05;
        addParticles(player.x + player.w / 2, player.y + player.h / 2, "rgba(124,224,255,0.6)", 1, 0.15);
      }
    }
    if (entry.id === "laser" && pulse) {
      const rot = entry.rotation || 0;
      const beam = rot === 90 || rot === 270 ? { x: 0, y: baseRect.y + 12, w: currentWorldW(), h: 8 } : { x: baseRect.x + 12, y: 0, w: 8, h: currentWorldH() };
      if (intersects(playerRect, beam) && !playerInvulnerable(player)) { addParticles(player.x + player.w / 2, player.y + player.h / 2, "#ff5e9c", 14, 1.4); killRunner("The beam found the soft parts.", "laser"); return; }
    }
    if (entry.id === "saw") {
      const saw = getSawState(entry);
      const sawRect = { x: saw.x - 13, y: saw.y - 13, w: 26, h: 26 };
      if (intersects(playerRect, sawRect) && !playerInvulnerable(player)) { addParticles(saw.x, saw.y, "#d2d7df", 16, 1.5); killRunner("The saw had excellent manners.", "saw"); return; }
    }
    if (entry.id === "buzzsaw") {
      const buzzsaw = getBuzzsawState(entry);
      const buzzsawRect = { x: buzzsaw.x - 14, y: buzzsaw.y - 14, w: 28, h: 28 };
      if (intersects(playerRect, buzzsawRect) && !playerInvulnerable(player)) { addParticles(buzzsaw.x, buzzsaw.y, "#ff8c61", 18, 1.5); killRunner("The buzzsaw found a wall, turned around, and chose you instead.", "buzzsaw"); return; }
    }
    if (entry.id === "rocket") {
      const rocket = getRocketState(entry);
      const flameRect = { x: rocket.flameX - 12, y: rocket.flameY - 12, w: 24, h: 24 };
      if (intersects(playerRect, flameRect) && !playerInvulnerable(player)) {
        addParticles(rocket.flameX, rocket.flameY, "#ffd36b", 18, 1.5);
        killRunner("The rocket rail burned the route right out from under you.", "rocket");
        return;
      }
    }
    if (entry.id === "pulse") {
      const pulse = pulseTrapState(entry);
      if (pulse.mode === "burst") {
        const centerX = entry.c * GRID + 16;
        const centerY = entry.r * GRID + 16;
        const closestX = clamp(centerX, playerRect.x, playerRect.x + playerRect.w);
        const closestY = clamp(centerY, playerRect.y, playerRect.y + playerRect.h);
        const dx = centerX - closestX;
        const dy = centerY - closestY;
        if (dx * dx + dy * dy <= pulse.radius * pulse.radius && !playerInvulnerable(player)) {
          addParticles(centerX, centerY, "#ff83cd", 18, 1.4);
          killRunner("The pulse idol bloomed at exactly the wrong distance.", "generic");
          return;
        }
      }
    }
    if (entry.id === "piston") {
      const pistonRect = pistonTrapRect(entry);
      if (pistonRect && intersects(playerRect, pistonRect) && !playerInvulnerable(player)) {
        addParticles(player.x + player.w / 2, player.y + player.h / 2, "#cfd5e2", 18, 1.3);
        killRunner("The piston ram flattened your argument instantly.", "generic");
        return;
      }
    }
  }
  if (destroyedDevouts.size) state.traps = state.traps.filter((entry) => !destroyedDevouts.has(entry));
  updateProjectiles(dt, playerRect);
}

function startDash(player, direction) {
  player.dashTimer = 0.18;
  player.dashCooldown = 1.1;
  player.dashDirection = direction || player.facing || 1;
  player.vx = player.dashDirection * 11.5;
  player.vy = 0;
  player.grounded = false;
  addParticles(player.x + player.w / 2, player.y + player.h / 2, displayColor(player.id), 10, 1.2);
  playSound("dash", { duration: 0.12 });
}

function moveRunner(player, dt) {
  const controls = getPlayerControls(player, dt);
  const left = controls.left;
  const right = controls.right;
  const jump = controls.jump;
  const dash = controls.dash && player.snareTimer <= 0.2;
  if (left) player.facing = -1;
  if (right) player.facing = 1;
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.spawnShield = Math.max(0, player.spawnShield - dt);
  player.wormholeCooldown = Math.max(0, player.wormholeCooldown - dt);
  if (dash && player.dashCooldown <= 0 && player.dashTimer <= 0) startDash(player, left ? -1 : right ? 1 : player.facing || 1);
  if (player.dashTimer > 0) {
    player.dashTimer = Math.max(0, player.dashTimer - dt);
    const previousX = player.x;
    const previousY = player.y;

    let nextX = clamp(player.x + player.vx * 60 * dt, 0, currentWorldW() - player.w);
    let rect = { x: nextX, y: player.y, w: player.w, h: player.h };
    for (const solid of getSolidRects()) {
      if (!intersects(rect, solid)) continue;
      if (player.vx > 0) nextX = solid.x - player.w;
      if (player.vx < 0) nextX = solid.x + solid.w;
      player.vx = 0;
      rect.x = nextX;
      player.dashTimer = 0;
    }
    for (const oneWay of getOneWayTrapRects()) {
      if (!intersects(rect, oneWay)) continue;
      const rot = oneWay.rotation || 0;
      if (rot === 270 && player.vx > 0 && previousX + player.w <= oneWay.x + 6) {
        nextX = oneWay.x - player.w;
        player.vx = 0;
        player.dashTimer = 0;
        rect.x = nextX;
      }
      if (rot === 90 && player.vx < 0 && previousX >= oneWay.x + oneWay.w - 6) {
        nextX = oneWay.x + oneWay.w;
        player.vx = 0;
        player.dashTimer = 0;
        rect.x = nextX;
      }
    }
    player.x = clamp(nextX, 0, currentWorldW() - player.w);

    let nextY = clamp(player.y + player.vy * 60 * dt, -20, currentWorldH() + 180);
    rect = { x: player.x, y: nextY, w: player.w, h: player.h };
    for (const solid of getSolidRects()) {
      if (!intersects(rect, solid)) continue;
      if (player.vy > 0) nextY = solid.y - player.h;
      else if (player.vy < 0) nextY = solid.y + solid.h;
      player.vy = 0;
      player.dashTimer = 0;
      rect.y = nextY;
    }
    for (const oneWay of getOneWayTrapRects()) {
      if (!intersects(rect, oneWay)) continue;
      const rot = oneWay.rotation || 0;
      if (rot === 0 && player.vy > 0 && previousY + player.h <= oneWay.y + 6) {
        nextY = oneWay.y - player.h;
        player.vy = 0;
        player.dashTimer = 0;
        rect.y = nextY;
      } else if (rot === 180 && player.vy < 0 && previousY >= oneWay.y + oneWay.h - 6) {
        nextY = oneWay.y + oneWay.h;
        player.vy = 0;
        player.dashTimer = 0;
        rect.y = nextY;
      }
    }
    player.y = nextY;
    return;
  }

  const onIce = player.surface === "ice";
  const onSlime = player.surface === "slime";
  player.snareTimer = Math.max(0, player.snareTimer - dt);
  player.slimeTouchTimer = Math.max(0, player.slimeTouchTimer - dt);
  player.emberTimer = Math.max(0, player.emberTimer - dt);
  const snared = player.snareTimer > 0;
  const accel = onSlime ? 0.12 : onIce ? 0.42 : 0.64;
  const controlMaxSpeed = onSlime ? 1.4 : onIce ? 8.2 : RUN_SPEED;
  const groundFriction = onIce ? 0.988 : onSlime ? 0.93 : 0.82;
  const braking = onIce ? 0.992 : onSlime ? 0.96 : 0.88;
  const airControl = onIce ? 0.08 : onSlime ? 0.14 : 0.22;
  const airDrag = onIce ? 0.996 : onSlime ? 0.985 : 0.975;
  const airborneSpeedCap = onIce ? 6.2 : onSlime ? 3.4 : 4.9;
  const controlFactor = (player.grounded ? 1 : airControl) * (snared ? 0.45 : 1);
  if (left) player.vx -= accel * controlFactor;
  if (right) player.vx += accel * controlFactor;
  if (!left && !right && player.grounded) player.vx *= groundFriction;
  if (!player.grounded) player.vx *= airDrag;
  if (left && player.vx > 0) player.vx *= braking;
  if (right && player.vx < 0) player.vx *= braking;
  if (Math.abs(player.vx) > controlMaxSpeed) {
    const overflowDecay = player.grounded ? (onIce ? 0.996 : onSlime ? 0.94 : 0.9) : 0.995;
    player.vx *= overflowDecay;
  }
  if (snared) player.vx *= player.grounded ? 0.94 : 0.97;
  player.vx = clamp(player.vx, -10.5, 10.5);
  if (!player.grounded) player.vx = clamp(player.vx, -airborneSpeedCap, airborneSpeedCap);
  if (jump && player.grounded) {
    player.vy = onSlime ? JUMP_VELOCITY * 0.72 : snared ? JUMP_VELOCITY * 0.82 : JUMP_VELOCITY;
    player.grounded = false;
    addParticles(player.x + player.w / 2, player.y + player.h, displayColor(player.id), 8, 0.9);
    playSound("jump", { duration: 0.1 });
  }
  player.vy += GRAVITY;
  player.vy = Math.min(player.vy, 16);

  const previousX = player.x;
  const previousY = player.y;
  let nextX = player.x + player.vx * 60 * dt;
  let rect = { x: nextX, y: player.y, w: player.w, h: player.h };
  for (const solid of getSolidRects()) {
    if (!intersects(rect, solid)) continue;
    if (player.vx > 0) nextX = solid.x - player.w;
    if (player.vx < 0) nextX = solid.x + solid.w;
    player.vx = 0;
    rect.x = nextX;
  }
  for (const oneWay of getOneWayTrapRects()) {
    if (!intersects(rect, oneWay)) continue;
    const rot = oneWay.rotation || 0;
    if (rot === 270 && player.vx > 0 && previousX + player.w <= oneWay.x + 6) {
      nextX = oneWay.x - player.w;
      player.vx = 0;
      rect.x = nextX;
    }
    if (rot === 90 && player.vx < 0 && previousX >= oneWay.x + oneWay.w - 6) {
      nextX = oneWay.x + oneWay.w;
      player.vx = 0;
      rect.x = nextX;
    }
  }
  player.x = clamp(nextX, 0, currentWorldW() - player.w);

  let nextY = player.y + player.vy * 60 * dt;
  rect = { x: player.x, y: nextY, w: player.w, h: player.h };
  player.grounded = false;
  for (const solid of getSolidRects()) {
    if (!intersects(rect, solid)) continue;
    if (player.vy > 0) {
      nextY = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy < 0) {
      nextY = solid.y + solid.h;
      player.vy = 0;
    }
    rect.y = nextY;
  }
  for (const oneWay of getOneWayTrapRects()) {
    if (!intersects(rect, oneWay)) continue;
    const rot = oneWay.rotation || 0;
    if (rot === 0 && player.vy > 0 && previousY + player.h <= oneWay.y + 6) {
      nextY = oneWay.y - player.h;
      player.vy = 0;
      player.grounded = true;
      rect.y = nextY;
    } else if (rot === 180 && player.vy < 0 && previousY >= oneWay.y + oneWay.h - 6) {
      nextY = oneWay.y + oneWay.h;
      player.vy = 0;
      rect.y = nextY;
    }
  }
  player.y = nextY;
}

function updateRun(dt) {
  const player = currentRunner();
  if (!player || !player.alive) return;
  state.currentRunTime += dt;
  updateTrapTimers(dt);
  updateMechanicalTrapState({ x: player.x, y: player.y, w: player.w, h: player.h }, dt);
  moveRunner(player, dt);
  const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
  handleTrapInteractions(player, rect, dt);
  if (state.mode === "story" && state.story.justRespawned) {
    state.story.justRespawned = false;
    return;
  }
  if (!player.alive) return;
  if (state.mode === "story") updateStoryCheckpoint(player);
  handleGoal(player);
  if (!player.alive) return;
  if (player.y > currentWorldH() + 180) killRunner("The pit accepted your confession.", player.slimeTouchTimer > 0 ? "slimefail" : "generic");
}
function updateCamera() {
  const player = currentRunner();
  const viewW = canvas.width / state.zoom;
  const viewH = canvas.height / state.zoom;
  const targetX = player ? player.x + player.w / 2 - viewW / 2 : currentWorldW() / 2 - viewW / 2;
  const targetY = player ? player.y + player.h / 2 - viewH / 2 : currentWorldH() / 2 - viewH / 2;
  state.view.x += (clamp(targetX, 0, currentWorldW() - viewW) - state.view.x) * 0.12;
  state.view.y += (clamp(targetY, 0, currentWorldH() - viewH) - state.view.y) * 0.12;
}

function drawWorldRect(rect, color, glow = false) {
  const screen = worldToScreenRect(rect);
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 18; }
  ctx.fillStyle = color;
  ctx.fillRect(screen.x, screen.y, screen.w, screen.h);
  ctx.shadowBlur = 0;
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else line = test;
  });
  if (line) ctx.fillText(line, x, lineY);
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
  const hellGlow = ctx.createLinearGradient(0, canvas.height * 0.72, 0, canvas.height);
  hellGlow.addColorStop(0, "rgba(0,0,0,0)");
  hellGlow.addColorStop(0.4, "rgba(72,14,12,0.18)");
  hellGlow.addColorStop(1, "rgba(255,98,44,0.32)");
  ctx.fillStyle = hellGlow;
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
  for (let flame = 0; flame < 22; flame += 1) {
    const baseX = (flame / 21) * canvas.width;
    const flameH = 38 + (Math.sin(state.time * 2.6 + flame * 0.7) + 1) * 28;
    const sway = Math.sin(state.time * 3.1 + flame) * 16;
    const grad = ctx.createLinearGradient(baseX, canvas.height, baseX, canvas.height - flameH - 16);
    grad.addColorStop(0, "rgba(255,82,34,0.86)");
    grad.addColorStop(0.4, "rgba(255,150,62,0.52)");
    grad.addColorStop(1, "rgba(255,210,130,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(baseX - 20, canvas.height);
    ctx.quadraticCurveTo(baseX - 16 + sway * 0.3, canvas.height - flameH * 0.45, baseX + sway * 0.25, canvas.height - flameH);
    ctx.quadraticCurveTo(baseX + 16 + sway * 0.5, canvas.height - flameH * 0.45, baseX + 22, canvas.height);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWatcherEye() {
  const mood = eyeMoods[state.eyeMood] || eyeMoods.hungry;
  const runner = currentRunner();
  const targetWorldX = runner ? runner.x + runner.w / 2 : currentWorldW() / 2;
  const targetWorldY = runner ? runner.y + runner.h / 2 : currentWorldH() / 2;
  const targetX = ((targetWorldX / currentWorldW()) - 0.5) * canvas.width * 0.16;
  const targetY = ((targetWorldY / currentWorldH()) - 0.5) * canvas.height * 0.12;
  const jitterX = Math.sin(state.time * 8.2) * mood.jitter * 6;
  const jitterY = Math.cos(state.time * 10.1) * mood.jitter * 4;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const eyeW = canvas.width * 1.1;
  const eyeH = canvas.height * 0.96;
  const blink = Math.max(0.1, Math.abs(Math.sin(state.time * (0.55 + mood.jitter * 0.14))));
  const lidDepth = mood.lid * eyeH + (1 - blink) * eyeH * 0.38;
  const lowerLid = (mood.lowerLid || 0.06) * eyeH;
  const eyeTilt = mood.tilt || 0;
  const pinch = mood.pinch || 0.06;
  const pupilShiftX = targetX + jitterX * 1.4;
  const pupilShiftY = targetY + jitterY * 1.15;
  ctx.save();
  const blood = ctx.createRadialGradient(cx, cy, eyeW * 0.08, cx, cy, eyeW * 0.72);
  blood.addColorStop(0, "rgba(83,8,14,0.15)");
  blood.addColorStop(0.55, "rgba(34,4,8,0.42)");
  blood.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = blood;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(cx, cy);
  ctx.rotate(eyeTilt);
  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.beginPath();
  ctx.ellipse(0, 0, eyeW * 0.58, eyeH * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  const socket = ctx.createRadialGradient(0, 0, eyeW * 0.03, 0, 0, eyeW * 0.6);
  socket.addColorStop(0, "rgba(18,3,5,0.08)");
  socket.addColorStop(0.35, mood.ring);
  socket.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = socket;
  ctx.beginPath();
  ctx.ellipse(0, 0, eyeW * 0.63, eyeH * 0.56, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mood.sclera;
  ctx.beginPath();
  ctx.moveTo(-eyeW / 2, 0);
  ctx.quadraticCurveTo(-eyeW * pinch, -eyeH / 2 + lidDepth, eyeW / 2, 0);
  ctx.quadraticCurveTo(eyeW * pinch, eyeH / 2 - lidDepth - lowerLid, -eyeW / 2, 0);
  ctx.fill();
  const scleraShade = ctx.createRadialGradient(0, 0, eyeW * 0.03, 0, 0, eyeW * 0.5);
  scleraShade.addColorStop(0, "rgba(255,245,230,0)");
  scleraShade.addColorStop(0.72, "rgba(109,30,39,0.1)");
  scleraShade.addColorStop(1, "rgba(84,12,20,0.28)");
  ctx.fillStyle = scleraShade;
  ctx.beginPath();
  ctx.moveTo(-eyeW / 2, 0);
  ctx.quadraticCurveTo(-eyeW * pinch, -eyeH / 2 + lidDepth, eyeW / 2, 0);
  ctx.quadraticCurveTo(eyeW * pinch, eyeH / 2 - lidDepth - lowerLid, -eyeW / 2, 0);
  ctx.fill();
  const irisGlow = ctx.createRadialGradient(pupilShiftX * 0.75, pupilShiftY * 0.6, eyeW * 0.02, pupilShiftX * 0.75, pupilShiftY * 0.6, eyeW * 0.24);
  irisGlow.addColorStop(0, mood.iris);
  irisGlow.addColorStop(0.28, mood.iris);
  irisGlow.addColorStop(0.72, "rgba(44,7,11,0.88)");
  irisGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = irisGlow;
  ctx.beginPath();
  ctx.ellipse(pupilShiftX * 0.82, pupilShiftY * 0.64, eyeW * 0.23, eyeH * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mood.iris;
  ctx.beginPath();
  ctx.ellipse(pupilShiftX * 0.84, pupilShiftY * 0.65, eyeW * 0.18, eyeH * 0.23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(63,12,18,0.34)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(pupilShiftX * 0.84, pupilShiftY * 0.65, eyeW * 0.16, eyeH * 0.2, 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.ellipse(pupilShiftX * 0.78 - eyeW * 0.035, pupilShiftY * 0.56 - eyeH * 0.05, eyeW * 0.035, eyeH * 0.05, -0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#05070d";
  ctx.beginPath();
  ctx.ellipse(pupilShiftX, pupilShiftY, eyeW * 0.038 * (mood.pupil || 1), eyeH * 0.22 * (mood.pupil || 1), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,220,112,0.54)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let step = 0; step <= 42; step += 1) {
    const t = step / 42;
    const angle = t * Math.PI * 5.4 + state.time * 0.45;
    const radiusX = eyeW * (0.01 + t * 0.12);
    const radiusY = eyeH * (0.015 + t * 0.17);
    const px = pupilShiftX * 0.84 + Math.cos(angle) * radiusX;
    const py = pupilShiftY * 0.65 + Math.sin(angle) * radiusY;
    if (step === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(6,10,16,0.48)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-eyeW * 0.48, -eyeH * 0.08 - lidDepth * 0.12);
  ctx.quadraticCurveTo(0, -eyeH * 0.3 - lidDepth * 0.04, eyeW * 0.48, -eyeH * 0.08 - lidDepth * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-eyeW * 0.46, eyeH * 0.1 + lowerLid * 0.18);
  ctx.quadraticCurveTo(0, eyeH * 0.28 + lowerLid * 0.08, eyeW * 0.46, eyeH * 0.1 + lowerLid * 0.18);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(92,10,18,0.42)";
  ctx.lineCap = "round";
  for (let branch = 0; branch < 7; branch += 1) {
    const leftY = canvas.height * (0.08 + branch * 0.12);
    ctx.lineWidth = 10 - branch * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, leftY);
    ctx.bezierCurveTo(
      canvas.width * 0.06,
      leftY + Math.sin(state.time * 1.2 + branch) * 26,
      canvas.width * 0.11,
      leftY + Math.cos(state.time * 1.6 + branch) * 42,
      canvas.width * (0.16 + branch * 0.01),
      leftY + Math.sin(state.time * 1.9 + branch * 0.6) * 54
    );
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.08, leftY + 10);
    ctx.quadraticCurveTo(canvas.width * 0.13, leftY - 14, canvas.width * 0.18, leftY + 30);
    ctx.stroke();
  }
  for (let branch = 0; branch < 7; branch += 1) {
    const rightY = canvas.height * (0.1 + branch * 0.115);
    ctx.lineWidth = 10 - branch * 0.8;
    ctx.beginPath();
    ctx.moveTo(canvas.width, rightY);
    ctx.bezierCurveTo(
      canvas.width * 0.94,
      rightY + Math.cos(state.time * 1.1 + branch) * 24,
      canvas.width * 0.89,
      rightY + Math.sin(state.time * 1.5 + branch) * 40,
      canvas.width * (0.84 - branch * 0.01),
      rightY + Math.cos(state.time * 1.8 + branch * 0.5) * 50
    );
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.92, rightY - 8);
    ctx.quadraticCurveTo(canvas.width * 0.88, rightY + 18, canvas.width * 0.82, rightY - 26);
    ctx.stroke();
  }
  for (let branch = 0; branch < 5; branch += 1) {
    const topX = canvas.width * (0.16 + branch * 0.17);
    ctx.lineWidth = 8 - branch * 0.7;
    ctx.beginPath();
    ctx.moveTo(topX, 0);
    ctx.bezierCurveTo(
      topX + Math.sin(state.time * 1.1 + branch) * 18,
      canvas.height * 0.05,
      topX + Math.cos(state.time * 1.4 + branch) * 32,
      canvas.height * 0.1,
      topX + Math.sin(state.time * 1.7 + branch * 0.8) * 40,
      canvas.height * 0.16
    );
    ctx.stroke();
  }
  for (let branch = 0; branch < 5; branch += 1) {
    const bottomX = canvas.width * (0.18 + branch * 0.16);
    ctx.lineWidth = 8 - branch * 0.7;
    ctx.beginPath();
    ctx.moveTo(bottomX, canvas.height);
    ctx.bezierCurveTo(
      bottomX + Math.cos(state.time * 1.15 + branch) * 18,
      canvas.height * 0.95,
      bottomX + Math.sin(state.time * 1.45 + branch) * 30,
      canvas.height * 0.9,
      bottomX + Math.cos(state.time * 1.75 + branch * 0.7) * 36,
      canvas.height * 0.84
    );
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(162,28,38,0.22)";
  ctx.lineWidth = 2.5;
  for (let cap = 0; cap < 10; cap += 1) {
    const y = canvas.height * (0.06 + cap * 0.09);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width * 0.06, y + Math.sin(state.time * 2.1 + cap) * 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width, y + 8);
    ctx.lineTo(canvas.width * 0.94, y + Math.cos(state.time * 2 + cap) * 12);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(110,14,24,0.36)";
  ctx.lineWidth = 5;
  for (let wrap = 0; wrap < 6; wrap += 1) {
    const arcY = canvas.height * (0.24 + wrap * 0.08);
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.14, arcY);
    ctx.bezierCurveTo(canvas.width * 0.28, arcY - 18, canvas.width * 0.72, arcY + 12, canvas.width * 0.86, arcY - 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGoal() {
  const goal = worldToScreenRect(getGoalRect());
  const tileW = goal.w / 4;
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "#10161f" : "#f4f2ef";
    ctx.fillRect(goal.x + i * tileW, goal.y, tileW, goal.h / 2);
    ctx.fillStyle = i % 2 === 0 ? "#f4f2ef" : "#10161f";
    ctx.fillRect(goal.x + i * tileW, goal.y + goal.h / 2, tileW, goal.h / 2);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.36)";
  ctx.lineWidth = 2;
  ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
  if (state.mode === "story") {
    const keyX = goal.x + goal.w * 0.5;
    const keyY = goal.y - 18 * state.zoom + Math.sin(state.time * 3.2) * 4 * state.zoom;
    drawGlowCircle(keyX, keyY, 18 * state.zoom, "rgba(255,211,107,0.95)", 0.18);
    ctx.strokeStyle = "#ffd36b";
    ctx.lineWidth = 3 * state.zoom;
    ctx.beginPath();
    ctx.arc(keyX - 7 * state.zoom, keyY, 6 * state.zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(keyX - 1 * state.zoom, keyY);
    ctx.lineTo(keyX + 12 * state.zoom, keyY);
    ctx.lineTo(keyX + 12 * state.zoom, keyY + 5 * state.zoom);
    ctx.moveTo(keyX + 7 * state.zoom, keyY);
    ctx.lineTo(keyX + 7 * state.zoom, keyY + 4 * state.zoom);
    ctx.stroke();
  }
}

function drawStoryCheckpoints() {
  if (state.mode !== "story") return;
  const checkpoints = state.template?.checkpoints || [];
  if (!checkpoints.length) return;
  storyCheckpointRects().forEach((entry) => {
    const rect = worldToScreenRect(entry);
    const reached = entry.index < state.story.checkpointIndex;
    const active = entry.index === state.story.checkpointIndex;
    const pulse = 0.78 + Math.sin(state.time * 4 + entry.index) * 0.12;
    ctx.save();
    ctx.globalAlpha = reached ? 0.42 : 1;
    drawGlowCircle(rect.x + rect.w / 2, rect.y + rect.h * 0.45, 22 * state.zoom, active ? "rgba(255,211,107,0.9)" : "rgba(145,215,255,0.8)", active ? 0.26 * pulse : 0.2);
    ctx.fillStyle = active ? "#ffd36b" : "#91d7ff";
    ctx.beginPath();
    ctx.moveTo(rect.x + rect.w * 0.5, rect.y + 2 * state.zoom);
    ctx.lineTo(rect.x + rect.w - 5 * state.zoom, rect.y + rect.h * 0.42);
    ctx.lineTo(rect.x + rect.w * 0.7, rect.y + rect.h * 0.42);
    ctx.lineTo(rect.x + rect.w * 0.7, rect.y + rect.h - 3 * state.zoom);
    ctx.lineTo(rect.x + rect.w * 0.3, rect.y + rect.h - 3 * state.zoom);
    ctx.lineTo(rect.x + rect.w * 0.3, rect.y + rect.h * 0.42);
    ctx.lineTo(rect.x + 5 * state.zoom, rect.y + rect.h * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0f1930";
    ctx.font = `${Math.max(11, 13 * state.zoom)}px Trebuchet MS`;
    ctx.textAlign = "center";
    ctx.fillText(String(entry.index + 1), rect.x + rect.w * 0.5, rect.y + rect.h * 0.66);
    ctx.restore();
  });
}

function drawSolids() {
  const platformCells = getTemplatePlatformCells();
  getAllTemplatePlatforms().forEach((platform) => {
    const rect = { x: platform.c * GRID, y: platform.r * GRID, w: platform.w * GRID, h: platform.h * GRID };
    if (!rectVisibleInView(rect, GRID * 2)) return;
    for (let rr = 0; rr < platform.h; rr += 1) {
      for (let cc = 0; cc < platform.w; cc += 1) {
        const c = platform.c + cc;
        const r = platform.r + rr;
        const tileRect = worldToScreenRect({ x: c * GRID, y: r * GRID, w: GRID, h: GRID });
        const topOpen = !platformCells.has(`${c},${r - 1}`);
        const leftOpen = !platformCells.has(`${c - 1},${r}`);
        const rightOpen = !platformCells.has(`${c + 1},${r}`);
        const bottomOpen = !platformCells.has(`${c},${r + 1}`);
        const isIron = platform.material === "iron";
        ctx.fillStyle = isIron ? "#6b778c" : "#7c5a3d";
        ctx.fillRect(tileRect.x, tileRect.y, tileRect.w, tileRect.h);
        ctx.fillStyle = isIron ? (topOpen ? "#dce4ef" : "#9ca8bd") : (topOpen ? "#d6a069" : "#9f744f");
        ctx.fillRect(tileRect.x, tileRect.y, tileRect.w, Math.max(4 * state.zoom, tileRect.h * 0.18));
        if (leftOpen) {
          ctx.fillStyle = isIron ? "rgba(33,41,56,0.34)" : "rgba(77,48,24,0.42)";
          ctx.fillRect(tileRect.x, tileRect.y, Math.max(3 * state.zoom, tileRect.w * 0.12), tileRect.h);
        }
        if (rightOpen) {
          ctx.fillStyle = isIron ? "rgba(17,24,38,0.28)" : "rgba(56,34,18,0.3)";
          ctx.fillRect(tileRect.x + tileRect.w - Math.max(3 * state.zoom, tileRect.w * 0.12), tileRect.y, Math.max(3 * state.zoom, tileRect.w * 0.12), tileRect.h);
        }
        if (bottomOpen) {
          ctx.fillStyle = isIron ? "rgba(12,18,29,0.24)" : "rgba(54,33,17,0.25)";
          ctx.fillRect(tileRect.x, tileRect.y + tileRect.h - Math.max(4 * state.zoom, tileRect.h * 0.16), tileRect.w, Math.max(4 * state.zoom, tileRect.h * 0.16));
        }
      }
    }
  });
}

function drawArrow(centerX, centerY, rotation, size, color) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(size * 0.55, 0);
  ctx.lineTo(size * 0.18, 0);
  ctx.lineTo(size * 0.18, size * 0.8);
  ctx.lineTo(-size * 0.18, size * 0.8);
  ctx.lineTo(-size * 0.18, 0);
  ctx.lineTo(-size * 0.55, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGlowCircle(x, y, radius, color, alpha = 0.4) {
  const glow = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(1, `rgba(0,0,0,0)`);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawTrap(entry, ghost = false, showArrow = false) {
  if (!ghost && !rectVisibleInView(trapVisualRect(entry), GRID * 2)) return;
  const def = trapDefinition(entry.id);
  const cells = trapCells(entry);
  const motion = getTrapMotionOffset(entry);
  const pulse = Math.sin(state.time * 4 + (entry.phase || 0));
  ctx.globalAlpha = ghost ? 0.46 : 1;

  cells.forEach((cell, index) => {
    const rect = worldToScreenRect({ x: cell.c * GRID + 2 + motion.x, y: cell.r * GRID + 2 + motion.y, w: GRID - 4, h: GRID - 4 });
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;

    if (entry.id === "crate") {
      ctx.fillStyle = "#7b552e";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = "#cf9553";
      ctx.fillRect(rect.x + 2 * state.zoom, rect.y + 2 * state.zoom, rect.w - 4 * state.zoom, rect.h - 4 * state.zoom);
      ctx.strokeStyle = "rgba(63,32,12,0.8)";
      ctx.lineWidth = 2 * state.zoom;
      ctx.strokeRect(rect.x + 5 * state.zoom, rect.y + 5 * state.zoom, rect.w - 10 * state.zoom, rect.h - 10 * state.zoom);
      ctx.beginPath();
      ctx.moveTo(rect.x + 5 * state.zoom, rect.y + 5 * state.zoom);
      ctx.lineTo(rect.x + rect.w - 5 * state.zoom, rect.y + rect.h - 5 * state.zoom);
      ctx.moveTo(rect.x + rect.w - 5 * state.zoom, rect.y + 5 * state.zoom);
      ctx.lineTo(rect.x + 5 * state.zoom, rect.y + rect.h - 5 * state.zoom);
      ctx.stroke();
    }

    if (entry.id === "spikes") {
      ctx.fillStyle = "rgba(255,119,97,0.18)";
      ctx.fillRect(rect.x, rect.y + rect.h * 0.45, rect.w, rect.h * 0.45);
      ctx.fillStyle = "#ff6f61";
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(rect.x + (3 + i * 9) * state.zoom, rect.y + rect.h);
        ctx.lineTo(rect.x + (8 + i * 9) * state.zoom, rect.y + 7 * state.zoom);
        ctx.lineTo(rect.x + (13 + i * 9) * state.zoom, rect.y + rect.h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,220,210,0.55)";
      ctx.fillRect(rect.x + 4 * state.zoom, rect.y + rect.h * 0.56, rect.w - 8 * state.zoom, 2 * state.zoom);
    }

    if (entry.id === "slime") {
      const wobble = Math.sin(state.time * 5 + index * 0.8) * 2 * state.zoom;
      ctx.fillStyle = "#5db92d";
      ctx.fillRect(rect.x, rect.y + rect.h * 0.6, rect.w, rect.h * 0.24);
      ctx.fillStyle = "#96ef62";
      ctx.beginPath();
      ctx.moveTo(rect.x, rect.y + rect.h * 0.64);
      ctx.quadraticCurveTo(rect.x + rect.w * 0.3, rect.y + rect.h * 0.48 + wobble, rect.x + rect.w * 0.5, rect.y + rect.h * 0.6);
      ctx.quadraticCurveTo(rect.x + rect.w * 0.75, rect.y + rect.h * 0.72 - wobble, rect.x + rect.w, rect.y + rect.h * 0.58);
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h * 0.84);
      ctx.lineTo(rect.x, rect.y + rect.h * 0.84);
      ctx.closePath();
      ctx.fill();
      drawGlowCircle(cx, rect.y + rect.h * 0.68, 11 * state.zoom, "rgba(150,239,98,0.8)", 0.18);
    }

    if (entry.id === "ice") {
      const shimmer = (Math.sin(state.time * 4 + index) + 1) * 0.5;
      ctx.fillStyle = "#69c7eb";
      ctx.fillRect(rect.x, rect.y + rect.h * 0.56, rect.w, rect.h * 0.28);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillRect(rect.x + 2 * state.zoom, rect.y + rect.h * 0.48, rect.w - 4 * state.zoom, 4 * state.zoom);
      ctx.strokeStyle = `rgba(255,255,255,${0.2 + shimmer * 0.35})`;
      ctx.lineWidth = 2 * state.zoom;
      ctx.beginPath();
      ctx.moveTo(rect.x + 4 * state.zoom, rect.y + rect.h * 0.78);
      ctx.lineTo(rect.x + rect.w * 0.45, rect.y + rect.h * 0.62);
      ctx.lineTo(rect.x + rect.w - 4 * state.zoom, rect.y + rect.h * 0.74);
      ctx.stroke();
    }

    if (entry.id === "oneway") {
      ctx.fillStyle = "#85c7e6";
      ctx.fillRect(rect.x + 3 * state.zoom, rect.y + 3 * state.zoom, rect.w - 6 * state.zoom, rect.h - 6 * state.zoom);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillRect(rect.x + 4 * state.zoom, rect.y + 4 * state.zoom, rect.w - 8 * state.zoom, 4 * state.zoom);
      ctx.strokeStyle = "rgba(15,31,58,0.55)";
      ctx.lineWidth = 2 * state.zoom;
      ctx.strokeRect(rect.x + 3 * state.zoom, rect.y + 3 * state.zoom, rect.w - 6 * state.zoom, rect.h - 6 * state.zoom);
      drawArrow(cx, cy, entry.rotation || 0, 8 * state.zoom, "#0f2a45");
    }

    if (entry.id === "button") {
      const pressed = Boolean(entry.pressed);
      ctx.fillStyle = pressed ? "#7ee6b5" : "#2b6b58";
      ctx.fillRect(rect.x + 4 * state.zoom, rect.y + rect.h * 0.58, rect.w - 8 * state.zoom, rect.h * 0.22);
      ctx.strokeStyle = "rgba(230,255,242,0.45)";
      ctx.lineWidth = 2 * state.zoom;
      ctx.strokeRect(rect.x + 4 * state.zoom, rect.y + rect.h * 0.58, rect.w - 8 * state.zoom, rect.h * 0.22);
      ctx.fillStyle = "#f2fff8";
      ctx.font = `${Math.max(9, 11 * state.zoom)}px Trebuchet MS`;
      ctx.fillText(String(trapChannel(entry) || 1), rect.x + 8 * state.zoom, rect.y + 12 * state.zoom);
    }

    if (entry.id === "lever") {
      ctx.fillStyle = "#4f3412";
      ctx.fillRect(rect.x + 11 * state.zoom, rect.y + 10 * state.zoom, 10 * state.zoom, rect.h - 14 * state.zoom);
      ctx.strokeStyle = "#ffc96f";
      ctx.lineWidth = 3 * state.zoom;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 5 * state.zoom);
      ctx.lineTo(cx + ((entry.toggleState ? 1 : -1) * 8 * state.zoom), cy - 7 * state.zoom);
      ctx.stroke();
      ctx.fillStyle = "#fff2cf";
      ctx.beginPath();
      ctx.arc(cx + ((entry.toggleState ? 1 : -1) * 8 * state.zoom), cy - 7 * state.zoom, 3 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f2fff8";
      ctx.font = `${Math.max(9, 11 * state.zoom)}px Trebuchet MS`;
      ctx.fillText(String(trapChannel(entry) || 1), rect.x + 7 * state.zoom, rect.y + rect.h - 6 * state.zoom);
    }

    if (entry.id === "door") {
      const open = doorOpen(entry);
      ctx.fillStyle = open ? "rgba(143,159,184,0.18)" : "#72839c";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = open ? "rgba(210,225,244,0.35)" : "#d7e3f5";
      ctx.lineWidth = 2 * state.zoom;
      ctx.strokeRect(rect.x + 2 * state.zoom, rect.y + 2 * state.zoom, rect.w - 4 * state.zoom, rect.h - 4 * state.zoom);
      ctx.fillStyle = "#eef5ff";
      ctx.font = `${Math.max(9, 11 * state.zoom)}px Trebuchet MS`;
      ctx.fillText(String(trapChannel(entry) || 1), rect.x + 7 * state.zoom, rect.y + rect.h - 6 * state.zoom);
    }

    if (entry.id === "mover") {
      drawGlowCircle(cx, cy, 15 * state.zoom, "rgba(122,200,255,0.6)", 0.15);
      ctx.fillStyle = "#426b89";
      ctx.fillRect(rect.x + 2 * state.zoom, rect.y + 2 * state.zoom, rect.w - 4 * state.zoom, rect.h - 4 * state.zoom);
      ctx.strokeStyle = "#d2f0ff";
      ctx.lineWidth = 2 * state.zoom;
      ctx.strokeRect(rect.x + 3 * state.zoom, rect.y + 3 * state.zoom, rect.w - 6 * state.zoom, rect.h - 6 * state.zoom);
      drawArrow(cx, cy, entry.rotation || 0, 8 * state.zoom, "#eaf8ff");
      ctx.fillStyle = "#eaf8ff";
      ctx.font = `${Math.max(9, 11 * state.zoom)}px Trebuchet MS`;
      ctx.fillText(String(trapChannel(entry) || 1), rect.x + 7 * state.zoom, rect.y + rect.h - 6 * state.zoom);
    }

    if (isDevoutId(entry.id)) {
      const devout = ensureDevoutState(entry);
      const devoutRect = worldToScreenRect({ x: devout.x - DEVOUT_RADIUS, y: devout.y - DEVOUT_RADIUS, w: DEVOUT_RADIUS * 2, h: DEVOUT_RADIUS * 2 });
      const devoutCx = devoutRect.x + devoutRect.w / 2;
      const devoutCy = devoutRect.y + devoutRect.h / 2;
      const range = devoutAggroRange(entry) * state.zoom;
      const irisColor = entry.id === "devoutRanger" ? "#d62839" : entry.id === "devoutDash" ? "#98ff59" : "#72e8af";
      const shellColor = entry.id === "devoutRanger" ? "#6e1322" : entry.id === "devoutDash" ? "#314412" : "#1e4f40";
      const lashColor = entry.id === "devoutRanger" ? "rgba(255,182,188,0.85)" : entry.id === "devoutDash" ? "rgba(214,255,176,0.82)" : "rgba(188,255,229,0.82)";
      ctx.save();
      ctx.setLineDash([6 * state.zoom, 5 * state.zoom]);
      ctx.strokeStyle = entry.id === "devoutRanger" ? "rgba(255,138,152,0.42)" : entry.id === "devoutDash" ? "rgba(180,255,154,0.42)" : "rgba(158,244,200,0.42)";
      ctx.lineWidth = 1.6 * state.zoom;
      ctx.beginPath();
      ctx.arc(devoutCx, devoutCy, range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      if (devout.aggro) {
        const runner = currentRunner();
        if (runner) {
          ctx.strokeStyle = "rgba(255,255,255,0.32)";
          ctx.lineWidth = 1.5 * state.zoom;
          ctx.beginPath();
          ctx.moveTo(devoutCx, devoutCy);
          ctx.lineTo((runner.x + runner.w / 2 - state.view.x) * state.zoom, (runner.y + runner.h / 2 - state.view.y) * state.zoom);
          ctx.stroke();
        }
      }
      if (devout.chargeTimer > 0 && devout.chargeDuration > 0) {
        const chargeProgress = 1 - (devout.chargeTimer / devout.chargeDuration);
        const chargeColor = devout.chargeType === "dash" ? "rgba(180,255,154,0.95)" : "rgba(255,123,142,0.95)";
        ctx.strokeStyle = chargeColor;
        ctx.lineWidth = 2.2 * state.zoom;
        ctx.beginPath();
        ctx.arc(devoutCx, devoutCy, (14 + chargeProgress * 12) * state.zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = chargeColor;
        ctx.globalAlpha = 0.2 + chargeProgress * 0.22;
        ctx.beginPath();
        ctx.arc(devoutCx, devoutCy, (8 + chargeProgress * 7) * state.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = ghost ? 0.46 : 1;
        const runner = currentRunner();
        if (runner) {
          ctx.strokeStyle = chargeColor;
          ctx.lineWidth = 2 * state.zoom;
          ctx.beginPath();
          ctx.moveTo(devoutCx, devoutCy);
          ctx.lineTo((runner.x + runner.w / 2 - state.view.x) * state.zoom, (runner.y + runner.h / 2 - state.view.y) * state.zoom);
          ctx.stroke();
        }
      }
      drawGlowCircle(devoutCx, devoutCy, 18 * state.zoom, entry.id === "devoutRanger" ? "rgba(255,138,152,0.82)" : entry.id === "devoutDash" ? "rgba(180,255,154,0.82)" : "rgba(158,244,200,0.82)", 0.16);
      for (let lash = 0; lash < 5; lash += 1) {
        const lashAngle = -0.95 + lash * 0.48 + Math.sin(state.time * 2.4 + lash + index) * 0.08;
        ctx.strokeStyle = lashColor;
        ctx.lineWidth = (lash === 2 ? 2.4 : 1.5) * state.zoom;
        ctx.beginPath();
        ctx.moveTo(devoutCx + Math.cos(lashAngle) * 12 * state.zoom, devoutCy - 2 * state.zoom + Math.sin(lashAngle) * 2 * state.zoom);
        ctx.lineTo(devoutCx + Math.cos(lashAngle) * 18 * state.zoom, devoutCy - 12 * state.zoom + Math.sin(lashAngle) * 3 * state.zoom);
        ctx.stroke();
      }
      ctx.fillStyle = shellColor;
      ctx.beginPath();
      ctx.ellipse(devoutCx, devoutCy, 13 * state.zoom, 10 * state.zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f5fff8";
      ctx.beginPath();
      ctx.ellipse(devoutCx, devoutCy, 11 * state.zoom, 7.6 * state.zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1.4 * state.zoom;
      ctx.beginPath();
      ctx.arc(devoutCx - 3.6 * state.zoom, devoutCy - 2.5 * state.zoom, 2.2 * state.zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.arc(devoutCx + Math.cos(state.time * 3 + (entry.phase || 0)) * 2.8 * state.zoom, devoutCy, entry.id === "devoutDash" ? 4.4 * state.zoom : entry.id === "devoutRanger" ? 4 * state.zoom : 3.6 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      if (devout.chargeTimer > 0) {
        ctx.fillStyle = "#fff4f6";
        ctx.beginPath();
        ctx.arc(devoutCx, devoutCy, (2.2 + Math.sin(state.time * 28) * 0.9) * state.zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#05070c";
      ctx.beginPath();
      ctx.arc(devoutCx + Math.cos(state.time * 3 + (entry.phase || 0)) * 3.8 * state.zoom, devoutCy, 1.8 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(12,22,18,0.72)";
      ctx.lineWidth = 1.5 * state.zoom;
      ctx.beginPath();
      ctx.moveTo(devoutCx - 9 * state.zoom, devoutCy + 7 * state.zoom);
      ctx.quadraticCurveTo(devoutCx - 16 * state.zoom, devoutCy + 12 * state.zoom, devoutCx - 11 * state.zoom, devoutCy + 16 * state.zoom);
      ctx.moveTo(devoutCx + 9 * state.zoom, devoutCy + 7 * state.zoom);
      ctx.quadraticCurveTo(devoutCx + 16 * state.zoom, devoutCy + 12 * state.zoom, devoutCx + 11 * state.zoom, devoutCy + 16 * state.zoom);
      ctx.stroke();
      if (entry.id === "devoutDash") {
        ctx.strokeStyle = "rgba(152,255,89,0.62)";
        ctx.lineWidth = 1.7 * state.zoom;
        ctx.beginPath();
        ctx.moveTo(devoutCx - 13 * state.zoom, devoutCy);
        ctx.lineTo(devoutCx - 18 * state.zoom, devoutCy - 6 * state.zoom);
        ctx.moveTo(devoutCx + 13 * state.zoom, devoutCy);
        ctx.lineTo(devoutCx + 18 * state.zoom, devoutCy - 6 * state.zoom);
        ctx.stroke();
      }
      if (entry.id === "devoutRanger") {
        ctx.strokeStyle = "rgba(214,40,57,0.58)";
        ctx.beginPath();
        ctx.moveTo(devoutCx - 7 * state.zoom, devoutCy + 6 * state.zoom);
        ctx.lineTo(devoutCx - 4 * state.zoom, devoutCy + 10 * state.zoom);
        ctx.moveTo(devoutCx + 7 * state.zoom, devoutCy + 6 * state.zoom);
        ctx.lineTo(devoutCx + 4 * state.zoom, devoutCy + 10 * state.zoom);
        ctx.stroke();
      }
      if (entry.id === "devoutCrawler") {
        ctx.strokeStyle = "rgba(114,232,175,0.64)";
        ctx.lineWidth = 1.6 * state.zoom;
        ctx.beginPath();
        ctx.moveTo(devoutCx - 14 * state.zoom, devoutCy - 2 * state.zoom);
        ctx.lineTo(devoutCx - 18 * state.zoom, devoutCy + 3 * state.zoom);
        ctx.moveTo(devoutCx + 14 * state.zoom, devoutCy - 2 * state.zoom);
        ctx.lineTo(devoutCx + 18 * state.zoom, devoutCy + 3 * state.zoom);
        ctx.stroke();
      }
    }

    if (isWormholeId(entry.id)) {
      const glow = trapDefinition(entry.id).color;
      drawGlowCircle(cx, cy, 19 * state.zoom, glow, 0.24);
      ctx.strokeStyle = glow;
      ctx.lineWidth = 3 * state.zoom;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * state.zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.4 * state.zoom;
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * state.zoom + Math.sin(state.time * 4 + index) * 1.4 * state.zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(10,16,29,0.92)";
      ctx.beginPath();
      ctx.arc(cx, cy, 4.6 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    if (entry.id === "fan") {
      drawGlowCircle(cx, cy, 18 * state.zoom, "rgba(124,224,255,0.8)", 0.22);
      ctx.fillStyle = "#33525c";
      ctx.beginPath();
      ctx.arc(cx, cy, 12 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(124,224,255,0.55)";
      ctx.lineWidth = 2 * state.zoom;
      for (let blade = 0; blade < 3; blade += 1) {
        const angle = state.time * 7 + blade * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 11 * state.zoom, cy + Math.sin(angle) * 11 * state.zoom);
        ctx.stroke();
      }
      const dir = rotationVector(entry.rotation || 0);
      for (let stream = 1; stream <= 4; stream += 1) {
        const offset = (Math.sin(state.time * 5 + stream + index) * 5) * state.zoom;
        ctx.strokeStyle = `rgba(124,224,255,${0.16 + stream * 0.06})`;
        ctx.lineWidth = 2 * state.zoom;
        ctx.beginPath();
        ctx.moveTo(cx + (dir.y !== 0 ? offset : 0), cy + (dir.x !== 0 ? offset : 0));
        ctx.lineTo(cx + dir.x * (20 + stream * 16) * state.zoom + (dir.y !== 0 ? offset : 0), cy + dir.y * (20 + stream * 16) * state.zoom + (dir.x !== 0 ? offset : 0));
        ctx.stroke();
      }
    }

      if (entry.id === "mine") {
        drawGlowCircle(cx, cy, 15 * state.zoom, "rgba(255,140,119,0.85)", 0.18 + (pulse + 1) * 0.05);
        ctx.fillStyle = "#5f2e22";
        ctx.beginPath();
      ctx.arc(cx, cy, 11 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pulse > 0 ? "#ffd4c8" : "#ff8c77";
      ctx.beginPath();
      ctx.arc(cx, cy, 4 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
        if (!ghost) {
          ctx.strokeStyle = "rgba(255,140,119,0.18)";
          ctx.lineWidth = 2 * state.zoom;
          ctx.beginPath();
          ctx.arc(cx, cy, 78 * state.zoom, 0, Math.PI * 2);
          ctx.stroke();
          if (entry.blastTimer > 0) {
            const blastScale = 1 + (0.45 - entry.blastTimer) * 4.5;
            drawGlowCircle(cx, cy, 48 * state.zoom * blastScale, "rgba(255,140,119,0.95)", 0.22);
            ctx.fillStyle = "rgba(255,214,177,0.65)";
            ctx.beginPath();
            ctx.arc(cx, cy, 18 * state.zoom * blastScale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    if (entry.id === "laser") {
      const beamAlpha = 0.18 + (Math.sin(state.time * 3 + (entry.phase || 0)) + 1) * 0.2;
      ctx.fillStyle = "#4a1430";
      ctx.fillRect(rect.x + 8 * state.zoom, rect.y + 8 * state.zoom, rect.w - 16 * state.zoom, rect.h - 16 * state.zoom);
      ctx.fillStyle = "rgba(255,94,156,0.9)";
      ctx.fillRect(rect.x + 12 * state.zoom, rect.y + 6 * state.zoom, rect.w - 24 * state.zoom, rect.h - 12 * state.zoom);
      const rot = entry.rotation || 0;
      ctx.fillStyle = `rgba(255,94,156,${ghost ? 0.25 : beamAlpha})`;
      if (rot === 90 || rot === 270) ctx.fillRect(0, cy - 3 * state.zoom, canvas.width, 6 * state.zoom);
      else ctx.fillRect(cx - 3 * state.zoom, 0, 6 * state.zoom, canvas.height);
    }

    if (entry.id === "saw") {
      const saw = getSawState(entry);
      const sawX = (saw.x - state.view.x) * state.zoom;
      const sawY = (saw.y - state.view.y) * state.zoom;
      const railStart = (saw.rail.startX - state.view.x) * state.zoom;
      const railEnd = (saw.rail.endX - state.view.x) * state.zoom;
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.beginPath();
      ctx.moveTo(railStart, sawY);
      ctx.lineTo(railEnd, sawY);
      ctx.stroke();
      ctx.fillStyle = "#d2d7df";
      ctx.beginPath();
      for (let tooth = 0; tooth < 10; tooth += 1) {
        const angle = (Math.PI * 2 * tooth) / 10 + state.time * 3;
        const radius = tooth % 2 === 0 ? 11 * state.zoom : 7 * state.zoom;
        const px = sawX + Math.cos(angle) * radius;
        const py = sawY + Math.sin(angle) * radius;
        if (tooth === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#6b7784";
      ctx.beginPath();
      ctx.arc(sawX, sawY, 3.5 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    if (entry.id === "buzzsaw") {
      const buzzsaw = getBuzzsawState(entry);
      const sawX = (buzzsaw.x - state.view.x) * state.zoom;
      const sawY = (buzzsaw.y - state.view.y) * state.zoom;
      const railStart = (buzzsaw.rail.start - (buzzsaw.rail.vertical ? state.view.y : state.view.x)) * state.zoom;
      const railEnd = (buzzsaw.rail.end - (buzzsaw.rail.vertical ? state.view.y : state.view.x)) * state.zoom;
      ctx.strokeStyle = "rgba(255,140,97,0.28)";
      ctx.lineWidth = 3 * state.zoom;
      ctx.beginPath();
      if (buzzsaw.rail.vertical) {
        ctx.moveTo(sawX, railStart);
        ctx.lineTo(sawX, railEnd);
      } else {
        ctx.moveTo(railStart, sawY);
        ctx.lineTo(railEnd, sawY);
      }
      ctx.stroke();
      drawGlowCircle(sawX, sawY, 18 * state.zoom, "rgba(255,140,97,0.8)", 0.2);
      ctx.fillStyle = "#ff8c61";
      ctx.beginPath();
      for (let tooth = 0; tooth < 12; tooth += 1) {
        const angle = (Math.PI * 2 * tooth) / 12 + state.time * 5.5;
        const radius = tooth % 2 === 0 ? 12 * state.zoom : 6.4 * state.zoom;
        const px = sawX + Math.cos(angle) * radius;
        const py = sawY + Math.sin(angle) * radius;
        if (tooth === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4d1f12";
      ctx.beginPath();
      ctx.arc(sawX, sawY, 5 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,228,196,0.55)";
      ctx.lineWidth = 1.6 * state.zoom;
      ctx.beginPath();
      ctx.arc(sawX, sawY, 8 * state.zoom, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (entry.id === "cannon") {
      ctx.fillStyle = "#3f315e";
      ctx.fillRect(rect.x + 4 * state.zoom, rect.y + 6 * state.zoom, rect.w - 8 * state.zoom, rect.h - 12 * state.zoom);
      ctx.fillStyle = "#1b112f";
      ctx.fillRect(rect.x + 8 * state.zoom, rect.y + 10 * state.zoom, rect.w - 10 * state.zoom, 12 * state.zoom);
      drawGlowCircle(cx, cy, 14 * state.zoom, "rgba(185,140,255,0.8)", 0.12);
    }

    if (entry.id === "missile") {
      ctx.fillStyle = "#5a2b1e";
      ctx.fillRect(rect.x + 7 * state.zoom, rect.y + 9 * state.zoom, rect.w - 14 * state.zoom, rect.h - 18 * state.zoom);
      ctx.fillStyle = "#ffb48a";
      ctx.beginPath();
      ctx.moveTo(cx + 8 * state.zoom, cy);
      ctx.lineTo(cx - 4 * state.zoom, cy - 7 * state.zoom);
      ctx.lineTo(cx - 4 * state.zoom, cy + 7 * state.zoom);
      ctx.closePath();
      ctx.fill();
      drawGlowCircle(cx, cy, 12 * state.zoom, "rgba(255,180,138,0.45)", 0.14);
    }

    if (entry.id === "rocket") {
      const rocket = getRocketState(entry);
      const rocketX = (rocket.x - state.view.x) * state.zoom;
      const rocketY = (rocket.y - state.view.y) * state.zoom;
      ctx.strokeStyle = "rgba(255,211,107,0.22)";
      ctx.lineWidth = 4 * state.zoom;
      ctx.beginPath();
      ctx.moveTo((rocket.startX - state.view.x) * state.zoom, (rocket.startY - state.view.y) * state.zoom);
      ctx.lineTo((rocket.endX - state.view.x) * state.zoom, (rocket.endY - state.view.y) * state.zoom);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,140,72,0.16)";
      ctx.lineWidth = 8 * state.zoom;
      ctx.beginPath();
      ctx.moveTo((rocket.startX - state.view.x) * state.zoom, (rocket.startY - state.view.y) * state.zoom);
      ctx.lineTo((rocket.endX - state.view.x) * state.zoom, (rocket.endY - state.view.y) * state.zoom);
      ctx.stroke();
      ctx.fillStyle = "#ffd36b";
      ctx.beginPath();
      ctx.ellipse(rocketX, rocketY, 16 * state.zoom, 10 * state.zoom, (entry.rotation || 0) * Math.PI / 180, 0, Math.PI * 2);
      ctx.fill();
      drawGlowCircle((rocket.flameX - state.view.x) * state.zoom, (rocket.flameY - state.view.y) * state.zoom, 10 * state.zoom, "rgba(255,140,72,0.95)", 0.18);
    }

    if (entry.id === "snare") {
      ctx.strokeStyle = "#93d36a";
      ctx.lineWidth = 3 * state.zoom;
      for (let vine = 0; vine < 3; vine += 1) {
        ctx.beginPath();
        ctx.moveTo(rect.x + 6 * state.zoom + vine * 7 * state.zoom, rect.y + rect.h - 4 * state.zoom);
        ctx.quadraticCurveTo(cx, cy - 6 * state.zoom, rect.x + 10 * state.zoom + vine * 6 * state.zoom, rect.y + 4 * state.zoom);
        ctx.stroke();
      }
      drawGlowCircle(cx, cy, 10 * state.zoom, "rgba(147,211,106,0.4)", 0.12);
    }

    if (entry.id === "mortar") {
      ctx.fillStyle = "#526173";
      ctx.fillRect(rect.x + 8 * state.zoom, rect.y + 10 * state.zoom, rect.w - 16 * state.zoom, rect.h - 14 * state.zoom);
      ctx.strokeStyle = "#d9e4f2";
      ctx.lineWidth = 3 * state.zoom;
      ctx.beginPath();
      ctx.moveTo(rect.x + 10 * state.zoom, rect.y + rect.h - 8 * state.zoom);
      ctx.lineTo(cx + 7 * state.zoom, rect.y + 8 * state.zoom);
      ctx.stroke();
      drawGlowCircle(cx, cy, 10 * state.zoom, "rgba(217,228,242,0.32)", 0.1);
    }

    if (entry.id === "dart") {
      ctx.fillStyle = "#4e4320";
      ctx.fillRect(rect.x + 9 * state.zoom, rect.y + 10 * state.zoom, rect.w - 18 * state.zoom, rect.h - 20 * state.zoom);
      drawArrow(cx, cy, entry.rotation || 0, 8 * state.zoom, "#ffe37d");
      drawGlowCircle(cx, cy, 10 * state.zoom, "rgba(255,227,125,0.42)", 0.12);
    }

    if (entry.id === "pulse") {
      const pulse = pulseTrapState(entry);
      ctx.fillStyle = "#4d213d";
      ctx.beginPath();
      ctx.arc(cx, cy, 9 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ff83cd";
      ctx.lineWidth = 2 * state.zoom;
      ctx.beginPath();
      ctx.arc(cx, cy, 13 * state.zoom, 0, Math.PI * 2);
      ctx.stroke();
      if (pulse.mode !== "idle") {
        ctx.strokeStyle = `rgba(255,131,205,${pulse.mode === "burst" ? 0.75 : 0.35})`;
        ctx.lineWidth = 2.5 * state.zoom;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse.radius * state.zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (entry.id === "piston") {
      const dir = rotationVector(entry.rotation || 0);
      const pistonRect = pistonTrapRect(entry);
      ctx.fillStyle = "#5f6778";
      ctx.fillRect(rect.x + 7 * state.zoom, rect.y + 7 * state.zoom, rect.w - 14 * state.zoom, rect.h - 14 * state.zoom);
      if (pistonRect) {
        const ext = worldToScreenRect(pistonRect);
        ctx.fillStyle = "#aab3c8";
        ctx.fillRect(ext.x, ext.y, ext.w, ext.h);
      }
      drawArrow(cx + dir.x * 4 * state.zoom, cy + dir.y * 4 * state.zoom, entry.rotation || 0, 8 * state.zoom, "#0f1320");
    }

      if (entry.id === "blink") {
        const blinkOn = entry.state !== "gone";
        ctx.fillStyle = blinkOn ? "#c99563" : "rgba(201,149,99,0.12)";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = "rgba(90,56,24,0.8)";
        ctx.lineWidth = 2 * state.zoom;
      ctx.beginPath();
      ctx.moveTo(rect.x + 5 * state.zoom, rect.y + 8 * state.zoom);
      ctx.lineTo(rect.x + rect.w * 0.45, rect.y + rect.h * 0.55);
      ctx.lineTo(rect.x + rect.w - 5 * state.zoom, rect.y + 10 * state.zoom);
      ctx.moveTo(rect.x + rect.w * 0.3, rect.y + rect.h - 6 * state.zoom);
      ctx.lineTo(rect.x + rect.w * 0.55, rect.y + rect.h * 0.58);
      ctx.stroke();
    }

      if (entry.id === "flame") {
        ctx.fillStyle = "#512018";
        ctx.fillRect(rect.x + 10 * state.zoom, rect.y + 9 * state.zoom, 12 * state.zoom, rect.h - 12 * state.zoom);
        const flameMode = fireJetState(entry);
        const burst = flameMode === "on" ? 1 : flameMode === "flicker" ? Math.max(0, pulse) : 0;
        const dir = rotationVector(entry.rotation || 0);
        if (burst > 0) {
          for (let seg = 1; seg <= 3; seg += 1) {
            const sx = cx + dir.x * 18 * seg * state.zoom;
            const sy = cy + dir.y * 18 * seg * state.zoom;
            const radius = (9 + burst * 4 - seg) * state.zoom;
            drawGlowCircle(sx, sy, radius, "rgba(255,135,72,0.95)", 0.12 + burst * 0.1);
            ctx.fillStyle = seg === 1 ? "#ffd36b" : "#ff8748";
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(3, radius * 0.42), 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (flameMode === "flicker") {
          drawGlowCircle(cx + dir.x * 12 * state.zoom, cy + dir.y * 12 * state.zoom, 9 * state.zoom, "rgba(255,180,110,0.85)", 0.14);
        }
      }

    if (entry.id === "shock") {
      drawGlowCircle(cx, cy, 18 * state.zoom, "rgba(247,224,122,0.9)", 0.2);
      ctx.fillStyle = "#41355c";
      ctx.fillRect(rect.x + 10 * state.zoom, rect.y + 12 * state.zoom, 12 * state.zoom, 12 * state.zoom);
      ctx.strokeStyle = "#f7e07a";
      ctx.lineWidth = 2 * state.zoom;
      ctx.beginPath();
      ctx.moveTo(cx, rect.y + 6 * state.zoom);
      ctx.lineTo(cx, rect.y + 12 * state.zoom);
      ctx.moveTo(rect.x + 8 * state.zoom, cy);
      ctx.lineTo(rect.x + rect.w - 8 * state.zoom, cy);
      ctx.stroke();
      for (let bolt = 0; bolt < 4; bolt += 1) {
        const angle = state.time * 8 + bolt * 1.8;
        const reach = (10 + bolt * 6 + (pulse + 1) * 2) * state.zoom;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * reach * 0.25, cy + Math.sin(angle) * reach * 0.25);
        ctx.lineTo(cx + Math.cos(angle + 0.55) * reach * 0.55, cy + Math.sin(angle - 0.35) * reach * 0.5);
        ctx.lineTo(cx + Math.cos(angle - 0.24) * reach * 0.95, cy + Math.sin(angle + 0.2) * reach * 0.92);
        ctx.stroke();
      }
    }

    if (entry.id === "gravity") {
      drawGlowCircle(cx, cy, 22 * state.zoom, "rgba(150,167,255,0.85)", 0.16);
      ctx.fillStyle = "#090b15";
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(150,167,255,0.75)";
      ctx.lineWidth = 2 * state.zoom;
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, (12 + ring * 5 + pulse * 1.5) * state.zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });

  if (showArrow && ["fan", "laser", "cannon", "flame", "dart", "piston"].includes(entry.id)) {
    const anchor = worldToScreenRect(rectForCell(entry.c, entry.r, 2));
    drawArrow(anchor.x + anchor.w / 2, anchor.y + anchor.h / 2, entry.rotation || 0, 13 * state.zoom, "#0b1322");
  }

  ctx.globalAlpha = 1;
}

function drawPlayers() {
  const player = currentRunner();
  if (!player) return;
  const body = worldToScreenRect({ x: player.x, y: player.y, w: player.w, h: player.h });
  const bob = player.grounded ? Math.sin(state.time * 10 + player.x * 0.02) * 1.6 * state.zoom : 0;
  const color = playerInvulnerable(player) ? "#ffffff" : displayColor(player.id);
  const coreX = body.x + body.w / 2;
  const coreY = body.y + body.h * 0.56 + bob;
  const flameH = body.h * (1.08 + Math.sin(state.time * 8 + player.x * 0.03) * 0.06);
  const flameW = body.w * 0.9;
  const aura = ctx.createRadialGradient(coreX, coreY, 2, coreX, coreY, flameH * 0.85);
  aura.addColorStop(0, color);
  aura.addColorStop(0.32, color);
  aura.addColorStop(0.72, "rgba(255,210,160,0.35)");
  aura.addColorStop(1, "rgba(255,210,160,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(coreX, coreY, flameH * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(coreX, body.y - body.h * 0.08 + bob);
  ctx.bezierCurveTo(
    coreX + flameW * 0.55,
    body.y + body.h * 0.2 + bob,
    coreX + flameW * 0.45,
    body.y + body.h * 0.86 + bob,
    coreX,
    body.y + flameH + bob
  );
  ctx.bezierCurveTo(
    coreX - flameW * 0.45,
    body.y + body.h * 0.86 + bob,
    coreX - flameW * 0.55,
    body.y + body.h * 0.2 + bob,
    coreX,
    body.y - body.h * 0.08 + bob
  );
  ctx.fill();
  ctx.fillStyle = "rgba(255,248,236,0.76)";
  ctx.beginPath();
  ctx.moveTo(coreX, body.y + body.h * 0.08 + bob);
  ctx.bezierCurveTo(
    coreX + flameW * 0.22,
    body.y + body.h * 0.28 + bob,
    coreX + flameW * 0.18,
    body.y + body.h * 0.6 + bob,
    coreX,
    body.y + body.h * 0.84 + bob
  );
  ctx.bezierCurveTo(
    coreX - flameW * 0.18,
    body.y + body.h * 0.6 + bob,
    coreX - flameW * 0.22,
    body.y + body.h * 0.28 + bob,
    coreX,
    body.y + body.h * 0.08 + bob
  );
  ctx.fill();
  ctx.fillStyle = "#0b1322";
  const eyeOffset = player.facing >= 0 ? flameW * 0.08 : -flameW * 0.08;
  ctx.fillRect(coreX - 5 * state.zoom + eyeOffset, body.y + body.h * 0.34 + bob, 3 * state.zoom, 3 * state.zoom);
  ctx.fillRect(coreX + 2 * state.zoom + eyeOffset, body.y + body.h * 0.34 + bob, 3 * state.zoom, 3 * state.zoom);
  if (player.snareTimer > 0) {
    ctx.strokeStyle = "rgba(147,211,106,0.9)";
    ctx.lineWidth = 2.5 * state.zoom;
    for (let vine = 0; vine < 3; vine += 1) {
      const wrapY = body.y + body.h * (0.34 + vine * 0.18) + bob;
      ctx.beginPath();
      ctx.moveTo(coreX - flameW * 0.34, wrapY);
      ctx.quadraticCurveTo(coreX, wrapY - 6 * state.zoom, coreX + flameW * 0.34, wrapY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(coreX + flameW * 0.15, wrapY - 2 * state.zoom);
      ctx.lineTo(coreX + flameW * 0.26, wrapY - 9 * state.zoom);
      ctx.stroke();
    }
  }
  if (player.spawnShield > 0) {
    const shieldPulse = 0.6 + Math.sin(state.time * 14) * 0.16;
    ctx.strokeStyle = `rgba(145,215,255,${0.45 + player.spawnShield * 0.3})`;
    ctx.lineWidth = 3 * state.zoom;
    ctx.beginPath();
    ctx.arc(coreX, coreY, flameH * shieldPulse, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (player.emberTimer <= 0) {
    addParticles(player.x + player.w / 2, player.y + player.h * 0.16, color, 2, 0.28);
    player.emberTimer = 0.06 + Math.random() * 0.06;
  }
}

function drawParticles() {
  state.particles.forEach((particle) => {
    if (!rectVisibleInView({ x: particle.x, y: particle.y, w: particle.size, h: particle.size }, 80)) return;
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.fillRect((particle.x - state.view.x) * state.zoom, (particle.y - state.view.y) * state.zoom, particle.size * state.zoom, particle.size * state.zoom);
  });
  ctx.globalAlpha = 1;
}

function drawProjectiles() {
  state.mortarBursts.forEach((burst) => {
    const progress = burst.life / burst.maxLife;
    const radius = burst.radius * (1.1 - progress * 0.35);
    const center = worldToScreenRect({ x: burst.x - 1, y: burst.y - 1, w: 2, h: 2 });
    ctx.save();
    ctx.strokeStyle = `rgba(217,228,242,${0.3 + progress * 0.45})`;
    ctx.lineWidth = 3 * state.zoom;
    ctx.beginPath();
    ctx.arc(center.x + center.w / 2, center.y + center.h / 2, radius * state.zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,240,225,${0.08 + progress * 0.18})`;
    ctx.beginPath();
    ctx.arc(center.x + center.w / 2, center.y + center.h / 2, radius * state.zoom * 0.88, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  state.projectiles.forEach((entry) => {
    if (!projectileVisible(entry)) return;
    const rect = worldToScreenRect(entry);
    if (entry.kind === "tesla") {
      ctx.strokeStyle = "#f7e07a";
      ctx.lineWidth = 2.5 * state.zoom;
      ctx.shadowColor = "#f7e07a";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(rect.x, rect.y + rect.h * 0.5);
      ctx.lineTo(rect.x + rect.w * 0.38, rect.y);
      ctx.lineTo(rect.x + rect.w * 0.62, rect.y + rect.h);
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h * 0.4);
      ctx.stroke();
    } else if (entry.kind === "missile") {
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(Math.atan2(entry.vy, entry.vx));
      ctx.fillStyle = "#ffb48a";
      ctx.shadowColor = "#ffb48a";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(8 * state.zoom, 0);
      ctx.lineTo(-6 * state.zoom, -5 * state.zoom);
      ctx.lineTo(-6 * state.zoom, 5 * state.zoom);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (entry.kind === "mortar") {
      ctx.fillStyle = "#d9e4f2";
      ctx.shadowColor = "#d9e4f2";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 6 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2 * state.zoom;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 10 * state.zoom, 0, Math.PI * 2);
      ctx.stroke();
    } else if (entry.kind === "dart") {
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(Math.atan2(entry.vy, entry.vx));
      ctx.fillStyle = "#ffe37d";
      ctx.fillRect(-7 * state.zoom, -2 * state.zoom, 14 * state.zoom, 4 * state.zoom);
      ctx.beginPath();
      ctx.moveTo(7 * state.zoom, 0);
      ctx.lineTo(1 * state.zoom, -5 * state.zoom);
      ctx.lineTo(1 * state.zoom, 5 * state.zoom);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (entry.kind === "devout-bullet") {
      ctx.fillStyle = "#ff7b8e";
      ctx.shadowColor = "#ff7b8e";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 5 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,226,230,0.7)";
      ctx.lineWidth = 1.5 * state.zoom;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 2.6 * state.zoom, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = entry.color || "#ffcf73";
      ctx.shadowColor = entry.color || "#ffcf73";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 7 * state.zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.shadowBlur = 0;
}

function getDraftCardRects() {
  if (!state.draftOptions.length || !["draft-select", "draft-place"].includes(state.phase)) return [];
  const cardW = 210;
  const cardH = 102;
  const gap = 18;
  const total = state.draftOptions.length * cardW + (state.draftOptions.length - 1) * gap;
  const startX = (canvas.width - total) / 2;
  const y = canvas.height - 128;
  return state.draftOptions.map((option, index) => ({ option, x: startX + index * (cardW + gap), y, w: cardW, h: cardH }));
}

function drawWrappedCardText(text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length > maxLines) lines.length = maxLines;
  const consumed = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (consumed < words.length && lines.length) {
    let finalLine = lines[lines.length - 1];
    while (finalLine.length > 1 && ctx.measureText(`${finalLine}...`).width > maxWidth) finalLine = finalLine.slice(0, -1);
    lines[lines.length - 1] = `${finalLine.trimEnd()}...`;
  }
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
}

function drawDraftOverlay() {
  if (!state.draftOptions.length || !["draft-select", "draft-place"].includes(state.phase)) { state.draftCards = []; return; }
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
    drawWrappedCardText(card.option.desc, card.x + 14, card.y + 58, card.w - 28, 16, 2);
  });
}

function drawPlacementGhost() {
  if (state.phase !== "draft-place" || !state.currentDraft?.selected || !state.hoverCell) return;
  const option = state.currentDraft.selected;
  if (option.id === "erase") {
    const rect = worldToScreenRect(rectForCell(state.hoverCell.c, state.hoverCell.r, 2));
    const valid = Boolean(trapAtCell(state.hoverCell.c, state.hoverCell.r));
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = valid ? "#87f4d0" : "#ff6f61";
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }
  const mock = { id: option.id, c: state.hoverCell.c, r: state.hoverCell.r, rotation: state.currentDraft.rotation };
  drawTrap(mock, true, true);
  const valid = canPlaceTrap(state.hoverCell.c, state.hoverCell.r, option.id, state.currentDraft.rotation);
  trapCells(mock).forEach((cell) => {
    const rect = worldToScreenRect(rectForCell(cell.c, cell.r, 2));
    ctx.strokeStyle = valid ? "#87f4d0" : "#ff6f61";
    ctx.lineWidth = 3;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });
}

function drawHud() {
  const [leftId, rightId] = activePlayerIds();
  ctx.fillStyle = "rgba(8,14,24,0.72)";
  ctx.fillRect(16, 16, 220, 86);
  ctx.fillStyle = "#f6e7b2";
  ctx.font = "700 18px Trebuchet MS";
  if (state.mode === "story") {
    ctx.fillText(`Attempts: ${state.story.attempts + 1}`, 28, 40);
    ctx.fillStyle = "#ffd36b";
    ctx.fillText(`Clears: ${state.story.chainsBroken}/${storyChainTotal()}`, 28, 66);
  } else {
    ctx.fillText(state.template?.suddenDeath ? "First Finisher Wins" : `First to ${state.targetScore}`, 28, 40);
    ctx.fillStyle = displayColor(leftId);
    ctx.fillText(`${displayLabel(leftId)}: ${state.players[leftId].score}`, 28, 66);
    ctx.fillStyle = displayColor(rightId);
    ctx.fillText(`${displayLabel(rightId)}: ${state.players[rightId].score}`, 130, 66);
  }
  ctx.fillStyle = "#f6e7b2";
  ctx.font = "14px Trebuchet MS";
  if (state.mode === "story") ctx.fillText(currentStoryLevel()?.relic || "Relic", 28, 88);
  else if (state.phase === "run" && state.activeRunner) ctx.fillText(`${displayLabel(state.activeRunner)} turn`, 28, 88);
  else ctx.fillText(state.template?.name || "No map", 28, 88);
}

function drawVictoryBanner() {
  if (!state.lastWinnerId || mainMenuOverlay.classList.contains("hidden")) return;
  ctx.fillStyle = "rgba(6,10,16,0.72)";
  ctx.fillRect(canvas.width * 0.18, canvas.height * 0.18, canvas.width * 0.64, canvas.height * 0.22);
  ctx.strokeStyle = displayColor(state.lastWinnerId);
  ctx.lineWidth = 4;
  ctx.strokeRect(canvas.width * 0.18, canvas.height * 0.18, canvas.width * 0.64, canvas.height * 0.22);
  ctx.fillStyle = "#f6e7b2";
  ctx.textAlign = "center";
  ctx.font = "800 42px Trebuchet MS";
  ctx.fillText(`${displayLabel(state.lastWinnerId)} Wins`, canvas.width / 2, canvas.height * 0.28);
  ctx.font = "20px Trebuchet MS";
  ctx.fillText("Rematch or start a new match from the menu.", canvas.width / 2, canvas.height * 0.36);
  ctx.textAlign = "left";
}

function drawStoryCutsceneOverlay() {
  if (state.phase !== "cutscene") return;
  const line = state.story.cutsceneLines[state.story.cutsceneIndex] || "";
  ctx.fillStyle = "rgba(4,8,14,0.72)";
  ctx.fillRect(canvas.width * 0.08, canvas.height * 0.62, canvas.width * 0.84, canvas.height * 0.24);
  ctx.strokeStyle = "rgba(255,211,107,0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(canvas.width * 0.08, canvas.height * 0.62, canvas.width * 0.84, canvas.height * 0.24);
  ctx.fillStyle = "#ffd36b";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText("The Eye", canvas.width * 0.11, canvas.height * 0.68);
  ctx.fillStyle = "#f6e7b2";
  ctx.font = "22px Trebuchet MS";
  wrapText(line, canvas.width * 0.11, canvas.height * 0.73, canvas.width * 0.78, 30);
  ctx.font = "14px Trebuchet MS";
  ctx.fillStyle = "rgba(246,231,178,0.8)";
  ctx.fillText("Click, Enter, Space, or Z to continue", canvas.width * 0.11, canvas.height * 0.83);
}

function drawStoryBreakOverlay() {
  if (state.phase !== "story-break") return;
  const progress = 1 - state.story.breakTimer / 2.7;
  const centerX = canvas.width / 2;
  const centerY = canvas.height * 0.34;
  ctx.fillStyle = "rgba(4,8,14,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGlowCircle(centerX, centerY, 120 * state.zoom, "rgba(255,211,107,0.9)", 0.18 + progress * 0.14);
  ctx.strokeStyle = "#71665a";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(centerX - 110, centerY - 10);
  ctx.lineTo(centerX - 28 - progress * 22, centerY - 10 - progress * 8);
  ctx.moveTo(centerX + 110, centerY - 10);
  ctx.lineTo(centerX + 28 + progress * 22, centerY - 10 - progress * 8);
  ctx.stroke();
  ctx.strokeStyle = "#d7b770";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(centerX - 16, centerY - 12, 18, Math.PI * 0.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 12);
  ctx.lineTo(centerX + 38, centerY - 12);
  ctx.lineTo(centerX + 38, centerY + 8);
  ctx.moveTo(centerX + 24, centerY - 12);
  ctx.lineTo(centerX + 24, centerY + 4);
  ctx.stroke();
  ctx.fillStyle = "#f6e7b2";
  ctx.font = "700 34px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("Route Cleared", centerX, canvas.height * 0.58);
  ctx.font = "18px Trebuchet MS";
  ctx.fillText(currentStoryLevel()?.relic || "Relic Claimed", centerX, canvas.height * 0.64);
  ctx.textAlign = "left";
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
    drawGoal();
    drawStoryCheckpoints();
    state.traps.forEach((entry) => {
      if (rectVisibleInView(trapVisualRect(entry), GRID * 2)) drawTrap(entry);
    });
    drawProjectiles();
    drawPlayers();
    drawParticles();
    drawPlacementGhost();
    drawDraftOverlay();
    drawHud();
  }
  if (state.lastWinnerId && state.phase === "home") drawVictoryBanner();
  if (state.screenShake > 0) {
    ctx.restore();
    state.screenShake = Math.max(0, state.screenShake - 1.2);
  }
  drawStoryBreakOverlay();
  drawStoryCutsceneOverlay();
}
function updateUi() {
  const [leftId, rightId] = activePlayerIds();
  const phaseNames = { home: "Main Menu", ready: state.mode === "story" ? "Story Ready" : "Ready Phase", run: state.mode === "story" ? "Story Run" : "Run Phase", between: "Next Round", paused: "Paused", cutscene: "Cutscene", "story-break": "Chain Breaking", "draft-select": "Trap Draft", "draft-place": "Trap Placement", gameover: "Match Over" };
  phaseLabel.textContent = phaseNames[state.phase] || state.phase;
  templateLabel.textContent = state.mode === "story"
    ? `Story: ${currentStoryLevel()?.name || "Gauntlet"}`
    : `Template: ${state.template?.name || findTemplateById(state.selectedMapId).name}`;
  redScoreLabel.textContent = state.mode === "story" ? `Attempts: ${state.story.attempts + 1}` : `${displayLabel(leftId)}: ${state.players[leftId].score}`;
  blueScoreLabel.textContent = state.mode === "story" ? `Clears: ${state.story.chainsBroken}/${storyChainTotal()}` : `${displayLabel(rightId)}: ${state.players[rightId].score}`;
  roundLabel.textContent = state.mode === "story"
    ? `Relic: ${currentStoryLevel()?.relic || "--"}`
    : state.phase === "run" && state.activeRunner ? `Turn: ${displayLabel(state.activeRunner)} · First to ${state.targetScore}` : `Round: ${state.round} · First to ${state.targetScore}`;
  finishDraftButton.style.display = "none";
  startRoundButton.disabled = !["ready", "between"].includes(state.phase);
  resetRoundButton.disabled = state.phase === "home";
  if (["ready", "between"].includes(state.phase) && !state.currentDraft) {
    draftHeading.textContent = "Round Setup";
    draftLabel.textContent = state.mode === "story" ? `Story gauntlet selected. Attempt ${state.story.attempts + 1}.` : `Between rounds: ${scoreLine()}. First to ${state.targetScore}.`;
  }
  if (state.currentDraft) {
    const rotateHint = state.currentDraft.selected?.rotatable ? "Press R to rotate." : "This trap cannot rotate.";
    draftHeading.textContent = `${displayLabel(state.currentDraft.playerId)} Placing Traps`;
    draftLabel.textContent = state.currentDraft.selected
      ? `${displayLabel(state.currentDraft.playerId)} is placing ${state.currentDraft.selected.name}. ${state.currentDraft.placementsLeft} placement(s) left. ${rotateHint}`
      : `${displayLabel(state.currentDraft.playerId)} controls this draft. Pick 1 of 3 traps for the next placement. ${state.currentDraft.placementsLeft} placement(s) left.`;
  }
}

function renderSidebarDraft() {
  draftOptions.innerHTML = "";
  if (state.mode === "story") {
    const note = document.createElement("div");
    note.className = "small-note";
    note.textContent = `Story mode uses fixed gauntlet traps. Attempts are counted, and checkpoint markers become respawns when the map includes them.`;
    draftOptions.appendChild(note);
    return;
  }
  if (!state.draftOptions.length) {
    const note = document.createElement("div");
    note.className = "small-note";
    note.textContent = state.template?.noDraft ? "This map uses fixed built-in traps only." : "Draft cards appear on the game screen whenever a round ends.";
    draftOptions.appendChild(note);
    return;
  }
  state.draftOptions.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tool-button${state.currentDraft?.selected?.id === option.id ? " selected" : ""}`;
    const rotateNote = option.rotatable ? "Rotates" : "Fixed facing";
    button.innerHTML = `<strong>${option.name}</strong><br><span>${option.desc} · ${rotateNote}</span>`;
    button.addEventListener("click", () => selectDraftOption(option.id));
    draftOptions.appendChild(button);
  });
}

function selectDraftOption(id) {
  if (!state.currentDraft) return;
  state.currentDraft.selected = state.draftOptions.find((option) => option.id === id) || null;
  state.currentDraft.rotation = 0;
  state.phase = "draft-place";
  if (id === "erase") draftLabel.textContent = `Erase mode selected for ${displayLabel(state.currentDraft.playerId)}. Remove 1 older trap, then you will draft again if placements remain.`;
  else draftLabel.textContent = `Place 1 ${state.currentDraft.selected.name} trap for ${displayLabel(state.currentDraft.playerId)}. ${state.currentDraft.selected.rotatable ? "Press R to rotate it." : "This trap cannot rotate."}`;
  updateUi();
  renderSidebarDraft();
}

function rotateDraftSelection() {
  if (state.phase !== "draft-place" || !state.currentDraft?.selected || !state.currentDraft.selected.rotatable) return;
  const index = ROTATIONS.indexOf(state.currentDraft.rotation);
  state.currentDraft.rotation = ROTATIONS[(index + 1) % ROTATIONS.length];
  draftLabel.textContent = `Rotation: ${state.currentDraft.rotation}°. Place the ${state.currentDraft.selected.name}.`;
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
  if (state.phase === "cutscene") { advanceStoryCutscene(); return; }
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
  syncEyeDialogOverlay();
  if (state.phase === "story-break" && state.story.breakTimer > 0) {
    state.story.breakTimer = Math.max(0, state.story.breakTimer - dt);
    if (state.story.breakTimer <= 0) resolveStoryChainBreak();
  }
  refreshZoom();
  updateParticles(dt);
  if (state.phase === "run") updateRun(dt);
  else if (state.phase === "draft-select" || state.phase === "draft-place") executeAiDraftStep(dt);
  updateCamera();
  drawScene();
  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (state.phase === "cutscene" && ["enter", " ", "z"].includes(key) && !event.repeat) { advanceStoryCutscene(); event.preventDefault(); return; }
  if (key === SETTINGS_KEY && !event.repeat) { toggleSettings(); event.preventDefault(); return; }
  if (key === "r" && !event.repeat) { rotateDraftSelection(); event.preventDefault(); return; }
  keys.add(key);
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) event.preventDefault();
});
window.addEventListener("keyup", (event) => { keys.delete(event.key.toLowerCase()); });
window.addEventListener("pointerdown", unlockAudio, { once: true });
window.addEventListener("keydown", unlockAudio, { once: true });
canvas.addEventListener("mousemove", handleCanvasMove);
canvas.addEventListener("click", handleCanvasClick);
startRoundButton.addEventListener("click", startRound);
resetRoundButton.addEventListener("click", resetCurrentRound);
fullscreenButton.addEventListener("click", () => { toggleFullscreen().catch(() => {}); });
newMatchButton.addEventListener("click", () => { startNewMatch(); showMainMenu(); });
finishDraftButton.addEventListener("click", () => {});
chooseVersusButton.addEventListener("click", () => setMenuStage("setup", "versus"));
chooseStoryButton.addEventListener("click", () => setMenuStage("setup", "story"));
entryBuilderButton.addEventListener("click", showBuilderMenu);
menuBackButton.addEventListener("click", () => setMenuStage("entry"));
menuStartButton.addEventListener("click", startConfiguredMatch);
menuRematchButton.addEventListener("click", rematchMatch);
menuFullscreenButton.addEventListener("click", () => { toggleFullscreen().catch(() => {}); });
openBuilderButton.addEventListener("click", showBuilderMenu);
gameModeSelect.addEventListener("change", updateModeVisibility);
playModeSelect.addEventListener("change", updateModeVisibility);
zoomSlider.addEventListener("input", () => {
  state.fullscreenZoom = clamp(Number(zoomSlider.value) / 100, 0.45, 1);
  localStorage.setItem(FULLSCREEN_ZOOM_KEY, String(state.fullscreenZoom));
  updateZoomLabel();
  refreshZoom();
});
resumeButton.addEventListener("click", () => toggleSettings());
resetMatchButton.addEventListener("click", () => { settingsOverlay.classList.add("hidden"); startNewMatch(); startRound(); });
returnMenuButton.addEventListener("click", () => { settingsOverlay.classList.add("hidden"); startNewMatch(); showMainMenu(); });
document.addEventListener("fullscreenchange", refreshZoom);

state.customMaps = loadCustomMaps();
const bootParams = new URLSearchParams(window.location.search);
zoomSlider.value = String(Math.round(state.fullscreenZoom * 100));
updateZoomLabel();
if (bootParams.get("playtest") === "1") {
  const playtestMap = loadPlaytestMap();
  if (playtestMap) {
    state.customMaps = state.customMaps.filter((entry) => entry.id !== playtestMap.id);
    state.customMaps.push(playtestMap);
    state.selectedMapId = playtestMap.id;
  }
}
buildTrapToggles();
buildMapList();
startNewMatch();
showMainMenu();
if (bootParams.get("playtest") === "1" && state.selectedMapId) {
  playModeSelect.value = "versus";
  updateModeVisibility();
  startConfiguredMatch();
}
requestAnimationFrame(tick);





