import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, ArrowLeft, Eye, Heart, Zap, Shield, Sprout, Waves, Scroll, Activity, Dna, Book, Ghost, Globe, Lock, Layers, Sun, Ship, Database, Server, Anchor, Radio, Cpu, ClipboardList, Network, FileJson, Table, Terminal, Package, Repeat, Play, CheckCircle } from 'lucide-react';

interface KubernetesIntroProps {
  onComplete: () => void;
  initialStep?: number;
}

// JSON Viewer Component - Clean and Simple
const JSONViewer: React.FC<{ data: unknown }> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);
  const lines = jsonString.split('\n');

  const highlightJSON = (line: string) => {
    const parts: React.ReactNode[] = [];
    
    // Simple regex-based highlighting
    const keyMatch = line.match(/^(\s*)("[\w-]+")\s*:/);
    if (keyMatch) {
      const indent = keyMatch[1];
      const keyPart = keyMatch[2];
      const rest = line.substring(keyMatch[0].length);
      
      parts.push(
        <span key="indent" className="text-gray-600">{indent}</span>,
        <span key="key" className="text-blue-400 font-semibold">{keyPart}</span>,
        <span key="colon" className="text-gray-500"> :</span>
      );
      
      // Highlight value
      if (rest.trim().startsWith('"')) {
        const valueMatch = rest.match(/(".*?")/);
        if (valueMatch) {
          parts.push(<span key="value" className="text-yellow-300">{valueMatch[1]}</span>);
          parts.push(<span key="rest" className="text-gray-300">{rest.substring(valueMatch[0].length)}</span>);
        } else {
          parts.push(<span key="value" className="text-gray-300">{rest}</span>);
        }
      } else if (rest.trim().match(/^(true|false|null|\d+)/)) {
        const valueMatch = rest.match(/(true|false|null|\d+)/);
        if (valueMatch) {
          parts.push(<span key="value" className="text-cyan-400">{valueMatch[1]}</span>);
          parts.push(<span key="rest" className="text-gray-300">{rest.substring(valueMatch[1].length)}</span>);
        } else {
          parts.push(<span key="value" className="text-gray-300">{rest}</span>);
        }
      } else {
        parts.push(<span key="value" className="text-gray-300">{rest}</span>);
      }
    } else {
      // Just brackets/braces or other syntax
      const syntaxMatch = line.match(/^(\s*)([{}[\],])/);
      if (syntaxMatch) {
        parts.push(
          <span key="indent" className="text-gray-600">{syntaxMatch[1]}</span>,
          <span key="syntax" className="text-gray-400">{syntaxMatch[2]}</span>,
          <span key="rest" className="text-gray-300">{line.substring(syntaxMatch[0].length)}</span>
        );
      } else {
        parts.push(<span key="line" className="text-gray-300">{line}</span>);
      }
    }
    
    return parts;
  };

  return (
    <div className="font-mono text-xs leading-relaxed select-text">
      {lines.map((line, idx) => (
        <div key={idx} className="flex items-start min-h-[18px]">
          <span className="text-gray-600 mr-3 select-none w-5 text-right text-[10px]">{idx + 1}</span>
          <span className="flex-1">{highlightJSON(line)}</span>
        </div>
      ))}
    </div>
  );
};

// Animation Components for ETCD Flow with Detailed Explanations - Step by Step
const StorageFlowAnimation: React.FC<{ dataKey: string; dataValue: unknown; onComplete?: () => void }> = ({ dataKey, dataValue, onComplete }) => {
  const [step, setStep] = useState(-1); // -1 = not started, 0-3 = steps
  const [isStarted, setIsStarted] = useState(false);

  const explanations = [
    {
      title: "Step 1: kubectl Command",
      description: "You run `kubectl create pod` - kubectl sends a REST API request to the Kubernetes API Server.",
      icon: Terminal,
      color: "blue"
    },
    {
      title: "Step 2: API Server Processing",
      description: "API Server validates the request, authenticates you, and processes the pod specification.",
      icon: Server,
      color: "purple"
    },
    {
      title: "Step 3: Storing in etcd",
      description: "API Server writes the pod's desired state to etcd using a key-value format. This becomes the single source of truth.",
      icon: Database,
      color: "emerald"
    },
    {
      title: "Step 4: Persistent Storage",
      description: "The data is now safely stored in etcd. All cluster components can read this state, but only API Server can write.",
      icon: Lock,
      color: "emerald"
    }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else if (step === 3 && onComplete) {
      onComplete();
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    setStep(0);
  };

  return (
    <div className="relative h-full space-y-4">
      {/* Start Demo Button */}
      {!isStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4"
          >
            <Button
              onClick={handleStart}
              className="text-lg px-8 py-4 flex items-center gap-3"
            >
              <Play size={24} />
              Click here to see how etcd stores data
            </Button>
          </motion.div>
          <p className="text-sm text-gray-400 mt-2">Step-by-step interactive demonstration</p>
        </motion.div>
      )}

      {/* Flow: kubectl -> API Server -> etcd */}
      {isStarted && (
        <div className="flex items-center justify-between h-full relative">
          {/* Background glow effects - only when active */}
          {step >= 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 0 ? 0.4 : 0 }}
              transition={{ duration: 0.5 }}
            />
          )}

        {/* kubectl */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <motion.div
            animate={{ 
              scale: step === 0 ? [1, 1.15, 1] : 1,
              boxShadow: step === 0 
                ? ['0 0 0px #3b82f6', '0 0 30px #3b82f6', '0 0 0px #3b82f6'] 
                : '0 0 0px #3b82f6',
              rotate: step === 0 ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl border-2 border-blue-400 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" />
            <Terminal size={28} className="text-white relative z-10" />
            {step === 0 && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-300 rounded-full"
                    initial={{ 
                      x: '50%', 
                      y: '50%',
                      opacity: 1 
                    }}
                    animate={{ 
                      x: `${50 + (Math.cos(i * 72 * Math.PI / 180) * 40)}%`,
                      y: `${50 + (Math.sin(i * 72 * Math.PI / 180) * 40)}%`,
                      opacity: 0
                    }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                ))}
              </>
            )}
          </motion.div>
          <div className="text-center">
            <span className="text-sm text-gray-300 font-bold block">kubectl</span>
            <span className="text-xs text-gray-500">CLI Tool</span>
          </div>
        </motion.div>

        {/* Arrow 1 with particles */}
        <div className="flex-1 relative h-2 mx-4 z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: step >= 1 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ originX: 0 }}
          />
          {step === 1 && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-300 rounded-full shadow-lg shadow-blue-400"
                  initial={{ left: 0, scale: 0 }}
                  animate={{ left: '100%', scale: [0, 1, 0.8, 0] }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* API Server */}
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <motion.div
            animate={{ 
              scale: step === 1 ? [1, 1.15, 1] : 1,
              boxShadow: step === 1 
                ? ['0 0 0px #a855f7', '0 0 30px #a855f7', '0 0 0px #a855f7'] 
                : '0 0 0px #a855f7',
              rotate: step === 1 ? [0, -5, 5, 0] : 0
            }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-xl border-2 border-purple-400 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent" />
            <Server size={28} className="text-white relative z-10" />
            {step === 1 && (
              <motion.div
                className="absolute inset-0 border-2 border-purple-300 rounded-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: 2 }}
              />
            )}
          </motion.div>
          <div className="text-center">
            <span className="text-sm text-gray-300 font-bold block">API Server</span>
            <span className="text-xs text-gray-500">Gateway</span>
          </div>
        </motion.div>

        {/* Arrow 2 */}
        <div className="flex-1 relative h-2 mx-4 z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-emerald-500 to-emerald-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: step >= 2 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ originX: 0 }}
          />
          {step === 2 && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-300 rounded-full shadow-lg shadow-purple-400"
                  initial={{ left: 0, scale: 0 }}
                  animate={{ left: '100%', scale: [0, 1, 0.8, 0] }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* etcd */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <motion.div
            animate={{ 
              scale: step === 2 || step === 3 ? [1, 1.15, 1] : 1,
              boxShadow: step === 2 || step === 3 
                ? ['0 0 0px #10b981', '0 0 35px #10b981', '0 0 0px #10b981'] 
                : '0 0 0px #10b981'
            }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 rounded-xl border-2 border-emerald-400 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
            <Database size={28} className="text-white relative z-10" />
            {step === 3 && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.8 }}
                />
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-emerald-300 rounded-full"
                    initial={{ 
                      x: '50%', 
                      y: '50%',
                      opacity: 1 
                    }}
                    animate={{ 
                      x: `${50 + (Math.cos(i * 45 * Math.PI / 180) * 50)}%`,
                      y: `${50 + (Math.sin(i * 45 * Math.PI / 180) * 50)}%`,
                      opacity: 0
                    }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                  />
                ))}
              </>
            )}
          </motion.div>
          <div className="text-center">
            <span className="text-sm text-gray-300 font-bold block">etcd</span>
            <span className="text-xs text-gray-500">Storage</span>
          </div>
        </motion.div>
        </div>
      )}

      {/* Detailed Explanation Card */}
      {step >= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-xl border border-indigo-500/50 p-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {React.createElement(explanations[step].icon, { 
                  size: 24, 
                  className: explanations[step].color === 'blue' 
                    ? 'text-blue-400' 
                    : explanations[step].color === 'purple'
                    ? 'text-purple-400'
                    : 'text-emerald-400'
                })}
                <h4 className="text-lg font-bold text-white">{explanations[step].title}</h4>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed ml-11 mb-4">
              {explanations[step].description}
            </p>
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 ml-11 p-2 bg-emerald-900/30 rounded border border-emerald-500/30"
              >
                <p className="text-xs text-emerald-300">
                  <strong>💡 Key Insight:</strong> etcd uses a distributed consensus algorithm (Raft) to ensure all nodes agree on the cluster state. This prevents conflicts and ensures reliability.
                </p>
              </motion.div>
            )}
            
            {/* Next Button */}
            <div className="flex justify-end mt-4">
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next Step <ArrowRight size={18} />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 text-lg px-6 py-3"
                >
                  Continue to Next Page <ArrowRight size={20} />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Preview with Clear Manifest Display */}
      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-slate-900/90 rounded-lg p-5 border border-emerald-500/30 shadow-lg relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-semibold text-sm">Stored in etcd</span>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">✓ Persisted</span>
          </div>
          
          {/* Key */}
          <div className="mb-3">
            <span className="text-emerald-400 text-xs font-semibold">Key: </span>
            <span className="text-emerald-300 font-mono text-sm">{dataKey}</span>
          </div>

          {/* Manifest */}
          <div className="bg-black/60 p-4 rounded border border-slate-700 overflow-x-auto">
            <JSONViewer data={dataValue} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

