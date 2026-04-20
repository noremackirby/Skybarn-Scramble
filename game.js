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
const menuRematchButton = document.getElementById("menuRematchButton");
const menuFullscreenButton = document.getElementById("menuFullscreenButton");
const openBuilderButton = document.getElementById("openBuilderButton");
const resumeButton = document.getElementById("resumeButton");
const resetMatchButton = document.getElementById("resetMatchButton");
const returnMenuButton = document.getElementById("returnMenuButton");
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
const DEFAULT_TARGET_SCORE = 5;
const ROTATIONS = [0, 90, 180, 270];
const keys = new Set();

const trapCatalog = [
  { id: "crate", name: "Crate", color: "#d99853", desc: "Solid wood block.", solid: true, placement: "free", rotatable: false, length: 1 },
  { id: "spikes", name: "Spikes", color: "#ff6f61", desc: "3-wide hazard strip that must stick to solid surfaces.", solid: false, placement: "surface", rotatable: true, length: 3 },
  { id: "slime", name: "Slime Layer", color: "#96ef62", desc: "3-wide layer for solid surfaces. Slows by 75%.", solid: false, placement: "surface", rotatable: true, length: 3 },
  { id: "ice", name: "Ice Sheet", color: "#8ee0ff", desc: "3-wide slick surface. Faster, but much less control.", solid: false, placement: "surface", rotatable: true, length: 3 },
  { id: "fan", name: "Updraft", color: "#7ce0ff", desc: "Much stronger lift field.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "mine", name: "Mine", color: "#ff8c77", desc: "Explodes on contact.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "laser", name: "Laser Post", color: "#ff5e9c", desc: "Periodic beam hazard.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "saw", name: "Saw Drone", color: "#d2d7df", desc: "Buzzing moving blade.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "cannon", name: "Cannon", color: "#b98cff", desc: "Spits projectiles.", solid: true, placement: "free", rotatable: true, length: 1 },
  { id: "missile", name: "Missile Shrine", color: "#ffb48a", desc: "Launches a homing missile that hunts the runner.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "rocket", name: "Rocket Rail", color: "#ffd36b", desc: "A rideable rocket zips along a fixed lane.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "snare", name: "Thorn Snare", color: "#93d36a", desc: "Grabs the runner and ruins their movement.", solid: false, placement: "free", rotatable: false, length: 1 },
  { id: "mortar", name: "Mortar Idol", color: "#c7d2e2", desc: "Lobs an arcing shell through the room.", solid: false, placement: "free", rotatable: true, length: 1 },
  { id: "blink", name: "Blink Block", color: "#c99563", desc: "Phases in and out on a timer.", solid: true, placement: "free", rotatable: false, length: 1 },
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
  "Your feet are such honest liars."
];
const eyeReactions = {
  missile: { mood: "ecstatic", lines: ["The shrine curved toward your panic beautifully.", "You heard the missile thinking too late."] },
  mine: { mood: "glee", lines: ["A bigger blast makes a louder lesson.", "The mine turned one mistake into a crater."] },
  saw: { mood: "delighted", lines: ["The saw sang across the rail just for you.", "Every tooth on that blade knew your name."] },
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

function makeStoryLevel(id, name, relic, template, checkpoints) {
  return { id, name, relic, template, checkpoints };
}

function p(c, r, w = 4, h = 1) { return { c, r, w, h }; }
function trap(id, c, r, rotation = 0) { return { id, c, r, rotation, cooldown: 0, phase: Math.random() * Math.PI * 2 }; }
function makeTemplate(id, name, orientation, sky, goal, spawns, platforms, presets = [], meta = {}) {
  const platformObjects = platforms.map((entry) => p(entry[0], entry[1], entry[2], entry[3] || 1));
  const storySpawn = spawns.story || spawns.red;
  const derivedCols = Math.max(goal[0] + (goal[2] || 4) + 4, spawns.red[0] + 6, spawns.blue[0] + 6, storySpawn[0] + 6, ...platformObjects.map((entry) => entry.c + entry.w + 2));
  const derivedRows = Math.max(goal[1] + 6, spawns.red[1] + 6, spawns.blue[1] + 6, storySpawn[1] + 6, ...platformObjects.map((entry) => entry.r + entry.h + 4));
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
    platforms: platformObjects,
    presets: presets.map((entry) => trap(entry[0], entry[1], entry[2], entry[3] || 0)),
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
  makeTemplate("h5", "Thin Mercy", "horizontal", ["#182240", "#2f4b7f"], [55, 10, 4], { red: [2, 25], blue: [5, 25] }, [[0, 27, 11], [14, 24, 5], [21, 21, 5], [29, 18, 6], [38, 15, 6], [47, 12, 5]], [["fan", 29, 17, 0], ["blink", 48, 11]]),
  makeTemplate("h6", "Skyline Pins", "horizontal", ["#132340", "#3a5170"], [54, 7, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10], [13, 22, 5], [21, 18, 6], [30, 15, 5], [38, 12, 6], [47, 9, 5]], [["fan", 22, 17, 0], ["saw", 48, 8]]),
  makeTemplate("h7", "Grin Ladder", "horizontal", ["#181d36", "#60496e"], [53, 9, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10, 2], [13, 22, 6], [22, 19, 5], [30, 16, 6], [39, 13, 5], [47, 10, 5]], [["laser", 31, 15, 90], ["fan", 48, 9, 90]]),
  makeTemplate("h8", "Quiet Teeth", "horizontal", ["#102032", "#355a67"], [55, 11, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10], [14, 23, 6], [23, 20, 6], [32, 17, 5], [40, 14, 6], [49, 12, 5]], [["mine", 24, 19], ["spikes", 49, 11, 0]]),
  makeTemplate("h9", "Chapel Gaps", "horizontal", ["#1a213c", "#45506f"], [54, 8, 4], { red: [2, 25], blue: [5, 25] }, [[0, 27, 11], [14, 24, 6], [23, 21, 6], [32, 18, 6], [41, 14, 6], [50, 10, 5]], [["laser", 24, 20, 0], ["fan", 50, 9, 0]]),
  makeTemplate("h10", "Bell Hunger", "horizontal", ["#11233b", "#2a465a"], [54, 7, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 10], [13, 22, 6], [22, 18, 6], [31, 14, 6], [40, 11, 6], [49, 8, 5]], [["cannon", 32, 13, 0], ["flame", 50, 7, 0]]),
  makeTemplate("v1", "Tower Puncture", "vertical", ["#142245", "#28436c"], [26, 4, 4], { red: [25, 26], blue: [29, 26] }, [[22, 27, 12, 2], [24, 23, 6], [30, 20, 5], [22, 17, 6], [30, 14, 5], [23, 11, 6], [28, 8, 5]], [["fan", 25, 22, 0], ["laser", 31, 13, 90]]),
  makeTemplate("v2", "Lantern Shaft", "vertical", ["#17253f", "#4b4d76"], [28, 3, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [22, 24, 5], [30, 21, 5], [24, 18, 5], [32, 15, 5], [23, 12, 6], [30, 8, 5], [26, 5, 5]], [["saw", 24, 17], ["mine", 31, 20]]),
  makeTemplate("v3", "Pillar Gullet", "vertical", ["#10263f", "#375f6b"], [27, 4, 4], { red: [23, 26], blue: [28, 26] }, [[20, 27, 14, 2], [21, 23, 6], [30, 20, 4], [22, 17, 5], [29, 14, 5], [23, 11, 5], [30, 8, 4]], [["flame", 31, 13, 0], ["gravity", 25, 16]]),
  makeTemplate("v4", "Stained Climb", "vertical", ["#141e36", "#60496e"], [29, 4, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [25, 24, 4], [31, 21, 4], [23, 18, 4], [30, 15, 4], [24, 12, 4], [31, 9, 4], [26, 6, 4]], [["laser", 31, 20, 90], ["fan", 23, 17, 90]]),
  makeTemplate("v5", "Crown Well", "vertical", ["#17233a", "#2c526a"], [26, 3, 4], { red: [23, 26], blue: [28, 26] }, [[21, 27, 13, 2], [22, 24, 5], [29, 21, 5], [23, 18, 5], [30, 15, 5], [24, 12, 5], [29, 9, 5], [24, 6, 5]], [["blink", 29, 20], ["fan", 24, 11, 0]]),
  makeTemplate("v6", "Needle Choir", "vertical", ["#101f35", "#4d557a"], [28, 4, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [24, 24, 5], [31, 22, 4], [23, 19, 5], [30, 16, 4], [24, 13, 5], [31, 10, 4], [25, 7, 5]], [["spikes", 24, 23, 0], ["shock", 31, 15]]),
  makeTemplate("v7", "Chimney Teeth", "vertical", ["#112640", "#35556e"], [27, 4, 4], { red: [23, 26], blue: [28, 26] }, [[21, 27, 13, 2], [22, 24, 5], [30, 21, 5], [22, 18, 5], [30, 15, 5], [22, 12, 5], [30, 9, 5]], [["laser", 23, 17, 0], ["mine", 31, 14]]),
  makeTemplate("v8", "Pale Elevator", "vertical", ["#182240", "#355b78"], [29, 5, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [27, 24, 5], [22, 21, 5], [30, 18, 5], [23, 15, 5], [31, 12, 4], [24, 9, 5], [29, 6, 5]], [["gravity", 27, 17], ["fan", 24, 8, 0]]),
  makeTemplate("v9", "Ash Ladder", "vertical", ["#161f38", "#44516c"], [26, 4, 4], { red: [23, 26], blue: [28, 26] }, [[21, 27, 13, 2], [22, 24, 5], [29, 21, 5], [23, 18, 5], [30, 15, 5], [24, 12, 5], [29, 9, 5], [24, 6, 5]], [["cannon", 30, 14, 180], ["shock", 24, 11]]),
  makeTemplate("v10", "Choir Drop", "vertical", ["#10243d", "#2f4f66"], [28, 3, 4], { red: [24, 26], blue: [29, 26] }, [[22, 27, 12, 2], [23, 24, 5], [31, 21, 4], [24, 18, 5], [32, 15, 4], [25, 12, 5], [31, 9, 4], [27, 6, 4]], [["flame", 31, 20, 0], ["slime", 25, 11, 0]])
  ];

