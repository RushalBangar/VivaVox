import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import Store from 'electron-store';

/**
 * AI Engine — Local Gemma Integration (via Ollama)
 *
 * This version uses a local Ollama instance to run Gemma.
 * This ensures total privacy and offline capability as requested.
 *
 * Requirements: Ollama must be installed and gemma:2b must be downloaded.
 */

interface AnalysisResult {
  questions: string[];
  summary: string;
}

const store = new Store();

// Helper to call Ollama via CLI
async function callOllama(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = '';
    // Use 'ollama run gemma:2b --format json' if supported, 
    // or just 'run' and parse the string.
    const child = spawn('ollama', ['run', 'gemma:2b', prompt]);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.error(`[Ollama Error]: ${data}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Ollama process exited with code ${code}. Is Ollama installed?`));
      }
    });
  });
}

export function setupAIHandlers(): void {
  // ─── Analyze Resume (Local) ──────────────────────────────
  ipcMain.handle('ai:analyze-resume', async (_event, text: string): Promise<AnalysisResult> => {
    const prompt = `Analyze this resume and generate 10 interview questions.
Return ONLY a JSON object: {"questions": ["q1", "q2", ...], "summary": "brief summary"}

Resume: ${text}`;

    try {
      const response = await callOllama(prompt);
      
      // Attempt to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');
      
      const parsed: AnalysisResult = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error: any) {
      console.error('Local AI Analysis failed:', error);
      throw new Error(`Local AI Error: ${error.message}. Make sure Ollama is running and gemma:2b is downloaded.`);
    }
  });

  // ─── Evaluate Answer (Local) ─────────────────────────────
  ipcMain.handle('ai:evaluate-answer', async (_event, question: string, answer: string): Promise<string> => {
    const prompt = `Question: ${question}\nAnswer: ${answer}\nAnalyze for accuracy and clarity. Provide 3 feedback sentences.`;

    try {
      return await callOllama(prompt);
    } catch (error: any) {
      throw new Error(`Local AI Evaluation failed: ${error.message}`);
    }
  });
}
