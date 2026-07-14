import React, { useRef, useEffect } from 'react';
import type { LevelId } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface GameContainerProps {
  currentLevel: LevelId;
  children: React.ReactNode;
  onNavigate: (level: LevelId) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ currentLevel, children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentLevel]);

  return (
    <div className="min-h-screen bg-mcb-950 text-mcb-50 font-sans overflow-hidden flex flex-col transition-colors duration-300">
      {/* Top Bar */}
      <div className="p-4 border-b border-mcb-800/50 bg-mcb-900/50 backdrop-blur-sm flex justify-between items-center z-20 transition-colors duration-300">
          <h1 className="text-xl font-bold bg-gradient-to-r from-mcb-400 to-mcb-500 bg-clip-text text-transparent">
            DevSecOps Explorer
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-mcb-700/50 hover:border-mcb-500 bg-mcb-900/50 hover:bg-mcb-800/50 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-mcb-300" />
            ) : (
              <Moon size={18} className="text-mcb-300" />
            )}
          </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-8 relative z-10"
        >
          <div className="max-w-6xl mx-auto min-h-full flex flex-col items-center py-12">
             <AnimatePresence mode="wait">
                <motion.div
                  key={currentLevel}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="w-full"
                >
                  {children}
                </motion.div>
             </AnimatePresence>
          </div>
        </div>

        {/* Background decorations - blue glow (subtle pulse) */}
        <div className="k8s-glow-orb absolute top-0 right-0 w-96 h-96 bg-mcb-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="k8s-glow-orb absolute bottom-0 left-0 w-96 h-96 bg-mcb-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none [animation-delay:2s]" />
      </div>
    </div>
  );
};
