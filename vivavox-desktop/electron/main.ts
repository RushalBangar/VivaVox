import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import serve from 'electron-serve';
import { setupAIHandlers } from './ai-engine';
import { setupHardwareCheckHandlers } from './hardware-check';
import { setupAutoUpdater } from './updater';

const loadURL = serve({ directory: 'out' });

// Keep a global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'VivaVox | Neural Interview Intelligence',
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#050510',
    show: false,
    frame: true,
    titleBarStyle: 'hiddenInset', // Sleek title bar on macOS
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for preload script access
    },
  });

  // Grant camera and microphone permissions automatically
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'notifications'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  if (isDev) {
    // In development, load from Next.js dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load using electron-serve
    loadURL(mainWindow);
  }

  // Elegant fade-in when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── App Lifecycle ───────────────────────────────────────────────

// Enforce single instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // Register all IPC handlers
  setupAIHandlers();
  setupHardwareCheckHandlers();

  // Setup auto-updater (production only)
  if (!isDev) {
    setupAutoUpdater(mainWindow);
  }

  app.on('activate', () => {
    // macOS: Re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, apps stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
