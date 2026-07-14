import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import {
  ArrowRight,
  ArrowLeft,
  Server,
  Cpu,
  MemoryStick,
  Network,
  Box,
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Zap,
  Shield,
} from 'lucide-react';

interface NodesProps {
  onComplete: () => void;
}

const nodeFacts = [
  { label: 'Physical or Virtual Machine', color: 'bg-blue-500/20 border-blue-500/40 text-blue-200' },
  { label: 'Runs kubelet agent', color: 'bg-green-500/20 border-green-500/40 text-green-200' },
  { label: 'Has CPU, Memory, Storage', color: 'bg-purple-500/20 border-purple-500/40 text-purple-200' },
  { label: 'Can host many Pods', color: 'bg-amber-500/20 border-amber-500/40 text-amber-200' },
];

interface NodeComponent {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  description: string;
  detail: string;
}

const nodeComponents: NodeComponent[] = [
  {
    id: 'kubelet',
    label: 'kubelet',
    icon: <Shield size={28} />,
    color: 'bg-blue-600/30',
    borderColor: 'border-blue-400',
    description: 'The Node Agent',
    detail:
      'The kubelet is the primary agent on each node. It receives PodSpecs from the API server and ensures the containers described in those specs are running and healthy. It reports node status back to the control plane every 10 seconds.',
  },
  {
    id: 'kube-proxy',
    label: 'kube-proxy',
    icon: <Network size={28} />,
    color: 'bg-emerald-600/30',
    borderColor: 'border-emerald-400',
    description: 'Network Proxy',
    detail:
      'kube-proxy maintains network rules on nodes. These rules allow network communication to Pods from inside or outside the cluster. It implements the Service abstraction by managing iptables or IPVS rules to route traffic to the correct Pod endpoints.',
  },
  {
    id: 'runtime',
    label: 'containerd',
    icon: <Box size={28} />,
    color: 'bg-violet-600/30',
    borderColor: 'border-violet-400',
    description: 'Container Runtime',
    detail:
      'The container runtime is the software responsible for running containers. Kubernetes supports runtimes through the Container Runtime Interface (CRI). containerd is the most common runtime, pulling images from registries, managing container lifecycle, and allocating resources.',
  },
];

interface SchedulerNode {
  id: number;
  name: string;
  cpuTotal: number;
  cpuUsed: number;
  memTotal: number;
  memUsed: number;
  labels: string[];
  taint?: string;
}

const schedulerNodes: SchedulerNode[] = [
  { id: 1, name: 'node-alpha', cpuTotal: 4, cpuUsed: 3.5, memTotal: 8, memUsed: 7, labels: ['zone=us-east'], taint: 'gpu=true:NoSchedule' },
  { id: 2, name: 'node-beta', cpuTotal: 8, cpuUsed: 2, memTotal: 16, memUsed: 4, labels: ['zone=us-east', 'tier=frontend'] },
  { id: 3, name: 'node-gamma', cpuTotal: 8, cpuUsed: 5, memTotal: 16, memUsed: 10, labels: ['zone=us-west', 'tier=frontend'] },
];

const newPodRequirements = { cpu: 1, mem: 2, label: 'tier=frontend' };

