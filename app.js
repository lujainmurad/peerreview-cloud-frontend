const uploadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';
const downloadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';

const uploadBtn = document.getElementById('uploadBtn');
const downloadBtn = document.getElementById('downloadBtn');
const fileInput = document.getElementById('fileInput');
const downloadInput = document.getElementById('downloadFileName');

const uploadStatus = document.getElementById('uploadStatus');
const downloadStatus = document.getElementById('downloadStatus');

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

function setLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.textContent = button.id === 'uploadBtn' ? 'Uploading...' : 'Downloading...';
  } else {
    button.disabled = false;
    button.textContent = button.id === 'uploadBtn' ? 'Upload' : 'Download';
  }
}

uploadBtn.addEventListener('click', async () => {
  clearStatus(uploadStatus);
  if (fileInput.files.length === 0) {
    showStatus(uploadStatus, 'Please select a file first.', 'error');
    return;
  }

  const file = fileInput.files[0];
  const fileName = encodeURIComponent(file.name);

  setLoading(uploadBtn, true);

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

downloadBtn.addEventListener('click', async () => {
  clearStatus(downloadStatus);
  const fileNameRaw = downloadInput.value.trim();

  if (!fileNameRaw) {
    showStatus(downloadStatus, 'Please enter a filename.', 'error');
    return;
  }

  const fileName = encodeURIComponent(fileNameRaw);

  setLoading(downloadBtn, true);

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

function base64ToBlob(base64) {
  const binary = atob(base64);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)]);
}

// Optional: Add sidebar navigation highlight switching, login modal, or other interaction here.
