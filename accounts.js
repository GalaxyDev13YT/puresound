(() => {
  const CONFIG = window.PURESOUND_CONFIG || {};
  const SUPABASE_CONFIG = CONFIG.supabase || {};
  const els = {};
  const state = {
    app: null,
    client: null,
    authConfigured: false,
    session: null,
    user: null,
    profile: null,
    recent: [],
    playlists: [],
    selectedPlaylistId: "",
    pickerAction: null,
    route: { profile: "", playlist: "" },
    publicView: null,
    playlistPageOpen: false,
    pendingProfileAvatarUrl: "",
    pendingPlaylistCoverUrl: "",
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    bindElements();
    bindEvents();
    state.app = await waitForApp();
    renderGuestState();

    if (!hasSupabaseConfig()) {
      setAuthStatus("Add Supabase URL and anon key in config.js to enable accounts.");
      renderPlaylistControls();
      return;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setAuthStatus("Supabase client failed to load.", true);
      renderPlaylistControls();
      return;
    }

    state.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
    state.authConfigured = true;
    setAuthStatus("Ready. Sign in to sync playlists and profile.");

    state.client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        handleSessionChange(session).catch((error) => {
          console.error(error);
          setAuthStatus(error.message || "Account sync failed.", true);
        });
      }, 0);
    });

    const { data, error } = await state.client.auth.getSession();
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not restore session.", true);
    }

    await handleSessionChange(data ? data.session : null, { initial: true });
    await processRoute();
    renderPlaylistControls();
  }

  function bindElements() {
    [
      "welcomeBanner", "authOpenBtn", "homeWelcomeTitle", "homeWelcomeCopy", "homeAuthBtn", "homeNewPlaylistBtn",
      "recentlyPlayedSection", "recentlyPlayedList", "profileTab", "profilePanel", "profileAvatar", "profileAvatarImage",
      "profileEyebrow", "profileTitle", "profileSubtitle", "profileAuthBtn", "profileSignOutBtn", "profileShareBtn",
      "deleteAccountBtn", "profileGridView", "playlistPage", "playlistBackBtn", "profileEditorCard", "profileEditorEmpty",
      "profileForm", "profileUsernameInput", "profileAvatarInput", "profileBioInput", "profileSaveBtn", "createPlaylistBtn",
      "playlistList", "playlistEmpty", "playlistDetailBadge", "playlistDetailTitle", "playlistDetailMeta",
      "playlistDetailDescription", "playlistOwnerLink", "playlistCoverImage", "playlistCoverFallback", "playlistPlayBtn",
      "playlistShuffleBtn", "playlistPublicToggle", "playlistShareBtn", "playlistDeleteBtn", "playlistTrackList",
      "playlistEditorCard", "playlistForm", "playlistNameInput", "playlistDescriptionInput", "playlistCoverInput",
      "playlistSaveBtn", "authModal", "authCloseBtn", "authDialogTitle", "authDialogCopy", "authGoogleBtn",
      "authGithubBtn", "authStatus", "playlistPickerModal", "playlistPickerCloseBtn", "playlistPickerTitle",
      "playlistPickerCopy", "playlistPickerList", "playlistPickerCreateBtn", "saveTrackBtn", "saveReleaseBtn"
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    if (els.authOpenBtn) els.authOpenBtn.addEventListener("click", handlePrimaryAccountAction);
    if (els.homeAuthBtn) els.homeAuthBtn.addEventListener("click", handlePrimaryAccountAction);
    if (els.profileAuthBtn) els.profileAuthBtn.addEventListener("click", handleProfileActionButton);
    if (els.profileSignOutBtn) els.profileSignOutBtn.addEventListener("click", signOut);
    if (els.profileShareBtn) els.profileShareBtn.addEventListener("click", shareProfileLink);
    if (els.deleteAccountBtn) els.deleteAccountBtn.addEventListener("click", deleteOwnAccount);
    if (els.profileForm) els.profileForm.addEventListener("submit", saveProfile);
    if (els.profileAvatarInput) els.profileAvatarInput.addEventListener("change", handleProfileAvatarSelected);
    if (els.createPlaylistBtn) els.createPlaylistBtn.addEventListener("click", () => createPlaylistFlow());
    if (els.homeNewPlaylistBtn) els.homeNewPlaylistBtn.addEventListener("click", () => createPlaylistFlow());
    if (els.playlistBackBtn) els.playlistBackBtn.addEventListener("click", closePlaylistPage);
    if (els.playlistOwnerLink) els.playlistOwnerLink.addEventListener("click", handlePlaylistOwnerClick);
    if (els.playlistPlayBtn) els.playlistPlayBtn.addEventListener("click", () => playSelectedPlaylist(false));
    if (els.playlistShuffleBtn) els.playlistShuffleBtn.addEventListener("click", () => playSelectedPlaylist(true));
    if (els.playlistForm) els.playlistForm.addEventListener("submit", saveSelectedPlaylistMeta);
    if (els.playlistCoverInput) els.playlistCoverInput.addEventListener("change", handlePlaylistCoverSelected);
    if (els.playlistShareBtn) els.playlistShareBtn.addEventListener("click", shareSelectedPlaylist);
    if (els.playlistDeleteBtn) els.playlistDeleteBtn.addEventListener("click", deleteSelectedPlaylist);
    if (els.playlistPublicToggle) els.playlistPublicToggle.addEventListener("change", updateSelectedPlaylistVisibility);
    if (els.saveTrackBtn) els.saveTrackBtn.addEventListener("click", requestAddCurrentTrack);
    if (els.saveReleaseBtn) els.saveReleaseBtn.addEventListener("click", requestAddSelectedRelease);
    if (els.profileTab) els.profileTab.addEventListener("click", () => showOwnProfile(true));

    if (els.playlistList) {
      els.playlistList.addEventListener("click", (event) => {
        const card = event.target.closest("[data-playlist-id]");
        if (!card) return;
        openPlaylistPage(card.dataset.playlistId || "");
      });
    }

    if (els.authCloseBtn) els.authCloseBtn.addEventListener("click", () => toggleDialog(els.authModal, false));
    if (els.authGoogleBtn) els.authGoogleBtn.addEventListener("click", () => signInWithProvider("google"));
    if (els.authGithubBtn) els.authGithubBtn.addEventListener("click", () => signInWithProvider("github"));
    if (els.authModal) {
      els.authModal.addEventListener("click", (event) => {
        if (event.target === els.authModal) toggleDialog(els.authModal, false);
      });
    }

    if (els.playlistPickerCloseBtn) els.playlistPickerCloseBtn.addEventListener("click", () => toggleDialog(els.playlistPickerModal, false));
    if (els.playlistPickerCreateBtn) els.playlistPickerCreateBtn.addEventListener("click", () => createPlaylistFlow(true));
    if (els.playlistPickerList) {
      els.playlistPickerList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-playlist-pick]");
        if (!button) return;
        applyPickerSelection(button.dataset.playlistPick || "");
      });
    }
    if (els.playlistPickerModal) {
      els.playlistPickerModal.addEventListener("click", (event) => {
        if (event.target === els.playlistPickerModal) toggleDialog(els.playlistPickerModal, false);
      });
    }

    window.addEventListener("puresound:track-change", (event) => handleTrackChanged(event.detail || {}));
    window.addEventListener("puresound:playback-state", () => {
      if (state.playlistPageOpen) renderPlaylistDetail();
    });
    window.addEventListener("puresound:library-ready", () => {
      renderRecentPlayed();
      renderPlaylistDetail();
    });
    window.addEventListener("puresound:view-change", (event) => {
      if ((event.detail || {}).view === "profile") renderProfileView();
    });
    window.addEventListener("puresound:save-track-request", (event) => {
      const trackId = event.detail && event.detail.trackId;
      if (trackId) requestAddTrackById(trackId);
    });
    window.addEventListener("popstate", () => {
      processRoute().catch((error) => console.error(error));
    });
  }

  function hasSupabaseConfig() {
    return Boolean(typeof SUPABASE_CONFIG.url === "string" && SUPABASE_CONFIG.url && typeof SUPABASE_CONFIG.anonKey === "string" && SUPABASE_CONFIG.anonKey);
  }

  async function waitForApp() {
    while (!window.PuresoundApp) {
      await new Promise((resolve) => window.setTimeout(resolve, 40));
    }
    return window.PuresoundApp;
  }

  function getRedirectTo() {
    if (SUPABASE_CONFIG.redirectTo) return SUPABASE_CONFIG.redirectTo;
    return `${window.location.origin}${window.location.pathname}`;
  }

  function getBaseUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }


  function toggleDialog(element, show) {
    if (!element) return;
    element.classList.toggle("hidden", !show);
    element.setAttribute("aria-hidden", String(!show));
  }

  function handlePrimaryAccountAction() {
    if (state.user) {
      showOwnProfile();
      return;
    }
    openAuthDialog();
  }

  function handleProfileActionButton() {
    if (state.publicView) {
      showOwnProfile();
      return;
    }
    handlePrimaryAccountAction();
  }

  function openAuthDialog() {
    if (!state.authConfigured) {
      setAuthStatus("Configure Supabase in config.js first.", true);
      return;
    }
    if (els.authDialogTitle) els.authDialogTitle.textContent = "Continue";
    if (els.authDialogCopy) els.authDialogCopy.textContent = "Use Google or GitHub to sign in.";
    toggleDialog(els.authModal, true);
  }


  async function signInWithProvider(provider) {
    if (!state.client) return;
    try {
      const { error } = await state.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectTo(),
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
      setAuthStatus(error.message || `Could not continue with ${provider}.`, true);
    }
  }

  async function signOut() {
    if (!state.client) return;
    const { error } = await state.client.auth.signOut();
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not sign out.", true);
      return;
    }
    clearRoute();
    toggleDialog(els.authModal, false);
    await handleSessionChange(null);
  }

  async function handleSessionChange(session, options = {}) {
    state.session = session || null;
    state.user = session ? session.user : null;

    if (!state.user) {
      state.profile = null;
      state.playlists = [];
      state.recent = [];
      state.selectedPlaylistId = "";
      renderGuestState();
      renderPlaylistControls();
      renderProfileView();
      if (!options.initial) await processRoute();
      return;
    }

    await ensureProfileForUser(state.user);
    await loadOwnData();
    toggleDialog(els.authModal, false);
    if (!options.initial) await processRoute();
    renderPlaylistControls();
  }

  async function ensureProfileForUser(user) {
    const { data: existing, error: existingError } = await state.client.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (existingError && existingError.code !== "PGRST116") throw existingError;
    if (existing) {
      state.profile = existing;
      return existing;
    }

    const base = sanitizeUsername((user.user_metadata && (user.user_metadata.username || user.user_metadata.preferred_username || user.user_metadata.full_name)) || (user.email || "listener").split("@")[0] || "listener");
    const avatarUrl = (user.user_metadata && user.user_metadata.avatar_url) || "";

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const suffix = attempt === 0 ? "" : String(Math.floor(Math.random() * 900 + 100));
      const username = sanitizeUsername(`${base}${suffix}`);
      const { data, error } = await state.client.from("profiles").insert({
        id: user.id,
        username,
        avatar_url: avatarUrl,
        bio: "",
      }).select("*").single();
      if (!error) {
        state.profile = data;
        return data;
      }
      if (!String(error.message || "").toLowerCase().includes("duplicate") && error.code !== "23505") throw error;
    }

    const { data: fallback, error: fallbackError } = await state.client.from("profiles").select("*").eq("id", user.id).single();
    if (fallbackError) throw fallbackError;
    state.profile = fallback;
    return fallback;
  }

  async function loadOwnData() {
    const [profile, recent, playlists] = await Promise.all([
      loadOwnProfile(),
      loadRecentPlayed(),
      loadOwnPlaylists(),
    ]);
    state.profile = profile;
    state.recent = recent;
    state.playlists = playlists;

    if (!state.playlists.some((playlist) => playlist.id === state.selectedPlaylistId)) {
      state.selectedPlaylistId = state.playlists[0] ? state.playlists[0].id : "";
    }

    if (!state.route.profile && !state.route.playlist) {
      state.publicView = null;
    }

    renderAccountUi();
  }

  async function loadOwnProfile() {
    const { data, error } = await state.client.from("profiles").select("*").eq("id", state.user.id).single();
    if (error) throw error;
    return data;
  }

  async function loadRecentPlayed() {
    const { data, error } = await state.client.from("recently_played").select("*").eq("user_id", state.user.id).order("played_at", { ascending: false }).limit(4);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function loadOwnPlaylists() {
    const { data, error } = await state.client
      .from("playlists")
      .select("id,user_id,name,description,cover_url,is_public,created_at,updated_at,playlist_items(id,track_id,release_id,title,artist,album,cover_url,position,added_at)")
      .eq("user_id", state.user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return normalizePlaylistRows(data || []);
  }

  function normalizePlaylistRows(rows) {
    return (rows || []).map((playlist) => ({
      ...playlist,
      cover_url: playlist.cover_url || "",
      playlist_items: (playlist.playlist_items || []).slice().sort((a, b) => Number(a.position || 0) - Number(b.position || 0)),
    }));
  }

    function renderGuestState() {
    state.publicView = state.publicView && (state.route.profile || state.route.playlist) ? state.publicView : null;
    if (!state.route.playlist) state.playlistPageOpen = false;
    updateWelcomeCopy("Guest");
    setProfileAvatar(null);
    if (els.profileEyebrow) els.profileEyebrow.textContent = state.publicView ? "Public Profile" : "Account";
    if (els.profileTitle) els.profileTitle.textContent = state.publicView ? `@${state.publicView.profile.username}` : "Continue to unlock your profile";
    if (els.profileSubtitle) els.profileSubtitle.textContent = state.publicView ? (state.publicView.profile.bio || `Public playlists from @${state.publicView.profile.username}`) : "Sign in with Google or GitHub to save recent plays, build playlists, and share what you curate.";
    if (els.profileEditorEmpty) els.profileEditorEmpty.textContent = state.publicView ? "This is a public profile view." : "Sign in with Google or GitHub to edit your profile and manage playlists.";
    if (els.profileForm) els.profileForm.classList.add("hidden");
    if (els.profileEditorEmpty) els.profileEditorEmpty.classList.remove("hidden");
    if (els.profileAuthBtn) {
      els.profileAuthBtn.textContent = state.publicView ? "View My Profile" : "Continue";
      els.profileAuthBtn.classList.remove("hidden");
    }
    if (els.profileSignOutBtn) els.profileSignOutBtn.classList.add("hidden");
    if (els.profileShareBtn) els.profileShareBtn.classList.add("hidden");
    if (els.deleteAccountBtn) els.deleteAccountBtn.classList.add("hidden");
    if (els.createPlaylistBtn) els.createPlaylistBtn.disabled = true;
    if (els.homeNewPlaylistBtn) els.homeNewPlaylistBtn.disabled = true;
    if (els.homeAuthBtn) els.homeAuthBtn.textContent = "Continue";
    renderRecentPlayed();
    renderProfileView();
  }

  function renderAccountUi() {
    const name = state.profile ? state.profile.username : (state.user && state.user.email) || "Listener";
    updateWelcomeCopy(name);
    setProfileAvatar(state.profile);
    if (els.homeNewPlaylistBtn) els.homeNewPlaylistBtn.disabled = false;
    if (els.homeAuthBtn) els.homeAuthBtn.textContent = "Open Profile";
    renderRecentPlayed();
    renderProfileView();
    renderPlaylistControls();
  }

  function setProfileAvatar(profile) {
    const label = profile && profile.username ? `@${profile.username}` : "PS";
    if (els.profileAvatar) els.profileAvatar.textContent = initialsFor(label);
    const avatarUrl = state.pendingProfileAvatarUrl || (profile && profile.avatar_url) || "";
    if (els.profileAvatarImage) {
      if (avatarUrl) {
        els.profileAvatarImage.src = avatarUrl;
        els.profileAvatarImage.classList.remove("hidden");
        if (els.profileAvatar) els.profileAvatar.classList.add("hidden");
      } else {
        els.profileAvatarImage.removeAttribute("src");
        els.profileAvatarImage.classList.add("hidden");
        if (els.profileAvatar) els.profileAvatar.classList.remove("hidden");
      }
    }
  }

  function updateWelcomeCopy(name) {
    if (els.welcomeBanner) els.welcomeBanner.textContent = `Welcome, ${name}`;
    if (els.homeWelcomeTitle) els.homeWelcomeTitle.textContent = `Welcome, ${name}`;
    if (els.homeWelcomeCopy) {
      els.homeWelcomeCopy.textContent = state.user ? "Your recent plays and playlists stay synced to this account." : "Sign in with Google or GitHub to sync recent plays, playlists, and your profile.";
    }
    if (els.authOpenBtn) els.authOpenBtn.textContent = state.user ? "My Profile" : "Continue";
  }

  function renderRecentPlayed() {
    if (!els.recentlyPlayedSection || !els.recentlyPlayedList) return;
    const items = state.user ? state.recent : [];
    els.recentlyPlayedList.innerHTML = "";
    els.recentlyPlayedSection.classList.toggle("hidden", !items.length);
    if (!items.length) return;

    const fragment = document.createDocumentFragment();
    items.slice(0, 4).forEach((item) => {
      const record = resolveTrackRecord(item);
      const card = document.createElement("article");
      card.className = "recent-card";

      const playButton = document.createElement("button");
      playButton.type = "button";
      playButton.className = "recent-card-main";
      playButton.addEventListener("click", () => {
        if (record.trackId && state.app.getTrackById(record.trackId)) {
          state.app.playTrackById(record.trackId, { autoPlay: true, manualSelect: true });
        }
      });

      const art = document.createElement(record.coverUrl ? "img" : "div");
      art.className = "recent-card-cover";
      if (record.coverUrl) {
        art.src = record.coverUrl;
        art.alt = `${record.album} cover`;
        art.loading = "lazy";
      } else {
        art.textContent = initialsFor(`${record.artist} ${record.title}`);
      }

      const copy = document.createElement("div");
      copy.className = "recent-card-copy";
      copy.innerHTML = `<h3>${escapeHtml(record.title)}</h3><p>${escapeHtml(record.artist)}</p>`;
      playButton.append(art, copy);

      const footer = document.createElement("div");
      footer.className = "recent-card-footer";
      if (record.releaseId && state.app.getReleaseById(record.releaseId)) {
        const albumButton = document.createElement("button");
        albumButton.type = "button";
        albumButton.className = "text-link-button";
        albumButton.textContent = record.album;
        albumButton.addEventListener("click", () => state.app.openReleaseDetail(record.releaseId));
        footer.append(albumButton);
      } else {
        footer.textContent = record.album || "Recently played";
      }

      card.append(playButton, footer);
      fragment.append(card);
    });

    els.recentlyPlayedList.append(fragment);
  }

  function renderProfileView() {
    const publicView = state.publicView && (state.route.profile || state.route.playlist);
    const profile = publicView ? state.publicView.profile : state.profile;
    const playlists = publicView ? state.publicView.playlists : state.playlists;
    const currentPlaylist = getSelectedPlaylist();
    const showPlaylistPage = Boolean(state.playlistPageOpen && currentPlaylist);

    if (els.profileEyebrow) els.profileEyebrow.textContent = publicView ? "Public Profile" : "Profile";
    if (els.profileTitle) {
      els.profileTitle.textContent = profile ? `@${profile.username}` : "Continue to unlock your profile";
    }
    if (els.profileSubtitle) {
      if (publicView && profile) {
        els.profileSubtitle.textContent = profile.bio || `Public playlists from @${profile.username}`;
      } else if (profile) {
        els.profileSubtitle.textContent = profile.bio || "Sign in with Google or GitHub to save recent plays, build playlists, and share what you curate.";
      } else {
        els.profileSubtitle.textContent = "Sign in with Google or GitHub to save recent plays, build playlists, and share what you curate.";
      }
    }
    setProfileAvatar(profile);

    const canEdit = !publicView && Boolean(state.user && state.profile);
    if (els.profileForm) els.profileForm.classList.toggle("hidden", !canEdit);
    if (els.profileEditorEmpty) {
      const showEmpty = !canEdit;
      els.profileEditorEmpty.classList.toggle("hidden", !showEmpty);
      if (showEmpty) {
        els.profileEditorEmpty.textContent = publicView ? "This is a public profile view." : "Sign in with Google or GitHub to edit your profile and manage playlists.";
      }
    }
    if (canEdit) {
      els.profileUsernameInput.value = state.profile.username || "";
      els.profileBioInput.value = state.profile.bio || "";
    }

    if (els.profileAuthBtn) {
      if (publicView) {
        els.profileAuthBtn.textContent = state.user ? "View My Profile" : "Continue";
        els.profileAuthBtn.classList.remove("hidden");
      } else if (!state.user) {
        els.profileAuthBtn.textContent = "Continue";
        els.profileAuthBtn.classList.remove("hidden");
      } else {
        els.profileAuthBtn.classList.add("hidden");
      }
    }
    if (els.profileSignOutBtn) els.profileSignOutBtn.classList.toggle("hidden", !state.user || publicView);
    if (els.profileShareBtn) els.profileShareBtn.classList.toggle("hidden", !(state.user && state.profile && !publicView));
    if (els.deleteAccountBtn) els.deleteAccountBtn.classList.toggle("hidden", !(state.user && !publicView));
    if (els.createPlaylistBtn) els.createPlaylistBtn.disabled = !(state.user && !publicView);

    if (els.profileGridView) els.profileGridView.classList.toggle("hidden", showPlaylistPage);
    if (els.playlistPage) {
      els.playlistPage.classList.toggle("hidden", !showPlaylistPage);
      els.playlistPage.setAttribute("aria-hidden", String(!showPlaylistPage));
    }

    renderPlaylistList(playlists, Boolean(publicView));
    renderPlaylistDetail();
  }

  function renderPlaylistList(playlists, publicView) {
    if (!els.playlistList || !els.playlistEmpty) return;
    els.playlistList.innerHTML = "";
    els.playlistEmpty.classList.toggle("hidden", playlists.length > 0);
    if (!playlists.length) return;

    const fragment = document.createDocumentFragment();
    playlists.forEach((playlist) => {
      const owner = getPlaylistOwner(playlist);
      const coverUrl = getPlaylistCoverUrl(playlist);
      const card = document.createElement("article");
      card.className = "release-card playlist-release-card" + (playlist.id === state.selectedPlaylistId ? " is-active" : "");
      if (coverUrl) {
        card.style.setProperty("--cover-image", `url("${coverUrl.replace(/"/g, "%22")}")`);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "release-card-button";
      button.dataset.playlistId = playlist.id;

      const badge = document.createElement("span");
      badge.className = "release-badge";
      badge.textContent = publicView || playlist.is_public ? "Playlist" : "Private Playlist";

      const copy = document.createElement("div");
      copy.className = "release-copy";

      const title = document.createElement("div");
      title.className = "release-title";
      title.textContent = playlist.name;

      const sub = document.createElement("div");
      sub.className = "release-sub";
      sub.textContent = owner ? `By @${owner.username}` : "By @listener";

      const meta = document.createElement("div");
      meta.className = "release-meta-row";
      const count = (playlist.playlist_items || []).length;
      meta.textContent = `${count} ${count === 1 ? "track" : "tracks"}${playlist.is_public ? " - public" : " - private"}`;

      copy.append(title, sub, meta);
      button.append(badge, copy);
      card.append(button);
      fragment.append(card);
    });

    els.playlistList.append(fragment);
  }

  function renderPlaylistDetail() {
    if (!els.playlistPage || !els.playlistTrackList) return;
    const playlist = getSelectedPlaylist();
    const publicView = Boolean(state.publicView && (state.route.profile || state.route.playlist));
    const owner = playlist ? getPlaylistOwner(playlist) : null;

    if (!playlist) {
      if (els.playlistPage) els.playlistPage.classList.add("hidden");
      return;
    }

    if (els.playlistDetailBadge) els.playlistDetailBadge.textContent = publicView ? "Shared Playlist" : "Playlist";
    if (els.playlistDetailTitle) els.playlistDetailTitle.textContent = playlist.name;
    if (els.playlistDetailMeta) {
      const items = playlist.playlist_items || [];
      els.playlistDetailMeta.textContent = `${items.length} ${items.length === 1 ? "track" : "tracks"}${playlist.is_public ? " - public" : " - private"}`;
    }
    if (els.playlistDetailDescription) {
      els.playlistDetailDescription.textContent = playlist.description || "A playlist built on Puresound.";
    }
    if (els.playlistOwnerLink) {
      els.playlistOwnerLink.textContent = owner ? `@${owner.username}` : "@listener";
      els.playlistOwnerLink.disabled = !owner;
    }

    const coverUrl = state.pendingPlaylistCoverUrl || getPlaylistCoverUrl(playlist);
    if (els.playlistCoverImage && els.playlistCoverFallback) {
      if (coverUrl) {
        els.playlistCoverImage.src = coverUrl;
        els.playlistCoverImage.classList.remove("hidden");
        els.playlistCoverFallback.classList.add("hidden");
      } else {
        els.playlistCoverImage.removeAttribute("src");
        els.playlistCoverImage.classList.add("hidden");
        els.playlistCoverFallback.textContent = initialsFor(playlist.name || "Playlist");
        els.playlistCoverFallback.classList.remove("hidden");
      }
    }

    if (state.app && typeof state.app.applyVisualAccent === "function") {
      state.app.applyVisualAccent(els.playlistPage, coverUrl, `${playlist.name} ${owner ? owner.username : "playlist"}`);
    }

    const canEdit = !publicView && Boolean(state.user && playlist && playlist.user_id === state.user.id);
    if (els.playlistEditorCard) els.playlistEditorCard.classList.toggle("hidden", !canEdit);
    if (els.playlistPublicToggle) {
      els.playlistPublicToggle.checked = Boolean(playlist.is_public);
      els.playlistPublicToggle.disabled = !canEdit;
    }
    const publicRow = els.playlistPublicToggle ? els.playlistPublicToggle.closest("label") : null;
    if (publicRow) publicRow.classList.toggle("hidden", !canEdit);
    if (els.playlistShareBtn) els.playlistShareBtn.classList.toggle("hidden", !(canEdit || playlist.is_public));
    if (els.playlistDeleteBtn) els.playlistDeleteBtn.classList.toggle("hidden", !canEdit);

    const playlistItems = playlist.playlist_items || [];
    const currentTrack = state.app && state.app.getCurrentTrack ? state.app.getCurrentTrack() : null;
    const playlistIsPlaying = Boolean(
      currentTrack &&
      state.app && typeof state.app.isPlaying === "function" &&
      state.app.isPlaying() &&
      playlistItems.some((item) => resolveTrackRecord(item).trackId === currentTrack.id)
    );

    if (els.playlistPlayBtn) {
      els.playlistPlayBtn.disabled = !playlistItems.length;
      els.playlistPlayBtn.classList.toggle("is-active", playlistIsPlaying);
      els.playlistPlayBtn.setAttribute("aria-label", playlistIsPlaying ? "Pause playlist" : "Play playlist");
    }
    if (els.playlistShuffleBtn) els.playlistShuffleBtn.disabled = !playlistItems.length;

    if (canEdit) {
      if (els.playlistNameInput) els.playlistNameInput.value = playlist.name || "";
      if (els.playlistDescriptionInput) els.playlistDescriptionInput.value = playlist.description || "";
    }

    els.playlistTrackList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    (playlist.playlist_items || []).forEach((item, index) => {
      const record = resolveTrackRecord(item);
      const row = document.createElement("div");
      row.className = "playlist-item-row";

      const number = document.createElement("div");
      number.className = "playlist-item-number";
      number.textContent = String(index + 1);

      const main = document.createElement("button");
      main.type = "button";
      main.className = "playlist-item-main";
      main.disabled = !(record.trackId && state.app.getTrackById(record.trackId));
      main.addEventListener("click", () => {
        if (record.trackId && state.app.getTrackById(record.trackId)) {
          state.app.playTrackById(record.trackId, { autoPlay: true, manualSelect: true });
        }
      });

      const cover = document.createElement(record.coverUrl ? "img" : "div");
      cover.className = "playlist-item-cover";
      if (record.coverUrl) {
        cover.src = record.coverUrl;
        cover.alt = `${record.album} cover`;
        cover.loading = "lazy";
      } else {
        cover.textContent = initialsFor(`${record.artist} ${record.title}`);
      }

      const copy = document.createElement("div");
      copy.className = "playlist-item-copy";
      copy.innerHTML = `<strong>${escapeHtml(record.title)}</strong><span>${escapeHtml(record.artist)}</span>`;
      main.append(cover, copy);

      const creatorCell = document.createElement("div");
      creatorCell.className = "playlist-item-owner";
      if (owner && owner.username) {
        const ownerButton = document.createElement("button");
        ownerButton.type = "button";
        ownerButton.className = "text-link-button";
        ownerButton.textContent = `@${owner.username}`;
        ownerButton.addEventListener("click", () => openPublicProfileRoute(owner.username));
        creatorCell.append(ownerButton);
      } else {
        creatorCell.textContent = "@listener";
      }

      const albumCell = document.createElement("div");
      albumCell.className = "playlist-item-album";
      if (record.releaseId && state.app.getReleaseById(record.releaseId)) {
        const albumButton = document.createElement("button");
        albumButton.type = "button";
        albumButton.className = "text-link-button";
        albumButton.textContent = record.album;
        albumButton.addEventListener("click", () => state.app.openReleaseDetail(record.releaseId));
        albumCell.append(albumButton);
      } else {
        albumCell.textContent = record.album || "-";
      }

      const removeCell = document.createElement("div");
      removeCell.className = "playlist-item-actions";
      if (canEdit) {
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "icon-button playlist-remove-button";
        removeButton.setAttribute("aria-label", `Remove ${record.title}`);
        removeButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6 18 18M18 6 6 18"/></svg>';
        removeButton.addEventListener("click", () => removePlaylistItem(item.id));
        removeCell.append(removeButton);
      }

      row.append(number, main, creatorCell, albumCell, removeCell);
      fragment.append(row);
    });

    els.playlistTrackList.append(fragment);
  }

  function getSelectedPlaylist() {
    const source = state.publicView && (state.route.profile || state.route.playlist) ? state.publicView.playlists : state.playlists;
    return source.find((playlist) => playlist.id === state.selectedPlaylistId) || null;
  }

  function getPlaylistOwner(playlist) {
    if (!playlist) return null;
    if (playlist.owner && playlist.owner.username) return playlist.owner;
    if (state.publicView && state.publicView.profile && (!state.user || playlist.user_id !== state.user.id)) return state.publicView.profile;
    return state.profile;
  }

  function getPlaylistCoverUrl(playlist) {
    if (!playlist) return "";
    return playlist.cover_url || ((playlist.playlist_items || []).find((item) => item.cover_url) || {}).cover_url || "";
  }

  function openPlaylistPage(playlistId) {
    state.selectedPlaylistId = playlistId;
    state.playlistPageOpen = true;
    if (state.app) state.app.switchView("profile");
    renderProfileView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closePlaylistPage() {
    state.playlistPageOpen = false;
    if (state.route.playlist) {
      const owner = getPlaylistOwner(getSelectedPlaylist());
      if (owner && owner.username) {
        history.replaceState({}, "", `${getBaseUrl()}?profile=${encodeURIComponent(owner.username)}`);
        state.route = { profile: owner.username, playlist: "" };
      } else {
        clearRoute();
      }
    }
    renderProfileView();
  }

  function selectPlaylist(playlistId) {
    state.selectedPlaylistId = playlistId;
    renderPlaylistList(state.publicView && (state.route.profile || state.route.playlist) ? state.publicView.playlists : state.playlists, Boolean(state.publicView && (state.route.profile || state.route.playlist)));
    renderPlaylistDetail();
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!state.user || !state.client || !state.profile) return;
    const username = sanitizeUsername(els.profileUsernameInput.value);
    if (!username) {
      setAuthStatus("Username can use letters, numbers, underscores, and hyphens.", true);
      return;
    }

    const payload = {
      username,
      bio: (els.profileBioInput.value || "").trim(),
      avatar_url: state.pendingProfileAvatarUrl || state.profile.avatar_url || "",
    };

    const { data, error } = await state.client.from("profiles").update(payload).eq("id", state.user.id).select("*").single();
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not save profile.", true);
      return;
    }
    state.pendingProfileAvatarUrl = "";
    state.profile = data;
    renderAccountUi();
    setAuthStatus("Profile saved.");
  }

    async function createPlaylistFlow(addAfterCreate = false) {
    if (!state.user) {
      openAuthDialog();
      return;
    }
    const name = window.prompt("Playlist name:", "New Playlist");
    if (!name) return;

    const { data, error } = await state.client.from("playlists").insert({
      user_id: state.user.id,
      name: name.trim(),
      is_public: false,
      description: "",
      cover_url: "",
    }).select("id,user_id,name,description,cover_url,is_public,created_at,updated_at,playlist_items(id,track_id,release_id,title,artist,album,cover_url,position,added_at)").single();
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not create playlist.", true);
      return;
    }

    const playlist = normalizePlaylistRows([{ ...data, playlist_items: data.playlist_items || [] }])[0];
    state.playlists.unshift(playlist);
    state.selectedPlaylistId = playlist.id;
    state.playlistPageOpen = true;
    renderProfileView();
    renderPlaylistControls();

    if (addAfterCreate && state.pickerAction) {
      await applyPickerSelection(playlist.id);
      return;
    }

    setAuthStatus(`Created playlist ${playlist.name}.`);
    if (state.app) state.app.switchView("profile");
  }

  async function saveSelectedPlaylistMeta(event) {
    event.preventDefault();
    const playlist = getSelectedPlaylist();
    if (!playlist || !state.user) return;
    const payload = {
      name: (els.playlistNameInput.value || "").trim() || playlist.name,
      description: (els.playlistDescriptionInput.value || "").trim(),
      cover_url: state.pendingPlaylistCoverUrl || playlist.cover_url || "",
    };
    const { data, error } = await state.client.from("playlists").update(payload).eq("id", playlist.id).select("*").single();
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not save playlist details.", true);
      return;
    }
    Object.assign(playlist, data);
    state.pendingPlaylistCoverUrl = "";
    renderProfileView();
    setAuthStatus("Playlist details saved.");
  }

  async function deleteSelectedPlaylist() {
    const playlist = getSelectedPlaylist();
    if (!playlist || !state.user) return;
    if (!window.confirm(`Delete ${playlist.name}?`)) return;
    const { error } = await state.client.from("playlists").delete().eq("id", playlist.id);
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not delete playlist.", true);
      return;
    }
    state.playlists = state.playlists.filter((entry) => entry.id !== playlist.id);
    state.selectedPlaylistId = state.playlists[0] ? state.playlists[0].id : "";
    state.playlistPageOpen = false;
    renderProfileView();
    setAuthStatus("Playlist deleted.");
  }

  async function updateSelectedPlaylistVisibility() {
    const playlist = getSelectedPlaylist();
    if (!playlist || !state.user) return;
    const isPublic = Boolean(els.playlistPublicToggle.checked);
    const { data, error } = await state.client.from("playlists").update({ is_public: isPublic }).eq("id", playlist.id).select("*").single();
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not update playlist visibility.", true);
      els.playlistPublicToggle.checked = playlist.is_public;
      return;
    }
    playlist.is_public = data.is_public;
    renderProfileView();
    setAuthStatus(isPublic ? "Playlist is now public." : "Playlist is now private.");
  }

  async function removePlaylistItem(itemId) {
    if (!state.user || !itemId) return;
    const playlist = getSelectedPlaylist();
    if (!playlist) return;
    const { error } = await state.client.from("playlist_items").delete().eq("id", itemId);
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not remove track from playlist.", true);
      return;
    }
    playlist.playlist_items = (playlist.playlist_items || []).filter((item) => item.id !== itemId).map((item, index) => ({ ...item, position: index }));
    renderPlaylistDetail();
  }

  function requestAddCurrentTrack() {
    const track = state.app && state.app.getCurrentTrack ? state.app.getCurrentTrack() : null;
    if (!track) {
      window.alert("Play a track first.");
      return;
    }
    if (track.source === "local") {
      window.alert("Local tracks cannot be saved to cloud playlists.");
      return;
    }
    openPlaylistPicker({ type: "track", tracks: [track] });
  }

  function requestAddTrackById(trackId) {
    const track = trackId && state.app ? state.app.getTrackById(trackId) : null;
    if (!track) return;
    if (track.source === "local") {
      window.alert("Local tracks cannot be saved to cloud playlists.");
      return;
    }
    openPlaylistPicker({ type: "track", tracks: [track] });
  }

  function requestAddSelectedRelease() {
    const release = state.app && state.app.getSelectedRelease ? state.app.getSelectedRelease() : null;
    if (!release || !release.tracks || !release.tracks.length) {
      window.alert("Open a release first.");
      return;
    }
    const remoteTracks = release.tracks.filter((track) => track.source !== "local");
    if (!remoteTracks.length) {
      window.alert("Local releases cannot be saved to cloud playlists.");
      return;
    }
    openPlaylistPicker({ type: "release", tracks: remoteTracks, release });
  }

  function openPlaylistPicker(action) {
    if (!state.user) {
      openAuthDialog();
      return;
    }
    state.pickerAction = action;
    renderPlaylistPicker();
    toggleDialog(els.playlistPickerModal, true);
  }

  function renderPlaylistPicker() {
    if (!els.playlistPickerList || !state.pickerAction) return;
    const title = state.pickerAction.type === "release" ? `Save ${state.pickerAction.release.title}` : `Save ${state.pickerAction.tracks[0].title}`;
    if (els.playlistPickerTitle) els.playlistPickerTitle.textContent = title;
    if (els.playlistPickerCopy) {
      els.playlistPickerCopy.textContent = state.pickerAction.type === "release" ? "Add this release to one of your playlists." : "Add this track to one of your playlists.";
    }
    els.playlistPickerList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    state.playlists.forEach((playlist) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "picker-button";
      button.dataset.playlistPick = playlist.id;
      button.innerHTML = `<strong>${escapeHtml(playlist.name)}</strong><span>${(playlist.playlist_items || []).length} tracks</span>`;
      fragment.append(button);
    });
    els.playlistPickerList.append(fragment);
  }

  async function applyPickerSelection(playlistId) {
    const playlist = state.playlists.find((entry) => entry.id === playlistId);
    if (!playlist || !state.pickerAction) return;
    const startPosition = (playlist.playlist_items || []).reduce((max, item) => Math.max(max, Number(item.position || 0)), -1) + 1;
    const additions = state.pickerAction.tracks.map((track, index) => ({
      playlist_id: playlist.id,
      track_id: track.id,
      release_id: track.releaseId,
      title: track.title,
      artist: track.artist,
      album: track.album,
      cover_url: track.coverUrl || "",
      position: startPosition + index,
    }));

    const { data, error } = await state.client.from("playlist_items").insert(additions).select("*");
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Could not add to playlist.", true);
      return;
    }

    playlist.playlist_items = (playlist.playlist_items || []).concat(data || []).sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
    state.selectedPlaylistId = playlist.id;
    state.playlistPageOpen = true;
    toggleDialog(els.playlistPickerModal, false);
    if (state.app) state.app.switchView("profile");
    renderProfileView();
    setAuthStatus(state.pickerAction.type === "release" ? "Release added to playlist." : "Track added to playlist.");
    state.pickerAction = null;
  }

  async function handleProfileAvatarSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    state.pendingProfileAvatarUrl = await readFileAsDataUrl(file);
    setProfileAvatar(state.profile);
  }

  async function handlePlaylistCoverSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    state.pendingPlaylistCoverUrl = await readFileAsDataUrl(file);
    renderPlaylistDetail();
  }

  async function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(reader.error || new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
  }

  function playSelectedPlaylist(shuffle = false) {
    const playlist = getSelectedPlaylist();
    if (!playlist) return;
    const tracks = (playlist.playlist_items || []).map((item) => resolveTrackRecord(item)).filter((item) => item.trackId && state.app.getTrackById(item.trackId));
    if (!tracks.length) return;

    const currentTrack = state.app.getCurrentTrack ? state.app.getCurrentTrack() : null;
    const playlistIsPlaying = Boolean(
      !shuffle &&
      currentTrack &&
      typeof state.app.isPlaying === "function" &&
      state.app.isPlaying() &&
      tracks.some((item) => item.trackId === currentTrack.id)
    );

    if (playlistIsPlaying && typeof state.app.togglePlayPause === "function") {
      state.app.togglePlayPause();
      return;
    }

    const target = shuffle ? tracks[Math.floor(Math.random() * tracks.length)] : tracks[0];
    state.app.playTrackById(target.trackId, { autoPlay: true, manualSelect: true });
  }

  function handlePlaylistOwnerClick() {
    const playlist = getSelectedPlaylist();
    const owner = getPlaylistOwner(playlist);
    if (owner && owner.username) openPublicProfileRoute(owner.username);
  }

  function openPublicProfileRoute(username) {
    if (!username) return;
    if (state.user && state.profile && state.profile.username === username) {
      showOwnProfile();
      return;
    }
    history.pushState({}, "", `${getBaseUrl()}?profile=${encodeURIComponent(username)}`);
    processRoute().catch((error) => console.error(error));
  }

  async function deleteOwnAccount() {
    if (!state.user || !state.client) return;
    if (!window.confirm("Delete your account and all synced data? This cannot be undone.")) return;
    const { error } = await state.client.rpc("delete_own_account");
    if (error) {
      console.error(error);
      setAuthStatus(error.message || "Account deletion needs the updated Supabase schema.", true);
      return;
    }
    await state.client.auth.signOut();
    state.playlistPageOpen = false;
    setAuthStatus("Account deleted.");
  }

  async function handleTrackChanged(detail) {
    const track = detail.track;
    if (state.playlistPageOpen) renderPlaylistDetail();
    if (!track || !state.user || !state.client || track.source === "local") return;

    const payload = {
      user_id: state.user.id,
      track_id: track.id,
      release_id: track.releaseId,
      title: track.title,
      artist: track.artist,
      album: track.album,
      cover_url: track.coverUrl || "",
      played_at: new Date().toISOString(),
    };

    state.recent = [payload].concat(state.recent.filter((entry) => entry.track_id !== payload.track_id)).slice(0, 4);
    renderRecentPlayed();

    const { error } = await state.client.from("recently_played").upsert(payload, { onConflict: "user_id,track_id" });
    if (error) {
      console.error(error);
    }
  }

  async function shareProfileLink() {
    if (!state.profile) return;
    const url = `${getBaseUrl()}?profile=${encodeURIComponent(state.profile.username)}`;
    await copyText(url, "Profile link copied.");
  }

  async function shareSelectedPlaylist() {
    const playlist = getSelectedPlaylist();
    if (!playlist) return;
    if (!playlist.is_public) {
      window.alert("Make the playlist public before sharing it.");
      return;
    }
    const url = `${getBaseUrl()}?playlist=${encodeURIComponent(playlist.id)}`;
    await copyText(url, "Playlist link copied.");
  }

  async function copyText(value, successMessage) {
    try {
      await navigator.clipboard.writeText(value);
      setAuthStatus(successMessage);
    } catch (_error) {
      window.prompt("Copy this link:", value);
    }
  }

  async function processRoute() {
    const params = new URLSearchParams(window.location.search);
    state.route = {
      profile: (params.get("profile") || "").trim(),
      playlist: (params.get("playlist") || "").trim(),
    };

    if (!state.authConfigured || (!state.route.profile && !state.route.playlist)) {
      if (!state.route.profile && !state.route.playlist) {
        state.publicView = null;
        renderProfileView();
      }
      return;
    }

    if (state.route.playlist) {
      await loadSharedPlaylist(state.route.playlist);
      return;
    }

    if (state.route.profile) {
      await loadPublicProfile(state.route.profile);
    }
  }

  async function loadPublicProfile(username) {
    const { data: profile, error: profileError } = await state.client.from("profiles").select("*").eq("username", username).maybeSingle();
    if (profileError) {
      console.error(profileError);
      return;
    }
    if (!profile) return;

    const { data: playlists, error: playlistError } = await state.client
      .from("playlists")
      .select("id,user_id,name,description,cover_url,is_public,created_at,updated_at,playlist_items(id,track_id,release_id,title,artist,album,cover_url,position,added_at)")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("updated_at", { ascending: false });
    if (playlistError) {
      console.error(playlistError);
      return;
    }

    state.publicView = {
      profile,
      playlists: normalizePlaylistRows(playlists || []),
    };
    state.selectedPlaylistId = state.publicView.playlists[0] ? state.publicView.playlists[0].id : "";
    state.playlistPageOpen = false;
    state.app.switchView("profile");
    renderProfileView();
  }

  async function loadSharedPlaylist(playlistId) {
    const { data: playlist, error } = await state.client
      .from("playlists")
      .select("id,user_id,name,description,cover_url,is_public,created_at,updated_at,playlist_items(id,track_id,release_id,title,artist,album,cover_url,position,added_at)")
      .eq("id", playlistId)
      .eq("is_public", true)
      .maybeSingle();
    if (error) {
      console.error(error);
      return;
    }
    if (!playlist) return;

    const { data: profile } = await state.client.from("profiles").select("*").eq("id", playlist.user_id).maybeSingle();
    state.publicView = {
      profile: profile || { username: "shared", bio: "" },
      playlists: normalizePlaylistRows([playlist]),
    };
    state.selectedPlaylistId = playlist.id;
    state.playlistPageOpen = true;
    state.app.switchView("profile");
    renderProfileView();
  }

  function clearRoute() {
    if (window.location.search) {
      history.replaceState({}, "", getBaseUrl());
    }
    state.route = { profile: "", playlist: "" };
    state.publicView = null;
  }

  function showOwnProfile() {
    clearRoute();
    if (state.app) state.app.switchView("profile");
    renderProfileView();
  }

  function renderPlaylistControls() {
    const canSave = Boolean(state.user);
    if (els.saveTrackBtn) els.saveTrackBtn.disabled = !canSave;
    if (els.saveReleaseBtn) els.saveReleaseBtn.disabled = !canSave;
  }

  function resolveTrackRecord(record) {
    const trackId = record.track_id || record.trackId || "";
    const liveTrack = trackId ? state.app.getTrackById(trackId) : null;
    const releaseId = (liveTrack && liveTrack.releaseId) || record.release_id || record.releaseId || "";
    const liveRelease = releaseId ? state.app.getReleaseById(releaseId) : null;
    return {
      trackId,
      releaseId,
      title: (liveTrack && liveTrack.title) || record.title || "Unknown track",
      artist: (liveTrack && liveTrack.artist) || record.artist || "Unknown artist",
      album: (liveTrack && liveTrack.album) || record.album || (liveRelease && liveRelease.title) || "Unknown release",
      coverUrl: (liveTrack && liveTrack.coverUrl) || record.cover_url || record.coverUrl || (liveRelease && liveRelease.coverUrl) || "",
    };
  }

  function sanitizeUsername(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
  }

  function initialsFor(value) {
    const parts = String(value || "Puresound").trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => (part[0] ? part[0].toUpperCase() : "")).join("") || "PS";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setAuthStatus(message, isError = false) {
    if (!els.authStatus) return;
    els.authStatus.textContent = message;
    els.authStatus.classList.toggle("is-error", Boolean(isError));
  }
})();