export const Nodes: React.FC<NodesProps> = ({ onComplete }) => {
  const [scene, setScene] = useState(0);

  // Scene 1 state
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // Scene 2 state
  const [allocatedPods, setAllocatedPods] = useState<{ id: number; cpu: number; mem: number }[]>([]);
  const [nextPodId, setNextPodId] = useState(1);
  const totalCpu = 8;
  const totalMem = 16;
  const usedCpu = allocatedPods.reduce((sum, p) => sum + p.cpu, 0);
  const usedMem = allocatedPods.reduce((sum, p) => sum + p.mem, 0);
  const cpuPercent = Math.min((usedCpu / totalCpu) * 100, 100);
  const memPercent = Math.min((usedMem / totalMem) * 100, 100);
  const isOvercommitted = usedCpu > totalCpu || usedMem > totalMem;

  // Scene 3 state
  const [schedulingPhase, setSchedulingPhase] = useState<'idle' | 'filtering' | 'scoring' | 'placed'>('idle');
  const [filterResults, setFilterResults] = useState<Record<number, 'pass' | 'fail' | null>>({ 1: null, 2: null, 3: null });
  const [scoreResults, setScoreResults] = useState<Record<number, number | null>>({ 1: null, 2: null, 3: null });
  const [placedNode, setPlacedNode] = useState<number | null>(null);

  // Scene 4 state
  const [failureNodes, setFailureNodes] = useState<{ id: number; status: 'Ready' | 'NotReady' | 'Recovered'; pods: number[] }[]>([
    { id: 1, status: 'Ready', pods: [1, 2] },
    { id: 2, status: 'Ready', pods: [3, 4] },
    { id: 3, status: 'Ready', pods: [5, 6] },
  ]);
  const [evictedPods, setEvictedPods] = useState<number[]>([]);
  const [failedNodeId, setFailedNodeId] = useState<number | null>(null);
  const [recovering, setRecovering] = useState(false);

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));

  // Scene 2: Add pod
  const addPod = () => {
    const cpuCost = [0.5, 1, 1.5, 2][Math.floor(Math.random() * 4)];
    const memCost = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
    setAllocatedPods(prev => [...prev, { id: nextPodId, cpu: cpuCost, mem: memCost }]);
    setNextPodId(prev => prev + 1);
  };

  const resetResources = () => {
    setAllocatedPods([]);
    setNextPodId(1);
  };

  // Scene 3: Scheduling simulation
  const runScheduler = () => {
    setSchedulingPhase('filtering');
    setFilterResults({ 1: null, 2: null, 3: null });
    setScoreResults({ 1: null, 2: null, 3: null });
    setPlacedNode(null);
  };

  useEffect(() => {
    if (schedulingPhase !== 'filtering') return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Filter each node sequentially
    timers.push(
      setTimeout(() => {
        // Node 1: fails - not enough resources and has a taint
        setFilterResults(prev => ({ ...prev, 1: 'fail' }));
      }, 600)
    );
    timers.push(
      setTimeout(() => {
        // Node 2: passes
        setFilterResults(prev => ({ ...prev, 2: 'pass' }));
      }, 1200)
    );
    timers.push(
      setTimeout(() => {
        // Node 3: passes
        setFilterResults(prev => ({ ...prev, 3: 'pass' }));
      }, 1800)
    );
    timers.push(
      setTimeout(() => {
        setSchedulingPhase('scoring');
      }, 2400)
    );

    return () => timers.forEach(clearTimeout);
  }, [schedulingPhase]);

  useEffect(() => {
    if (schedulingPhase !== 'scoring') return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        // Node 2: higher score (more free resources)
        setScoreResults(prev => ({ ...prev, 2: 85 }));
      }, 600)
    );
    timers.push(
      setTimeout(() => {
        // Node 3: lower score
        setScoreResults(prev => ({ ...prev, 3: 52 }));
      }, 1200)
    );
    timers.push(
      setTimeout(() => {
        setPlacedNode(2);
        setSchedulingPhase('placed');
      }, 2000)
    );

    return () => timers.forEach(clearTimeout);
  }, [schedulingPhase]);

  const resetScheduler = () => {
    setSchedulingPhase('idle');
    setFilterResults({ 1: null, 2: null, 3: null });
    setScoreResults({ 1: null, 2: null, 3: null });
    setPlacedNode(null);
  };

  // Scene 4: Node failure
  const failNode = (nodeId: number) => {
    if (failedNodeId !== null) return;
    setFailedNodeId(nodeId);
    const targetNode = failureNodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    // Mark node as NotReady
    setFailureNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, status: 'NotReady' as const } : n)));

    // After a delay, evict pods and reschedule
    setTimeout(() => {
      setEvictedPods(targetNode.pods);
      setFailureNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, pods: [] } : n)));

      // Reschedule pods to remaining nodes
      setTimeout(() => {
        const remainingNodes = failureNodes.filter(n => n.id !== nodeId);
        const rescheduledPods = targetNode.pods;
        setFailureNodes(prev =>
          prev.map(n => {
            if (n.id === nodeId) return n;
            if (n.id === remainingNodes[0].id) {
              return { ...n, pods: [...n.pods, rescheduledPods[0]] };
            }
            if (n.id === remainingNodes[1].id) {
              return { ...n, pods: [...n.pods, rescheduledPods[1]] };
            }
            return n;
          })
        );
        setEvictedPods([]);
      }, 1500);
    }, 1200);
  };

  const recoverNode = () => {
    if (failedNodeId === null) return;
    setRecovering(true);
    setTimeout(() => {
      setFailureNodes([
        { id: 1, status: 'Ready', pods: [1, 2] },
        { id: 2, status: 'Ready', pods: [3, 4] },
        { id: 3, status: 'Ready', pods: [5, 6] },
      ]);
      setFailedNodeId(null);
      setEvictedPods([]);
      setRecovering(false);
    }, 1000);
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">

      {/* Scene 0: What is a Node? */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="relative mx-auto w-28 h-28 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-mcb-400/20 rounded-2xl blur-xl" />
            <div className="relative w-28 h-28 bg-mcb-900/60 border-2 border-mcb-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <Server size={56} className="text-mcb-400" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold text-mcb-50"
          >
            The Node
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-mcb-200 leading-relaxed"
          >
            A Node is a <strong className="text-mcb-50">worker machine</strong> in Kubernetes -- physical or virtual.
            Think of each Node as a <strong className="text-mcb-50">ship in a fleet</strong>: it carries Pods (your containers),
            has its own resources (CPU, memory), and reports its health to the captain (the control plane).
          </motion.p>

          {/* Master vs Worker distinction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-mcb-950/50 p-5 rounded-xl border border-mcb-800 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Zap size={18} className="text-amber-400" />
                </div>
                <h3 className="font-bold text-amber-200 text-sm">Master Node</h3>
              </div>
              <p className="text-mcb-300 text-xs leading-relaxed">
                Runs the control plane components: API server, scheduler, controller manager, etcd. Manages the entire cluster.
              </p>
            </div>
            <div className="bg-mcb-950/50 p-5 rounded-xl border border-mcb-800 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Server size={18} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-blue-200 text-sm">Worker Node</h3>
              </div>
              <p className="text-mcb-300 text-xs leading-relaxed">
                Runs your application workloads. Contains kubelet, kube-proxy, and a container runtime. This is where Pods live.
              </p>
            </div>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {nodeFacts.map((fact, index) => (
              <motion.span
                key={fact.label}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.12, type: 'spring', stiffness: 200, damping: 18 }}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full border text-sm font-medium ${fact.color}`}
              >
                {fact.label}
              </motion.span>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
              Explore Node Components <ArrowRight />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Scene 1: Node Components */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Node Components</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Every worker node runs three essential components. Click each one to learn how they work together.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Architecture diagram */}
            <div className="relative h-[420px] bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 flex items-center justify-center p-6 overflow-hidden">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mcb-950 px-3 text-mcb-400 font-bold text-sm flex items-center gap-2">
                <Server size={14} /> Worker Node
              </div>

              <div className="flex flex-col items-center gap-6 w-full">
                {nodeComponents.map((comp, index) => (
                  <motion.button
                    key={comp.id}
                    onClick={() => setActiveComponent(activeComponent === comp.id ? null : comp.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, type: 'spring', stiffness: 120, damping: 20 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      activeComponent === comp.id
                        ? `${comp.color} ${comp.borderColor}`
                        : 'bg-mcb-900/40 border-mcb-700 hover:border-mcb-500'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeComponent === comp.id ? comp.color : 'bg-mcb-800/60'
                    }`}>
                      {comp.icon}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-mcb-50 text-sm">{comp.label}</p>
                      <p className="text-xs text-mcb-400">{comp.description}</p>
                    </div>
                    {activeComponent === comp.id && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2.5 h-2.5 rounded-full bg-green-400"
                      />
                    )}
                  </motion.button>
                ))}

                {/* SVG connections */}
                <svg className="absolute left-8 top-[90px] w-4 h-[260px] pointer-events-none" viewBox="0 0 16 260">
                  <motion.line
                    x1="8" y1="0" x2="8" y2="260"
                    stroke="#818cf8" strokeWidth="2" strokeDasharray="6 4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4, strokeDashoffset: -20 }}
                    transition={{
                      opacity: { delay: 0.6, duration: 0.4 },
                      strokeDashoffset: { duration: 2, repeat: Infinity, ease: 'linear' },
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Explanation panel */}
            <div className="flex flex-col gap-4 text-left">
              <AnimatePresence mode="wait">
                {activeComponent && (
                  <motion.div
                    key={activeComponent}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-6 rounded-xl border ${
                      activeComponent === 'kubelet'
                        ? 'bg-blue-900/20 border-blue-500/30'
                        : activeComponent === 'kube-proxy'
                        ? 'bg-emerald-900/20 border-emerald-500/30'
                        : 'bg-violet-900/20 border-violet-500/30'
                    }`}
                  >
                    <h3 className={`text-xl font-bold mb-2 ${
                      activeComponent === 'kubelet'
                        ? 'text-blue-200'
                        : activeComponent === 'kube-proxy'
                        ? 'text-emerald-200'
                        : 'text-violet-200'
                    }`}>
                      {nodeComponents.find(c => c.id === activeComponent)?.label}
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      activeComponent === 'kubelet'
                        ? 'text-blue-100/80'
                        : activeComponent === 'kube-proxy'
                        ? 'text-emerald-100/80'
                        : 'text-violet-100/80'
                    }`}>
                      {nodeComponents.find(c => c.id === activeComponent)?.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!activeComponent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 text-mcb-300 text-sm">
                  Click on any component in the diagram to learn more about its role.
                </motion.div>
              )}

              {/* Terminal output */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-black/40 rounded-xl border border-mcb-800 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-mcb-800 bg-mcb-900/50">
                  <span className="text-xs text-mcb-400 font-mono flex items-center gap-2">
                    <Terminal size={12} /> Terminal
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                </div>
                <div className="p-4 font-mono text-xs text-left space-y-1">
                  <p className="text-mcb-50">$ kubectl get nodes</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-mcb-300"
                  >
                    <p>NAME{'           '}STATUS{'   '}ROLES{'    '}AGE{'   '}VERSION</p>
                    <p>
                      node-alpha{'     '}
                      <span className="text-green-400">Ready</span>
                      {'    '}control{'  '}45d{'   '}v1.29.2
                    </p>
                    <p>
                      node-beta{'      '}
                      <span className="text-green-400">Ready</span>
                      {'    '}worker{'   '}45d{'   '}v1.29.2
                    </p>
                    <p>
                      node-gamma{'     '}
                      <span className="text-green-400">Ready</span>
                      {'    '}worker{'   '}30d{'   '}v1.29.2
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Resource Management <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 2: Resource Management */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Resource Management</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Every Node has finite CPU and memory. Pods declare resource <strong className="text-mcb-50">requests</strong> (guaranteed minimum) and <strong className="text-mcb-50">limits</strong> (maximum allowed). Add pods and watch the node fill up.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Capacity visualization */}
            <div className="bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server size={20} className="text-mcb-400" />
                  <span className="font-bold text-mcb-50">worker-node-01</span>
                </div>
                {isOvercommitted && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-red-400 text-xs font-mono flex items-center gap-1"
                  >
                    <AlertTriangle size={12} /> OVERCOMMITTED
                  </motion.span>
                )}
              </div>

              {/* CPU bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mcb-300 flex items-center gap-1.5">
                    <Cpu size={14} className="text-blue-400" /> CPU
                  </span>
                  <span className="text-mcb-400 font-mono text-xs">{usedCpu.toFixed(1)} / {totalCpu} cores</span>
                </div>
                <div className="h-6 bg-mcb-900 rounded-lg overflow-hidden border border-mcb-700">
                  <motion.div
                    className={`h-full rounded-lg transition-colors duration-300 ${
                      cpuPercent > 100 ? 'bg-red-500' : cpuPercent > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(cpuPercent, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>

              {/* Memory bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mcb-300 flex items-center gap-1.5">
                    <MemoryStick size={14} className="text-purple-400" /> Memory
                  </span>
                  <span className="text-mcb-400 font-mono text-xs">{usedMem.toFixed(1)} / {totalMem} Gi</span>
                </div>
                <div className="h-6 bg-mcb-900 rounded-lg overflow-hidden border border-mcb-700">
                  <motion.div
                    className={`h-full rounded-lg transition-colors duration-300 ${
                      memPercent > 100 ? 'bg-red-500' : memPercent > 80 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(memPercent, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>

              {/* Pod blocks */}
              <div className="space-y-2">
                <span className="text-xs text-mcb-400 uppercase tracking-wider">Allocated Pods</span>
                <div className="flex flex-wrap gap-2 min-h-[60px] bg-mcb-900/30 rounded-lg p-3 border border-mcb-800/50">
                  <AnimatePresence>
                    {allocatedPods.map(pod => (
                      <motion.div
                        key={pod.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center text-mcb-50 text-[10px] font-mono border ${
                          isOvercommitted ? 'bg-red-500/30 border-red-500/50' : 'bg-mcb-500/30 border-mcb-500/50'
                        }`}
                      >
                        <Box size={14} />
                        <span>{pod.cpu}c/{pod.mem}Gi</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {allocatedPods.length === 0 && (
                    <span className="text-mcb-500 text-xs m-auto">No pods allocated</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={addPod} className="flex-1 flex items-center justify-center gap-2 text-sm">
                  <Plus size={16} /> Add Pod
                </Button>
                <Button onClick={resetResources} variant="outline" className="flex items-center justify-center gap-2 text-sm">
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-4 text-left">
              <div className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 space-y-4">
                <h3 className="text-lg font-bold text-mcb-50">Requests vs Limits</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-3 h-3 rounded-sm bg-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-200">Request</p>
                      <p className="text-xs text-mcb-300">Guaranteed resources. The scheduler uses this to decide placement. The pod is guaranteed at least this much.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-3 h-3 rounded-sm bg-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-200">Limit</p>
                      <p className="text-xs text-mcb-300">Maximum allowed. If a container tries to exceed its memory limit, it gets OOMKilled. CPU is throttled.</p>
                    </div>
                  </div>
                </div>
              </div>

              {isOvercommitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 p-5 rounded-xl border border-red-500/30"
                >
                  <h4 className="font-bold text-red-300 mb-2 flex items-center gap-2 text-sm">
                    <AlertTriangle size={16} /> Node Overcommitted
                  </h4>
                  <p className="text-red-200/70 text-xs leading-relaxed">
                    The total resource requests exceed node capacity. In production, the scheduler would prevent this by refusing to place new pods. Existing pods may be evicted based on QoS class: BestEffort first, then Burstable, then Guaranteed.
                  </p>
                </motion.div>
              )}

              <div className="bg-mcb-900/20 p-4 rounded-lg border border-mcb-500/30">
                <h4 className="font-bold text-mcb-300 mb-1 text-sm">Node Capacity</h4>
                <p className="text-mcb-200 text-xs">
                  {totalCpu} CPU cores, {totalMem}Gi memory. Each pod randomly requests between 0.5-2 CPU cores and 1-4Gi memory. Keep adding pods to see what happens when the node fills up.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Scheduling <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 3: Scheduling */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Pod Scheduling</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            When a new Pod is created, the <strong className="text-mcb-50">kube-scheduler</strong> picks the best node.
            It filters out unsuitable nodes, then scores the remaining ones. Click "Schedule" to watch the process.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {schedulerNodes.map((node, index) => {
              const filtered = filterResults[node.id];
              const score = scoreResults[node.id];
              const isPlaced = placedNode === node.id;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-mcb-950/50 rounded-xl border-2 p-5 text-left transition-colors duration-300 ${
                    isPlaced
                      ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                      : filtered === 'fail'
                      ? 'border-red-500/50 opacity-50'
                      : 'border-mcb-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server size={16} className={isPlaced ? 'text-green-400' : 'text-mcb-400'} />
                      <span className="font-bold text-mcb-50 text-sm">{node.name}</span>
                    </div>
                    {filtered === 'pass' && !score && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <CheckCircle size={18} className="text-green-400" />
                      </motion.div>
                    )}
                    {filtered === 'fail' && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <XCircle size={18} className="text-red-400" />
                      </motion.div>
                    )}
                    {score !== null && score !== undefined && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                          isPlaced ? 'bg-green-500/20 text-green-300' : 'bg-mcb-800 text-mcb-300'
                        }`}
                      >
                        Score: {score}
                      </motion.span>
                    )}
                  </div>

                  {/* Resource info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-mcb-300">
                      <span>CPU</span>
                      <span className="font-mono">{node.cpuUsed}/{node.cpuTotal} cores</span>
                    </div>
                    <div className="h-2 bg-mcb-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(node.cpuUsed / node.cpuTotal) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-mcb-300">
                      <span>Memory</span>
                      <span className="font-mono">{node.memUsed}/{node.memTotal} Gi</span>
                    </div>
                    <div className="h-2 bg-mcb-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(node.memUsed / node.memTotal) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {node.labels.map(label => (
                      <span key={label} className="px-2 py-0.5 bg-mcb-800 rounded text-[10px] text-mcb-300 font-mono">
                        {label}
                      </span>
                    ))}
                    {node.taint && (
                      <span className="px-2 py-0.5 bg-red-900/30 border border-red-500/30 rounded text-[10px] text-red-300 font-mono">
                        taint: {node.taint}
                      </span>
                    )}
                  </div>

                  {/* Pod placed animation */}
                  {isPlaced && (
                    <motion.div
                      initial={{ scale: 0, y: -30 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      className="mt-3 bg-green-500/20 border border-green-500/40 rounded-lg p-2 flex items-center justify-center gap-2"
                    >
                      <Box size={14} className="text-green-300" />
                      <span className="text-green-200 text-xs font-bold">new-pod scheduled here</span>
                    </motion.div>
                  )}

                  {/* Fail reason */}
                  {filtered === 'fail' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-2 text-[10px] text-red-400"
                    >
                      Rejected: insufficient CPU + unmatched taint
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* New Pod requirements */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-mcb-900/30 px-6 py-3 rounded-lg border border-mcb-500/30 inline-flex items-center gap-4 text-sm">
              <span className="text-mcb-300 font-bold">New Pod:</span>
              <span className="text-mcb-400 font-mono">{newPodRequirements.cpu} CPU, {newPodRequirements.mem}Gi RAM</span>
              <span className="px-2 py-0.5 bg-mcb-800 rounded text-[10px] text-mcb-300 font-mono">{newPodRequirements.label}</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={runScheduler}
                disabled={schedulingPhase !== 'idle' && schedulingPhase !== 'placed'}
                className="flex items-center justify-center gap-2"
              >
                <Zap size={16} /> {schedulingPhase === 'placed' ? 'Reschedule' : 'Schedule'}
              </Button>
              {schedulingPhase === 'placed' && (
                <Button onClick={resetScheduler} variant="outline" className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> Reset
                </Button>
              )}
            </div>

            {/* Phase indicator */}
            {schedulingPhase !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-sm"
              >
                {schedulingPhase === 'filtering' && (
                  <span className="text-yellow-300 flex items-center gap-2">
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
                      Filtering nodes...
                    </motion.span>
                  </span>
                )}
                {schedulingPhase === 'scoring' && (
                  <span className="text-blue-300 flex items-center gap-2">
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
                      Scoring remaining nodes...
                    </motion.span>
                  </span>
                )}
                {schedulingPhase === 'placed' && (
                  <span className="text-green-300">Pod placed on node-beta (highest score)</span>
                )}
              </motion.div>
            )}
          </div>

          {/* Taints & Affinity explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 max-w-3xl mx-auto"
          >
            <div className="bg-mcb-900/30 p-4 rounded-xl border border-mcb-800/50 text-left">
              <h4 className="text-sm font-bold text-mcb-200 mb-1">Taints & Tolerations</h4>
              <p className="text-xs text-mcb-400 leading-relaxed">
                Taints repel pods from a node. A pod must have a matching toleration to be scheduled on a tainted node. Used for dedicated hardware (GPU nodes) or special workloads.
              </p>
            </div>
            <div className="bg-mcb-900/30 p-4 rounded-xl border border-mcb-800/50 text-left">
              <h4 className="text-sm font-bold text-mcb-200 mb-1">Node Affinity</h4>
              <p className="text-xs text-mcb-400 leading-relaxed">
                Node affinity attracts pods to nodes with matching labels. It can be required (hard constraint) or preferred (soft constraint). Used for zone placement and hardware preferences.
              </p>
            </div>
          </motion.div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Node Failure <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 4: Node Failure & Recovery */}
      {scene === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Node Failure & Recovery</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Kubernetes is built for failure. When a node goes down, the control plane detects it and reschedules pods to healthy nodes. Click a node to simulate a failure.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {failureNodes.map((node, index) => {
              const isFailed = node.status === 'NotReady';

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-mcb-950/50 rounded-xl border-2 p-5 transition-colors duration-500 ${
                    isFailed
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-mcb-500 bg-mcb-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Server
                        size={20}
                        className={isFailed ? 'text-red-500' : 'text-mcb-400'}
                      />
                      <span className="font-bold text-mcb-50 text-sm">Node {node.id}</span>
                    </div>
                    <span className={`text-xs font-mono ${
                      isFailed ? 'text-red-400 animate-pulse' : 'text-green-400'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  {/* Pods in this node */}
                  <div className="flex flex-wrap gap-2 min-h-[60px]">
                    <AnimatePresence>
                      {node.pods.map(podId => (
                        <motion.div
                          key={podId}
                          layout
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0, y: -20 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                          className="w-12 h-12 bg-mcb-500/30 border border-mcb-500/50 rounded-lg flex flex-col items-center justify-center"
                        >
                          <Box size={14} className="text-mcb-300" />
                          <span className="text-[9px] text-mcb-400 font-mono">P{podId}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {node.pods.length === 0 && !isFailed && (
                      <span className="text-mcb-500 text-xs m-auto">No pods</span>
                    )}
                    {isFailed && node.pods.length === 0 && (
                      <span className="text-red-400 text-xs m-auto font-mono">Pods evicted</span>
                    )}
                  </div>

                  {/* Click to fail */}
                  {node.status === 'Ready' && failedNodeId === null && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => failNode(node.id)}
                      className="mt-3 w-full text-xs py-2 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 hover:bg-red-900/40 transition-colors cursor-pointer"
                    >
                      <AlertTriangle size={12} className="inline mr-1" /> Simulate Failure
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Evicted pods in transit */}
          <AnimatePresence>
            {evictedPods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-mcb-900/50 border border-mcb-700 rounded-xl p-4 flex items-center justify-center gap-4"
              >
                <RefreshCw className="animate-spin text-mcb-400" size={20} />
                <span className="text-mcb-50 font-mono text-sm">
                  Rescheduling {evictedPods.length} pods to healthy nodes...
                </span>
                <div className="flex gap-2">
                  {evictedPods.map(id => (
                    <motion.div
                      key={id}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-8 h-8 bg-amber-500/30 border border-amber-500/50 rounded flex items-center justify-center"
                    >
                      <Box size={12} className="text-amber-300" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status transitions */}
          <div className="flex items-center justify-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300">Ready</span>
            <ArrowRight size={14} className="text-mcb-500" />
            <span className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">NotReady</span>
            <ArrowRight size={14} className="text-mcb-500" />
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300">Pods Evicted</span>
            <ArrowRight size={14} className="text-mcb-500" />
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300">Rescheduled</span>
          </div>

          {/* Recovery + Complete */}
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            {failedNodeId !== null && evictedPods.length === 0 && (
              <Button
                onClick={recoverNode}
                variant="secondary"
                disabled={recovering}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} className={recovering ? 'animate-spin' : ''} />
                {recovering ? 'Recovering...' : 'Recover Node'}
              </Button>
            )}
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Understand the Fleet (ReplicaSets) <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
