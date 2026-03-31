const APP_VERSION = "5.0.0";
const DEFAULT_TITLE = "puresound - web player";
const ROOT_FOLDER_ID = "1eBXiNU5vMlK67JELspL6_QCVQBDSwDJ2";
const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".wav", ".flac", ".ogg", ".aac", ".opus"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const NAME_SEPARATORS = [" - ", " | ", " : "];
const COVER_NAMES = ["cover", "folder", "front", "album", "artwork"];
const CACHE_KEY = "puresound-library-cache-v5";
const CACHE_PREF_KEY = "puresound-cache-enabled";
const SCALE_KEY = "puresound-ui-scale";
const NOTES_KEY = "puresound-notes";
const THEME_KEY = "puresound-theme";
const VOLUME_KEY = "puresound-volume";
const MEDIA_CACHE = "puresound-media-v5";
const CACHE_TTL = 1000 * 60 * 12;
const LOCAL_COVER_URL = "https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png";

const THEMES = [
  { id: "abyss", name: "Abyss", preview: "linear-gradient(135deg, #05070d, #091a38 60%, #1d6cff)", vars: { "--bg-0": "#010204", "--bg-1": "#050914", "--bg-2": "#0a1730", "--accent": "#4ca8ff", "--accent-2": "#93efff", "--text": "#f6f9ff", "--muted": "#92a6c4" } },
  { id: "glacier", name: "Glacier", preview: "linear-gradient(135deg, #041018, #0e2e43 60%, #70d4ff)", vars: { "--bg-0": "#041018", "--bg-1": "#082030", "--bg-2": "#12384f", "--accent": "#53b8ff", "--accent-2": "#b5f5ff", "--text": "#f4fbff", "--muted": "#9eb9cb" } },
  { id: "ink", name: "Ink", preview: "linear-gradient(135deg, #040404, #121722 60%, #3b5bfd)", vars: { "--bg-0": "#040404", "--bg-1": "#10151f", "--bg-2": "#1d2435", "--accent": "#6b8cff", "--accent-2": "#93efff", "--text": "#f7f8fb", "--muted": "#a0a9bb" } },
  { id: "neon-tide", name: "Neon Tide", preview: "linear-gradient(135deg, #021412, #063532 56%, #2df4ca)", vars: { "--bg-0": "#03100f", "--bg-1": "#07221f", "--bg-2": "#0e3732", "--accent": "#3af1cb", "--accent-2": "#9cfff0", "--text": "#f3fff9", "--muted": "#9ac8bc" } },
  { id: "ultraviolet", name: "Ultraviolet", preview: "linear-gradient(135deg, #080510, #221545 58%, #8167ff)", vars: { "--bg-0": "#080510", "--bg-1": "#18102c", "--bg-2": "#271a49", "--accent": "#8f74ff", "--accent-2": "#d4beff", "--text": "#f7f3ff", "--muted": "#b8abc7" } },
  { id: "obsidian", name: "Obsidian", preview: "linear-gradient(135deg, #040404, #161616 60%, #767676)", vars: { "--bg-0": "#040404", "--bg-1": "#121212", "--bg-2": "#202020", "--accent": "#f5f5f5", "--accent-2": "#9ad7ff", "--text": "#fafafa", "--muted": "#b2b2b2" } },
  { id: "sunline", name: "Sunline", preview: "linear-gradient(135deg, #120706, #32130f 56%, #ff8d54)", vars: { "--bg-0": "#120706", "--bg-1": "#25100c", "--bg-2": "#3d1914", "--accent": "#ff8d54", "--accent-2": "#ffcb7a", "--text": "#fff6f2", "--muted": "#d6b3a7" } },
  { id: "frostbyte", name: "Frostbyte", preview: "linear-gradient(135deg, #061317, #0a2630 58%, #6ef6ff)", vars: { "--bg-0": "#061317", "--bg-1": "#0a222b", "--bg-2": "#14333e", "--accent": "#6ef6ff", "--accent-2": "#d2fdff", "--text": "#f4feff", "--muted": "#9ec1c7" } },
  { id: "royal", name: "Royal", preview: "linear-gradient(135deg, #030612, #16234e 56%, #3f78ff)", vars: { "--bg-0": "#030612", "--bg-1": "#0f1c3b", "--bg-2": "#173057", "--accent": "#4d84ff", "--accent-2": "#9bd8ff", "--text": "#f5f8ff", "--muted": "#97aacd" } },
  { id: "nightglass", name: "Nightglass", preview: "linear-gradient(135deg, #05080f, #13263a 58%, #4ca8ff)", vars: { "--bg-0": "#05080f", "--bg-1": "#0d1827", "--bg-2": "#13263a", "--accent": "#4ca8ff", "--accent-2": "#b8f1ff", "--text": "#f5f8ff", "--muted": "#8ea4c3" } },
];

