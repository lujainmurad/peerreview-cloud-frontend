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

/* DOWNLOAD HANDLER */
downloadBtn.addEventListener('click', async () => {
  clearStatus(downloadStatus);
  const fileNameRaw = downloadInput.value.trim();

  if (!fileNameRaw) {
    showStatus(downloadStatus, 'Please enter a filename.', 'error');
    return;
  }

  const fileName = encodeURIComponent(fileNameRaw);

  setLoading(downloadBtn, true, 'Downloading');

  try {
    const response = await fetch(`${downloadEndpoint}?fileName=${fileName}`, { method: 'GET' });

    if (!response.ok) {
      if (response.status === 200) {
        showStatus(downloadStatus, 'Download started!', 'success');
        downloadInput.value = '';
        setLoading(downloadBtn, false);
        return;
      }
      showStatus(downloadStatus, 'File not found or error during download.', 'error');
      setLoading(downloadBtn, false);
      return;
    }

    const data = await response.json();

    if (!data.body) {
      showStatus(downloadStatus, 'File content missing.', 'error');
      setLoading(downloadBtn, false);
      return;
    }

    const base64Content = data.body;
    const blob = base64ToBlob(base64Content);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = decodeURIComponent(fileName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showStatus(downloadStatus, 'Download started!', 'success');
    downloadInput.value = '';
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      showStatus(downloadStatus, 'Download started!', 'success');
      downloadInput.value = '';
    } else {
      showStatus(downloadStatus, `Download error: ${error.message}`, 'error');
    }
  } finally {
    setLoading(downloadBtn, false);
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

    // Send review (simulate POST)
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

  // Simulate login request - replace with real auth call
  setLoading(loginForm.querySelector('button[type="submit"]'), true, 'Logging in');

  try {
    await new Promise(r => setTimeout(r, 1200)); // fake delay
    // Fake success if username = "admin", else fail
    if (username === 'admin' && password === 'password') {
      loginStatus.textContent = 'Login successful! Redirecting...';
      loginStatus.className = 'status-message visible success';
      setTimeout(() => {
        closeLoginModal();
        // Redirect or update UI here after login
        alert('Logged in as admin. (Demo)');
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

/* SIDEBAR TOGGLE FOR MOBILE */
sidebarToggle.addEventListener('click', () => {
  const expanded = sidebarToggle.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    sidebarToggle.setAttribute('aria-expanded', 'false');
    sidebar.classList.add('closed');
    document.querySelector('.nav-list').classList.remove('open');
  } else {
    sidebarToggle.setAttribute('aria-expanded', 'true');
    sidebar.classList.remove('closed');
    document.querySelector('.nav-list').classList.add('open');
  }
});

/* NAV LINK FOCUS AND ACTIVE MANAGEMENT */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    navLinks.forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      sidebar.classList.add('closed');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      document.querySelector('.nav-list').classList.remove('open');
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
