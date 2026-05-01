import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Eye, Zap, ShieldCheck } from 'lucide-react';

export const HUDOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between border-[20px] border-white/5">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex gap-8">
          <div className="hud-border bg-black/40 backdrop-blur-md p-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Eye Contact</span>
            </div>
            <div className="text-2xl font-mono">98.4%</div>
          </div>
          <div className="hud-border bg-black/40 backdrop-blur-md p-4">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Neural Tone</span>
            </div>
            <div className="text-2xl font-mono">STABLE</div>
          </div>
        </div>

        <div className="hud-border bg-cyan-500/10 backdrop-blur-md p-4 text-right">
          <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mb-1">System Status</div>
          <div className="flex items-center gap-2 justify-end text-green-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-mono tracking-tighter">ENCRYPTED & INDEPENDENT</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        <div className="max-w-md">
          <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2">Active Intelligence</div>
          <div className="hud-border bg-black/60 backdrop-blur-lg p-6">
            <p className="text-cyan-100 text-lg leading-relaxed italic">
              "Analyzing semantic patterns and non-verbal cues in real-time..."
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-end">
          <div className="flex gap-1 h-8 items-end">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 2 }}
                animate={{ height: [2, Math.random() * 32, 2] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                className="w-1 bg-cyan-400/50"
              />
            ))}
          </div>
          <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Frequency Analysis</div>
        </div>
      </div>

      {/* Center Reticle (HUD Style) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-64 h-64 border border-cyan-500/30 rounded-full flex items-center justify-center">
          <div className="w-48 h-48 border border-cyan-500/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
