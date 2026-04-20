const LOCAL_MAP_KEY = "skybarn-custom-maps-v1";
const trapCatalog = [
  { id: "crate", name: "Crate", color: "#d99853", desc: "Solid wood block." },
  { id: "spikes", name: "Spikes", color: "#ff6f61", desc: "3-wide hazard strip for supported surfaces." },
  { id: "slime", name: "Slime Layer", color: "#96ef62", desc: "Sticky 3-wide surface that ruins speed and jump height." },
  { id: "ice", name: "Ice Sheet", color: "#8ee0ff", desc: "Slick 3-wide surface with low traction." },
  { id: "fan", name: "Updraft", color: "#7ce0ff", desc: "Strong lift field." },
  { id: "mine", name: "Mine", color: "#ff8c77", desc: "Explodes with a wide radius." },
  { id: "laser", name: "Laser Post", color: "#ff5e9c", desc: "Periodic beam hazard." },
  { id: "saw", name: "Saw Drone", color: "#d2d7df", desc: "Travels along supporting platforms." },
  { id: "cannon", name: "Cannon", color: "#b98cff", desc: "Fires straight projectiles." },
  { id: "missile", name: "Missile Shrine", color: "#ffb48a", desc: "Launches a homing missile." },
  { id: "rocket", name: "Rocket Rail", color: "#ffd36b", desc: "Screenwide rail that carries mounted traps." },
  { id: "snare", name: "Thorn Snare", color: "#93d36a", desc: "Applies a vine debuff." },
  { id: "mortar", name: "Mortar Idol", color: "#c7d2e2", desc: "Lobs arcing shells." },
  { id: "blink", name: "Blink Block", color: "#c99563", desc: "Phases in and out on a timer." },
  { id: "flame", name: "Fire Jet", color: "#ff8748", desc: "Cycles from idle to a tall flame burst." },
  { id: "shock", name: "Tesla Coil", color: "#f7e07a", desc: "Launches fast roaming lightning." },
  { id: "gravity", name: "Black Hole", color: "#96a7ff", desc: "Pulls runners inward." }
];

const mapNameInput = document.getElementById("mapNameInput");
const orientationInput = document.getElementById("orientationInput");
const colsInput = document.getElementById("colsInput");
const rowsInput = document.getElementById("rowsInput");
const skyInput = document.getElementById("skyInput");
const applySizeButton = document.getElementById("applySizeButton");
const clearMapButton = document.getElementById("clearMapButton");
const newMapButton = document.getElementById("newMapButton");
const toolButtons = [...document.querySelectorAll("[data-tool]")];
const trapSelect = document.getElementById("trapSelect");
const rotationSelect = document.getElementById("rotationSelect");
const boardMeta = document.getElementById("boardMeta");
const board = document.getElementById("board");
const saveMapButton = document.getElementById("saveMapButton");
const duplicateMapButton = document.getElementById("duplicateMapButton");
const statusLabel = document.getElementById("statusLabel");
const savedMapList = document.getElementById("savedMapList");

