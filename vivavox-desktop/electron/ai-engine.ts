import { app, ipcMain } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * AI Engine — Local Gemma Integration (Portable Bundled Ollama)
 */

const OLLAMA_PORT = 11435;
const OLLAMA_HOST = `http://127.0.0.1:${OLLAMA_PORT}`;
let ollamaProcess: ChildProcess | null = null;

interface AnalysisResult {
  questions: string[];
  summary: string;
}

// 1. Lifecycle Management: Start the internal Ollama server
export function startOllamaServer() {
  const isDev = !app.isPackaged;
  const platform = process.platform;
  const exeName = platform === 'win32' ? 'ollama.exe' : 'ollama';
  
  // Path to the bundled binary
  const binPath = isDev 
    ? path.join(__dirname, '../../assets/bin', exeName)
    : path.join(process.resourcesPath, 'bin', exeName);

  if (!fs.existsSync(binPath)) {
    console.error('[AI Engine] Bundled Ollama binary not found at:', binPath);
    return;
  }

  // Isolated models directory
  const modelsDir = path.join(app.getPath('userData'), 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  console.log('[AI Engine] Starting portable Ollama...');
  
  ollamaProcess = spawn(binPath, ['serve'], {
    env: {
      ...process.env,
      OLLAMA_HOST: `127.0.0.1:${OLLAMA_PORT}`,
      OLLAMA_MODELS: modelsDir,
    },
    windowsHide: true,
  });

  ollamaProcess.stdout?.on('data', (data) => console.log(`[Ollama] ${data}`));
  ollamaProcess.stderr?.on('data', (data) => console.error(`[Ollama] ${data}`));

  // Ensure cleanup on quit
  app.on('will-quit', () => {
    if (ollamaProcess) {
      console.log('[AI Engine] Shutting down portable Ollama...');
      ollamaProcess.kill();
    }
  });
}

// Helper to call Ollama via REST API instead of CLI
async function callOllamaAPI(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma:2b',
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API returned ${response.statusText}`);
  }

  const data = await response.json();
  return data.response.trim();
}

export function setupAIHandlers(): void {
  // Start server on load
  startOllamaServer();

  // ─── Check Model Status ──────────────────────────────────
  ipcMain.handle('ai:check-model', async () => {
    try {
      const response = await fetch(`${OLLAMA_HOST}/api/tags`);
      const data = await response.json();
      const hasGemma = data.models?.some((m: any) => m.name === 'gemma:2b');
      return hasGemma;
    } catch (e) {
      return false; // Server not ready or model missing
    }
  });

  // ─── Download Model (Stream Progress) ────────────────────
  ipcMain.on('ai:pull-model', async (event) => {
    try {
      const response = await fetch(`${OLLAMA_HOST}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'gemma:2b', stream: true })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n').filter(l => l.trim() !== '');
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.total && data.completed) {
              const percent = Math.round((data.completed / data.total) * 100);
              event.reply('ai:pull-progress', percent);
            }
          } catch (e) { /* ignore parse error on partial chunks */ }
        }
      }
      
      event.reply('ai:pull-complete');
    } catch (error: any) {
      event.reply('ai:pull-error', error.message);
    }
  });

  // ─── Analyze Resume (Local REST) ─────────────────────────
  ipcMain.handle('ai:analyze-resume', async (_event, text: string): Promise<AnalysisResult> => {
    const prompt = `Analyze this resume and generate 10 interview questions.
Return ONLY a JSON object: {"questions": ["q1", "q2", ...], "summary": "brief summary"}

Resume: ${text}`;

    try {
      const response = await callOllamaAPI(prompt);
      const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
      if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      throw new Error(`Local AI Error: ${error.message}`);
    }
  });

  // ─── Evaluate Answer (Local REST) ────────────────────────
  ipcMain.handle('ai:evaluate-answer', async (_event, question: string, answer: string): Promise<string> => {
    const prompt = `Question: ${question}\\nAnswer: ${answer}\\nAnalyze for accuracy and clarity. Provide 3 feedback sentences.`;
    try {
      return await callOllamaAPI(prompt);
    } catch (error: any) {
      throw new Error(`Local AI Evaluation failed: ${error.message}`);
    }
  });
}
