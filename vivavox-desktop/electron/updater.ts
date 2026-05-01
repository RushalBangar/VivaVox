import { BrowserWindow, ipcMain } from 'electron';

/**
 * Auto-Updater Module
 *
 * Integrates with GitHub Releases to check for and install updates.
 * Uses electron-updater for seamless background downloads.
 *
 * NOTE: This module is only active in production builds.
 * electron-updater requires code-signed builds to function.
 */

export function setupAutoUpdater(mainWindow: BrowserWindow | null): void {
  // Dynamic import to avoid issues in development
  try {
    const { autoUpdater } = require('electron-updater');

    // Configure
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates on launch
    autoUpdater.checkForUpdatesAndNotify();

    // ─── Events ──────────────────────────────────────────────

    autoUpdater.on('update-available', (info: any) => {
      console.log('[Updater] Update available:', info.version);
      mainWindow?.webContents.send('update:available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
      });
    });

    autoUpdater.on('update-downloaded', (info: any) => {
      console.log('[Updater] Update downloaded:', info.version);
      mainWindow?.webContents.send('update:downloaded', {
        version: info.version,
      });
    });

    autoUpdater.on('error', (error: Error) => {
      console.error('[Updater] Error:', error.message);
    });

    // Handle install request from renderer
    ipcMain.on('update:install', () => {
      autoUpdater.quitAndInstall(false, true);
    });

    // Check every 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 4 * 60 * 60 * 1000);

  } catch (error) {
    console.warn('[Updater] Could not initialize auto-updater:', error);
  }
}
