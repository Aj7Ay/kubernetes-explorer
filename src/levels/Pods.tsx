import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, ArrowLeft, Box, Ship, Network, HardDrive, Terminal, Play, AlertCircle, CheckCircle, Clock, Loader, XCircle } from 'lucide-react';

interface PodsProps {
  onComplete: () => void;
}

const podFacts = [
  { label: 'Smallest deployable unit', color: 'bg-blue-500/20 border-blue-500/40 text-blue-200' },
  { label: 'Can hold 1+ containers', color: 'bg-green-500/20 border-green-500/40 text-green-200' },
  { label: 'Shared network namespace', color: 'bg-purple-500/20 border-purple-500/40 text-purple-200' },
  { label: 'Unique IP address', color: 'bg-amber-500/20 border-amber-500/40 text-amber-200' },
];

const yamlSections = [
  {
    id: 'apiVersion',
    label: 'apiVersion & kind',
    lines: [
      { text: 'apiVersion: v1', key: 'apiVersion:', value: ' v1' },
      { text: 'kind: Pod', key: 'kind:', value: ' Pod' },
    ],
    explanation: 'Every Kubernetes resource declares its API version and kind. This tells the API server which schema to use for validation.',
  },
  {
    id: 'metadata',
    label: 'metadata',
    lines: [
      { text: 'metadata:', key: 'metadata:', value: '' },
      { text: '  name: my-app', key: '  name:', value: ' my-app', indent: true },
      { text: '  labels:', key: '  labels:', value: '', indent: true },
      { text: '    app: web', key: '    app:', value: ' web', indent: true },
    ],
    explanation: 'Metadata identifies the Pod. The name is its unique identifier, and labels are key-value pairs used by Services and ReplicaSets to find this Pod.',
  },
  {
    id: 'spec',
    label: 'spec',
    lines: [
      { text: 'spec:', key: 'spec:', value: '' },
      { text: '  restartPolicy: Always', key: '  restartPolicy:', value: ' Always', indent: true },
    ],
    explanation: 'The spec defines the desired state. restartPolicy tells Kubernetes what to do when a container exits: Always, OnFailure, or Never.',
  },
  {
    id: 'containers',
    label: 'containers',
    lines: [
      { text: '  containers:', key: '  containers:', value: '' },
      { text: '  - name: web', key: '  - name:', value: ' web', indent: true },
      { text: '    image: nginx:1.25', key: '    image:', value: ' nginx:1.25', indent: true },
      { text: '    ports:', key: '    ports:', value: '', indent: true },
      { text: '    - containerPort: 80', key: '    - containerPort:', value: ' 80', indent: true },
      { text: '    resources:', key: '    resources:', value: '', indent: true },
      { text: '      limits:', key: '      limits:', value: '', indent: true },
      { text: '        memory: "128Mi"', key: '        memory:', value: ' "128Mi"', indent: true },
    ],
    explanation: 'The containers array defines what runs inside the Pod. Each container has a name, image, exposed ports, and resource limits to prevent runaway usage.',
  },
];

const multiContainerPatterns = [
  {
    id: 'sidecar',
    label: 'Sidecar',
    description: 'A helper container that enhances the main application. Common uses include log collection, metrics export, and TLS proxying.',
    mainLabel: 'App Server',
    mainColor: 'bg-blue-600 border-blue-400',
    sideLabel: 'Log Collector',
    sideColor: 'bg-emerald-600 border-emerald-400',
    flowLabel: 'Shared Log Volume',
  },
  {
    id: 'init',
    label: 'Init Container',
    description: 'Runs to completion before the main container starts. Used for setup tasks like database migrations, config fetching, or waiting for dependencies.',
    mainLabel: 'App Server',
    mainColor: 'bg-blue-600 border-blue-400',
    sideLabel: 'DB Migration',
    sideColor: 'bg-orange-600 border-orange-400',
    flowLabel: 'Runs First, Then Exits',
  },
  {
    id: 'ambassador',
    label: 'Ambassador',
    description: 'A proxy container that simplifies external service access. The main container connects to localhost, and the ambassador handles routing to the remote service.',
    mainLabel: 'App Server',
    mainColor: 'bg-blue-600 border-blue-400',
    sideLabel: 'Proxy',
    sideColor: 'bg-violet-600 border-violet-400',
    flowLabel: 'Proxied Requests',
  },
];

