import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script — runs in a sandboxed context with access to Node.js APIs.
 * Exposes a safe, typed API to the renderer process via contextBridge.
 */

export interface AnalysisResult {
  questions: string[];
  summary: string;
}

export interface HardwareStatus {
  webcamAvailable: boolean;
  microphoneAvailable: boolean;
  ramGB: number;
  ramSufficient: boolean;
  allPassed: boolean;
}

export interface ElectronAPI {
  // AI Engine
  analyzeResume: (text: string) => Promise<AnalysisResult>;
  evaluateAnswer: (question: string, answer: string) => Promise<string>;
  setApiKey: (key: string) => Promise<void>;

  // Hardware
  checkHardware: () => Promise<HardwareStatus>;

  // System
  getAppVersion: () => Promise<string>;
  getPlatform: () => string;

  // Updates
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  installUpdate: () => void;
}

const electronAPI: ElectronAPI = {
  // ─── AI Engine ─────────────────────────────────────────────
  analyzeResume: (text: string) =>
    ipcRenderer.invoke('ai:analyze-resume', text),

  evaluateAnswer: (question: string, answer: string) =>
    ipcRenderer.invoke('ai:evaluate-answer', question, answer),

  setApiKey: (key: string) =>
    ipcRenderer.invoke('ai:set-api-key', key),

  // ─── Hardware Check ────────────────────────────────────────
  checkHardware: () =>
    ipcRenderer.invoke('hardware:check'),

  // ─── System Info ───────────────────────────────────────────
  getAppVersion: () =>
    ipcRenderer.invoke('app:get-version'),

  getPlatform: () => process.platform,

  // ─── Auto Updates ──────────────────────────────────────────
  onUpdateAvailable: (callback) =>
    ipcRenderer.on('update:available', (_event, info) => callback(info)),

  onUpdateDownloaded: (callback) =>
    ipcRenderer.on('update:downloaded', (_event, info) => callback(info)),

  installUpdate: () =>
    ipcRenderer.send('update:install'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
