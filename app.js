const DRIVE = {
  apiKey: "AIzaSyCTbkxG_W9T1uKaXK8f-FFBzngZrQ0YJ2Q",
  rootFolderId: "1eBXiNU5vMlK67JELspL6_QCVQBDSwDJ2",
};

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".wav", ".flac", ".ogg", ".aac", ".opus"];
const NAME_SEPARATORS = [" - ", " | ", " : "];
const COVER_NAMES = ["cover.jpg", "cover.jpeg", "cover.png"];
const COVER_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const CACHE_VERSION = 2;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_STORAGE_PREFIX = "puresound-cache";
const DEFAULT_TITLE = "puresound - web player";
const APP_VERSION = "1.5.0";
const VOLUME_DEFAULT = 100;
const VOLUME_MAX = 200;
const AUDIO_CACHE_NAME = "puresound-audio-v1";
const CACHE_PREF_KEY = "puresound-audio-cache-enabled";
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
};

const dom = {
  albumList: document.getElementById("albumList"),
  trackList: document.getElementById("trackList"),
  albumTitle: document.getElementById("albumTitle"),
  albumMeta: document.getElementById("albumMeta"),
  albumCount: document.getElementById("albumCount"),
  activeUsers: document.getElementById("activeUsers"),
  trackCount: document.getElementById("trackCount"),
  libraryTab: document.getElementById("libraryTab"),
  settingsTab: document.getElementById("settingsTab"),
  albumsPanel: document.getElementById("albumsPanel"),
  tracksPanel: document.getElementById("tracksPanel"),
  settingsPanel: document.getElementById("settingsPanel"),
  themeGrid: document.getElementById("themeGrid"),
  cacheToggle: document.getElementById("cacheToggle"),
  cacheCount: document.getElementById("cacheCount"),
  clearCacheBtn: document.getElementById("clearCacheBtn"),
  localUpload: document.getElementById("localUpload"),
  localCount: document.getElementById("localCount"),
  versionCounter: document.getElementById("versionCounter"),
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
  volumeValue: document.getElementById("volumeValue"),
  audio: document.getElementById("audio"),
  setup: document.getElementById("setup"),
};

let searchToken = 0;
let cacheWriteTimer = null;
let cacheStatsTimer = null;
let activeThemeId = null;
const preloadedTrackIds = new Set();

let audioContext = null;
let mediaSource = null;
let gainNode = null;
let volumeBoostSupported = false;
let pendingVolume = VOLUME_DEFAULT / 100;


function setStatus(message) {
  dom.status.textContent = message;
}

function slugify(value) {
  const normalized = normalizeText(value);
  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug || "uploads";
}

function setView(view) {
  state.activeView = view;
  document.body.classList.toggle("view-settings", view === "settings");
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
  applyTheme(theme ? theme.id : THEMES[0].id);
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
    dom.cacheCount.textContent = "—";
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
    const albumId = `local-${slugify(folderName)}`;
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
      };
      localAlbumsById.set(albumId, album);
    }

    const trackInfo = parseTrackInfo(file.name, album.artist);
    const streamUrl = URL.createObjectURL(file);
    const track = {
      id: `local-${albumId}-${file.name}-${file.lastModified}`,
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
  if (!state.searchQuery) {
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
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE.apiKey}&supportsAllDrives=true&acknowledgeAbuse=true`;
}

function buildDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function buildOpenUrl(fileId) {
  return `https://drive.google.com/uc?export=open&id=${fileId}`;
}

function buildStreamCandidates(fileId) {
  const urls = [buildStreamUrl(fileId), buildOpenUrl(fileId), buildDownloadUrl(fileId)];
  return Array.from(new Set(urls));
}

function getNextStreamUrl() {
  if (!Array.isArray(state.currentStreamUrls)) return null;
  if (state.currentStreamIndex >= state.currentStreamUrls.length - 1) return null;
  state.currentStreamIndex += 1;
  return state.currentStreamUrls[state.currentStreamIndex];
}

function setAudioSource(url) {
  const isApiStream = url.includes("www.googleapis.com/drive/v3/files/");
  if (isApiStream) {
    dom.audio.crossOrigin = "anonymous";
  } else {
    dom.audio.removeAttribute("crossorigin");
  }
  dom.audio.src = url;
  dom.audio.load();
}

function buildCoverThumbUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;
}

function buildCoverViewUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
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

function downloadTrack(track) {
  if (!track) {
    setStatus("Pick a track to download.");
    return;
  }

  const link = document.createElement("a");
  link.href = track.downloadUrl || track.streamUrl;
  link.rel = "noopener";
  if (track.isLocal) {
    link.download = sanitizeFileName(track.name || track.title || "track");
  } else {
    link.download = sanitizeFileName(track.name || track.title || "track");
    link.target = "_blank";
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
  setStatus(`Downloading ${track.title}...`);
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
    empty.textContent = state.searchQuery ? "No albums match your search." : "No albums found in this folder.";
    dom.albumList.appendChild(empty);
    return;
  }

  albums.forEach((album) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "album";
    if (album.id === state.currentAlbumId) {
      button.classList.add("active");
    }

    const title = document.createElement("div");
    title.className = "album-title";
    title.textContent = album.displayName;

    const meta = document.createElement("div");
    meta.className = "album-meta";
    const count = album.trackCount ?? "-";
    const metaParts = [];
    if (album.artist) {
      metaParts.push(album.artist);
    }
    metaParts.push(`${count} tracks`);
    meta.textContent = metaParts.join(" - ");

    button.appendChild(title);
    button.appendChild(meta);
    button.addEventListener("click", () => selectAlbum(album.id));

    dom.albumList.appendChild(button);
  });
}

