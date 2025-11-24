import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Cpu, Box, Layers, Network, Globe, Anchor } from 'lucide-react';

interface SidePanelProps {
  currentStep: number;
  onNavigate: (step: number) => void;
}

interface NavItem {
  id: number;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 0, label: 'Introduction', icon: Ship },
  { id: 1, label: 'Containers (Docker)', icon: Box },
  { id: 2, label: 'Kubernetes Intro', icon: Ship },
  { id: 3, label: 'Grand Fleet Arch', icon: Anchor },
  { id: 4, label: 'Pods', icon: Box },
  { id: 5, label: 'Nodes', icon: Cpu },
  { id: 6, label: 'ReplicaSets', icon: Layers },
  { id: 7, label: 'Services', icon: Network },
  { id: 8, label: 'Ingress', icon: Globe },
];

export const SidePanel: React.FC<SidePanelProps> = ({ currentStep, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Invisible hover trigger zone on left side */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-8 z-[100] cursor-pointer"
        onMouseEnter={() => setIsOpen(true)}
      />
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Side Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-indigo-950/98 to-purple-950/98 backdrop-blur-xl border-r-2 border-indigo-500/50 z-[100] shadow-2xl"
              onMouseLeave={() => setIsOpen(false)}
            >
              {/* Header */}
              <div className="p-6 border-b border-indigo-500/30">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Ship className="text-indigo-400" size={24} />
                  Navigation
                </h2>
                <p className="text-xs text-indigo-300 mt-1">Jump to any section</p>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentStep === item.id;
                  const isCompleted = currentStep > item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 group
                        ${isActive 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' 
                          : isCompleted
                          ? 'bg-indigo-900/40 text-indigo-200 hover:bg-indigo-800/60'
                          : 'bg-indigo-950/30 text-indigo-400 hover:bg-indigo-900/40'
                        }
                      `}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`
                        p-2 rounded ${isActive ? 'bg-white/20' : 'bg-indigo-800/30'}
                      `}>
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                      {isCompleted && !isActive && (
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-indigo-950 to-transparent">
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-400">
                  <Ship size={14} />
                  <span>Navigate your Kubernetes journey</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

