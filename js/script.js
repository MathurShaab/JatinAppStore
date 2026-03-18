/* ══════════════════════════════════════════
   JATIN APPS — Production Script
   Structure:
   1.  Config & Constants
   2.  Default App Data
   3.  State
   4.  Bootstrap
   5.  Persistence (localStorage)
   6.  Theme
   7.  Icon refresh (Lucide)
   8.  Home View
   9.  App Card
   10. Detail View
   11. Admin Panel
   12. App Form (Add/Edit)
   13. Delete
   14. Login / Logout
   15. Install Flow
   16. URL Resolver (GitHub / Drive)
   17. Link Converter (Admin tool)
   18. Search & Category Filter
   19. Event Binding
   20. Toast Notifications
   21. Utilities
══════════════════════════════════════════ */

/* ── 1. CONFIG & CONSTANTS ──────────────── */
var ADMIN = { username: "admin", password: "12345" };

var LS = {
  apps:    "ja_apps",
  session: "ja_session",
  theme:   "ja_theme"
};

var DEV   = "Jatin Mathur";
var STORE = "Jatin Apps";

var CAT_ICONS = {
  All:           "layout-grid",
  Tools:         "wrench",
  Productivity:  "zap",
  Social:        "users",
  Entertainment: "clapperboard"
};

/* ── 2. DEFAULT APP DATA ────────────────── */
var DEFAULT_APPS = [
  {
    appId:       "app_001",
    appName:     "TaskFlow Pro",
    appIcon:     "https://api.iconify.design/fluent-emoji-flat:check-mark-button.svg?width=128&height=128",
    description: "A powerful task management app that helps you stay organized. Create projects, set deadlines, assign priorities and track progress with an intuitive interface.",
    version:     "2.4.1",
    size:        "18 MB",
    category:    "Productivity",
    screenshots: [
      "https://placehold.co/180x320/7c6dfa/ffffff?text=Home",
      "https://placehold.co/180x320/22d3a0/ffffff?text=Tasks",
      "https://placehold.co/180x320/ff4d6d/ffffff?text=Calendar"
    ],
    downloadUrl: "#",
    releaseDate: "2025-03-10"
  },
  {
    appId:       "app_002",
    appName:     "SnapTools",
    appIcon:     "https://api.iconify.design/fluent-emoji-flat:hammer-and-wrench.svg?width=128&height=128",
    description: "All-in-one utility toolkit for Android. File manager, system cleaner, app backup and battery optimizer all in one app.",
    version:     "1.8.0",
    size:        "12 MB",
    category:    "Tools",
    screenshots: [
      "https://placehold.co/180x320/a695ff/ffffff?text=Tools",
      "https://placehold.co/180x320/22d3a0/ffffff?text=Cleaner"
    ],
    downloadUrl: "#",
    releaseDate: "2025-02-20"
  },
  {
    appId:       "app_003",
    appName:     "SocialHub",
    appIcon:     "https://api.iconify.design/fluent-emoji-flat:speech-balloon.svg?width=128&height=128",
    description: "Connect with friends in real time. Share photos, videos and messages all in one beautiful social experience.",
    version:     "3.1.2",
    size:        "28 MB",
    category:    "Social",
    screenshots: [
      "https://placehold.co/180x320/ff4d6d/ffffff?text=Feed",
      "https://placehold.co/180x320/7c6dfa/ffffff?text=Chat"
    ],
    downloadUrl: "#",
    releaseDate: "2025-03-05"
  },
  {
    appId:       "app_004",
    appName:     "StreamVibe",
    appIcon:     "https://api.iconify.design/fluent-emoji-flat:clapper-board.svg?width=128&height=128",
    description: "Stream movies, shows and music with stunning quality. Offline downloads and smart recommendations.",
    version:     "5.0.3",
    size:        "40 MB",
    category:    "Entertainment",
    screenshots: [
      "https://placehold.co/180x320/ff4d6d/ffffff?text=Movies",
      "https://placehold.co/180x320/7c6dfa/ffffff?text=Music"
    ],
    downloadUrl: "#",
    releaseDate: "2025-01-15"
  },
  {
    appId:       "app_005",
    appName:     "NoteNest",
    appIcon:     "https://api.iconify.design/fluent-emoji-flat:memo.svg?width=128&height=128",
    description: "Beautiful markdown notes with cloud sync. Organize thoughts and ideas with tags, notebooks and powerful search.",
    version:     "1.3.0",
    size:        "9 MB",
    category:    "Productivity",
    screenshots: [
      "https://placehold.co/180x320/22d3a0/ffffff?text=Notes",
      "https://placehold.co/180x320/a695ff/ffffff?text=Editor"
    ],
    downloadUrl: "#",
    releaseDate: "2025-03-01"
  },
  {
    appId:       "app_006",
    appName:     "SplitVise",
    appIcon:     "https://api.iconify.design/fluent-emoji-flat:money-bag.svg?width=128&height=128",
    description: "Split bills and expenses with friends effortlessly. Track who owes what and settle up easily.",
    version:     "1.0.0",
    size:        "8 MB",
    category:    "Tools",
    screenshots: [
      "https://placehold.co/180x320/7c6dfa/ffffff?text=Split",
      "https://placehold.co/180x320/22d3a0/ffffff?text=Settle"
    ],
    downloadUrl: "https://github.com/MathurShaab/SplitVise/raw/master/app-release.apk",
    releaseDate: "2026-03-01"
  }
];

