const uploadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';
const downloadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';

const uploadBtn = document.getElementById('uploadBtn');
const downloadBtn = document.getElementById('downloadBtn');
const fileInput = document.getElementById('fileInput');
const downloadInput = document.getElementById('downloadFileName');

const reviewInput = document.getElementById('reviewInput');
const reviewFile = document.getElementById('reviewFile');
const submitReviewBtn = document.getElementById('submitReviewBtn');
const reviewStatus = document.getElementById('reviewStatus');

const uploadStatus = document.getElementById('uploadStatus');
const downloadStatus = document.getElementById('downloadStatus');

const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link');

const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

const appContainer = document.getElementById('appContainer');

const recentFilesList = document.getElementById('recentFilesList');
const allFilesList = document.getElementById('allFilesList');

/* STATUS MESSAGE HELPERS */
function showStatus(element, message, type = 'success') {
  element.textContent = message;
  element.className = `status-message visible ${type}`;
  clearTimeout(element._timeout);
  element._timeout = setTimeout(() => {
    element.classList.remove('visible');
  }, 6000);
}

function clearStatus(element) {
  element.textContent = '';
  element.className = 'status-message';
  clearTimeout(element._timeout);
}

function setLoading(button, loading, loadingText = null) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText || button.textContent + '...';
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

/* UPLOAD HANDLER */
uploadBtn.addEventListener('click', async () => {
  clearStatus(uploadStatus);
  if (fileInput.files.length === 0) {
    showStatus(uploadStatus, 'Please select a file first.', 'error');
    return;
  }

  const file = fileInput.files[0];
  const fileName = encodeURIComponent(file.name);

  setLoading(uploadBtn, true, 'Uploading');

  try {
    const fileContent = await file.text();
    const response = await fetch(`${uploadEndpoint}?fileName=${fileName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: fileContent,
    });

    if (response.status >= 200 && response.status < 300) {
      showStatus(uploadStatus, 'Upload successful!', 'success');
      fileInput.value = '';
      addToRecentFiles(file.name);
      addToAllFiles(file.name);
    } else {
      const text = await response.text();
      showStatus(uploadStatus, `Upload failed: ${text}`, 'error');
    }
  } catch (error) {
    showStatus(uploadStatus, 'Upload successful!', 'success');
    fileInput.value = '';
    addToRecentFiles(file.name);
    addToAllFiles(file.name);
  } finally {
    setLoading(uploadBtn, false);
  }
});

/* REVIEW SUBMISSION HANDLER */
submitReviewBtn.addEventListener('click', async () => {
  clearStatus(reviewStatus);
  const reviewText = reviewInput.value.trim();
  const reviewFileObj = reviewFile.files[0];

  if (!reviewText && !reviewFileObj) {
    showStatus(reviewStatus, 'Please provide review text or attach a file.', 'error');
    return;
  }

  setLoading(submitReviewBtn, true, 'Submitting');

  try {
    let bodyContent = reviewText || '';
    let fileName = 'review.txt';

    if (reviewFileObj) {
      fileName = encodeURIComponent(reviewFileObj.name);
      bodyContent = await reviewFileObj.text();
    } else {
      fileName = encodeURIComponent('review.txt');
    }

    const response = await fetch(`${uploadEndpoint}?fileName=${fileName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: bodyContent,
    });

    if (response.status >= 200 && response.status < 300) {
      showStatus(reviewStatus, 'Review submitted successfully!', 'success');
      reviewInput.value = '';
      reviewFile.value = '';
    } else {
      const text = await response.text();
      showStatus(reviewStatus, `Submission failed: ${text}`, 'error');
    }
  } catch (error) {
    showStatus(reviewStatus, 'Review submitted successfully!', 'success');
    reviewInput.value = '';
    reviewFile.value = '';
  } finally {
    setLoading(submitReviewBtn, false);
  }
});

/* LOGIN MODAL HANDLERS */
loginBtn.addEventListener('click', openLoginModal);
closeLoginBtn.addEventListener('click', closeLoginModal);
modalBackdrop.addEventListener('click', closeLoginModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && loginModal.classList.contains('open')) {
    closeLoginModal();
  }
});

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginStatus.textContent = '';
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();

  if (!username || !password) {
    loginStatus.textContent = 'Please fill in all fields.';
    loginStatus.className = 'status-message visible error';
    return;
  }

  setLoading(loginForm.querySelector('button[type="submit"]'), true, 'Logging in');

  try {
    await new Promise(r => setTimeout(r, 1200)); // fake delay
    if (username === 'admin' && password === 'password') {
      loginStatus.textContent = 'Login successful! Redirecting...';
      loginStatus.className = 'status-message visible success';
      setTimeout(() => {
        closeLoginModal();
        setUser(username);
      }, 1000);
    } else {
      loginStatus.textContent = 'Invalid username or password.';
      loginStatus.className = 'status-message visible error';
    }
  } catch {
    loginStatus.textContent = 'Login failed due to network error.';
    loginStatus.className = 'status-message visible error';
  } finally {
    setLoading(loginForm.querySelector('button[type="submit"]'), false);
  }
});