const storyLevels = [
  makeStoryLevel(
    "s1",
    "Needle Penance",
    "Splinter Relic",
    makeTemplate("story-s1", "Needle Penance", "horizontal", ["#12162d", "#384563"], [102, 9, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 14, 2], [17, 23, 8], [29, 20, 8], [42, 18, 8], [55, 15, 8], [68, 13, 8], [81, 11, 8], [95, 10, 8]], [["spikes", 20, 22, 0], ["spikes", 44, 17, 0], ["spikes", 70, 12, 0], ["fan", 82, 10, 0]], { cols: 112, rows: 30, noDraft: true }),
    [{ c: 31, r: 19 }, { c: 57, r: 14 }, { c: 84, r: 10 }]
  ),
  makeStoryLevel(
    "s2",
    "Beam Psalm",
    "Prism Relic",
    makeTemplate("story-s2", "Beam Psalm", "horizontal", ["#15162a", "#47355d"], [108, 8, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 12, 2], [16, 22, 8], [28, 18, 8], [40, 15, 7], [52, 12, 8], [66, 15, 8], [80, 11, 8], [95, 9, 10]], [["laser", 21, 21, 90], ["laser", 44, 14, 0], ["laser", 69, 14, 90], ["shock", 88, 10]], { cols: 118, rows: 30, noDraft: true }),
    [{ c: 26, r: 17 }, { c: 56, r: 11 }, { c: 90, r: 8 }]
  ),
  makeStoryLevel(
    "s3",
    "Saw Litany",
    "Iron Relic",
    makeTemplate("story-s3", "Saw Litany", "horizontal", ["#101720", "#30475a"], [112, 10, 4], { red: [2, 24], blue: [5, 24] }, [[0, 26, 12, 2], [15, 24, 7], [26, 21, 8], [39, 18, 8], [53, 16, 8], [68, 14, 8], [83, 12, 9], [99, 11, 10]], [["saw", 18, 23], ["saw", 42, 17], ["saw", 72, 13], ["mine", 104, 10]], { cols: 122, rows: 30, noDraft: true }),
    [{ c: 28, r: 20 }, { c: 60, r: 15 }, { c: 95, r: 10 }]
  ),
  makeStoryLevel(
    "s4",
    "Coil Ascension",
    "Halo Relic",
    makeTemplate("story-s4", "Coil Ascension", "vertical", ["#121226", "#3b3565"], [30, 3, 4], { red: [24, 36], blue: [28, 36] }, [[22, 37, 14, 2], [23, 33, 6], [31, 30, 5], [24, 27, 5], [32, 24, 5], [24, 20, 6], [31, 16, 5], [24, 12, 6], [30, 8, 5], [27, 5, 5]], [["shock", 31, 29], ["shock", 25, 19], ["laser", 30, 15, 0], ["fan", 27, 7, 0]], { cols: 44, rows: 42, noDraft: true }),
    [{ c: 30, r: 29 }, { c: 25, r: 19 }, { c: 30, r: 9 }]
  )
];

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
  players: { red: createPlayer("red"), blue: createPlayer("blue"), purple: createPlayer("purple") },
  traps: [],
  projectiles: [],
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
  enabledTrapIds: new Set(trapCatalog.map((entry) => entry.id)),
  eyeMood: "hungry",
  eyeLine: "Intresting. . .",
  eyeMessageTimer: 0,
  screenShake: 0,
  lastWinnerId: null,
  view: { x: 0, y: 0 },
  zoom: 1,
  autoRoundHandle: null,
  customMaps: [],
  ai: { thinkTimer: 0, controls: { left: false, right: false, jump: false, dash: false }, draftTimer: 0 },
  story: { levelIndex: 0, lives: 4, maxLives: 4, checkpointIndex: -1, checkpoint: null, relics: [], chainsBroken: 0, justRespawned: false, customTemplateId: null }
};
let audioCtx = null;
let audioUnlocked = false;