/* ── 3. STATE ───────────────────────────── */
var apps          = [];
var adminLoggedIn = false;
var currentView   = "home";   // "home" | "detail" | "admin"
var activeCategory = "All";
var editingAppId  = null;
var pendingDeleteId = null;
var installStates = {};       // appId → "installing" | "installed"

/* ── 4. BOOTSTRAP ───────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  loadApps();
  restoreSession();
  renderHome();
  bindEvents();
  initConverter();
});

/* ── 5. PERSISTENCE ─────────────────────── */
function loadApps() {
  try {
    var raw = localStorage.getItem(LS.apps);
    apps = raw ? JSON.parse(raw) : DEFAULT_APPS.slice();
  } catch (e) {
    apps = DEFAULT_APPS.slice();
  }
}

function saveApps() {
  try { localStorage.setItem(LS.apps, JSON.stringify(apps)); } catch (e) {}
}

function restoreSession() {
  adminLoggedIn = localStorage.getItem(LS.session) === "1";
  syncAdminUI();
}

/* ── 6. THEME ───────────────────────────── */
function loadTheme() {
  var t = localStorage.getItem(LS.theme) || "dark";
  document.documentElement.setAttribute("data-theme", t);
}

function toggleTheme() {
  var html = document.documentElement;
  var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem(LS.theme, next);
}

/* ── 7. LUCIDE ICON REFRESH ─────────────── */
function icons() {
  if (window.lucide) lucide.createIcons();
}

/* ── 8. HOME VIEW ───────────────────────── */
function showHome() {
  currentView = "home";
  el("mainView").hidden    = false;
  el("detailView").hidden  = true;
  el("adminPanel").hidden  = true;
  el("siteFooter").hidden  = false;
  el("fabFloat").hidden    = !adminLoggedIn;
  renderHome(el("searchInput").value, activeCategory);
  scrollToTop();
}

function renderHome(query, cat) {
  query = (query || "").trim().toLowerCase();
  cat   = cat || activeCategory || "All";

  var filtered = apps.slice();
  if (cat !== "All") filtered = filtered.filter(function (a) { return a.category === cat; });
  if (query) filtered = filtered.filter(function (a) {
    return a.appName.toLowerCase().includes(query) || a.description.toLowerCase().includes(query);
  });

  var icon = CAT_ICONS[cat] || "layout-grid";
  el("sectionTitle").innerHTML = '<i data-lucide="' + icon + '"></i>' + (cat === "All" ? "All Apps" : cat);
  el("appCount").textContent   = filtered.length + " app" + (filtered.length !== 1 ? "s" : "");
  el("appGrid").innerHTML      = "";
  el("emptyState").hidden      = filtered.length > 0;

  filtered.forEach(function (app, i) {
    el("appGrid").appendChild(buildCard(app, i));
  });
  icons();
}