const state = {
  remoteReleases: [],
  localReleases: [],
  releases: [],
  filteredReleases: [],
  releaseMap: new Map(),
  trackMap: new Map(),
  selectedReleaseId: null,
  currentReleaseId: null,
  currentTrackId: null,
  shuffle: false,
  repeatMode: "off",
  history: [],
  historyIndex: -1,
  shufflePool: [],
  search: "",
  cacheEnabled: true,
  uiScale: "normal",
  themeId: "nightglass",
  volume: 100,
  pendingPlay: false,
  localTrackCount: 0,
  presenceId: (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  preloadStore: new Map(),
};

const els = {};
let swRegistration = null;
let notesTimer = null;
let presenceTimer = null;
let currentTrackCandidateIndex = 0;

function init() {
  bindElements();
  bindEvents();
  loadPreferences();
  renderThemeButtons();
  applyTheme(state.themeId);
  applyUiScale(state.uiScale);
  applyVolume(state.volume);
  updateRepeatUI();
  initLiquidGlass();
  initPresence();
  initMediaSession();
  registerServiceWorker();
  updateRangeFill(els.seekBar);
  updateRangeFill(els.volumeSlider);
  els.versionCounter.textContent = APP_VERSION;
  setStatus("Loading library…");
  loadLibrary();
}

function bindElements() {
  [
    "libraryTab", "settingsTab", "libraryTitle", "libraryMeta", "albumCount", "trackCount", "activeUsers", "librarySearch", "reloadBtn",
    "albumList", "libraryEmpty", "libraryPanel", "settingsPanel", "themeGrid", "cacheToggle", "clearCacheBtn", "cacheCount",
    "localUpload", "localCount", "uiScaleSwitch", "uiScaleValue", "settingsNotes", "versionCounter", "status", "detailPanel",
    "closeDetailBtn", "detailBannerImage", "detailBannerFallback", "detailType", "albumTitle", "albumMeta", "detailStats",
    "downloadAlbumBtn", "trackList", "topTrackCount", "topReleaseCount", "art", "artImage", "artInitials", "nowTitle", "nowSub",
    "shuffleBtn", "prevBtn", "playBtn", "nextBtn", "repeatBtn", "repeatOneBadge", "downloadBtn", "currentTime", "seekBar",
    "duration", "volumeIcon", "volumeSlider", "volumeValue", "loadingOverlay", "loadingText", "setup", "audio"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.libraryTab.addEventListener("click", () => switchView("library"));
  els.settingsTab.addEventListener("click", () => switchView("settings"));
  els.librarySearch.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    filterAndRenderReleases();
  });
  els.reloadBtn.addEventListener("click", () => loadLibrary({ forceRefresh: true }));
  els.closeDetailBtn.addEventListener("click", closeReleaseDetail);
  els.detailPanel.addEventListener("click", (event) => {
    if (event.target === els.detailPanel || event.target.classList.contains("detail-scrim")) {
      closeReleaseDetail();
    }
  });
  document.addEventListener("keydown", handleGlobalKeydown);

  els.cacheToggle.addEventListener("change", async (event) => {
    state.cacheEnabled = Boolean(event.target.checked);
    localStorage.setItem(CACHE_PREF_KEY, String(state.cacheEnabled));
    sendSwCachingState();
    if (!state.cacheEnabled) {
      await clearCaches({ silent: true });
      setStatus("Cache disabled.");
    } else {
      setStatus("Cache enabled.");
    }
    updateCacheCount();
  });

  els.clearCacheBtn.addEventListener("click", async () => {
    if (!window.confirm("Clear cached library data and warmed media?")) return;
    await clearCaches();
    setStatus("Cache cleared.");
  });

  els.localUpload.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    await loadLocalFolders(files);
    event.target.value = "";
  });

  els.uiScaleSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scale]");
    if (!button) return;
    applyUiScale(button.dataset.scale);
    localStorage.setItem(SCALE_KEY, state.uiScale);
  });

  els.settingsNotes.addEventListener("input", () => {
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      localStorage.setItem(NOTES_KEY, els.settingsNotes.value);
    }, 180);
  });

  els.playBtn.addEventListener("click", togglePlayPause);
  els.prevBtn.addEventListener("click", playPreviousTrack);
  els.nextBtn.addEventListener("click", () => advanceTrack({ direction: "next", manual: true }));
  els.shuffleBtn.addEventListener("click", toggleShuffle);
  els.repeatBtn.addEventListener("click", cycleRepeatMode);
  els.downloadBtn.addEventListener("click", downloadCurrentTrack);
  els.downloadAlbumBtn.addEventListener("click", downloadSelectedRelease);

  els.seekBar.addEventListener("input", () => updateRangeFill(els.seekBar));
  els.seekBar.addEventListener("change", () => {
    const value = Number(els.seekBar.value || 0);
    if (Number.isFinite(els.audio.duration) && els.audio.duration > 0) {
      els.audio.currentTime = (value / 100) * els.audio.duration;
    }
  });

  els.volumeSlider.addEventListener("input", () => {
    const value = clamp(Number(els.volumeSlider.value || 0), 0, 200);
    applyVolume(value);
    localStorage.setItem(VOLUME_KEY, String(value));
  });

  els.audio.addEventListener("play", () => {
    document.body.classList.add("is-playing");
    updateMediaSessionPlayback();
  });
  els.audio.addEventListener("pause", () => {
    document.body.classList.remove("is-playing");
    updateMediaSessionPlayback();
  });
  els.audio.addEventListener("timeupdate", () => {
    updateProgress();
    updateMediaSessionPosition();
  });
  els.audio.addEventListener("loadedmetadata", () => {
    const track = getCurrentTrack();
    if (track && Number.isFinite(els.audio.duration)) {
      track.duration = els.audio.duration;
      renderCurrentTrackDuration();
      if (state.selectedReleaseId === track.releaseId) {
        renderReleaseDetail(getReleaseById(track.releaseId));
      }
    }
  });
  els.audio.addEventListener("durationchange", renderCurrentTrackDuration);
  els.audio.addEventListener("waiting", () => {
    if (state.currentTrackId) setStatus("Buffering audio…");
  });
  els.audio.addEventListener("canplay", () => {
    const track = getCurrentTrack();
    if (track) setStatus(`Ready: ${track.title}`);
  });
  els.audio.addEventListener("ended", handleTrackEnded);
  els.audio.addEventListener("error", handleAudioError);

  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith("puresound-presence:")) updatePresenceCount();
  });
  window.addEventListener("beforeunload", cleanupBeforeUnload);
}

function loadPreferences() {
  state.cacheEnabled = localStorage.getItem(CACHE_PREF_KEY) !== "false";
  state.uiScale = localStorage.getItem(SCALE_KEY) || "normal";
  state.themeId = localStorage.getItem(THEME_KEY) || "nightglass";
  state.volume = clamp(Number(localStorage.getItem(VOLUME_KEY) || 100), 0, 200);
  els.cacheToggle.checked = state.cacheEnabled;
  els.settingsNotes.value = localStorage.getItem(NOTES_KEY) || "";
}

function switchView(view) {
  const showLibrary = view === "library";
  els.libraryTab.classList.toggle("active", showLibrary);
  els.settingsTab.classList.toggle("active", !showLibrary);
  els.libraryPanel.classList.toggle("hidden", !showLibrary);
  els.settingsPanel.classList.toggle("hidden", showLibrary);
  if (!showLibrary) closeReleaseDetail();
}

function normalizeConfig() {
  const config = window.PURESOUND_CONFIG || {};
  const apiBase = typeof config.apiBase === "string" ? config.apiBase.trim().replace(/\/$/, "") : "";
  const driveConfig = config.drive || {};
  const directConfig = config.directBrowser || {};
  const legacyApiKey = driveConfig.apiKey || directConfig.apiKey || "";
  return {
    apiBase,
    rootFolderId: driveConfig.rootFolderId || ROOT_FOLDER_ID,
    allowDirectApiKey: config.allowDirectApiKey === true,
    directApiKey: typeof legacyApiKey === "string" ? legacyApiKey.trim() : "",
  };
}

const CONFIG = normalizeConfig();