function createPlayer(id) {
  return { id, x: 0, y: 0, w: PLAYER_W, h: PLAYER_H, vx: 0, vy: 0, grounded: false, alive: true, score: 0, outcome: null, surface: "normal", facing: id === "red" ? 1 : -1, dashTimer: 0, dashCooldown: 0, dashDirection: 0, snareTimer: 0, slimeTouchTimer: 0, lastDeathCause: null, emberTimer: 0 };
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
  if (state.story.customTemplateId) {
    const customTemplate = findTemplateById(state.story.customTemplateId);
    if (customTemplate) return { id: customTemplate.id, name: customTemplate.name, relic: "Self-Made Relic", template: customTemplate, checkpoints: [] };
  }
  return storyLevels[state.story.levelIndex] || null;
}
function storyChainTotal() { return state.story.customTemplateId ? 1 : storyLevels.length; }
function storyStartSpawn() { return state.template?.spawns?.story || state.template?.spawns?.red || { c: 2, r: 2 }; }
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
  storyModeLabel.textContent = storyMode
    ? `Break ${storyChainTotal()} chain${storyChainTotal() === 1 ? "" : "s"} through trap gauntlets. Pick a custom map if you want a solo-made story stage with its own story spawn.`
    : storyModeLabel.textContent;
}
function scoreLine() {
  const ids = activePlayerIds();
  return ids.map((id) => `${displayLabel(id)} ${state.players[id].score}`).join(" - ");
}
function chooseEyeLine() { return eyeLines[Math.floor(Math.random() * eyeLines.length)]; }
function rectForCell(c, r, inset = 0) { return { x: c * GRID + inset, y: r * GRID + inset, w: GRID - inset * 2, h: GRID - inset * 2 }; }
function worldToScreenRect(rect) { return { x: (rect.x - state.view.x) * state.zoom, y: (rect.y - state.view.y) * state.zoom, w: rect.w * state.zoom, h: rect.h * state.zoom }; }
function intersects(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function trapDefinition(id) { return trapCatalog.find((entry) => entry.id === id) || ERASE_OPTION; }
function getAllTemplates() { return [...builtinTemplates, ...state.customMaps]; }
function findTemplateById(id) { return getAllTemplates().find((entry) => entry.id === id) || builtinTemplates[0]; }
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
function addParticles(x, y, color, count = 8, force = 1) { for (let i = 0; i < count; i += 1) state.particles.push({ x, y, vx: (Math.random() - 0.5) * 6 * force, vy: (Math.random() - 0.5) * 6 * force, life: 0.45 + Math.random() * 0.5, color, size: 3 + Math.random() * 3 }); }
function setEyeMood(mood, line = null) {
  state.eyeMood = mood;
  if (line) {
    state.eyeLine = line;
    state.eyeMessageTimer = 3.2;
    playSound("eye", { pitch: 140 + Math.random() * 70, volume: 0.028, duration: 0.24 });
  }
}
function clearAutoRound() { if (state.autoRoundHandle) { clearTimeout(state.autoRoundHandle); state.autoRoundHandle = null; } }
function scheduleAutoRound() { clearAutoRound(); state.autoRoundHandle = setTimeout(() => { if (state.phase === "between" && !isAnyOverlayOpen()) startRound(); }, AUTO_ROUND_DELAY); }
function isAnyOverlayOpen() { return !mainMenuOverlay.classList.contains("hidden") || !settingsOverlay.classList.contains("hidden"); }
function refreshZoom() { state.zoom = document.fullscreenElement === gameShell ? 0.68 : 1; }
function currentRunner() { return state.activeRunner ? state.players[state.activeRunner] : null; }
function currentWorldCols() { return state.template?.bounds?.cols || 60; }
function currentWorldRows() { return state.template?.bounds?.rows || 30; }
function currentWorldW() { return currentWorldCols() * GRID; }
function currentWorldH() { return currentWorldRows() * GRID; }
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
  const migratedPresets = presets.map((entry) => {
    const migratedId = entry.id === "spring" ? "fan" : entry.id === "booster" ? "fan" : entry.id === "crumble" ? "blink" : entry.id === "dart" ? "missile" : entry.id === "press" ? "rocket" : entry.id === "jaw" ? "snare" : entry.id === "orbiter" ? "rocket" : entry.id === "dropper" ? "mortar" : entry.id === "warp" || entry.id === "hex" ? "laser" : entry.id;
    return { ...entry, id: migratedId };
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
    raw.platforms.map((entry) => [entry.c, entry.r, entry.w, entry.h]),
    migratedPresets.map((entry) => [entry.id, entry.c, entry.r, entry.rotation || 0]),
    {
      cols: raw.bounds?.cols,
      rows: raw.bounds?.rows,
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
    option.title = entry.desc;
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
  trapCatalog.forEach((entry) => {
    const label = document.createElement("label");
    label.className = "trap-toggle";
    label.title = entry.desc;
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
  getAllTemplates().forEach((entry) => {
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
  selectedMapLabel.textContent = `Selected map: ${selected.name} · ${selected.orientation} layout${selected.noDraft ? " · fixed traps" : ""}${selected.suddenDeath ? " · first finisher wins" : ""}`;
}

function selectMap(id) {
  state.selectedMapId = id;
  buildMapList();
}

function deleteCustomMap(id) {
  state.customMaps = state.customMaps.filter((entry) => entry.id !== id);
  saveCustomMaps();
  if (!getAllTemplates().some((entry) => entry.id === state.selectedMapId)) state.selectedMapId = builtinTemplates[0].id;
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

function showMainMenu(title = "Skybarn Scramble", subtitle = "Choose traps, points, and a map before starting the match.") {
  unloadLiveMapState();
  const wasGameOver = state.phase === "gameover";
  state.phase = "home";
  menuTitle.textContent = title;
  menuSubtitle.textContent = subtitle;
  playModeSelect.value = state.mode;
  gameModeSelect.value = state.gameMode;
  aiDifficultySelect.value = state.aiDifficulty;
  targetScoreInput.value = String(state.targetScore);
  updateModeVisibility();
  buildMapList();
  mainMenuOverlay.classList.remove("hidden");
  settingsOverlay.classList.add("hidden");
  menuRematchButton.classList.toggle("hidden", !wasGameOver);
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
    state.story.customTemplateId = state.selectedMapId.startsWith("custom-") ? state.selectedMapId : null;
    state.story.levelIndex = 0;
    state.story.lives = state.story.maxLives;
    state.story.checkpointIndex = -1;
    state.story.checkpoint = null;
    state.story.relics = [];
    state.story.chainsBroken = 0;
    state.story.justRespawned = false;
    state.template = currentStoryLevel()?.template || findTemplateById(state.selectedMapId);
  } else {
    state.story.customTemplateId = null;
    state.template = findTemplateById(state.selectedMapId);
  }
  state.runOrder = activePlayerIds();
  state.traps = state.template.presets.map((entry) => ({ ...entry, state: entry.id === "blink" ? "solid" : entry.state }));
  state.projectiles = [];
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
  state.lastWinnerId = null;
  state.ai.thinkTimer = 0;
  state.ai.draftTimer = 0;
  state.ai.controls = { left: false, right: false, jump: false, dash: false };
  Object.values(state.players).forEach((player) => {
    player.score = 0;
    resetPlayerForRound(player);
  });
  messageLabel.textContent = state.mode === "story"
    ? `Story Mode: ${currentStoryLevel().name}. ${state.story.maxLives} lives. Break the chain and claim the ${currentStoryLevel().relic}.`
    : state.template.noDraft
    ? `Map locked: ${state.template.name}. Fixed traps only. First player to touch the goal wins the entire match.`
    : `Map locked: ${state.template.name}. ${state.gameMode === "single" ? `Red vs Green (${state.aiDifficulty})` : state.gameMode === "cpu" ? `Green vs Purple (${state.aiDifficulty})` : "Red vs Blue"}. First to ${state.targetScore} wins.`;
  updateUi();
  renderSidebarDraft();
}

function startConfiguredMatch() {
  hideMainMenu();
  if (playModeSelect.value === "story" && state.mode === "story" && (state.story.chainsBroken > 0 || state.story.levelIndex > 0)) {
    state.template = currentStoryLevel().template;
    state.traps = state.template.presets.map((entry) => ({ ...entry, state: entry.id === "blink" ? "solid" : entry.state }));
    state.phase = "ready";
    messageLabel.textContent = `${currentStoryLevel().name}. ${state.story.lives} lives remain.`;
    updateUi();
    renderSidebarDraft();
  } else {
    startNewMatch();
  }
  startRound();
}

function resetCurrentRound() {
  clearAutoRound();
  state.currentDraft = null;
  state.draftOptions = [];
  state.draftQueue = [];
  state.projectiles = [];
  state.particles = [];
  state.completedRuns = [];
  state.runRecords = [];
  state.currentRunTime = 0;
  state.activeRunner = null;
  state.ai.thinkTimer = 0;
  state.ai.draftTimer = 0;
  state.ai.controls = { left: false, right: false, jump: false, dash: false };
  if (state.mode === "story") {
    state.story.lives = state.story.maxLives;
    state.story.checkpointIndex = -1;
    state.story.checkpoint = null;
    state.story.justRespawned = false;
  }
  resetAllPlayers();
  state.phase = "ready";
  messageLabel.textContent = state.mode === "story" ? "Story level reset. The eye swallowed your progress and spat you back at the start." : "Round reset. The eye rewound the room.";
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
  state.runRecords = [];
  state.currentRunTime = 0;
  resetAllPlayers();
  state.activeRunner = state.mode === "story" ? "red" : state.runOrder[0];
  state.phase = "run";
  state.ai.thinkTimer = 0;
  messageLabel.textContent = state.mode === "story"
    ? `${currentStoryLevel().name}. ${state.story.lives} lives remain. Reach the checkered gate and break a chain.`
    : `${displayLabel(state.runOrder[0])} runs first. ${state.gameMode !== "two" ? `${state.aiDifficulty} AI is active.` : `First to ${state.targetScore} wins.`}`;
  setEyeMood("anticipation", chooseEyeLine());
  updateUi();
  renderSidebarDraft();
}

function randomTrapChoices(count) {
  const pool = trapCatalog.filter((entry) => state.enabledTrapIds.has(entry.id));
  const source = pool.length ? [...pool] : [...trapCatalog];
  const picked = [];
  while (source.length && picked.length < count) picked.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);
  return picked;
}

function queueDraftTurn(playerId) {
  if (!playerId) return;
  state.draftQueue.push({ playerId, placements: 2 });
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
  state.draftOptions = [...randomTrapChoices(3), ERASE_OPTION];
  state.phase = "draft-select";
  state.ai.draftTimer = 0;
  draftHeading.textContent = `${displayLabel(playerId)} Controls The Draft`;
  draftLabel.textContent = `${displayLabel(playerId)} won the round and can place ${turn.placements} traps. Pick 1 trap card, then place it ${turn.placements} times.`;
  messageLabel.textContent = `${displayLabel(playerId)} is placing traps now. ${turn.placements} placements remaining.`;
  setEyeMood("glee", chooseEyeLine());
  updateUi();
  renderSidebarDraft();
}

function finishDraftTurn(line = null) {
  const morePlacements = state.currentDraft && state.currentDraft.placementsLeft > 0;
  if (morePlacements) {
    draftLabel.textContent = `${displayLabel(state.currentDraft.playerId)} can place ${state.currentDraft.selected?.name || "that trap"} ${state.currentDraft.placementsLeft} more time(s).`;
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
      const nextLevel = state.story.customTemplateId ? null : storyLevels[state.story.levelIndex + 1];
      if (nextLevel) {
        state.story.levelIndex += 1;
        state.story.lives = state.story.maxLives;
        state.story.checkpointIndex = -1;
        state.story.checkpoint = null;
        state.template = currentStoryLevel().template;
        state.traps = state.template.presets.map((entry) => ({ ...entry, state: entry.id === "blink" ? "solid" : entry.state }));
        state.phase = "ready";
        messageLabel.textContent = `Chain broken. You claimed the ${storyWinner.relic}. ${storyChainTotal() - state.story.chainsBroken} chains remain.`;
        showMainMenu("Chain Broken", `You stole the ${storyWinner.relic}. Start the next gauntlet: ${currentStoryLevel().name}.`);
        return;
      }
      state.lastWinnerId = "red";
      state.phase = "gameover";
      showMainMenu("Soul Unbound", `Every chain is broken. You claimed ${state.story.relics.join(", ")} and slipped the eye's prison.`);
      return;
    }
    state.story.lives -= 1;
    if (state.story.lives > 0) {
      const spawn = state.story.checkpoint || storyStartSpawn();
      player.x = spawn.c * GRID + 4;
      player.y = spawn.r * GRID + 1;
      player.vx = 0;
      player.vy = 0;
      player.alive = true;
      player.outcome = null;
      player.grounded = false;
      state.story.justRespawned = true;
      state.projectiles = [];
      state.currentRunTime = 0;
      messageLabel.textContent = `${state.story.lives} lives remain. ${state.story.checkpoint ? "The checkpoint kept a little mercy for you." : "Back to the start."}`;
      const reaction = eyeReactionFor(cause, line);
      setEyeMood(reaction.mood, reaction.line);
      updateUi();
      return;
    }
    state.story.lives = state.story.maxLives;
    state.story.checkpointIndex = -1;
    state.story.checkpoint = null;
    state.story.justRespawned = true;
    resetPlayerForRound(player);
    state.projectiles = [];
    state.currentRunTime = 0;
    messageLabel.textContent = "All lives spent. The gauntlet restarts from the beginning.";
    setEyeMood("wrath", "The chain tightens again. Begin from nothing.");
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
    messageLabel.textContent = `${displayLabel(nextId)} runs now. Score: ${scoreLine()}.`;
    updateUi();
    return;
  }
  state.activeRunner = null;
  if (!state.template?.noDraft) {
    const scoringWinner = [...state.runRecords].filter((entry) => entry.outcome === "goal").sort((a, b) => a.time - b.time)[0];
    state.lastWinnerId = scoringWinner?.id || null;
    if (scoringWinner) queueDraftTurn(scoringWinner.id);
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
  if (!level) return [];
  return level.checkpoints.map((entry, index) => ({ index, x: entry.c * GRID, y: entry.r * GRID, w: GRID, h: GRID * 1.4 }));
}

function isBaseSolidAtCell(c, r) {
  const onPlatform = state.template.platforms.some((platform) => c >= platform.c && c < platform.c + platform.w && r >= platform.r && r < platform.r + platform.h);
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
    finishDraftTurn("Intresting. . .");
    return;
  }
  if (!canPlaceTrap(c, r, option.id, state.currentDraft.rotation)) {
    draftLabel.textContent = "That rotation or cell cannot take this trap.";
    return;
  }
  state.traps.push({ id: option.id, c, r, rotation: state.currentDraft.rotation, cooldown: 0, phase: Math.random() * Math.PI * 2, state: option.id === "blink" ? "solid" : undefined, placedRound: state.round });
  addParticles(c * GRID + GRID / 2, r * GRID + GRID / 2, option.color, 14, 1.1);
  state.currentDraft.placementsLeft = Math.max(0, state.currentDraft.placementsLeft - 1);
  finishDraftTurn("Intresting. . .");
}

function getPlatformRects() {
  const base = state.template.platforms.map((platform) => ({ x: platform.c * GRID, y: platform.r * GRID, w: platform.w * GRID, h: platform.h * GRID, kind: "platform" }));
  return [...base, getGoalRect()];
}

function getSolidTrapRects() {
  return state.traps.flatMap((entry) => {
    const def = trapDefinition(entry.id);
    if (!def.solid && entry.id !== "rocket") return [];
    if (entry.id === "blink" && entry.state === "gone") return [];
    if (entry.id === "rocket") {
      const rocket = getRocketState(entry);
      return [{ x: rocket.x - 20, y: rocket.y - 10, w: 40, h: 20, kind: "rocket", trapRef: entry }];
    }
    return trapCellRects(entry).map((rect) => ({ ...rect, kind: entry.id, trapRef: entry }));
  });
}

function getSolidRects() {
  return [...getPlatformRects(), ...getSolidTrapRects()];
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

function getTrapMotionOffset(entry) {
  if (entry.id === "rocket") return { x: 0, y: 0 };
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
  return player.dashTimer > 0;
}

function killRunner(reason, cause = "generic") {
  const player = currentRunner();
  if (!player || !player.alive || playerInvulnerable(player)) return;
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
    finishActiveRun("goal", "The checkered tile accepted you. Irritating.", "goal");
  }
}

function updateStoryCheckpoint(player) {
  if (state.mode !== "story") return;
  storyCheckpointRects().forEach((checkpoint) => {
    if (checkpoint.index <= state.story.checkpointIndex) return;
    if (intersects({ x: player.x, y: player.y, w: player.w, h: player.h }, checkpoint)) {
      state.story.checkpointIndex = checkpoint.index;
      state.story.checkpoint = { c: Math.floor(checkpoint.x / GRID), r: Math.floor(checkpoint.y / GRID) };
      addParticles(checkpoint.x + checkpoint.w / 2, checkpoint.y + checkpoint.h / 2, "#ffd36b", 18, 1.2);
      setEyeMood("curious", "A checkpoint. Tiny mercies bore me.");
      messageLabel.textContent = `Checkpoint reached. ${state.story.lives} lives remain in ${currentStoryLevel().name}.`;
    }
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
}

function explodeMortar(projectile) {
  addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, "#d9e4f2", 22, 1.8);
  addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, "rgba(255,240,225,0.8)", 12, 0.9);
  state.screenShake = Math.max(state.screenShake, 12);
  playSound("trap", { pitch: 118, volume: 0.045, duration: 0.16 });
}

function updateProjectiles(dt, playerRect) {
  state.projectiles = state.projectiles.filter((projectile) => {
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
    if (projectile.kind === "mortar") projectile.vy += 0.18;
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
    if (projectile.kind === "mortar") {
      const shellRect = { x: projectile.x, y: projectile.y, w: projectile.w, h: projectile.h };
      const hitBlock = getSolidRects().some((solid) => solid.kind !== "goal" && intersects(shellRect, solid));
      if (hitBlock) {
        explodeMortar(projectile);
        return false;
      }
    }
    if (!playerInvulnerable(currentRunner()) && intersects(playerRect, projectile)) {
      addParticles(projectile.x + projectile.w / 2, projectile.y + projectile.h / 2, projectile.kind === "tesla" ? "#f7e07a" : projectile.kind === "missile" ? "#ffb48a" : projectile.kind === "mortar" ? "#d9e4f2" : "#ffcf73", 10, 1.4);
      if (projectile.kind === "mortar") explodeMortar(projectile);
      killRunner(projectile.kind === "tesla" ? "The tesla coil spit a crooked bolt straight through your route." : projectile.kind === "missile" ? "The missile shrine corrected every mistake you made." : projectile.kind === "mortar" ? "The mortar idol dropped a shell right on your head." : "The shot found your ribs.", projectile.kind === "tesla" ? "tesla" : projectile.kind === "missile" ? "missile" : projectile.kind === "mortar" ? "mortar" : "generic");
      return false;
    }
    return true;
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
        state.projectiles.push({ kind: "cannon", color: "#ffcf73", x: entry.c * GRID + 9 + motion.x, y: entry.r * GRID + 9 + motion.y, w: 14, h: 14, vx: dir.x * 5.5, vy: dir.y * 5.5, life: 7 });
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
          life: 5.4
        });
      }
    }
    if (entry.id === "mortar") {
      entry.phase = (entry.phase || 0) + dt;
      if (entry.phase >= 2.5) {
        entry.phase = 0;
        playSound("trap", { pitch: 150, volume: 0.02, duration: 0.14 });
        const dir = rotationVector(entry.rotation || 0);
        const spread = (Math.random() * 2 - 1) * 1.4;
        const liftVariance = Math.random() * 2.2;
        const motion = getTrapMotionOffset(entry);
        state.projectiles.push({
          kind: "mortar",
          color: "#c7d2e2",
          x: entry.c * GRID + 11 + motion.x,
          y: entry.r * GRID + 11 + motion.y,
          w: 12,
          h: 12,
          vx: dir.x * (4.4 + Math.random() * 1.6) + (dir.x === 0 ? 1.6 + spread : spread),
          vy: dir.y * 4.4 - (5.4 + liftVariance),
          life: 3.8
        });
      }
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
            drift: Math.random() * Math.PI * 2
          });
        }
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
  return state.template.platforms
    .filter((platform) => playerCenterX >= platform.c * GRID - GRID && playerCenterX <= (platform.c + platform.w) * GRID + GRID && platform.r * GRID < player.y - GRID)
    .sort((a, b) => b.r - a.r)[0] || null;
}

function aiDangerZone(entry) {
  const baseRect = { x: entry.c * GRID, y: entry.r * GRID, w: GRID, h: GRID };
  if (entry.id === "mine") return { x: baseRect.x - GRID * 2, y: baseRect.y - GRID * 2, w: GRID * 5, h: GRID * 5 };
  if (entry.id === "spikes") {
    const cells = trapCells(entry);
    return { x: cells[0].c * GRID, y: cells[0].r * GRID, w: cells.length * GRID, h: GRID };
  }
  if (entry.id === "saw") {
    const saw = getSawState(entry);
    return { x: saw.rail.startX - 18, y: saw.y - 18, w: (saw.rail.endX - saw.rail.startX) + 36, h: 36 };
  }
  if (entry.id === "laser") {
    const rot = entry.rotation || 0;
    return rot === 90 || rot === 270 ? { x: 0, y: baseRect.y + 8, w: currentWorldW(), h: 16 } : { x: baseRect.x + 8, y: 0, w: 16, h: currentWorldH() };
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
    if (!["mine", "spikes", "flame", "saw", "laser", "rocket", "gravity", "snare"].includes(entry.id)) return false;
    return intersects(zone, aiDangerZone(entry));
  });
}

