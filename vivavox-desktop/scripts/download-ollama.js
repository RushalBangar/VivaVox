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
  downloadUrl = 'https://github.com/ollama/ollama/releases/latest/download/Ollama-darwin.zip';
  outputName = 'ollama-darwin.zip';
} else if (platform === 'linux') {
  if (arch === 'arm64') {
    downloadUrl = 'https://github.com/ollama/ollama/releases/latest/download/ollama-linux-arm64.tar.zst';
  } else {
    downloadUrl = 'https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64.tar.zst';
  }
  outputName = 'ollama-linux.tar.zst';
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

try {
  execSync(`curl -L -o "${outputPath}" "${downloadUrl}"`, { stdio: 'inherit' });
  extractAndCleanup();
} catch (e) {
  console.error(`Error downloading Ollama: ${e.message}`);
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  process.exit(1);
}

function extractAndCleanup() {
  console.log('[Ollama Downloader] Download complete.');
  
  if (platform === 'win32') {
    console.log('[Ollama Downloader] Extracting zip file...');
    try {
      execSync(`powershell -command "Expand-Archive -Force -Path '${outputPath}' -DestinationPath '${binDir}'"`);
      fs.unlinkSync(outputPath);
      console.log('[Ollama Downloader] Extraction complete.');
    } catch (e) {
      console.error('[Ollama Downloader] Failed to extract zip:', e.message);
      process.exit(1);
    }
  } else if (platform === 'darwin') {
    console.log('[Ollama Downloader] Extracting Mac zip file...');
    try {
      // Mac download is a zip containing Ollama.app. We just want the CLI binary.
      execSync(`unzip -j -o "${outputPath}" "Ollama.app/Contents/MacOS/Ollama" -d "${binDir}"`);
      fs.renameSync(path.join(binDir, 'Ollama'), path.join(binDir, 'ollama'));
      fs.chmodSync(path.join(binDir, 'ollama'), '755');
      fs.unlinkSync(outputPath);
      console.log('[Ollama Downloader] Made binary executable.');
    } catch (e) {
      console.error('[Ollama Downloader] Failed to extract zip:', e.message);
      process.exit(1);
    }
  } else if (platform === 'linux') {
    console.log('[Ollama Downloader] Extracting Linux zst tarball...');
    try {
      const assetsDir = path.join(binDir, '..');
      execSync(`zstd -d -c "${outputPath}" | tar -xf - -C "${assetsDir}"`);
      fs.chmodSync(path.join(binDir, 'ollama'), '755');
      fs.unlinkSync(outputPath);
      console.log('[Ollama Downloader] Made binary executable.');
    } catch (e) {
      console.error('[Ollama Downloader] Failed to extract zst tarball:', e.message);
      process.exit(1);
    }
  }
}
