/**
 * Global type declarations for the Electron API
 * exposed via the preload script's contextBridge.
 */

interface AnalysisResult {
  questions: string[];
  summary: string;
}

interface HardwareStatus {
  webcamAvailable: boolean;
  microphoneAvailable: boolean;
  ramGB: number;
  ramSufficient: boolean;
  allPassed: boolean;
}

interface ElectronAPI {
  analyzeResume: (text: string) => Promise<AnalysisResult>;
  evaluateAnswer: (question: string, answer: string) => Promise<string>;
  setApiKey: (key: string) => Promise<void>;
  checkModel: () => Promise<boolean>;
  pullModel: () => void;
  onPullProgress: (callback: (percent: number) => void) => void;
  onPullComplete: (callback: () => void) => void;
  onPullError: (callback: (error: string) => void) => void;
  checkHardware: () => Promise<HardwareStatus>;
  getAppVersion: () => Promise<string>;
  getPlatform: () => string;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  installUpdate: () => void;
}

interface Window {
  electronAPI: ElectronAPI;
}