function hasLibrarySource() {
  return Boolean(CONFIG.apiBase || (CONFIG.allowDirectApiKey && CONFIG.directApiKey));
}
async function loadLibrary(options = {}) {
  const { forceRefresh = false } = options;
  const canLoadRemote = hasLibrarySource();
  toggleSetup(!canLoadRemote && state.localReleases.length === 0);

  if (state.cacheEnabled && !forceRefresh) {
    const cached = readLibraryCache();
    if (cached) {
      state.remoteReleases = reviveReleases(cached.releases || []);
      syncReleaseState();
      setStatus("Loaded cached library. Refreshing in background…");
      toggleSetup(false);
      renderAll();
    }
  }

  if (!canLoadRemote) {
    syncReleaseState();
    renderAll();
    updateCacheCount();
    if (!state.localReleases.length) setStatus("Drive source is not configured.");
    return;
  }

  setLoading(true, "Loading library…");

  try {
    const releases = await fetchRemoteLibrary();
    state.remoteReleases = releases;
    if (state.cacheEnabled) writeLibraryCache({ releases });
    toggleSetup(false);
    syncReleaseState();
    renderAll();
    setStatus(`Loaded ${state.releases.length} releases and ${countTracks(state.releases)} tracks.`);
  } catch (error) {
    console.error(error);
    if (!state.remoteReleases.length && !state.localReleases.length) toggleSetup(true);
    syncReleaseState();
    renderAll();
    setStatus(`Load failed: ${error.message || "Unknown error"}`);
  } finally {
    setLoading(false);
    updateCacheCount();
  }
}

async function fetchRemoteLibrary() {
  const rootItems = await listFolder(CONFIG.rootFolderId);
  const normalized = rootItems.map(normalizeDriveItem);
  const rootImages = normalized.filter(isImageItem);
  const rootAudio = normalized.filter(isAudioItem);
  const rootFolders = normalized.filter(isFolderItem);

  const singles = buildSingleReleases(rootAudio, rootImages);
  const albumReleases = [];
  let completed = 0;

  await Promise.all(rootFolders.map(async (folder) => {
    const children = (await listFolder(folder.driveId || folder.id)).map(normalizeDriveItem);
    const release = buildAlbumRelease(folder, children);
    if (release) albumReleases.push(release);
    completed += 1;
    setLoading(true, `Scanning releases ${completed}/${rootFolders.length || 1}…`);
  }));

  return sortReleases([...albumReleases, ...singles]);
}

async function listFolder(parentId) {
  if (CONFIG.apiBase) {
    const url = new URL(`${CONFIG.apiBase}/list`);
    url.searchParams.set("parentId", parentId);
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data.files || []);
  }

  if (CONFIG.allowDirectApiKey && CONFIG.directApiKey) {
    const files = [];
    let pageToken = "";
    do {
      const url = new URL("https://www.googleapis.com/drive/v3/files");
      url.searchParams.set("q", `'${parentId}' in parents and trashed = false`);
      url.searchParams.set("pageSize", "1000");
      url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType,size,resourceKey,webContentLink,shortcutDetails(targetId,targetMimeType,targetResourceKey))");
      url.searchParams.set("supportsAllDrives", "true");
      url.searchParams.set("includeItemsFromAllDrives", "true");
      url.searchParams.set("key", CONFIG.directApiKey);
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`Drive API returned ${response.status}`);
      const data = await response.json();
      files.push(...(data.files || []));
      pageToken = data.nextPageToken || "";
    } while (pageToken);
    return files;
  }

  throw new Error("No library source configured.");
}

function normalizeDriveItem(item) {
  const shortcut = item.shortcutDetails || {};
  const resolvedMimeType = item.mimeType === "application/vnd.google-apps.shortcut" ? (shortcut.targetMimeType || item.mimeType) : item.mimeType;
  const driveId = item.mimeType === "application/vnd.google-apps.shortcut" ? (shortcut.targetId || item.id) : item.id;
  const resourceKey = shortcut.targetResourceKey || item.resourceKey || "";
  return {
    ...item,
    driveId,
    resolvedMimeType,
    resourceKey,
    baseName: stripExtension(item.name || ""),
  };
}

function buildAlbumRelease(folder, children) {
  const tracks = children.filter(isAudioItem).sort(sortAudioItems);
  if (!tracks.length) return null;

  const images = children.filter(isImageItem);
  const folderName = stripExtension(folder.name || "Untitled Album");
  const parsed = parseArtistTitle(folderName);
  const releaseTitle = parsed.title || folderName;
  const fallbackArtist = parsed.artist || guessArtistFromTracks(tracks) || "Unknown artist";
  const coverItem = pickCoverItem(images, folderName);
  const coverUrl = coverItem ? buildCoverUrl(coverItem) : "";
  const release = {
    id: `drive-release:${folder.driveId || folder.id}`,
    source: "drive",
    type: "album",
    title: releaseTitle,
    artist: fallbackArtist,
    coverUrl,
    coverInitials: initialsFor(`${fallbackArtist} ${releaseTitle}`),
    folderId: folder.driveId || folder.id,
    downloadCount: tracks.length,
    tracks: [],
  };

  release.tracks = tracks.map((item, index) => buildDriveTrack(item, release, index, coverUrl));
  return release;
}

function buildSingleReleases(audioItems, imageItems) {
  const singleCoverMap = buildImageLookup(imageItems);
  return audioItems.sort(sortAudioItems).map((item) => {
    const parsed = parseArtistTitle(stripExtension(item.name || "Untitled"));
    const title = parsed.title || stripExtension(item.name || "Single");
    const artist = parsed.artist || "Unknown artist";
    const matchedCover = singleCoverMap.get(normalizeName(stripExtension(item.name || ""))) || singleCoverMap.get("cover") || imageItems[0] || null;
    const coverUrl = matchedCover ? buildCoverUrl(matchedCover) : "";
    const release = {
      id: `drive-single:${item.driveId || item.id}`,
      source: "drive",
      type: "single",
      title,
      artist,
      coverUrl,
      coverInitials: initialsFor(`${artist} ${title}`),
      folderId: null,
      downloadCount: 1,
      tracks: [],
    };

    release.tracks = [buildDriveTrack(item, release, 0, coverUrl)];
    return release;
  });
}

function buildDriveTrack(item, release, index, coverUrl) {
  const parsed = parseArtistTitle(stripExtension(item.name || "Untitled"));
  const title = parsed.title || stripExtension(item.name || `Track ${index + 1}`);
  const artist = parsed.artist || release.artist;
  const urlCandidates = buildDriveUrlCandidates(item);
  return {
    id: `drive-track:${item.driveId || item.id}`,
    source: "drive",
    releaseId: release.id,
    releaseType: release.type,
    title,
    artist,
    album: release.title,
    coverUrl,
    coverInitials: initialsFor(`${artist} ${title}`),
    driveId: item.driveId || item.id,
    resourceKey: item.resourceKey || "",
    mimeType: item.resolvedMimeType || item.mimeType,
    size: Number(item.size || 0),
    sizeLabel: formatBytes(Number(item.size || 0)),
    duration: null,
    trackNumber: index + 1,
    urlCandidates,
    downloadUrl: buildDriveDownloadUrl(item),
    workingCandidateIndex: 0,
    fileName: item.name || "",
  };
}

