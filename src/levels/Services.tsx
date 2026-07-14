import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import {
  ArrowRight,
  ArrowLeft,
  Radio,
  Ship,
  User,
  Globe,
  Cloud,
  Server,
  Search,
  Send,
  AlertTriangle,
  XCircle,
  Terminal,
} from 'lucide-react';

interface ServicesProps {
  onComplete: () => void;
}

interface PodInfo {
  id: number;
  ip: string;
  alive: boolean;
  label: string;
}

const initialPods: PodInfo[] = [
  { id: 1, ip: '10.1.0.5', alive: true, label: 'app=web' },
  { id: 2, ip: '10.1.0.6', alive: true, label: 'app=web' },
  { id: 3, ip: '10.1.0.7', alive: true, label: 'app=web' },
];

const svcYaml = [
  { text: 'apiVersion: v1', key: 'apiVersion:', value: ' v1' },
  { text: 'kind: Service', key: 'kind:', value: ' Service' },
  { text: 'metadata:', key: 'metadata:', value: '' },
  { text: '  name: my-web', key: '  name:', value: ' my-web' },
  { text: 'spec:', key: 'spec:', value: '' },
  { text: '  type: ClusterIP', key: '  type:', value: ' ClusterIP', highlight: true },
  { text: '  selector:', key: '  selector:', value: '', highlight: true },
  { text: '    app: web', key: '    app:', value: ' web', highlight: true },
  { text: '  ports:', key: '  ports:', value: '' },
  { text: '  - port: 80', key: '  - port:', value: ' 80' },
  { text: '    targetPort: 8080', key: '    targetPort:', value: ' 8080' },
];

const dnsSegments = [
  { segment: 'my-api', explanation: 'Service Name - the name you gave your Service in its metadata.' },
  { segment: 'default', explanation: 'Namespace - the Kubernetes namespace the Service lives in.' },
  { segment: 'svc', explanation: 'Service Subdomain - tells DNS this is a Service resource.' },
  { segment: 'cluster.local', explanation: 'Cluster Domain - the default DNS domain for the entire cluster.' },
];

