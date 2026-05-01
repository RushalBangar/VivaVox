import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Experience3D } from '@/components/Experience3D';
import { Rocket, Shield, Zap, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <Head>
        <title>VivaVox | Neural Interview Intelligence</title>
        <meta name="description" content="State-of-the-art independent AI interview platform" />
      </Head>

      <Experience3D />

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl font-bold tracking-tighter mb-4 neon-text">
              VIVAVOX
            </h1>
            <p className="text-2xl text-cyan-400/80 mb-8 font-light tracking-wide uppercase">
              Independent Neural Interview Intelligence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
          >
            <div className="glass-panel p-8 group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <Cpu className="w-8 h-8 text-cyan-400" />
                <h3 className="text-xl font-semibold">On-Device AI</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Powered by local Gemma models. Your data never leaves your machine. 
                Pure performance, zero latency, total privacy.
              </p>
            </div>

            <div className="glass-panel p-8 group hover:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <h3 className="text-xl font-semibold">Uncrashable Shell</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Built with Tauri and Rust. A lightweight, robust desktop environment 
                designed for mission-critical stability.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12"
          >
            <a href="/setup" className="inline-block hud-border px-12 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all group overflow-hidden">
              <span className="relative z-10 flex items-center gap-3 font-bold tracking-widest uppercase">
                Initialize System <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </a>
          </motion.div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full p-6 text-center text-gray-500 text-sm tracking-widest uppercase border-t border-white/5 bg-black/20 backdrop-blur-sm">
        VivaVox 2026 // Neural Dynamics // Rushal Bangar
      </footer>
    </div>
  );
}