function buildImageLookup(items) {
  const map = new Map();
  items.forEach((item) => {
    const key = normalizeName(stripExtension(item.name || ""));
    if (!map.has(key)) map.set(key, item);
  });
  return map;
}

function pickCoverItem(images, releaseName) {
  if (!images.length) return null;
  const normalizedRelease = normalizeName(stripExtension(releaseName || ""));
  const byPriority = images.slice().sort((a, b) => scoreCoverItem(b, normalizedRelease) - scoreCoverItem(a, normalizedRelease));
  return byPriority[0] || null;
}

function scoreCoverItem(item, normalizedRelease) {
  const name = normalizeName(stripExtension(item.name || ""));
  let score = 0;
  if (COVER_NAMES.includes(name)) score += 100;
  if (name === normalizedRelease) score += 80;
  if (name.includes("cover")) score += 40;
  if (name.includes("folder")) score += 25;
  return score;
}

function buildDriveUrlCandidates(item) {
  const urls = [];
  const fileId = item.driveId || item.id;
  const resourceKey = item.resourceKey ? `&resourcekey=${encodeURIComponent(item.resourceKey)}` : "";
  if (item.webContentLink) urls.push(item.webContentLink);
  urls.push(`https://drive.google.com/uc?export=open&id=${encodeURIComponent(fileId)}${resourceKey}`);
  urls.push(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}${resourceKey}`);
  return [...new Set(urls)];
}

function buildDriveDownloadUrl(item) {
  return buildDriveUrlCandidates(item)[1] || buildDriveUrlCandidates(item)[0] || "";
}

function buildCoverUrl(item) {
  const fileId = item.driveId || item.id;
  const resourceKey = item.resourceKey ? `&resourcekey=${encodeURIComponent(item.resourceKey)}` : "";
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200${resourceKey}`;
}
function syncReleaseState() {
  state.releases = sortReleases([...state.remoteReleases, ...state.localReleases]);
  state.releaseMap = new Map();
  state.trackMap = new Map();
  state.releases.forEach((release) => {
    state.releaseMap.set(release.id, release);
    release.tracks.forEach((track) => state.trackMap.set(track.id, track));
  });

  if (state.selectedReleaseId && !state.releaseMap.has(state.selectedReleaseId)) {
    state.selectedReleaseId = null;
    closeReleaseDetail();
  }

  if (state.currentTrackId && !state.trackMap.has(state.currentTrackId)) {
    resetPlayer();
  } else if (state.currentTrackId) {
    const currentTrack = getCurrentTrack();
    if (currentTrack) refreshNowPlaying(currentTrack);
  }

  filterAndRenderReleases();
}

function renderAll() {
  filterAndRenderReleases();
  updateCounts();
  updateCacheCount();
}

function filterAndRenderReleases() {
  const query = state.search;
  state.filteredReleases = !query ? state.releases.slice() : state.releases.filter((release) => releaseMatches(release, query));
  renderReleaseGrid();
  updateCounts();
}

function renderReleaseGrid() {
  els.albumList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  state.filteredReleases.forEach((release) => {
    const card = document.createElement("article");
    card.className = "release-card" + (state.selectedReleaseId === release.id ? " is-active" : "");
    if (release.coverUrl) {
      card.style.setProperty("--cover-image", `url("${release.coverUrl.replace(/"/g, "%22")}")`);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "release-card-button";
    button.addEventListener("click", () => openReleaseDetail(release.id));

    const badge = document.createElement("span");
    badge.className = "release-badge";
    badge.textContent = release.type === "single" ? "Single" : "Album";

    const copy = document.createElement("div");
    copy.className = "release-copy";

    const title = document.createElement("div");
    title.className = "release-title";
    title.textContent = release.title;

    const sub = document.createElement("div");
    sub.className = "release-sub";
    sub.textContent = release.artist;

    const meta = document.createElement("div");
    meta.className = "release-meta-row";
    meta.textContent = `${release.tracks.length} ${release.tracks.length === 1 ? "track" : "tracks"}${release.source === "local" ? " • local" : ""}`;

    copy.append(title, sub, meta);
    button.append(badge, copy);
    card.append(button);
    fragment.append(card);
  });

  els.albumList.append(fragment);
  els.libraryEmpty.classList.toggle("hidden", state.filteredReleases.length > 0);
}

function openReleaseDetail(releaseId) {
  const release = getReleaseById(releaseId);
  if (!release) return;
  switchView("library");
  state.selectedReleaseId = releaseId;
  renderReleaseGrid();
  renderReleaseDetail(release);
  els.detailPanel.classList.remove("hidden");
  els.detailPanel.setAttribute("aria-hidden", "false");
}

function closeReleaseDetail() {
  els.detailPanel.classList.add("hidden");
  els.detailPanel.setAttribute("aria-hidden", "true");
}

function renderReleaseDetail(release) {
  if (!release) return;

  els.detailType.textContent = release.type === "single" ? "Single" : "Album";
  els.albumTitle.textContent = release.title;
  els.albumMeta.textContent = `${release.artist} • ${release.tracks.length} ${release.tracks.length === 1 ? "track" : "tracks"}${release.source === "local" ? " • local files" : ""}`;
  els.detailStats.textContent = release.type === "single"
    ? "Click the track to play it. This release contains one standalone single."
    : "Click any track to start playback. The queue stays inside this release unless you choose another one.";
  els.downloadAlbumBtn.disabled = !release.tracks.length;

  if (release.coverUrl) {
    els.detailBannerImage.src = release.coverUrl;
    els.detailBannerImage.classList.remove("hidden");
    els.detailBannerFallback.classList.add("hidden");
  } else {
    els.detailBannerImage.removeAttribute("src");
    els.detailBannerImage.classList.add("hidden");
    els.detailBannerFallback.textContent = release.coverInitials || "PS";
    els.detailBannerFallback.classList.remove("hidden");
  }

  els.trackList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  release.tracks.forEach((track, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "track-row" + (track.id === state.currentTrackId ? " active" : "");
    row.addEventListener("click", () => playTrackById(track.id, { manualSelect: true }));

    const art = document.createElement("div");
    art.className = "track-index";
    if (track.coverUrl) {
      const img = document.createElement("img");
      img.src = track.coverUrl;
      img.alt = "";
      art.append(img);
    } else {
      art.textContent = String(index + 1).padStart(2, "0");
    }

    const main = document.createElement("div");
    main.className = "track-main";
    const title = document.createElement("div");
    title.className = "track-title";
    title.textContent = track.title;
    const sub = document.createElement("div");
    sub.className = "track-sub";
    sub.textContent = `${track.artist} • ${track.album}`;
    main.append(title, sub);

    const meta = document.createElement("div");
    meta.className = "track-meta";
    const format = document.createElement("span");
    format.textContent = formatTrackMeta(track);
    const duration = document.createElement("span");
    duration.textContent = track.duration ? formatTime(track.duration) : "--:--";
    meta.append(format, duration);

    row.append(art, main, meta);
    fragment.append(row);
  });
  els.trackList.append(fragment);
}

function playTrackById(trackId, options = {}) {
  const track = state.trackMap.get(trackId);
  if (!track) return;
  const release = getReleaseById(track.releaseId);
  if (!release) return;

  const previousReleaseId = state.currentReleaseId;
  state.currentReleaseId = release.id;
  state.selectedReleaseId = release.id;
  currentTrackCandidateIndex = track.workingCandidateIndex || 0;
  state.pendingPlay = options.autoPlay !== false;

  if (!options.preserveHistory) {
    if (state.history[state.historyIndex] !== track.id) {
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(track.id);
      state.historyIndex = state.history.length - 1;
    }
  }

  if (!state.shuffle || options.reseedShuffle || options.manualSelect || previousReleaseId !== release.id || !state.shufflePool.length) {
    seedShufflePool(release.id, track.id);
  }

  state.currentTrackId = track.id;
  refreshNowPlaying(track);
  renderReleaseGrid();
  renderReleaseDetail(release);
  applyTrackSource(track, currentTrackCandidateIndex);
  warmUpcomingTracks();
  updateMediaSessionMetadata(track);

  if (state.pendingPlay) {
    const playPromise = els.audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => setStatus(`Ready: ${track.title}`));
    }
  }
}