/* ── 9. APP CARD ────────────────────────── */
function buildCard(app, index) {
  var state = installStates[app.appId];
  var btnClass = "card-install-btn" + (state === "installed" ? " installed" : state === "installing" ? " loading" : "");
  var btnIcon  = state === "installed" ? "check-circle" : state === "installing" ? "loader" : "download";
  var btnLabel = state === "installed" ? "Installed" : state === "installing" ? "Installing…" : "Install";
  var btnDisabled = state === "installing" ? "disabled" : "";

  var div = document.createElement("div");
  div.className = "app-card";
  div.dataset.appid = app.appId;
  div.style.animationDelay = (index * 0.05) + "s";
  div.innerHTML =
    '<div class="card-icon-wrap">' +
      '<img class="card-icon" src="' + esc(app.appIcon) + '" alt="' + esc(app.appName) + '" ' +
        'onerror="this.src=\'https://placehold.co/60x60/252538/a695ff?text=' + encodeURIComponent((app.appName || "?")[0]) + '\'">' +
    '</div>' +
    '<div class="card-cat">' + esc(app.category) + '</div>' +
    '<div class="card-name">' + esc(app.appName) + '</div>' +
    '<div class="card-desc">' + esc(app.description) + '</div>' +
    '<div class="card-dev"><span class="card-dev-dot"></span>by ' + DEV + '</div>' +
    '<button class="' + btnClass + '" ' + btnDisabled + '>' +
      '<i data-lucide="' + btnIcon + '"></i>' + btnLabel +
    '</button>';

  div.querySelector(".card-install-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    handleInstall(app);
  });
  div.addEventListener("click", function () { showDetail(app.appId); });
  return div;
}

function refreshCard(appId) {
  var card = document.querySelector('.app-card[data-appid="' + appId + '"]');
  if (!card) return;
  var app = apps.find(function (a) { return a.appId === appId; });
  if (!app) return;
  var state = installStates[appId];
  var btn = card.querySelector(".card-install-btn");
  if (!btn) return;
  if (state === "installed") {
    btn.className = "card-install-btn installed";
    btn.innerHTML = '<i data-lucide="check-circle"></i>Installed';
    btn.disabled = false;
  } else if (state === "installing") {
    btn.className = "card-install-btn loading";
    btn.innerHTML = '<i data-lucide="loader"></i>Installing…';
    btn.disabled = true;
  } else {
    btn.className = "card-install-btn";
    btn.innerHTML = '<i data-lucide="download"></i>Install';
    btn.disabled = false;
  }
  icons();
}

/* ── 10. DETAIL VIEW ────────────────────── */
function showDetail(appId) {
  var app = apps.find(function (a) { return a.appId === appId; });
  if (!app) return;

  currentView = "detail";
  el("mainView").hidden   = true;
  el("adminPanel").hidden = true;
  el("siteFooter").hidden = true;
  el("fabFloat").hidden   = true;
  el("detailView").hidden = false;

  /* Icon */
  var img = el("dIcon");
  img.src = app.appIcon;
  img.alt = app.appName;
  img.onerror = function () {
    this.src = "https://placehold.co/100x100/252538/a695ff?text=" + encodeURIComponent((app.appName || "?")[0]);
  };

  /* Meta */
  el("dName").textContent    = app.appName;
  el("dCat").textContent     = app.category;
  el("dVersion").textContent = "v" + app.version;
  el("dSize").textContent    = app.size;
  el("dDate").textContent    = app.releaseDate ? fmtDate(app.releaseDate) : "";
  el("dDesc").textContent    = app.description;

  /* Install button */
  var dBtn = el("dInstallBtn");
  dBtn.dataset.appid = appId;
  setDetailInstallBtn(dBtn, installStates[appId]);
  dBtn.onclick = function () { handleInstall(app); };

  /* Screenshots */
  var slider = el("screenshotSlider");
  slider.innerHTML = "";
  var shots = Array.isArray(app.screenshots) ? app.screenshots.filter(Boolean) : [];
  if (shots.length) {
    shots.forEach(function (url) {
      var i = document.createElement("img");
      i.className = "screenshot-img";
      i.src = url.trim();
      i.alt = "Screenshot";
      i.onerror = function () { this.src = "https://placehold.co/180x320/1e1e2e/7c6dfa?text=Screenshot"; };
      slider.appendChild(i);
    });
  } else {
    slider.innerHTML = '<p style="color:var(--text3);font-size:.82rem;padding:8px 0;">No screenshots provided.</p>';
  }

  icons();
  scrollToTop();
}

