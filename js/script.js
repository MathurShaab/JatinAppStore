/* ===== CONFIG ===== */
const ADMIN      = { username: "admin", password: "12345" };
const LS_APPS    = "jatinapps_apps";
const LS_SESSION = "jatinapps_admin";
const LS_THEME   = "jatinapps_theme";

const DEV_NAME   = "Jatin Mathur";
const STORE_NAME = "Jatin Apps";

/* ===== DEFAULT APPS ===== */
const DEFAULT_APPS = [
  {
    appId: "app_001",
    appName: "TaskFlow Pro",
    appIcon: "https://api.iconify.design/fluent-emoji-flat:check-mark-button.svg?color=%23ffffff&width=128&height=128",
    description: "A powerful task management app that helps you stay organized and productive. Create projects, set deadlines, assign priorities and track progress with an intuitive interface.",
    version: "2.4.1", size: "18 MB", category: "Productivity",
    screenshots: [
      "https://placehold.co/200x360/7c6dfa/ffffff?text=Home",
      "https://placehold.co/200x360/22d3a0/ffffff?text=Tasks",
      "https://placehold.co/200x360/ff4d6d/ffffff?text=Calendar"
    ],
    downloadUrl: "#", releaseDate: "2025-03-10"
  },
  {
    appId: "app_002",
    appName: "SnapTools",
    appIcon: "https://api.iconify.design/fluent-emoji-flat:hammer-and-wrench.svg?color=%23ffffff&width=128&height=128",
    description: "All-in-one utility toolkit for Android. File manager, system cleaner, app backup, battery optimizer and more essential tools in a single app.",
    version: "1.8.0", size: "12 MB", category: "Tools",
    screenshots: [
      "https://placehold.co/200x360/a695ff/ffffff?text=Tools",
      "https://placehold.co/200x360/22d3a0/ffffff?text=Cleaner"
    ],
    downloadUrl: "#", releaseDate: "2025-02-20"
  },
  {
    appId: "app_003",
    appName: "SocialHub",
    appIcon: "https://api.iconify.design/fluent-emoji-flat:speech-balloon.svg?color=%23ffffff&width=128&height=128",
    description: "Connect with friends and community in real time. Share photos, videos, stories and messages — all in one beautiful social experience.",
    version: "3.1.2", size: "28 MB", category: "Social",
    screenshots: [
      "https://placehold.co/200x360/ff4d6d/ffffff?text=Feed",
      "https://placehold.co/200x360/7c6dfa/ffffff?text=Messages",
      "https://placehold.co/200x360/22d3a0/ffffff?text=Profile"
    ],
    downloadUrl: "#", releaseDate: "2025-03-05"
  },
  {
    appId: "app_004",
    appName: "StreamVibe",
    appIcon: "https://api.iconify.design/fluent-emoji-flat:clapper-board.svg?color=%23ffffff&width=128&height=128",
    description: "Stream movies, shows and music with stunning quality. Offline downloads, multiple profiles and smart recommendations.",
    version: "5.0.3", size: "40 MB", category: "Entertainment",
    screenshots: [
      "https://placehold.co/200x360/ff4d6d/ffffff?text=Movies",
      "https://placehold.co/200x360/7c6dfa/ffffff?text=Music"
    ],
    downloadUrl: "#", releaseDate: "2025-01-15"
  },
  {
    appId: "app_005",
    appName: "NoteNest",
    appIcon: "https://api.iconify.design/fluent-emoji-flat:memo.svg?color=%23ffffff&width=128&height=128",
    description: "Beautiful markdown notes with cloud sync. Organize your thoughts, ideas and meeting notes with tags, notebooks and powerful search.",
    version: "1.3.0", size: "9 MB", category: "Productivity",
    screenshots: [
      "https://placehold.co/200x360/22d3a0/ffffff?text=Notes",
      "https://placehold.co/200x360/a695ff/ffffff?text=Editor"
    ],
    downloadUrl: "#", releaseDate: "2025-03-01"
  },
  {
    appId: "app_006",
    appName: "PixelFix",
    appIcon: "https://api.iconify.design/fluent-emoji-flat:artist-palette.svg?color=%23ffffff&width=128&height=128",
    description: "Professional photo editor with AI-powered tools. Filters, retouching, background removal and creative effects.",
    version: "2.2.1", size: "32 MB", category: "Tools",
    screenshots: [
      "https://placehold.co/200x360/7c6dfa/ffffff?text=Edit",
      "https://placehold.co/200x360/ff4d6d/ffffff?text=Filters"
    ],
    downloadUrl: "#", releaseDate: "2025-02-14"
  }
];