function applyTrackSource(track, candidateIndex) {
  const candidates = track.urlCandidates || [];
  const nextUrl = candidates[candidateIndex] || candidates[0] || track.downloadUrl;
  if (!nextUrl) {
    setStatus(`No playable source found for ${track.title}.`);
    return;
  }

  currentTrackCandidateIndex = candidateIndex;
  els.audio.src = nextUrl;
  els.audio.load();
  updateDocumentTitle(track.title);
  setStatus(`Loading ${track.title}…`);
}

function refreshNowPlaying(track) {
  els.nowTitle.textContent = track ? track.title : "Nothing queued";
  els.nowSub.textContent = track ? `${track.artist} • ${track.album}` : "Choose a track to begin";
  if (!track) {
    els.artImage.removeAttribute("src");
    els.artImage.classList.add("hidden");
    els.artInitials.textContent = "PS";
    els.artInitials.classList.remove("hidden");
    return;
  }

  if (track.coverUrl) {
    els.artImage.src = track.coverUrl;
    els.artImage.classList.remove("hidden");
    els.artInitials.classList.add("hidden");
  } else {
    els.artImage.removeAttribute("src");
    els.artImage.classList.add("hidden");
    els.artInitials.textContent = track.coverInitials || "PS";
    els.artInitials.classList.remove("hidden");
  }
}

function resumePlayback() {
  if (!state.currentTrackId) {
    setStatus("Choose a track first.");
    return;
  }
  const playPromise = els.audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => setStatus("Playback is blocked until you interact with the page."));
  }
}

function pausePlayback() {
  if (!state.currentTrackId) return;
  els.audio.pause();
}

function togglePlayPause() {
  if (!state.currentTrackId) {
    setStatus("Choose a track first.");
    return;
  }
  if (els.audio.paused) resumePlayback();
  else pausePlayback();
}

function playPreviousTrack() {
  if (!state.currentTrackId) {
    setStatus("Choose a track first.");
    return;
  }

  if (els.audio.currentTime > 3) {
    els.audio.currentTime = 0;
    return;
  }

  if (state.historyIndex > 0) {
    state.historyIndex -= 1;
    playTrackById(state.history[state.historyIndex], { preserveHistory: true, autoPlay: true, reseedShuffle: false });
    return;
  }

  const release = getCurrentRelease();
  if (!release || state.shuffle) {
    setStatus("No earlier track in history.");
    return;
  }

  const currentIndex = release.tracks.findIndex((track) => track.id === state.currentTrackId);
  if (currentIndex > 0) {
    playTrackById(release.tracks[currentIndex - 1].id, { autoPlay: true, reseedShuffle: false });
  } else {
    setStatus("Already at the first track.");
  }
}
function advanceTrack(options = {}) {
  const { direction = "next", manual = false } = options;
  if (!state.currentTrackId) {
    setStatus("Choose a track first.");
    return;
  }

  if (direction === "previous") {
    playPreviousTrack();
    return;
  }

  const release = getCurrentRelease();
  if (!release) return;
  const currentIndex = release.tracks.findIndex((track) => track.id === state.currentTrackId);
  if (currentIndex < 0) return;

  if (state.shuffle) {
    if (manual && state.historyIndex < state.history.length - 1) {
      state.historyIndex += 1;
      playTrackById(state.history[state.historyIndex], { preserveHistory: true, autoPlay: true, reseedShuffle: false });
      return;
    }

    const nextTrackId = drawFromShufflePool(release.id);
    if (nextTrackId) {
      playTrackById(nextTrackId, { autoPlay: true, reseedShuffle: false });
      return;
    }

    if (state.repeatMode === "all") {
      seedShufflePool(release.id, state.currentTrackId);
      const repeatTrackId = drawFromShufflePool(release.id);
      if (repeatTrackId) {
        playTrackById(repeatTrackId, { autoPlay: true, reseedShuffle: false });
        return;
      }
    }

    stopAtQueueEnd();
    return;
  }

  if (currentIndex < release.tracks.length - 1) {
    playTrackById(release.tracks[currentIndex + 1].id, { autoPlay: true, reseedShuffle: false });
    return;
  }

  if (state.repeatMode === "all" && release.tracks.length) {
    playTrackById(release.tracks[0].id, { autoPlay: true, reseedShuffle: false });
    return;
  }

  stopAtQueueEnd();
}

function handleTrackEnded() {
  if (!state.currentTrackId) return;
  if (state.repeatMode === "one") {
    els.audio.currentTime = 0;
    const playPromise = els.audio.play();
    if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => setStatus("Track ended."));
    return;
  }
  advanceTrack({ direction: "next", manual: false });
}

function stopAtQueueEnd() {
  els.audio.pause();
  els.audio.currentTime = 0;
  updateProgress();
  setStatus("Queue finished.");
}