const WatchFlowAnimation: React.FC<{ dataKey: string; dataValue: unknown }> = () => {
  const [watchActive, setWatchActive] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);

  const components = [
    {
      name: 'Controller Manager',
      description: 'Watches for Pod changes and ensures the desired state matches actual state. Creates/updates/deletes resources as needed.',
      icon: Activity,
      color: 'indigo',
      role: 'State Reconciliation'
    },
    {
      name: 'Scheduler',
      description: 'Watches for unscheduled Pods and assigns them to appropriate Worker Nodes based on resource availability and constraints.',
      icon: Cpu,
      color: 'purple',
      role: 'Pod Placement'
    },
    {
      name: 'Kubelet',
      description: 'Watches for Pods assigned to its node and ensures containers are running. Reports status back to API Server.',
      icon: Radio,
      color: 'cyan',
      role: 'Node Agent'
    }
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => setWatchActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-around h-full gap-6 relative">
        {/* Background pulse effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-indigo-500/10 via-purple-500/10 to-transparent rounded-lg"
          animate={{
            opacity: watchActive ? [0.3, 0.6, 0.3] : 0.3,
          }}
          transition={{ duration: 2, repeat: watchActive ? Infinity : 0 }}
        />

        {/* etcd in center */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center justify-center relative z-10"
        >
          <motion.div
            animate={{ 
              boxShadow: watchActive 
                ? ['0 0 0px #10b981', '0 0 40px #10b981', '0 0 0px #10b981'] 
                : '0 0 0px #10b981',
              rotate: watchActive ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 2, repeat: watchActive ? Infinity : 0 }}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 rounded-xl border-2 border-emerald-400 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
            <Database size={36} className="text-white relative z-10" />
            {watchActive && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-full"
                    initial={{ 
                      x: '50%', 
                      y: '50%',
                      opacity: 1 
                    }}
                    animate={{ 
                      x: `${50 + (Math.cos(i * 30 * Math.PI / 180) * 60)}%`,
                      y: `${50 + (Math.sin(i * 30 * Math.PI / 180) * 60)}%`,
                      opacity: 0
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </>
            )}
          </motion.div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-300 font-bold block">etcd</span>
            <span className="text-xs text-gray-500">Watched by all</span>
          </div>
        </motion.div>

        {/* Watching Components */}
        <div className="flex-1 grid grid-cols-3 gap-4 w-full relative z-10">
          {components.map((component, idx) => (
            <motion.div
              key={component.name}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.2, type: 'spring' }}
              className="flex flex-col items-center justify-center relative"
              onMouseEnter={() => setSelectedComponent(idx)}
              onMouseLeave={() => setSelectedComponent(null)}
            >
              {/* Watch Line with particles */}
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: watchActive ? 1 : 0 }}
                transition={{ delay: 1 + idx * 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: watchActive ? 1 : 0 }}
                  transition={{ delay: 1 + idx * 0.3, duration: 0.6 }}
                  style={{ originY: 1 }}
                />
                {watchActive && (
                  <>
                    {[...Array(2)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-300 rounded-full shadow-lg shadow-indigo-400"
                        initial={{ top: '100%', scale: 0 }}
                        animate={{ 
                          top: '0%',
                          scale: [0, 1, 0.8, 0]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.5 + idx * 0.3
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>

              {/* Component Card */}
              <motion.div
                animate={{ 
                  scale: watchActive && selectedComponent === idx ? 1.1 : watchActive ? [1, 1.08, 1] : 1,
                  boxShadow: watchActive 
                    ? ['0 0 0px #6366f1', '0 0 25px #6366f1', '0 0 0px #6366f1'] 
                    : '0 0 0px #6366f1',
                  y: selectedComponent === idx ? -5 : 0
                }}
                transition={{ duration: 1.5, repeat: watchActive ? Infinity : 0, delay: idx * 0.2 }}
                className={`p-4 rounded-xl border-2 shadow-lg mt-16 cursor-pointer relative overflow-hidden ${
                  component.color === 'indigo' 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-400' 
                    : component.color === 'purple'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400'
                    : 'bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-400'
                }`}
              >
                <div className={`absolute inset-0 ${
                  component.color === 'indigo'
                    ? 'bg-gradient-to-br from-indigo-400/20 to-transparent'
                    : component.color === 'purple'
                    ? 'bg-gradient-to-br from-purple-400/20 to-transparent'
                    : 'bg-gradient-to-br from-cyan-400/20 to-transparent'
                }`} />
                {React.createElement(component.icon, { 
                  size: 24, 
                  className: "text-white relative z-10" 
                })}
                {watchActive && selectedComponent === idx && (
                  <motion.div
                    className={`absolute inset-0 border-2 rounded-xl ${
                      component.color === 'indigo'
                        ? 'border-indigo-300'
                        : component.color === 'purple'
                        ? 'border-purple-300'
                        : 'border-cyan-300'
                    }`}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div className="text-center mt-2">
                <span className="text-xs text-gray-300 font-bold block">{component.name}</span>
                <span className="text-[10px] text-gray-500">{component.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: watchActive ? 1 : 0, y: watchActive ? 0 : 20 }}
        transition={{ delay: 2 }}
        className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 backdrop-blur-lg rounded-xl border border-indigo-500/50 p-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Eye size={20} className="text-indigo-400" />
            </motion.div>
            <h4 className="text-lg font-bold text-white">How Watching Works</h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            Kubernetes components use <strong className="text-indigo-300">etcd's watch API</strong> to monitor changes in real-time. 
            When you update a Pod spec in etcd, all watching components are instantly notified through a stream of events.
          </p>
          {selectedComponent !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-indigo-800/40 rounded border border-indigo-500/30"
            >
              <p className="text-xs text-indigo-200">
                <strong className="text-indigo-300">{components[selectedComponent].name}:</strong>{' '}
                {components[selectedComponent].description}
              </p>
            </motion.div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300">
            <Zap size={14} />
            <span>Hover over components to learn more about their watch behavior</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ConsistencyFlowAnimation: React.FC<{ dataKey: string; dataValue: unknown }> = () => {
  const [replicateStep, setReplicateStep] = useState(0);
  const [showDetails, setShowDetails] = useState(true);

  const nodeInfo = [
    {
      role: 'Leader',
      description: 'The leader node handles all write operations and coordinates replication to followers.',
      color: 'emerald'
    },
    {
      role: 'Follower',
      description: 'Followers receive replicated data from the leader and can handle read requests.',
      color: 'blue'
    },
    {
      role: 'Follower',
      description: 'All followers maintain identical copies of the data for high availability.',
      color: 'cyan'
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setReplicateStep(prev => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full space-y-4">
      {/* Three etcd nodes */}
      <div className="flex items-center justify-around h-full relative">
        {/* Background connection lines */}
        <motion.div
          className="absolute inset-0 flex items-center justify-around"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1].map((idx) => (
            <motion.div
              key={idx}
              className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500/20 w-[30%]"
              style={{ left: `${20 + idx * 30}%` }}
              animate={{
                opacity: replicateStep === idx ? [0.3, 0.6, 0.3] : 0.3
              }}
              transition={{ duration: 1, repeat: replicateStep === idx ? Infinity : 0 }}
            />
          ))}
        </motion.div>

        {[0, 1, 2].map((nodeIdx) => (
          <motion.div
            key={nodeIdx}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: nodeIdx * 0.2, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center gap-3 relative z-10"
          >
            <motion.div
              animate={{ 
                scale: replicateStep === nodeIdx ? [1, 1.15, 1] : 1,
                boxShadow: replicateStep === nodeIdx 
                  ? ['0 0 0px #10b981', '0 0 35px #10b981', '0 0 0px #10b981'] 
                  : '0 0 0px #10b981',
                rotate: replicateStep === nodeIdx ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 rounded-xl border-2 border-emerald-400 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
              <Database size={32} className="text-white relative z-10" />
              {replicateStep === nodeIdx && (
                <>
                  <motion.div
                    className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full shadow-lg shadow-green-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1, repeat: 3 }}
                  />
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-full"
                      initial={{ 
                        x: '50%', 
                        y: '50%',
                        opacity: 1 
                      }}
                      animate={{ 
                        x: `${50 + (Math.cos(i * 60 * Math.PI / 180) * 50)}%`,
                        y: `${50 + (Math.sin(i * 60 * Math.PI / 180) * 50)}%`,
                        opacity: 0
                      }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  ))}
                </>
              )}
              {nodeIdx === 0 && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  LEADER
                </motion.div>
              )}
            </motion.div>
            <div className="text-center">
              <span className="text-sm text-gray-300 font-bold block">etcd-{nodeIdx}</span>
              <span className="text-xs text-gray-500">{nodeInfo[nodeIdx].role}</span>
            </div>
            
            {/* Replication arrows with particles */}
            {nodeIdx < 2 && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-24 h-1 z-0">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: replicateStep === nodeIdx ? 1 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ originX: 0 }}
                />
                {replicateStep === nodeIdx && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-300 rounded-full shadow-lg shadow-emerald-400"
                        initial={{ left: 0, scale: 0 }}
                        animate={{ 
                          left: '100%',
                          scale: [0, 1, 0.8, 0]
                        }}
                        transition={{ 
                          duration: 0.8,
                          delay: i * 0.2,
                          ease: 'easeInOut'
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Detailed Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
        className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 backdrop-blur-lg rounded-xl border border-emerald-500/50 p-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-emerald-400" />
              <div>
                <h4 className="text-lg font-bold text-white">Raft Consensus Algorithm</h4>
                <p className="text-xs text-gray-400">How etcd ensures consistency</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showDetails ? '−' : '+'}
            </button>
          </div>
          
          {showDetails && (
            <div className="space-y-3 mt-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                etcd uses the <strong className="text-emerald-300">Raft consensus algorithm</strong> to maintain consistency across multiple nodes. 
                When data is written to the leader, it's replicated to all followers before the write is confirmed.
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {nodeInfo.map((info, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: replicateStep === idx ? 1 : 0.6,
                      scale: replicateStep === idx ? 1 : 0.95
                    }}
                    className={`p-2 rounded-lg bg-emerald-800/30 border border-emerald-500/30`}
                  >
                    <div className="text-xs font-bold text-emerald-300 mb-1">{info.role}</div>
                    <div className="text-[10px] text-gray-400">{info.description}</div>
                  </motion.div>
                ))}
              </div>

              {replicateStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-emerald-800/40 rounded-lg border border-emerald-500/40"
                >
                  <div className="flex items-center gap-2 text-sm text-emerald-300 mb-2">
                    <Shield size={16} />
                    <span className="font-bold">Consistency Achieved!</span>
                  </div>
                  <p className="text-xs text-emerald-200">
                    All three nodes now have identical data. If the leader fails, a follower can be elected as the new leader, 
                    ensuring <strong className="text-emerald-100">high availability</strong> and <strong className="text-emerald-100">data durability</strong>.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// How etcd Powers Kubernetes Page
const ETCDPowersK8sPage: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const [selectedExample, setSelectedExample] = useState<'storage' | 'watch' | 'consistency'>('storage');
  const [animationKey, setAnimationKey] = useState(0);

  const k8sExamples = {
    storage: {
      title: 'Cluster State Storage',
      description: 'etcd stores all Kubernetes cluster state',
      key: '/registry/pods/default/my-pod',
      value: {
        metadata: { name: 'my-pod', namespace: 'default' },
        spec: { containers: [{ name: 'app', image: 'nginx' }] },
        status: { phase: 'Running' }
      },
      benefit: 'Single source of truth for the entire cluster'
    },
    watch: {
      title: 'Real-time Watching',
      description: 'Components watch etcd for changes',
      key: '/registry/services/default/web-service',
      value: {
        metadata: { name: 'web-service' },
        spec: { selector: { app: 'web' }, ports: [{ port: 80 }] }
      },
      benefit: 'Controllers react instantly to changes'
    },
    consistency: {
      title: 'Strong Consistency',
      description: 'All nodes see the same state',
      key: '/registry/nodes/worker-1',
      value: {
        metadata: { name: 'worker-1' },
        status: { conditions: [{ type: 'Ready', status: 'True' }] }
      },
      benefit: 'No conflicts or race conditions'
    }
  };

  return (
    <motion.div 
      key="step12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full max-w-7xl"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
        >
          How etcd Powers Kubernetes
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl text-indigo-200 max-w-3xl mx-auto"
        >
          Explore three key ways etcd enables Kubernetes to function reliably at scale
        </motion.p>
      </div>

      {/* Why Kubernetes Chose etcd - Moved from previous page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 backdrop-blur-lg rounded-xl border border-indigo-500/30 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600/20 rounded-lg">
            <Book size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Why Kubernetes Chose etcd</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Unlike SQL databases with rigid schemas, etcd's flexible key-value storage allows Kubernetes to store 
              diverse resource types (Pods, Services, Deployments) without schema conflicts. Each resource can have 
              different fields, and adding new fields doesn't require expensive migrations. This flexibility is crucial 
              for Kubernetes' dynamic nature where resources evolve over time.
            </p>
          </div>
        </div>
      </motion.div>

      {/* How etcd Helps Kubernetes - Interactive Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 rounded-2xl border border-indigo-500/30 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Database className="text-indigo-400" size={28} />
          <h3 className="text-2xl font-bold text-white">Three Core Capabilities</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-indigo-700/50">
          {(['storage', 'watch', 'consistency'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedExample(tab);
                setAnimationKey(prev => prev + 1); // Restart animations
              }}
              className={`px-4 py-2 font-semibold transition-all duration-200 relative ${
                selectedExample === tab
                  ? 'text-indigo-300'
                  : 'text-indigo-500 hover:text-indigo-400'
              }`}
            >
              {k8sExamples[tab].title}
              {selectedExample === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Example Display with Animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedExample}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-black/40 rounded-lg p-4 border border-indigo-700/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{k8sExamples[selectedExample].title}</h4>
                  <p className="text-sm text-indigo-200">{k8sExamples[selectedExample].description}</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {k8sExamples[selectedExample].benefit}
                </motion.div>
              </div>
              
              {/* Animated Flow Diagram */}
              <div className="relative bg-slate-900/60 rounded-lg p-4 min-h-[200px] overflow-hidden">
                {selectedExample === 'storage' && (
                  <StorageFlowAnimation 
                    key={`storage-${animationKey}`}
                    dataKey={k8sExamples[selectedExample].key}
                    dataValue={k8sExamples[selectedExample].value}
                    onComplete={onNext}
                  />
                )}
                {selectedExample === 'watch' && (
                  <WatchFlowAnimation 
                    key={`watch-${animationKey}`}
                    dataKey={k8sExamples[selectedExample].key}
                    dataValue={k8sExamples[selectedExample].value}
                  />
                )}
                {selectedExample === 'consistency' && (
                  <ConsistencyFlowAnimation 
                    key={`consistency-${animationKey}`}
                    dataKey={k8sExamples[selectedExample].key}
                    dataValue={k8sExamples[selectedExample].value}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 pt-6">
        <Button onClick={onPrev} variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Button>
        <Button onClick={onNext} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
          See ETCD in Action <ArrowRight />
        </Button>
      </div>
    </motion.div>
  );
};

// Interactive ETCD Comparison Component - Focused on SQL vs etcd - Step by Step
const ETCDInteractivePage: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const [step, setStep] = useState(-1); // -1 = not started, 0 = initial, 1 = SQL problem, 2 = etcd flexibility, 3 = conclusion
  const [isStarted, setIsStarted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (step < 3) {
        setStep(prev => {
          const next = prev + 1;
          setIsTransitioning(false);
          return next;
        });
      } else if (step === 3) {
        setIsTransitioning(false);
        onNext();
      } else {
        setIsTransitioning(false);
      }
    }, 100);
  };

  const handleBack = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (step > 0) {
        setStep(prev => {
          const next = prev - 1;
          setIsTransitioning(false);
          return next;
        });
      } else if (step === 0) {
        setIsStarted(false);
        setStep(-1);
        setIsTransitioning(false);
      } else {
        setIsTransitioning(false);
        onPrev();
      }
    }, 100);
  };

  const handleStart = () => {
    setIsStarted(true);
    setStep(0);
    setIsTransitioning(false);
  };

  const stepDescriptions = [
    {
      title: "Initial Comparison",
      description: "See both SQL and etcd side by side",
      next: "We'll demonstrate SQL's rigid schema problem"
    },
    {
      title: "SQL Rigid Schema Problem",
      description: "Watch what happens when we add a column to SQL",
      next: "Now see how etcd handles the same change"
    },
    {
      title: "etcd Flexibility",
      description: "See how etcd adds fields without breaking anything",
      next: "Ready to continue to the next page"
    },
    {
      title: "Conclusion",
      description: "You've seen the key difference!",
      next: "Continue to learn how etcd powers Kubernetes"
    }
  ];

  return (
    <motion.div 
      key="step11"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full max-w-7xl"
    >
      {/* Header */}
      <div className="text-center space-y-4 relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 rounded-3xl blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 0 ? 0.4 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.h2 
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 relative z-10"
        >
          The Captain's Log: ETCD
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-indigo-200 max-w-3xl mx-auto relative z-10"
        >
          Why Kubernetes chose etcd: See the difference between rigid SQL tables and flexible key-value storage
        </motion.p>
      </div>

      {/* Start Demo Button */}
      {!isStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4"
          >
            <Button
              onClick={handleStart}
              className="text-lg px-8 py-4 flex items-center gap-3"
            >
              <Play size={24} />
              Click here to see SQL vs etcd comparison
            </Button>
          </motion.div>
          <p className="text-sm text-gray-400 mt-2">Step-by-step interactive demonstration</p>
        </motion.div>
      )}

      {/* Interactive Comparison Section */}
      {isStarted && (
        <div className="relative">
          <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* SQL Card - Interactive with Breaking Animation */}
        <motion.div
          initial={isStarted ? false : { x: -100, opacity: 0, rotateY: -15 }}
          animate={{ 
            x: hoveredCard === 'sql' && step >= 1 ? [0, -2, 2, -2, 0] : 0,
            opacity: 1, 
            rotateY: 0,
            rotate: hoveredCard === 'sql' && step >= 1 ? [0, -1, 1, -1, 0] : 0
          }}
          transition={{ delay: isStarted ? 0 : 0.3, type: 'spring', stiffness: 100 }}
          onMouseEnter={() => !isTransitioning && setHoveredCard('sql')}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer overflow-hidden ${
            hoveredCard === 'sql' || step === 1 ? 'border-red-500/70 shadow-2xl shadow-red-500/30 scale-[1.03]' : step === 0 ? 'border-red-500/30 shadow-lg shadow-red-500/10' : 'border-slate-600/50'
          }`}
        >
          {/* Preview indicator for step 0 */}
          {step === 0 && !isTransitioning && (
            <motion.div
              className="absolute top-2 right-2 bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full border border-red-500/30 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              👆 Click "Try Adding Column"
            </motion.div>
          )}
          {/* Breaking/Crack Effect Overlay */}
          {step === 1 && (
            <>
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: step === 1 ? 0.2 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Crack lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <motion.path
                    d="M 50 50 L 150 200"
                    stroke="#dc2626"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: step === 1 ? 1 : 0, opacity: step === 1 ? 0.6 : 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                  <motion.path
                    d="M 200 100 L 300 250"
                    stroke="#dc2626"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: step === 1 ? 1 : 0, opacity: step === 1 ? 0.6 : 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </svg>
              </motion.div>
              {/* Shake particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-red-500 rounded-full"
                  initial={{ 
                    x: `${50 + i * 20}%`, 
                    y: `${30 + i * 10}%`,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: step === 1 ? `${35 + i * 10}%` : `${30 + i * 10}%`,
                    opacity: step === 1 ? 0.8 : 0,
                    scale: step === 1 ? 1 : 0
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: i * 0.05 
                  }}
                />
              ))}
            </>
          )}

          {/* Animated background effect */}
          {step === 1 && (
            <motion.div
              className="absolute inset-0 bg-red-500/5 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: step === 1 ? 0.3 : 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`p-3 rounded-lg transition-all ${hoveredCard === 'sql' ? 'bg-red-500/20 scale-110' : 'bg-slate-700/50'}`}
                animate={{ rotate: hoveredCard === 'sql' ? [0, 5, -5, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Table size={28} className="text-slate-300" />
              </motion.div>
              <div>
                <h3 className="font-bold text-xl text-slate-200">SQL (Rigid Schema)</h3>
                <p className="text-xs text-slate-400">Fixed table structure</p>
              </div>
            </div>
            {step === 0 && (
              <motion.button
                onClick={handleNext}
                disabled={isTransitioning}
                whileHover={{ scale: isTransitioning ? 1 : 1.1 }}
                whileTap={{ scale: isTransitioning ? 1 : 0.9 }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Try Adding Column
              </motion.button>
            )}
          </div>
          
          {/* Interactive Table */}
          <div className="space-y-2 font-mono text-sm relative z-10">
            {/* Header Row */}
            <motion.div 
              className="grid grid-cols-3 gap-1 bg-slate-700/50 rounded p-1"
              initial={{ scale: 1 }}
              animate={{ scale: step === 1 ? [1, 1.02, 1] : 1 }}
            >
              <div className="bg-slate-600 p-2 text-center text-white font-semibold">Name</div>
              <div className="bg-slate-600 p-2 text-center text-white font-semibold">Role</div>
              <div className="bg-slate-600 p-2 text-center text-white font-semibold">Salary</div>
            </motion.div>
            
            {/* Data Rows */}
            <motion.div 
              className="grid grid-cols-3 gap-1"
              initial={{ opacity: 1 }}
              animate={{ opacity: step === 1 ? [1, 0.7, 1] : 1 }}
            >
              <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">Naruto</div>
              <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">Hokage</div>
              <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">$100k</div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-3 gap-1"
              initial={{ opacity: 1 }}
              animate={{ opacity: step === 1 ? [1, 0.7, 1] : 1 }}
            >
              <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">Sasuke</div>
              <div className="bg-slate-700/70 p-2 text-center text-red-400 rounded">NULL</div>
              <div className="bg-slate-700/70 p-2 text-center text-red-400 rounded">NULL</div>
            </motion.div>

            {/* Adding Grade Column - Animated */}
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-4 gap-1 mt-2"
              >
                <div className="bg-slate-600 p-2 text-center text-white font-semibold rounded">Name</div>
                <div className="bg-slate-600 p-2 text-center text-white font-semibold rounded">Role</div>
                <div className="bg-slate-600 p-2 text-center text-white font-semibold rounded">Salary</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-600 p-2 text-center text-white font-semibold rounded border-2 border-red-400"
                >
                  Grade ⚠️
                </motion.div>
              </motion.div>
            )}

            {/* New rows with empty Grade column */}
            {step >= 1 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-4 gap-1"
                >
                  <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">Naruto</div>
                  <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">Hokage</div>
                  <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">$100k</div>
                  <motion.div
                    initial={{ backgroundColor: '#1e293b' }}
                    animate={{ backgroundColor: step === 1 ? ['#1e293b', '#dc2626', '#1e293b'] : '#1e293b' }}
                    transition={{ duration: 0.5 }}
                    className="bg-red-900/50 p-2 text-center text-red-300 rounded"
                  >
                    NULL
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-4 gap-1"
                >
                  <div className="bg-slate-700/70 p-2 text-center text-slate-300 rounded">Sasuke</div>
                  <div className="bg-slate-700/70 p-2 text-center text-red-400 rounded">NULL</div>
                  <div className="bg-slate-700/70 p-2 text-center text-red-400 rounded">NULL</div>
                  <motion.div
                    initial={{ backgroundColor: '#1e293b' }}
                    animate={{ backgroundColor: step === 1 ? ['#1e293b', '#dc2626', '#1e293b'] : '#1e293b' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-red-900/50 p-2 text-center text-red-300 rounded"
                  >
                    NULL
                  </motion.div>
                </motion.div>
              </>
            )}
          </div>

          {/* Warning Message with Rigid Schema Explanation */}
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-4 p-4 bg-red-900/40 border-2 border-red-500/50 rounded-lg relative overflow-hidden"
            >
              <div className="relative z-10 flex items-start gap-3">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: step === 1 ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-2xl">⚠️</span>
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-semibold mb-1">
                    Rigid Schema Problem!
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-red-200">
                      <strong className="text-red-300">Rigid Schema:</strong> SQL tables have a fixed structure. 
                      Adding a new column forces <strong>ALL existing rows</strong> to be modified, even if they don't need that field.
                    </p>
                    <p className="text-xs text-red-300 font-semibold mt-2">
                      💥 This breaks flexibility - every row must conform to the same structure!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* etcd Card - Interactive with Flexibility Animation */}
        <motion.div
          initial={isStarted ? false : { x: 100, opacity: 0, rotateY: 15 }}
          animate={{ 
            x: 0, 
            opacity: 1, 
            rotateY: 0,
            scale: hoveredCard === 'etcd' ? 1.01 : 1
          }}
          transition={{ delay: isStarted ? 0 : 0.4, type: 'spring', stiffness: 100 }}
          onMouseEnter={() => !isTransitioning && setHoveredCard('etcd')}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 backdrop-blur-lg rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer overflow-hidden ${
            hoveredCard === 'etcd' || step === 2 ? 'border-emerald-400/70 shadow-2xl shadow-emerald-500/30 scale-[1.03]' : step === 1 ? 'border-emerald-400/30 shadow-lg shadow-emerald-500/10' : 'border-emerald-500/50'
          }`}
        >
          {/* Preview indicator for step 1 */}
          {step === 1 && !isTransitioning && (
            <motion.div
              className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full border border-emerald-500/30 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              👆 Click "Add Field"
            </motion.div>
          )}
          {/* Flexibility Animation Particles */}
          {step === 2 && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                  initial={{ 
                    x: `${20 + (i * 10)}%`, 
                    y: `${10 + (i * 5)}%`,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    y: step === 2 ? `${15 + (i * 5)}%` : `${10 + (i * 5)}%`,
                    opacity: step === 2 ? 0.8 : 0,
                    scale: step === 2 ? 1 : 0,
                    x: step === 2 ? `${25 + (i * 10)}%` : `${20 + (i * 10)}%`
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.05,
                    ease: 'easeOut'
                  }}
                />
              ))}
              {/* Flexible wave effect */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ 
                  opacity: step === 2 ? 0.6 : 0,
                  scaleX: step === 2 ? 1 : 0.5
                }}
                transition={{ duration: 0.5 }}
              />
            </>
          )}

          {/* Animated background effect */}
          {step === 2 && (
            <motion.div
              className="absolute inset-0 bg-emerald-500/5 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: step === 2 ? 0.3 : 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`p-3 rounded-lg transition-all ${hoveredCard === 'etcd' ? 'bg-emerald-500/20 scale-110' : 'bg-emerald-800/50'}`}
                animate={{ rotate: hoveredCard === 'etcd' ? [0, -5, 5, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <FileJson size={28} className="text-emerald-300" />
              </motion.div>
              <div>
                <h3 className="font-bold text-xl text-emerald-200">etcd (Flexible Key-Value)</h3>
                <p className="text-xs text-emerald-400">No schema constraints</p>
              </div>
            </div>
            {step === 1 && (
              <motion.button
                onClick={handleNext}
                disabled={isTransitioning}
                whileHover={{ scale: isTransitioning ? 1 : 1.1 }}
                whileTap={{ scale: isTransitioning ? 1 : 0.9 }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Field
              </motion.button>
            )}
          </div>
          
          {/* Interactive Key-Value Pairs */}
          <div className="space-y-3 relative z-10">
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-black/40 p-4 rounded-lg border-l-4 border-emerald-500 font-mono text-xs relative overflow-hidden"
            >
              {step === 2 && (
                <motion.div
                  className="absolute inset-0 bg-emerald-500/10 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step === 2 ? 0.2 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className="text-emerald-400 mb-2 font-semibold flex items-center gap-2">
                <span>Key: /registry/naruto</span>
                {step === 2 && (
                  <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-blue-300">
                {'{'}<br/>
                &nbsp;&nbsp;"name": "Naruto",<br/>
                &nbsp;&nbsp;"role": "Hokage",<br/>
                &nbsp;&nbsp;"salary": "$100k"<br/>
                {'}'}
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-black/40 p-4 rounded-lg border-l-4 border-purple-500 font-mono text-xs relative overflow-hidden"
            >
              {step === 2 && (
                <motion.div
                  className="absolute inset-0 bg-purple-500/10 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step === 2 ? 0.2 : 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
              )}
              <div className="text-purple-400 mb-2 font-semibold flex items-center gap-2">
                <span>Key: /registry/sasuke</span>
                {step === 2 && (
                  <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-blue-300">
                {'{'}<br/>
                &nbsp;&nbsp;"name": "Sasuke",<br/>
                &nbsp;&nbsp;"jutsu": "Chidori"<br/>
                {step >= 2 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="block"
                  >
                    &nbsp;&nbsp;"grade": "S"<br/>
                  </motion.span>
                )}
                {'}'}
              </div>
            </motion.div>

            {/* Adding new field - Animated */}
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-emerald-900/30 p-2 rounded border border-emerald-500/50"
              >
                <p className="text-xs text-emerald-300 flex items-center gap-2">
                  <motion.span
                    initial={{ rotate: 0, scale: 1 }}
                    animate={{ rotate: step === 2 ? [0, 360] : 0, scale: step === 2 ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 1 }}
                  >
                    ✨
                  </motion.span>
                  <span>Field added instantly! No impact on other keys.</span>
                </p>
              </motion.div>
            )}
          </div>

          {/* Success Message with Flexibility Explanation */}
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-4 p-4 bg-green-900/40 border-2 border-green-500/50 rounded-lg relative overflow-hidden"
            >
              <div className="relative z-10 flex items-start gap-3">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: step === 2 ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-2xl">✓</span>
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-green-300 font-semibold mb-1">
                    Complete Flexibility!
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-green-200">
                      <strong className="text-green-300">Flexible Schema:</strong> Each key-value pair is completely 
                      <strong> independent</strong>. You can add different fields to different keys without any impact on others.
                    </p>
                    <p className="text-xs text-green-300 font-semibold mt-2 flex items-center gap-1">
                      <span>🎯</span>
                      This enables true flexibility - each resource can evolve independently!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
          </div>
        </div>
      )}

      {/* Step-by-Step Navigation */}
      {isStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 pt-6"
        >
          {/* Current Step Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={step}
            className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg p-4 border border-indigo-500/30 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-indigo-300">Current Step: {step + 1} of 4</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s < step ? 'bg-emerald-400' : s === step ? 'bg-indigo-400' : 'bg-gray-600'
                    }`}
                    animate={{ width: s === step ? 24 : s < step ? 24 : 8 }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-1">
              <strong className="text-white">{stepDescriptions[step].title}:</strong> {stepDescriptions[step].description}
            </p>
          </motion.div>

          {/* Next Step Preview */}
          {step < 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-500/30 w-full max-w-2xl flex items-center gap-3"
            >
              <ArrowRight size={20} className="text-emerald-400" />
              <div className="flex-1">
                <p className="text-xs text-emerald-300 font-semibold mb-1">Coming Next:</p>
                <p className="text-sm text-emerald-200">{stepDescriptions[step].next}</p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleBack} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={isTransitioning || step === -1}
            >
              <ArrowLeft size={20} /> {step > 0 ? 'Previous Step' : 'Back'}
            </Button>
            {step < 3 ? (
              <Button 
                onClick={handleNext} 
                className="flex items-center gap-2"
                disabled={isTransitioning}
              >
                Next Step <ArrowRight size={18} />
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="text-lg px-8 py-4 flex items-center justify-center gap-2"
                disabled={isTransitioning}
              >
                Continue to Next Page <ArrowRight size={20} />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Grand Fleet Command Page - Step by Step with Manual/Auto Toggle
const GrandFleetCommandPage: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0-8 steps
  const [isStarted, setIsStarted] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [craneThreadLength, setCraneThreadLength] = useState(18); // Thread length for crane
  const [craneHookY, setCraneHookY] = useState(18); // Hook Y position
  const [manifestOpacity, setManifestOpacity] = useState(0); // Manifest opacity for fade-out
  const [cranePodVisible, setCranePodVisible] = useState(false); // Control pod visibility on crane
  const autoStepTimeoutRef = React.useRef<number | null>(null);

  const stepDescriptions = useMemo(() => [
    {
      title: "1. The Request",
      description: "Captain (Dev) sends manifest to Bridge via kubectl.",
      icon: Terminal,
      color: "blue",
      component: "kubectl → API Server"
    },
    {
      title: "2. Validation",
      description: "API Server validates the manifest orders.",
      icon: Shield,
      color: "green",
      component: "API Server"
    },
    {
      title: "3. Store in Vault",
      description: "API Server stores the Pod desired state in etcd Vault.",
      icon: Database,
      color: "emerald",
      component: "API Server → etcd"
    },
    {
      title: "4. Controller Manager",
      description: "Controller Manager watches etcd, sees new Pod spec, creates Pod object.",
      icon: Activity,
      color: "red",
      component: "Controller Manager"
    },
    {
      title: "5. Scheduler",
      description: "Scheduler watches etcd for unscheduled Pods, selects best Worker Node, binds Pod.",
      icon: Radio,
      color: "yellow",
      component: "Scheduler"
    },
    {
      title: "6. Kubelet Watches",
      description: "Kubelet on Worker Node watches API Server, sees Pod assigned to its node.",
      icon: Eye,
      color: "orange",
      component: "API Server → Kubelet"
    },
    {
      title: "7. Pod Placement & Container Creation",
      description: "Scheduler places Pod on Worker Node, then Kubelet uses CRI to create the container.",
      icon: Package,
      color: "purple",
      component: "Scheduler → Worker Node → CRI"
    },
    {
      title: "8. Status Reporting",
      description: "Pod is Running! Kubelet reports Pod status back to API Server, which updates etcd.",
      icon: CheckCircle,
      color: "green",
      component: "Kubelet → API Server → etcd"
    }
  ], []);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep < 8) {
        setCurrentStep(prev => {
          setIsTransitioning(false);
          return prev + 1;
        });
      } else {
        setIsTransitioning(false);
      }
    }, 100);
  }, [isTransitioning, currentStep]);

  // Trigger animations based on current step
  React.useEffect(() => {
    if (!isStarted) return;
    
    // Update step explainer box
    const titleEl = document.getElementById('step-title');
    const descEl = document.getElementById('step-desc');
    const explainerEl = document.getElementById('step-explainer');
    
    if (titleEl && descEl && explainerEl) {
      titleEl.innerText = stepDescriptions[currentStep]?.title || 'Waiting...';
      descEl.innerText = stepDescriptions[currentStep]?.description || 'Ready to deploy.';
      explainerEl.style.opacity = '1';
    }
    
    // Handle manifest animation based on step
    if (currentStep === 1) {
      // Step 1: Manifest moves from console to API server - make visible
      setManifestOpacity(1);
    } else if (currentStep === 2) {
      // Step 2: Manifest stays at API server, then fades out after 2 seconds
      setManifestOpacity(1);
      setTimeout(() => {
        setManifestOpacity(0);
      }, 2000);
    } else {
      // Step 3+: Manifest is gone
      setManifestOpacity(0);
    }
    
    // Handle crane animation based on step
    if (currentStep === 5) {
      // Step 5: Scheduler glows - crane stays retracted
      setCranePodVisible(false);
      setCraneThreadLength(18);
      setCraneHookY(18);
    } else if (currentStep === 7) {
      // Step 7: Scheduler places pod - pod appears directly on worker node (no drop animation)
      // Crane can glow briefly to show scheduler action, but pod appears directly on worker
      setCranePodVisible(false); // No pod on crane
      setCraneThreadLength(18);
      setCraneHookY(18);
    } else {
      // Steps before 5 or after 7: Reset crane position
      setCranePodVisible(false);
      setCraneThreadLength(18);
      setCraneHookY(18);
    }
  }, [currentStep, isStarted, stepDescriptions]);

  // Auto mode: automatically advance steps
  React.useEffect(() => {
    if (isAutoMode && isStarted && currentStep < 8 && !isTransitioning) {
      const delays = [3000, 3000, 6000, 7000, 7000, 7000, 10000, 10000];
      autoStepTimeoutRef.current = window.setTimeout(() => {
        handleNext();
      }, delays[currentStep] || 3000);
    }
    
    return () => {
      if (autoStepTimeoutRef.current !== null) {
        window.clearTimeout(autoStepTimeoutRef.current);
      }
    };
  }, [isAutoMode, isStarted, currentStep, isTransitioning, handleNext]);

  const handleBack = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(prev => {
          setIsTransitioning(false);
          return prev - 1;
        });
      } else {
        setIsStarted(false);
        setCurrentStep(0);
        setIsTransitioning(false);
      }
    }, 100);
  };

  const handleStart = () => {
    setIsStarted(true);
    setCurrentStep(0);
    setIsTransitioning(false);
  };

  const handleReset = () => {
    setIsStarted(false);
    setCurrentStep(0);
    setIsTransitioning(false);
    // Reset all animations
    if (autoStepTimeoutRef.current !== null) {
      window.clearTimeout(autoStepTimeoutRef.current);
      autoStepTimeoutRef.current = null;
    }
  };

  return (
    <motion.div
      key="grand-fleet-command"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 w-full max-w-7xl"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-white tracking-tight drop-shadow-lg"
        >
          The Grand Fleet Command
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-indigo-200 max-w-4xl mx-auto"
        >
          Watch the <strong>Ship's Crew</strong> (Control Plane) coordinate the deployment of a new container to the <strong>Worker Barges</strong>.
        </motion.p>
      </div>

      {/* Mode Toggle and Start Button */}
      {!isStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8 gap-4"
        >
          <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-2 border border-slate-600">
            <button
              onClick={() => setIsAutoMode(true)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isAutoMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Radio className="inline mr-2" size={18} />
              Auto Animation
            </button>
            <button
              onClick={() => setIsAutoMode(false)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                !isAutoMode
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Play className="inline mr-2" size={18} />
              Manual Step-by-Step
            </button>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleStart}
              className="text-lg px-8 py-4 flex items-center gap-3"
            >
              <Play size={24} />
              {isAutoMode ? 'Start Auto Animation' : 'Start Step-by-Step'}
            </Button>
          </motion.div>
          <p className="text-sm text-gray-400 mt-2">
            {isAutoMode 
              ? 'Watch the complete Kubernetes flow automatically'
              : 'Control each step manually to understand the flow'}
          </p>
        </motion.div>
      )}

      {/* Main Content Area */}
      {isStarted && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side: Animation Area (2/3 width) */}
          <div className="lg:col-span-2">
            <style>{`
              @keyframes pulse-glow {
                0%, 100% {
                  filter: drop-shadow(0 0 30px #4ade80) drop-shadow(0 0 20px #4ade80) drop-shadow(0 0 10px #4ade80);
                }
                50% {
                  filter: drop-shadow(0 0 40px #4ade80) drop-shadow(0 0 25px #4ade80) drop-shadow(0 0 15px #4ade80);
                }
              }
              .api-bridge-glow {
                animation: pulse-glow 2s ease-in-out infinite;
              }
            `}</style>
            <div className="relative bg-gradient-to-b from-sky-950 via-blue-900 to-slate-950 rounded-[2rem] p-1 border-4 border-blue-500/30 shadow-2xl overflow-hidden h-[700px]">
              {/* Dynamic Ocean Background - Enhanced Water Flow */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 w-full h-56 bg-gradient-to-t from-blue-900/90 via-blue-800/70 to-transparent z-10"></div>
                {/* Wave Layers - Larger and more visible */}
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute bottom-0 left-0 w-[200%] h-48 opacity-50"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M321.39 56.44c58-10.79 114.16-30.13 172-41.86 82.39-16.72 168.19-17.73 250.45-.39C823.78 31 906.67 72 985.66 92.83c70.05 18.48 146.53 26.09 214.34 3V0H0v27.35a600.21 600.21 0 00321.39 29.09z' fill='%234f46e5' fill-opacity='1'/%3E%3C/svg%3E")`,
                      backgroundSize: '50% 100%',
                      backgroundRepeat: 'repeat-x',
                      bottom: `${(i-1) * 18}px`,
                      zIndex: i
                    }}
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "linear" }}
                  />
                ))}
              </div>

              {/* SCENE COMPONENTS */}

              {/* 1. Developer Console (Top Left Sky) */}
              <div className="absolute top-6 left-6 z-30 bg-slate-900/90 p-3 rounded-xl border border-slate-600 w-56 shadow-xl font-mono text-xs">
                <div className="flex gap-1.5 mb-2 border-b border-slate-700 pb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="ml-auto text-slate-500 text-[10px]">developer@local</span>
                </div>
                <div className="text-green-400 text-[10px]">$ kubectl apply -f pod.yaml</div>
                <div id="console-output" className={`text-slate-300 mt-1 text-[10px] transition-opacity duration-500 ${currentStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                  deployment.apps/web created
                </div>
              </div>


              {/* 3. MASTER SHIP (Control Plane) - Larger Size, Right Side, In Water */}
              <div className="absolute bottom-[160px] right-8 z-20 w-[700px] h-[360px]">
                <svg viewBox="0 0 800 400" className="w-full h-full overflow-visible" style={{ transform: 'scale(0.875)' }}>
                  <defs>
                    <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e1b4b" />
                      <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Ship Hull - Larger, positioned in water */}
                  <path d="M 50 250 L 750 250 L 700 380 Q 400 420 100 380 Z" fill="url(#hullGradient)" stroke="#6366f1" strokeWidth="3" filter="url(#glow)" />
                  {/* Water reflection under ship */}
                  <ellipse cx="400" cy="380" rx="350" ry="15" fill="#1e3a8a" opacity="0.3" />
                  <text x="400" y="360" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="36" fontWeight="900" letterSpacing="10">K8S-MASTER</text>

                  {/* Deck */}
                  <rect x="80" y="240" width="640" height="20" fill="#3730a3" stroke="#6366f1" rx="5" />

                  {/* CRANE (SCHEDULER) - Positioned ON DECK - Left side */}
                  <g id="comp-scheduler" transform="translate(150, 240)" className="transition-all duration-300">
                    <rect x="-18" y="-35" width="36" height="35" fill="#854d0e" stroke="#eab308" strokeWidth="2" />
                    <circle cx="0" cy="-35" r="10" fill="#ca8a04" />
                    <g id="crane-arm" style={{ transformOrigin: "0px -35px" }}>
                      <rect x="-4" y="-140" width="8" height="140" fill="#ca8a04" rx="2" />
                      <circle cx="0" cy="-140" r="6" fill="white" stroke="#ca8a04" strokeWidth="2" />
                      <g transform="translate(0, -140)">
                        <rect x="-80" y="-3" width="80" height="6" fill="#eab308" rx="2" />
                        <g id="crane-thread-group" transform="translate(-80, 0)">
                          {/* Crane thread - always visible, animates smoothly, including reverse */}
                          <line 
                            id="crane-thread" 
                            x1="0" 
                            y1="0" 
                            x2="0" 
                            y2={craneThreadLength}
                            stroke="white" 
                            strokeWidth="2" 
                            strokeDasharray="4 2"
                            style={{ 
                              transition: 'all 2.5s ease-in-out',
                              opacity: 1, // Always visible
                              display: 'block' // Ensure it's always rendered
                            }}
                          />
                          {/* Crane hook - follows thread length, always visible */}
                          <g 
                            id="crane-hook"
                            transform={`translate(0, ${craneHookY})`}
                          >
                            <path d="M -6 0 Q 0 8 6 0" stroke="white" strokeWidth="2.5" fill="none" />
                            {/* Pod on crane hook - animated drop - Only visible at step 7 */}
                            {currentStep === 7 && isStarted && cranePodVisible && (
                              <motion.g 
                                id="crane-pod" 
                                transform="translate(-12, 4)"
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: 1,
                                  y: [0, 0, 0, 0]
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ 
                                  opacity: { duration: 0.3 },
                                  y: { duration: 0 }
                                }}
                                style={{ 
                                  pointerEvents: 'none'
                                }}
                              >
                                <rect x="0" y="0" width="24" height="24" rx="5" fill="url(#hullGradient)" stroke="#fff" strokeWidth="1.5" />
                                <text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">POD</text>
                              </motion.g>
                            )}
                          </g>
                        </g>
                      </g>
                    </g>
                    <text x="0" y="18" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="bold">SCHEDULER</text>
                  </g>

                  {/* CONTROLLER MANAGER - Positioned ON DECK - Left-center */}
                  <g id="comp-controller" transform="translate(300, 240)" className="transition-all duration-300">
                    <rect x="0" y="-70" width="75" height="70" rx="5" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
                    <text x="37.5" y="-40" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="bold">CONTROLLER</text>
                    <text x="37.5" y="-28" textAnchor="middle" fill="#fca5a5" fontSize="8">MANAGER</text>
                    <path d="M 22 -15 L 30 -7 L 55 -20" stroke="#fca5a5" strokeWidth="2.5" fill="none" />
                  </g>

                  {/* BRIDGE (API SERVER) - Positioned ON DECK - Right side */}
                  <g 
                    id="comp-api" 
                    transform="translate(600, 240)" 
                    className="transition-all duration-300"
                  >
                    <rect 
                      x="0" 
                      y="-110" 
                      width="110" 
                      height="110" 
                      rx="8" 
                      fill="#312e81"
                      stroke="#818cf8" 
                      strokeWidth="2"
                      style={{
                        transition: "all 0.5s ease-in-out"
                      }}
                    />
                    <rect x="8" y="-95" width="94" height="50" rx="4" fill="#93c5fd" opacity="0.3" />
                    <text x="55" y="-25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">API BRIDGE</text>
                    <text x="55" y="-10" textAnchor="middle" fill="#a5b4fc" fontSize="9">Port 6443</text>
                    {/* Radar */}
                    <g transform="translate(55, -125)">
                      <circle cx="0" cy="0" r="4" fill="#ef4444" />
                      <path d="M 0 0 L 25 -8 L 25 8 Z" fill="#ef4444" opacity="0.5">
                        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="2s" repeatCount="indefinite" />
                      </path>
                    </g>
                  </g>

                  {/* CARGO HOLD (ETCD) - Positioned ON DECK - Center-right */}
                  <g id="comp-etcd" transform="translate(450, 240)" className="transition-all duration-300">
                    <rect 
                      x="0" 
                      y="-70" 
                      width="80" 
                      height="70" 
                      rx="5" 
                      fill="#064e3b" 
                      stroke="#10b981" 
                      strokeWidth="2"
                      style={{
                        transition: "all 0.5s ease-in-out"
                      }}
                    />
                    <text x="40" y="-35" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="bold">etcd VAULT</text>
                    <circle cx="18" cy="-15" r="2.5" fill="#34d399"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" /></circle>
                    <circle cx="40" cy="-15" r="2.5" fill="#34d399"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" begin="0.2s" /></circle>
                    <circle cx="62" cy="-15" r="2.5" fill="#34d399"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" begin="0.4s" /></circle>
                  </g>
                </svg>
              </div>

              {/* 4. WORKER BARGE (Single Node - Mini Boat) - Left Side, In Water */}
              <div className="absolute bottom-8 left-8 z-20">
                <div id="node-1" className="relative transition-all duration-500">
                  <svg width="420" height="170" viewBox="0 0 450 180" className="drop-shadow-2xl">
                    <path d="M 30 60 L 420 60 L 390 150 Q 225 170 60 150 Z" fill="#1e293b" stroke="#475569" strokeWidth="4" />
                    {/* Water reflection under worker barge */}
                    <ellipse cx="225" cy="150" rx="180" ry="8" fill="#1e3a8a" opacity="0.3" />
                    <rect x="50" y="50" width="350" height="15" fill="#334155" stroke="#475569" strokeWidth="2" rx="2" />
                    <text x="225" y="120" textAnchor="middle" fill="#64748b" fontSize="18" fontWeight="bold" letterSpacing="2">WORKER 1</text>
                    <rect x="200" y="30" width="50" height="25" fill="#475569" stroke="#64748b" strokeWidth="2" rx="3" />
                    <circle cx="225" cy="20" r="8" fill="#fbbf24" style={{ transition: 'none', transform: 'none' }} />
                  </svg>
                  
                  {/* Kubelet Captain - Positioned ON DECK (deck is at y=50-65 in SVG, convert to absolute: top ~40px from SVG top) */}
                  <div id="kubelet-1" className={`absolute top-[40px] left-12 bg-orange-600 rounded-lg p-2 border-2 border-orange-400 shadow-lg transition-all duration-300 flex flex-col items-center w-16 ${currentStep === 6 ? 'opacity-100 scale-110' : 'opacity-60'}`} title="Kubelet Captain">
                    <Server size={20} className="text-white" />
                    <span className="text-[9px] text-white font-bold mt-0.5">Kubelet</span>
                  </div>

                  {/* KubeProxy - Positioned ON DECK */}
                  <div className="absolute top-[40px] right-12 bg-purple-600 rounded-lg p-2 border-2 border-purple-400 shadow-lg opacity-60 flex flex-col items-center w-16" title="KubeProxy">
                    <Network size={20} className="text-white" />
                    <span className="text-[9px] text-white font-bold mt-0.5">KubeProxy</span>
                  </div>

                  {/* CRI Engine - Positioned ON DECK */}
                  <div id="cri-1" className={`absolute top-[40px] left-1/2 -translate-x-1/2 bg-blue-600 rounded-lg p-1.5 border-2 border-blue-400 shadow-lg transition-all duration-300 flex flex-col items-center w-14 ${currentStep === 7 ? 'opacity-100 scale-110' : 'opacity-60'}`} title="CRI Engine">
                    <Cpu size={18} className="text-white" />
                    <span className="text-[9px] text-white font-bold mt-0.5">CRI</span>
                  </div>

                  {/* Pod on Worker Node Deck - Appears directly when scheduler places it */}
                  {currentStep >= 7 && isStarted && (
                    <motion.div
                      id="final-pod"
                      className="absolute w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg border border-white shadow-[0_0_12px_rgba(236,72,153,0.5)] flex items-center justify-center z-[100]"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1
                      }}
                      transition={{
                        opacity: { duration: 0.3, delay: currentStep === 7 ? 0.5 : 0 }, // Appear shortly after step 7 starts (when scheduler places it)
                        scale: { duration: 0.3, delay: currentStep === 7 ? 0.5 : 0 }
                      }}
                      style={{
                        left: 'calc(8px + 240px)', // Worker node deck position
                        top: 'calc(100% - 65px)' // Worker node deck position - moved up
                      }}
                    >
                      <Package size={14} className={`text-white ${currentStep >= 7 ? 'animate-pulse' : ''}`} />
                    </motion.div>
                  )}
                </div>
              </div>



              {/* ANIMATION ELEMENTS */}
              
              {/* Manifest - animated based on step - Moves to API Server, stays, then vanishes */}
              <motion.div
                id="anim-manifest"
                className="absolute w-7 h-9 bg-yellow-100 rounded border border-yellow-600 flex flex-col gap-1 p-1 items-center justify-center shadow-lg z-50 pointer-events-none"
                animate={{
                  opacity: manifestOpacity,
                  left: currentStep === 1 ? ['24px', 'calc(100% - 160px)'] : currentStep === 2 ? 'calc(100% - 160px)' : '24px',
                  top: currentStep === 1 ? ['24px', 'calc(100% - 380px)'] : currentStep === 2 ? 'calc(100% - 380px)' : '24px'
                }}
                transition={{ 
                  opacity: { duration: currentStep === 2 ? 0.5 : 0 },
                  left: { duration: currentStep === 1 ? 1.5 : 0, ease: 'easeInOut' },
                  top: { duration: currentStep === 1 ? 1.5 : 0, ease: 'easeInOut' }
                }}
              >
                <div className="w-full h-0.5 bg-slate-300" />
                <div className="w-full h-0.5 bg-slate-300" />
                <div className="w-full h-0.5 bg-slate-300" />
              </motion.div>
            </div>
          </div>

          {/* Right Side: Step Information Panel (1/3 width) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status Box - Moved from left side */}
            <motion.div
              key={`status-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/80 backdrop-blur-md rounded-xl p-4 border-l-4 border-indigo-500 shadow-2xl"
            >
              <h3 className="text-indigo-400 font-bold mb-2 text-sm flex items-center gap-2">
                {React.createElement(stepDescriptions[currentStep]?.icon || Terminal, {
                  size: 18,
                  className: `text-${stepDescriptions[currentStep]?.color}-400`
                })}
                {currentStep === 0 ? 'Waiting for deployment...' : 
                 currentStep === 8 ? '✅ Deployment Complete!' : 
                 stepDescriptions[currentStep]?.title}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                {currentStep === 0 ? 'Ready to deploy. Click start to begin the Kubernetes flow.' :
                 currentStep === 8 ? 'Pod is now running! All components have completed their tasks.' :
                 stepDescriptions[currentStep]?.description}
              </p>
            </motion.div>

            {/* Current Step Info - Detailed */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-xl p-5 border border-indigo-500/30 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                {React.createElement(stepDescriptions[currentStep]?.icon || Terminal, {
                  size: 24,
                  className: `text-${stepDescriptions[currentStep]?.color}-400`
                })}
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {stepDescriptions[currentStep]?.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Step {currentStep + 1} of 8
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {stepDescriptions[currentStep]?.description}
              </p>
              <div className="bg-black/30 rounded-lg p-3 border border-indigo-500/20">
                <p className="text-xs text-indigo-300 font-semibold mb-2">Data Flow:</p>
                <p className="text-xs text-indigo-200 font-mono mb-2">
                  {stepDescriptions[currentStep]?.component}
                </p>
                {/* Additional details based on step */}
                {currentStep === 1 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    The manifest contains pod specifications (image, resources, etc.)
                  </p>
                )}
                {currentStep === 2 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    API Server checks authentication, authorization, and resource limits
                  </p>
                )}
                {currentStep === 3 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    etcd stores this as the desired state - single source of truth
                  </p>
                )}
                {currentStep === 4 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    Controller Manager watches for changes and creates Pod objects
                  </p>
                )}
                {currentStep === 5 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    Scheduler evaluates node resources and selects best fit
                  </p>
                )}
                {currentStep === 6 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    Kubelet receives assignment and prepares to create container
                  </p>
                )}
                {currentStep === 7 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    CRI (containerd/docker) creates the actual container runtime
                  </p>
                )}
                {currentStep === 8 && (
                  <p className="text-xs text-indigo-300/80 mt-2">
                    Status propagates back through API Server to etcd for consistency
                  </p>
                )}
              </div>
            </motion.div>

            {/* Progress Indicator */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">Progress</span>
                <span className="text-xs text-gray-400">{currentStep + 1}/8</span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <motion.div
                    key={s}
                    className={`h-2 rounded-full transition-all flex-1 ${
                      s < currentStep ? 'bg-emerald-400' : s === currentStep ? 'bg-indigo-400' : 'bg-gray-600'
                    }`}
                    animate={{ 
                      width: s === currentStep ? '100%' : s < currentStep ? '100%' : '100%'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mode Indicator */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600 flex items-center justify-between">
              <span className="text-sm text-gray-300">Mode:</span>
              <span className={`text-sm font-semibold ${isAutoMode ? 'text-blue-400' : 'text-emerald-400'}`}>
                {isAutoMode ? '🔄 Auto' : '👆 Manual'}
              </span>
            </div>

            {/* Navigation Controls */}
            <div className="space-y-2">
              {!isAutoMode && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={isTransitioning || currentStep === 0}
                  >
                    <ArrowLeft size={18} /> Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={isTransitioning || currentStep === 8}
                  >
                    Next <ArrowRight size={18} />
                  </Button>
                </div>
              )}
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Reset Animation
              </Button>
            </div>

            {/* Next Step Preview */}
            {currentStep < 7 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-500/30"
              >
                <p className="text-xs text-emerald-300 font-semibold mb-1">Coming Next:</p>
                <p className="text-sm text-emerald-200">
                  {stepDescriptions[currentStep + 1]?.title}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {isStarted && currentStep === 8 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4 pt-6"
        >
          <Button onClick={onPrev} variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={20} /> Back
          </Button>
          <Button onClick={onNext} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
            Continue <ArrowRight size={20} />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export const KubernetesIntro: React.FC<KubernetesIntroProps> = ({ onComplete, initialStep = 0 }) => {
  const [step, setStep] = useState(initialStep);

  // Reset step when initialStep changes
  React.useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  // Redirect Step 9 to Step 10 (Step 9 has been removed)
  React.useEffect(() => {
    if (step === 9) {
      setStep(10);
    }
  }, [step]);

  const nextStep = () => {
    setStep(prev => {
      const next = prev + 1;
      // Skip step 9, go directly to step 10
      return next === 9 ? 10 : next;
    });
  };
  const prevStep = () => {
    setStep(prev => {
      const previous = prev - 1;
      // Skip step 9, go directly to step 8
      return previous === 9 ? 8 : Math.max(0, previous);
    });
  };

  return (
    <div className="space-y-8 min-h-[600px] flex flex-col items-center justify-center text-center relative">
      <AnimatePresence mode="wait">
        {/* Step 0: The Pre-Kubernetes Era (The Ninja War) */}
        {step === 0 && (
            <motion.div 
                key="step0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8"
            >
                <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                    The Era of Chaos
                </h2>
                <p className="text-xl text-indigo-200 max-w-2xl mx-auto leading-relaxed">
                    Before Kubernetes, managing containers was like the <strong>Great Ninja War</strong>. 
                    Uncoordinated, chaotic, and destructive.
                </p>
                
                <div className="relative p-8 bg-red-900/20 rounded-2xl border border-red-500/30 max-w-3xl mx-auto overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/10" />
                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div className="flex items-center gap-3 text-red-200">
                            <span className="text-3xl">⚔️</span> 
                            <span>Manual Deployments</span>
                        </div>
                        <div className="flex items-center gap-3 text-red-200">
                            <span className="text-3xl">🔥</span> 
                            <span>Server Burnout</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-center gap-2 text-red-300 font-mono">
                            <Activity /> System Critical
                        </div>
                    </div>
                </div>

                <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
                    Enter the Hokage (Hashirama) <ArrowRight />
                </Button>
            </motion.div>
        )}

        {/* Step 1: The Foundation (Hashirama & Tobirama) */}
        {step === 1 && (
            <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-5xl"
            >
                <h2 className="text-4xl font-bold text-white">The Foundation of Order</h2>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                    {/* Hashirama Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-emerald-900/20 p-8 rounded-2xl border-2 border-emerald-500/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-4 bg-emerald-800/50 rounded-xl border border-emerald-500/30">
                                <Sprout size={48} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Hashirama</h3>
                                <span className="text-emerald-400 font-mono text-sm">The First Hokage</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Wood Style: Deep Forest Emergence!</strong><br/>
                                Just as Hashirama created the village foundation from nothing, Kubernetes creates the <strong>Cluster</strong> infrastructure to house your applications.
                            </p>
                            <div className="bg-emerald-950/50 p-4 rounded-lg text-sm text-emerald-200 border border-emerald-500/20">
                                <strong className="block mb-2 text-emerald-400">Technical Deep Dive: Control Plane</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>etcd (Storage):</strong> Like Hashirama's scrolls, it stores the entire cluster history and state consistently.</li>
                                    <li><strong>API Server:</strong> The central management point for all cluster operations.</li>
                                    <li><strong>Node Controller:</strong> Manages the lifecycle of worker nodes.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tobirama Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-900/20 p-8 rounded-2xl border-2 border-blue-500/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                             <div className="p-4 bg-blue-800/50 rounded-xl border border-blue-500/30">
                                <Waves size={48} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Tobirama</h3>
                                <span className="text-blue-400 font-mono text-sm">The Second Hokage</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Water Style: System Architecture!</strong><br/>
                                Tobirama built the village's systems. Kubernetes provides the <strong>API Server, Scheduler, and Controller</strong> to organize pods efficiently.
                            </p>
                            <div className="bg-blue-950/50 p-4 rounded-lg text-sm text-blue-200 border border-blue-500/20">
                                <strong className="block mb-2 text-blue-400">Technical Deep Dive: API Server & Scheduler</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>Validation:</strong> Ensures every request follows the strict rules of the village.</li>
                                    <li><strong>Scheduling:</strong> Like assigning ninja missions, it filters nodes (Predicates) and scores them (Priorities) to find the best fit for a Pod.</li>
                                    <li><strong>AuthN/AuthZ:</strong> Verifies identity before granting access.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        The Era of Innovation <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Step 2: Innovation (Hiruzen & Minato) */}
        {step === 2 && (
            <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-5xl"
            >
                <h2 className="text-4xl font-bold text-white">The Era of Innovation</h2>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                    {/* Hiruzen Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-amber-900/20 p-8 rounded-2xl border-2 border-amber-500/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-4 bg-amber-800/50 rounded-xl border border-amber-500/30">
                                <Book size={48} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Hiruzen</h3>
                                <span className="text-amber-400 font-mono text-sm">The Professor</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Master of All Jutsu!</strong><br/>
                                Hiruzen symbolizes Kubernetes' maturity. It masters the fundamentals, balancing complex scenarios while maintaining stability for all applications.
                            </p>
                            <div className="bg-amber-950/50 p-4 rounded-lg text-sm text-amber-200 border border-amber-500/20">
                                <strong className="block mb-2 text-amber-400">Technical Deep Dive: Controller Manager</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>Loop of Wisdom:</strong> Constantly watches current state vs desired state.</li>
                                    <li><strong>Controllers:</strong> Manages ReplicaSets, Endpoints, Namespaces, and ServiceAccounts.</li>
                                    <li><strong>Reconciliation:</strong> Takes corrective action if a pod crashes or a node vanishes.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Minato Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-yellow-900/20 p-8 rounded-2xl border-2 border-yellow-400/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-4 bg-yellow-800/50 rounded-xl border border-yellow-500/30">
                                <Zap size={48} className="text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Minato</h3>
                                <span className="text-yellow-400 font-mono text-sm">The Yellow Flash</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Flying Thunder God!</strong><br/>
                                Minato represents <strong>Rolling Updates & Fast Recovery</strong>. K8s updates apps without downtime and instantly recovers from failures, faster than the eye can see.
                            </p>
                            <div className="bg-yellow-950/50 p-4 rounded-lg text-sm text-yellow-200 border border-yellow-500/20">
                                <strong className="block mb-2 text-yellow-400">Technical Deep Dive: Deployments</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>Zero Downtime:</strong> Uses `maxSurge` and `maxUnavailable` to update pods incrementally.</li>
                                    <li><strong>Rollbacks:</strong> Maintains revision history (ReplicaSets) to revert instantly if a bug is found.</li>
                                    <li><strong>Strategy:</strong> Supports Blue/Green and Canary deployments for safe releases.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Summon the Legendary Sannin <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Step 3: The Legendary Sannin */}
        {step === 3 && (
            <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-6xl"
            >
                <h2 className="text-4xl font-bold text-white">The Legendary Sannin</h2>
                <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
                    The three pillars of system reliability.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-8">
                    {/* Jiraiya Card */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-orange-900/20 p-6 rounded-xl border-2 border-orange-500/50 flex flex-col items-center group"
                    >
                        <div className="p-4 bg-orange-800/50 rounded-full border border-orange-500/30 mb-4">
                            <Scroll size={40} className="text-orange-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">Jiraiya</h3>
                        <span className="text-orange-400 font-mono text-xs mb-4">THE SAGE OF MONITORING</span>
                        <p className="text-indigo-200 text-sm text-center mb-4">
                            <strong>Sage Art: Radar Mode!</strong><br/>
                            Like a spy network, K8s <strong>Monitoring</strong> tracks every pod, log, and metric to detect threats instantly.
                        </p>
                         <div className="bg-orange-950/50 p-3 rounded-lg text-xs text-orange-200 w-full text-left">
                             <strong className="block mb-1 text-orange-400">Key Tools:</strong>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Prometheus:</strong> Scrapes metrics from endpoints.</li>
                                <li><strong>Grafana:</strong> Visualizes the health of the village.</li>
                                <li><strong>AlertManager:</strong> Sends summons when metrics spike.</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Tsunade Card */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-green-900/20 p-6 rounded-xl border-2 border-green-500/50 flex flex-col items-center group"
                    >
                        <div className="p-4 bg-green-800/50 rounded-full border border-green-500/30 mb-4">
                            <Heart size={40} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">Tsunade</h3>
                        <span className="text-green-400 font-mono text-xs mb-4">THE LEGENDARY HEALER</span>
                        <p className="text-indigo-200 text-sm text-center mb-4">
                            <strong>Creation Rebirth!</strong><br/>
                            If a pod dies, K8s <strong>Self-Healing</strong> restarts containers instantly, keeping the system alive forever.
                        </p>
                        <div className="bg-green-950/50 p-3 rounded-lg text-xs text-green-200 w-full text-left">
                            <strong className="block mb-1 text-green-400">Key Mechanics:</strong>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Liveness Probes:</strong> "Are you alive?" -&gt; Restart if no.</li>
                                <li><strong>Readiness Probes:</strong> "Ready for traffic?" -&gt; Add to Service if yes.</li>
                                <li><strong>Kubelet:</strong> The medic on every node ensuring pods run.</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Orochimaru Card */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-purple-900/20 p-6 rounded-xl border-2 border-purple-500/50 flex flex-col items-center group"
                    >
                        <div className="p-4 bg-purple-800/50 rounded-full border border-purple-500/30 mb-4">
                            <Dna size={40} className="text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">Orochimaru</h3>
                        <span className="text-purple-400 font-mono text-xs mb-4">THE INNOVATOR</span>
                        <p className="text-indigo-200 text-sm text-center mb-4">
                            <strong>Forbidden Jutsu: Operators!</strong><br/>
                            K8s allows <strong>Custom Resources (CRDs)</strong> and Operators to teach the cluster new, complex tricks.
                        </p>
                        <div className="bg-purple-950/50 p-3 rounded-lg text-xs text-purple-200 w-full text-left">
                             <strong className="block mb-1 text-purple-400">Extensibility:</strong>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>CRDs:</strong> Define new API objects (e.g., "PostgresCluster").</li>
                                <li><strong>Custom Controllers:</strong> Logic to handle these new objects.</li>
                                <li><strong>Validation Webhooks:</strong> Mutate or validate requests dynamically.</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Meet the Uchiha (Operators) <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Step 4: The Operators (Itachi & Obito) */}
        {step === 4 && (
            <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-5xl"
            >
                <h2 className="text-4xl font-bold text-white">The Uchiha: Advanced Operations</h2>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                    {/* Itachi Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-red-950/40 p-8 rounded-2xl border-2 border-red-600/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-4 bg-red-800/50 rounded-xl border border-red-500/30">
                                <Eye size={48} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Itachi</h3>
                                <span className="text-red-400 font-mono text-sm">The Operator</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Sharingan: Prediction!</strong><br/>
                                Itachi symbolizes <strong>Kubernetes Operators</strong>. They automate complex tasks (like managing databases) by predicting and responding to system states, just like the Sharingan.
                            </p>
                            <div className="bg-red-900/30 p-4 rounded-lg text-sm text-red-200 border border-red-500/20">
                                <strong className="block mb-2 text-red-400">Technical Deep Dive: Operator Pattern</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>Codified Knowledge:</strong> Replaces human ops manuals with code.</li>
                                    <li><strong>Day-2 Operations:</strong> Handles backups, upgrades, and scaling automatically.</li>
                                    <li><strong>Reconciliation Loop:</strong> Ensures application health without human intervention.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Obito Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/40 p-8 rounded-2xl border-2 border-slate-500/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                             <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-500/30">
                                <Ghost size={48} className="text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Obito</h3>
                                <span className="text-slate-400 font-mono text-sm">The Runtime Shifter</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Kamui: Dimension Shift!</strong><br/>
                                Obito represents <strong>Container Runtimes</strong> (Docker, containerd, CRI-O). The ability to switch between underlying technologies seamlessly, shifting dimensions of execution.
                            </p>
                            <div className="bg-slate-950/50 p-4 rounded-lg text-sm text-slate-300 border border-slate-500/20">
                                <strong className="block mb-2 text-slate-400">Technical Deep Dive: CRI & OCI</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>CRI (Container Runtime Interface):</strong> The plugin interface that lets Kubelet use different runtimes.</li>
                                    <li><strong>OCI Standards:</strong> Ensures images built by Docker run on containerd or CRI-O.</li>
                                    <li><strong>Sandboxing:</strong> Uses gVisor or Kata Containers for isolated "dimensions".</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        The Final Vision (Madara & Shisui) <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Step 5: Modern Architecture (Madara & Shisui) */}
        {step === 5 && (
            <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-5xl"
            >
                <h2 className="text-4xl font-bold text-white">The Modern Architecture</h2>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                    {/* Madara Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-indigo-950/60 p-8 rounded-2xl border-2 border-indigo-500/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                             <div className="p-4 bg-indigo-800/50 rounded-xl border border-indigo-500/30">
                                <Globe size={48} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Madara</h3>
                                <span className="text-indigo-400 font-mono text-sm">The Visionary</span>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Infinite Tsukuyomi: Unified World!</strong><br/>
                                Madara's vision of a unified world parallels <strong>Multi-Cluster Management & Service Mesh</strong>. A single control plane managing workloads across the entire globe.
                            </p>
                            <div className="bg-indigo-950/50 p-4 rounded-lg text-sm text-indigo-200 border border-indigo-500/20">
                                <strong className="block mb-2 text-indigo-400">Technical Deep Dive: Service Mesh</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>Istio/Linkerd:</strong> Provides mTLS security, observability, and traffic control without code changes.</li>
                                    <li><strong>Federation:</strong> Syncs resources across clusters for high availability and disaster recovery.</li>
                                    <li><strong>Traffic Splitting:</strong> Precise control for A/B testing and canary releases.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shisui Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-teal-900/20 p-8 rounded-2xl border-2 border-teal-500/50 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                             <div className="p-4 bg-teal-800/50 rounded-xl border border-teal-500/30">
                                <Lock size={48} className="text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Shisui</h3>
                                <span className="text-teal-400 font-mono text-sm">The Teleporter</span>
                            </div>
                        </div>
                         <div className="space-y-4 relative z-10">
                            <p className="text-indigo-200">
                                <strong>Kotoamatsukami: Subtle Control!</strong><br/>
                                Shisui symbolizes <strong>Security & Automation</strong>. Managing complex operations and policies (RBAC, Network Policies) seamlessly without disrupting the system.
                            </p>
                            <div className="bg-teal-950/50 p-4 rounded-lg text-sm text-teal-200 border border-teal-500/20">
                                <strong className="block mb-2 text-teal-400">Technical Deep Dive: Policy & Security</strong>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>RBAC:</strong> "Who can do what" (Roles, ClusterRoles, RoleBindings).</li>
                                    <li><strong>Network Policies:</strong> "Who can talk to whom" (Ingress/Egress traffic rules).</li>
                                    <li><strong>OPA/Kyverno:</strong> Policy-as-code to enforce standards across the cluster.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Meet the Hero <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Step 6: The Hero (Naruto) */}
        {step === 6 && (
            <motion.div 
                key="step6"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-5xl"
            >
                <h2 className="text-4xl font-bold text-white">The Hero Who United All</h2>
                <div className="flex justify-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-orange-600/20 p-8 rounded-2xl border-2 border-orange-500 relative overflow-hidden max-w-2xl"
                    >
                        <div className="flex items-center gap-6 mb-6 relative z-10">
                            <div className="p-6 bg-orange-500 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                                <Sun size={64} className="text-white animate-spin-slow" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-3xl font-bold text-white">Naruto Uzumaki</h3>
                                <span className="text-orange-400 font-mono text-lg">The Seventh Hokage</span>
                            </div>
                        </div>
                        <div className="space-y-6 relative z-10 text-left">
                            <p className="text-xl text-indigo-100 leading-relaxed">
                                <strong>The Shinobi Alliance!</strong><br/>
                                Just as Naruto united all Five Great Nations to fight as one, the <strong>Cloud Native Computing Foundation (CNCF)</strong> unites thousands of open-source projects to build the modern cloud ecosystem.
                            </p>
                            <div className="bg-orange-950/60 p-6 rounded-xl text-base text-orange-100 border border-orange-500/30">
                                <strong className="block mb-2 text-orange-400 text-lg">Technical Deep Dive: The CNCF Ecosystem</strong>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><strong>Graduated Projects:</strong> Kubernetes, Prometheus, Envoy, Helm, Fluentd.</li>
                                    <li><strong>Community Governance:</strong> Ensures no single vendor controls the project.</li>
                                    <li><strong>Standards:</strong> OCI (Open Container Initiative) for images, CSI (Storage), CNI (Network) ensure that any tool can work with any cloud provider.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        The Final Path <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Step 7: Implementation */}
        {step === 7 && (
            <motion.div 
                key="step7"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 max-w-4xl mx-auto"
            >
                <h2 className="text-4xl font-bold text-white">The Path Forward</h2>
                <p className="text-xl text-indigo-200 leading-relaxed">
                    Just as the ninja world progressed from war to cooperation, the container landscape evolved from chaos to coordination under Kubernetes.
                </p>

                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-700">
                        <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                            <Layers className="text-violet-400" /> Infrastructure
                        </h4>
                        <p className="text-xs text-indigo-300">Managing nodes (Ninja Squads) and namespaces (Village Districts).</p>
                    </div>
                    <div className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-700">
                        <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                            <Shield className="text-red-400" /> Security
                        </h4>
                        <p className="text-xs text-indigo-300">RBAC and Network Policies acting as the ANBU Black Ops.</p>
                    </div>
                    <div className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-700">
                        <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                            <Activity className="text-green-400" /> Observability
                        </h4>
                        <p className="text-xs text-indigo-300">Comprehensive monitoring like the village surveillance system.</p>
                    </div>
                </div>

                <div className="pt-8">
                    <p className="text-lg text-indigo-200 mb-6 italic">
                        "This is the way of the Cloud Native ninja – believe it! 🍜"
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                            <ArrowLeft size={20} /> Back
                        </Button>
                        <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                            The Grand Fleet (Architecture) <ArrowRight />
                        </Button>
                    </div>
                </div>
            </motion.div>
        )}

        {/* Step 8: The Grand Fleet (Ship Analogy) */}
        {step === 8 && (
            <motion.div 
                key="step8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 w-full max-w-6xl"
            >
                <h2 className="text-4xl font-bold text-white">The Grand Fleet: Architecture Overview</h2>
                <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
                    To truly understand the scale, imagine Kubernetes as a massive shipping fleet navigating the ocean of the cloud.
                </p>

                <div className="grid md:grid-cols-12 gap-8 items-start text-left">
                    {/* Master Ship (Control Plane) */}
                    <div className="md:col-span-5 space-y-4">
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-indigo-900/40 p-6 rounded-2xl border-2 border-indigo-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 bg-indigo-600 rounded-bl-xl text-xs font-bold text-white">MASTER NODE</div>
                            <div className="flex items-center gap-4 mb-4">
                                <Ship size={48} className="text-indigo-300" />
                                <div>
                                    <h3 className="text-2xl font-bold text-white">The Command Ship</h3>
                                    <span className="text-indigo-400 text-sm">Control Plane</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 bg-indigo-950/50 p-3 rounded-lg">
                                    <Anchor className="text-blue-400 shrink-0 mt-1" size={18} />
                                    <div>
                                        <strong className="text-blue-300 text-sm">API Server (Port 6443)</strong>
                                        <p className="text-xs text-indigo-300">The cluster's front desk. Validates and processes REST requests.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-indigo-950/50 p-3 rounded-lg">
                                    <Database className="text-emerald-400 shrink-0 mt-1" size={18} />
                                    <div>
                                        <strong className="text-emerald-300 text-sm">etcd (Port 2379)</strong>
                                        <p className="text-xs text-indigo-300">Key-value store. The "Single Source of Truth" for cluster data.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-indigo-950/50 p-3 rounded-lg">
                                    <ClipboardList className="text-yellow-400 shrink-0 mt-1" size={18} />
                                    <div>
                                        <strong className="text-yellow-300 text-sm">The Cranes (Scheduler) <span className="text-xs text-yellow-200">(Port 10259)</span></strong>
                                        <p className="text-xs text-indigo-300">Like cranes, it identifies the right ship based on capacity, size, and destination policies (Taints & Tolerations).</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-indigo-950/50 p-3 rounded-lg">
                                    <Radio className="text-red-400 shrink-0 mt-1" size={18} />
                                    <div>
                                        <strong className="text-red-300 text-sm">The Fleet Offices (Controllers) <span className="text-xs text-red-200">(Port 10257)</span></strong>
                                        <p className="text-xs text-indigo-300">
                                            <strong>Ops Team (Node Controller):</strong> Handles ship traffic & failures.<br/>
                                            <strong>Cargo Team (Replication Controller):</strong> Replaces damaged containers instantly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Connection Arrows & Data Flow */}
                    <div className="md:col-span-2 relative h-full min-h-[200px] flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <svg className="w-full h-20 overflow-visible">
                                <defs>
                                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                        <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                                    </linearGradient>
                                </defs>
                                {/* Main Data Pipe */}
                                <motion.line 
                                    x1="0%" y1="50%" x2="100%" y2="50%" 
                                    stroke="url(#flowGradient)" 
                                    strokeWidth="4"
                                    strokeDasharray="8 4"
                                    initial={{ strokeDashoffset: 0 }}
                                    animate={{ strokeDashoffset: -24 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                {/* Moving Packets */}
                                <motion.circle r="6" fill="#c7d2fe" filter="drop-shadow(0 0 4px #6366f1)">
                                    <animateMotion 
                                        dur="2s" 
                                        repeatCount="indefinite"
                                        path="M 0 10 L 150 10" // Fallback path, will be overridden by CSS width if needed
                                    >
                                        <mpath href="#flowLine" />
                                    </animateMotion> 
                                    {/* Using simple CSS animation for position instead of animateMotion to be responsive */}
                                </motion.circle>
                            </svg>
                            {/* CSS-based responsive particles */}
                            <motion.div 
                                className="absolute left-0 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#6366f1] z-10"
                                animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                style={{ top: '50%', marginTop: '-6px' }}
                            />
                            <motion.div 
                                className="absolute left-0 w-3 h-3 bg-indigo-300 rounded-full shadow-[0_0_10px_#818cf8] z-10"
                                animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "linear" }}
                                style={{ top: '50%', marginTop: '-6px' }}
                            />
                        </div>
                        
                        <div className="bg-indigo-950/90 px-3 py-1.5 rounded-full text-[10px] text-indigo-200 font-mono border border-indigo-500/50 z-20 backdrop-blur shadow-lg flex items-center gap-2">
                            <Activity size={10} className="text-green-400 animate-pulse" />
                            JSON/HTTPS
                        </div>
                    </div>

                    {/* Worker Ships (Nodes) */}
                    <div className="md:col-span-5 space-y-4">
                        <motion.div 
                             initial={{ x: 50, opacity: 0 }}
                             animate={{ x: 0, opacity: 1 }}
                             transition={{ delay: 0.3 }}
                             className="bg-slate-900/40 p-6 rounded-2xl border-2 border-slate-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 bg-slate-600 rounded-bl-xl text-xs font-bold text-white">WORKER NODE</div>
                            <div className="flex items-center gap-4 mb-4">
                                <Ship size={48} className="text-slate-300" />
                                <div>
                                    <h3 className="text-2xl font-bold text-white">The Cargo Ship</h3>
                                    <span className="text-slate-400 text-sm">Worker Node</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-lg">
                                    <Server className="text-orange-400 shrink-0 mt-1" size={18} />
                                    <div>
                                        <strong className="text-orange-300 text-sm">The Captain (Kubelet) <span className="text-xs text-orange-200">(Port 10250)</span></strong>
                                        <p className="text-xs text-slate-300">Liaises with the Master Ship. Sends regular status reports and executes orders to load/unload containers.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-lg">
                                    <Cpu className="text-cyan-400 shrink-0 mt-1" size={18} />
                                    <div>
                                        <strong className="text-cyan-300 text-sm">Container Runtime</strong>
                                        <p className="text-xs text-slate-300">Software (Docker, containerd, CRI-O) that runs the containers.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-lg">
                                    <Network className="text-violet-400 shrink-0 mt-1" size={18} />
                                    <div>
                                        <strong className="text-violet-300 text-sm">Kube Proxy (Network)</strong>
                                        <p className="text-xs text-slate-300">Maintains network rules (iptables/IPVS) for Pod communication.</p>
                                    </div>
                                </div>
                                
                                {/* Cargo Visualization */}
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <span className="text-xs text-slate-400 block mb-2">CARGO HOLD (PODS)</span>
                                    <div className="flex gap-2">
                                        <motion.div 
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }}
                                            className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-xs font-bold"
                                        >P1</motion.div>
                                        <motion.div 
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }}
                                            className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-xs font-bold"
                                        >P2</motion.div>
                                        <motion.div 
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }}
                                            className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-xs font-bold"
                                        >P3</motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="pt-8">
                    <div className="flex justify-center gap-4">
                        <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                            <ArrowLeft size={20} /> Back
                        </Button>
                        <Button onClick={() => setStep(10)} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Enter the Command Center <ArrowRight />
                    </Button>
                    </div>
                </div>
            </motion.div>
        )}

        {/* Step 9: Detailed Kubernetes Architecture Diagram - COMPLETELY REMOVED */}

        {/* Step 10: The Grand Fleet Command (Ship Format - Detailed Flow) */}
        {step === 10 && (
            <GrandFleetCommandPage onNext={nextStep} onPrev={prevStep} />
        )}
        
        {/* Step 9 OLD: Original Ship Animation - Keeping for reference */}
        {step === 99 && (
            <motion.div 
                key="step9"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 w-full max-w-7xl"
            >
                <div className="text-center space-y-4">
                    <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
                        The Grand Fleet Command
                    </h2>
                    <p className="text-xl text-indigo-200 max-w-4xl mx-auto">
                        Watch the <strong>Ship's Crew</strong> (Control Plane) coordinate the deployment of a new container to the <strong>Worker Barges</strong>.
                    </p>
                </div>

                <div className="relative bg-gradient-to-b from-sky-950 via-blue-900 to-slate-950 rounded-[3rem] p-1 border-4 border-blue-500/30 shadow-2xl overflow-hidden h-[800px]">
                    {/* Dynamic Ocean Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-blue-900/80 to-transparent z-10"></div>
                        {/* Wave Layers */}
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute bottom-0 left-0 w-[200%] h-48 opacity-40"
                                style={{ 
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M321.39 56.44c58-10.79 114.16-30.13 172-41.86 82.39-16.72 168.19-17.73 250.45-.39C823.78 31 906.67 72 985.66 92.83c70.05 18.48 146.53 26.09 214.34 3V0H0v27.35a600.21 600.21 0 00321.39 29.09z' fill='%234f46e5' fill-opacity='1'/%3E%3C/svg%3E")`,
                                    backgroundSize: '50% 100%',
                                    backgroundRepeat: 'repeat-x',
                                    bottom: `${(i-1) * 20}px`,
                                    zIndex: i
                                }}
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                            />
                        ))}
                    </div>

                    {/* ---------------- SCENE COMPONENTS ---------------- */}

                    {/* 1. Developer Console (Top Left Sky) */}
                    <div className="absolute top-8 left-8 z-30 bg-slate-900/90 p-4 rounded-xl border border-slate-600 w-64 shadow-xl font-mono text-xs">
                        <div className="flex gap-1.5 mb-3 border-b border-slate-700 pb-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="ml-auto text-slate-500">developer@local</span>
                        </div>
                        <div className="text-green-400">$ kubectl apply -f pod.yaml</div>
                        <div id="console-output" className="text-slate-300 mt-1 opacity-0 transition-opacity duration-500">
                            deployment.apps/web created
                        </div>
                    </div>

                    {/* 2. Info / Explainer Box (Below Developer Console) */}
                    <div className="absolute top-36 left-8 z-30 max-w-xs">
                        <div id="step-explainer" className="bg-black/80 backdrop-blur-md p-4 rounded-xl border-l-4 border-indigo-500 shadow-2xl opacity-0 transition-opacity duration-300">
                            <h3 id="step-title" className="text-indigo-400 font-bold mb-1 text-sm">Waiting...</h3>
                            <p id="step-desc" className="text-slate-300 text-xs leading-relaxed">Ready to deploy.</p>
                        </div>
                    </div>

                    {/* 3. MASTER SHIP (Control Plane) - Positioned on Water, Right Side */}
                    <div className="absolute bottom-[200px] right-8 w-[800px] h-[400px] z-20">
                        <svg viewBox="0 0 800 400" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#1e1b4b" />
                                    <stop offset="100%" stopColor="#312e81" />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <filter id="apiGlowLarge">
                                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                                <filter id="etcdGlowLarge">
                                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Ship Hull - Bottom aligns with water line */}
                            <path d="M 50 250 L 750 250 L 700 380 Q 400 420 100 380 Z" fill="url(#hullGradient)" stroke="#6366f1" strokeWidth="3" filter="url(#glow)" />
                            <text x="400" y="360" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="40" fontWeight="900" letterSpacing="10">K8S-MASTER</text>

                            {/* Deck */}
                            <rect x="80" y="240" width="640" height="20" fill="#3730a3" stroke="#6366f1" rx="5" />

                            {/* BRIDGE (API SERVER) */}
                            <g id="comp-api" transform="translate(450, 100)" className="transition-all duration-300">
                                <rect 
                                    x="0" 
                                    y="0" 
                                    width="140" 
                                    height="140" 
                                    rx="10" 
                                    fill="#312e81" 
                                    stroke="#818cf8" 
                                    strokeWidth="2"
                                />
                                <rect x="10" y="20" width="120" height="60" rx="5" fill="#93c5fd" opacity="0.3" /> {/* Windows */}
                                <text x="70" y="110" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">API BRIDGE</text>
                                <text x="70" y="130" textAnchor="middle" fill="#a5b4fc" fontSize="10">Port 6443</text>
                                {/* Radar */}
                                <g transform="translate(70, -20)">
                                    <circle cx="0" cy="0" r="5" fill="#ef4444" />
                                    <path d="M 0 0 L 30 -10 L 30 10 Z" fill="#ef4444" opacity="0.5">
                                        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="2s" repeatCount="indefinite" />
                                    </path>
                                </g>
                            </g>

                            {/* CARGO HOLD (ETCD) */}
                            <g id="comp-etcd" transform="translate(620, 160)" className="transition-all duration-300">
                                <rect 
                                    x="0" 
                                    y="0" 
                                    width="100" 
                                    height="80" 
                                    rx="5" 
                                    fill="#064e3b" 
                                    stroke="#10b981" 
                                    strokeWidth="2"
                                />
                                <text x="50" y="40" textAnchor="middle" fill="#6ee7b7" fontSize="14" fontWeight="bold">etcd VAULT</text>
                                <circle cx="20" cy="60" r="3" fill="#34d399"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" /></circle>
                                <circle cx="50" cy="60" r="3" fill="#34d399"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" begin="0.2s" /></circle>
                                <circle cx="80" cy="60" r="3" fill="#34d399"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" begin="0.4s" /></circle>
                            </g>

                            {/* CONTROLLER (New Component) */}
                            <g id="comp-controller" transform="translate(350, 160)" className="transition-all duration-300">
                                <rect x="0" y="0" width="90" height="80" rx="5" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
                                <text x="45" y="35" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="bold">CONTROLLER</text>
                                <text x="45" y="50" textAnchor="middle" fill="#fca5a5" fontSize="9">MANAGER</text>
                                <path d="M 25 60 L 35 70 L 65 55" stroke="#fca5a5" strokeWidth="3" fill="none" />
                            </g>

                            {/* CRANE (SCHEDULER) - Straight vertical crane */}
                            <g id="comp-scheduler" transform="translate(200, 240)">
                                {/* Base - STATIC (Does NOT move) */}
                                <rect x="-20" y="-40" width="40" height="40" fill="#854d0e" stroke="#eab308" strokeWidth="2" />
                                {/* Swivel Joint */}
                                <circle cx="0" cy="-40" r="12" fill="#ca8a04" />
                                
                                {/* Arm Group - Vertical (straight up) */}
                                <g id="crane-arm" style={{ transformOrigin: "0px -40px" }}>
                                    {/* Main Boom */}
                                    <rect x="-5" y="-160" width="10" height="160" fill="#ca8a04" rx="2" />
                                    {/* Joint */}
                                    <circle cx="0" cy="-160" r="8" fill="white" stroke="#ca8a04" strokeWidth="2" />
                                    
                                    {/* Forearm (Extends outward horizontally to left) */}
                                    <g transform="translate(0, -160)">
                                        <rect x="-100" y="-4" width="100" height="8" fill="#eab308" rx="2" />
                                        
                                        {/* Thread Group - At tip of forearm, vertical */}
                                        <g id="crane-thread-group" transform="translate(-100, 0)">
                                            {/* Thread/Cable - Vertical line */}
                                            <line id="crane-thread" x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="2" strokeDasharray="4 2" />
                                            
                                            {/* Hook */}
                                            <g id="crane-hook" transform="translate(0, 20)">
                                                <path d="M -8 0 Q 0 10 8 0" stroke="white" strokeWidth="3" fill="none" />
                                                
                                                {/* Pod on Hook - Initially hidden */}
                                                <g id="crane-pod" transform="translate(-15, 5)" style={{ opacity: 0 }}>
                                                    <rect x="0" y="0" width="30" height="30" rx="6" fill="url(#hullGradient)" stroke="#fff" strokeWidth="2" />
                                                    <text x="15" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">POD</text>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                                <text x="0" y="20" textAnchor="middle" fill="#fde047" fontSize="12" fontWeight="bold">SCHEDULER</text>
                            </g>
                        </svg>
                    </div>

                    {/* 4. WORKER BARGE (Single Node - Mini Boat) - Left Side */}
                    <div className="absolute bottom-10 left-8 z-20">
                        <div id="node-1" className="relative transition-all duration-500">
                            {/* Mini Boat SVG - Larger Size */}
                            <svg width="450" height="180" viewBox="0 0 450 180" className="drop-shadow-2xl">
                                {/* Boat Hull */}
                                <path d="M 30 60 L 420 60 L 390 150 Q 225 170 60 150 Z" fill="#1e293b" stroke="#475569" strokeWidth="4" />
                                {/* Deck */}
                                <rect x="50" y="50" width="350" height="15" fill="#334155" stroke="#475569" strokeWidth="2" rx="2" />
                                {/* Boat Name */}
                                <text x="225" y="120" textAnchor="middle" fill="#64748b" fontSize="18" fontWeight="bold" letterSpacing="3">WORKER 1</text>
                                {/* Small Cabin/Mast */}
                                <rect x="200" y="30" width="50" height="25" fill="#475569" stroke="#64748b" strokeWidth="2" rx="3" />
                                <circle cx="225" cy="20" r="8" fill="#fbbf24" />
                            </svg>
                            
                            {/* Kubelet Captain */}
                            <div id="kubelet-1" className="absolute -top-6 left-16 bg-orange-600 rounded-lg p-3 border-2 border-orange-400 shadow-lg opacity-60 transition-all duration-300 flex flex-col items-center w-20" title="Kubelet Captain">
                                <Server size={28} className="text-white" />
                                <span className="text-[10px] text-white font-bold mt-1">Kubelet</span>
                            </div>

                            {/* KubeProxy */}
                            <div className="absolute -top-6 right-16 bg-purple-600 rounded-lg p-3 border-2 border-purple-400 shadow-lg opacity-60 flex flex-col items-center w-20" title="KubeProxy">
                                <Network size={28} className="text-white" />
                                <span className="text-[10px] text-white font-bold mt-1">KubeProxy</span>
                            </div>

                            {/* CRI Engine */}
                            <div id="cri-1" className="absolute top-12 left-1/2 -translate-x-1/2 bg-blue-600 rounded-lg p-2 border-2 border-blue-400 shadow-lg opacity-60 transition-all duration-300 flex flex-col items-center w-16" title="CRI Engine">
                                <Cpu size={24} className="text-white" />
                                <span className="text-[10px] text-white font-bold mt-1">CRI</span>
                            </div>

                            {/* Pod Slot - Small unit positioned below components inside worker node */}
                            <div className="absolute bottom-10 left-[30%] z-[100]" style={{ display: 'block', opacity: 1, visibility: 'visible' }}>
                                <div id="final-pod" className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg border border-white shadow-[0_0_12px_rgba(236,72,153,0.5)] flex items-center justify-center transition-all duration-500" style={{ opacity: 0, transform: 'scale(0)', display: 'flex' }}>
                                    <Package size={16} className="text-white animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---------------- ANIMATION ELEMENTS ---------------- */}
                    
                    {/* Packet */}
                    <div id="anim-packet" className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] z-50 opacity-0 pointer-events-none transition-all duration-300" />

                    {/* Manifest */}
                    <div id="anim-manifest" className="absolute w-8 h-10 bg-yellow-100 rounded border border-yellow-600 flex flex-col gap-1 p-1 items-center justify-center shadow-lg z-50 opacity-0 pointer-events-none">
                        <div className="w-full h-0.5 bg-slate-300" />
                        <div className="w-full h-0.5 bg-slate-300" />
                        <div className="w-full h-0.5 bg-slate-300" />
                    </div>

                    {/* DEPLOY BUTTON (Top Right Side) */}
                    <div className="absolute top-8 right-8 z-50">
                        <motion.button
                            id="deploy-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-xl border border-blue-400/50 flex items-center gap-3 text-lg"
                            onClick={() => {
                                // SEQUENCER
                                const runStep = (step: number, delay: number) => setTimeout(() => {
                                    const els = {
                                        packet: document.getElementById('anim-packet'),
                                        manifest: document.getElementById('anim-manifest'),
                                        title: document.getElementById('step-title'),
                                        desc: document.getElementById('step-desc'),
                                        explainer: document.getElementById('step-explainer'),
                                        console: document.getElementById('console-output'),
                                        api: document.getElementById('comp-api'),
                                        etcd: document.getElementById('comp-etcd'),
                                        controller: document.getElementById('comp-controller'),
                                        sched: document.getElementById('comp-scheduler'),
                                        craneArm: document.getElementById('crane-arm'),
                                        craneThread: document.getElementById('crane-thread'),
                                        craneHook: document.getElementById('crane-hook'),
                                        node1: document.getElementById('node-1'),
                                        kubelet1: document.getElementById('kubelet-1'),
                                        cri1: document.getElementById('cri-1'),
                                        pod: document.getElementById('final-pod'),
                                        btn: document.getElementById('deploy-btn')
                                    };
                                    
                                    if (!els.packet) return;
                                    
                                    els.explainer!.style.opacity = '1';

                                    // 1. REQUEST
                                    if (step === 1) {
                                        if (els.btn) { els.btn.style.opacity = '0.5'; els.btn.style.pointerEvents = 'none'; }
                                        els.title!.innerText = "1. The Request";
                                        els.desc!.innerText = "Captain (Dev) sends manifest to Bridge via kubectl.";
                                        
                                        // Reset manifest position
                                        els.manifest!.style.transition = 'all 1.5s ease-in-out';
                                        const consoleBox = els.console?.parentElement;
                                        if (consoleBox && els.api && els.manifest) {
                                            const start = consoleBox.getBoundingClientRect();
                                            const end = els.api.getBoundingClientRect();
                                            
                                            // Reset & Position Start
                                            els.manifest.style.transition = 'none';
                                            els.manifest.style.position = 'fixed';
                                            els.manifest.style.top = `${start.top + 40}px`;
                                            els.manifest.style.left = `${start.left + 40}px`;
                                            els.manifest.style.opacity = '1';
                                            els.manifest.style.display = 'flex';
                                            els.manifest.style.visibility = 'visible';
                                            els.manifest.style.zIndex = '100';
                                            els.manifest.style.transform = 'none';
                                            
                                            // Animate
                                            requestAnimationFrame(() => {
                                                els.manifest!.style.transition = 'all 1.5s ease-in-out';
                                                els.manifest!.style.top = `${end.top + 20}px`;
                                                els.manifest!.style.left = `${end.left + 20}px`;
                                            });
                                            
                                            // Stop - NO GLOW on step 1
                                            setTimeout(() => {
                                                els.manifest!.style.transition = 'none';
                                                // Remove any glow from step 1
                                                els.api!.style.filter = 'none';
                                                els.api!.style.stroke = '#818cf8';
                                                els.api!.style.strokeWidth = '2';
                                            }, 1500);
                                        }
                                    }

                                    // 2. VALIDATION - API Bridge glows for 5 seconds, manifest vanishes after 2 seconds
                                    if (step === 2) {
                                        els.title!.innerText = "2. Validation";
                                        els.desc!.innerText = "API Server validates the manifest orders. Manifest stays at API Bridge for 2 seconds.";
                                        els.console!.style.opacity = '1';
                                        
                                        // FORCE STOP manifest at API Bridge - override everything
                                        els.manifest!.style.setProperty('transition', 'none', 'important');
                                        els.manifest!.style.top = 'calc(100vh - 380px)';
                                        els.manifest!.style.left = 'calc(100vw - 208px)';
                                        els.manifest!.style.opacity = '1';
                                        els.manifest!.style.display = 'flex';
                                        els.manifest!.style.visibility = 'visible';
                                        els.manifest!.style.transform = 'none';
                                        els.manifest!.style.position = 'absolute';
                                        els.manifest!.style.zIndex = '50';
                                        
                                        // Manifest stays for 2 seconds, then vanishes
                                        setTimeout(() => {
                                            els.manifest!.style.transition = 'opacity 0.5s ease-out';
                                            els.manifest!.style.opacity = '0';
                                            setTimeout(() => {
                                                els.manifest!.style.display = 'none';
                                            }, 500);
                                        }, 2000);
                                        
                                        // API Bridge glow will be removed when step 3 starts
                                    }

                                    // 3. PERSISTENCE - API → etcd (Store Desired State)
                                    if (step === 3) {
                                        els.title!.innerText = "3. Store in Vault";
                                        els.desc!.innerText = "API Server stores the Pod desired state in etcd Vault.";
                                        
                                        // Continue manifest animation from API to etcd
                                        els.manifest!.style.opacity = '1';
                                        els.manifest!.style.top = 'calc(100vh - 380px)'; // API (right side Master ship)
                                        els.manifest!.style.left = 'calc(100vw - 208px)';
                                        
                                        requestAnimationFrame(() => {
                                            els.manifest!.style.transition = 'all 1.5s ease-in-out';
                                            els.manifest!.style.left = 'calc(100vw - 358px)'; // etcd (center-right Master ship)
                                            els.manifest!.style.top = 'calc(100vh - 380px)';
                                        });
                                        
                                        setTimeout(() => {
                                                els.manifest!.style.opacity = '0.7'; // Keep manifest visible but dimmed
                                        }, 1500);
                                    }

                                    // 4. CONTROLLER MANAGER - Watches etcd, Creates Pod Object
                                    if (step === 4) {
                                        els.title!.innerText = "4. Controller Manager";
                                        els.desc!.innerText = "Controller Manager watches etcd, sees new Pod spec, creates Pod object.";
                                        
                                        // Show Controller Manager watching etcd
                                        
                                        setTimeout(() => {
                                            // Controller creates Pod, updates via API Server → etcd
                                            els.packet!.style.opacity = '1';
                                            els.packet!.style.left = 'calc(100vw - 338px)'; // Controller Manager
                                            els.packet!.style.top = 'calc(100vh - 296px)';
                                            
                                            requestAnimationFrame(() => {
                                                els.packet!.style.transition = 'all 1s linear';
                                                els.packet!.style.left = 'calc(100vw - 188px)'; // API Server
                                                els.packet!.style.top = 'calc(100vh - 296px)';
                                            });
                                            
                                            setTimeout(() => {
                                                requestAnimationFrame(() => {
                                                    els.packet!.style.transition = 'all 1s linear';
                                                    els.packet!.style.left = 'calc(100vw - 338px)'; // etcd (update)
                                                    els.packet!.style.top = 'calc(100vh - 296px)';
                                                });
                                                
                                                setTimeout(() => {
                                                    // Keep glowing for 4 seconds total
                                                    setTimeout(() => {
                                                        els.packet!.style.opacity = '0';
                                                    }, 4000);
                                                }, 1000);
                                            }, 1000);
                                        }, 500);
                                    }

                                    // 5. SCHEDULER - Watches etcd, Selects Node, Binds Pod
                                    if (step === 5) {
                                        els.title!.innerText = "5. Scheduler";
                                        els.desc!.innerText = "Scheduler watches etcd for unscheduled Pods, selects best Worker Node, binds Pod.";
                                        
                                        // Show Scheduler watching etcd
                                        
                                        setTimeout(() => {
                                            // Scheduler selects node and binds via API Server → etcd
                                            els.packet!.style.opacity = '1';
                                            els.packet!.style.left = 'calc(100vw - 488px)'; // Scheduler Crane
                                            els.packet!.style.top = 'calc(100vh - 296px)';
                                            
                                            requestAnimationFrame(() => {
                                                els.packet!.style.transition = 'all 1s linear';
                                                els.packet!.style.left = 'calc(100vw - 188px)'; // API Server
                                                els.packet!.style.top = 'calc(100vh - 296px)';
                                            });
                                            
                                            setTimeout(() => {
                                                requestAnimationFrame(() => {
                                                    els.packet!.style.transition = 'all 1s linear';
                                                    els.packet!.style.left = 'calc(100vw - 338px)'; // etcd (update binding)
                                                    els.packet!.style.top = 'calc(100vh - 296px)';
                                                });
                                                
                                                setTimeout(() => {
                                                    // Keep glowing for 4 seconds total
                                                    setTimeout(() => {
                                                        els.packet!.style.opacity = '0';
                                                    }, 4000);
                                                }, 1000);
                                            }, 1000);
                                        }, 500);
                                    }

                                    // 6. KUBELET - Watches API Server, Sees Pod Assignment
                                    if (step === 6) {
                                        els.title!.innerText = "6. Kubelet Watches";
                                        els.desc!.innerText = "Kubelet on Worker Node watches API Server, sees Pod assigned to its node.";
                                        
                                        els.packet!.style.opacity = '1';
                                        els.packet!.style.left = 'calc(100vw - 188px)'; // API Server (right side Master ship)
                                        els.packet!.style.top = 'calc(100vh - 296px)';
                                        
                                        requestAnimationFrame(() => {
                                            els.packet!.style.transition = 'all 1.5s linear';
                                            els.packet!.style.top = 'calc(100vh - 200px)'; // Worker Node (left side)
                                            els.packet!.style.left = '257px'; // Center of Worker node (32px + 225px)
                                            els.packet!.style.transform = 'none';
                                        });
                                        
                                        setTimeout(() => {
                                            els.kubelet1!.style.opacity = '1';
                                            els.kubelet1!.style.transform = 'scale(1.2)';
                                            els.packet!.style.opacity = '0';
                                        }, 1500);
                                    }

                                    // 7. SCHEDULER PLACEMENT + CRI CREATION
                                    if (step === 7) {
                                        els.title!.innerText = "7. Pod Placement & Container Creation";
                                        els.desc!.innerText = "Scheduler places Pod on Worker Node, then Kubelet uses CRI to create the container.";
                                        
                                        const cranePod = document.getElementById('crane-pod');
                                        
                                        // PART 1: Scheduler Crane lowers pod onto Worker Node
                                        // Highlight scheduler (glow for 5 seconds)
                                        els.sched!.style.filter = 'drop-shadow(0 0 20px #facc15)';
                                        
                                        if (cranePod) {
                                            cranePod.style.opacity = '1';
                                        }
                                        
                                        setTimeout(() => {
                                            if (els.craneThread && els.craneHook) {
                                                // Extend thread down vertically to reach Worker Node deck
                                                // Worker node deck is at top-[50px], so thread needs ~200px to reach it
                                                els.craneThread.setAttribute('y2', '200'); // Adjusted to reach deck precisely
                                                els.craneThread.style.transition = 'all 2.5s ease-in-out';
                                                
                                                // Move hook and pod down with thread
                                                els.craneHook.setAttribute('transform', 'translate(0, 200)');
                                                els.craneHook.style.transition = 'all 2.5s ease-in-out';
                                                
                                                // Move pod element down with hook
                                                if (cranePod) {
                                                    cranePod.setAttribute('transform', 'translate(-15, 215)');
                                                    cranePod.style.transition = 'all 2.5s ease-in-out';
                                                }
                                            }
                                        }, 500);
                                        
                                        // PART 2: Pod lands on Worker Node deck (crane animation only, pod stays hidden)
                                        setTimeout(() => {
                                            // Hide pod on crane
                                            if (cranePod) {
                                                cranePod.style.opacity = '0';
                                            }
                                            
                                            // Keep pod HIDDEN until CRI creates it in Part 3
                                            els.pod!.style.display = 'none';
                                            els.pod!.style.opacity = '0';
                                            
                                            
                                            // Retract thread back up
                                            setTimeout(() => {
                                                if (els.craneThread && els.craneHook) {
                                                    els.craneThread.setAttribute('y2', '20');
                                                    els.craneThread.style.transition = 'all 2s ease-in-out';
                                                    
                                                    els.craneHook.setAttribute('transform', 'translate(0, 20)');
                                                    els.craneHook.style.transition = 'all 2s ease-in-out';
                                                    
                                                    if (cranePod) {
                                                        cranePod.setAttribute('transform', 'translate(-15, 5)');
                                                        cranePod.style.transition = 'all 2s ease-in-out';
                                                        cranePod.style.opacity = '0';
                                                    }
                                                }
                                                
                                                // PART 3: CRI creates container (after 5 seconds) - NOW SHOW THE POD
                                                setTimeout(() => {
                                                    els.title!.innerText = "7. Container Creation";
                                                    els.desc!.innerText = "Kubelet uses CRI (Container Runtime Interface) to create the container.";
                                                    
                                                    // Highlight CRI (glow for 5 seconds)
                                                    els.cri1!.style.opacity = '1';
                                                    els.cri1!.style.transform = 'scale(1.2)';
                                                    els.cri1!.style.filter = 'drop-shadow(0 0 20px #3b82f6)';
                                                    
                                                    // After CRI glows for 2 seconds, show the pod
                                                    setTimeout(() => {
                                                        // NOW show pod on Worker Node deck (positioned within its container)
                                                        els.pod!.style.display = 'flex';
                                                        els.pod!.style.opacity = '1';
                                                        els.pod!.style.transform = 'scale(1)';
                                                        els.pod!.style.visibility = 'visible';
                                                        els.pod!.style.filter = 'drop-shadow(0 0 20px #ec4899)';
                                                        els.pod!.style.transition = 'all 0.5s ease-out';
                                                        
                                                        // Ensure pod container is visible and properly positioned
                                                        const podContainer = els.pod!.parentElement;
                                                        if (podContainer) {
                                                            podContainer.style.display = 'block';
                                                            podContainer.style.opacity = '1';
                                                            podContainer.style.visibility = 'visible';
                                                            podContainer.style.zIndex = '100';
                                                        }
                                                    }, 2000);
                                                    
                                                    setTimeout(() => {
                                                        els.cri1!.style.filter = 'drop-shadow(0 0 10px #3b82f6)';
                                                        els.cri1!.style.transform = 'scale(1)';
                                                        els.node1!.style.filter = 'drop-shadow(0 0 10px #f97316)';
                                                        // Keep pod visible and glowing
                                                        els.pod!.style.opacity = '1';
                                                        els.pod!.style.filter = 'drop-shadow(0 0 15px #ec4899)';
                                                    }, 4000);
                                                }, 500);
                                            }, 1500);
                                            
                                        }, 3000);
                                    }

                                    // 8. STATUS REPORTING - Pod Running, Reports Back to API Server
                                    if (step === 8) {
                                        els.title!.innerText = "8. Status Reporting";
                                        els.desc!.innerText = "Pod is Running! Kubelet reports Pod status back to API Server, which updates etcd.";
                                        
                                        // Ensure pod stays visible (position already set by Step 7)
                                        els.pod!.style.display = 'flex';
                                        els.pod!.style.opacity = '1';
                                        els.pod!.style.visibility = 'visible';
                                        
                                        // Pod is running (glow for 5 seconds)
                                        els.pod!.style.filter = 'drop-shadow(0 0 25px #ec4899)';
                                        els.kubelet1!.style.filter = 'drop-shadow(0 0 15px #f97316)';
                                        
                                        // Status packet from Worker Node to API Server
                                        els.packet!.style.top = 'calc(100vh - 200px)';
                                        els.packet!.style.left = '257px'; // Worker Node (left side)
                                        els.packet!.style.transform = 'none';
                                        els.packet!.style.opacity = '1';
                                        els.packet!.style.backgroundColor = '#4ade80';
                                        
                                        requestAnimationFrame(() => {
                                            els.packet!.style.transition = 'all 1.5s linear';
                                            els.packet!.style.top = 'calc(100vh - 296px)'; // API Server (right side Master ship)
                                            els.packet!.style.left = 'calc(100vw - 188px)';
                                            els.packet!.style.transform = 'none';
                                        });
                                            
                                            setTimeout(() => {
                                                requestAnimationFrame(() => {
                                                    els.packet!.style.transition = 'all 1s linear';
                                                els.packet!.style.left = 'calc(100vw - 338px)'; // etcd (status update)
                                                els.packet!.style.top = 'calc(100vh - 296px)';
                                                });
                                                
                                                setTimeout(() => {
                                                            els.packet!.style.opacity = '0';
                                                            
                                                            if (els.btn) {
                                                                els.btn.innerHTML = '<span class="flex items-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Pod Running!</span>';
                                                                els.btn.style.background = 'linear-gradient(to right, #059669, #10b981)';
                                                                els.btn.style.opacity = '1';
                                                                els.btn.style.pointerEvents = 'auto';
                                                            }
                                                    }, 1000);
                                        }, 1500);
                                    }
                                    
                                }, delay);

                                runStep(1, 0);        // Request
                                runStep(2, 3000);     // Validation (3s delay)
                                runStep(3, 9000);     // Store in Vault (6s delay for 5s glow + transition)
                                runStep(4, 16000);    // Controller Manager (7s delay)
                                runStep(5, 23000);    // Scheduler (7s delay)
                                runStep(6, 30000);    // Kubelet Watches (7s delay)
                                runStep(7, 38000);    // Pod Placement & CRI (8s delay for crane animation)
                                runStep(8, 48000);    // Status Reporting (10s delay for full animation)
                            }}
                        >
                            <Package className="animate-bounce" /> DEPLOY POD
                        </motion.button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Enter the Engine Room <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}

        {/* Step 11: Container Runtimes - Visual Animated */}
        {step === 11 && (
            <motion.div 
                key="step11"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-6xl"
            >
                <h2 className="text-4xl font-bold text-white">The Engine Room: Container Runtimes</h2>
                <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
                    Watch the evolution: From Docker's monolithic approach to CRI's modular power.
                </p>

                {/* Animated Evolution Timeline - Flexbox Layout */}
                <div className="relative min-h-[500px] bg-gradient-to-b from-slate-950 to-indigo-950 rounded-2xl border border-indigo-500/30 p-8 flex flex-col justify-center gap-16">
                    
                    {/* ---------------- TOP ROW: The Old Way (Docker) ---------------- */}
                    <div className="flex items-center justify-between relative z-20">
                        {/* Kubernetes v1.23 */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="w-48 bg-blue-600 p-4 rounded-xl shadow-2xl text-center border-2 border-blue-400 shrink-0"
                        >
                            <Ship className="mx-auto mb-2 text-white" size={32} />
                            <div className="text-white font-bold">Kubernetes</div>
                            <div className="text-xs text-blue-200">v1.23 & Earlier</div>
                        </motion.div>

                        {/* Connection 1 */}
                        <motion.div 
                            className="flex-1 relative h-[2px] -mx-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                        >
                            <motion.div 
                                className="absolute inset-0 bg-red-500"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 2.5, duration: 0.5 }}
                                style={{ originX: 0 }}
                            />
                        </motion.div>

                        {/* Dockershim */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5 }}
                            className="w-32 bg-red-900/80 p-3 rounded-lg border-2 border-red-500 border-dashed relative backdrop-blur-sm shrink-0 z-10"
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="flex justify-center"
                            >
                                <Package size={24} className="text-red-300" />
                            </motion.div>
                            <div className="text-xs text-red-200 mt-1 font-mono text-center">Dockershim</div>
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 3.5 }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg whitespace-nowrap"
                            >
                                REMOVED v1.24
                            </motion.div>
                        </motion.div>

                        {/* Connection 2 */}
                        <motion.div 
                            className="flex-1 relative h-[2px] -mx-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 4.0 }}
                        >
                            <motion.div 
                                className="absolute inset-0 bg-red-500"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 4.0, duration: 0.5 }}
                                style={{ originX: 0 }}
                            />
                        </motion.div>

                        {/* Docker Suite */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 4.5 }}
                            className="w-48 bg-blue-900/90 p-4 rounded-xl border border-blue-600 backdrop-blur-sm shrink-0 z-10"
                        >
                            <div className="text-blue-300 font-bold text-center mb-3 text-sm">Docker Suite</div>
                            <div className="space-y-2 text-xs text-blue-200">
                                <div className="bg-blue-950 p-2 rounded flex items-center gap-2"><Terminal size={12}/> CLI</div>
                                <div className="bg-blue-950 p-2 rounded flex items-center gap-2"><Network size={12}/> API</div>
                                <div className="bg-green-800/80 p-2 rounded font-bold border border-green-600 flex items-center gap-2">
                                    <Cpu size={12}/> containerd
                                </div>
                            </div>
                        </motion.div>
                    </div>


                    {/* ---------------- BOTTOM ROW: The New Way (CRI) ---------------- */}
                    <div className="flex items-center justify-between relative z-20">
                        {/* Kubernetes v1.24+ */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 5.5 }}
                            className="w-48 bg-purple-600 p-4 rounded-xl shadow-2xl text-center border-2 border-purple-400 shrink-0 z-10"
                        >
                            <Ship className="mx-auto mb-2 text-white" size={32} />
                            <div className="text-white font-bold">Kubernetes</div>
                            <div className="text-xs text-purple-200">v1.24+</div>
                        </motion.div>

                        {/* Connection 1 */}
                        <motion.div 
                            className="flex-1 relative h-[3px] -mx-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 6.5 }}
                        >
                            <motion.div 
                                className="absolute inset-0 bg-green-500"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 6.5, duration: 0.5 }}
                                style={{ originX: 0 }}
                            />
                        </motion.div>

                        {/* CRI Interface */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 6.0 }}
                            className="w-24 bg-green-600 p-3 rounded-lg border-2 border-green-400 shadow-lg shadow-green-500/20 shrink-0 z-10 relative"
                        >
                            <Repeat size={28} className="text-white mx-auto" />
                            <div className="text-[10px] text-white font-bold mt-1 text-center">CRI</div>
                        </motion.div>

                        {/* Connection 2 (Branching) - CSS Div connections for perfect alignment */}
                        <div className="flex-1 relative self-stretch -mx-2 z-0">
                            {/* 1. Horizontal from CRI to Midpoint */}
                            <motion.div 
                                className="absolute bg-green-500 origin-left"
                                style={{ 
                                    height: '2px', 
                                    left: '-10px', 
                                    top: '50%', 
                                    width: 'calc(50% + 10px)'
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 7.5, duration: 0.4 }}
                            />

                            {/* 2. Vertical Bar at Midpoint - Connects 28% to 72% */}
                            <motion.div 
                                className="absolute bg-green-500 origin-top"
                                style={{ 
                                    width: '2px', 
                                    left: '50%', 
                                    top: '28%', 
                                    height: '44%' // Spans from 28% to 72% (difference is 44%)
                                }}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 7.9, duration: 0.4 }}
                            />

                            {/* 3. Horizontal to Containerd (Top) */}
                            <motion.div 
                                className="absolute bg-green-500 origin-left"
                                style={{ 
                                    height: '2px', 
                                    left: '50%', 
                                    top: '28%', 
                                    right: '-10px'
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 8.3, duration: 0.4 }}
                            />

                            {/* 4. Horizontal to CRI-O (Bottom) */}
                            <motion.div 
                                className="absolute bg-green-500 origin-left"
                                style={{ 
                                    height: '2px', 
                                    left: '50%', 
                                    top: '72%', 
                                    right: '-10px'
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 8.3, duration: 0.4 }}
                            />
                        </div>

                        {/* Runtimes */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 8.5 }}
                            className="w-48 space-y-8 shrink-0 py-2 z-10 relative"
                        >
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-green-900/80 p-3 rounded-lg border border-green-500 text-green-200 text-sm font-bold flex items-center gap-3 backdrop-blur-sm relative"
                            >
                                <div className="bg-green-500 p-1 rounded"><Cpu size={16} className="text-black"/></div>
                                containerd
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-orange-900/80 p-3 rounded-lg border border-orange-500 text-orange-200 text-sm font-bold flex items-center gap-3 backdrop-blur-sm relative"
                            >
                                <div className="bg-orange-500 p-1 rounded"><Cpu size={16} className="text-black"/></div>
                                CRI-O
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* CLI Tools Floating Badge (Centered Absolute) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 9.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                        <div className="flex gap-2 bg-slate-900/90 p-2 rounded-full border border-slate-600 shadow-xl">
                            <div className="px-2 py-1 bg-slate-700 rounded text-[10px] text-gray-300 font-mono">ctr</div>
                            <div className="px-2 py-1 bg-blue-600 rounded text-[10px] text-white font-mono">nerdctl</div>
                            <div className="px-2 py-1 bg-purple-600 rounded text-[10px] text-white font-mono">crictl</div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={nextStep} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Open the Captain's Log <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}


        {/* Step 12: ETCD - Interactive & Clean */}
        {step === 12 && (
            <ETCDInteractivePage onNext={nextStep} onPrev={prevStep} />
        )}

        {/* Step 13: How etcd Powers Kubernetes */}
        {step === 13 && (
            <ETCDPowersK8sPage key="step13" onNext={nextStep} onPrev={prevStep} />
        )}
        
        {/* Step 14: ETCD In Action (Old Step 12) */}
        {step === 14 && (
            <motion.div 
                key="step14"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-8 w-full max-w-6xl"
            >
                <h2 className="text-4xl font-bold text-white">ETCD in Action: Kubernetes' Brain</h2>
                <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
                    Watch how `kubectl` commands interact with ETCD through the API Server.
                </p>

                {/* Animated kubectl -> API -> ETCD flow */}
                <div className="relative h-[500px] bg-gradient-to-br from-indigo-950 to-purple-950/50 rounded-2xl border border-indigo-500/30 p-8 overflow-hidden">
                    
                    {/* Developer/User */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="absolute top-8 left-[5%]"
                    >
                        <div className="bg-blue-600 p-4 rounded-full">
                            <Globe size={32} className="text-white" />
                        </div>
                        <div className="text-xs text-blue-300 mt-2 text-center font-bold">Developer</div>
                    </motion.div>

                    {/* kubectl Command */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="absolute top-[120px] left-[5%] bg-black/80 p-3 rounded-lg border border-green-500 font-mono text-xs text-green-400"
                    >
                        $ kubectl get pods
                    </motion.div>

                    {/* API Server */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2, type: 'spring' }}
                        className="absolute top-[50px] left-1/2 -translate-x-1/2"
                    >
                        <div className="bg-purple-600 p-6 rounded-xl border-2 border-purple-400 shadow-2xl">
                            <Server size={40} className="text-white mb-2" />
                            <div className="text-white font-bold text-center">API Server</div>
                            <div className="text-xs text-purple-200 text-center">Port 6443</div>
                        </div>
                    </motion.div>

                    {/* ETCD */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.6, type: 'spring' }}
                        className="absolute top-[50px] right-[10%]"
                    >
                        <div className="bg-emerald-600 p-6 rounded-xl border-2 border-emerald-400 shadow-2xl">
                            <Database size={40} className="text-white mb-2" />
                            <div className="text-white font-bold text-center">ETCD</div>
                            <div className="text-xs text-emerald-200 text-center">Port 2379</div>
                        </div>
                    </motion.div>

                    {/* Animated Request Line */}
                    <motion.svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <motion.path
                            d="M 130 110 L 420 110"
                            stroke="#a855f7"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="8 4"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1, strokeDashoffset: -24 }}
                            transition={{ 
                                pathLength: { delay: 1.5, duration: 0.8 },
                                strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                            }}
                        />
                        <motion.path
                            d="M 520 110 L 750 110"
                            stroke="#10b981"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="8 4"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1, strokeDashoffset: -24 }}
                            transition={{ 
                                pathLength: { delay: 2, duration: 0.8 },
                                strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                            }}
                        />
                    </motion.svg>

                    {/* Request Packet Animation */}
                    <motion.div
                        initial={{ left: "13%", opacity: 0 }}
                        animate={{ 
                            left: ["13%", "42%"], 
                            opacity: [0, 1, 1, 0] 
                        }}
                        transition={{ 
                            duration: 1.5, 
                            delay: 2, 
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                        className="absolute top-[105px] w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]"
                    />
                    <motion.div
                        initial={{ left: "52%", opacity: 0 }}
                        animate={{ 
                            left: ["52%", "75%"], 
                            opacity: [0, 1, 1, 0] 
                        }}
                        transition={{ 
                            duration: 1.5, 
                            delay: 2.5, 
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                        className="absolute top-[105px] w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]"
                    />

                    {/* ETCD Registry Structure */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.8 }}
                        className="absolute bottom-8 left-[10%] right-[10%] bg-black/80 backdrop-blur p-6 rounded-xl border border-emerald-500/50"
                    >
                        <div className="flex items-center gap-2 text-yellow-400 mb-3">
                            <FileJson size={20} /> /registry (Kubernetes Data)
                        </div>
                        <div className="grid grid-cols-4 gap-4 font-mono text-xs">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 3.2, type: 'spring' }}
                                className="bg-blue-900/50 p-3 rounded border border-blue-500"
                            >
                                <div className="text-blue-400 mb-1">📂 pods/</div>
                                <div className="text-gray-400 text-[10px]">default/nginx</div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 3.4, type: 'spring' }}
                                className="bg-purple-900/50 p-3 rounded border border-purple-500"
                            >
                                <div className="text-purple-400 mb-1">📂 deployments/</div>
                                <div className="text-gray-400 text-[10px]">frontend</div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 3.6, type: 'spring' }}
                                className="bg-orange-900/50 p-3 rounded border border-orange-500"
                            >
                                <div className="text-orange-400 mb-1">📂 services/</div>
                                <div className="text-gray-400 text-[10px]">api-svc</div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 3.8, type: 'spring' }}
                                className="bg-red-900/50 p-3 rounded border border-red-500"
                            >
                                <div className="text-red-400 mb-1">🔒 secrets/</div>
                                <div className="text-gray-400 text-[10px]">encrypted</div>
                            </motion.div>
                        </div>

                        {/* Deployment Info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 4.2 }}
                            className="mt-4 pt-4 border-t border-indigo-700 grid grid-cols-2 gap-4 text-xs"
                        >
                            <div className="bg-indigo-900/40 p-2 rounded">
                                <strong className="text-indigo-300">kubeadm:</strong> <span className="text-gray-400">Static Pod in kube-system</span>
                            </div>
                            <div className="bg-indigo-900/40 p-2 rounded">
                                <strong className="text-indigo-300">Manual:</strong> <span className="text-gray-400">Binary + systemd service</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="flex justify-center gap-4 pt-8">
                    <Button onClick={prevStep} variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Start Your Mission (Pods) <ArrowRight />
                    </Button>
                </div>
            </motion.div>
        )}
        
      </AnimatePresence>
    </div>
  );
};