/* ===== STATE ===== */
let apps          = [];
let adminLoggedIn = false;
let currentView   = "home";
let currentApp    = null;
let pendingDeleteId = null;
let activeCategory  = "All";
let editingAppId    = null;

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  loadApps();
  checkSession();
  renderHome();
  bindEvents();
});

/* ===== PERSISTENCE ===== */
function loadApps() {
  var stored = localStorage.getItem(LS_APPS);
  apps = stored ? JSON.parse(stored) : DEFAULT_APPS.slice();
}

function saveApps() {
  localStorage.setItem(LS_APPS, JSON.stringify(apps));
}

function checkSession() {
  adminLoggedIn = localStorage.getItem(LS_SESSION) === "true";
  updateAdminUI();
}

function loadTheme() {
  var saved = localStorage.getItem(LS_THEME);
  if (saved) document.documentElement.setAttribute("data-theme", saved);
}

/* ===== RENDER HOME ===== */
function renderHome(filter, cat) {
  filter = filter || "";
  cat    = cat    || activeCategory || "All";

  var grid    = document.getElementById("appGrid");
  var empty   = document.getElementById("emptyState");
  var countEl = document.getElementById("appCount");
  var titleEl = document.getElementById("sectionTitle");

  var filtered = apps.slice();
  if (cat !== "All") {
    filtered = filtered.filter(function (a) { return a.category === cat; });
  }
  if (filter.trim()) {
    var q = filter.trim().toLowerCase();
    filtered = filtered.filter(function (a) {
      return a.appName.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    });
  }

  titleEl.textContent = cat === "All" ? "All Apps" : cat;
  countEl.textContent = filtered.length + " app" + (filtered.length !== 1 ? "s" : "");
  grid.innerHTML = "";

  if (!filtered.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  filtered.forEach(function (app, i) {
    grid.appendChild(createAppCard(app, i));
  });
}

function createAppCard(app, index) {
  var div = document.createElement("div");
  div.className = "app-card";
  div.style.animationDelay = (index * 0.055) + "s";

  div.innerHTML =
    '<div class="card-icon-wrap">' +
      '<img class="card-icon" src="' + esc(app.appIcon) + '" alt="' + esc(app.appName) + '" ' +
        'onerror="this.src=\'https://placehold.co/64x64/252538/a695ff?text=' + encodeURIComponent((app.appName || "?")[0]) + '\'" />' +
    '</div>' +
    '<div class="card-cat">'  + esc(app.category)    + '</div>' +
    '<div class="card-name">' + esc(app.appName)     + '</div>' +
    '<div class="card-desc">' + esc(app.description) + '</div>' +
    '<div class="card-dev"><span class="card-dev-dot"></span>by ' + DEV_NAME + '</div>' +
    '<button class="card-install-btn">⬇ Install</button>';

  div.querySelector(".card-install-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    handleInstall(app.downloadUrl, app.appName);
  });

  div.addEventListener("click", function () {
    showDetail(app.appId);
  });

  return div;
}

