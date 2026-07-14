import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import {
  ArrowRight,
  ArrowLeft,
  Ship,
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  GitCompare,
  Zap,
  Layers,
  ArrowDown,
  Undo2,
  CheckCircle,
  XCircle,
  Terminal,
} from 'lucide-react';

interface ReplicaSetsProps {
  onComplete: () => void;
}

interface Pod {
  id: number;
  version: string;
  status: 'running' | 'terminating' | 'starting';
}

const controlLoopSteps = [
  { label: 'Observe', icon: <Eye size={22} />, description: 'Watch the current state of Pods', color: 'text-blue-400', bg: 'bg-blue-500' },
  { label: 'Compare', icon: <GitCompare size={22} />, description: 'Compare current vs desired count', color: 'text-amber-400', bg: 'bg-amber-500' },
  { label: 'Act', icon: <Zap size={22} />, description: 'Create or delete Pods to match desired', color: 'text-green-400', bg: 'bg-green-500' },
];

const hierarchyLevels = [
  {
    id: 'deployment',
    label: 'Deployment',
    color: 'border-purple-500 bg-purple-500/15',
    activeColor: 'border-purple-400 bg-purple-500/30',
    explanation: 'A Deployment is the recommended way to manage Pods. It provides declarative updates, rollback history, and manages ReplicaSets under the hood. You describe your desired state, and the Deployment controller changes the actual state at a controlled rate.',
  },
  {
    id: 'replicaset',
    label: 'ReplicaSet',
    color: 'border-mcb-500 bg-mcb-500/15',
    activeColor: 'border-mcb-400 bg-mcb-500/30',
    explanation: 'A ReplicaSet ensures that a specified number of Pod replicas are running at any given time. While you can use them directly, Deployments are preferred because they manage ReplicaSets and provide update orchestration.',
  },
  {
    id: 'pod',
    label: 'Pod',
    color: 'border-emerald-500 bg-emerald-500/15',
    activeColor: 'border-emerald-400 bg-emerald-500/30',
    explanation: 'Pods are the actual running workloads. Each Pod gets its own IP and runs one or more containers. ReplicaSets create and destroy Pods to maintain the desired count.',
  },
];

const revisionHistory = [
  { name: 'RS-v1', replicas: 0, image: 'nginx:1.18', active: false },
  { name: 'RS-v2', replicas: 0, image: 'nginx:1.20', active: false },
  { name: 'RS-v3', replicas: 3, image: 'nginx:1.25', active: true },
];