function handleAudioError() {
  const track = getCurrentTrack();
  if (!track) return;

  const nextIndex = currentTrackCandidateIndex + 1;
  if (nextIndex < track.urlCandidates.length) {
    track.workingCandidateIndex = nextIndex;
    setStatus(`Retrying ${track.title} with backup source…`);
    applyTrackSource(track, nextIndex);
    const playPromise = els.audio.play();
    if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
    return;
  }

  setStatus(`Audio failed to load (${track.title}). Check sharing or the source format.`);
}

function toggleShuffle() {
  state.shuffle = !state.shuffle;
  els.shuffleBtn.classList.toggle("is-active", state.shuffle);
  if (state.shuffle && state.currentReleaseId) seedShufflePool(state.currentReleaseId, state.currentTrackId);
  setStatus(state.shuffle ? "Shuffle enabled." : "Shuffle disabled.");
}

function cycleRepeatMode() {
  state.repeatMode = state.repeatMode === "off" ? "all" : state.repeatMode === "all" ? "one" : "off";
  updateRepeatUI();
  const labels = { off: "Repeat off.", all: "Repeat all enabled.", one: "Repeat one enabled." };
  setStatus(labels[state.repeatMode]);
}

function updateRepeatUI() {
  els.repeatBtn.classList.toggle("is-active", state.repeatMode !== "off");
  els.repeatOneBadge.hidden = state.repeatMode !== "one";
}

function drawFromShufflePool(releaseId) {
  if (state.currentReleaseId !== releaseId) seedShufflePool(releaseId, state.currentTrackId);
  while (state.shufflePool.length) {
    const nextId = state.shufflePool.shift();
    if (nextId !== state.currentTrackId) return nextId;
  }
  return "";
}

function seedShufflePool(releaseId, excludeTrackId) {
  const release = getReleaseById(releaseId);
  if (!release) {
    state.shufflePool = [];
    return;
  }
  const ids = release.tracks.map((track) => track.id).filter((id) => id !== excludeTrackId);
  state.shufflePool = shuffleArray(ids);
}

function updateProgress() {
  const duration = Number.isFinite(els.audio.duration) ? els.audio.duration : 0;
  const currentTime = Number.isFinite(els.audio.currentTime) ? els.audio.currentTime : 0;
  els.currentTime.textContent = formatTime(currentTime);
  els.duration.textContent = formatTime(duration);
  els.seekBar.value = duration > 0 ? String((currentTime / duration) * 100) : "0";
  updateRangeFill(els.seekBar);
}

function renderCurrentTrackDuration() {
  const duration = Number.isFinite(els.audio.duration) ? els.audio.duration : 0;
  els.duration.textContent = formatTime(duration);
}

function downloadCurrentTrack() {
  const track = getCurrentTrack();
  if (!track) {
    setStatus("Choose a track first.");
    return;
  }
  triggerDownload(track.downloadUrl || track.urlCandidates[0], `${sanitizeFilename(track.artist)} - ${sanitizeFilename(track.title)}${detectExtension(track)}`);
}

async function downloadSelectedRelease() {
  const release = getReleaseById(state.selectedReleaseId);
  if (!release || !release.tracks.length) {
    setStatus("Open a release first.");
    return;
  }

  setStatus(`Starting ${release.tracks.length} download${release.tracks.length === 1 ? "" : "s"}…`);
  for (const track of release.tracks) {
    triggerDownload(track.downloadUrl || track.urlCandidates[0], `${sanitizeFilename(track.artist)} - ${sanitizeFilename(track.title)}${detectExtension(track)}`);
    await wait(180);
  }
}