/* ===== DETAIL VIEW ===== */
function showDetail(appId) {
  var app = apps.find(function (a) { return a.appId === appId; });
  if (!app) return;

  currentApp  = app;
  currentView = "detail";

  document.getElementById("mainView").style.display    = "none";
  document.getElementById("adminPanel").style.display  = "none";
  document.getElementById("fabFloat").style.display    = "none";
  document.getElementById("siteFooter").style.display  = "none";
  document.getElementById("detailView").style.display  = "block";

  var dIcon = document.getElementById("dIcon");
  dIcon.src = app.appIcon;
  dIcon.onerror = function () {
    this.src = "https://placehold.co/110x110/252538/a695ff?text=" + encodeURIComponent((app.appName || "?")[0]);
  };

  document.getElementById("dName").textContent    = app.appName;
  document.getElementById("dCat").textContent     = app.category;
  document.getElementById("dVersion").textContent = "v" + app.version;
  document.getElementById("dSize").textContent    = app.size;
  document.getElementById("dDate").textContent    = app.releaseDate ? formatDate(app.releaseDate) : "";
  document.getElementById("dDesc").textContent    = app.description;
  document.getElementById("dInstallBtn").onclick  = function () { handleInstall(app.downloadUrl, app.appName); };

  var slider = document.getElementById("screenshotSlider");
  slider.innerHTML = "";
  var shots = Array.isArray(app.screenshots) ? app.screenshots : [];
  if (shots.length) {
    shots.forEach(function (url) {
      var img = document.createElement("img");
      img.className = "screenshot-img";
      img.src = url.trim();
      img.alt = "Screenshot";
      img.onerror = function () { this.src = "https://placehold.co/200x360/1e1e2e/7c6dfa?text=Screenshot"; };
      slider.appendChild(img);
    });
  } else {
    slider.innerHTML = '<p style="color:var(--text3);font-size:.85rem;">No screenshots available.</p>';
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  currentView = "home";
  document.getElementById("detailView").style.display  = "none";
  document.getElementById("adminPanel").style.display  = "none";
  document.getElementById("mainView").style.display    = "block";
  document.getElementById("siteFooter").style.display  = "block";
  if (adminLoggedIn) document.getElementById("fabFloat").style.display = "flex";
  renderHome(document.getElementById("searchInput").value, activeCategory);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===== ADMIN PANEL ===== */
function showAdminPanel() {
  if (!adminLoggedIn) { openLoginModal(); return; }
  currentView = "admin";
  document.getElementById("mainView").style.display   = "none";
  document.getElementById("detailView").style.display = "none";
  document.getElementById("fabFloat").style.display   = "none";
  document.getElementById("siteFooter").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  renderAdminPanel();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderAdminPanel() {
  renderAdminStats();
  renderAdminTable();
}

function renderAdminStats() {
  var cats = {};
  apps.forEach(function (a) { cats[a.category] = (cats[a.category] || 0) + 1; });
  var html = '<div class="stat-card"><div class="stat-num">' + apps.length + '</div><div class="stat-label">Total Apps</div></div>';
  Object.entries(cats).forEach(function (e) {
    html += '<div class="stat-card"><div class="stat-num">' + e[1] + '</div><div class="stat-label">' + e[0] + '</div></div>';
  });
  document.getElementById("adminStats").innerHTML = html;
}

function renderAdminTable() {
  var tbody = document.getElementById("adminTableBody");
  if (!apps.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:40px;">No apps yet. Add your first app!</td></tr>';
    return;
  }
  tbody.innerHTML = apps.map(function (app) {
    return '<tr>' +
      '<td><img class="table-icon" src="' + esc(app.appIcon) + '" alt="" ' +
        'onerror="this.src=\'https://placehold.co/40x40/252538/a695ff?text=' + encodeURIComponent((app.appName || "?")[0]) + '\'" /></td>' +
      '<td><div class="table-name">' + esc(app.appName) + '</div></td>' +
      '<td><span class="cat-tag">' + esc(app.category) + '</span></td>' +
      '<td>' + esc(app.version) + '</td>' +
      '<td>' + (app.releaseDate ? formatDate(app.releaseDate) : "—") + '</td>' +
      '<td><div class="table-actions">' +
        '<button class="table-edit-btn" data-id="' + esc(app.appId) + '">Edit</button>' +
        '<button class="table-del-btn"  data-id="' + esc(app.appId) + '">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join("");

  tbody.querySelectorAll(".table-edit-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { openEditModal(btn.dataset.id); });
  });
  tbody.querySelectorAll(".table-del-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { confirmDelete(btn.dataset.id); });
  });
}

/* ===== APP FORM ===== */
function openAddModal() {
  editingAppId = null;
  document.getElementById("appModalTitle").textContent  = "Add New App";
  document.getElementById("appForm").reset();
  document.getElementById("editAppId").value            = "";
  document.getElementById("appFormSubmit").textContent  = "Save App →";
  document.getElementById("appModal").style.display     = "flex";
}

function openEditModal(appId) {
  var app = apps.find(function (a) { return a.appId === appId; });
  if (!app) return;
  editingAppId = appId;
  document.getElementById("appModalTitle").textContent  = "Edit App";
  document.getElementById("editAppId").value            = appId;
  document.getElementById("fName").value                = app.appName;
  document.getElementById("fCat").value                 = app.category;
  document.getElementById("fIcon").value                = app.appIcon;
  document.getElementById("fDesc").value                = app.description;
  document.getElementById("fVersion").value             = app.version;
  document.getElementById("fSize").value                = app.size;
  document.getElementById("fScreenshots").value         = Array.isArray(app.screenshots) ? app.screenshots.join(", ") : "";
  document.getElementById("fDownload").value            = app.downloadUrl;
  document.getElementById("fDate").value                = app.releaseDate || "";
  document.getElementById("appFormSubmit").textContent  = "Update App →";
  document.getElementById("appModal").style.display     = "flex";
}

function closeAppModal() {
  document.getElementById("appModal").style.display = "none";
  editingAppId = null;
}

function handleAppFormSubmit(e) {
  e.preventDefault();
  var screenshots = document.getElementById("fScreenshots").value
    .split(",").map(function (s) { return s.trim(); }).filter(Boolean);

  var appData = {
    appName:     document.getElementById("fName").value.trim(),
    appIcon:     document.getElementById("fIcon").value.trim(),
    description: document.getElementById("fDesc").value.trim(),
    version:     document.getElementById("fVersion").value.trim(),
    size:        document.getElementById("fSize").value.trim(),
    category:    document.getElementById("fCat").value,
    screenshots: screenshots,
    downloadUrl: document.getElementById("fDownload").value.trim(),
    releaseDate: document.getElementById("fDate").value
  };

  if (editingAppId) {
    var idx = apps.findIndex(function (a) { return a.appId === editingAppId; });
    if (idx !== -1) apps[idx] = Object.assign({}, apps[idx], appData);
    toast("App updated! ✓", "success");
  } else {
    apps.unshift(Object.assign({ appId: "app_" + Date.now() }, appData));
    toast("App added to " + STORE_NAME + "! ✓", "success");
  }

  saveApps();
  closeAppModal();
  renderAdminPanel();
  renderHome(document.getElementById("searchInput").value, activeCategory);
}

/* ===== DELETE ===== */
function confirmDelete(appId) {
  var app = apps.find(function (a) { return a.appId === appId; });
  if (!app) return;
  pendingDeleteId = appId;
  document.getElementById("deleteMsg").textContent = '"' + app.appName + '" will be permanently removed.';
  document.getElementById("deleteModal").style.display = "flex";
}

function doDelete() {
  if (!pendingDeleteId) return;
  apps = apps.filter(function (a) { return a.appId !== pendingDeleteId; });
  saveApps();
  pendingDeleteId = null;
  document.getElementById("deleteModal").style.display = "none";
  renderAdminPanel();
  renderHome(document.getElementById("searchInput").value, activeCategory);
  toast("App deleted.", "info");
}

/* ===== LOGIN ===== */
function openLoginModal() {
  document.getElementById("loginError").textContent = "";
  document.getElementById("loginUser").value        = "";
  document.getElementById("loginPass").value        = "";
  document.getElementById("loginModal").style.display = "flex";
  setTimeout(function () { document.getElementById("loginUser").focus(); }, 100);
}

function handleLogin(e) {
  e.preventDefault();
  var user = document.getElementById("loginUser").value.trim();
  var pass = document.getElementById("loginPass").value;

  if (user === ADMIN.username && pass === ADMIN.password) {
    adminLoggedIn = true;
    localStorage.setItem(LS_SESSION, "true");
    document.getElementById("loginModal").style.display = "none";
    updateAdminUI();
    showAdminPanel();
    toast("Welcome back, " + DEV_NAME + "! 👋", "success");
  } else {
    document.getElementById("loginError").textContent = "Invalid credentials. Try again.";
    document.getElementById("loginPass").value = "";
  }
}

function logout() {
  adminLoggedIn = false;
  localStorage.removeItem(LS_SESSION);
  updateAdminUI();
  showHome();
  toast("Logged out from " + STORE_NAME + ".", "info");
}

function updateAdminUI() {
  var fab = document.getElementById("fabFloat");
  if (adminLoggedIn && currentView === "home") fab.style.display = "flex";
  else if (!adminLoggedIn) fab.style.display = "none";
}

/* ===== INSTALL ===== */
function handleInstall(url, name) {
  if (!url || url === "#") {
    toast("Download link not set for " + name, "error");
    return;
  }
  window.open(url, "_blank");
  toast("Installing from " + STORE_NAME + " 🚀", "success");
}

/* ===== THEME ===== */
function toggleTheme() {
  var html    = document.documentElement;
  var current = html.getAttribute("data-theme") || "dark";
  var next    = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem(LS_THEME, next);
}

/* ===== SEARCH ===== */
function handleSearch(val) {
  document.getElementById("searchClear").classList.toggle("visible", val.length > 0);
  if (currentView !== "home") {
    currentView = "home";
    document.getElementById("detailView").style.display  = "none";
    document.getElementById("adminPanel").style.display  = "none";
    document.getElementById("mainView").style.display    = "block";
    document.getElementById("siteFooter").style.display  = "block";
    if (adminLoggedIn) document.getElementById("fabFloat").style.display = "flex";
  }
  renderHome(val, activeCategory);
}

/* ===== CATEGORY ===== */
function handleCatFilter(cat) {
  activeCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(function (p) {
    p.classList.toggle("active", p.dataset.cat === cat);
  });
  if (currentView !== "home") showHome();
  else renderHome(document.getElementById("searchInput").value, cat);
}

/* ===== EVENTS ===== */
function bindEvents() {
  document.getElementById("searchInput").addEventListener("input", function (e) { handleSearch(e.target.value); });
  document.getElementById("searchClear").addEventListener("click", function () {
    document.getElementById("searchInput").value = "";
    handleSearch("");
  });

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  document.getElementById("adminBtn").addEventListener("click", function () {
    if (adminLoggedIn) showAdminPanel();
    else openLoginModal();
  });

  document.getElementById("catBar").addEventListener("click", function (e) {
    if (e.target.classList.contains("cat-pill")) handleCatFilter(e.target.dataset.cat);
  });

  document.getElementById("backBtn").addEventListener("click", showHome);
  document.getElementById("brandLogo").addEventListener("click", showHome);

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("loginClose").addEventListener("click", function () {
    document.getElementById("loginModal").style.display = "none";
  });

  document.getElementById("appForm").addEventListener("submit", handleAppFormSubmit);
  document.getElementById("appModalClose").addEventListener("click", closeAppModal);
  document.getElementById("appModalCancel").addEventListener("click", closeAppModal);

  document.getElementById("addAppBtn").addEventListener("click", openAddModal);
  document.getElementById("fabFloat").addEventListener("click", openAddModal);

  document.getElementById("deleteConfirmBtn").addEventListener("click", doDelete);
  document.getElementById("deleteCancelBtn").addEventListener("click", function () {
    pendingDeleteId = null;
    document.getElementById("deleteModal").style.display = "none";
  });

  document.getElementById("logoutBtn").addEventListener("click", logout);

  ["loginModal", "appModal", "deleteModal"].forEach(function (id) {
    document.getElementById(id).addEventListener("click", function (e) {
      if (e.target === this) {
        if (id === "deleteModal") pendingDeleteId = null;
        if (id === "appModal")   editingAppId    = null;
        this.style.display = "none";
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.getElementById("loginModal").style.display = "none";
      document.getElementById("appModal").style.display   = "none";
      document.getElementById("deleteModal").style.display = "none";
    }
  });
}

/* ===== TOAST ===== */
function toast(msg, type) {
  type = type || "info";
  var container = document.getElementById("toastContainer");
  var el = document.createElement("div");
  el.className  = "toast " + type;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(function () {
    el.classList.add("toast-out");
    setTimeout(function () { el.remove(); }, 280);
  }, 3000);
}

/* ===== UTILS ===== */
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch (e) { return dateStr; }
}
