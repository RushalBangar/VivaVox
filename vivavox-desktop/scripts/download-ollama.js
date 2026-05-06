const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const binDir = path.join(__dirname, '../assets/bin');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

let downloadUrl = '';
let outputName = '';

const platform = process.platform;
const arch = process.arch;

if (platform === 'win32') {
  downloadUrl = 'https://ollama.com/download/ollama-windows-amd64.zip';
  outputName = 'ollama-windows-amd64.zip';
} else if (platform === 'darwin') {
  if (arch === 'arm64') {
    downloadUrl = 'https://ollama.com/download/ollama-darwin';
  } else {
    downloadUrl = 'https://ollama.com/download/ollama-darwin'; // Universal binary
  }
  outputName = 'ollama';
} else if (platform === 'linux') {
  if (arch === 'arm64') {
    downloadUrl = 'https://ollama.com/download/ollama-linux-arm64';
  } else {
    downloadUrl = 'https://ollama.com/download/ollama-linux-amd64';
  }
  outputName = 'ollama';
}

if (!downloadUrl) {
  console.error(`Unsupported platform/architecture: ${platform}/${arch}`);
  process.exit(1);
}

const finalExeName = platform === 'win32' ? 'ollama.exe' : 'ollama';
const finalExePath = path.join(binDir, finalExeName);

if (fs.existsSync(finalExePath)) {
  console.log(`[Ollama Downloader] ${finalExeName} already exists in assets/bin. Skipping download.`);
  process.exit(0);
}

const outputPath = path.join(binDir, outputName);

console.log(`[Ollama Downloader] Downloading Ollama from ${downloadUrl}...`);

const file = fs.createWriteStream(outputPath);

https.get(downloadUrl, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    // Handle redirect
    https.get(response.headers.location, (redirectResponse) => {
      redirectResponse.pipe(file);
      file.on('finish', () => {
        file.close();
        extractAndCleanup();
      });
    }).on('error', (err) => {
      fs.unlinkSync(outputPath);
      console.error(err);
      process.exit(1);
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      extractAndCleanup();
    });
  }
}).on('error', (err) => {
  fs.unlinkSync(outputPath);
  console.error(`Error downloading Ollama: ${err.message}`);
  process.exit(1);
});

function extractAndCleanup() {
  console.log('[Ollama Downloader] Download complete.');
  
  if (platform === 'win32') {
    console.log('[Ollama Downloader] Extracting zip file...');
    try {
      // Use PowerShell to extract zip natively on Windows without extra dependencies
      execSync(`powershell -command "Expand-Archive -Force -Path '${outputPath}' -DestinationPath '${binDir}'"`);
      fs.unlinkSync(outputPath);
      console.log('[Ollama Downloader] Extraction complete.');
    } catch (e) {
      console.error('[Ollama Downloader] Failed to extract zip:', e.message);
      process.exit(1);
    }
  } else {
    // On Mac/Linux, make it executable
    fs.chmodSync(outputPath, '755');
    console.log('[Ollama Downloader] Made binary executable.');
  }
}
