import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Experience3D } from '@/components/Experience3D';
import { Upload, FileText, Loader2, CheckCircle, Camera, Mic, Cpu, AlertTriangle, Key } from 'lucide-react';
import { useRouter } from 'next/router';

type SetupPhase = 'api-key' | 'upload' | 'hardware-check' | 'analyzing' | 'ready';

export default function SetupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<SetupPhase>('api-key');
  const [apiKey, setApiKey] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) return;
    try {
      await window.electronAPI.setApiKey(apiKey.trim());
      setPhase('upload');
    } catch (err: any) {
      setError(err.message || 'Failed to set API key');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Read file as text (for txt/pdf text extraction)
      try {
        const text = await selectedFile.text();
        setResumeText(text);
      } catch {
        setResumeText(`Resume: ${selectedFile.name}`);
      }
    }
  };

  const runHardwareCheck = async () => {
    setPhase('hardware-check');
    setError('');

    try {
      const status = await window.electronAPI.checkHardware();

      // Also check webcam/mic from the browser side
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        status.webcamAvailable = true;
        status.microphoneAvailable = true;
      } catch {
        status.webcamAvailable = false;
        status.microphoneAvailable = false;
      }

      status.allPassed = status.webcamAvailable && status.microphoneAvailable && status.ramSufficient;
      setHardwareStatus(status);

      if (status.allPassed) {
        // Auto-proceed after showing results
        setTimeout(() => startAnalysis(), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Hardware check failed');
    }
  };

  const startAnalysis = async () => {
    if (!resumeText) return;
    setPhase('analyzing');
    setError('');

    try {
      const result = await window.electronAPI.analyzeResume(resumeText);
      console.log('Analysis Result:', result);

      // Store the result for the interview page
      sessionStorage.setItem('interviewQuestions', JSON.stringify(result.questions));
      sessionStorage.setItem('candidateSummary', result.summary);

      setPhase('ready');
      setTimeout(() => {
        router.push('/interview');
      }, 2000);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError(err.message || 'AI analysis failed. Check your API key and try again.');
      setPhase('upload');
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Head>
        <title>Setup | VivaVox</title>
      </Head>

      <Experience3D />

      <main className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {/* ─── Phase: API Key ──────────────────────────────── */}
          {phase === 'api-key' && (
            <motion.div
              key="api-key"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <Key className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 neon-text">Neural Link Setup</h2>
              <p className="text-gray-400 mb-8">
                Enter your Google AI API key to activate the Gemma intelligence engine.
              </p>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter Google AI API Key..."
                  className="flex-1 bg-white/5 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                />
                <button
                  onClick={handleApiKeySubmit}
                  disabled={!apiKey.trim()}
                  className="hud-border px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 transition-all text-xs font-bold tracking-widest uppercase disabled:opacity-30"
                >
                  Activate
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-4 tracking-wider uppercase">
                Your key is stored locally and encrypted. It never leaves your machine.
              </p>
            </motion.div>
          )}

          {/* ─── Phase: Upload Resume ───────────────────────── */}
          {phase === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <h2 className="text-3xl font-bold mb-6 neon-text">System Initialization</h2>
              <p className="text-gray-400 mb-8">
                Upload your resume to allow Gemma AI to generate personalized neural queries.
              </p>

              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-cyan-500/30 rounded-xl cursor-pointer hover:bg-cyan-500/5 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="mb-2 text-sm text-cyan-100">
                      <span className="font-bold tracking-widest uppercase">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-tighter">PDF, DOCX, or TXT (Max 10MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-cyan-400" />
                      <div className="text-left">
                        <div className="font-bold text-sm truncate max-w-[200px]">{file.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">File Detected</div>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <button
                    onClick={runHardwareCheck}
                    className="hud-border px-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 transition-all text-xs font-bold tracking-widest uppercase w-full"
                  >
                    Run System Diagnostics
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Phase: Hardware Check ──────────────────────── */}
          {phase === 'hardware-check' && (
            <motion.div
              key="hardware"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <h2 className="text-3xl font-bold mb-6 neon-text">System Diagnostics</h2>

              {!hardwareStatus ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                  <p className="text-gray-400 text-sm tracking-widest uppercase">Scanning hardware...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <HardwareItem
                    icon={<Camera className="w-5 h-5" />}
                    label="Webcam"
                    passed={hardwareStatus.webcamAvailable}
                  />
                  <HardwareItem
                    icon={<Mic className="w-5 h-5" />}
                    label="Microphone"
                    passed={hardwareStatus.microphoneAvailable}
                  />
                  <HardwareItem
                    icon={<Cpu className="w-5 h-5" />}
                    label={`RAM: ${hardwareStatus.ramGB} GB`}
                    passed={hardwareStatus.ramSufficient}
                  />

                  {hardwareStatus.allPassed ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-green-400 font-bold tracking-widest uppercase text-sm"
                    >
                      All systems nominal. Initializing AI...
                    </motion.p>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 justify-center text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="text-sm">Some checks failed. Interview quality may be reduced.</p>
                    </div>
                  )}

                  {!hardwareStatus.allPassed && (
                    <button
                      onClick={startAnalysis}
                      className="hud-border px-8 py-3 bg-amber-500/20 hover:bg-amber-500/40 transition-all text-xs font-bold tracking-widest uppercase mt-4"
                    >
                      Continue Anyway
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Phase: Analyzing ───────────────────────────── */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 neon-text">Neural Processing</h2>
              <p className="text-gray-400 text-sm tracking-widest uppercase">
                Gemma AI is analyzing your resume and generating personalized interview questions...
              </p>
            </motion.div>
          )}

          {/* ─── Phase: Ready ───────────────────────────────── */}
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 neon-text">Analysis Complete</h2>
              <p className="text-green-400 font-bold tracking-widest uppercase text-sm">
                Initializing Interview HUD...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-w-2xl w-full text-center"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// ─── Sub-component ─────────────────────────────────────────────
function HardwareItem({ icon, label, passed }: { icon: React.ReactNode; label: string; passed: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
      <div className="flex items-center gap-3">
        <span className={passed ? 'text-green-400' : 'text-red-400'}>{icon}</span>
        <span className="text-sm font-bold tracking-widest uppercase">{label}</span>
      </div>
      {passed ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-400" />
      )}
    </div>
  );
}