const state = {
  customMaps: [],
  currentMapId: null,
  builder: null
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeTrap(id, c, r, rotation = 0) {
  return { id, c, r, rotation };
}

function makeTemplate(id, name, orientation, sky, goal, spawns, platforms, presets = [], meta = {}) {
  return {
    id,
    name,
    orientation,
    sky,
    goal: { c: goal[0], r: goal[1], w: goal[2] || 4 },
    spawns: {
      red: { c: spawns.red[0], r: spawns.red[1] },
      blue: { c: spawns.blue[0], r: spawns.blue[1] },
      story: { c: (spawns.story || spawns.red)[0], r: (spawns.story || spawns.red)[1] }
    },
    platforms: platforms.map((entry) => ({ c: entry[0], r: entry[1], w: entry[2], h: entry[3] || 1 })),
    presets: presets.map((entry) => makeTrap(entry[0], entry[1], entry[2], entry[3] || 0)),
    bounds: { cols: meta.cols, rows: meta.rows },
    noDraft: Boolean(meta.noDraft),
    suddenDeath: Boolean(meta.suddenDeath)
  };
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
    (raw.platforms || []).map((entry) => [entry.c, entry.r, entry.w, entry.h]),
    migratedPresets.map((entry) => [entry.id, entry.c, entry.r, entry.rotation || 0]),
    {
      cols: raw.bounds?.cols || 56,
      rows: raw.bounds?.rows || 26,
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

function builderDefaults(orientation = "horizontal", cols = 56, rows = 26) {
  const safeCols = clamp(cols, 12, 160);
  const safeRows = clamp(rows, 12, 90);
  const platforms = new Set();
  for (let c = 0; c < safeCols; c += 1) {
    platforms.add(`${c},${safeRows - 2}`);
    platforms.add(`${c},${safeRows - 1}`);
  }
  return {
    orientation,
    cols: safeCols,
    rows: safeRows,
    sky: ["#10253d", "#2d4c67"],
    platforms,
    presets: [],
    spawns: {
      red: { c: 2, r: safeRows - 4 },
      blue: { c: 5, r: safeRows - 4 },
      story: { c: 2, r: safeRows - 4 }
    },
    goal: { c: Math.max(0, safeCols - 6), r: Math.max(2, safeRows - 8), w: 4 },
    tool: "platform",
    trapId: trapCatalog[0].id,
    rotation: 0,
    dragging: false
  };
}

function setStatus(text) {
  statusLabel.textContent = text;
}

function syncInputsFromBuilder() {
  if (!state.builder) return;
  orientationInput.value = state.builder.orientation;
  colsInput.value = String(state.builder.cols);
  rowsInput.value = String(state.builder.rows);
  skyInput.value = state.builder.sky.join(",");
  trapSelect.value = state.builder.trapId;
  rotationSelect.value = String(state.builder.rotation);
  boardMeta.textContent = `${state.builder.cols} x ${state.builder.rows} tiles`;
}

function trapCells(entry) {
  const def = trapCatalog.find((item) => item.id === entry.id);
  if (!def) return [{ c: entry.c, r: entry.r }];
  const length = def.id === "spikes" || def.id === "slime" || def.id === "ice" ? 3 : 1;
  if (length === 1) return [{ c: entry.c, r: entry.r }];
  const horizontal = entry.rotation === 0 || entry.rotation === 180;
  return Array.from({ length }, (_, index) => ({
    c: entry.c + (horizontal ? index : 0),
    r: entry.r + (horizontal ? 0 : index)
  }));
}

function getTrapAt(c, r) {
  return state.builder.presets.find((entry) => trapCells(entry).some((cell) => cell.c === c && cell.r === r)) || null;
}

function renderTrapSelect() {
  trapSelect.innerHTML = "";
  trapCatalog.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.name;
    option.title = entry.desc;
    trapSelect.appendChild(option);
  });
}

function setTool(tool) {
  state.builder.tool = tool;
  toolButtons.forEach((button) => button.classList.toggle("selected", button.dataset.tool === tool));
}

function eraseAt(c, r) {
  const defaults = builderDefaults(state.builder.orientation, state.builder.cols, state.builder.rows);
  state.builder.platforms.delete(`${c},${r}`);
  state.builder.presets = state.builder.presets.filter((entry) => !trapCells(entry).some((cell) => cell.c === c && cell.r === r));
  if (state.builder.spawns.red.c === c && state.builder.spawns.red.r === r) state.builder.spawns.red = defaults.spawns.red;
  if (state.builder.spawns.blue.c === c && state.builder.spawns.blue.r === r) state.builder.spawns.blue = defaults.spawns.blue;
  if (state.builder.spawns.story.c === c && state.builder.spawns.story.r === r) state.builder.spawns.story = defaults.spawns.story;
  if (r === state.builder.goal.r && c >= state.builder.goal.c && c < state.builder.goal.c + state.builder.goal.w) state.builder.goal = defaults.goal;
}

function applyTool(c, r) {
  if (!state.builder) return;
  if (c < 0 || c >= state.builder.cols || r < 0 || r >= state.builder.rows) return;
  const key = `${c},${r}`;
  if (state.builder.tool === "platform") state.builder.platforms.add(key);
  if (state.builder.tool === "erase") eraseAt(c, r);
  if (state.builder.tool === "red") state.builder.spawns.red = { c, r };
  if (state.builder.tool === "blue") state.builder.spawns.blue = { c, r };
  if (state.builder.tool === "story") state.builder.spawns.story = { c, r };
  if (state.builder.tool === "goal") state.builder.goal = { c: clamp(c, 0, state.builder.cols - 4), r, w: 4 };
  if (state.builder.tool === "trap") {
    state.builder.presets = state.builder.presets.filter((entry) => !trapCells(entry).some((cell) => cell.c === c && cell.r === r));
    state.builder.presets.push(makeTrap(state.builder.trapId, c, r, state.builder.rotation));
  }
  renderBoard();
}

function renderBoard() {
  if (!state.builder) return;
  board.innerHTML = "";
  board.style.setProperty("--cols", String(state.builder.cols));
  syncInputsFromBuilder();
  for (let r = 0; r < state.builder.rows; r += 1) {
    for (let c = 0; c < state.builder.cols; c += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.c = String(c);
      cell.dataset.r = String(r);
      if (state.builder.platforms.has(`${c},${r}`)) cell.classList.add("platform");
      if (r === state.builder.goal.r && c >= state.builder.goal.c && c < state.builder.goal.c + state.builder.goal.w) cell.classList.add("goal");
      if (state.builder.spawns.red.c === c && state.builder.spawns.red.r === r) cell.classList.add("red");
      if (state.builder.spawns.blue.c === c && state.builder.spawns.blue.r === r) cell.classList.add("blue");
      if (state.builder.spawns.story.c === c && state.builder.spawns.story.r === r) cell.classList.add("story");
      const trapEntry = getTrapAt(c, r);
      if (trapEntry) {
        const def = trapCatalog.find((item) => item.id === trapEntry.id);
        cell.classList.add("trap");
        cell.style.background = def?.color || "#ffffff";
        cell.title = `${def?.name || trapEntry.id}${trapEntry.rotation ? ` ${trapEntry.rotation}°` : ""}`;
      }
      board.appendChild(cell);
    }
  }
}

function resizeBuilder(cols, rows, orientation) {
  const previous = state.builder || builderDefaults(orientation, cols, rows);
  const next = builderDefaults(orientation, cols, rows);
  next.sky = [...(previous.sky || next.sky)];
  previous.platforms.forEach((entry) => {
    const [c, r] = entry.split(",").map(Number);
    if (c < next.cols && r < next.rows) next.platforms.add(entry);
  });
  next.presets = previous.presets.filter((entry) => trapCells(entry).every((cell) => cell.c < next.cols && cell.r < next.rows));
  next.spawns.red = { c: clamp(previous.spawns.red.c, 0, next.cols - 1), r: clamp(previous.spawns.red.r, 0, next.rows - 1) };
  next.spawns.blue = { c: clamp(previous.spawns.blue.c, 0, next.cols - 1), r: clamp(previous.spawns.blue.r, 0, next.rows - 1) };
  next.spawns.story = {
    c: clamp((previous.spawns.story || previous.spawns.red).c, 0, next.cols - 1),
    r: clamp((previous.spawns.story || previous.spawns.red).r, 0, next.rows - 1)
  };
  next.goal = {
    c: clamp(previous.goal.c, 0, Math.max(0, next.cols - 4)),
    r: clamp(previous.goal.r, 0, next.rows - 1),
    w: 4
  };
  next.tool = previous.tool || "platform";
  next.trapId = previous.trapId || trapCatalog[0].id;
  next.rotation = previous.rotation || 0;
  state.builder = next;
  renderBoard();
}

function loadIntoBuilder(entry) {
  state.currentMapId = entry.id;
  state.builder = {
    orientation: entry.orientation,
    cols: entry.bounds?.cols || 56,
    rows: entry.bounds?.rows || 26,
    sky: [...entry.sky],
    platforms: new Set(entry.platforms.flatMap((platform) => {
      const cells = [];
      for (let rr = 0; rr < platform.h; rr += 1) {
        for (let cc = 0; cc < platform.w; cc += 1) {
          cells.push(`${platform.c + cc},${platform.r + rr}`);
        }
      }
      return cells;
    })),
    presets: entry.presets.map((trapEntry) => makeTrap(trapEntry.id, trapEntry.c, trapEntry.r, trapEntry.rotation || 0)),
    spawns: {
      red: { ...entry.spawns.red },
      blue: { ...entry.spawns.blue },
      story: { ...(entry.spawns.story || entry.spawns.red) }
    },
    goal: { ...entry.goal },
    tool: state.builder?.tool || "platform",
    trapId: state.builder?.trapId || trapCatalog[0].id,
    rotation: state.builder?.rotation || 0,
    dragging: false
  };
  mapNameInput.value = entry.name;
  syncInputsFromBuilder();
  renderBoard();
  setStatus(`Loaded ${entry.name} for editing.`);
}

function drawMapThumbnail(entry, canvasEl) {
  const preview = canvasEl.getContext("2d");
  const w = canvasEl.width;
  const h = canvasEl.height;
  const cols = entry.bounds?.cols || 56;
  const rows = entry.bounds?.rows || 26;
  const sx = w / cols;
  const sy = h / rows;
  preview.clearRect(0, 0, w, h);
  const grad = preview.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, entry.sky[0]);
  grad.addColorStop(1, entry.sky[1]);
  preview.fillStyle = grad;
  preview.fillRect(0, 0, w, h);
  entry.platforms.forEach((platform) => {
    preview.fillStyle = "#8f6a49";
    preview.fillRect(platform.c * sx, platform.r * sy, platform.w * sx, platform.h * sy);
    preview.fillStyle = "#d6a069";
    preview.fillRect(platform.c * sx, platform.r * sy, platform.w * sx, Math.max(1, sy * 0.25));
  });
  preview.fillStyle = "#f4f2ef";
  preview.fillRect(entry.goal.c * sx, entry.goal.r * sy, entry.goal.w * sx, sy);
  for (let i = 0; i < entry.goal.w; i += 1) {
    preview.fillStyle = i % 2 === 0 ? "#10161f" : "#f4f2ef";
    preview.fillRect((entry.goal.c + i) * sx, entry.goal.r * sy, sx, sy * 0.5);
    preview.fillStyle = i % 2 === 0 ? "#f4f2ef" : "#10161f";
    preview.fillRect((entry.goal.c + i) * sx, entry.goal.r * sy + sy * 0.5, sx, sy * 0.5);
  }
  entry.presets.slice(0, 18).forEach((trapEntry) => {
    const def = trapCatalog.find((item) => item.id === trapEntry.id);
    preview.fillStyle = def?.color || "#ffffff";
    trapCells(trapEntry).forEach((cell) => {
      preview.fillRect(cell.c * sx + 1, cell.r * sy + 1, Math.max(2, sx - 2), Math.max(2, sy - 2));
    });
  });
  preview.fillStyle = "#ff6b6b";
  preview.fillRect(entry.spawns.red.c * sx + 1, entry.spawns.red.r * sy + 1, Math.max(2, sx - 2), Math.max(2, sy - 2));
  preview.fillStyle = "#53e37a";
  preview.fillRect(entry.spawns.blue.c * sx + 1, entry.spawns.blue.r * sy + 1, Math.max(2, sx - 2), Math.max(2, sy - 2));
  preview.fillStyle = "#ffd36b";
  preview.fillRect(entry.spawns.story.c * sx + 1, entry.spawns.story.r * sy + 1, Math.max(2, sx - 2), Math.max(2, sy - 2));
}

