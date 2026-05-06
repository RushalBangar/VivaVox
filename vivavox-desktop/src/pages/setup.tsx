import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Experience3D } from '@/components/Experience3D';
import { Upload, FileText, Loader2, CheckCircle, Cpu, Download } from 'lucide-react';
import { useRouter } from 'next/router';

type SetupPhase = 'welcome' | 'downloading' | 'upload' | 'hardware-check' | 'analyzing' | 'ready';

export default function SetupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<SetupPhase>('welcome');
  const [resumeText, setResumeText] = useState('');
  const [hardwareStatus, setHardwareStatus] = useState<any>(null);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onPullProgress((percent: number) => {
        setDownloadProgress(percent);
      });
      
      window.electronAPI.onPullComplete(() => {
        setPhase('upload');
      });

      window.electronAPI.onPullError((err: string) => {
        setError(`Failed to download AI Model: ${err}`);
        setPhase('welcome');
      });
    }
  }, []);

  const initializeSystem = async () => {
    setError('');
    try {
      const hasModel = await window.electronAPI.checkModel();
      if (hasModel) {
        setPhase('upload');
      } else {
        setPhase('downloading');
        window.electronAPI.pullModel();
      }
    } catch (err) {
      setError('Failed to connect to internal AI engine.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
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
      sessionStorage.setItem('interviewQuestions', JSON.stringify(result.questions));
      sessionStorage.setItem('candidateSummary', result.summary);

      setPhase('ready');
      setTimeout(() => {
        router.push('/interview');
      }, 2000);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError('Local AI Error: Failed to analyze resume.');
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
          {/* ─── Phase: Welcome ──────────────────────────────── */}
          {phase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <Cpu className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 neon-text">Independent Neural Intelligence</h2>
              <p className="text-gray-400 mb-8">
                VivaVox runs entirely on your hardware for 100% privacy. 
                Initializing the system will verify and securely download the local Gemma AI model if needed.
              </p>
              <button
                onClick={initializeSystem}
                className="hud-border px-12 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all font-bold tracking-widest uppercase"
              >
                Initialize System
              </button>
            </motion.div>
          )}

          {/* ─── Phase: Downloading ────────────────────────────── */}
          {phase === 'downloading' && (
            <motion.div
              key="downloading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <Download className="w-12 h-12 text-cyan-400 animate-bounce mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 neon-text">Downloading AI Core</h2>
              <p className="text-gray-400 mb-8">
                Fetching the Gemma:2b neural model directly to your isolated secure vault...
              </p>
              
              <div className="w-full bg-gray-800 rounded-full h-4 mb-4 overflow-hidden border border-cyan-500/30">
                <div 
                  className="bg-cyan-500 h-4 transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <div className="text-cyan-400 font-mono tracking-widest">{downloadProgress}% COMPLETED</div>
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
              <h2 className="text-3xl font-bold mb-6 neon-text">Resume Analysis</h2>
              <p className="text-gray-400 mb-8">
                Upload your resume for local parsing.
              </p>

              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-cyan-500/30 rounded-xl cursor-pointer hover:bg-cyan-500/5 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="mb-2 text-sm text-cyan-100">
                      <span className="font-bold tracking-widest uppercase">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-tighter">PDF, DOCX, or TXT</p>
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

          {phase === 'hardware-check' && (
            <motion.div key="hardware" className="glass-panel p-12 max-w-2xl w-full text-center">
              <h2 className="text-3xl font-bold mb-6 neon-text">System Diagnostics</h2>
              {!hardwareStatus ? <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" /> : (
                <div className="space-y-4">
                  <div className="flex justify-between p-4 border border-cyan-500/20"><span>Webcam</span>{hardwareStatus.webcamAvailable ? 'OK' : 'FAIL'}</div>
                  <div className="flex justify-between p-4 border border-cyan-500/20"><span>Microphone</span>{hardwareStatus.microphoneAvailable ? 'OK' : 'FAIL'}</div>
                  <div className="flex justify-between p-4 border border-cyan-500/20"><span>RAM ({hardwareStatus.ramGB}GB)</span>{hardwareStatus.ramSufficient ? 'OK' : 'FAIL'}</div>
                  {hardwareStatus.allPassed && <p className="text-green-400 font-bold uppercase mt-4">All Systems Nominal</p>}
                </div>
              )}
            </motion.div>
          )}

          {phase === 'analyzing' && (
            <motion.div key="analyzing" className="glass-panel p-12 max-w-2xl w-full text-center">
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 neon-text">Local Neural Processing</h2>
              <p className="text-gray-400 text-sm tracking-widest uppercase">Analyzing resume with local engine...</p>
            </motion.div>
          )}

          {phase === 'ready' && (
            <motion.div key="ready" className="glass-panel p-12 max-w-2xl w-full text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 neon-text">Analysis Complete</h2>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-w-2xl w-full text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
