const uploadEndpoint = 'https://3s2sew1mjh.execute-api.eu-north-1.amazonaws.com/prod/upload';
const downloadEndpoint = 'https://8r5rtopvnf.execute-api.eu-north-1.amazonaws.com/pppp/test';

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
    // Use file.text() if your Lambda expects plain text
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
  const fileName = fileNameInput.value.trim();

  if (!fileName) {
    status.style.color = 'red';
    status.textContent = 'Please enter a filename.';
    return;
  }

  try {
    const response = await fetch(`${downloadEndpoint}?fileName=${encodeURIComponent(fileName)}`);

    if (!response.ok) {
      status.style.color = 'red';
      status.textContent = 'File not found or error during download.';
      return;
    }

    // Get response as a Blob directly (assuming your Lambda returns binary properly)
    const blob = await response.blob();

    // Create object URL and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    status.style.color = 'green';
    status.textContent = 'Download started!';
  } catch (error) {
    status.style.color = 'red';
    status.textContent = `Download error: ${error.message}`;
  }
});