function renderSavedMapList() {
  savedMapList.innerHTML = "";
  if (!state.customMaps.length) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "No custom maps saved yet.";
    savedMapList.appendChild(empty);
    return;
  }
  state.customMaps.forEach((entry) => {
    const wrap = document.createElement("div");
    wrap.className = "saved-entry";
    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "tool-button saved-button";
    const thumbFrame = document.createElement("div");
    thumbFrame.className = "thumb-frame";
    const thumb = document.createElement("canvas");
    thumb.className = "thumb";
    thumb.width = 224;
    thumb.height = 126;
    drawMapThumbnail(entry, thumb);
    thumbFrame.appendChild(thumb);
    const label = document.createElement("div");
    label.innerHTML = `<strong>${entry.name}</strong><br><span>${entry.bounds?.cols || 56} x ${entry.bounds?.rows || 26} · ${entry.orientation}${entry.spawns.story ? " · story spawn" : ""}</span>`;
    loadButton.appendChild(thumbFrame);
    loadButton.appendChild(label);
    loadButton.addEventListener("click", () => loadIntoBuilder(entry));

    const actions = document.createElement("div");
    actions.className = "saved-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "button secondary";
    editButton.textContent = "Load";
    editButton.addEventListener("click", () => loadIntoBuilder(entry));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button ghost";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      state.customMaps = state.customMaps.filter((mapEntry) => mapEntry.id !== entry.id);
      if (state.currentMapId === entry.id) state.currentMapId = null;
      saveCustomMaps();
      renderSavedMapList();
      setStatus(`Deleted ${entry.name}.`);
    });

    actions.append(editButton, deleteButton);
    wrap.append(loadButton, actions);
    savedMapList.appendChild(wrap);
  });
}