function setDetailInstallBtn(btn, state) {
  btn.className = "install-btn";
  btn.disabled = false;
  if (state === "installed") {
    btn.classList.add("installed");
    btn.innerHTML = '<i data-lucide="check-circle"></i>Installed';
  } else if (state === "installing") {
    btn.classList.add("loading");
    btn.innerHTML = '<i data-lucide="loader"></i>Installing…';
    btn.disabled = true;
  } else {
    btn.innerHTML = '<i data-lucide="download"></i>Install';
  }
  icons();
}

/* ── 11. ADMIN PANEL ────────────────────── */
function showAdminPanel() {
  if (!adminLoggedIn) { openLoginModal(); return; }
  currentView = "admin";
  el("mainView").hidden   = true;
  el("detailView").hidden = true;
  el("siteFooter").hidden = true;
  el("fabFloat").hidden   = true;
  el("adminPanel").hidden = false;
  renderAdmin();
  scrollToTop();
}

function renderAdmin() {
  renderStats();
  renderTable();
}

function renderStats() {
  var cats = {};
  apps.forEach(function (a) { cats[a.category] = (cats[a.category] || 0) + 1; });
  var html = stat(apps.length, "Total Apps");
  Object.keys(cats).forEach(function (k) { html += stat(cats[k], k); });
  el("adminStats").innerHTML = html;
}

function stat(n, label) {
  return '<div class="stat-card"><div class="stat-num">' + n + '</div><div class="stat-lbl">' + label + '</div></div>';
}

function renderTable() {
  var tbody = el("adminTableBody");
  if (!apps.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:40px;">No apps yet — click Add App to get started.</td></tr>';
    return;
  }
  tbody.innerHTML = apps.map(function (app) {
    var placeholder = "https://placehold.co/38x38/252538/a695ff?text=" + encodeURIComponent((app.appName || "?")[0]);
    return '<tr>' +
      '<td><img class="table-icon" src="' + esc(app.appIcon) + '" alt="" onerror="this.src=\'' + placeholder + '\'"></td>' +
      '<td><div class="table-name">' + esc(app.appName) + '</div></td>' +
      '<td><span class="cat-tag">' + esc(app.category) + '</span></td>' +
      '<td>' + esc(app.version) + '</td>' +
      '<td>' + (app.releaseDate ? fmtDate(app.releaseDate) : "—") + '</td>' +
      '<td><div class="table-actions">' +
        '<button class="table-edit-btn" data-id="' + esc(app.appId) + '"><i data-lucide="pencil"></i>Edit</button>' +
        '<button class="table-del-btn"  data-id="' + esc(app.appId) + '"><i data-lucide="trash-2"></i>Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join("");

  tbody.querySelectorAll(".table-edit-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { openEditModal(btn.dataset.id); });
  });
  tbody.querySelectorAll(".table-del-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { openDeleteModal(btn.dataset.id); });
  });
  icons();
}

function syncAdminUI() {
  el("fabFloat").hidden = !(adminLoggedIn && currentView === "home");
}

/* ── 12. APP FORM ───────────────────────── */
function openAddModal() {
  editingAppId = null;
  el("appModalTitle").innerHTML = '<i data-lucide="package-plus"></i>Add New App';
  el("appForm").reset();
  el("editAppId").value = "";
  el("appFormSubmit").innerHTML = '<i data-lucide="save"></i>Save App';
  resetConverter();
  el("appModal").hidden = false;
  icons();
}