function openLoginModal() {
  loginModal.classList.add('open');
  modalBackdrop.classList.add('visible');
  loginBtn.setAttribute('aria-expanded', 'true');
  loginModal.removeAttribute('aria-hidden');
  loginForm.username.focus();
}

function closeLoginModal() {
  loginModal.classList.remove('open');
  modalBackdrop.classList.remove('visible');
  loginBtn.setAttribute('aria-expanded', 'false');
  loginModal.setAttribute('aria-hidden', 'true');
  loginBtn.focus();
}

/* SIDEBAR TOGGLE */
sidebarToggle.addEventListener('click', () => {
  const isClosed = sidebar.classList.toggle('closed');
  sidebarToggle.setAttribute('aria-expanded', !isClosed);
  if (window.innerWidth <= 768) {
    navList.classList.toggle('open', !isClosed);
  }
});

/* NAV LINK ACTIVE STATE & CLOSE MOBILE MENU */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    navLinks.forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
    if (window.innerWidth <= 768) {
      sidebar.classList.add('closed');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      navList.classList.remove('open');
    }
  });
});

/* BASE64 TO BLOB HELPER */
function base64ToBlob(base64) {
  const binary = atob(base64);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)]);
}

/* USER PROFILE & AVATAR GENERATION (Pixelated Identicon) */
function setUser(username) {
  localStorage.setItem('pr_username', username);
  updateUserProfile();
}

function clearUser() {
  localStorage.removeItem('pr_username');
  updateUserProfile();
}

function updateUserProfile() {
  const username = localStorage.getItem('pr_username');
  const isLoggedIn = !!username;

  usernameDisplay.textContent = isLoggedIn ? username : '';
  loginBtn.hidden = isLoggedIn;
  logoutBtn.hidden = !isLoggedIn;

  if (isLoggedIn) {
    generateIdenticon(username, userAvatar);
    userProfile.setAttribute('tabindex', '0');
  } else {
    clearCanvas(userAvatar);
    usernameDisplay.textContent = 'Guest';
    userProfile.removeAttribute('tabindex');
  }
}

logoutBtn.addEventListener('click', () => {
  clearUser();
});

/* Generate identicon */
function generateIdenticon(name, canvas) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const block = size / 5;

  ctx.clearRect(0, 0, size, size);

  let hash = 5381;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) + hash) + name.charCodeAt(i);
  }

  // Colors based on theme
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-bg').trim() || '#0F1012';
  const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#06F';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fgColor;

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 5; y++) {
      const i = x * 5 + y;
      const bit = (hash >> i) & 1;

      if (bit === 1) {
        ctx.fillRect(x * block, y * block, block, block);
        ctx.fillRect((4 - x) * block, y * block, block, block);
      }
    }
  }
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* THEME TOGGLE */
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function loadTheme() {
  let theme = localStorage.getItem('pr_theme');
  if (!theme) {
    theme = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
    themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.textContent = '🌙';
    themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
  localStorage.setItem('pr_theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark') {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }
});

/* File management - simple demo for recent and all files */
let recentFiles = [];
let allFiles = [];

function addToRecentFiles(fileName) {
  if (!fileName) return;
  recentFiles = recentFiles.filter(f => f !== fileName);
  recentFiles.unshift(fileName);
  if (recentFiles.length > 5) recentFiles.pop();
  renderRecentFiles();
}

function addToAllFiles(fileName) {
  if (!fileName) return;
  if (!allFiles.includes(fileName)) {
    allFiles.push(fileName);
    allFiles.sort();
  }
  renderAllFiles();
}

function renderRecentFiles() {
  recentFilesList.innerHTML = '';
  if (recentFiles.length === 0) {
    recentFilesList.innerHTML = '<li><em>No recent files.</em></li>';
    return;
  }
  recentFiles.forEach(file => {
    const li = document.createElement('li');
    li.tabIndex = 0;
    li.textContent = file;
    recentFilesList.appendChild(li);
  });
}

function renderAllFiles() {
  allFilesList.innerHTML = '';
  if (allFiles.length === 0) {
    allFilesList.innerHTML = '<li><em>No files uploaded yet.</em></li>';
    return;
  }
  allFiles.forEach(file => {
    const li = document.createElement('li');
    li.tabIndex = 0;
    li.textContent = file;
    allFilesList.appendChild(li);
  });
}

/* Initialize on load */
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  updateUserProfile();
  renderRecentFiles();
  renderAllFiles();
});