type LifecycleState = 'idle' | 'Pending' | 'ContainerCreating' | 'Running' | 'Succeeded' | 'Failed' | 'ImagePullBackOff' | 'CrashLoopBackOff';

const lifecycleStates: { state: LifecycleState; color: string; icon: React.ReactNode; detail: string }[] = [
  { state: 'Pending', color: 'bg-yellow-500', icon: <Clock size={20} />, detail: 'Scheduler selects a Node' },
  { state: 'ContainerCreating', color: 'bg-blue-500', icon: <Loader size={20} />, detail: 'Pulling image & starting container' },
  { state: 'Running', color: 'bg-green-500', icon: <Play size={20} />, detail: 'All containers are running' },
  { state: 'Succeeded', color: 'bg-emerald-500', icon: <CheckCircle size={20} />, detail: 'All containers exited successfully' },
];

const errorStates: { state: LifecycleState; color: string; detail: string }[] = [
  { state: 'ImagePullBackOff', color: 'bg-red-500', detail: 'Image not found or registry auth failed' },
  { state: 'CrashLoopBackOff', color: 'bg-red-600', detail: 'Container starts, crashes, restarts repeatedly' },
];

export const Pods: React.FC<PodsProps> = ({ onComplete }) => {
  const [scene, setScene] = useState(0);
  const [activeYamlSection, setActiveYamlSection] = useState<string | null>(null);
  const [yamlApplied, setYamlApplied] = useState(false);
  const [activePattern, setActivePattern] = useState(0);
  const [lifecyclePhase, setLifecyclePhase] = useState<LifecycleState>('idle');
  const [lifecycleIndex, setLifecycleIndex] = useState(-1);
  const [showError, setShowError] = useState<LifecycleState | null>(null);
  const [anatomySection, setAnatomySection] = useState<string | null>(null);

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));

  const runLifecycle = () => {
    setShowError(null);
    setLifecycleIndex(0);
    setLifecyclePhase('Pending');
  };

  useEffect(() => {
    if (lifecycleIndex < 0 || lifecycleIndex >= lifecycleStates.length) return;
    setLifecyclePhase(lifecycleStates[lifecycleIndex].state);
    if (lifecycleIndex < lifecycleStates.length - 1) {
      const timer = setTimeout(() => {
        setLifecycleIndex(prev => prev + 1);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [lifecycleIndex]);

  const triggerError = (errorState: LifecycleState) => {
    setLifecycleIndex(-1);
    setLifecyclePhase(errorState);
    setShowError(errorState);
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">

      {/* Scene 0: What is a Pod? */}
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
              <Ship size={56} className="text-mcb-400" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold text-mcb-50"
          >
            The Pod
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-mcb-200 leading-relaxed"
          >
            Think of a Pod as an <strong className="text-mcb-50">apartment</strong> and containers as <strong className="text-mcb-50">tenants</strong>.
            They share the same address (IP), the same hallways (network namespace), and common utilities (storage volumes).
            A Pod is the smallest thing you can deploy in Kubernetes.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {podFacts.map((fact, index) => (
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
              Let's Explore <ArrowRight />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Scene 1: Pod Anatomy */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Pod Anatomy</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Click each section to learn how containers inside a Pod share resources.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Interactive Anatomy Diagram */}
            <div className="relative h-[420px] bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 flex items-center justify-center p-6 overflow-hidden">
              {/* Pod boundary */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="relative w-full h-full border-2 border-dashed border-mcb-500 rounded-2xl flex flex-col items-center justify-between py-6 px-4"
              >
                {/* Pod label */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mcb-950 px-3 text-mcb-400 font-bold flex items-center gap-2 text-sm">
                  <Ship size={14} /> Pod: my-app
                </div>

                {/* Pod IP */}
                <motion.button
                  onClick={() => setAnatomySection(anatomySection === 'ip' ? null : 'ip')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-2 rounded-lg border font-mono text-sm cursor-pointer transition-colors ${anatomySection === 'ip' ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-mcb-900/50 border-mcb-700 text-mcb-300 hover:border-mcb-500'}`}
                >
                  IP: 10.244.1.5
                </motion.button>

                {/* Containers row */}
                <div className="flex items-center gap-6 relative">
                  {/* Container A */}
                  <motion.button
                    onClick={() => setAnatomySection(anatomySection === 'containers' ? null : 'containers')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${anatomySection === 'containers' ? 'bg-blue-600/30 border-blue-400' : 'bg-mcb-800/60 border-mcb-600 hover:border-mcb-400'}`}
                  >
                    <Box size={28} className="text-blue-400 mb-1" />
                    <span className="text-xs font-bold text-mcb-50">nginx</span>
                    <span className="text-[10px] text-mcb-400">:80</span>
                  </motion.button>

                  {/* SVG connection lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 120">
                    <motion.line
                      x1="115" y1="60" x2="165" y2="60"
                      stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3"
                      initial={{ opacity: 0, strokeDashoffset: 0 }}
                      animate={{ opacity: 0.6, strokeDashoffset: -14 }}
                      transition={{
                        opacity: { delay: 0.6, duration: 0.4 },
                        strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                      }}
                    />
                  </svg>

                  {/* Container B */}
                  <motion.button
                    onClick={() => setAnatomySection(anatomySection === 'containers' ? null : 'containers')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${anatomySection === 'containers' ? 'bg-emerald-600/30 border-emerald-400' : 'bg-mcb-800/60 border-mcb-600 hover:border-mcb-400'}`}
                  >
                    <Box size={28} className="text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-mcb-50">log-agent</span>
                    <span className="text-[10px] text-mcb-400">:9090</span>
                  </motion.button>
                </div>

                {/* Shared namespace bar */}
                <motion.button
                  onClick={() => setAnatomySection(anatomySection === 'network' ? null : 'network')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`w-full flex items-center justify-center gap-3 py-2 rounded-lg border cursor-pointer transition-colors ${anatomySection === 'network' ? 'bg-purple-500/20 border-purple-400 text-purple-200' : 'bg-mcb-900/50 border-mcb-700 text-mcb-400 hover:border-mcb-500'}`}
                >
                  <Network size={14} /> Shared Network (localhost)
                </motion.button>

                {/* Shared volume bar */}
                <motion.button
                  onClick={() => setAnatomySection(anatomySection === 'volume' ? null : 'volume')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className={`w-full flex items-center justify-center gap-3 py-2 rounded-lg border cursor-pointer transition-colors ${anatomySection === 'volume' ? 'bg-teal-500/20 border-teal-400 text-teal-200' : 'bg-mcb-900/50 border-mcb-700 text-mcb-400 hover:border-mcb-500'}`}
                >
                  <HardDrive size={14} /> Shared Volume: /var/log
                </motion.button>
              </motion.div>
            </div>

            {/* Explanation Panel */}
            <div className="flex flex-col gap-4 text-left">
              <AnimatePresence mode="wait">
                {anatomySection === 'ip' && (
                  <motion.div key="ip" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-amber-900/20 p-6 rounded-xl border border-amber-500/30">
                    <h3 className="text-xl font-bold text-amber-200 mb-2">Unique Pod IP</h3>
                    <p className="text-amber-100/80 text-sm leading-relaxed">
                      Every Pod gets its own IP address within the cluster network. All containers inside the Pod share this IP. Other Pods communicate with this Pod using this address. When the Pod dies, the IP is released.
                    </p>
                  </motion.div>
                )}
                {anatomySection === 'containers' && (
                  <motion.div key="containers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30">
                    <h3 className="text-xl font-bold text-blue-200 mb-2">Containers</h3>
                    <p className="text-blue-100/80 text-sm leading-relaxed">
                      A Pod can hold one or more containers. They are co-located on the same Node and can communicate via <code className="text-blue-300">localhost</code>. The nginx container serves on port 80, and the log-agent collects logs on port 9090 - both reachable within the Pod without network hops.
                    </p>
                  </motion.div>
                )}
                {anatomySection === 'network' && (
                  <motion.div key="network" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-purple-900/20 p-6 rounded-xl border border-purple-500/30">
                    <h3 className="text-xl font-bold text-purple-200 mb-2">Shared Network Namespace</h3>
                    <p className="text-purple-100/80 text-sm leading-relaxed">
                      All containers in a Pod share the same network namespace. This means they share the same IP address and port space. Container A can reach Container B at <code className="text-purple-300">localhost:9090</code> without any special configuration.
                    </p>
                  </motion.div>
                )}
                {anatomySection === 'volume' && (
                  <motion.div key="volume" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-teal-900/20 p-6 rounded-xl border border-teal-500/30">
                    <h3 className="text-xl font-bold text-teal-200 mb-2">Shared Storage Volumes</h3>
                    <p className="text-teal-100/80 text-sm leading-relaxed">
                      Volumes defined at the Pod level can be mounted into multiple containers. Here, both nginx and log-agent mount <code className="text-teal-300">/var/log</code>. Nginx writes access logs, and the log-agent reads and ships them to a central logging service.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!anatomySection && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 text-mcb-300 text-sm">
                  Click on any section in the diagram to learn more about it.
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: YAML Manifest <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 2: YAML Manifest */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Pod YAML Manifest</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Click any section to understand what it does. Then apply the manifest to create a Pod.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* YAML code block */}
            <div className="bg-black/40 rounded-xl border border-mcb-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-mcb-800 bg-mcb-900/50">
                <span className="text-xs text-mcb-400 font-mono">pod.yaml</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <div className="p-4 font-mono text-sm space-y-0 text-left">
                {yamlSections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveYamlSection(activeYamlSection === section.id ? null : section.id)}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}
                    className={`block w-full text-left rounded px-2 py-0.5 cursor-pointer transition-colors border-l-2 ${activeYamlSection === section.id ? 'border-mcb-400 bg-mcb-500/10' : 'border-transparent'}`}
                  >
                    {section.lines.map((line, i) => (
                      <div key={i} className="text-mcb-300 leading-relaxed">
                        <span className="text-mcb-400">{line.key}</span>
                        <span className="text-mcb-50">{line.value}</span>
                      </div>
                    ))}
                  </motion.button>
                ))}
              </div>

              <div className="p-4 border-t border-mcb-800">
                <Button
                  onClick={() => setYamlApplied(true)}
                  disabled={yamlApplied}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {yamlApplied ? (
                    <><CheckCircle size={18} /> Pod Created</>
                  ) : (
                    <><Terminal size={18} /> Apply Manifest</>
                  )}
                </Button>
              </div>
            </div>

            {/* Explanation + terminal output */}
            <div className="space-y-4 text-left">
              <AnimatePresence mode="wait">
                {activeYamlSection && (
                  <motion.div
                    key={activeYamlSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-500/30"
                  >
                    <h3 className="text-lg font-bold text-mcb-200 mb-2">
                      {yamlSections.find(s => s.id === activeYamlSection)?.label}
                    </h3>
                    <p className="text-mcb-300 text-sm leading-relaxed">
                      {yamlSections.find(s => s.id === activeYamlSection)?.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {yamlApplied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/50 p-5 rounded-xl font-mono text-sm border border-mcb-700 space-y-2"
                >
                  <div className="text-mcb-400 mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
                    <Terminal size={14} /> Terminal
                  </div>
                  <p className="text-mcb-50">$ kubectl apply -f pod.yaml</p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-green-400"
                  >
                    pod/my-app created
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    <p className="text-mcb-50 mt-2">$ kubectl get pod my-app</p>
                    <div className="text-mcb-300 mt-1">
                      <p>NAME{'     '}READY{'   '}STATUS{'    '}RESTARTS{'   '}AGE</p>
                      <p>
                        my-app{'   '}
                        <span className="text-green-400">1/1</span>{'     '}
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-green-400"
                        >
                          Running
                        </motion.span>
                        {'   '}0{'          '}3s
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {!activeYamlSection && !yamlApplied && (
                <div className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 text-mcb-300 text-sm">
                  Click on any highlighted section in the YAML to see what it does.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Multi-Container Patterns <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 3: Multi-Container Patterns */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Multi-Container Patterns</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            While most Pods have a single container, these patterns solve real production problems with multi-container Pods.
          </p>

          {/* Tab selector */}
          <div className="flex justify-center gap-2">
            {multiContainerPatterns.map((pattern, index) => (
              <Button
                key={pattern.id}
                onClick={() => setActivePattern(index)}
                variant={activePattern === index ? 'primary' : 'outline'}
                className="text-sm px-5 py-2"
              >
                {pattern.label}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={multiContainerPatterns[activePattern].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              {/* Diagram */}
              <div className="relative h-[320px] bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 flex items-center justify-center p-8 overflow-hidden">
                {/* Pod boundary */}
                <div className="relative w-full h-full border-2 border-dashed border-mcb-500/50 rounded-2xl flex items-center justify-center gap-8 px-6">
                  <div className="absolute -top-3 left-4 bg-mcb-950 px-2 text-mcb-400 text-xs font-mono">Pod</div>

                  {activePattern === 1 ? (
                    /* Init Container: Sequential timeline */
                    <div className="flex items-center gap-4 w-full justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, opacity: [1, 1, 0.4] }}
                        transition={{ scale: { type: 'spring', stiffness: 200, damping: 18 }, opacity: { delay: 1.2, duration: 0.4 } }}
                        className={`w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center ${multiContainerPatterns[activePattern].sideColor}`}
                      >
                        <Box size={24} className="text-mcb-50 mb-1" />
                        <span className="text-xs font-bold text-mcb-50">{multiContainerPatterns[activePattern].sideLabel}</span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="text-[10px] text-mcb-50/70 mt-1"
                        >
                          Completed
                        </motion.span>
                      </motion.div>

                      <div className="flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                          className="w-12 h-0.5 bg-mcb-400"
                        />
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="text-[10px] text-mcb-400"
                        >
                          then
                        </motion.span>
                      </div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.4, type: 'spring', stiffness: 200, damping: 18 }}
                        className={`w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center ${multiContainerPatterns[activePattern].mainColor}`}
                      >
                        <Box size={24} className="text-mcb-50 mb-1" />
                        <span className="text-xs font-bold text-mcb-50">{multiContainerPatterns[activePattern].mainLabel}</span>
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-[10px] text-green-300 mt-1"
                        >
                          Running
                        </motion.span>
                      </motion.div>
                    </div>
                  ) : (
                    /* Sidecar and Ambassador: Side by side with data flow */
                    <div className="flex items-center gap-6 w-full justify-center relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                        className={`w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center ${multiContainerPatterns[activePattern].mainColor}`}
                      >
                        <Box size={24} className="text-mcb-50 mb-1" />
                        <span className="text-xs font-bold text-mcb-50">{multiContainerPatterns[activePattern].mainLabel}</span>
                      </motion.div>

                      {/* Data flow SVG */}
                      <svg className="w-20 h-16" viewBox="0 0 80 60">
                        <motion.line
                          x1="0" y1="30" x2="80" y2="30"
                          stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3"
                          initial={{ opacity: 0, strokeDashoffset: 0 }}
                          animate={{ opacity: 1, strokeDashoffset: activePattern === 2 ? 14 : -14 }}
                          transition={{
                            opacity: { delay: 0.5, duration: 0.3 },
                            strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' },
                          }}
                        />
                        <motion.text
                          x="40" y="12" textAnchor="middle" fill="#a5b4fc" fontSize="7" fontFamily="monospace"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          {activePattern === 0 ? 'logs' : 'request'}
                        </motion.text>
                      </svg>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 18 }}
                        className={`w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center ${multiContainerPatterns[activePattern].sideColor}`}
                      >
                        <Box size={24} className="text-mcb-50 mb-1" />
                        <span className="text-xs font-bold text-mcb-50">{multiContainerPatterns[activePattern].sideLabel}</span>
                      </motion.div>

                      {/* Ambassador external service indicator */}
                      {activePattern === 2 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                          className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full"
                        >
                          <div className="flex items-center gap-2 bg-mcb-900/60 border border-mcb-700 rounded-lg px-3 py-2 text-xs text-mcb-300">
                            <Network size={12} /> External DB
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="text-left space-y-4">
                <h3 className="text-2xl font-bold text-mcb-50">{multiContainerPatterns[activePattern].label} Pattern</h3>
                <p className="text-mcb-200 leading-relaxed">
                  {multiContainerPatterns[activePattern].description}
                </p>
                <div className="bg-mcb-900/30 p-4 rounded-lg border border-mcb-800/50">
                  <span className="text-xs text-mcb-400 font-mono uppercase tracking-wider">Connection</span>
                  <p className="text-mcb-200 mt-1 font-medium">{multiContainerPatterns[activePattern].flowLabel}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Pod Lifecycle <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 4: Pod Lifecycle */}
      {scene === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Pod Lifecycle</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            A Pod transitions through well-defined states. Watch the journey from creation to completion, and see what happens when things go wrong.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* State machine visualization */}
            <div className="relative h-[420px] bg-mcb-950/50 rounded-2xl border-2 border-mcb-800 flex flex-col items-center justify-center p-6 overflow-hidden">
              {/* State nodes */}
              <div className="flex flex-col gap-3 w-full max-w-xs">
                {lifecycleStates.map((ls, index) => {
                  const isActive = lifecyclePhase === ls.state;
                  const isPast = lifecycleIndex > index;
                  return (
                    <motion.div
                      key={ls.state}
                      initial={{ opacity: 0.4, x: -10 }}
                      animate={{
                        opacity: isActive ? 1 : isPast ? 0.6 : 0.3,
                        x: 0,
                        scale: isActive ? 1.02 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${isActive ? `${ls.color}/20 border-white/40 shadow-lg` : isPast ? 'bg-mcb-900/30 border-mcb-700/50' : 'bg-mcb-900/20 border-mcb-800/30'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? ls.color : isPast ? 'bg-mcb-700' : 'bg-mcb-800'}`}>
                        {isPast ? <CheckCircle size={16} className="text-mcb-50" /> : ls.icon}
                      </div>
                      <div className="text-left flex-1">
                        <p className={`text-sm font-bold ${isActive ? 'text-mcb-50' : 'text-mcb-400'}`}>{ls.state}</p>
                        <p className="text-[10px] text-mcb-400">{ls.detail}</p>
                      </div>
                      {isActive && (
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className={`w-2.5 h-2.5 rounded-full ${ls.color}`}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Error states overlay */}
              <AnimatePresence>
                {showError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 bg-mcb-950/90 backdrop-blur-sm flex items-center justify-center rounded-2xl"
                  >
                    <div className="text-center space-y-4 p-8">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <XCircle size={56} className="text-red-500 mx-auto" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-red-400">{showError}</h3>
                      <p className="text-red-200/70 text-sm max-w-xs">
                        {errorStates.find(e => e.state === showError)?.detail}
                      </p>
                      <Button
                        onClick={() => { setShowError(null); setLifecyclePhase('idle'); setLifecycleIndex(-1); }}
                        variant="outline"
                        className="text-sm border-red-500/50 text-red-300 hover:border-red-400"
                      >
                        Reset
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="space-y-6 text-left">
              <div className="bg-mcb-900/30 p-6 rounded-xl border border-mcb-800/50 space-y-4">
                <h3 className="text-lg font-bold text-mcb-50">Controls</h3>
                <Button
                  onClick={runLifecycle}
                  disabled={lifecycleIndex >= 0 && lifecycleIndex < lifecycleStates.length - 1}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Play size={18} /> Create Pod
                </Button>

                <div className="pt-2 border-t border-mcb-800">
                  <p className="text-xs text-mcb-400 uppercase tracking-wider mb-3">Simulate Errors</p>
                  <div className="flex flex-col gap-2">
                    {errorStates.map((err) => (
                      <Button
                        key={err.state}
                        onClick={() => triggerError(err.state)}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-sm border-red-800/50 text-red-300 hover:border-red-500"
                      >
                        <AlertCircle size={14} /> {err.state}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-mcb-900/20 p-4 rounded-lg border border-mcb-500/30">
                <h4 className="font-bold text-mcb-300 mb-2 text-sm">Current State</h4>
                <p className="text-mcb-200 text-sm">
                  {lifecyclePhase === 'idle' && 'Click "Create Pod" to watch the lifecycle unfold, or trigger an error scenario.'}
                  {lifecyclePhase === 'Pending' && 'The scheduler is evaluating nodes to find the best fit for this Pod based on resource requests and constraints.'}
                  {lifecyclePhase === 'ContainerCreating' && 'The kubelet on the assigned node is pulling the container image and starting the container process.'}
                  {lifecyclePhase === 'Running' && 'All containers are up and healthy. The Pod is serving traffic and ready for work.'}
                  {lifecyclePhase === 'Succeeded' && 'The Pod completed its work. All containers exited with code 0. For Jobs and batch tasks, this is the desired end state.'}
                  {lifecyclePhase === 'ImagePullBackOff' && 'Kubernetes cannot pull the container image. Check the image name, tag, and registry credentials.'}
                  {lifecyclePhase === 'CrashLoopBackOff' && 'The container keeps crashing after startup. Kubernetes applies exponential backoff between restart attempts (10s, 20s, 40s...).'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Where do Pods live? (Nodes) <ArrowRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
