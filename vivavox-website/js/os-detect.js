/**
 * VivaVox — OS Auto-Detection & Smart Download
 *
 * Reads the browser's user agent to determine the visitor's OS
 * and dynamically configures the download button to serve
 * the correct installer from GitHub Releases.
 */

(function () {
  'use strict';

  // ─── Configuration ─────────────────────────────────────────
  const GITHUB_OWNER = 'RushalBangar';
  const GITHUB_REPO = 'VivaVox';
  const RELEASES_BASE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download`;

  const APP_VERSION = '0.1.2'; // Should match package.json version

  const OS_CONFIG = {
    windows: {
      label: 'Download for Windows',
      sub: `Windows 10/11 — v${APP_VERSION} .exe`,
      file: `VivaVox-Setup-${APP_VERSION}.exe`,
      icon: '⊞',
    },
    macos: {
      label: 'Download for macOS',
      sub: `macOS 11+ (Intel & Apple Silicon) — v${APP_VERSION}`,
      file: `VivaVox-${APP_VERSION}-arm64.dmg`, // Defaulting to arm64, user can find x64 in releases if needed
      icon: '',
    },
    linux: {
      label: 'Download for Linux',
      sub: `Ubuntu / Fedora — v${APP_VERSION} .AppImage`,
      file: `VivaVox-${APP_VERSION}.AppImage`,
      icon: '⚙',
    },
  };

  // ─── OS Detection ──────────────────────────────────────────
  function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || '';

    if (ua.includes('win') || platform.includes('win')) return 'windows';
    if (ua.includes('mac') || platform.includes('mac')) return 'macos';
    if (ua.includes('linux') || platform.includes('linux')) return 'linux';
    return 'windows'; // Default fallback
  }

  // ─── UI Update ─────────────────────────────────────────────
  function setupDownloadButton() {
    const detectedOS = detectOS();
    const config = OS_CONFIG[detectedOS];

    // Primary download button
    const btn = document.getElementById('download-btn');
    const label = document.getElementById('download-label');
    const sub = document.getElementById('download-sub');
    const icon = document.getElementById('download-icon');

    if (btn && config) {
      btn.href = `${RELEASES_BASE}/${config.file}`;
      btn.setAttribute('data-os', detectedOS);
      if (label) label.textContent = config.label;
      if (sub) sub.textContent = config.sub;
      if (icon) icon.textContent = config.icon;
    }

    // Alternative download links
    const otherOSes = Object.keys(OS_CONFIG).filter(os => os !== detectedOS);
    otherOSes.forEach((os, index) => {
      const altLink = document.getElementById(`alt-download-${index + 1}`);
      if (altLink) {
        altLink.href = `${RELEASES_BASE}/${OS_CONFIG[os].file}`;
        altLink.textContent = OS_CONFIG[os].label.replace('Download for ', '');
        altLink.setAttribute('data-os', os);
      }
    });
  }

  // ─── Initialize ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDownloadButton);
  } else {
    setupDownloadButton();
  }
})();