function saveBuilderMap(asCopy = false) {
  try {
    if (!state.builder) resizeBuilder(Number(colsInput.value), Number(rowsInput.value), orientationInput.value);
    const name = mapNameInput.value.trim() || `Custom ${state.customMaps.length + 1}`;
    const sky = skyInput.value.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (sky.length < 2) throw new Error("Sky colors need two comma-separated hex values.");
    const platforms = compressPlatformCells(state.builder.platforms);
    if (!platforms.length) throw new Error("Add at least one platform tile before saving.");
    const saveId = !asCopy && state.currentMapId ? state.currentMapId : `custom-${Date.now()}`;
    const customMap = makeTemplate(
      saveId,
      name,
      state.builder.orientation,
      sky.slice(0, 2),
      [state.builder.goal.c, state.builder.goal.r, state.builder.goal.w],
      {
        red: [state.builder.spawns.red.c, state.builder.spawns.red.r],
        blue: [state.builder.spawns.blue.c, state.builder.spawns.blue.r],
        story: [state.builder.spawns.story.c, state.builder.spawns.story.r]
      },
      platforms,
      state.builder.presets.map((entry) => [entry.id, entry.c, entry.r, entry.rotation || 0]),
      { cols: state.builder.cols, rows: state.builder.rows }
    );
    customMap.name = name;
    const existingIndex = state.customMaps.findIndex((entry) => entry.id === saveId);
    if (existingIndex >= 0) state.customMaps.splice(existingIndex, 1, customMap);
    else state.customMaps.push(customMap);
    state.currentMapId = customMap.id;
    saveCustomMaps();
    renderSavedMapList();
    setStatus(`${asCopy ? "Saved copy" : "Saved"} ${name}. It is ready in the base game.`);
  } catch (error) {
    setStatus(error.message);
  }
}

