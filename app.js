const uploadEndpoint = 'https://your-api-id.execute-api.region.amazonaws.com/prod/upload';
const downloadEndpoint = 'https://your-api-id.execute-api.region.amazonaws.com/prod/download';

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('uploadStatus');

  if (fileInput.files.length === 0) {
    status.style.color = 'red';
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
      body: fileContent
    });
    const text = await response.text();
    status.style.color = response.ok ? 'green' : 'red';
    status.textContent = response.ok ? 'Upload successful!' : `Upload failed: ${text}`;
  } catch (error) {
    status.style.color = 'red';
    status.textContent = `Upload error: ${error.message}`;
  }
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const fileNameInput = document.getElementById('downloadFileName');
  const status = document.getElementById('downloadStatus');
  const fileName = encodeURIComponent(fileNameInput.value.trim());

  if (!fileName) {
    status.style.color = 'red';
    status.textContent = 'Please enter a filename.';
    return;
  }

  try {
    const response = await fetch(`${downloadEndpoint}?fileName=${fileName}`, { method: 'GET' });

    if (!response.ok) {
      status.style.color = 'red';
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

    status.style.color = 'green';
    status.textContent = 'Download started!';

  } catch (error) {
    status.style.color = 'red';
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