export const ReplicaSets: React.FC<ReplicaSetsProps> = ({ onComplete }) => {
  const [scene, setScene] = useState(0);

  // Scene 0 state
  const [singlePodDead, setSinglePodDead] = useState(false);
  const [multiPodDead, setMultiPodDead] = useState(false);

  // Scene 1 state
  const [activeStep, setActiveStep] = useState(0);

  // Scene 2 state
  const [replicas, setReplicas] = useState(3);
  const [pods, setPods] = useState<Pod[]>([
    { id: 1, version: 'v1', status: 'running' },
    { id: 2, version: 'v1', status: 'running' },
    { id: 3, version: 'v1', status: 'running' },
  ]);
  const [nextId, setNextId] = useState(4);

  // Scene 3 state
  const [updateStarted, setUpdateStarted] = useState(false);
  const [updatePods, setUpdatePods] = useState<Pod[]>([
    { id: 101, version: 'v1', status: 'running' },
    { id: 102, version: 'v1', status: 'running' },
    { id: 103, version: 'v1', status: 'running' },
    { id: 104, version: 'v1', status: 'running' },
  ]);
  const [, setUpdateNextId] = useState(105);
  const [updateComplete, setUpdateComplete] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  // Scene 4 state
  const [activeHierarchy, setActiveHierarchy] = useState<string | null>(null);

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));

  // Scene 1: cycle control loop
  useEffect(() => {
    if (scene !== 1) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [scene]);

  // Scene 0: auto-trigger failure demo
  useEffect(() => {
    if (scene !== 0) return;
    setSinglePodDead(false);
    setMultiPodDead(false);
    const t1 = setTimeout(() => setSinglePodDead(true), 2000);
    const t2 = setTimeout(() => setMultiPodDead(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [scene]);

  // Scene 2: reconciliation loop
  useEffect(() => {
    if (scene !== 2) return;
    const runningPods = pods.filter(p => p.status === 'running');
    if (runningPods.length < replicas) {
      const timeout = setTimeout(() => {
        setPods(prev => [...prev, { id: nextId, version: 'v1', status: 'running' }]);
        setNextId(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timeout);
    } else if (runningPods.length > replicas) {
      const timeout = setTimeout(() => {
        setPods(prev => {
          const running = prev.filter(p => p.status === 'running');
          const excess = running.slice(replicas);
          const excessIds = new Set(excess.map(p => p.id));
          return prev.filter(p => !excessIds.has(p.id));
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [pods, replicas, nextId, scene]);

  const killPod = (id: number) => {
    setPods(prev => prev.filter(p => p.id !== id));
  };

  // Scene 3: rolling update logic
  const startUpdate = useCallback(() => {
    setUpdateStarted(true);
    setUpdateComplete(false);
    setRollingBack(false);
    setUpdateProgress(0);

    const targetVersion = 'v2';
    let step = 0;
    const totalSteps = 4;

    const performStep = () => {
      step++;
      const currentStep = step;

      // Add new pod first (maxSurge=1)
      setUpdateNextId(prev => {
        const newId = prev;
        setUpdatePods(prevPods => [
          ...prevPods,
          { id: newId, version: targetVersion, status: 'starting' },
        ]);

        // After a short delay, mark as running and remove an old pod
        setTimeout(() => {
          setUpdatePods(prevPods => {
            const updated = prevPods.map(p =>
              p.id === newId ? { ...p, status: 'running' as const } : p
            );
            // Remove the first v1 pod
            const v1Index = updated.findIndex(p => p.version === 'v1');
            if (v1Index !== -1) {
              return updated.filter((_, i) => i !== v1Index);
            }
            return updated;
          });
          setUpdateProgress(Math.round((currentStep / totalSteps) * 100));

          if (currentStep < totalSteps) {
            setTimeout(performStep, 1000);
          } else {
            setUpdateComplete(true);
            setUpdateStarted(false);
          }
        }, 700);

        return prev + 1;
      });
    };

    setTimeout(performStep, 500);
  }, []);

  const startRollback = useCallback(() => {
    setRollingBack(true);
    setUpdateComplete(false);
    setUpdateProgress(100);

    let step = 0;
    const totalSteps = 4;

    const performStep = () => {
      step++;
      const currentStep = step;

      setUpdateNextId(prev => {
        const newId = prev;
        setUpdatePods(prevPods => [
          ...prevPods,
          { id: newId, version: 'v1', status: 'starting' },
        ]);

        setTimeout(() => {
          setUpdatePods(prevPods => {
            const updated = prevPods.map(p =>
              p.id === newId ? { ...p, status: 'running' as const } : p
            );
            const v2Index = updated.findIndex(p => p.version === 'v2');
            if (v2Index !== -1) {
              return updated.filter((_, i) => i !== v2Index);
            }
            return updated;
          });
          setUpdateProgress(Math.round(100 - (currentStep / totalSteps) * 100));

          if (currentStep < totalSteps) {
            setTimeout(performStep, 1000);
          } else {
            setRollingBack(false);
            setUpdateProgress(0);
          }
        }, 700);

        return prev + 1;
      });
    };

    setTimeout(performStep, 500);
  }, []);

  return (
    <div className="min-h-[600px] flex flex-col items-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">

      {/* Scene 0: Why Replicas? */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 w-full">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-mcb-50"
          >
            Single Point of Failure vs High Availability
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-mcb-200 max-w-3xl mx-auto"
          >
            What happens when your only Pod crashes? With replicas, your app stays up even when individual Pods fail.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 w-full">
            {/* LEFT: Single pod */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
              className="bg-mcb-950/50 rounded-2xl border-2 border-red-800/50 p-6 space-y-6 relative overflow-hidden"
            >
              <h3 className="text-xl font-bold text-red-300">Single Pod</h3>

              <div className="relative h-48 flex flex-col items-center justify-center gap-4">
                {/* SVG traffic line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 200">
                  <motion.line
                    x1="150" y1="10" x2="150" y2="80"
                    stroke={singlePodDead ? '#ef4444' : '#4ade80'}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: singlePodDead ? 0 : -20 }}
                    transition={{ duration: 1, repeat: singlePodDead ? 0 : Infinity, ease: 'linear' }}
                  />
                </svg>

                <div className="text-xs text-mcb-400 font-mono z-10">Traffic</div>

                <AnimatePresence mode="wait">
                  {!singlePodDead ? (
                    <motion.div
                      key="alive"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0, rotate: 15 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      className="w-20 h-20 bg-mcb-600/20 border-2 border-mcb-500 rounded-xl flex flex-col items-center justify-center z-10"
                    >
                      <Ship size={32} className="text-mcb-400" />
                      <span className="text-[10px] text-mcb-300 font-mono mt-1">pod-1</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dead"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 bg-red-900/30 border-2 border-red-500/50 rounded-xl flex flex-col items-center justify-center z-10"
                    >
                      <XCircle size={32} className="text-red-500" />
                      <span className="text-[10px] text-red-400 font-mono mt-1">crashed</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{
                    backgroundColor: singlePodDead ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)',
                    borderColor: singlePodDead ? 'rgba(239,68,68,0.5)' : 'rgba(74,222,128,0.5)',
                  }}
                  className="px-4 py-2 rounded-lg border text-sm font-bold z-10"
                >
                  <span className={singlePodDead ? 'text-red-400' : 'text-green-400'}>
                    {singlePodDead ? 'SERVICE DOWN' : 'Serving'}
                  </span>
                </motion.div>
              </div>

              {singlePodDead && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-300 text-sm"
                >
                  Users see errors. Revenue lost. SLA breached.
                </motion.p>
              )}
            </motion.div>

            {/* RIGHT: Multiple replicas */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 120, damping: 20 }}
              className="bg-mcb-950/50 rounded-2xl border-2 border-green-800/50 p-6 space-y-6 relative overflow-hidden"
            >
              <h3 className="text-xl font-bold text-green-300">Multiple Replicas</h3>

              <div className="relative h-48 flex flex-col items-center justify-center gap-4">
                {/* SVG traffic lines to surviving pods */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 200">
                  {[80, 150, 220].map((x, i) => (
                    <motion.line
                      key={i}
                      x1="150" y1="10" x2={x} y2="85"
                      stroke={multiPodDead && i === 0 ? '#ef4444' : '#4ade80'}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{
                        strokeDashoffset: multiPodDead && i === 0 ? 0 : -20,
                        opacity: multiPodDead && i === 0 ? 0.3 : 1,
                      }}
                      transition={{ duration: 1, repeat: (multiPodDead && i === 0) ? 0 : Infinity, ease: 'linear' }}
                    />
                  ))}
                </svg>

                <div className="text-xs text-mcb-400 font-mono z-10">Traffic</div>

                <div className="flex gap-3 z-10">
                  {[1, 2, 3].map((podNum) => (
                    <AnimatePresence key={podNum} mode="wait">
                      {multiPodDead && podNum === 1 ? (
                        <motion.div
                          key="dead"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.5 }}
                          className="w-16 h-16 bg-red-900/30 border-2 border-red-500/30 rounded-xl flex flex-col items-center justify-center"
                        >
                          <XCircle size={20} className="text-red-500" />
                          <span className="text-[8px] text-red-400 font-mono">down</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="alive"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: podNum * 0.1, type: 'spring', stiffness: 120, damping: 20 }}
                          className="w-16 h-16 bg-mcb-600/20 border-2 border-mcb-500 rounded-xl flex flex-col items-center justify-center"
                        >
                          <Ship size={20} className="text-mcb-400" />
                          <span className="text-[8px] text-mcb-300 font-mono">pod-{podNum}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                <motion.div
                  className="px-4 py-2 rounded-lg border text-sm font-bold z-10 bg-green-500/20 border-green-500/50"
                >
                  <span className="text-green-400">
                    {multiPodDead ? 'Still Serving (2/3 pods)' : 'Serving'}
                  </span>
                </motion.div>
              </div>

              {multiPodDead && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-300 text-sm"
                >
                  Traffic reroutes. Users notice nothing. ReplicaSet replaces the pod.
                </motion.p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
              See How It Works <ArrowRight />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Scene 1: Desired State Model */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">The Desired State Model</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Kubernetes doesn't follow imperative commands. You declare <strong className="text-mcb-50">WHAT</strong> you want, and Kubernetes handles <strong className="text-mcb-50">HOW</strong>.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Control Loop Diagram */}
            <div className="relative h-[380px] bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 flex items-center justify-center p-6">
              <div className="relative w-64 h-64">
                {/* Circular track */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
                  <circle cx="130" cy="130" r="100" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3" />
                  {/* Rotating highlight arc */}
                  <motion.circle
                    cx="130" cy="130" r="100"
                    fill="none"
                    stroke="rgba(99,102,241,0.6)"
                    strokeWidth="4"
                    strokeDasharray="70 560"
                    strokeLinecap="round"
                    animate={{ rotate: [activeStep * 120, (activeStep + 1) * 120] }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    style={{ transformOrigin: '130px 130px' }}
                  />
                </svg>

                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center"
                  >
                    <RefreshCw size={24} className="text-mcb-400 mx-auto mb-1" />
                    <span className="text-xs text-mcb-400 font-bold">Control Loop</span>
                  </motion.div>
                </div>

                {/* Steps positioned around the circle */}
                {controlLoopSteps.map((step, index) => {
                  const angle = (index * 120 - 90) * (Math.PI / 180);
                  const x = 130 + 100 * Math.cos(angle) - 40;
                  const y = 130 + 100 * Math.sin(angle) - 30;
                  const isActive = activeStep === index;

                  return (
                    <motion.div
                      key={step.label}
                      animate={{
                        scale: isActive ? 1.1 : 0.9,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="absolute flex flex-col items-center gap-1 w-20"
                      style={{ left: x, top: y }}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? step.bg + '/30' : 'bg-mcb-800/50'} border ${isActive ? 'border-white/30' : 'border-mcb-700'}`}>
                        <span className={isActive ? step.color : 'text-mcb-500'}>{step.icon}</span>
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-mcb-50' : 'text-mcb-500'}`}>{step.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right side: counts + explanation */}
            <div className="space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 space-y-4"
              >
                <h3 className="text-lg font-bold text-mcb-50">Reconciliation Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-mcb-950/50 p-4 rounded-lg border border-mcb-800 text-center">
                    <div className="text-3xl font-extrabold text-amber-400">2</div>
                    <div className="text-xs text-mcb-400 mt-1">Current</div>
                  </div>
                  <div className="bg-mcb-950/50 p-4 rounded-lg border border-mcb-800 text-center">
                    <div className="text-3xl font-extrabold text-green-400">3</div>
                    <div className="text-xs text-mcb-400 mt-1">Desired</div>
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/30"
                >
                  Controller detecting drift... Creating 1 new Pod
                </motion.div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-mcb-900/30 p-5 rounded-xl border border-mcb-500/30"
                >
                  <h4 className={`text-lg font-bold ${controlLoopSteps[activeStep].color} mb-2`}>
                    {controlLoopSteps[activeStep].label}
                  </h4>
                  <p className="text-mcb-200 text-sm leading-relaxed">
                    {controlLoopSteps[activeStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="bg-mcb-900/20 p-4 rounded-lg border border-mcb-500/30 text-center">
                <p className="text-mcb-300 text-sm italic">
                  "You declare <strong className="text-mcb-50">WHAT</strong>, Kubernetes handles <strong className="text-mcb-50">HOW</strong>"
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Try Scaling <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 2: Interactive Scaling */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Interactive Scaling</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Change the desired replica count and watch the controller reconcile. Kill pods to see self-healing in action.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Controls */}
            <div className="space-y-6">
              <div className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 space-y-4">
                <h3 className="text-xl font-bold text-mcb-50">Desired State</h3>
                <p className="text-mcb-200 text-sm">
                  Set the number of replicas. Kubernetes ensures exactly this many pods are running.
                </p>

                <div className="flex items-center justify-center gap-4">
                  <span className="text-mcb-300 text-sm">Replicas:</span>
                  <div className="flex items-center gap-2 bg-mcb-950 rounded-lg p-1 border border-mcb-800">
                    <button
                      onClick={() => setReplicas(Math.max(0, replicas - 1))}
                      className="p-2 hover:bg-mcb-800 rounded text-mcb-300 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-mono text-2xl font-bold text-mcb-50">{replicas}</span>
                    <button
                      onClick={() => setReplicas(Math.min(8, replicas + 1))}
                      className="p-2 hover:bg-mcb-800 rounded text-mcb-300 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Terminal output */}
                <div className="bg-black/40 p-4 rounded-lg border border-mcb-800 font-mono text-sm text-left">
                  <div className="text-mcb-400 mb-2 pb-1 border-b border-white/10 flex items-center gap-2 text-xs">
                    <Terminal size={12} /> Terminal
                  </div>
                  <p className="text-mcb-50">$ kubectl scale --replicas={replicas} deployment/my-app</p>
                  <motion.p
                    key={replicas}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-green-400"
                  >
                    deployment.apps/my-app scaled
                  </motion.p>
                </div>

                {/* Status panel */}
                <div className="bg-mcb-950/50 p-4 rounded-lg border border-mcb-800 space-y-2">
                  <h4 className="text-xs text-mcb-400 uppercase tracking-wider font-bold">Status</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-bold text-mcb-400">{replicas}</div>
                      <div className="text-[10px] text-mcb-500">Desired</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-mcb-50">{pods.filter(p => p.status === 'running').length}</div>
                      <div className="text-[10px] text-mcb-500">Current</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-400">{pods.filter(p => p.status === 'running').length}</div>
                      <div className="text-[10px] text-mcb-500">Ready</div>
                    </div>
                  </div>
                  <div className={`text-xs text-center font-bold py-1 rounded ${pods.filter(p => p.status === 'running').length === replicas ? 'text-green-400 bg-green-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                    {pods.filter(p => p.status === 'running').length === replicas ? 'Healthy' : 'Reconciling...'}
                  </div>
                </div>
              </div>

              <div className="bg-mcb-900/20 p-4 rounded-lg border border-mcb-500/30 text-mcb-200 text-sm">
                <p><strong>Try this:</strong> Kill a pod by clicking the trash icon. Watch it come back automatically!</p>
              </div>
            </div>

            {/* Pod grid */}
            <div className="min-h-[400px] bg-mcb-950/50 rounded-2xl border border-mcb-800/50 p-6">
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {pods.map((pod) => (
                    <motion.div
                      key={pod.id}
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      className="bg-mcb-600/20 border-2 border-mcb-500 rounded-xl p-4 flex flex-col items-center gap-2 relative group"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => killPod(pod.id)}
                          className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-mcb-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {/* Health dot */}
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-green-400"
                      />
                      <Ship size={36} className="text-mcb-400" />
                      <span className="font-mono text-xs text-mcb-300">pod-{pod.id}</span>
                      <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Running</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {pods.length === 0 && replicas > 0 && (
                <div className="flex items-center justify-center h-32 text-mcb-400 animate-pulse">
                  Deploying...
                </div>
              )}

              {pods.length === 0 && replicas === 0 && (
                <div className="flex items-center justify-center h-32 text-mcb-500 text-sm">
                  No pods running. Increase replicas to deploy.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Rolling Updates <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 3: Rolling Updates */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Rolling Updates</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Kubernetes updates your Pods incrementally, ensuring zero downtime by replacing old versions with new ones one at a time.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Pod visualization */}
            <div className="bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-mcb-50">Live Pods</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> v1
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-green-500 inline-block" /> v2
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {updatePods.map((pod) => (
                    <motion.div
                      key={pod.id}
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: pod.status === 'terminating' ? 0.4 : 1 }}
                      exit={{ scale: 0, opacity: 0, y: 20 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      className={`rounded-xl p-4 flex flex-col items-center gap-2 border-2 ${
                        pod.version === 'v1'
                          ? 'bg-blue-500/10 border-blue-500/50'
                          : 'bg-green-500/10 border-green-500/50'
                      }`}
                    >
                      <Ship size={28} className={pod.version === 'v1' ? 'text-blue-400' : 'text-green-400'} />
                      <span className="font-mono text-[10px] text-mcb-300">pod-{pod.id}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        pod.version === 'v1' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {pod.version} - {pod.status === 'starting' ? 'Starting' : 'Running'}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-mcb-400">
                  <span>Update Progress</span>
                  <span>{updateProgress}%</span>
                </div>
                <div className="w-full h-2 bg-mcb-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-mcb-500 to-green-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${updateProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Controls + config */}
            <div className="space-y-6 text-left">
              {/* Strategy config */}
              <div className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 space-y-4">
                <h3 className="text-lg font-bold text-mcb-50">Update Strategy</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-mcb-950/50 p-3 rounded-lg border border-mcb-800">
                    <div className="text-xs text-mcb-400 mb-1">maxSurge</div>
                    <div className="text-xl font-bold text-mcb-300">1</div>
                    <div className="text-[10px] text-mcb-500 mt-1">Extra pods during update</div>
                  </div>
                  <div className="bg-mcb-950/50 p-3 rounded-lg border border-mcb-800">
                    <div className="text-xs text-mcb-400 mb-1">maxUnavailable</div>
                    <div className="text-xl font-bold text-mcb-300">0</div>
                    <div className="text-[10px] text-mcb-500 mt-1">Pods that can be down</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!updateComplete && !rollingBack && (
                    <Button
                      onClick={startUpdate}
                      disabled={updateStarted}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {updateStarted ? (
                        <><RefreshCw size={16} className="animate-spin" /> Updating...</>
                      ) : (
                        <><ArrowRight size={16} /> Start Update (v1 → v2)</>
                      )}
                    </Button>
                  )}

                  <AnimatePresence>
                    {updateComplete && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/30 text-sm">
                          <CheckCircle size={16} /> Update complete! All pods on v2.
                        </div>
                        <Button
                          onClick={startRollback}
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2 border-amber-500/50 text-amber-300 hover:border-amber-400"
                        >
                          <Undo2 size={16} /> Rollback to v1
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {rollingBack && (
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/30 text-sm">
                      <RefreshCw size={16} className="animate-spin" /> Rolling back to v1...
                    </div>
                  )}
                </div>
              </div>

              {/* Process explanation */}
              <div className="bg-mcb-900/20 p-4 rounded-lg border border-mcb-500/30 text-sm text-mcb-200 space-y-2">
                <h4 className="font-bold text-mcb-300">How Rolling Updates Work</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-mcb-300">
                  <li>A new Pod (v2) is created alongside existing v1 Pods</li>
                  <li>Once the new Pod is ready, an old v1 Pod is terminated</li>
                  <li>This repeats until all Pods run the new version</li>
                  <li>At no point are zero Pods available (zero downtime)</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: The Big Picture <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 4: Deployment → ReplicaSet → Pod Hierarchy */}
      {scene === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Deployment → ReplicaSet → Pod</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Click each level to understand the hierarchy. Deployments manage ReplicaSets, which manage Pods.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Architecture diagram */}
            <div className="bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-8 space-y-4">
              {/* Deployment */}
              <motion.button
                onClick={() => setActiveHierarchy(activeHierarchy === 'deployment' ? null : 'deployment')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`w-full p-4 rounded-xl border-2 cursor-pointer transition-colors text-left ${
                  activeHierarchy === 'deployment' ? hierarchyLevels[0].activeColor : hierarchyLevels[0].color
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers size={24} className="text-purple-400" />
                  <div>
                    <div className="font-bold text-mcb-50">Deployment</div>
                    <div className="text-xs text-mcb-400 font-mono">my-app</div>
                  </div>
                </div>
              </motion.button>

              <div className="flex justify-center">
                <ArrowDown size={20} className="text-mcb-500" />
              </div>

              {/* ReplicaSet */}
              <motion.button
                onClick={() => setActiveHierarchy(activeHierarchy === 'replicaset' ? null : 'replicaset')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`w-full p-4 rounded-xl border-2 cursor-pointer transition-colors text-left ${
                  activeHierarchy === 'replicaset' ? hierarchyLevels[1].activeColor : hierarchyLevels[1].color
                }`}
              >
                <div className="flex items-center gap-3">
                  <RefreshCw size={24} className="text-mcb-400" />
                  <div>
                    <div className="font-bold text-mcb-50">ReplicaSet</div>
                    <div className="text-xs text-mcb-400 font-mono">my-app-7d9f8b6c5</div>
                  </div>
                </div>
              </motion.button>

              <div className="flex justify-center">
                <ArrowDown size={20} className="text-mcb-500" />
              </div>

              {/* Pods row */}
              <motion.button
                onClick={() => setActiveHierarchy(activeHierarchy === 'pod' ? null : 'pod')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`w-full p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  activeHierarchy === 'pod' ? hierarchyLevels[2].activeColor : hierarchyLevels[2].color
                }`}
              >
                <div className="flex items-center justify-center gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <Ship size={24} className="text-emerald-400" />
                      <span className="text-[10px] text-mcb-400 font-mono">pod-{i}</span>
                    </div>
                  ))}
                </div>
              </motion.button>

              {/* Revision history cards */}
              <div className="pt-4 border-t border-mcb-800 mt-4">
                <h4 className="text-xs text-mcb-400 uppercase tracking-wider font-bold mb-3">Revision History</h4>
                <div className="flex gap-2">
                  {revisionHistory.map((rev, index) => (
                    <motion.div
                      key={rev.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      className={`flex-1 p-3 rounded-lg border text-center text-xs ${
                        rev.active
                          ? 'bg-mcb-500/20 border-mcb-400 text-mcb-50'
                          : 'bg-mcb-900/30 border-mcb-800 text-mcb-500'
                      }`}
                    >
                      <div className="font-bold">{rev.name}</div>
                      <div className="font-mono mt-1">{rev.image}</div>
                      <div className="mt-1">
                        {rev.active ? (
                          <span className="text-green-400">{rev.replicas} replicas</span>
                        ) : (
                          <span>scaled to {rev.replicas}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: explanation + YAML */}
            <div className="space-y-6 text-left">
              <AnimatePresence mode="wait">
                {activeHierarchy && (
                  <motion.div
                    key={activeHierarchy}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-500/30"
                  >
                    <h3 className="text-xl font-bold text-mcb-50 mb-2">
                      {hierarchyLevels.find(h => h.id === activeHierarchy)?.label}
                    </h3>
                    <p className="text-mcb-200 text-sm leading-relaxed">
                      {hierarchyLevels.find(h => h.id === activeHierarchy)?.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!activeHierarchy && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 text-mcb-300 text-sm">
                  Click on any level in the hierarchy to learn more about it.
                </motion.div>
              )}

              {/* YAML manifest */}
              <div className="bg-black/40 rounded-xl border border-mcb-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-mcb-800 bg-mcb-900/50">
                  <span className="text-xs text-mcb-400 font-mono">deployment.yaml</span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                </div>
                <div className="p-4 font-mono text-xs text-left space-y-0 leading-relaxed">
                  <div><span className="text-mcb-400">apiVersion:</span> <span className="text-mcb-50">apps/v1</span></div>
                  <div><span className="text-mcb-400">kind:</span> <span className="text-mcb-50">Deployment</span></div>
                  <div><span className="text-mcb-400">metadata:</span></div>
                  <div><span className="text-mcb-400">  name:</span> <span className="text-mcb-50">my-app</span></div>
                  <div><span className="text-mcb-400">spec:</span></div>
                  <div className="bg-amber-500/10 rounded px-1 border-l-2 border-amber-400">
                    <span className="text-mcb-400">  replicas:</span> <span className="text-amber-300 font-bold">3</span>
                  </div>
                  <div className="bg-blue-500/10 rounded px-1 border-l-2 border-blue-400">
                    <span className="text-mcb-400">  selector:</span>
                  </div>
                  <div className="bg-blue-500/10 rounded px-1 border-l-2 border-blue-400">
                    <span className="text-mcb-400">    matchLabels:</span>
                  </div>
                  <div className="bg-blue-500/10 rounded px-1 border-l-2 border-blue-400">
                    <span className="text-mcb-400">      app:</span> <span className="text-blue-300 font-bold">my-app</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">  template:</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">    metadata:</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">      labels:</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">        app:</span> <span className="text-green-300 font-bold">my-app</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">    spec:</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">      containers:</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">      - name:</span> <span className="text-green-300">web</span>
                  </div>
                  <div className="bg-green-500/10 rounded px-1 border-l-2 border-green-400">
                    <span className="text-mcb-400">        image:</span> <span className="text-green-300">nginx:1.25</span>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-mcb-800 flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1 text-amber-300"><span className="w-2 h-2 rounded bg-amber-400 inline-block" /> replicas</span>
                  <span className="flex items-center gap-1 text-blue-300"><span className="w-2 h-2 rounded bg-blue-400 inline-block" /> selector</span>
                  <span className="flex items-center gap-1 text-green-300"><span className="w-2 h-2 rounded bg-green-400 inline-block" /> template</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              How do they talk? (Services) <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
