import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, RefreshCw, X } from 'lucide-react';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVersion, setUpdateVersion] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onUpdateDownloaded((info: any) => {
        setUpdateVersion(info.version || '');
        setUpdateAvailable(true);
      });
    }
  }, []);

  const handleRestart = () => {
    if (window.electronAPI) {
      window.electronAPI.installUpdate();
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-4 bg-gray-900 border border-cyan-500/50 rounded-xl p-4 shadow-lg shadow-cyan-500/20"
        >
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <DownloadCloud className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Update Ready to Install!</h4>
            <p className="text-gray-400 text-xs">
              {updateVersion ? `Version ${updateVersion} has been downloaded in the background.` : 'A fast patch has been downloaded in the background.'}
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-cyan-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Restart
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
