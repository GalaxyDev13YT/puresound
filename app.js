const APP_CONFIG = window.PURESOUND_CONFIG || {};
const DRIVE_CONFIG = APP_CONFIG.drive || {};
const DRIVE = {
  apiKey: typeof DRIVE_CONFIG.apiKey === "string" ? DRIVE_CONFIG.apiKey.trim() : "",
  rootFolderId: DRIVE_CONFIG.rootFolderId || "1eBXiNU5vMlK67JELspL6_QCVQBDSwDJ2",
};

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".wav", ".flac", ".ogg", ".aac", ".opus"];
const NAME_SEPARATORS = [" - ", " | ", " : "];
const COVER_NAMES = ["cover.jpg", "cover.jpeg", "cover.png"];
const COVER_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const CACHE_VERSION = 4;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_STORAGE_PREFIX = "puresound-cache";
const DEFAULT_TITLE = "puresound - web player";
const APP_VERSION = "3.0.0";
const VOLUME_DEFAULT = 100;
const VOLUME_MAX = 200;
const AUDIO_CACHE_NAME = "puresound-audio-v2";
const CACHE_PREF_KEY = "puresound-audio-cache-enabled";
const UI_SCALE_KEY = "puresound-ui-scale";
const NOTES_KEY = "puresound-settings-notes";
const LOCAL_COVER_URL = "https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png";
const THEMES = [
  {
    id: "ember",
    name: "Ember",
    vars: {
      "--bg-0": "#0b0f14",
      "--bg-1": "#0f1a24",
      "--bg-2": "#172533",
      "--text": "#f5f6f8",
      "--muted": "#a3b1bf",
      "--accent": "#ff7b2f",
      "--accent-2": "#2ad1c5",
    },
  },
  {
    id: "midnight",
    name: "Midnight Bloom",
    vars: {
      "--bg-0": "#0c0b1a",
      "--bg-1": "#1a1630",
      "--bg-2": "#231f3d",
      "--text": "#f5f4ff",
      "--muted": "#b2b1c8",
      "--accent": "#8a5bff",
      "--accent-2": "#ff6fb1",
    },
  },
  {
    id: "glacier",
    name: "Glacier",
    vars: {
      "--bg-0": "#07131b",
      "--bg-1": "#0e2230",
      "--bg-2": "#163245",
      "--text": "#f1f7ff",
      "--muted": "#9fb4c6",
      "--accent": "#4fb6ff",
      "--accent-2": "#8af7ff",
    },
  },
  {
    id: "circuit",
    name: "Circuit",
    vars: {
      "--bg-0": "#071512",
      "--bg-1": "#0f251f",
      "--bg-2": "#14352a",
      "--text": "#f4fff9",
      "--muted": "#9bb9ad",
      "--accent": "#41ff9a",
      "--accent-2": "#2ad1c5",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    vars: {
      "--bg-0": "#170b0b",
      "--bg-1": "#2a1216",
      "--bg-2": "#3a1c1f",
      "--text": "#fff4f0",
      "--muted": "#d4b3ab",
      "--accent": "#ff8a5b",
      "--accent-2": "#ffb86b",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    vars: {
      "--bg-0": "#0c0c0c",
      "--bg-1": "#1a1a1a",
      "--bg-2": "#262626",
      "--text": "#f5f5f5",
      "--muted": "#b1b1b1",
      "--accent": "#ffffff",
      "--accent-2": "#9ad7ff",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    vars: {
      "--bg-0": "#071120",
      "--bg-1": "#0b1e2b",
      "--bg-2": "#12303d",
      "--text": "#f3fbff",
      "--muted": "#a1b9c7",
      "--accent": "#5cffc9",
      "--accent-2": "#7a8bff",
    },
  },
  {
    id: "cinder",
    name: "Cinder",
    vars: {
      "--bg-0": "#120909",
      "--bg-1": "#1f0f10",
      "--bg-2": "#2b1516",
      "--text": "#fff2f2",
      "--muted": "#c8a8a8",
      "--accent": "#ff4d4d",
      "--accent-2": "#ffb36b",
    },
  },
  {
    id: "oasis",
    name: "Oasis",
    vars: {
      "--bg-0": "#07151c",
      "--bg-1": "#0f2330",
      "--bg-2": "#153645",
      "--text": "#f2fbff",
      "--muted": "#a2b7c8",
      "--accent": "#36e0ff",
      "--accent-2": "#47ffb0",
    },
  },
  {
    id: "slate",
    name: "Slate",
    vars: {
      "--bg-0": "#0b0f14",
      "--bg-1": "#131a23",
      "--bg-2": "#1b2430",
      "--text": "#f5f7fb",
      "--muted": "#a7b2c2",
      "--accent": "#6aa9ff",
      "--accent-2": "#88f3d0",
    },
  },
];
const state = {
  albums: [],
  tracksByAlbum: new Map(),
  currentAlbumId: null,
  currentTrackIndex: -1,
  currentTrackId: null,
  currentStreamIndex: 0,
  currentStreamUrls: [],
  filteredTracks: [],
  filteredAlbums: [],
  searchQuery: "",
  isShuffle: false,
  repeatMode: "off",
  isIndexing: false,
  nextPreloadId: null,
  nextPreloadAudio: null,
  loadingCount: 0,
  localAlbums: [],
  activeView: "library",
  cacheEnabled: false,
  isDetailOpen: false,
  uiScale: "normal",
  shuffleQueue: [],
  shuffleHistory: [],
};

const dom = {
  albumList: document.getElementById("albumList"),
  trackList: document.getElementById("trackList"),
  libraryPanel: document.getElementById("libraryPanel"),
  detailPanel: document.getElementById("detailPanel"),
  libraryTitle: document.getElementById("libraryTitle"),
  libraryMeta: document.getElementById("libraryMeta"),
  albumTitle: document.getElementById("albumTitle"),
  albumMeta: document.getElementById("albumMeta"),
  detailType: document.getElementById("detailType"),
  detailStats: document.getElementById("detailStats"),
  detailBannerImage: document.getElementById("detailBannerImage"),
  detailBannerFallback: document.getElementById("detailBannerFallback"),
  closeDetailBtn: document.getElementById("closeDetailBtn"),
  downloadAlbumBtn: document.getElementById("downloadAlbumBtn"),
  albumCount: document.getElementById("albumCount"),
  activeUsers: document.getElementById("activeUsers"),
  trackCount: document.getElementById("trackCount"),
  libraryTab: document.getElementById("libraryTab"),
  settingsTab: document.getElementById("settingsTab"),
  settingsPanel: document.getElementById("settingsPanel"),
  themeGrid: document.getElementById("themeGrid"),
  cacheToggle: document.getElementById("cacheToggle"),
  cacheCount: document.getElementById("cacheCount"),
  clearCacheBtn: document.getElementById("clearCacheBtn"),
  localUpload: document.getElementById("localUpload"),
  localCount: document.getElementById("localCount"),
  versionCounter: document.getElementById("versionCounter"),
  uiScaleSwitch: document.getElementById("uiScaleSwitch"),
  uiScaleValue: document.getElementById("uiScaleValue"),
  settingsNotes: document.getElementById("settingsNotes"),
  status: document.getElementById("status"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingText: document.getElementById("loadingText"),
  reloadBtn: document.getElementById("reloadBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  repeatBtn: document.getElementById("repeatBtn"),
  repeatOneBadge: document.getElementById("repeatOneBadge"),
  downloadBtn: document.getElementById("downloadBtn"),
  librarySearch: document.getElementById("librarySearch"),
  nowTitle: document.getElementById("nowTitle"),
  nowSub: document.getElementById("nowSub"),
  art: document.getElementById("art"),
  artImage: document.getElementById("artImage"),
  artInitials: document.getElementById("artInitials"),
  playBtn: document.getElementById("playBtn"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  seekBar: document.getElementById("seekBar"),
  currentTime: document.getElementById("currentTime"),
  duration: document.getElementById("duration"),
  volumeSlider: document.getElementById("volumeSlider"),
  volumeIcon: document.getElementById("volumeIcon"),
  volumeValue: document.getElementById("volumeValue"),
  audio: document.getElementById("audio"),
  setup: document.getElementById("setup"),
};

let searchToken = 0;
let cacheWriteTimer = null;
let cacheStatsTimer = null;
let activeThemeId = null;
const preloadedTrackIds = new Set();
const preloadingTrackIds = new Set();

let audioContext = null;
let mediaSource = null;
let gainNode = null;
let volumeBoostSupported = false;
let pendingVolume = VOLUME_DEFAULT / 100;
const boundLiquidNodes = new WeakSet();
let liquidSceneFrame = null;
let liquidSceneX = window.innerWidth * 0.5;
let liquidSceneY = window.innerHeight * 0.24;


function setStatus(message) {
  dom.status.textContent = message;
}

function setRangeFill(element, percent) {
  if (!element) return;
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  element.style.setProperty("--range-fill", `${clamped}%`);
}

function bindLiquidNode(node) {
  if (!node || boundLiquidNodes.has(node)) return;
  boundLiquidNodes.add(node);
  node.style.setProperty("--glow-x", "50%");
  node.style.setProperty("--glow-y", "50%");
  node.style.setProperty("--tilt-x", "0deg");
  node.style.setProperty("--tilt-y", "0deg");

  node.addEventListener("pointermove", (event) => {
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const tiltX = ((0.5 - py) * 8).toFixed(2);
    const tiltY = ((px - 0.5) * 10).toFixed(2);

    node.style.setProperty("--glow-x", `${Math.round(px * 100)}%`);
    node.style.setProperty("--glow-y", `${Math.round(py * 100)}%`);
    node.style.setProperty("--tilt-x", `${tiltX}deg`);
    node.style.setProperty("--tilt-y", `${tiltY}deg`);
    node.classList.add("is-tilting");
  }, { passive: true });

  node.addEventListener("pointerleave", () => {
    node.style.setProperty("--glow-x", "50%");
    node.style.setProperty("--glow-y", "50%");
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
    node.classList.remove("is-tilting");
  });
}

function bindLiquidNodes(root = document) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll("[data-liquid]").forEach(bindLiquidNode);
}

function flushLiquidScene() {
  liquidSceneFrame = null;
  const x = Math.max(0, Math.min(window.innerWidth, liquidSceneX));
  const y = Math.max(0, Math.min(window.innerHeight, liquidSceneY));
  const xPercent = window.innerWidth ? (x / window.innerWidth) * 100 : 50;
  const yPercent = window.innerHeight ? (y / window.innerHeight) * 100 : 24;
  const shiftX = ((xPercent - 50) / 50) * 18;
  const shiftY = ((yPercent - 40) / 40) * 14;

  document.documentElement.style.setProperty("--pointer-x", `${xPercent}%`);
  document.documentElement.style.setProperty("--pointer-y", `${yPercent}%`);
  document.documentElement.style.setProperty("--scene-shift-x", `${shiftX}px`);
  document.documentElement.style.setProperty("--scene-shift-y", `${shiftY}px`);
}

function queueLiquidScene(x, y) {
  liquidSceneX = x;
  liquidSceneY = y;
  if (liquidSceneFrame) return;
  liquidSceneFrame = window.requestAnimationFrame(flushLiquidScene);
}

function initLiquidGlass() {
  bindLiquidNodes(document);
  flushLiquidScene();
  window.addEventListener("pointermove", (event) => {
    queueLiquidScene(event.clientX, event.clientY);
  }, { passive: true });
  window.addEventListener("resize", () => {
    queueLiquidScene(window.innerWidth * 0.5, window.innerHeight * 0.24);
  });
}

function slugify(value) {
  const normalized = normalizeText(value);
  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug || "uploads";
}

function setView(view) {
  if (view !== "library" && state.isDetailOpen) {
    closeAlbumDetail();
  }
  state.activeView = view;
  document.body.classList.toggle("view-settings", view === "settings");
  document.body.classList.toggle("detail-open", view === "library" && state.isDetailOpen);
  if (dom.libraryTab) {
    dom.libraryTab.classList.toggle("active", view === "library");
    dom.libraryTab.setAttribute("aria-pressed", view === "library" ? "true" : "false");
  }
  if (dom.settingsTab) {
    dom.settingsTab.classList.toggle("active", view === "settings");
    dom.settingsTab.setAttribute("aria-pressed", view === "settings" ? "true" : "false");
  }
}

function updateThemeSelection() {
  if (!dom.themeGrid) return;
  const cards = dom.themeGrid.querySelectorAll(".theme-card");
  cards.forEach((card) => {
    card.classList.toggle("active", card.dataset.themeId === activeThemeId);
  });
}

function applyTheme(themeId) {
  const theme = THEMES.find((item) => item.id === themeId) || THEMES[0];
  if (!theme) return;
  activeThemeId = theme.id;
  Object.entries(theme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  try {
    localStorage.setItem("puresound-theme", theme.id);
  } catch (error) {
    // Ignore storage errors.
  }
  updateThemeSelection();
}

function renderThemes() {
  if (!dom.themeGrid) return;
  dom.themeGrid.innerHTML = "";
  THEMES.forEach((theme) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "theme-card";
    card.dataset.themeId = theme.id;
    card.setAttribute("data-liquid", "");

    const swatch = document.createElement("div");
    swatch.className = "theme-swatch";
    swatch.style.background = `linear-gradient(135deg, ${theme.vars["--accent"]}, ${theme.vars["--accent-2"]})`;

    const name = document.createElement("div");
    name.className = "theme-name";
    name.textContent = theme.name;

    card.appendChild(swatch);
    card.appendChild(name);
    card.addEventListener("click", () => applyTheme(theme.id));

    dom.themeGrid.appendChild(card);
    bindLiquidNode(card);
  });
  updateThemeSelection();
}

function initThemes() {
  renderThemes();
  let saved = null;
  try {
    saved = localStorage.getItem("puresound-theme");
  } catch (error) {
    saved = null;
  }
  const theme = THEMES.find((item) => item.id === saved);
  applyTheme(theme ? theme.id : "glacier");
}

function formatUiScaleLabel(scale) {
  if (scale === "compact") return "Compact";
  if (scale === "large") return "Large";
  return "Normal";
}

function updateUiScaleSelection() {
  if (!dom.uiScaleSwitch) return;
  const buttons = dom.uiScaleSwitch.querySelectorAll("[data-scale]");
  buttons.forEach((button) => {
    const active = button.dataset.scale === state.uiScale;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (dom.uiScaleValue) {
    dom.uiScaleValue.textContent = formatUiScaleLabel(state.uiScale);
  }
}

function applyUiScale(scale) {
  const next = ["compact", "normal", "large"].includes(scale) ? scale : "normal";
  state.uiScale = next;
  document.body.dataset.uiScale = next;
  try {
    localStorage.setItem(UI_SCALE_KEY, next);
  } catch (error) {
    // Ignore storage errors.
  }
  updateUiScaleSelection();
}

function initUiScale() {
  let saved = "normal";
  try {
    saved = localStorage.getItem(UI_SCALE_KEY) || "normal";
  } catch (error) {
    saved = "normal";
  }
  applyUiScale(saved);
}

function loadSettingsNotes() {
  if (!dom.settingsNotes) return;
  let saved = "";
  try {
    saved = localStorage.getItem(NOTES_KEY) || "";
  } catch (error) {
    saved = "";
  }
  dom.settingsNotes.value = saved;
}

function saveSettingsNotes(value) {
  try {
    localStorage.setItem(NOTES_KEY, value || "");
  } catch (error) {
    // Ignore storage errors.
  }
}

function sendSwMessage(payload) {
  if (!("serviceWorker" in navigator)) return;
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(payload);
    return;
  }
  navigator.serviceWorker.ready
    .then((registration) => {
      if (registration.active) {
        registration.active.postMessage(payload);
      }
    })
    .catch(() => {});
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  if (window.location.protocol === "file:") return null;
  try {
    return await navigator.serviceWorker.register("sw.js");
  } catch (error) {
    console.warn("Service worker registration failed", error);
    return null;
  }
}

async function updateCacheStats() {
  if (!dom.cacheCount) return;
  if (!("caches" in window)) {
    dom.cacheCount.textContent = "�";
    return;
  }
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const keys = await cache.keys();
    dom.cacheCount.textContent = keys.length.toString();
  } catch (error) {
    dom.cacheCount.textContent = "0";
  }
}

function applyCachePreference(enabled) {
  state.cacheEnabled = enabled;
  if (dom.cacheToggle) {
    dom.cacheToggle.checked = enabled;
  }
  try {
    localStorage.setItem(CACHE_PREF_KEY, enabled ? "1" : "0");
  } catch (error) {
    // Ignore storage errors.
  }
  sendSwMessage({ type: "SET_CACHING", enabled });
  updateCacheStats();
}

function scheduleCacheStatsUpdate() {
  if (!state.cacheEnabled) return;
  if (cacheStatsTimer) {
    clearTimeout(cacheStatsTimer);
  }
  cacheStatsTimer = window.setTimeout(() => {
    updateCacheStats();
  }, 1500);
}

async function clearAudioCache() {
  if (!confirm("Clear cached audio for this device?")) return;
  if ("caches" in window) {
    await caches.delete(AUDIO_CACHE_NAME);
  }
  sendSwMessage({ type: "CLEAR_CACHE" });
  await updateCacheStats();
  alert("Cache cleared.");
}

function updateLocalStats() {
  if (!dom.localCount) return;
  let count = 0;
  state.tracksByAlbum.forEach((tracks) => {
    if (tracks.some((track) => track.isLocal)) {
      count += tracks.length;
    }
  });
  dom.localCount.textContent = count.toString();
}

function addLocalFiles(fileList) {
  if (!fileList || !fileList.length) return;
  const files = Array.from(fileList);
  const audioFiles = files.filter((file) => isAudioFile({ name: file.name, mimeType: file.type }));
  if (!audioFiles.length) {
    setStatus("No supported audio files found in that folder.");
    return;
  }

  const localAlbumsById = new Map((state.localAlbums || []).map((album) => [album.id, album]));
  const albumTracks = new Map();

  audioFiles.forEach((file) => {
    const relPath = file.webkitRelativePath || file.name;
    const parts = relPath.split("/");
    const folderName = parts.length > 1 ? parts[0] : "Local Uploads";
    const albumId = local-;
    let album = localAlbumsById.get(albumId);
    if (!album) {
      const info = splitAlbumName(folderName);
      album = {
        id: albumId,
        rawName: info.rawName,
        displayName: info.displayName || folderName,
        artist: info.artist,
        trackCount: 0,
        coverId: "",
        coverUrl: LOCAL_COVER_URL,
        coverFallbacks: [],
        isLocal: true,
        isSingle: false,
      };
      localAlbumsById.set(albumId, album);
    }

    const trackInfo = parseTrackInfo(file.name, album.artist);
    const streamUrl = URL.createObjectURL(file);
    const track = {
      id: local---,
      name: file.name,
      title: trackInfo.title,
      artist: trackInfo.artist,
      mimeType: file.type,
      size: file.size,
      albumId: album.id,
      albumName: album.displayName,
      coverUrl: album.coverUrl,
      coverFallbacks: [],
      index: 0,
      streamUrl,
      downloadUrl: streamUrl,
      streamUrls: [streamUrl],
      isLocal: true,
    };

    const list = albumTracks.get(albumId) || [];
    list.push(track);
    albumTracks.set(albumId, list);
  });

  albumTracks.forEach((tracks, albumId) => {
    tracks.sort((a, b) => a.name.localeCompare(b.name));
    tracks.forEach((track, index) => {
      track.index = index;
    });
    state.tracksByAlbum.set(albumId, tracks);
    const album = localAlbumsById.get(albumId);
    if (album) {
      album.trackCount = tracks.length;
    }
  });

  state.localAlbums = Array.from(localAlbumsById.values());
  state.albums = state.albums.filter((album) => !album.isLocal).concat(state.localAlbums);
  if (!state.searchQuery) {
    state.filteredAlbums = state.albums.slice();
  }
  updateLocalStats();
  updateStats();
  renderAlbums();
  updateLibrarySummary();
  if (state.currentAlbumId) {
    updateAlbumHeaderForSelection();
  }
  setStatus(`Loaded ${audioFiles.length} local track${audioFiles.length === 1 ? "" : "s"}.`);
}
function getCacheKey() {
  return `${CACHE_STORAGE_PREFIX}-${CACHE_VERSION}-${DRIVE.rootFolderId}`;
}

function readCache() {
  try {
    const raw = localStorage.getItem(getCacheKey());
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || payload.version !== CACHE_VERSION) return null;
    if (!payload.savedAt || Date.now() - payload.savedAt > CACHE_TTL_MS) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

function writeCache() {
  try {
    const tracksByAlbum = {};
    state.tracksByAlbum.forEach((tracks, albumId) => {
      if (tracks.some((track) => track.isLocal)) return;
      tracksByAlbum[albumId] = tracks;
    });
    const albums = state.albums.filter((album) => !album.isLocal);
    const payload = {
      version: CACHE_VERSION,
      savedAt: Date.now(),
      albums,
      tracksByAlbum,
    };
    localStorage.setItem(getCacheKey(), JSON.stringify(payload));
  } catch (error) {
    // Ignore cache errors (private mode, quota, etc).
  }
}
function clearCache() {
  try {
    localStorage.removeItem(getCacheKey());
  } catch (error) {
    // Ignore cache errors.
  }
}
function scheduleCacheWrite() {
  if (cacheWriteTimer) return;
  cacheWriteTimer = window.setTimeout(() => {
    cacheWriteTimer = null;
    writeCache();
  }, 1500);
}

function restoreCache(payload) {
  if (!payload || !Array.isArray(payload.albums)) return false;
  const localAlbums = Array.isArray(state.localAlbums) ? state.localAlbums : [];
  state.albums = payload.albums;
  if (localAlbums.length) {
    state.albums = state.albums.concat(localAlbums);
  }
  state.filteredAlbums = state.albums.slice();
  const tracksMap = new Map();
  if (payload.tracksByAlbum && typeof payload.tracksByAlbum === "object") {
    Object.entries(payload.tracksByAlbum).forEach(([albumId, tracks]) => {
      if (Array.isArray(tracks)) {
        tracksMap.set(albumId, tracks);
      }
    });
  }
  state.tracksByAlbum = tracksMap;
  state.albums.forEach((album) => {
    const tracks = state.tracksByAlbum.get(album.id);
    if (tracks) {
      album.trackCount = tracks.length;
    }
  });
  state.filteredTracks = state.currentAlbumId ? getCurrentTracks().slice() : [];
  updateStats();
  renderAlbums();
  renderTracks();
  if (!state.searchQuery) {
    updateAlbumHeaderForSelection();
  }
  return true;
}
function showSetup(show) {
  dom.setup.classList.toggle("active", show);
}
function beginLoading(message) {
  state.loadingCount += 1;
  if (dom.loadingText && message) {
    dom.loadingText.textContent = message;
  }
  if (dom.loadingOverlay) {
    dom.loadingOverlay.classList.add("active");
    dom.loadingOverlay.setAttribute("aria-hidden", "false");
  }
  document.body.setAttribute("aria-busy", "true");
}

function endLoading() {
  state.loadingCount = Math.max(0, state.loadingCount - 1);
  if (state.loadingCount === 0) {
    if (dom.loadingOverlay) {
      dom.loadingOverlay.classList.remove("active");
      dom.loadingOverlay.setAttribute("aria-hidden", "true");
    }
    document.body.removeAttribute("aria-busy");
  }
}

function isAudioFile(file) {
  if (file.mimeType && file.mimeType.startsWith("audio/")) {
    return true;
  }
  const name = file.name ? file.name.toLowerCase() : "";
  return AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function resolveShortcut(file) {
  if (!file || file.mimeType !== "application/vnd.google-apps.shortcut") {
    return file;
  }
  const details = file.shortcutDetails || {};
  if (!details.targetId) return file;
  return {
    ...file,
    id: details.targetId,
    mimeType: details.targetMimeType || file.mimeType,
    resourceKey: details.targetResourceKey || file.resourceKey || "",
    webContentLink: "",
    shortcutId: file.id,
    isShortcut: true,
  };
}

function stripExtension(name) {
  const lastDot = name.lastIndexOf(".");
  return lastDot > 0 ? name.slice(0, lastDot) : name;
}

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function splitAlbumName(name) {
  const trimmed = (name || "").trim();
  for (const separator of NAME_SEPARATORS) {
    const idx = trimmed.indexOf(separator);
    if (idx > 0) {
      const artist = trimmed.slice(0, idx).trim();
      const album = trimmed.slice(idx + separator.length).trim();
      if (artist && album) {
        return {
          rawName: trimmed,
          displayName: album,
          artist,
        };
      }
    }
  }
  return {
    rawName: trimmed,
    displayName: trimmed || "Untitled Album",
    artist: "",
  };
}

function parseTrackInfo(fileName, albumArtist) {
  const base = stripExtension(fileName).trim();
  for (const separator of NAME_SEPARATORS) {
    const idx = base.indexOf(separator);
    if (idx > 0) {
      const left = base.slice(0, idx).trim();
      const right = base.slice(idx + separator.length).trim();
      if (!right) {
        continue;
      }
      if (/^\d+(?:[.-]\d+)?$/.test(left)) {
        return {
          title: right,
          artist: albumArtist || "",
        };
      }
      return {
        title: right,
        artist: left,
      };
    }
  }

  return {
    title: base || fileName,
    artist: albumArtist || "",
  };
}

function getInitials(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return "PS";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (!parts.length) return "PS";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const size = Number(bytes);
  if (!Number.isFinite(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function buildStreamUrl(fileId) {
  if (!DRIVE.apiKey) return "";
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE.apiKey}&supportsAllDrives=true&acknowledgeAbuse=true`;
}

function appendResourceKey(url, resourceKey = "") {
  if (!url || !resourceKey) return url;
  const next = new URL(url, window.location.href);
  if (!next.searchParams.has("resourcekey")) {
    next.searchParams.set("resourcekey", resourceKey);
  }
  return next.toString();
}

function buildDownloadUrl(fileId, resourceKey = "") {
  return appendResourceKey(`https://drive.google.com/uc?export=download&id=${fileId}`, resourceKey);
}

function buildOpenUrl(fileId, resourceKey = "") {
  return appendResourceKey(`https://drive.google.com/uc?export=open&id=${fileId}`, resourceKey);
}

function buildStreamCandidates(file) {
  const fileId = typeof file === "string" ? file : file && file.id;
  const resourceKey = typeof file === "object" && file ? file.resourceKey || "" : "";
  const webContentLink = typeof file === "object" && file ? file.webContentLink || "" : "";
  if (!fileId) return [];

  const urls = [];
  if (resourceKey && webContentLink) {
    urls.push(webContentLink);
  }
  urls.push(buildStreamUrl(fileId));
  if (webContentLink) {
    urls.push(webContentLink);
  }
  urls.push(buildOpenUrl(fileId, resourceKey));
  urls.push(buildDownloadUrl(fileId, resourceKey));
  return Array.from(new Set(urls.filter(Boolean)));
}

function isApiStreamUrl(url = "") {
  return typeof url === "string" && url.includes("www.googleapis.com/drive/v3/files/");
}

function isCorsSafeAudioUrl(url = "") {
  if (!url) return false;
  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return true;
  }
  if (isApiStreamUrl(url)) {
    return true;
  }
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin;
  } catch (error) {
    return false;
  }
}

function configureMediaElementSource(media, url) {
  if (!media || !url) return;
  if (isApiStreamUrl(url)) {
    media.crossOrigin = "anonymous";
  } else {
    media.removeAttribute("crossorigin");
  }
  media.src = url;
}

function getTrackStreamUrls(track) {
  if (!track) return [];
  const candidates = Array.isArray(track.streamUrls) && track.streamUrls.length ? track.streamUrls : [track.streamUrl];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function prioritizeTrackStreamUrl(track, workingUrl) {
  if (!track || !workingUrl) return;
  const urls = getTrackStreamUrls(track).filter((url) => url !== workingUrl);
  track.streamUrl = workingUrl;
  track.streamUrls = [workingUrl, ...urls];
}

function getNextStreamUrl() {
  if (!Array.isArray(state.currentStreamUrls)) return null;
  if (state.currentStreamIndex >= state.currentStreamUrls.length - 1) return null;
  state.currentStreamIndex += 1;
  return state.currentStreamUrls[state.currentStreamIndex];
}

function resetAudioGraph() {
  if (mediaSource) {
    try {
      mediaSource.disconnect();
    } catch (error) {
      // Ignore disconnect errors.
    }
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch (error) {
      // Ignore disconnect errors.
    }
  }
  mediaSource = null;
  gainNode = null;
  volumeBoostSupported = false;
}

function replaceAudioElement() {
  const current = dom.audio;
  if (!current || !current.parentNode) {
    return current;
  }

  const replacement = current.cloneNode(false);
  replacement.id = current.id;
  replacement.preload = current.preload || "auto";
  current.parentNode.replaceChild(replacement, current);
  dom.audio = replacement;
  resetAudioGraph();
  attachAudioEventHandlers(replacement);
  return replacement;
}

function setAudioSource(url) {
  if (mediaSource && !isCorsSafeAudioUrl(url)) {
    replaceAudioElement();
  }
  configureMediaElementSource(dom.audio, url);
  dom.audio.load();
  applyVolume();
}

function buildCoverThumbUrl(fileId, resourceKey = "") {
  return appendResourceKey(`https://drive.google.com/thumbnail?id=${fileId}&sz=w300`, resourceKey);
}

function buildCoverViewUrl(fileId, resourceKey = "") {
  return appendResourceKey(`https://drive.google.com/uc?export=view&id=${fileId}`, resourceKey);
}

async function listFiles({ q, fields, orderBy }) {
  const files = [];
  let pageToken = "";

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", q);
    url.searchParams.set("fields", `nextPageToken, files(${fields})`);
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("key", DRIVE.apiKey);
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    if (orderBy) {
      url.searchParams.set("orderBy", orderBy);
    }
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      const message = data && data.error && data.error.message ? data.error.message : "Drive API error";
      throw new Error(message);
    }

    if (Array.isArray(data.files)) {
      files.push(...data.files);
    }

    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return files;
}

function isCoverCandidate(file) {
  const name = (file.name || "").toLowerCase();
  const hasExt = COVER_EXTENSIONS.some((ext) => name.endsWith(ext));
  const isImage = file.mimeType && file.mimeType.startsWith("image/");
  return hasExt || isImage;
}

function pickCoverFile(files) {
  const candidates = files.filter(isCoverCandidate);
  if (!candidates.length) return null;
  const exact = candidates.find((file) => COVER_NAMES.includes((file.name || "").toLowerCase()));
  if (exact) return exact;
  const contains = candidates.find((file) => (file.name || "").toLowerCase().includes("cover"));
  return contains || candidates[0];
}

function setImageSource(img, primaryUrl, fallbackUrls) {
  if (!img) return;
  img.onerror = null;
  if (!primaryUrl) {
    img.removeAttribute("src");
    img.classList.add("hidden");
    return;
  }
  img.classList.remove("hidden");
  const fallbacks = Array.isArray(fallbackUrls)
    ? fallbackUrls.filter(Boolean)
    : [fallbackUrls].filter(Boolean);
  img.dataset.fallbacks = JSON.stringify(fallbacks);
  img.onerror = () => {
    const list = JSON.parse(img.dataset.fallbacks || "[]");
    if (list.length) {
      const next = list.shift();
      img.dataset.fallbacks = JSON.stringify(list);
      img.src = next;
    } else {
      img.classList.add("hidden");
    }
  };
  img.src = primaryUrl;
}

function setArt(coverUrl, fallbackText, coverFallbacks) {
  if (!dom.artImage || !dom.artInitials) return;
  if (coverUrl) {
    setImageSource(dom.artImage, coverUrl, coverFallbacks);
    dom.artInitials.classList.add("hidden");
  } else {
    setImageSource(dom.artImage, "", []);
    dom.artInitials.textContent = fallbackText;
    dom.artInitials.classList.remove("hidden");
  }
}

function setDetailArt(coverUrl, fallbackText, coverFallbacks) {
  if (!dom.detailBannerImage || !dom.detailBannerFallback) return;
  if (coverUrl) {
    setImageSource(dom.detailBannerImage, coverUrl, coverFallbacks);
    dom.detailBannerImage.classList.remove("hidden");
  } else {
    setImageSource(dom.detailBannerImage, "", []);
    dom.detailBannerImage.classList.add("hidden");
  }
  dom.detailBannerFallback.textContent = fallbackText;
}

function updateLibrarySummary(title = "Open the grid. Enter the release.", meta = "Albums and root-level singles live in one library. Open any card to step into the fullscreen release view, then click a track to start playback.") {
  if (dom.libraryTitle) {
    dom.libraryTitle.textContent = title;
  }
  if (dom.libraryMeta) {
    dom.libraryMeta.textContent = meta;
  }
}

function getSelectedAlbum() {
  return state.albums.find((item) => item.id === state.currentAlbumId) || null;
}

function getAlbumTypeLabel(album) {
  return album && album.isSingle ? "Single" : "Album";
}

function updateDownloadAlbumButton() {
  if (!dom.downloadAlbumBtn) return;
  const album = getSelectedAlbum();
  const tracks = getCurrentTracks();
  const hasTracks = Boolean(album && tracks.length);
  dom.downloadAlbumBtn.disabled = !hasTracks;
  dom.downloadAlbumBtn.textContent = album && album.isSingle ? "Download single" : "Download release";
}

function openAlbumDetail(album) {
  if (!dom.detailPanel) return;
  if (album && album.id) {
    state.currentAlbumId = album.id;
  }
  state.isDetailOpen = true;
  dom.detailPanel.classList.add("active");
  dom.detailPanel.setAttribute("aria-hidden", "false");
  if (state.activeView === "library") {
    document.body.classList.add("detail-open");
  }
  updateAlbumHeaderForSelection();
  updateDownloadAlbumButton();
}

function closeAlbumDetail() {
  state.isDetailOpen = false;
  if (dom.detailPanel) {
    dom.detailPanel.classList.remove("active");
    dom.detailPanel.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("detail-open");
}

function buildTrackRecord(file, album, index) {
  const info = parseTrackInfo(file.name, album.artist);
  const streamUrls = buildStreamCandidates(file);
  return {
    id: file.id,
    name: file.name,
    title: info.title,
    artist: info.artist,
    mimeType: file.mimeType,
    size: file.size,
    albumId: album.id,
    albumName: album.displayName,
    coverUrl: album.coverUrl || "",
    coverFallbacks: album.coverFallbacks || [],
    index,
    resourceKey: file.resourceKey || "",
    webContentLink: file.webContentLink || "",
    streamUrl: streamUrls[0],
    downloadUrl: buildDownloadUrl(file.id, file.resourceKey),
    streamUrls,
  };
}

function pickSingleCoverFile(singleFile, files) {
  if (!singleFile || !Array.isArray(files)) return null;
  const audioBase = stripExtension(singleFile.name).toLowerCase();
  const images = files.filter(isCoverCandidate);
  if (!images.length) return null;
  const exact = images.find((file) => stripExtension(file.name).toLowerCase() === audioBase);
  if (exact) return exact;
  const similar = images.find((file) => {
    const imageBase = stripExtension(file.name).toLowerCase();
    return imageBase.includes(audioBase) || audioBase.includes(imageBase);
  });
  if (similar) return similar;
  return images.length === 1 ? images[0] : null;
}

function shuffleIndices(tracks, excludedIndex) {
  const values = tracks
    .map((_, index) => index)
    .filter((index) => index !== excludedIndex);
  for (let i = values.length - 1; i > 0; i -= 1) {
    const next = Math.floor(Math.random() * (i + 1));
    const temp = values[i];
    values[i] = values[next];
    values[next] = temp;
  }
  return values;
}

function resetShuffleSession(track = getCurrentTrack()) {
  if (!state.isShuffle) {
    state.shuffleQueue = [];
    state.shuffleHistory = [];
    return;
  }
  const tracks = getCurrentTracks();
  if (!tracks.length) {
    state.shuffleQueue = [];
    state.shuffleHistory = [];
    return;
  }
  const currentIndex = track ? track.index : state.currentTrackIndex;
  state.shuffleQueue = shuffleIndices(tracks, currentIndex);
  state.shuffleHistory = Number.isFinite(currentIndex) && currentIndex >= 0 ? [currentIndex] : [];
}

function getNextShuffleIndex() {
  const tracks = getCurrentTracks();
  if (!tracks.length) return null;
  if (!state.shuffleQueue.length) {
    if (state.repeatMode !== "all") {
      return null;
    }
    state.shuffleQueue = shuffleIndices(tracks, state.currentTrackIndex);
  }
  const nextIndex = state.shuffleQueue.shift();
  if (Number.isFinite(nextIndex)) {
    state.shuffleHistory.push(nextIndex);
    return nextIndex;
  }
  return null;
}

function getPreviousShuffleIndex() {
  if (state.shuffleHistory.length <= 1) {
    return null;
  }
  const currentIndex = state.shuffleHistory.pop();
  if (Number.isFinite(currentIndex)) {
    state.shuffleQueue.unshift(currentIndex);
  }
  return state.shuffleHistory[state.shuffleHistory.length - 1] ?? null;
}

function updateStats() {
  if (dom.albumCount) {
    dom.albumCount.textContent = state.albums.length.toString();
  }
  let totalTracks = 0;
  state.tracksByAlbum.forEach((tracks) => {
    totalTracks += tracks.length;
  });
  if (dom.trackCount) {
    dom.trackCount.textContent = totalTracks.toString();
  }
}

function getVisibleAlbums() {
  return state.searchQuery ? state.filteredAlbums : state.albums;
}

function getCurrentTracks() {
  if (!state.currentAlbumId) return [];
  return state.tracksByAlbum.get(state.currentAlbumId) || [];
}

function getCurrentTrack() {
  if (!state.currentTrackId) return null;
  for (const tracks of state.tracksByAlbum.values()) {
    const track = tracks.find((item) => item.id === state.currentTrackId);
    if (track) {
      return track;
    }
  }
  return null;
}

function sanitizeFileName(name) {
  return (name || "track").replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").trim() || "track";
}

function downloadTrack(track, { silent = false } = {}) {
  if (!track) {
    setStatus("Pick a track to download.");
    return;
  }

  const link = document.createElement("a");
  link.href = track.downloadUrl || track.streamUrl;
  link.rel = "noopener";
  link.download = sanitizeFileName(track.name || track.title || "track");
  if (!track.isLocal) {
    link.target = "_blank";
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (!silent) {
    setStatus(`Downloading ${track.title}...`);
  }
}

function downloadAlbum() {
  const album = getSelectedAlbum();
  const tracks = getCurrentTracks();
  if (!album || !tracks.length) {
    setStatus("Open a release first.");
    return;
  }

  if (tracks.length > 1) {
    alert("Puresound will start one download per track for this release.");
  }

  tracks.forEach((track, index) => {
    window.setTimeout(() => {
      downloadTrack(track, { silent: true });
    }, index * 180);
  });
  setStatus(`Starting download for ${album.displayName}.`);
}

function downloadCurrentTrack() {
  downloadTrack(getCurrentTrack());
}

function renderAlbums() {
  dom.albumList.innerHTML = "";

  const albums = getVisibleAlbums();
  if (!albums.length) {
    const empty = document.createElement("div");
    empty.className = "meta";
    empty.textContent = state.searchQuery
      ? "No albums or singles match your search."
      : "No albums or singles found in this folder.";
    dom.albumList.appendChild(empty);
    return;
  }

  albums.forEach((album) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "album-card";
    card.setAttribute("data-liquid", "");
    if (album.id === state.currentAlbumId) {
      card.classList.add("active");
    }

    const fallback = document.createElement("div");
    fallback.className = "album-card-fallback";
    fallback.textContent = getInitials(album.artist || album.displayName || "PS");

    const image = document.createElement("img");
    image.className = "album-card-image";
    image.alt = album.displayName ? `${album.displayName} cover` : "Release cover";
    setImageSource(image, album.coverUrl, album.coverFallbacks);

    const overlay = document.createElement("div");
    overlay.className = "album-card-overlay";

    const top = document.createElement("div");
    top.className = "album-card-top";
    if (album.isSingle) {
      const badge = document.createElement("span");
      badge.className = "album-card-badge";
      badge.textContent = "Single";
      top.appendChild(badge);
    } else {
      top.appendChild(document.createElement("span"));
    }

    const count = document.createElement("span");
    count.className = "album-card-count";
    count.textContent = `${album.trackCount ?? "-"} ${album.trackCount === 1 ? "track" : "tracks"}`;
    top.appendChild(count);

    const bottom = document.createElement("div");
    bottom.className = "album-card-bottom";

    const title = document.createElement("div");
    title.className = "album-card-title";
    title.textContent = album.displayName;

    const meta = document.createElement("div");
    meta.className = "album-card-meta";
    const metaParts = [];
    if (album.artist) metaParts.push(album.artist);
    metaParts.push(getAlbumTypeLabel(album));
    metaParts.forEach((part) => {
      const span = document.createElement("span");
      span.textContent = part;
      meta.appendChild(span);
    });

    bottom.appendChild(title);
    bottom.appendChild(meta);
    overlay.appendChild(top);
    overlay.appendChild(bottom);

    card.appendChild(fallback);
    card.appendChild(image);
    card.appendChild(overlay);
    card.addEventListener("click", () => selectAlbum(album.id));
    bindLiquidNode(card);
    dom.albumList.appendChild(card);
  });
}

function renderTracks() {
  dom.trackList.innerHTML = "";
  const album = getSelectedAlbum();

  if (!album) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const title = document.createElement("div");
    title.className = "empty-title";
    title.textContent = "How to use puresound";

    const hint = document.createElement("p");
    hint.className = "meta";
    hint.textContent = "Open an album or single from the library grid, then click a track to start playback.";

    const steps = document.createElement("ul");
    steps.className = "empty-steps";
    const stepData = [
      "Browse the 4-column library grid for albums and singles.",
      "Open any release to view its banner and track list full screen.",
      "Click a track to play it, or use the footer controls to move through the queue.",
      "Use search to narrow by song, artist, album, or single name.",
    ];
    stepData.forEach((text, index) => {
      const item = document.createElement("li");
      const badge = document.createElement("span");
      badge.textContent = `${index + 1}`;
      const copy = document.createElement("p");
      copy.textContent = text;
      item.appendChild(badge);
      item.appendChild(copy);
      steps.appendChild(item);
    });

    empty.appendChild(title);
    empty.appendChild(hint);
    empty.appendChild(steps);
    dom.trackList.appendChild(empty);
    return;
  }

  const tracks = state.searchQuery ? state.filteredTracks : getCurrentTracks();
  if (!tracks.length) {
    const empty = document.createElement("div");
    empty.className = "meta";
    empty.textContent = state.searchQuery
      ? "No tracks in this release match your search."
      : "No tracks available for this release.";
    dom.trackList.appendChild(empty);
    return;
  }

  tracks.forEach((track) => {
    const row = document.createElement("div");
    row.className = "track-row";
    row.setAttribute("data-liquid", "");
    if (track.id === state.currentTrackId) {
      row.classList.add("active");
    }

    const main = document.createElement("div");
    main.className = "track-row-main";

    const index = document.createElement("div");
    index.className = "track-index";
    index.textContent = `${track.index + 1}`.padStart(2, "0");

    const cover = document.createElement("div");
    cover.className = "track-cover";
    const coverFallback = document.createElement("div");
    coverFallback.className = "track-cover-fallback";
    coverFallback.textContent = getInitials(track.artist || track.albumName || track.title);
    const coverImage = document.createElement("img");
    coverImage.alt = track.albumName ? `${track.albumName} cover` : "Release cover";
    setImageSource(coverImage, track.coverUrl, track.coverFallbacks);
    cover.appendChild(coverFallback);
    cover.appendChild(coverImage);

    const info = document.createElement("div");
    info.className = "track-info";

    const title = document.createElement("div");
    title.className = "track-title";
    title.textContent = track.title;

    const meta = document.createElement("div");
    meta.className = "track-meta";
    const metaParts = [];
    if (track.artist) metaParts.push(track.artist);
    if (track.mimeType) metaParts.push(track.mimeType.replace("audio/", "").toUpperCase());
    const size = formatBytes(track.size);
    if (size) metaParts.push(size);
    meta.textContent = metaParts.join(" - ") || "Audio";

    info.appendChild(title);
    info.appendChild(meta);
    main.appendChild(index);
    main.appendChild(cover);
    main.appendChild(info);

    const endcap = document.createElement("div");
    endcap.className = "track-endcap";

    const label = document.createElement("span");
    label.textContent = album.isSingle ? "Single" : "Track";

    const download = document.createElement("button");
    download.type = "button";
    download.className = "track-download";
    download.setAttribute("aria-label", `Download ${track.title}`);
    download.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v9.17l2.59-2.58L17 11l-5 5-5-5 1.41-1.41L11 12.17V3zm-7 14h16v4H4v-4z"></path></svg>';
    download.addEventListener("click", (event) => {
      event.stopPropagation();
      downloadTrack(track);
    });

    endcap.appendChild(label);
    endcap.appendChild(download);

    row.appendChild(main);
    row.appendChild(endcap);
    row.addEventListener("click", () => loadTrack(track, true));
    bindLiquidNode(row);
    dom.trackList.appendChild(row);
  });
}

function renderPlayer(track) {
  if (!track) {
    dom.nowTitle.textContent = "Nothing queued";
    dom.nowSub.textContent = "Pick a track to begin";
    setArt("", "PS");
    updateDownloadButton(null);
    document.title = DEFAULT_TITLE;
    return;
  }

  dom.nowTitle.textContent = track.title;
  const subParts = [];
  if (track.artist) subParts.push(track.artist);
  if (track.albumName) subParts.push(track.albumName);
  dom.nowSub.textContent = subParts.join(" - ");
  setArt(track.coverUrl, getInitials(track.artist || track.albumName || "PS"), track.coverFallbacks);
  updateDownloadButton(track);
  document.title = `puresound - ${track.title}`;
}

function updatePlayButton(isPlaying) {
  dom.playBtn.classList.toggle("is-playing", isPlaying);
  dom.playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

function updateShuffleButton() {
  if (!dom.shuffleBtn) return;
  dom.shuffleBtn.classList.toggle("active", state.isShuffle);
  dom.shuffleBtn.setAttribute("aria-pressed", state.isShuffle ? "true" : "false");
}

function getRepeatLabel() {
  if (state.repeatMode === "one") return "Repeat one";
  if (state.repeatMode === "all") return "Repeat all";
  return "Repeat off";
}

function updateRepeatButton() {
  if (!dom.repeatBtn) return;
  const isActive = state.repeatMode !== "off";
  const label = getRepeatLabel();
  dom.repeatBtn.classList.toggle("active", isActive);
  dom.repeatBtn.classList.toggle("mode-one", state.repeatMode === "one");
  dom.repeatBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
  dom.repeatBtn.setAttribute("aria-label", label);
  dom.repeatBtn.title = label;
  if (dom.repeatOneBadge) {
    dom.repeatOneBadge.hidden = state.repeatMode !== "one";
  }
}

function updateDownloadButton(track = getCurrentTrack()) {
  if (!dom.downloadBtn) return;
  const disabled = !track;
  const label = track ? `Download ${track.title}` : "Download current track";
  dom.downloadBtn.disabled = disabled;
  dom.downloadBtn.setAttribute("aria-label", label);
  dom.downloadBtn.title = label;
}

function cycleRepeatMode() {
  if (state.repeatMode === "off") {
    state.repeatMode = "all";
  } else if (state.repeatMode === "all") {
    state.repeatMode = "one";
  } else {
    state.repeatMode = "off";
  }
  updateRepeatButton();
  updateAlbumHeaderForSelection();
  preloadNextTrack();
  setStatus(`${getRepeatLabel()}.`);
}

function updateVolumeIcon(percent) {
  if (!dom.volumeIcon) return;
  let level = "muted";
  if (percent > 100) {
    level = "boost";
  } else if (percent > 35) {
    level = "medium";
  } else if (percent > 0) {
    level = "low";
  }
  dom.volumeIcon.dataset.level = level;
  dom.volumeIcon.title = level === "boost"
    ? "Volume boosted"
    : level === "medium"
      ? "Volume high"
      : level === "low"
        ? "Volume low"
        : "Muted";
}

function updateVolumeUi(percent) {
  if (dom.volumeValue) {
    dom.volumeValue.textContent = `${Math.round(percent)}%`;
  }
  updateVolumeIcon(percent);
  if (dom.volumeSlider) {
    dom.volumeSlider.value = Math.round(percent).toString();
    setRangeFill(dom.volumeSlider, (percent / VOLUME_MAX) * 100);
  }
}

function ensureAudioGraph() {
  if (volumeBoostSupported) return true;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  try {
    if (!audioContext) {
      audioContext = new AudioContextClass();
    }
    if (!mediaSource) {
      mediaSource = audioContext.createMediaElementSource(dom.audio);
      gainNode = audioContext.createGain();
      gainNode.gain.value = pendingVolume;
      mediaSource.connect(gainNode).connect(audioContext.destination);
    }
    volumeBoostSupported = true;
  } catch (error) {
    console.warn("Volume boost unavailable", error);
    volumeBoostSupported = false;
  }
  return volumeBoostSupported;
}

function resumeAudioContext() {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

function canBoostCurrentSource() {
  return pendingVolume > 1 && isCorsSafeAudioUrl(dom.audio.currentSrc || dom.audio.src);
}

function applyVolume({ allowContext = false } = {}) {
  const canBoost = canBoostCurrentSource();
  if (canBoost && allowContext && ensureAudioGraph()) {
    resumeAudioContext();
    if (gainNode) {
      gainNode.gain.value = pendingVolume;
      dom.audio.volume = 1;
      return;
    }
  }
  if (canBoost && volumeBoostSupported && gainNode) {
    gainNode.gain.value = pendingVolume;
    dom.audio.volume = 1;
    return;
  }
  dom.audio.volume = Math.min(1, pendingVolume);
}

function setVolume(percent, { fromUser = false } = {}) {
  const clamped = Math.max(0, Math.min(VOLUME_MAX, Number(percent) || 0));
  pendingVolume = clamped / 100;
  updateVolumeUi(clamped);
  applyVolume({ allowContext: fromUser && clamped > 100 });
}

function preloadTrack(track, { rememberAsNext = false } = {}) {
  if (!track || preloadedTrackIds.has(track.id) || preloadingTrackIds.has(track.id)) return;
  const urls = getTrackStreamUrls(track);
  if (!urls.length) return;

  preloadingTrackIds.add(track.id);
  const audio = new Audio();
  audio.preload = state.cacheEnabled ? "auto" : "metadata";
  let index = 0;

  const finish = (success, resolvedUrl = "") => {
    preloadingTrackIds.delete(track.id);
    if (success) {
      prioritizeTrackStreamUrl(track, resolvedUrl || urls[Math.max(index - 1, 0)]);
      preloadedTrackIds.add(track.id);
      if (rememberAsNext) {
        state.nextPreloadId = track.id;
        state.nextPreloadAudio = audio;
      }
      return;
    }
    if (rememberAsNext) {
      state.nextPreloadId = null;
      state.nextPreloadAudio = null;
    }
  };

  const tryUrl = () => {
    if (index >= urls.length) {
      finish(false);
      return;
    }
    const nextUrl = urls[index++];
    configureMediaElementSource(audio, nextUrl);
    audio.load();
  };

  audio.addEventListener("loadedmetadata", () => {
    finish(true, audio.currentSrc || urls[Math.max(index - 1, 0)]);
  }, { once: true });
  audio.addEventListener("error", tryUrl);
  tryUrl();
}

function preloadInitialTracks(tracks, limit) {
  if (!Array.isArray(tracks) || !tracks.length) return;
  const effectiveLimit = Number.isFinite(limit) ? limit : state.cacheEnabled ? 6 : 4;
  tracks.slice(0, effectiveLimit).forEach((track) => preloadTrack(track));
}

function preloadNextTrack() {
  if (state.isShuffle) return;
  const tracks = getCurrentTracks();
  if (!tracks.length || state.currentTrackIndex < 0) return;

  const hasNext = state.currentTrackIndex < tracks.length - 1;
  if (!hasNext && state.repeatMode !== "all") {
    return;
  }

  const nextIndex = hasNext ? state.currentTrackIndex + 1 : 0;
  const nextTrack = tracks[nextIndex];
  if (!nextTrack || nextTrack.id === state.nextPreloadId || preloadingTrackIds.has(nextTrack.id)) return;

  preloadTrack(nextTrack, { rememberAsNext: true });
}


function syncSeekBar() {
  const current = dom.audio.currentTime || 0;
  const total = dom.audio.duration || 0;
  const progress = total ? Math.round((current / total) * 100) : 0;
  dom.currentTime.textContent = formatTime(current);
  dom.duration.textContent = formatTime(total);
  dom.seekBar.value = progress;
  setRangeFill(dom.seekBar, progress);
}

function updateAlbumHeaderForSelection() {
  const album = getSelectedAlbum();
  if (!album) {
    if (dom.detailType) {
      dom.detailType.textContent = "Library";
    }
    dom.albumTitle.textContent = "Open a release";
    dom.albumMeta.textContent = "Select an album or single from the library grid to view its tracks.";
    if (dom.detailStats) {
      dom.detailStats.textContent = "Search songs, artists, album names, and singles from the library header.";
    }
    setDetailArt("", "PS", []);
    updateDownloadAlbumButton();
    return;
  }

  const tracks = getCurrentTracks();
  const metaParts = [];
  if (album.artist) metaParts.push(album.artist);
  metaParts.push(getAlbumTypeLabel(album));
  dom.albumTitle.textContent = album.displayName;
  dom.albumMeta.textContent = metaParts.join(" - ");
  if (dom.detailType) {
    dom.detailType.textContent = getAlbumTypeLabel(album);
  }

  const stats = [];
  stats.push(`${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`);
  if (state.isShuffle) stats.push("Shuffle on");
  if (state.repeatMode === "all") stats.push("Repeat all");
  if (state.repeatMode === "one") stats.push("Repeat one");
  if (dom.detailStats) {
    dom.detailStats.textContent = stats.join(" - ");
  }

  setDetailArt(
    album.coverUrl,
    getInitials(album.artist || album.displayName || "PS"),
    album.coverFallbacks || []
  );
  updateDownloadAlbumButton();
}

function updateSearchHeader(trackCount, albumCount) {
  updateLibrarySummary(
    "Search results",
    `${trackCount} matching tracks across ${albumCount} ${albumCount === 1 ? "release" : "releases"}.`
  );
}

function albumMatches(album, query) {
  const haystack = [album.displayName, album.artist, album.rawName].filter(Boolean).join(" ");
  return normalizeText(haystack).includes(query);
}

function trackMatches(track, query) {
  const haystack = [track.title, track.artist, track.albumName].filter(Boolean).join(" ");
  return normalizeText(haystack).includes(query);
}

function getAllTracks() {
  const all = [];
  state.tracksByAlbum.forEach((tracks) => {
    all.push(...tracks);
  });
  return all;
}

async function loadTracksForAlbum(album, { silent = false } = {}) {
  if (!album) return [];
  if (state.tracksByAlbum.has(album.id)) {
    return state.tracksByAlbum.get(album.id) || [];
  }

  if (album.isSingle && album.singleFile) {
    const tracks = [buildTrackRecord(album.singleFile, album, 0)];
    state.tracksByAlbum.set(album.id, tracks);
    album.trackCount = 1;
    scheduleCacheWrite();
    return tracks;
  }

  if (!silent) {
    beginLoading(`Loading ${album.displayName || "release"}...`);
  }
  try {
    const files = await listFiles({
      q: `'${album.id}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
      fields: "id,name,mimeType,size,resourceKey,webContentLink,shortcutDetails(targetId,targetMimeType,targetResourceKey)",
    });

    const resolvedFiles = files.map(resolveShortcut);

    if (!album.coverUrl) {
      const coverFile = pickCoverFile(resolvedFiles);
      if (coverFile) {
        album.coverId = coverFile.id;
        album.coverUrl = buildCoverThumbUrl(coverFile.id, coverFile.resourceKey);
        album.coverFallbacks = [
          buildCoverViewUrl(coverFile.id, coverFile.resourceKey),
          buildOpenUrl(coverFile.id, coverFile.resourceKey),
          buildDownloadUrl(coverFile.id, coverFile.resourceKey),
        ].filter(Boolean);
      }
    }

    const audioFiles = resolvedFiles.filter(isAudioFile).sort((a, b) => a.name.localeCompare(b.name));
    const tracks = audioFiles.map((file, index) => buildTrackRecord(file, album, index));

    state.tracksByAlbum.set(album.id, tracks);
    scheduleCacheWrite();
    album.trackCount = tracks.length;
    return tracks;
  } finally {
    if (!silent) {
      endLoading();
    }
  }
}

async function warmAlbumArtwork(albums) {
  const queue = (albums || []).filter((album) => album && !album.isSingle && !album.isLocal && !album.coverUrl);
  if (!queue.length) return;

  const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length) {
      const album = queue.shift();
      if (!album) continue;
      try {
        const files = await listFiles({
          q: `'${album.id}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
          fields: "id,name,mimeType,resourceKey,shortcutDetails(targetId,targetMimeType,targetResourceKey)",
        });
        const resolvedFiles = files.map(resolveShortcut);
        const coverFile = pickCoverFile(resolvedFiles);
        if (!coverFile) continue;
        album.coverId = coverFile.id;
        album.coverUrl = buildCoverThumbUrl(coverFile.id, coverFile.resourceKey);
        album.coverFallbacks = [
          buildCoverViewUrl(coverFile.id, coverFile.resourceKey),
          buildOpenUrl(coverFile.id, coverFile.resourceKey),
          buildDownloadUrl(coverFile.id, coverFile.resourceKey),
        ].filter(Boolean);
        renderAlbums();
        if (album.id === state.currentAlbumId) {
          updateAlbumHeaderForSelection();
          renderTracks();
        }
        scheduleCacheWrite();
      } catch (error) {
        console.warn("Artwork preload failed", error);
      }
    }
  });

  await Promise.all(workers);
}

async function ensureAllTracksLoaded({ silent = false } = {}) {
  if (state.isIndexing) return;
  const missing = state.albums.filter((album) => !state.tracksByAlbum.has(album.id));
  if (!missing.length) return;

  state.isIndexing = true;
  if (!silent) {
    beginLoading("Indexing library...");
  }
  const queue = missing.slice();
  const limit = Math.min(4, queue.length);
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const album = queue.shift();
      await loadTracksForAlbum(album, { silent: true });
    }
  });

  await Promise.all(workers);
  state.isIndexing = false;
  if (!silent) {
    endLoading();
  }
  updateStats();
}
async function applySearch() {
  const query = normalizeText(dom.librarySearch.value);
  state.searchQuery = query;
  const token = ++searchToken;

  if (!query) {
    state.filteredAlbums = state.albums.slice();
    state.filteredTracks = getCurrentTracks().slice();
    renderAlbums();
    renderTracks();
    updateLibrarySummary();
    updateAlbumHeaderForSelection();
    return;
  }

  const runSearch = () => {
    const allTracks = getAllTracks();
    const matchedAlbumsByName = state.albums.filter((album) => albumMatches(album, query));
    const matchedAlbumIds = new Set(matchedAlbumsByName.map((album) => album.id));
    const matchedTracks = allTracks.filter((track) => trackMatches(track, query));
    matchedTracks.forEach((track) => matchedAlbumIds.add(track.albumId));

    const matchedAlbums = state.albums.filter((album) => matchedAlbumIds.has(album.id));
    state.filteredAlbums = matchedAlbums;

    const selectedAlbum = getSelectedAlbum();
    if (selectedAlbum) {
      const albumTracks = getCurrentTracks();
      const includeWholeAlbum = albumMatches(selectedAlbum, query);
      state.filteredTracks = includeWholeAlbum
        ? albumTracks.slice()
        : albumTracks.filter((track) => trackMatches(track, query));
    } else {
      state.filteredTracks = [];
    }

    renderAlbums();
    renderTracks();
    updateSearchHeader(matchedTracks.length, matchedAlbums.length);
    updateAlbumHeaderForSelection();
    return { trackCount: matchedTracks.length, albumCount: matchedAlbums.length };
  };

  const partial = runSearch();
  setStatus(partial.trackCount ? `Found ${partial.trackCount} matching tracks. Loading more...` : "Searching library...");

  ensureAllTracksLoaded({ silent: true })
    .then(() => {
      if (token !== searchToken) return;
      const full = runSearch();
      setStatus(full.trackCount ? `Found ${full.trackCount} matching tracks.` : "No matches found.");
    })
    .catch((error) => {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    });
}

async function selectAlbum(albumId) {
  const album = state.albums.find((item) => item.id === albumId);
  if (!album) return;

  state.currentAlbumId = albumId;
  openAlbumDetail(album);
  renderAlbums();

  if (!state.searchQuery) {
    dom.albumTitle.textContent = album.displayName;
    dom.albumMeta.textContent = album.artist ? `${album.artist} - Loading tracks...` : "Loading tracks...";
  }

  setStatus(`Loading ${album.displayName}...`);

  try {
    const tracks = await loadTracksForAlbum(album);
    preloadInitialTracks(tracks);
    updateStats();

    if (state.searchQuery) {
      await applySearch();
    } else {
      state.filteredTracks = tracks.slice();
      renderTracks();
      updateLibrarySummary();
      updateAlbumHeaderForSelection();
    }

    updateDownloadAlbumButton();
    setStatus("Ready.");
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  }
}

function loadTrack(track, autoplay, { preserveShuffle = false } = {}) {
  if (!track) return;

  const album = state.albums.find((item) => item.id === track.albumId);
  state.currentAlbumId = track.albumId;
  if (album) {
    openAlbumDetail(album);
  }
  state.currentTrackIndex = track.index;
  state.currentTrackId = track.id;
  state.currentStreamUrls = getTrackStreamUrls(track);
  if (!state.currentStreamUrls.length) {
    setStatus("No playable source found for this track.");
    return;
  }
  state.currentStreamIndex = 0;
  setAudioSource(state.currentStreamUrls[0]);
  renderPlayer(track);
  renderAlbums();
  renderTracks();
  updateAlbumHeaderForSelection();
  preloadNextTrack();
  scheduleCacheStatsUpdate();

  if (state.isShuffle && !preserveShuffle) {
    resetShuffleSession(track);
  }

  if (autoplay) {
    dom.audio.play().catch((error) => {
      console.error(error);
      setStatus("Playback could not start.");
    });
  }
}

function loadTrackByIndex(index, autoplay, options = {}) {
  const tracks = getCurrentTracks();
  const track = tracks[index];
  if (!track) return;
  loadTrack(track, autoplay, options);
}

function playPause() {
  if (!dom.audio.src) {
    setStatus("Pick a track to start playback.");
    return;
  }

  if (dom.audio.paused) {
    dom.audio.play().catch((error) => {
      console.error(error);
      setStatus("Playback could not start.");
    });
  } else {
    dom.audio.pause();
  }
}

function nextTrack({ fromEnded = false } = {}) {
  const tracks = getCurrentTracks();
  if (!tracks.length) return;
  if (!state.currentTrackId) {
    setStatus("Pick a track to start playback.");
    return;
  }

  if (state.isShuffle && tracks.length > 1) {
    const nextIndex = getNextShuffleIndex();
    if (!Number.isFinite(nextIndex)) {
      if (fromEnded) {
        dom.audio.pause();
        dom.audio.currentTime = 0;
      }
      setStatus("Reached the end of this shuffled release.");
      return;
    }
    loadTrackByIndex(nextIndex, true, { preserveShuffle: true });
    return;
  }

  const nextIndex = state.currentTrackIndex + 1;
  if (nextIndex >= tracks.length) {
    if (state.repeatMode === "all") {
      loadTrackByIndex(0, true);
      return;
    }
    if (fromEnded) {
      dom.audio.pause();
      dom.audio.currentTime = 0;
    }
    setStatus("Reached the end of this release.");
    return;
  }

  loadTrackByIndex(nextIndex, true, { preserveShuffle: true });
}

function prevTrack() {
  const tracks = getCurrentTracks();
  if (!tracks.length) return;
  if (!state.currentTrackId) {
    setStatus("Pick a track to start playback.");
    return;
  }

  if (dom.audio.currentTime > 5) {
    dom.audio.currentTime = 0;
    return;
  }

  if (state.isShuffle && tracks.length > 1) {
    const prevIndex = getPreviousShuffleIndex();
    if (!Number.isFinite(prevIndex)) {
      setStatus("Already at the start of this shuffled run.");
      dom.audio.currentTime = 0;
      return;
    }
    loadTrackByIndex(prevIndex, true, { preserveShuffle: true });
    return;
  }

  const prevIndex = state.currentTrackIndex - 1;
  if (prevIndex < 0) {
    if (state.repeatMode === "all") {
      loadTrackByIndex(tracks.length - 1, true, { preserveShuffle: true });
      return;
    }
    dom.audio.currentTime = 0;
    setStatus("Already at the start of this release.");
    return;
  }

  loadTrackByIndex(prevIndex, true, { preserveShuffle: true });
}

function handleTrackEnded() {
  const tracks = getCurrentTracks();
  if (!tracks.length || !state.currentTrackId) return;

  if (state.repeatMode === "one") {
    dom.audio.currentTime = 0;
    dom.audio.play().catch(() => {});
    return;
  }

  nextTrack({ fromEnded: true });
}

function attachAudioEventHandlers(audio = dom.audio) {
  if (!audio) return;

  audio.addEventListener("timeupdate", syncSeekBar);
  audio.addEventListener("loadedmetadata", syncSeekBar);
  audio.addEventListener("loadedmetadata", preloadNextTrack);
  audio.addEventListener("error", () => {
    const err = dom.audio.error;
    const code = err && err.code ? ` (${err.code})` : "";
    const nextUrl = getNextStreamUrl();
    if (nextUrl) {
      const wasPlaying = !dom.audio.paused;
      const track = getCurrentTrack();
      if (track) {
        prioritizeTrackStreamUrl(track, nextUrl);
      }
      setStatus(`Retrying audio with a backup link (${state.currentStreamIndex + 1}/${state.currentStreamUrls.length})...`);
      setAudioSource(nextUrl);
      if (wasPlaying) {
        dom.audio.play().catch(() => {});
      }
      return;
    }
    const track = getCurrentTrack();
    const trackLabel = track ? ` (${track.title})` : "";
    setStatus(`Audio failed to load${code}${trackLabel}. Make sure the files are public, not shortcuts, and your API key referrer matches this site.`);
  });
  audio.addEventListener("ended", handleTrackEnded);
  audio.addEventListener("play", () => updatePlayButton(true));
  audio.addEventListener("pause", () => updatePlayButton(false));
}

async function loadAlbums({ silent = false } = {}) {
  if (!silent) {
    beginLoading("Loading library...");
  }
  try {
    const entries = await listFiles({
      q: `'${DRIVE.rootFolderId}' in parents and trashed=false`,
      fields: "id,name,mimeType,size,resourceKey,webContentLink,shortcutDetails(targetId,targetMimeType,targetResourceKey)",
      orderBy: "name_natural",
    });

    const resolved = entries.map(resolveShortcut);
    const folders = resolved.filter((file) => file.mimeType === "application/vnd.google-apps.folder");
    const rootAudioFiles = resolved.filter(
      (file) => file.mimeType !== "application/vnd.google-apps.folder" && isAudioFile(file)
    );
    const rootImages = resolved.filter(
      (file) => file.mimeType !== "application/vnd.google-apps.folder" && isCoverCandidate(file)
    );

    const existing = new Map(state.albums.map((album) => [album.id, album]));

    const folderAlbums = folders.map((folder) => {
      const info = splitAlbumName(folder.name);
      const next = {
        id: folder.id,
        rawName: info.rawName,
        displayName: info.displayName,
        artist: info.artist,
        trackCount: null,
        coverId: "",
        coverUrl: "",
        coverFallbacks: [],
        isSingle: false,
      };
      const prev = existing.get(next.id);
      if (prev) {
        next.trackCount = prev.trackCount;
        next.coverId = prev.coverId;
        next.coverUrl = prev.coverUrl;
        next.coverFallbacks = prev.coverFallbacks || [];
      }
      return next;
    });

    const singleAlbums = rootAudioFiles.map((file) => {
      const albumId = `single-${file.id}`;
      const info = parseTrackInfo(file.name, "");
      const matchedCover = pickSingleCoverFile(file, rootImages);
      const prev = existing.get(albumId);
      const coverFile = matchedCover || null;
      return {
        id: albumId,
        rawName: stripExtension(file.name),
        displayName: info.title || stripExtension(file.name),
        artist: info.artist,
        trackCount: 1,
        coverId: coverFile ? coverFile.id : prev && prev.coverId ? prev.coverId : "",
        coverUrl: coverFile
          ? buildCoverThumbUrl(coverFile.id, coverFile.resourceKey)
          : prev && prev.coverUrl
            ? prev.coverUrl
            : "",
        coverFallbacks: coverFile
          ? [
              buildCoverViewUrl(coverFile.id, coverFile.resourceKey),
              buildOpenUrl(coverFile.id, coverFile.resourceKey),
              buildDownloadUrl(coverFile.id, coverFile.resourceKey),
            ].filter(Boolean)
          : prev && prev.coverFallbacks
            ? prev.coverFallbacks
            : [],
        isSingle: true,
        singleFile: file,
      };
    });

    const nextAlbums = folderAlbums
      .concat(singleAlbums)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    state.albums = nextAlbums;
    if (Array.isArray(state.localAlbums) && state.localAlbums.length) {
      state.albums = state.albums.concat(state.localAlbums);
    }
    if (!state.searchQuery) {
      state.filteredAlbums = state.albums.slice();
    }

    if (state.currentAlbumId && !state.albums.some((album) => album.id === state.currentAlbumId)) {
      state.currentAlbumId = null;
      state.currentTrackIndex = -1;
      state.currentTrackId = null;
      state.filteredTracks = [];
      closeAlbumDetail();
      renderTracks();
      renderPlayer(null);
    }

    updateStats();
    renderAlbums();
    updateLibrarySummary();
    if (!state.searchQuery) {
      updateAlbumHeaderForSelection();
    }
    scheduleCacheWrite();

    warmAlbumArtwork(folderAlbums).catch((error) => {
      console.warn("Artwork preload failed", error);
    });

    if (!state.albums.length) {
      setStatus("No albums or singles found.");
    }
  } finally {
    if (!silent) {
      endLoading();
    }
  }
}
function startActiveUserTicker() {
  if (!dom.activeUsers) return;

  if (!("BroadcastChannel" in window)) {
    let current = Math.max(1, Math.floor(Math.random() * 5) + 1);
    dom.activeUsers.textContent = current.toString();
    setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1;
      current = Math.max(1, current + delta);
      dom.activeUsers.textContent = current.toString();
    }, 5000);
    return;
  }

  const channel = new BroadcastChannel("puresound-presence");
  const id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const peers = new Map();

  const updateCount = () => {
    const now = Date.now();
    peers.forEach((timestamp, peerId) => {
      if (now - timestamp > 15000) {
        peers.delete(peerId);
      }
    });
    dom.activeUsers.textContent = (peers.size + 1).toString();
  };

  channel.onmessage = (event) => {
    const message = event.data;
    if (!message || message.id === id) return;
    if (message.type === "ping") {
      peers.set(message.id, Date.now());
    } else if (message.type === "leave") {
      peers.delete(message.id);
    }
    updateCount();
  };

  const heartbeat = () => {
    channel.postMessage({ type: "ping", id });
    updateCount();
  };

  const interval = setInterval(heartbeat, 5000);
  heartbeat();

  window.addEventListener("beforeunload", () => {
    channel.postMessage({ type: "leave", id });
    clearInterval(interval);
    channel.close();
  });
}

function wireEvents() {
  dom.reloadBtn.addEventListener("click", () => {
    state.tracksByAlbum.clear();
    state.currentAlbumId = null;
    state.currentTrackIndex = -1;
    state.currentTrackId = null;
    state.currentStreamUrls = [];
    state.currentStreamIndex = 0;
    state.nextPreloadId = null;
    state.nextPreloadAudio = null;
    state.shuffleQueue = [];
    state.shuffleHistory = [];
    preloadedTrackIds.clear();
    preloadingTrackIds.clear();
    closeAlbumDetail();
    dom.audio.pause();
    dom.audio.removeAttribute("src");
    dom.audio.load();
    renderPlayer(null);
    renderTracks();
    clearCache();
    setStatus("Refreshing library...");
    loadAlbums().catch((error) => {
      setStatus(`Error: ${error.message}`);
    });
  });

  if (dom.libraryTab) {
    dom.libraryTab.addEventListener("click", () => setView("library"));
  }

  if (dom.settingsTab) {
    dom.settingsTab.addEventListener("click", () => setView("settings"));
  }

  if (dom.closeDetailBtn) {
    dom.closeDetailBtn.addEventListener("click", closeAlbumDetail);
  }

  if (dom.downloadAlbumBtn) {
    dom.downloadAlbumBtn.addEventListener("click", downloadAlbum);
  }

  if (dom.cacheToggle) {
    dom.cacheToggle.addEventListener("change", () => {
      applyCachePreference(dom.cacheToggle.checked);
    });
  }

  if (dom.clearCacheBtn) {
    dom.clearCacheBtn.addEventListener("click", () => {
      clearAudioCache();
    });
  }

  if (dom.localUpload) {
    dom.localUpload.addEventListener("change", (event) => {
      addLocalFiles(event.target.files);
      event.target.value = "";
    });
  }

  if (dom.uiScaleSwitch) {
    dom.uiScaleSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-scale]");
      if (!button) return;
      applyUiScale(button.dataset.scale);
    });
  }

  if (dom.settingsNotes) {
    dom.settingsNotes.addEventListener("input", (event) => {
      saveSettingsNotes(event.target.value);
    });
  }

  dom.librarySearch.addEventListener("input", () => {
    applySearch().catch((error) => {
      setStatus(`Error: ${error.message}`);
    });
  });

  if (dom.shuffleBtn) {
    dom.shuffleBtn.addEventListener("click", () => {
      state.isShuffle = !state.isShuffle;
      updateShuffleButton();
      resetShuffleSession();
      updateAlbumHeaderForSelection();
    });
  }

  if (dom.repeatBtn) {
    dom.repeatBtn.addEventListener("click", cycleRepeatMode);
  }

  if (dom.downloadBtn) {
    dom.downloadBtn.addEventListener("click", downloadCurrentTrack);
  }

  dom.playBtn.addEventListener("click", () => {
    applyVolume({ allowContext: pendingVolume > 1 });
    playPause();
  });

  if (dom.volumeSlider) {
    dom.volumeSlider.addEventListener("input", (event) => {
      setVolume(event.target.value, { fromUser: true });
    });
  }
  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const tag = target && target.tagName ? target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || (target && target.isContentEditable)) {
      return;
    }
    if (event.key === "Escape" && state.isDetailOpen) {
      closeAlbumDetail();
    }
    if (event.altKey && event.key === "PageUp") {
      event.preventDefault();
      prevTrack();
    }
    if (event.altKey && event.key === "PageDown") {
      event.preventDefault();
      nextTrack();
    }
  });

  dom.nextBtn.addEventListener("click", () => nextTrack());
  dom.prevBtn.addEventListener("click", prevTrack);

  dom.seekBar.addEventListener("input", (event) => {
    const percent = Number(event.target.value) || 0;
    setRangeFill(dom.seekBar, percent);
    if (dom.audio.duration) {
      dom.audio.currentTime = (percent / 100) * dom.audio.duration;
    }
  });
  attachAudioEventHandlers();
}
async function init() {
  wireEvents();
  initLiquidGlass();
  startActiveUserTicker();
  updateShuffleButton();
  updateRepeatButton();
  updateDownloadButton(null);
  updateDownloadAlbumButton();
  if (dom.versionCounter) {
    dom.versionCounter.textContent = APP_VERSION;
  }
  initThemes();
  initUiScale();
  loadSettingsNotes();
  setView("library");
  updateLibrarySummary();
  updateAlbumHeaderForSelection();
  updateLocalStats();
  updateCacheStats();
  setVolume(VOLUME_DEFAULT);
  setRangeFill(dom.seekBar, 0);

  const cacheSupported =
    "serviceWorker" in navigator && "caches" in window && window.location.protocol !== "file:";
  if (dom.cacheToggle) {
    dom.cacheToggle.disabled = !cacheSupported;
  }
  if (!cacheSupported && dom.cacheCount) {
    dom.cacheCount.textContent = "-";
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CACHE_CLEARED") {
        updateCacheStats();
      }
    });
  }

  if (cacheSupported) {
    await registerServiceWorker();
  }
  let cachePref = false;
  try {
    cachePref = localStorage.getItem(CACHE_PREF_KEY) === "1";
  } catch (error) {
    cachePref = false;
  }
  applyCachePreference(cachePref);

  if (!DRIVE.apiKey) {
    showSetup(true);
    setStatus("Add a Drive API key in config.js to start streaming.");
    return;
  }

  showSetup(false);
  dom.audio.preload = "auto";
  dom.audio.crossOrigin = "anonymous";

  const cached = readCache();
  const hadCache = cached && restoreCache(cached);
  if (hadCache) {
    setStatus("Loaded from cache. Syncing...");
    renderAlbums();
    updateLibrarySummary();
    updateAlbumHeaderForSelection();
  } else {
    setStatus("Connecting to Drive...");
  }

  try {
    await loadAlbums({ silent: !!hadCache });
    setStatus("Ready.");
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  }
}
init();











