export const Services: React.FC<ServicesProps> = ({ onComplete }) => {
  const [scene, setScene] = useState(0);
  const [pods, setPods] = useState<PodInfo[]>(initialPods);
  const [deadPodId, setDeadPodId] = useState<number | null>(null);
  const [respawnedPod, setRespawnedPod] = useState<PodInfo | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [showStableMsg, setShowStableMsg] = useState(false);
  const [clusterRequests, setClusterRequests] = useState<{ id: number; targetPod: number }[]>([]);
  const [clusterReqId, setClusterReqId] = useState(0);
  const [nodePortReqs, setNodePortReqs] = useState<{ id: number; nodeIdx: number; podIdx: number }[]>([]);
  const [npReqId, setNpReqId] = useState(0);
  const [lbAnimating, setLbAnimating] = useState(false);
  const [lbStep, setLbStep] = useState(-1);
  const [activeDnsSegment, setActiveDnsSegment] = useState<number | null>(null);
  const [dnsResolving, setDnsResolving] = useState(false);
  const [dnsResolved, setDnsResolved] = useState(false);

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));

  // Scene 0: Pod death and respawn animation
  const triggerPodDeath = useCallback(() => {
    setConnectionError(false);
    setShowStableMsg(false);
    setRespawnedPod(null);
    setDeadPodId(2);

    setTimeout(() => {
      const newPod: PodInfo = { id: 4, ip: '10.1.0.12', alive: true, label: 'app=web' };
      setRespawnedPod(newPod);
      setPods(prev => prev.map(p => (p.id === 2 ? newPod : p)));
    }, 1200);

    setTimeout(() => {
      setConnectionError(true);
    }, 2200);

    setTimeout(() => {
      setShowStableMsg(true);
    }, 3400);
  }, []);

  // Scene 1: Send ClusterIP request
  const sendClusterRequest = () => {
    const newId = clusterReqId + 1;
    setClusterReqId(newId);
    const target = Math.floor(Math.random() * 3);
    setClusterRequests(prev => [...prev, { id: newId, targetPod: target }]);
    setTimeout(() => {
      setClusterRequests(prev => prev.filter(r => r.id !== newId));
    }, 1800);
  };

  // Scene 2: Send NodePort request
  const sendNodePortRequest = () => {
    const newId = npReqId + 1;
    setNpReqId(newId);
    const nodeIdx = Math.floor(Math.random() * 3);
    const podIdx = Math.floor(Math.random() * 3);
    setNodePortReqs(prev => [...prev, { id: newId, nodeIdx, podIdx }]);
    setTimeout(() => {
      setNodePortReqs(prev => prev.filter(r => r.id !== newId));
    }, 2200);
  };

  // Scene 3: LoadBalancer animation
  const triggerLbAnimation = useCallback(() => {
    setLbAnimating(true);
    setLbStep(0);
    setTimeout(() => setLbStep(1), 800);
    setTimeout(() => setLbStep(2), 1600);
    setTimeout(() => setLbStep(3), 2400);
    setTimeout(() => {
      setLbAnimating(false);
      setLbStep(-1);
    }, 4000);
  }, []);

  // Scene 4: DNS resolution animation
  const triggerDnsResolve = useCallback(() => {
    setDnsResolving(true);
    setDnsResolved(false);
    setTimeout(() => {
      setDnsResolved(true);
      setDnsResolving(false);
    }, 1500);
  }, []);

  // Reset scene 0 state when returning
  useEffect(() => {
    if (scene === 0) {
      setPods(initialPods);
      setDeadPodId(null);
      setRespawnedPod(null);
      setConnectionError(false);
      setShowStableMsg(false);
    }
  }, [scene]);

  return (
    <div className="min-h-[600px] flex flex-col items-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">

      {/* Scene 0: The Problem - Ephemeral Pod IPs */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-extrabold text-mcb-50"
          >
            The Problem with Pod IPs
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-mcb-200 leading-relaxed max-w-2xl mx-auto"
          >
            Pods are <strong className="text-mcb-50">ephemeral</strong>. When they die and restart, they get a <strong className="text-red-400">brand-new IP address</strong>. How does a client stay connected?
          </motion.p>

          {/* Pod diagram */}
          <div className="relative bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-8 min-h-[340px]">
            {/* Pods row */}
            <div className="flex justify-center gap-6 mb-8">
              <AnimatePresence mode="popLayout">
                {pods.map((pod, index) => (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: deadPodId === pod.id && !respawnedPod ? 0 : 1,
                      scale: deadPodId === pod.id && !respawnedPod ? 0.3 : 1,
                      backgroundColor: deadPodId === pod.id && !respawnedPod ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0)',
                    }}
                    exit={{ opacity: 0, scale: 0, filter: 'brightness(3)' }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20, delay: index * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${
                      deadPodId === pod.id && !respawnedPod
                        ? 'border-red-500 bg-red-900/40'
                        : pod.id === 4
                          ? 'border-green-500 bg-green-900/20'
                          : 'border-mcb-500 bg-mcb-900/60'
                    }`}>
                      <Ship size={28} className={deadPodId === pod.id && !respawnedPod ? 'text-red-400' : 'text-mcb-400'} />
                      {deadPodId === pod.id && !respawnedPod && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute"
                        >
                          <XCircle size={32} className="text-red-500" />
                        </motion.div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-mcb-300">{pod.ip}</span>
                    <span className="text-[10px] text-mcb-500">pod-{index + 1}</span>
                    {pod.id === 4 && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-green-400 font-bold"
                      >
                        NEW IP!
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Client trying to connect */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="w-14 h-14 bg-mcb-800 rounded-full flex items-center justify-center border-2 border-mcb-600">
                <User size={28} className="text-mcb-300" />
              </div>
              <span className="text-xs text-mcb-400">Client</span>

              {connectionError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-2 mt-2"
                >
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-sm text-red-300 font-mono">Connection Refused to 10.1.0.6</span>
                </motion.div>
              )}

              {showStableMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="bg-mcb-500/20 border border-mcb-400 rounded-lg px-6 py-3 mt-2"
                >
                  <span className="text-mcb-200 font-bold">We need a stable address!</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={triggerPodDeath} variant="outline" className="flex items-center justify-center gap-2">
              <XCircle size={18} /> Kill a Pod
            </Button>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Discover Services <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 1: ClusterIP Service */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">ClusterIP Service</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            A ClusterIP Service gives you a <strong className="text-mcb-50">single stable virtual IP</strong> inside the cluster.
            Clients talk to the Service IP, and it distributes traffic to matching Pods.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Architecture diagram */}
            <div className="relative bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-6 min-h-[420px] flex flex-col items-center justify-between gap-6">
              {/* Client */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-mcb-800 rounded-full flex items-center justify-center border-2 border-mcb-600">
                  <User size={28} className="text-mcb-300" />
                </div>
                <span className="text-xs text-mcb-400">Client Pod</span>
              </motion.div>

              {/* Service VIP */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 120, damping: 20 }}
                className="w-full max-w-xs bg-mcb-600/20 border-2 border-mcb-500 rounded-xl p-4 flex items-center justify-between relative z-10"
              >
                <div className="flex items-center gap-3">
                  <Radio size={24} className="text-mcb-400" />
                  <div className="text-left">
                    <span className="block font-bold text-mcb-100 text-sm">Service: my-web</span>
                    <span className="block font-mono text-[10px] text-mcb-300">VIP: 10.96.0.1</span>
                  </div>
                </div>
                <div className="bg-mcb-500 text-mcb-50 text-[10px] px-2 py-1 rounded font-mono">
                  app=web
                </div>
              </motion.div>

              {/* Pods row */}
              <div className="grid grid-cols-3 gap-4 w-full z-10">
                {['pod-1', 'pod-2', 'pod-3'].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="bg-mcb-600/20 border border-mcb-500/50 rounded-lg p-3 flex flex-col items-center gap-2 relative"
                  >
                    <Ship size={24} className="text-mcb-400" />
                    <span className="text-[10px] text-mcb-300 font-mono">{name}</span>
                    <div className="absolute -top-2 -right-2 bg-mcb-500 text-mcb-50 text-[8px] px-1.5 py-0.5 rounded-full">
                      app=web
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Request particles */}
              <AnimatePresence>
                {clusterRequests.map(r => {
                  const targetLeft = `${((r.targetPod + 1) * 33) - 16}%`;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ top: 70, left: '50%', scale: 0 }}
                      animate={{
                        top: [70, 170, 310],
                        left: ['50%', '50%', targetLeft],
                        scale: [1, 1.2, 0.5],
                        opacity: [1, 1, 0],
                      }}
                      transition={{ duration: 1.2, times: [0, 0.4, 1] }}
                      className="absolute w-3 h-3 bg-mcb-400 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)] z-20"
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right panel: YAML + terminal */}
            <div className="space-y-4 text-left">
              <Button onClick={sendClusterRequest} className="w-full flex items-center justify-center gap-2 py-3">
                <Send size={18} /> Send Request
              </Button>

              {/* YAML block */}
              <div className="bg-black/40 rounded-xl border border-mcb-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-mcb-800 bg-mcb-900/50">
                  <span className="text-xs text-mcb-400 font-mono">service.yaml</span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                </div>
                <div className="p-4 font-mono text-sm text-left">
                  {svcYaml.map((line, i) => (
                    <div
                      key={i}
                      className={`leading-relaxed ${line.highlight ? 'bg-mcb-500/10 border-l-2 border-mcb-400 pl-2 -ml-2' : ''}`}
                    >
                      <span className="text-mcb-400">{line.key}</span>
                      <span className="text-mcb-50">{line.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal output */}
              <div className="bg-black/50 p-4 rounded-xl font-mono text-sm border border-mcb-700 space-y-1">
                <div className="text-mcb-400 mb-2 pb-2 border-b border-white/10 flex items-center gap-2">
                  <Terminal size={14} /> Terminal
                </div>
                <p className="text-mcb-50">$ kubectl get svc my-web</p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-mcb-300 text-xs"
                >
                  <p>NAME{'     '}TYPE{'        '}CLUSTER-IP{'   '}PORT(S)</p>
                  <p>
                    my-web{'   '}
                    <span className="text-mcb-400">ClusterIP</span>{'   '}
                    <span className="text-green-400">10.96.0.1</span>{'    '}
                    80/TCP
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: NodePort <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 2: NodePort Service */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">NodePort Service</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Like ClusterIP, but also opens a <strong className="text-mcb-50">static port on every Node</strong>.
            External traffic can reach your Service through any Node's IP on that port.
          </p>

          <div className="grid md:grid-cols-[1fr] gap-8 items-start">
            {/* Full-width architecture diagram */}
            <div className="relative bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-8 min-h-[420px] overflow-hidden">
              {/* External user */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 mb-6"
              >
                <div className="w-12 h-12 bg-mcb-800 rounded-full flex items-center justify-center border-2 border-mcb-600">
                  <Globe size={24} className="text-mcb-300" />
                </div>
                <span className="text-xs text-mcb-400">External User</span>
              </motion.div>

              {/* Nodes row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {['node-1', 'node-2', 'node-3'].map((name, idx) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-mcb-900/40 border border-mcb-700 rounded-xl p-4 flex flex-col items-center gap-2 relative"
                  >
                    <Server size={22} className="text-mcb-400" />
                    <span className="text-xs font-mono text-mcb-300">{name}</span>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                      className="bg-amber-500/20 border border-amber-500/40 rounded px-2 py-0.5 text-[10px] text-amber-300 font-mono"
                    >
                      :30080
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Service layer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-xs mx-auto bg-mcb-600/20 border-2 border-mcb-500 rounded-xl p-3 flex items-center justify-center gap-3 mb-6"
              >
                <Radio size={20} className="text-mcb-400" />
                <div className="text-left">
                  <span className="text-sm font-bold text-mcb-100">Service: my-web</span>
                  <span className="block font-mono text-[10px] text-mcb-300">ClusterIP: 10.96.0.1</span>
                </div>
              </motion.div>

              {/* Pods row */}
              <div className="grid grid-cols-3 gap-4">
                {['pod-1', 'pod-2', 'pod-3'].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="bg-mcb-600/20 border border-mcb-500/50 rounded-lg p-2 flex flex-col items-center gap-1"
                  >
                    <Ship size={20} className="text-mcb-400" />
                    <span className="text-[10px] text-mcb-300 font-mono">{name}</span>
                  </motion.div>
                ))}
              </div>

              {/* Request particles */}
              <AnimatePresence>
                {nodePortReqs.map(r => {
                  const nodeLeft = `${((r.nodeIdx + 1) * 33) - 16}%`;
                  const podLeft = `${((r.podIdx + 1) * 33) - 16}%`;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ top: 50, left: '50%', scale: 0 }}
                      animate={{
                        top: [50, 130, 240, 370],
                        left: ['50%', nodeLeft, '50%', podLeft],
                        scale: [1, 1.2, 1, 0.5],
                        opacity: [1, 1, 1, 0],
                      }}
                      transition={{ duration: 1.8, times: [0, 0.3, 0.6, 1] }}
                      className="absolute w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)] z-20"
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button onClick={sendNodePortRequest} className="w-full flex items-center justify-center gap-2 py-3">
              <Send size={18} /> Send External Request
            </Button>

            {/* Port range info card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-left"
            >
              <h4 className="text-sm font-bold text-amber-200 mb-1">NodePort Range</h4>
              <p className="text-xs text-amber-100/80">
                Kubernetes allocates NodePort from range <code className="text-amber-300">30000-32767</code>.
                Every Node in the cluster opens the same port, so traffic can arrive at any Node.
              </p>
            </motion.div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: LoadBalancer <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 3: LoadBalancer Service */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">LoadBalancer Service</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            The cloud provider provisions an <strong className="text-mcb-50">external load balancer</strong> with a public IP.
            This is the most common way to expose services to the internet.
          </p>

          {/* Architecture diagram */}
          <div className="relative bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-8 min-h-[460px] overflow-hidden">
            {/* Internet cloud */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 mb-4"
            >
              <div className="w-12 h-12 bg-blue-900/40 rounded-full flex items-center justify-center border-2 border-blue-500/50">
                <Globe size={24} className="text-blue-400" />
              </div>
              <span className="text-xs text-mcb-400">Internet</span>
            </motion.div>

            {/* Cloud Load Balancer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 120, damping: 20 }}
              className="w-full max-w-sm mx-auto bg-blue-900/20 border-2 border-blue-500/50 rounded-xl p-4 flex items-center justify-between mb-4 relative"
            >
              <div className="flex items-center gap-3">
                <Cloud size={24} className="text-blue-400" />
                <div className="text-left">
                  <span className="block text-sm font-bold text-blue-200">Cloud Load Balancer</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="block font-mono text-[10px] text-blue-300"
                  >
                    External IP: 203.0.113.10
                  </motion.span>
                </div>
              </div>
              {lbStep >= 0 && lbStep < 1 && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
                />
              )}
            </motion.div>

            {/* Nodes row */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-4">
              {['node-1', 'node-2'].map((name, idx) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    borderColor: lbStep === 1 || lbStep === 2 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(55, 65, 81, 1)',
                  }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="bg-mcb-900/40 border rounded-xl p-3 flex flex-col items-center gap-1"
                >
                  <Server size={20} className="text-mcb-400" />
                  <span className="text-xs font-mono text-mcb-300">{name}</span>
                  <span className="text-[10px] text-mcb-500 font-mono">:30080</span>
                </motion.div>
              ))}
            </div>

            {/* Service */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-xs mx-auto bg-mcb-600/20 border-2 border-mcb-500 rounded-xl p-3 flex items-center justify-center gap-3 mb-4"
            >
              <Radio size={18} className="text-mcb-400" />
              <span className="text-sm font-bold text-mcb-100">Service: my-web</span>
            </motion.div>

            {/* Pods */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    borderColor: lbStep === 3 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(99, 102, 241, 0.3)',
                  }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="bg-mcb-600/20 border rounded-lg p-2 flex flex-col items-center gap-1"
                >
                  <Ship size={18} className="text-mcb-400" />
                  <span className="text-[10px] text-mcb-300 font-mono">pod-{i}</span>
                </motion.div>
              ))}
            </div>

            {/* LB animated flow particles */}
            <AnimatePresence>
              {lbAnimating && (
                <motion.div
                  key="lb-particle"
                  initial={{ top: 50, left: '50%', scale: 0 }}
                  animate={{
                    top: [50, 120, 220, 320, 400],
                    left: ['50%', '50%', '40%', '50%', '38%'],
                    scale: [1, 1.3, 1, 1, 0.4],
                    opacity: [1, 1, 1, 1, 0],
                  }}
                  transition={{ duration: 3, times: [0, 0.2, 0.45, 0.7, 1] }}
                  className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_14px_rgba(96,165,250,0.9)] z-20"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'ClusterIP', desc: 'Internal only. No external access.', color: 'border-mcb-500/50 bg-mcb-900/30' },
              { title: 'NodePort', desc: 'Opens a port on every Node.', color: 'border-amber-500/50 bg-amber-900/20' },
              { title: 'LoadBalancer', desc: 'Gets an external IP from cloud.', color: 'border-blue-500/50 bg-blue-900/20' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                whileHover={{ scale: 1.03 }}
                className={`${card.color} border rounded-xl p-4 text-left`}
              >
                <h4 className="text-sm font-bold text-mcb-50 mb-1">{card.title}</h4>
                <p className="text-xs text-mcb-300">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={triggerLbAnimation} variant="outline" className="flex items-center justify-center gap-2">
              <Send size={18} /> Simulate Traffic
            </Button>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: DNS & Discovery <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 4: DNS & Service Discovery */}
      {scene === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">DNS & Service Discovery</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            You don't need to know a Service's IP. Kubernetes gives every Service a <strong className="text-mcb-50">DNS name</strong>.
            Applications simply call the name and CoreDNS resolves it automatically.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* DNS flow diagram */}
            <div className="relative bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 p-6 min-h-[400px] flex flex-col items-center justify-between gap-4">
              {/* App */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-mcb-800 rounded-xl flex items-center justify-center border-2 border-mcb-600">
                  <Ship size={28} className="text-mcb-400" />
                </div>
                <span className="text-xs text-mcb-400">Application Pod</span>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-mcb-900/60 border border-mcb-700 rounded-lg px-3 py-1.5 font-mono text-[11px] text-mcb-200"
                >
                  GET my-api.default.svc.cluster.local
                </motion.div>
              </motion.div>

              {/* DNS resolution arrow */}
              <svg className="w-full h-12" viewBox="0 0 300 50">
                <motion.line
                  x1="150" y1="0" x2="150" y2="50"
                  stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3"
                  initial={{ opacity: 0, strokeDashoffset: 0 }}
                  animate={{ opacity: 0.7, strokeDashoffset: -14 }}
                  transition={{
                    opacity: { delay: 0.6, duration: 0.3 },
                    strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' },
                  }}
                />
              </svg>

              {/* CoreDNS */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
                className="bg-purple-900/20 border-2 border-purple-500/50 rounded-xl p-4 flex items-center gap-3"
              >
                <Search size={22} className="text-purple-400" />
                <div className="text-left">
                  <span className="block text-sm font-bold text-purple-200">CoreDNS</span>
                  <span className="block font-mono text-[10px] text-purple-300">
                    {dnsResolving
                      ? 'Resolving...'
                      : dnsResolved
                        ? 'Resolved: 10.96.0.1'
                        : 'Waiting for query'}
                  </span>
                </div>
                {dnsResolving && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                  />
                )}
              </motion.div>

              {/* Resolution arrow */}
              <svg className="w-full h-12" viewBox="0 0 300 50">
                <motion.line
                  x1="150" y1="0" x2="150" y2="50"
                  stroke="#22c55e" strokeWidth="2" strokeDasharray="4 3"
                  initial={{ opacity: 0, strokeDashoffset: 0 }}
                  animate={{
                    opacity: dnsResolved ? 0.7 : 0.2,
                    strokeDashoffset: dnsResolved ? -14 : 0,
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' },
                  }}
                />
              </svg>

              {/* Service / Pod */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  borderColor: dnsResolved ? 'rgba(34, 197, 94, 0.6)' : 'rgba(99, 102, 241, 0.3)',
                }}
                transition={{ delay: 0.7 }}
                className="bg-mcb-600/20 border-2 rounded-xl p-3 flex items-center gap-3"
              >
                <Radio size={18} className="text-mcb-400" />
                <div className="text-left">
                  <span className="text-sm font-bold text-mcb-100">my-api Service</span>
                  <span className="block font-mono text-[10px] text-mcb-300">10.96.0.1 → Pod</span>
                </div>
              </motion.div>

              {/* Resolution particle */}
              <AnimatePresence>
                {dnsResolving && (
                  <motion.div
                    key="dns-particle"
                    initial={{ top: 100, left: '50%', scale: 0 }}
                    animate={{
                      top: [100, 200, 100],
                      scale: [1, 1.2, 0.8],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 1.2 }}
                    className="absolute w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)] z-20"
                  />
                )}
                {dnsResolved && (
                  <motion.div
                    key="dns-resolved-particle"
                    initial={{ top: 200, left: '50%', scale: 0 }}
                    animate={{
                      top: [200, 350],
                      scale: [1, 0.4],
                      opacity: [1, 0],
                    }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.8)] z-20"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* FQDN breakdown */}
            <div className="space-y-6 text-left">
              <Button onClick={triggerDnsResolve} className="w-full flex items-center justify-center gap-2 py-3">
                <Search size={18} /> Resolve DNS
              </Button>

              <div className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50">
                <h3 className="text-lg font-bold text-mcb-50 mb-4">FQDN Breakdown</h3>
                <p className="text-xs text-mcb-400 mb-4">Click each segment to see what it means:</p>

                {/* FQDN visual */}
                <div className="flex flex-wrap items-center gap-1 mb-6 font-mono text-sm">
                  {dnsSegments.map((seg, idx) => (
                    <React.Fragment key={seg.segment}>
                      <motion.button
                        onClick={() => setActiveDnsSegment(activeDnsSegment === idx ? null : idx)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                          activeDnsSegment === idx
                            ? 'bg-mcb-500/20 border-mcb-400 text-mcb-200'
                            : 'bg-mcb-900/50 border-mcb-700 text-mcb-300 hover:border-mcb-500'
                        }`}
                      >
                        {seg.segment}
                      </motion.button>
                      {idx < dnsSegments.length - 1 && (
                        <span className="text-mcb-500 font-bold">.</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Segment explanation */}
                <AnimatePresence mode="wait">
                  {activeDnsSegment !== null && (
                    <motion.div
                      key={activeDnsSegment}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-mcb-950/50 border border-mcb-700 rounded-lg p-4"
                    >
                      <h4 className="text-sm font-bold text-mcb-200 mb-1">
                        <code className="text-mcb-400">{dnsSegments[activeDnsSegment].segment}</code>
                      </h4>
                      <p className="text-xs text-mcb-300 leading-relaxed">
                        {dnsSegments[activeDnsSegment].explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeDnsSegment === null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-mcb-950/50 border border-mcb-800/30 rounded-lg p-4 text-xs text-mcb-400"
                  >
                    Click a segment above to see its purpose in the fully qualified domain name.
                  </motion.div>
                )}
              </div>

              {/* Short-form note */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-green-900/20 border border-green-500/30 rounded-xl p-4"
              >
                <h4 className="text-sm font-bold text-green-200 mb-1">Shortcut</h4>
                <p className="text-xs text-green-100/80">
                  Within the same namespace, you only need the Service name: <code className="text-green-300">my-api</code>.
                  Across namespaces, use <code className="text-green-300">my-api.other-ns</code>.
                  The full FQDN is only needed in rare edge cases.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Open the Port (Ingress) <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
