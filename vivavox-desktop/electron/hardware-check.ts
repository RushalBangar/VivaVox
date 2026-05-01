import { ipcMain } from 'electron';
import os from 'os';

/**
 * Hardware Check Module
 *
 * Validates that the user's system meets minimum requirements
 * before starting an interview session:
 * - Webcam available
 * - Microphone available
 * - Minimum 4GB RAM
 */

export interface HardwareStatus {
  webcamAvailable: boolean;
  microphoneAvailable: boolean;
  ramGB: number;
  ramSufficient: boolean;
  allPassed: boolean;
}

const MIN_RAM_GB = 4;

export function setupHardwareCheckHandlers(): void {
  ipcMain.handle('hardware:check', async (): Promise<HardwareStatus> => {
    const totalRAM = os.totalmem();
    const ramGB = Math.round((totalRAM / (1024 * 1024 * 1024)) * 10) / 10;
    const ramSufficient = ramGB >= MIN_RAM_GB;

    // Webcam and microphone availability are checked client-side
    // via navigator.mediaDevices (renderer process).
    // Here we report RAM and mark media as "pending" — 
    // the renderer will update these via its own checks.
    const status: HardwareStatus = {
      webcamAvailable: true,  // Will be verified by renderer via getUserMedia
      microphoneAvailable: true, // Will be verified by renderer via getUserMedia
      ramGB,
      ramSufficient,
      allPassed: ramSufficient,
    };

    return status;
  });
}