function resetToBlank() {
  state.currentMapId = null;
  state.builder = builderDefaults(orientationInput.value, Number(colsInput.value), Number(rowsInput.value));
  state.builder.sky = skyInput.value.split(",").map((entry) => entry.trim()).filter(Boolean).slice(0, 2);
  if (state.builder.sky.length < 2) state.builder.sky = ["#10253d", "#2d4c67"];
  mapNameInput.value = "";
  setTool("platform");
  renderBoard();
  setStatus("New blank map ready.");
}

function handleBoardPointer(event) {
  const cell = event.target.closest(".cell");
  if (!cell || !state.builder) return;
  const c = Number(cell.dataset.c);
  const r = Number(cell.dataset.r);
  if (Number.isNaN(c) || Number.isNaN(r)) return;
  applyTool(c, r);
}

function boot() {
  state.customMaps = loadCustomMaps();
  renderTrapSelect();
  resetToBlank();
  renderSavedMapList();

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => setTool(button.dataset.tool));
  });

  trapSelect.addEventListener("change", () => {
    if (!state.builder) return;
    state.builder.trapId = trapSelect.value;
  });

  rotationSelect.addEventListener("change", () => {
    if (!state.builder) return;
    state.builder.rotation = Number(rotationSelect.value) || 0;
  });

  orientationInput.addEventListener("change", () => {
    resizeBuilder(Number(colsInput.value), Number(rowsInput.value), orientationInput.value);
  });

  applySizeButton.addEventListener("click", () => {
    resizeBuilder(Number(colsInput.value), Number(rowsInput.value), orientationInput.value);
    setStatus(`Builder resized to ${state.builder.cols} x ${state.builder.rows}.`);
  });

  clearMapButton.addEventListener("click", () => {
    state.builder.platforms.clear();
    state.builder.presets = [];
    renderBoard();
    setStatus("Map cleared.");
  });

  newMapButton.addEventListener("click", resetToBlank);
  saveMapButton.addEventListener("click", () => saveBuilderMap(false));
  duplicateMapButton.addEventListener("click", () => saveBuilderMap(true));

  board.addEventListener("pointerdown", (event) => {
    state.builder.dragging = true;
    handleBoardPointer(event);
  });
  board.addEventListener("pointermove", (event) => {
    if (state.builder?.dragging) handleBoardPointer(event);
  });
  window.addEventListener("pointerup", () => {
    if (state.builder) state.builder.dragging = false;
  });
}

boot();