function openEditModal(appId) {
  var app = apps.find(function (a) { return a.appId === appId; });
  if (!app) return;
  editingAppId = appId;
  el("appModalTitle").innerHTML = '<i data-lucide="pencil"></i>Edit App';
  el("editAppId").value         = appId;
  el("fName").value             = app.appName;
  el("fCat").value              = app.category;
  el("fIcon").value             = app.appIcon;
  el("fDesc").value             = app.description;
  el("fVersion").value          = app.version;
  el("fSize").value             = app.size;
  el("fScreenshots").value      = (app.screenshots || []).join(", ");
  el("fDownload").value         = app.downloadUrl;
  el("fDate").value             = app.releaseDate || "";
  el("appFormSubmit").innerHTML = '<i data-lucide="save"></i>Update App';
  resetConverter();
  el("appModal").hidden = false;
  icons();
}

function closeAppModal() {
  el("appModal").hidden = true;
  editingAppId = null;
}

function handleAppFormSubmit(e) {
  e.preventDefault();
  var screenshots = el("fScreenshots").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  var data = {
    appName:     el("fName").value.trim(),
    appIcon:     el("fIcon").value.trim(),
    description: el("fDesc").value.trim(),
    version:     el("fVersion").value.trim(),
    size:        el("fSize").value.trim(),
    category:    el("fCat").value,
    screenshots: screenshots,
    downloadUrl: el("fDownload").value.trim(),
    releaseDate: el("fDate").value
  };

  if (editingAppId) {
    var idx = apps.findIndex(function (a) { return a.appId === editingAppId; });
    if (idx !== -1) apps[idx] = Object.assign({}, apps[idx], data);
    toast("App updated successfully!", "success", "check-circle");
  } else {
    apps.unshift(Object.assign({ appId: "app_" + Date.now() }, data));
    toast("App added to " + STORE + "!", "success", "check-circle");
  }

  saveApps();
  closeAppModal();
  renderAdmin();
  renderHome(el("searchInput").value, activeCategory);
}

/* ── 13. DELETE ─────────────────────────── */
function openDeleteModal(appId) {
  var app = apps.find(function (a) { return a.appId === appId; });
  if (!app) return;
  pendingDeleteId = appId;
  el("deleteMsg").textContent = '"' + app.appName + '" will be permanently removed from ' + STORE + '.';
  el("deleteModal").hidden = false;
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  apps = apps.filter(function (a) { return a.appId !== pendingDeleteId; });
  delete installStates[pendingDeleteId];
  saveApps();
  pendingDeleteId = null;
  el("deleteModal").hidden = true;
  renderAdmin();
  renderHome(el("searchInput").value, activeCategory);
  toast("App deleted.", "info", "trash-2");
}

/* ── 14. LOGIN / LOGOUT ─────────────────── */
function openLoginModal() {
  el("loginError").textContent = "";
  el("loginUser").value = "";
  el("loginPass").value = "";
  el("loginModal").hidden = false;
  setTimeout(function () { el("loginUser").focus(); }, 80);
}

function handleLogin(e) {
  e.preventDefault();
  var u = el("loginUser").value.trim();
  var p = el("loginPass").value;
  if (u === ADMIN.username && p === ADMIN.password) {
    adminLoggedIn = true;
    localStorage.setItem(LS.session, "1");
    el("loginModal").hidden = true;
    syncAdminUI();
    showAdminPanel();
    toast("Welcome back, " + DEV + "!", "success", "shield-check");
  } else {
    el("loginError").textContent = "Incorrect username or password.";
    el("loginPass").value = "";
    el("loginPass").focus();
  }
}

function logout() {
  adminLoggedIn = false;
  localStorage.removeItem(LS.session);
  syncAdminUI();
  showHome();
  toast("Logged out successfully.", "info", "log-out");
}