function renderTracks() {
  dom.trackList.innerHTML = "";

    if (!state.filteredTracks.length) {
    if (!state.currentAlbumId && !state.searchQuery) {
      const empty = document.createElement("div");
      empty.className = "empty-state";

      const title = document.createElement("div");
      title.className = "empty-title";
      title.textContent = "How to use puresound";

      const hint = document.createElement("p");
      hint.className = "meta";
      hint.textContent = "Choose an album to load tracks, then click a track to start listening.";

      const steps = document.createElement("ul");
      steps.className = "empty-steps";
      const stepData = [
        "Pick an album on the left to load its tracks.",
        "Click any track to queue it and start playback.",
        "Use search to find songs, artists, or albums.",
        "Toggle shuffle for a random mix.",
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

    const empty = document.createElement("div");
    empty.className = "meta";
    empty.textContent = state.searchQuery
      ? "No tracks match your search."
      : "No tracks available for this album.";
    dom.trackList.appendChild(empty);
    return;
  }
  state.filteredTracks.forEach((track) => {
    const row = document.createElement("div");
    row.className = "track";
    if (track.id === state.currentTrackId) {
      row.classList.add("active");
    }

    const cover = document.createElement("div");
    cover.className = "track-cover";

    const coverImage = document.createElement("img");
    coverImage.alt = track.albumName ? `${track.albumName} cover` : "Album cover";
    setImageSource(coverImage, track.coverUrl, track.coverFallbacks);

    const num = document.createElement("span");
    num.className = "track-num";
    num.textContent = `${track.index + 1}`.padStart(2, "0");

    cover.appendChild(coverImage);
    cover.appendChild(num);

    const info = document.createElement("div");

    const title = document.createElement("div");
    title.className = "track-title";
    title.textContent = track.title;

    const meta = document.createElement("div");
    meta.className = "track-meta";
    const size = formatBytes(track.size);
    const metaParts = [];
    if (track.artist) metaParts.push(track.artist);
    if (track.albumName) metaParts.push(track.albumName);
    if (track.mimeType) {
      metaParts.push(track.mimeType.replace("audio/", "").toUpperCase());
    }
    if (size) metaParts.push(size);
    meta.textContent = metaParts.length ? metaParts.join(" - ") : "Audio";

    info.appendChild(title);
    info.appendChild(meta);

    const duration = document.createElement("div");
    duration.className = "track-duration";
    duration.textContent = "";

    row.appendChild(cover);
    row.appendChild(info);
    row.appendChild(duration);

    row.addEventListener("click", () => loadTrack(track, true));

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
  setStatus(`${getRepeatLabel()}.`);
}

function updateVolumeUi(percent) {
  if (dom.volumeValue) {
    dom.volumeValue.textContent = `${Math.round(percent)}%`;
  }
  if (dom.volumeSlider) {
    dom.volumeSlider.value = Math.round(percent).toString();
    const fill = Math.max(0, Math.min(100, (percent / VOLUME_MAX) * 100));
    dom.volumeSlider.style.background = `linear-gradient(90deg, var(--accent-2) ${fill}%, rgba(255, 255, 255, 0.2) ${fill}%)`;
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

function applyVolume({ allowContext = false } = {}) {
  if (allowContext && ensureAudioGraph()) {
    resumeAudioContext();
    if (gainNode) {
      gainNode.gain.value = pendingVolume;
      dom.audio.volume = 1;
      return;
    }
  }
  if (volumeBoostSupported && gainNode) {
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
  applyVolume({ allowContext: fromUser });
}

function preloadInitialTracks(tracks, limit) {
  if (!Array.isArray(tracks) || !tracks.length) return;
  const effectiveLimit = Number.isFinite(limit) ? limit : state.cacheEnabled ? 6 : 4;
  const slice = tracks.slice(0, effectiveLimit);
  slice.forEach((track) => {
    if (!track || preloadedTrackIds.has(track.id)) return;
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.src = track.streamUrl;
    audio.load();
    preloadedTrackIds.add(track.id);
  });
}

function preloadNextTrack() {
  if (state.isShuffle) return;
  const tracks = getCurrentTracks();
  if (!tracks.length || state.currentTrackIndex < 0) return;
  const nextIndex = (state.currentTrackIndex + 1) % tracks.length;
  const nextTrack = tracks[nextIndex];
  if (!nextTrack || nextTrack.id === state.nextPreloadId) return;

  const audio = new Audio();
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";
  audio.src = nextTrack.streamUrl;
  audio.load();

  state.nextPreloadId = nextTrack.id;
  state.nextPreloadAudio = audio;
}


function syncSeekBar() {
  const current = dom.audio.currentTime || 0;
  const total = dom.audio.duration || 0;
  dom.currentTime.textContent = formatTime(current);
  dom.duration.textContent = formatTime(total);
  dom.seekBar.value = total ? Math.round((current / total) * 100) : 0;
}

function updateAlbumHeaderForSelection() {
  const album = state.albums.find((item) => item.id === state.currentAlbumId);
  if (!album) {
    dom.albumTitle.textContent = "Welcome";
    dom.albumMeta.textContent = "Pick an album on the left to load its tracks.";
    return;
  }
  const tracks = getCurrentTracks();
  const metaParts = [];
  if (album.artist) metaParts.push(album.artist);
  metaParts.push(`${tracks.length} tracks`);
  dom.albumTitle.textContent = album.displayName;
  dom.albumMeta.textContent = metaParts.join(" - ");
}

function updateSearchHeader(trackCount, albumCount) {
  dom.albumTitle.textContent = "Search results";
  dom.albumMeta.textContent = `${trackCount} tracks across ${albumCount} albums`;
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

  if (!silent) {
    beginLoading(`Loading ${album.displayName || "album"}...`);
  }
  try {
    const files = await listFiles({
      q: `'${album.id}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
      fields: "id,name,mimeType,size,shortcutDetails(targetId,targetMimeType)",
    });

    const resolvedFiles = files.map(resolveShortcut);

    if (!album.coverUrl) {
      const coverFile = pickCoverFile(resolvedFiles);
      if (coverFile) {
        album.coverId = coverFile.id;
        album.coverUrl = buildCoverThumbUrl(coverFile.id);
        album.coverFallbacks = [
          buildCoverViewUrl(coverFile.id),
          buildStreamUrl(coverFile.id),
        ];
      }
    }

    const audioFiles = resolvedFiles.filter(isAudioFile).sort((a, b) => a.name.localeCompare(b.name));
    const tracks = audioFiles.map((file, index) => {
      const info = parseTrackInfo(file.name, album.artist);
      const streamUrls = buildStreamCandidates(file.id);
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
        streamUrl: streamUrls[0],
        downloadUrl: buildDownloadUrl(file.id),
        streamUrls,
      };
    });

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
    updateAlbumHeaderForSelection();
    return;
  }

  const runSearch = () => {
    const allTracks = getAllTracks();
    const matchedAlbumsByName = state.albums.filter((album) => albumMatches(album, query));
    const matchedAlbumIds = new Set(matchedAlbumsByName.map((album) => album.id));
    const matchedTracks = allTracks.filter(
      (track) => trackMatches(track, query) || matchedAlbumIds.has(track.albumId)
    );
    matchedTracks.forEach((track) => matchedAlbumIds.add(track.albumId));
    const matchedAlbums = state.albums.filter((album) => matchedAlbumIds.has(album.id));

    state.filteredAlbums = matchedAlbums;
    state.filteredTracks = matchedTracks;
    renderAlbums();
    renderTracks();
    updateSearchHeader(matchedTracks.length, matchedAlbumIds.size || matchedAlbums.length);
    return { trackCount: matchedTracks.length };
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
  if (state.currentAlbumId === albumId && state.tracksByAlbum.has(albumId)) {
    await applySearch();
    return;
  }

  const album = state.albums.find((item) => item.id === albumId);
  state.currentAlbumId = albumId;

  if (!state.searchQuery) {
    dom.albumTitle.textContent = album ? album.displayName : "Album";
    dom.albumMeta.textContent = album && album.artist ? `${album.artist} - Loading tracks...` : "Loading tracks...";
  }

  setStatus(`Loading ${album ? album.displayName : "album"}...`);

  try {
    const tracks = await loadTracksForAlbum(album);
    preloadInitialTracks(tracks);

    updateStats();
    renderAlbums();
    await applySearch();

    if (!state.searchQuery && !state.currentTrackId) {
      state.currentTrackIndex = -1;
      renderPlayer(null);
    }

    setStatus("Ready.");
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  }
}

function loadTrack(track, autoplay) {
  if (!track) return;

  state.currentAlbumId = track.albumId;
  state.currentTrackIndex = track.index;
  state.currentTrackId = track.id;
  state.currentStreamUrls = Array.isArray(track.streamUrls) && track.streamUrls.length ? track.streamUrls : [track.streamUrl];
  state.currentStreamIndex = 0;
  setAudioSource(state.currentStreamUrls[0]);
  renderPlayer(track);
  renderAlbums();
  renderTracks();
  if (!state.searchQuery) {
    updateAlbumHeaderForSelection();
  }
  preloadNextTrack();
  scheduleCacheStatsUpdate();

  if (autoplay) {
    dom.audio.play();
  }
}

function loadTrackByIndex(index, autoplay) {
  const tracks = getCurrentTracks();
  const track = tracks[index];
  if (!track) return;
  loadTrack(track, autoplay);
}

function playPause() {
  if (!dom.audio.src) {
    setStatus("Pick a track to start playback.");
    return;
  }

  if (dom.audio.paused) {
    dom.audio.play();
  } else {
    dom.audio.pause();
  }
}

function nextTrack() {
  const tracks = getCurrentTracks();
  if (!tracks.length) return;
  if (!state.currentTrackId) {
    setStatus("Pick a track to start playback.");
    return;
  }

  if (state.isShuffle && tracks.length > 1) {
    let nextIndex = state.currentTrackIndex;
    while (nextIndex === state.currentTrackIndex) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    }
    loadTrackByIndex(nextIndex, true);
    return;
  }

  const nextIndex = (state.currentTrackIndex + 1) % tracks.length;
  loadTrackByIndex(nextIndex, true);
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

  const prevIndex = (state.currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrackByIndex(prevIndex, true);
}

function handleTrackEnded() {
  const tracks = getCurrentTracks();
  if (!tracks.length || !state.currentTrackId) return;

  if (state.repeatMode === "one") {
    dom.audio.currentTime = 0;
    dom.audio.play().catch(() => {});
    return;
  }

  if (!state.isShuffle && state.repeatMode === "off" && state.currentTrackIndex >= tracks.length - 1) {
    dom.audio.currentTime = 0;
    setStatus("Playback finished.");
    return;
  }

  nextTrack();
}

async function loadAlbums({ silent = false } = {}) {
  if (!silent) {
    beginLoading("Loading albums...");
  }
  try {
    const folders = await listFiles({
      q: `'${DRIVE.rootFolderId}' in parents and trashed=false and mimeType='application/vnd.google-apps.folder'`,
      fields: "id,name",
    });

    const existing = new Map(state.albums.map((album) => [album.id, album]));
    const nextAlbums = folders
      .map((folder) => {
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
        };
        const prev = existing.get(next.id);
        if (prev) {
          next.trackCount = prev.trackCount;
          next.coverId = prev.coverId;
          next.coverUrl = prev.coverUrl;
          next.coverFallbacks = prev.coverFallbacks || [];
        }
        return next;
      })
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
      renderTracks();
      renderPlayer(null);
    }

    updateStats();
    renderAlbums();
    if (!state.searchQuery) {
      updateAlbumHeaderForSelection();
    }
    scheduleCacheWrite();

    if (!state.albums.length) {
      setStatus("No album folders found.");
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
    clearCache();
    setStatus("Refreshing albums...");
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

  dom.librarySearch.addEventListener("input", () => {
    applySearch().catch((error) => {
      setStatus(`Error: ${error.message}`);
    });
  });

  if (dom.shuffleBtn) {
    dom.shuffleBtn.addEventListener("click", () => {
      state.isShuffle = !state.isShuffle;
      updateShuffleButton();
    });
  }

  if (dom.repeatBtn) {
    dom.repeatBtn.addEventListener("click", cycleRepeatMode);
  }

  if (dom.downloadBtn) {
    dom.downloadBtn.addEventListener("click", downloadCurrentTrack);
  }

  dom.playBtn.addEventListener("click", () => {
    applyVolume({ allowContext: true });
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
    if (event.altKey && event.key === "PageUp") {
      event.preventDefault();
      prevTrack();
    }
    if (event.altKey && event.key === "PageDown") {
      event.preventDefault();
      nextTrack();
    }
  });

  dom.nextBtn.addEventListener("click", nextTrack);
  dom.prevBtn.addEventListener("click", prevTrack);

  dom.seekBar.addEventListener("input", (event) => {
    const percent = Number(event.target.value) || 0;
    if (dom.audio.duration) {
      dom.audio.currentTime = (percent / 100) * dom.audio.duration;
    }
  });

  dom.audio.addEventListener("timeupdate", syncSeekBar);
  dom.audio.addEventListener("loadedmetadata", syncSeekBar);
  dom.audio.addEventListener("loadedmetadata", () => preloadNextTrack());
    dom.audio.addEventListener("error", () => {
    const err = dom.audio.error;
    const code = err && err.code ? ` (${err.code})` : "";
    const nextUrl = getNextStreamUrl();
    if (nextUrl) {
      const wasPlaying = !dom.audio.paused;
      const track = getCurrentTracks().find((item) => item.id === state.currentTrackId);
      if (track) {
        track.streamUrl = nextUrl;
      }
      setStatus(`Retrying audio with a backup link (${state.currentStreamIndex + 1}/${state.currentStreamUrls.length})...`);
      setAudioSource(nextUrl);
      if (wasPlaying) {
        dom.audio.play().catch(() => {});
      }
      return;
    }
    const track = getCurrentTracks().find((item) => item.id === state.currentTrackId);
    const trackLabel = track ? ` (${track.title})` : "";
    setStatus(`Audio failed to load${code}${trackLabel}. Make sure the files are public, not shortcuts, and your API key referrer matches this site.`);
  });
  dom.audio.addEventListener("ended", handleTrackEnded);
  dom.audio.addEventListener("play", () => updatePlayButton(true));
  dom.audio.addEventListener("pause", () => updatePlayButton(false));
}
async function init() {
  wireEvents();
  startActiveUserTicker();
  updateShuffleButton();
  updateRepeatButton();
  updateDownloadButton(null);
  if (dom.versionCounter) {
    dom.versionCounter.textContent = APP_VERSION;
  }
  initThemes();
  setView("library");
  updateLocalStats();
  updateCacheStats();
  setVolume(VOLUME_DEFAULT);

  const cacheSupported =
    "serviceWorker" in navigator && "caches" in window && window.location.protocol !== "file:";
  if (dom.cacheToggle) {
    dom.cacheToggle.disabled = !cacheSupported;
  }
  if (!cacheSupported && dom.cacheCount) {
    dom.cacheCount.textContent = "—";
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
    setStatus("Add an API key to start streaming.");
    return;
  }

  showSetup(false);
  dom.audio.preload = "auto";
  dom.audio.crossOrigin = "anonymous";

  const cached = readCache();
  const hadCache = cached && restoreCache(cached);
  if (hadCache) {
    setStatus("Loaded from cache. Syncing...");
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