function aiProjectileThreat(player, direction) {
  return state.projectiles.some((projectile) => {
    const closeY = Math.abs((projectile.y + projectile.h / 2) - (player.y + player.h / 2)) < GRID * 1.8;
    const ahead = direction >= 0
      ? projectile.x >= player.x - 24 && projectile.x <= player.x + GRID * 4.2
      : projectile.x + projectile.w <= player.x + player.w + 24 && projectile.x + projectile.w >= player.x - GRID * 4.2;
    const incoming = direction >= 0 ? projectile.vx < 0 || projectile.kind === "missile" : projectile.vx > 0 || projectile.kind === "missile";
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
  state.template.platforms.forEach((platform, index) => {
    if (activePlayerIds().some((id) => {
      const spawn = state.template.spawns[id] || state.template.spawns.blue;
      return spawn && spawn.c >= platform.c && spawn.c < platform.c + platform.w && spawn.r >= platform.r - 2 && spawn.r <= platform.r;
    })) spawnPlatforms.add(index);
    if (state.template.goal.c + state.template.goal.w > platform.c && state.template.goal.c < platform.c + platform.w && state.template.goal.r >= platform.r - 2 && state.template.goal.r <= platform.r) {
      goalPlatforms.add(index);
    }
  });
  state.template.platforms.forEach((platform, index) => {
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
      const trapBias = { mine: 9, laser: 8, missile: 7, shock: 7, flame: 7, gravity: 6, rocket: 6, snare: 7, mortar: 6, fan: 5, saw: 5, spikes: 6, cannon: 5, slime: 4, ice: 3, crate: 2, blink: 3, erase: 3 }[option.id] || 1;
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
  for (const entry of state.traps) {
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
    if (entry.id === "rocket") {
      const rocket = getRocketState(entry);
      const flameRect = { x: rocket.flameX - 12, y: rocket.flameY - 12, w: 24, h: 24 };
      if (intersects(playerRect, flameRect) && !playerInvulnerable(player)) {
        addParticles(rocket.flameX, rocket.flameY, "#ffd36b", 18, 1.5);
        killRunner("The rocket rail burned the route right out from under you.", "rocket");
        return;
      }
    }
  }
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
  if (dash && player.dashCooldown <= 0 && player.dashTimer <= 0) startDash(player, left ? -1 : right ? 1 : player.facing || 1);
  if (player.dashTimer > 0) {
    player.dashTimer = Math.max(0, player.dashTimer - dt);
    player.x = clamp(player.x + player.vx * 60 * dt, 0, currentWorldW() - player.w);
    player.y = clamp(player.y + player.vy * 60 * dt, -20, currentWorldH() + 180);
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

  let nextX = player.x + player.vx * 60 * dt;
  let rect = { x: nextX, y: player.y, w: player.w, h: player.h };
  for (const solid of getSolidRects()) {
    if (!intersects(rect, solid)) continue;
    if (player.vx > 0) nextX = solid.x - player.w;
    if (player.vx < 0) nextX = solid.x + solid.w;
    player.vx = 0;
    rect.x = nextX;
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
  player.y = nextY;
}

function updateRun(dt) {
  const player = currentRunner();
  if (!player || !player.alive) return;
  state.currentRunTime += dt;
  updateTrapTimers(dt);
  moveRunner(player, dt);
  const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
  handleTrapInteractions(player, rect, dt);
  if (state.mode === "story" && state.story.justRespawned) {
    state.story.justRespawned = false;
    return;
  }
  if (!player.alive) return;
  updateStoryCheckpoint(player);
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
}

function drawStoryCheckpoints() {
  if (state.mode !== "story") return;
  storyCheckpointRects().forEach((checkpoint) => {
    const rect = worldToScreenRect(checkpoint);
    const reached = checkpoint.index <= state.story.checkpointIndex;
    ctx.fillStyle = reached ? "rgba(255,211,107,0.45)" : "rgba(255,211,107,0.2)";
    ctx.fillRect(rect.x + rect.w * 0.25, rect.y, rect.w * 0.5, rect.h);
    ctx.strokeStyle = reached ? "#ffd36b" : "rgba(255,211,107,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x + rect.w * 0.25, rect.y, rect.w * 0.5, rect.h);
  });
}

function drawSolids() {
  state.template.platforms.forEach((platform) => {
    const rect = { x: platform.c * GRID, y: platform.r * GRID, w: platform.w * GRID, h: platform.h * GRID };
    drawWorldRect(rect, "rgba(137,105,74,0.92)");
    drawWorldRect({ x: rect.x, y: rect.y, w: rect.w, h: 6 }, "#d6a069");
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

  if (showArrow && ["fan", "laser", "cannon", "flame"].includes(entry.id)) {
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
  if (player.emberTimer <= 0) {
    addParticles(player.x + player.w / 2, player.y + player.h * 0.16, color, 2, 0.28);
    player.emberTimer = 0.06 + Math.random() * 0.06;
  }
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
  const cardH = 88;
  const gap = 18;
  const total = state.draftOptions.length * cardW + (state.draftOptions.length - 1) * gap;
  const startX = (canvas.width - total) / 2;
  const y = canvas.height - 114;
  return state.draftOptions.map((option, index) => ({ option, x: startX + index * (cardW + gap), y, w: cardW, h: cardH }));
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
    ctx.fillText(card.option.desc, card.x + 14, card.y + 58);
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
    ctx.fillText(`Lives: ${state.story.lives}`, 28, 40);
    ctx.fillStyle = "#ffd36b";
    ctx.fillText(`Chains Broken: ${state.story.chainsBroken}/${storyChainTotal()}`, 28, 66);
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
    state.traps.forEach((entry) => drawTrap(entry));
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
}
function updateUi() {
  const [leftId, rightId] = activePlayerIds();
  const phaseNames = { home: "Main Menu", ready: state.mode === "story" ? "Story Ready" : "Ready Phase", run: state.mode === "story" ? "Story Run" : "Run Phase", between: "Next Round", paused: "Paused", "draft-select": "Trap Draft", "draft-place": "Trap Placement", gameover: "Match Over" };
  phaseLabel.textContent = phaseNames[state.phase] || state.phase;
  templateLabel.textContent = state.mode === "story"
    ? `Story: ${currentStoryLevel()?.name || "Gauntlet"}`
    : `Template: ${state.template?.name || findTemplateById(state.selectedMapId).name}`;
  redScoreLabel.textContent = state.mode === "story" ? `Lives: ${state.story.lives}` : `${displayLabel(leftId)}: ${state.players[leftId].score}`;
  blueScoreLabel.textContent = state.mode === "story" ? `Chains: ${state.story.chainsBroken}/${storyChainTotal()}` : `${displayLabel(rightId)}: ${state.players[rightId].score}`;
  roundLabel.textContent = state.mode === "story"
    ? `Relic: ${currentStoryLevel()?.relic || "--"}`
    : state.phase === "run" && state.activeRunner ? `Turn: ${displayLabel(state.activeRunner)} · First to ${state.targetScore}` : `Round: ${state.round} · First to ${state.targetScore}`;
  finishDraftButton.style.display = "none";
  startRoundButton.disabled = !["ready", "between"].includes(state.phase);
  resetRoundButton.disabled = state.phase === "home";
  if (["ready", "between"].includes(state.phase) && !state.currentDraft) {
    draftHeading.textContent = "Round Setup";
    draftLabel.textContent = `Between rounds: ${scoreLine()}. First to ${state.targetScore}.`;
  }
  if (state.currentDraft) {
    const rotateHint = state.currentDraft.selected?.rotatable ? "Press R to rotate." : "This trap cannot rotate.";
    draftHeading.textContent = `${displayLabel(state.currentDraft.playerId)} Placing Traps`;
    draftLabel.textContent = state.currentDraft.selected
      ? `${displayLabel(state.currentDraft.playerId)} is placing ${state.currentDraft.selected.name}. ${state.currentDraft.placementsLeft} placement(s) left. ${rotateHint}`
      : `${displayLabel(state.currentDraft.playerId)} controls this draft. Pick 1 of 3 traps, then place it ${state.currentDraft.placementsLeft} time(s).`;
  }
}

function renderSidebarDraft() {
  draftOptions.innerHTML = "";
  if (state.mode === "story") {
    const note = document.createElement("div");
    note.className = "small-note";
    note.textContent = `Story mode has fixed gauntlet traps. Reach checkpoints and survive with ${state.story.lives} lives.`;
    draftOptions.appendChild(note);
    return;
  }
  if (!state.draftOptions.length) {
    const note = document.createElement("div");
    note.className = "small-note";
    note.textContent = state.template?.noDraft ? "This map uses fixed built-in traps only." : "Draft cards appear on the game screen whenever a player loses.";
    draftOptions.appendChild(note);
    return;
  }
  state.draftOptions.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tool-button${state.currentDraft?.selected?.id === option.id ? " selected" : ""}`;
    button.title = option.desc;
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
  if (id === "erase") draftLabel.textContent = `Erase mode selected for ${displayLabel(state.currentDraft.playerId)}. You can remove ${state.currentDraft.placementsLeft} older trap(s).`;
  else draftLabel.textContent = `Place ${state.currentDraft.placementsLeft} ${state.currentDraft.selected.name} trap(s) for ${displayLabel(state.currentDraft.playerId)}. ${state.currentDraft.selected.rotatable ? "Press R to rotate it." : "This trap cannot rotate."}`;
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
  else if (state.phase === "draft-select" || state.phase === "draft-place") executeAiDraftStep(dt);
  updateCamera();
  drawScene();
  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
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
menuStartButton.addEventListener("click", startConfiguredMatch);
menuRematchButton.addEventListener("click", rematchMatch);
menuFullscreenButton.addEventListener("click", () => { toggleFullscreen().catch(() => {}); });
openBuilderButton.addEventListener("click", showBuilderMenu);
gameModeSelect.addEventListener("change", updateModeVisibility);
playModeSelect.addEventListener("change", updateModeVisibility);
resumeButton.addEventListener("click", () => toggleSettings());
resetMatchButton.addEventListener("click", () => { settingsOverlay.classList.add("hidden"); startNewMatch(); startRound(); });
returnMenuButton.addEventListener("click", () => { settingsOverlay.classList.add("hidden"); startNewMatch(); showMainMenu(); });
document.addEventListener("fullscreenchange", refreshZoom);

state.customMaps = loadCustomMaps();
buildTrapToggles();
buildMapList();
startNewMatch();
showMainMenu();
requestAnimationFrame(tick);





