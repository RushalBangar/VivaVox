import { ipcMain, app } from 'electron';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import Store from 'electron-store';

/**
 * AI Engine — Google Gemma Integration
 *
 * Uses the @google/generative-ai SDK to interact with Google's Gemma model.
 * The API key is stored securely in electron-store (encrypted local storage).
 */

interface AnalysisResult {
  questions: string[];
  summary: string;
}

const store = new Store({
  encryptionKey: 'vivavox-secure-2026', // Encrypts sensitive data at rest
});

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function initializeModel(apiKey: string): void {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemma-3-4b-it' });
}

// Try to load saved API key on startup
const savedKey = store.get('gemma-api-key') as string | undefined;
if (savedKey) {
  initializeModel(savedKey);
}

export function setupAIHandlers(): void {
  // ─── Set API Key ─────────────────────────────────────────
  ipcMain.handle('ai:set-api-key', async (_event, key: string) => {
    store.set('gemma-api-key', key);
    initializeModel(key);
  });

  // ─── Analyze Resume ──────────────────────────────────────
  ipcMain.handle('ai:analyze-resume', async (_event, text: string): Promise<AnalysisResult> => {
    if (!model) {
      throw new Error('AI model not initialized. Please set your Google AI API key first.');
    }

    const prompt = `You are an expert interview coach. Analyze the following resume and generate exactly 10 professional, role-specific interview questions based on the candidate's skills, experience, and projects listed.

Return your response as a valid JSON object with exactly this structure:
{
  "questions": ["question1", "question2", ...],
  "summary": "A brief 2-3 sentence overview of the candidate's profile"
}

IMPORTANT: Return ONLY the JSON object. No markdown, no code fences, no explanation.

Resume Text:
${text}`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed: AnalysisResult = JSON.parse(jsonStr);

      // Validate structure
      if (!Array.isArray(parsed.questions) || typeof parsed.summary !== 'string') {
        throw new Error('Invalid response structure');
      }

      return parsed;
    } catch (error: any) {
      console.error('Gemma analysis failed:', error);
      throw new Error(`AI Analysis failed: ${error.message}. Please try again.`);
    }
  });

  // ─── Evaluate Answer ─────────────────────────────────────
  ipcMain.handle('ai:evaluate-answer', async (_event, question: string, answer: string): Promise<string> => {
    if (!model) {
      throw new Error('AI model not initialized. Please set your Google AI API key first.');
    }

    const prompt = `You are an expert interview evaluator. Analyze the following interview response.

Question: ${question}
Candidate's Answer: ${answer}

Evaluate the answer across these dimensions:
1. **Technical Accuracy** — Is the answer factually correct and technically sound?
2. **Communication Clarity** — Is the response well-structured and articulate?
3. **Confidence Level** — Does the candidate demonstrate confidence without arrogance?
4. **Depth of Knowledge** — Does the answer show deep understanding or just surface-level knowledge?

Provide brief, constructive feedback (3-5 sentences) that would help the candidate improve. Be encouraging but honest.`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      console.error('Gemma evaluation failed:', error);
      throw new Error(`AI Evaluation failed: ${error.message}`);
    }
  });

  // ─── App Version ──────────────────────────────────────────
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });
}