function triggerDownload(url, filename) {
  if (!url) return;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename || "download";
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

async function loadLocalFolders(files) {
  revokeLocalUrls(state.localReleases);
  const grouped = new Map();

  files.forEach((file) => {
    const path = file.webkitRelativePath || file.name;
    const parts = path.split("/").filter(Boolean);
    const topFolder = parts.length > 1 ? parts[0] : "Uploads";
    const entry = grouped.get(topFolder) || { tracks: [], images: [] };
    if (isAudioFile(file.name, file.type)) entry.tracks.push(file);
    else if (isImageFile(file.name, file.type)) entry.images.push(file);
    grouped.set(topFolder, entry);
  });

  const releases = [];
  grouped.forEach((group, folderName) => {
    if (!group.tracks.length) return;
    const parsedFolder = parseArtistTitle(folderName);
    const releaseTitle = parsedFolder.title || folderName;
    const folderArtist = parsedFolder.artist || "Local files";
    const coverFile = pickLocalCoverFile(group.images, releaseTitle);
    const coverUrl = coverFile ? URL.createObjectURL(coverFile) : LOCAL_COVER_URL;
    const release = {
      id: `local-release:${folderName}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
      source: "local",
      type: group.tracks.length === 1 ? "single" : "album",
      title: releaseTitle,
      artist: folderArtist,
      coverUrl,
      coverInitials: initialsFor(`${folderArtist} ${releaseTitle}`),
      folderId: null,
      tracks: [],
    };
    release.tracks = group.tracks.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map((file, index) => buildLocalTrack(file, release, index, coverUrl));
    releases.push(release);
  });

  state.localReleases = sortReleases(releases);
  state.localTrackCount = countTracks(state.localReleases);
  syncReleaseState();
  renderAll();
  setStatus(`Loaded ${state.localTrackCount} local tracks.`);
}

function buildLocalTrack(file, release, index, coverUrl) {
  const parsed = parseArtistTitle(stripExtension(file.name || `Track ${index + 1}`));
  const title = parsed.title || stripExtension(file.name || `Track ${index + 1}`);
  const artist = parsed.artist || release.artist;
  const objectUrl = URL.createObjectURL(file);
  return {
    id: `local-track:${release.id}:${index}`,
    source: "local",
    releaseId: release.id,
    releaseType: release.type,
    title,
    artist,
    album: release.title,
    coverUrl,
    coverInitials: initialsFor(`${artist} ${title}`),
    mimeType: file.type || "audio/*",
    size: file.size,
    sizeLabel: formatBytes(file.size),
    duration: null,
    trackNumber: index + 1,
    urlCandidates: [objectUrl],
    downloadUrl: objectUrl,
    workingCandidateIndex: 0,
    fileName: file.name,
  };
}

function pickLocalCoverFile(images, releaseTitle) {
  if (!images.length) return null;
  const normalizedRelease = normalizeName(releaseTitle || "");
  return images.slice().sort((a, b) => scoreLocalCover(b, normalizedRelease) - scoreLocalCover(a, normalizedRelease))[0];
}

function scoreLocalCover(file, normalizedRelease) {
  const name = normalizeName(stripExtension(file.name || ""));
  let score = 0;
  if (COVER_NAMES.includes(name)) score += 100;
  if (name === normalizedRelease) score += 80;
  if (name.includes("cover")) score += 40;
  return score;
}

function renderThemeButtons() {
  els.themeGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  THEMES.forEach((theme) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-button" + (theme.id === state.themeId ? " active" : "");
    button.style.setProperty("--theme-preview", theme.preview);
    button.innerHTML = `<span>${theme.name}</span><strong>${theme.id === state.themeId ? "Live" : ""}</strong>`;
    button.addEventListener("click", () => applyTheme(theme.id));
    fragment.append(button);
  });
  els.themeGrid.append(fragment);
}

function applyTheme(themeId) {
  const theme = THEMES.find((item) => item.id === themeId) || THEMES[0];
  state.themeId = theme.id;
  Object.entries(theme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  localStorage.setItem(THEME_KEY, theme.id);
  renderThemeButtons();
}

function applyUiScale(scale) {
  const allowed = ["compact", "normal", "large"];
  state.uiScale = allowed.includes(scale) ? scale : "normal";
  document.body.dataset.uiScale = state.uiScale;
  Array.from(els.uiScaleSwitch.querySelectorAll(".scale-option")).forEach((button) => {
    button.classList.toggle("active", button.dataset.scale === state.uiScale);
  });
  els.uiScaleValue.textContent = capitalize(state.uiScale);
}

function applyVolume(value) {
  state.volume = clamp(Number(value || 0), 0, 200);
  els.volumeSlider.value = String(state.volume);
  els.audio.volume = Math.min(state.volume, 100) / 100;
  els.volumeValue.textContent = `${state.volume}%`;
  updateRangeFill(els.volumeSlider);
  updateVolumeIcon();
}

function updateVolumeIcon() {
  const level = state.volume === 0 ? "muted" : state.volume <= 35 ? "low" : state.volume > 100 ? "boost" : "medium";
  els.volumeIcon.dataset.level = level;
}
function updateCounts() {
  const releaseCount = state.releases.length;
  const trackCount = countTracks(state.releases);
  els.albumCount.textContent = String(releaseCount);
  els.trackCount.textContent = String(trackCount);
  els.topTrackCount.textContent = String(trackCount);
  els.topReleaseCount.textContent = String(releaseCount);
  els.localCount.textContent = String(state.localTrackCount);
}

function setStatus(message) {
  els.status.textContent = message;
}

function setLoading(active, message = "Loading…") {
  els.loadingOverlay.classList.toggle("hidden", !active);
  els.loadingOverlay.setAttribute("aria-hidden", String(!active));
  els.loadingText.textContent = message;
}

function toggleSetup(show) {
  els.setup.classList.toggle("hidden", !show);
}

function getReleaseById(releaseId) {
  return state.releaseMap.get(releaseId) || null;
}

function getCurrentRelease() {
  return getReleaseById(state.currentReleaseId);
}

function getCurrentTrack() {
  return state.trackMap.get(state.currentTrackId) || null;
}

function countTracks(releases) {
  return releases.reduce((total, release) => total + release.tracks.length, 0);
}

function releaseMatches(release, query) {
  const haystack = [
    release.title,
    release.artist,
    release.type,
    ...release.tracks.flatMap((track) => [track.title, track.artist, track.album]),
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function sortReleases(releases) {
  return releases.slice().sort((a, b) => {
    if (a.type !== b.type) return a.type === "album" ? -1 : 1;
    return `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`, undefined, { numeric: true, sensitivity: "base" });
  });
}

function sortAudioItems(a, b) {
  return stripExtension(a.name || "").localeCompare(stripExtension(b.name || ""), undefined, { numeric: true, sensitivity: "base" });
}

function parseArtistTitle(text) {
  const input = String(text || "").trim();
  for (const separator of NAME_SEPARATORS) {
    if (input.includes(separator)) {
      const [artist, ...rest] = input.split(separator);
      return { artist: artist.trim(), title: rest.join(separator).trim() };
    }
  }
  return { artist: "", title: input };
}

function guessArtistFromTracks(tracks) {
  const artists = tracks.map((item) => parseArtistTitle(stripExtension(item.name || "")).artist).filter(Boolean);
  return artists[0] || "";
}

function stripExtension(name) {
  return String(name || "").replace(/\.[^.]+$/, "");
}

function normalizeName(name) {
  return String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function initialsFor(text) {
  const parts = String(text || "PS").split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase() || "PS";
}

function isAudioItem(item) {
  const mime = item.resolvedMimeType || item.mimeType || "";
  return mime.startsWith("audio/") || isAudioFile(item.name || "", mime);
}

function isImageItem(item) {
  const mime = item.resolvedMimeType || item.mimeType || "";
  return mime.startsWith("image/") || isImageFile(item.name || "", mime);
}

function isFolderItem(item) {
  return (item.resolvedMimeType || item.mimeType) === "application/vnd.google-apps.folder";
}

function isAudioFile(name, mimeType = "") {
  const lowerName = String(name || "").toLowerCase();
  return mimeType.startsWith("audio/") || AUDIO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

function isImageFile(name, mimeType = "") {
  const lowerName = String(name || "").toLowerCase();
  return mimeType.startsWith("image/") || IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatTime(value) {
  const total = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatTrackMeta(track) {
  const extension = detectExtension(track).replace(".", "").toUpperCase();
  return `${extension || "AUDIO"} • ${track.sizeLabel}`;
}

function detectExtension(track) {
  if (track.fileName) {
    const match = /\.[^.]+$/.exec(track.fileName);
    return match ? match[0] : ".mp3";
  }
  return ".mp3";
}

function sanitizeFilename(text) {
  return String(text || "file").replace(/[\\/:*?"<>|]+/g, "_").trim();
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function shuffleArray(items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function updateRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || 0);
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.setProperty("--range-fill", `${percent}%`);
}

function updateDocumentTitle(trackTitle = "") {
  document.title = trackTitle ? `puresound - ${trackTitle}` : DEFAULT_TITLE;
}

function resetPlayer() {
  state.currentTrackId = null;
  state.currentReleaseId = null;
  state.history = [];
  state.historyIndex = -1;
  els.audio.pause();
  els.audio.removeAttribute("src");
  els.audio.load();
  refreshNowPlaying(null);
  updateDocumentTitle("");
  updateProgress();
}

function readLibraryCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached || !cached.timestamp || Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached;
  } catch (error) {
    return null;
  }
}

function writeLibraryCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), releases: payload.releases || [] }));
  } catch (error) {
    console.warn("Could not write cache", error);
  }
}

function reviveReleases(releases) {
  return (releases || []).map((release) => ({
    ...release,
    tracks: (release.tracks || []).map((track) => ({
      ...track,
      workingCandidateIndex: Number(track.workingCandidateIndex || 0),
      urlCandidates: Array.isArray(track.urlCandidates) ? track.urlCandidates : [track.downloadUrl].filter(Boolean),
    })),
  }));
}

async function clearCaches(options = {}) {
  const { silent = false } = options;
  localStorage.removeItem(CACHE_KEY);
  if ("caches" in window) {
    try {
      await caches.delete(MEDIA_CACHE);
    } catch (error) {
      console.warn(error);
    }
  }
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
  }
  if (!silent) updateCacheCount();
}

async function updateCacheCount() {
  let total = readLibraryCache() ? 1 : 0;
  if ("caches" in window) {
    try {
      const cache = await caches.open(MEDIA_CACHE);
      const requests = await cache.keys();
      total += requests.length;
    } catch (error) {
      console.warn(error);
    }
  }
  els.cacheCount.textContent = String(total);
}

function warmUpcomingTracks() {
  const release = getCurrentRelease();
  const currentTrack = getCurrentTrack();
  if (!release || !currentTrack) return;
  const currentIndex = release.tracks.findIndex((track) => track.id === currentTrack.id);
  const upcoming = release.tracks.slice(currentIndex + 1, currentIndex + 4);
  upcoming.forEach((track) => warmTrack(track));
}

function warmTrack(track) {
  if (!track || state.preloadStore.has(track.id)) return;
  const preloadAudio = new Audio();
  preloadAudio.preload = "auto";
  preloadAudio.src = (track.urlCandidates && track.urlCandidates[track.workingCandidateIndex || 0]) || track.downloadUrl || "";
  preloadAudio.load();
  state.preloadStore.set(track.id, preloadAudio);

  if (state.cacheEnabled && "caches" in window && preloadAudio.src) {
    fetch(preloadAudio.src).then((response) => {
      if (!response || (!response.ok && response.type !== "opaque")) return null;
      return caches.open(MEDIA_CACHE).then((cache) => cache.put(preloadAudio.src, response));
    }).catch(() => {});
  }
}

function revokeLocalUrls(releases) {
  (releases || []).forEach((release) => {
    if (release.source === "local" && release.coverUrl && release.coverUrl.startsWith("blob:")) URL.revokeObjectURL(release.coverUrl);
    (release.tracks || []).forEach((track) => {
      if (track.source === "local" && track.downloadUrl && track.downloadUrl.startsWith("blob:")) URL.revokeObjectURL(track.downloadUrl);
    });
  });
}
function handleGlobalKeydown(event) {
  if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

  if (event.altKey && event.code === "PageDown") {
    event.preventDefault();
    advanceTrack({ direction: "next", manual: true });
  }
  if (event.altKey && event.code === "PageUp") {
    event.preventDefault();
    playPreviousTrack();
  }
  if (event.code === "Space") {
    event.preventDefault();
    togglePlayPause();
  }
  if (event.key === "Escape") closeReleaseDetail();
}

function initMediaSession() {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.setActionHandler("play", resumePlayback);
  navigator.mediaSession.setActionHandler("pause", pausePlayback);
  navigator.mediaSession.setActionHandler("previoustrack", playPreviousTrack);
  navigator.mediaSession.setActionHandler("nexttrack", () => advanceTrack({ direction: "next", manual: true }));
  navigator.mediaSession.setActionHandler("seekto", (details) => {
    if (typeof details.seekTime === "number") els.audio.currentTime = details.seekTime;
  });
}

function updateMediaSessionMetadata(track) {
  if (!("mediaSession" in navigator) || !track) return;
  const artwork = track.coverUrl ? [{ src: track.coverUrl, sizes: "512x512", type: "image/png" }] : [];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork,
  });
}

function updateMediaSessionPlayback() {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.playbackState = els.audio.paused ? "paused" : "playing";
}

function updateMediaSessionPosition() {
  if (!("mediaSession" in navigator) || typeof navigator.mediaSession.setPositionState !== "function") return;
  const duration = Number.isFinite(els.audio.duration) ? els.audio.duration : 0;
  if (!duration) return;
  navigator.mediaSession.setPositionState({
    duration,
    playbackRate: els.audio.playbackRate || 1,
    position: els.audio.currentTime,
  });
}

function initLiquidGlass() {
  document.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--pointer-x", `${x}%`);
    document.documentElement.style.setProperty("--pointer-y", `${y}%`);
    document.documentElement.style.setProperty("--scene-x", `${(x - 50) * 0.18}px`);
    document.documentElement.style.setProperty("--scene-y", `${(y - 50) * 0.18}px`);
  });

  document.querySelectorAll("[data-liquid]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((event.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty("--liquid-x", `${relativeX}%`);
      element.style.setProperty("--liquid-y", `${relativeY}%`);
      element.style.setProperty("--rx", `${((relativeY - 50) / -12).toFixed(2)}deg`);
      element.style.setProperty("--ry", `${((relativeX - 50) / 14).toFixed(2)}deg`);
    });
    element.addEventListener("pointerleave", () => {
      element.style.removeProperty("--rx");
      element.style.removeProperty("--ry");
      element.style.setProperty("--liquid-x", "50%");
      element.style.setProperty("--liquid-y", "50%");
    });
  });
}

function initPresence() {
  heartbeatPresence();
  updatePresenceCount();
  presenceTimer = setInterval(() => {
    heartbeatPresence();
    updatePresenceCount();
  }, 12000);
}

function heartbeatPresence() {
  try {
    localStorage.setItem(`puresound-presence:${state.presenceId}`, String(Date.now()));
  } catch (error) {
    console.warn(error);
  }
}

function updatePresenceCount() {
  const cutoff = Date.now() - 30000;
  let count = 0;
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("puresound-presence:")) return;
    const value = Number(localStorage.getItem(key) || 0);
    if (value >= cutoff) count += 1;
    else localStorage.removeItem(key);
  });
  els.activeUsers.textContent = String(Math.max(1, count));
}

function cleanupBeforeUnload() {
  try {
    localStorage.removeItem(`puresound-presence:${state.presenceId}`);
  } catch (error) {
    console.warn(error);
  }
  revokeLocalUrls(state.localReleases);
  clearInterval(presenceTimer);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!(location.protocol === "http:" || location.protocol === "https:")) return;
  try {
    swRegistration = await navigator.serviceWorker.register("sw.js");
    sendSwCachingState();
  } catch (error) {
    console.warn("Service worker registration failed", error);
  }
}

function sendSwCachingState() {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({ type: "SET_CACHING", enabled: state.cacheEnabled });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

init();



