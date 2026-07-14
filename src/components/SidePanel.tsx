import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Cpu, Box, Layers, Network, Globe, Anchor, Cog } from 'lucide-react';

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
  { id: 2, label: 'ContainerD', icon: Cog },
  { id: 3, label: 'Kubernetes Intro', icon: Ship },
  { id: 4, label: 'Grand Fleet Arch', icon: Anchor },
  { id: 5, label: 'Pods', icon: Box },
  { id: 6, label: 'Nodes', icon: Cpu },
  { id: 7, label: 'ReplicaSets', icon: Layers },
  { id: 8, label: 'Services', icon: Network },
  { id: 9, label: 'Ingress', icon: Globe },
];

export const SidePanel: React.FC<SidePanelProps> = ({ currentStep, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    closeTimeout.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeout.current = null;
    }, 250);
  }, []);

  const handleForceClose = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Invisible hover trigger zone on left side */}
      <div
        className="fixed left-0 top-0 bottom-0 w-12 z-[100] cursor-pointer"
        onMouseEnter={handleOpen}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
              onClick={handleForceClose}
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-mcb-950 backdrop-blur-xl border-r border-mcb-800 z-[100] shadow-2xl transition-colors duration-300"
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
            >
              {/* Header */}
              <div className="p-6 border-b border-mcb-800/50">
                <h2 className="text-2xl font-bold text-mcb-50 flex items-center gap-2">
                  <Ship className="text-mcb-400" size={24} />
                  Navigation
                </h2>
                <p className="text-xs text-mcb-300 mt-1">Jump to any section</p>
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
                        handleForceClose();
                      }}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 group
                        ${isActive
                          ? 'bg-mcb-600 text-white shadow-lg shadow-mcb-500/50'
                          : isCompleted
                          ? 'bg-mcb-900/40 text-mcb-200 hover:bg-mcb-800/60'
                          : 'bg-mcb-900/20 text-mcb-300 hover:bg-mcb-900/40'
                        }
                      `}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`
                        p-2 rounded transition-colors duration-200 ${isActive ? 'bg-white/20' : 'bg-mcb-800/30'}
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
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-mcb-950 to-transparent">
                <div className="flex items-center justify-center gap-2 text-xs text-mcb-400">
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
