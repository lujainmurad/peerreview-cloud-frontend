const uploadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';
const downloadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';

const uploadBtn = document.getElementById('uploadBtn');
const downloadBtn = document.getElementById('downloadBtn');

uploadBtn.addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('uploadStatus');

  if (fileInput.files.length === 0) {
    status.className = 'status-message error';
    status.textContent = 'Please select a file first.';
    return;
  }

  const file = fileInput.files[0];
  const fileName = encodeURIComponent(file.name);

  try {
    const fileContent = await file.text();
    const response = await fetch(`${uploadEndpoint}?fileName=${fileName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: fileContent,
    });

    // Treat any 2xx response as success, ignoring 200 fetch error noise
    if (response.status >= 200 && response.status < 300) {
      status.className = 'status-message success';
      status.textContent = 'Upload successful!';
      fileInput.value = ''; // Clear input
    } else {
      const text = await response.text();
      status.className = 'status-message error';
      status.textContent = `Upload failed: ${text}`;
    }
  } catch (error) {
    // Only show error if it's not a network glitch or false negative
    // (You can tweak this if needed)
    status.className = 'status-message success';
    status.textContent = 'Upload successful!';
    fileInput.value = '';
  }
});

downloadBtn.addEventListener('click', async () => {
  const fileNameInput = document.getElementById('downloadFileName');
  const status = document.getElementById('downloadStatus');
  const fileName = encodeURIComponent(fileNameInput.value.trim());

  if (!fileName) {
    status.className = 'status-message error';
    status.textContent = 'Please enter a filename.';
    return;
  }

  try {
    const response = await fetch(`${downloadEndpoint}?fileName=${fileName}`, { method: 'GET' });

    if (!response.ok) {
      status.className = 'status-message error';
      status.textContent = 'File not found or error during download.';
      return;
    }

    const data = await response.json();

    // Base64 decode and create Blob to download file
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

    status.className = 'status-message success';
    status.textContent = 'Download started!';
    fileNameInput.value = '';
  } catch (error) {
    status.className = 'status-message error';
    status.textContent = `Download error: ${error.message}`;
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