/* ── 15. INSTALL FLOW ───────────────────── */
function handleInstall(app) {
  var url = app.downloadUrl;
  var id  = app.appId;

  if (!url || url === "#") {
    toast("Download link not available for " + app.appName, "error", "alert-circle");
    return;
  }
  if (installStates[id] === "installing") return;

  if (installStates[id] === "installed") {
    startDownload(url);
    toast("Re-downloading " + app.appName + "…", "info", "download");
    return;
  }

  /* Start install sequence */
  installStates[id] = "installing";
  refreshCard(id);
  var dBtn = el("dInstallBtn");
  if (dBtn && dBtn.dataset.appid === id) setDetailInstallBtn(dBtn, "installing");

  showInstallModal(app.appName, function () {
    installStates[id] = "installed";
    refreshCard(id);
    if (dBtn && dBtn.dataset.appid === id) setDetailInstallBtn(dBtn, "installed");
    startDownload(url);
    toast(app.appName + " downloaded successfully! 🎉", "success", "check-circle");
  });
}

function showInstallModal(appName, onDone) {
  var modal   = el("installModal");
  var iconEl  = el("installModalIcon");
  var nameEl  = el("installAppName");
  var statEl  = el("installStatus");
  var barEl   = el("installProgressBar");

  nameEl.textContent = appName;
  statEl.textContent = "Preparing…";
  barEl.style.width  = "0%";
  iconEl.innerHTML   = '<i data-lucide="download-cloud"></i>';
  iconEl.classList.remove("done");
  modal.hidden = false;
  icons();

  var steps = [
    { pct: 20,  label: "Preparing download…",  ms: 300  },
    { pct: 40,  label: "Connecting to server…", ms: 750  },
    { pct: 62,  label: "Downloading APK…",       ms: 1500 },
    { pct: 80,  label: "Verifying package…",     ms: 2400 },
    { pct: 95,  label: "Installing…",            ms: 3100 },
    { pct: 100, label: "Done!",                  ms: 3800 }
  ];

  steps.forEach(function (s) {
    setTimeout(function () {
      barEl.style.width  = s.pct + "%";
      statEl.textContent = s.label;
      if (s.pct === 100) {
        iconEl.innerHTML = '<i data-lucide="check-circle"></i>';
        iconEl.classList.add("done");
        icons();
        setTimeout(function () {
          modal.hidden = true;
          onDone();
        }, 700);
      }
    }, s.ms);
  });
}

/* ── 16. URL RESOLVER ───────────────────── */
function startDownload(url) {
  window.location.href = resolveUrl(url);
}

function resolveUrl(url) {
  if (!url) return url;
  /* GitHub blob → raw */
  if (url.includes("github.com") && url.includes("/blob/")) {
    return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }
  /* GitHub raw — already correct */
  if (url.includes("raw.githubusercontent.com")) return url;
  /* Google Drive share link → direct download */
  if (url.includes("drive.google.com")) {
    var m = url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
    if (m) return "https://drive.google.com/uc?export=download&confirm=t&id=" + m[1];
    var m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (m2) return "https://drive.google.com/uc?export=download&confirm=t&id=" + m2[1];
    if (url.includes("/uc?") && !url.includes("confirm=")) return url + "&confirm=t";
  }
  return url;
}

/* ── 17. LINK CONVERTER ─────────────────── */
function initConverter() {
  var btn   = el("converterBtn");
  var input = el("converterInput");
  if (!btn || !input) return;

  btn.addEventListener("click", runConverter);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); runConverter(); }
  });

  el("convUseApk").addEventListener("click", function () {
    el("fDownload").value = el("convApkUrl").textContent;
    toast("Download URL applied!", "success", "check-circle");
  });
  el("convUseImg").addEventListener("click", function () {
    var cur = el("fScreenshots").value.trim();
    var url = el("convImgUrl").textContent;
    el("fScreenshots").value = cur ? cur + ", " + url : url;
    toast("Added to screenshots!", "success", "check-circle");
  });
}

function runConverter() {
  var url    = el("converterInput").value.trim();
  var errEl  = el("converterError");
  var resEl  = el("converterResults");

  errEl.hidden = true;
  resEl.hidden = true;

  if (!url) { showConvError("Paste a link first."); return; }

  /* GitHub */
  if (url.includes("github.com") || url.includes("raw.githubusercontent.com")) {
    var raw = url.includes("/blob/")
      ? url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
      : url;
    el("convApkUrl").textContent = raw;
    el("convImgUrl").textContent = raw;
    resEl.hidden = false;
    return;
  }

  /* Google Drive */
  var fileId = (url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/) || url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/) || [])[1];
  if (!fileId) { showConvError("Could not detect a valid GitHub or Google Drive link."); return; }

  el("convApkUrl").textContent = "https://drive.google.com/uc?export=download&confirm=t&id=" + fileId;
  el("convImgUrl").textContent = "https://drive.google.com/uc?export=view&id=" + fileId;
  resEl.hidden = false;
}

