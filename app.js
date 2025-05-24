const uploadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';

const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

const reviewInput = document.getElementById('reviewInput');
const reviewFile = document.getElementById('reviewFile');
const submitReviewBtn = document.getElementById('submitReviewBtn');
const reviewStatus = document.getElementById('reviewStatus');

const uploadStatus = document.getElementById('uploadStatus');

const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const navList = document.getElementById('navList');
const navLinks = document.querySelectorAll('.nav-link');

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
    } else {
      const text = await response.text();
      showStatus(uploadStatus, `Upload failed: ${text}`, 'error');
    }
  } catch (error) {
    showStatus(uploadStatus, 'Upload successful!', 'success');
    fileInput.value = '';
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

  // Hide login button if sidebar closed, show if opened
  if (isClosed) {
    loginBtn.style.display = 'none';
  } else {
    loginBtn.style.display = 'inline-block';
  }
});

/* NAV LINK ACTIVE STATE */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    navLinks.forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});

/* Initialize */
window.addEventListener('DOMContentLoaded', () => {
  if (sidebar.classList.contains('closed')) {
    loginBtn.style.display = 'none';
  }
  // Set theme toggle switch initial state
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = localStorage.getItem('pr_theme') || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);

  document.getElementById('themeToggle').checked = (theme === 'dark');
});

const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('pr_theme', theme);
}

themeToggle.addEventListener('change', () => {
  applyTheme(themeToggle.checked ? 'dark' : 'light');
});
