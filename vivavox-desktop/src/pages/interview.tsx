import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Experience3D } from '@/components/Experience3D';
import { HUDOverlay } from '@/components/HUDOverlay';
import { WebcamFeed } from '@/components/WebcamFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function InterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  // Load questions from session storage (set by setup page)
  useEffect(() => {
    const stored = sessionStorage.getItem('interviewQuestions');
    if (stored) {
      try {
        setQuestions(JSON.parse(stored));
      } catch {
        setQuestions(getDefaultQuestions());
      }
    } else {
      setQuestions(getDefaultQuestions());
    }
  }, []);

  // ─── Speech Recognition ────────────────────────────────────
  const startRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setFeedback('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not available');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopAndEvaluate = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (!transcript.trim()) {
      setFeedback('No response detected. Please try answering again.');
      return;
    }

    setIsEvaluating(true);
    try {
      const result = await window.electronAPI.evaluateAnswer(
        questions[currentQuestion],
        transcript
      );
      setFeedback(result);
    } catch (err: any) {
      setFeedback(`Evaluation error: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTranscript('');
      setFeedback('');
    } else {
      // Interview complete — go to dashboard
      router.push('/');
    }
  };

  if (questions.length === 0) return null;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Head>
        <title>Interview Room | VivaVox</title>
      </Head>

      <Experience3D />
      <WebcamFeed />
      <HUDOverlay />

      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen p-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl"
          >
            <div className="text-cyan-400 text-sm font-bold tracking-[0.5em] uppercase mb-4">
              Neural Query {String(currentQuestion + 1).padStart(2, '0')}/{questions.length}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
              {questions[currentQuestion]}
            </h2>

            {/* Transcript Display */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 glass-panel p-4 text-left text-gray-300 text-sm max-h-32 overflow-y-auto"
              >
                <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase block mb-2">
                  Live Transcript
                </span>
                {transcript}
              </motion.div>
            )}

            {/* Feedback Display */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 glass-panel p-6 text-left text-gray-300 text-sm border-green-500/20"
              >
                <span className="text-[10px] text-green-400 font-bold tracking-widest uppercase block mb-2">
                  AI Feedback
                </span>
                {feedback}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Control Bar */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {!isRecording && !feedback && (
          <button
            onClick={startRecording}
            className="hud-border px-8 py-3 bg-red-500/20 hover:bg-red-500/40 transition-all text-xs font-bold tracking-widest uppercase flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopAndEvaluate}
            className="hud-border px-8 py-3 bg-amber-500/20 hover:bg-amber-500/40 transition-all text-xs font-bold tracking-widest uppercase flex items-center gap-2"
          >
            {isEvaluating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating</>
            ) : (
              'Stop & Evaluate'
            )}
          </button>
        )}

        {feedback && (
          <button
            onClick={handleNext}
            className="hud-border px-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 transition-all text-xs font-bold tracking-widest uppercase flex items-center gap-2"
          >
            {currentQuestion === questions.length - 1 ? (
              <><CheckCircle className="w-4 h-4" /> Finish Interview</>
            ) : (
              <><ArrowRight className="w-4 h-4" /> Next Question</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function getDefaultQuestions(): string[] {
  return [
    "Can you describe a situation where you had to lead a project under extreme technical constraints?",
    "How do you handle disagreements with team members regarding architectural decisions?",
    "What is your approach to learning new technologies in a rapidly evolving field?",
    "Explain a complex technical concept you recently mastered in simple terms.",
    "Where do you see the future of independent AI desktop applications heading?"
  ];
}