function showConvError(msg) {
  el("converterError").textContent = msg;
  el("converterError").hidden = false;
}

function resetConverter() {
  el("converterInput").value = "";
  el("converterResults").hidden = true;
  el("converterError").hidden   = true;
}

/* ── 18. SEARCH & CATEGORY ──────────────── */
function handleSearch(val) {
  el("searchClear").classList.toggle("visible", val.length > 0);
  if (currentView !== "home") showHome();
  else renderHome(val, activeCategory);
}

function handleCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(function (p) {
    p.classList.toggle("active", p.dataset.cat === cat);
  });
  if (currentView !== "home") showHome();
  else renderHome(el("searchInput").value, cat);
}

/* ── 19. EVENT BINDING ──────────────────── */
function bindEvents() {
  /* Search */
  el("searchInput").addEventListener("input", function (e) { handleSearch(e.target.value); });
  el("searchClear").addEventListener("click", function () {
    el("searchInput").value = ""; handleSearch("");
  });

  /* Navigation */
  el("brandLogo").addEventListener("click", showHome);
  el("backBtn").addEventListener("click", showHome);
  el("themeToggle").addEventListener("click", toggleTheme);
  el("adminBtn").addEventListener("click", function () {
    adminLoggedIn ? showAdminPanel() : openLoginModal();
  });

  /* Categories */
  el("catBar").addEventListener("click", function (e) {
    var pill = e.target.closest(".cat-pill");
    if (pill) handleCategory(pill.dataset.cat);
  });

  /* Admin panel */
  el("addAppBtn").addEventListener("click", openAddModal);
  el("fabFloat").addEventListener("click", openAddModal);
  el("logoutBtn").addEventListener("click", logout);

  /* App form */
  el("appForm").addEventListener("submit", handleAppFormSubmit);
  el("appModalClose").addEventListener("click", closeAppModal);
  el("appModalCancel").addEventListener("click", closeAppModal);

  /* Login form */
  el("loginForm").addEventListener("submit", handleLogin);
  el("loginClose").addEventListener("click", function () { el("loginModal").hidden = true; });

  /* Delete */
  el("deleteConfirmBtn").addEventListener("click", confirmDelete);
  el("deleteCancelBtn").addEventListener("click", function () {
    pendingDeleteId = null; el("deleteModal").hidden = true;
  });

  /* Close modals on backdrop click */
  ["loginModal", "appModal", "deleteModal"].forEach(function (id) {
    el(id).addEventListener("click", function (e) {
      if (e.target === this) {
        if (id === "deleteModal") pendingDeleteId = null;
        if (id === "appModal")   editingAppId    = null;
        this.hidden = true;
      }
    });
  });

  /* Keyboard */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    el("loginModal").hidden = true;
    el("appModal").hidden   = true;
    el("deleteModal").hidden = true;
  });
}

/* ── 20. TOAST NOTIFICATIONS ────────────── */
function toast(msg, type, iconName) {
  type     = type     || "info";
  iconName = iconName || "info";
  var c  = el("toastContainer");
  var t  = document.createElement("div");
  t.className = "toast " + type;
  t.innerHTML = '<i data-lucide="' + iconName + '"></i><span>' + msg + '</span>';
  c.appendChild(t);
  icons();
  setTimeout(function () {
    t.classList.add("out");
    setTimeout(function () { if (t.parentNode) t.remove(); }, 240);
  }, 3200);
}

/* ── 21. UTILITIES ──────────────────────── */
function el(id) { return document.getElementById(id); }

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDate(s) {
  try { return new Date(s).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" }); }
  catch (e) { return s; }
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
