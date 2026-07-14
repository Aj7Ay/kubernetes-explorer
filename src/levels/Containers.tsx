import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { useTheme } from '../ThemeContext';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Terminal,
  Database,
  Network,
  HardDrive,
  Trash2,
  Box,
  Globe,
  Server,
  Package,
  Download,
  Cloud,
  Lock,
  Route,
  Shield,
  CheckCircle,
  XCircle,
  FileCode,
  Zap,
  Eye,
  Play,
  Square,
} from 'lucide-react';

/* ── Typewriter terminal line component ── */
const TypewriterLine: React.FC<{
  text: string;
  delay: number;
  className?: string;
  cursor?: boolean;
}> = ({ text, delay, className = '', cursor = false }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, 18);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-green-400 ml-0.5 align-middle"
        />
      )}
    </span>
  );
};

/* ── Terminal chrome wrapper ── */
const TerminalBlock: React.FC<{
  title: string;
  children: React.ReactNode;
  delay?: number;
}> = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 200, damping: 25 }}
    className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden"
  >
    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800">
      <div className="flex gap-1.5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="w-2.5 h-2.5 rounded-full bg-red-500"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.15 }}
          className="w-2.5 h-2.5 rounded-full bg-yellow-500"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="w-2.5 h-2.5 rounded-full bg-green-500"
        />
      </div>
      <span className="text-[10px] font-mono text-slate-400 ml-2">{title}</span>
    </div>
    <div className="p-4 font-mono text-sm text-left space-y-1">
      {children}
    </div>
  </motion.div>
);

/* ── Command row with copy hint ── */
const CmdRow: React.FC<{
  cmd: string;
  comment?: string;
  delay?: number;
  highlight?: string;
}> = ({ cmd, comment, delay = 0, highlight = 'text-green-400' }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, type: 'spring', stiffness: 180, damping: 20 }}
    className="group flex items-start gap-1"
  >
    <span className="text-slate-500 select-none">$</span>
    <span className={`${highlight} font-semibold`}>{cmd}</span>
    {comment && <span className="text-slate-600 ml-2">{'# ' + comment}</span>}
  </motion.div>
);

interface ContainersProps {
  onComplete: () => void;
}

export const Containers: React.FC<ContainersProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [scene, setScene] = useState(0);
  const [buildStep, setBuildStep] = useState(0);
  const [isRunExecuted, setIsRunExecuted] = useState(false);
  const [lifecycleStep, setLifecycleStep] = useState(0);
  const [composeStep, setComposeStep] = useState(0);
  const [showEssentials, setShowEssentials] = useState(false);

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));

  /* ── Dockerfile layers — drives both terminal + visual ── */
  const layers = [
    { id: 'os', name: 'FROM ubuntu:22.04', desc: 'Base OS', color: 'bg-slate-600', detail: 'Minimal Linux filesystem as the foundation' },
    { id: 'deps', name: 'RUN apt-get update && apt-get install -y python3 python3-pip', desc: 'System Deps', color: 'bg-blue-600', detail: 'Install runtime + package manager' },
    { id: 'workdir', name: 'WORKDIR /app', desc: 'Work Dir', color: 'bg-indigo-500', detail: 'Set the working directory inside container' },
    { id: 'reqs', name: 'COPY requirements.txt .', desc: 'Copy Deps', color: 'bg-cyan-600', detail: 'Copy deps manifest first (layer cache trick)' },
    { id: 'install', name: 'RUN pip3 install --no-cache-dir -r requirements.txt', desc: 'Install Deps', color: 'bg-teal-500', detail: 'Install Python dependencies' },
    { id: 'code', name: 'COPY . .', desc: 'App Code', color: 'bg-yellow-500', detail: 'Copy application source code' },
    { id: 'expose', name: 'EXPOSE 8080', desc: 'Port', color: 'bg-orange-500', detail: 'Declare which port the app listens on' },
    { id: 'cmd', name: 'CMD ["python3", "app.py"]', desc: 'Entrypoint', color: 'bg-green-500', detail: 'Default command when container starts' },
  ];

  return (
    <div className="min-h-[600px] flex flex-col items-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">

      {/* ═══════════════════════════════════════════════ */}
      {/* Scene 0: What is Docker?                       */}
      {/* ═══════════════════════════════════════════════ */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="space-y-4"
          >
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Docker: The Shipping Container
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-mcb-200 max-w-3xl mx-auto leading-relaxed"
            >
              Remember the "Works on My Machine" problem? Docker solves it by packaging your app
              <strong className="text-mcb-50"> with its entire environment</strong> into a portable container.
            </motion.p>
          </motion.div>

          {/* Before vs After comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before: Traditional */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 160, damping: 20 }}
              className={`rounded-2xl border-2 p-6 text-left ${
                isLight ? 'border-red-200 bg-red-50' : 'border-red-500/30 bg-red-950/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }} transition={{ delay: 0.5, type: 'spring' }}>
                  <XCircle size={20} className="text-red-500" />
                </motion.div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-red-700' : 'text-red-300'}`}>Without Docker</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'App Code', icon: FileCode },
                  { label: 'Pray the server has Python 3.12', icon: AlertTriangle },
                  { label: 'Pray it has the right OpenSSL', icon: AlertTriangle },
                  { label: 'Pray configs match', icon: AlertTriangle },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                        i > 0
                          ? (isLight ? 'bg-red-100 text-red-700' : 'bg-red-950/30 text-red-300')
                          : (isLight ? 'bg-slate-100 text-slate-700' : 'bg-mcb-900/40 text-mcb-200')
                      }`}
                    >
                      <Icon size={16} className={i > 0 ? 'text-red-500' : 'text-mcb-400'} />
                      {item.label}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* After: Docker */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 160, damping: 20 }}
              className={`rounded-2xl border-2 p-6 text-left ${
                isLight ? 'border-green-200 bg-green-50' : 'border-green-500/30 bg-green-950/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }}>
                  <CheckCircle size={20} className="text-green-500" />
                </motion.div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-green-700' : 'text-green-300'}`}>With Docker</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'App Code', icon: FileCode },
                  { label: 'Python 3.12 (bundled)', icon: CheckCircle },
                  { label: 'OpenSSL 3.2 (bundled)', icon: CheckCircle },
                  { label: 'All configs (bundled)', icon: CheckCircle },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 200 }}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                        i > 0
                          ? (isLight ? 'bg-green-100 text-green-700' : 'bg-green-950/30 text-green-300')
                          : (isLight ? 'bg-slate-100 text-slate-700' : 'bg-mcb-900/40 text-mcb-200')
                      }`}
                    >
                      <Icon size={16} className={i > 0 ? 'text-green-500' : 'text-mcb-400'} />
                      {item.label}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Key concepts cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Image', body: 'A read-only template with everything your app needs. Like a recipe - you can create many dishes from one recipe.', icon: Package, color: 'text-blue-500' },
              { title: 'Container', body: 'A running instance of an image. Isolated from other containers and the host. Like a sealed shipping container.', icon: Box, color: 'text-green-500' },
              { title: 'Registry', body: 'A place to store and share images. Docker Hub is the public registry. Your company may have a private one.', icon: Cloud, color: 'text-purple-500' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.9 + i * 0.12, type: 'spring', stiffness: 180, damping: 20 }}
                  whileHover={{ y: -6, scale: 1.03, boxShadow: '0 12px 40px rgba(59,130,246,0.15)' }}
                  className={`rounded-xl border p-4 text-left cursor-default ${
                    isLight ? 'border-slate-200 bg-slate-50' : 'border-mcb-800/40 bg-mcb-950/30'
                  }`}
                >
                  <motion.div initial={{ rotate: -20 }} animate={{ rotate: 0 }} transition={{ delay: 1 + i * 0.12, type: 'spring' }}>
                    <Icon size={24} className={`${card.color} mb-2`} />
                  </motion.div>
                  <p className="text-sm font-bold text-mcb-50">{card.title}</p>
                  <p className="text-xs text-mcb-200 mt-1.5 leading-relaxed">{card.body}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Container isolation visual */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className={`rounded-xl border p-5 text-left max-w-3xl mx-auto ${
              isLight ? 'border-blue-200 bg-blue-50' : 'border-mcb-500/30 bg-mcb-900/40'
            }`}
          >
            <p className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
              <Shield size={16} /> How Containers Isolate
            </p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { name: 'PID Namespace', desc: 'Own process tree' },
                { name: 'Network NS', desc: 'Own IP address' },
                { name: 'Mount NS', desc: 'Own filesystem' },
              ].map((ns, i) => (
                <motion.div
                  key={ns.name}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.12, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-lg border p-2 text-center ${
                    isLight ? 'border-blue-200 bg-white' : 'border-mcb-700/40 bg-mcb-950/40'
                  }`}
                >
                  <p className="text-xs font-bold text-mcb-50">{ns.name}</p>
                  <p className="text-[10px] text-mcb-300 mt-0.5">{ns.desc}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-mcb-200 mt-3 leading-relaxed">
              Containers use Linux kernel features (<strong className="text-mcb-50">namespaces</strong> for isolation and <strong className="text-mcb-50">cgroups</strong> for resource limits) to create lightweight, isolated environments - without the overhead of virtual machines.
            </p>
          </motion.div>

          <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
            Let's Build One <ArrowRight />
          </Button>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Scene 1: Docker Build — Full Dockerfile         */}
      {/* ═══════════════════════════════════════════════ */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-6 text-left">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 160 }}
              className="text-3xl font-bold text-mcb-50 flex items-center gap-3"
            >
              <Terminal className="text-blue-500" />
              Step 1: docker build
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-mcb-200"
            >
              A Docker image is an <strong className="text-mcb-50">immutable</strong> file built from layers.
              Each instruction in a <code className={`px-1 rounded ${isLight ? 'bg-slate-200' : 'bg-mcb-800/50'}`}>Dockerfile</code> creates a new cached layer.
            </motion.p>

            {/* Terminal — full Dockerfile */}
            <TerminalBlock title="Dockerfile" delay={0.3}>
              <div className="pb-2 border-b border-slate-700">
                <CmdRow cmd="docker build -t my-app:v1 ." delay={0.4} highlight="text-slate-200" />
              </div>
              <div className="mt-2 space-y-1">
                {layers.map((layer, index) => (
                  <motion.div
                    key={layer.id}
                    initial={{ opacity: 0.15, x: -6 }}
                    animate={{
                      opacity: buildStep > index ? 1 : 0.15,
                      x: buildStep > index ? 0 : -6,
                    }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className={`p-1.5 rounded transition-colors ${
                      buildStep > index ? 'text-white bg-slate-800/60' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-blue-400 font-bold">{layer.name.split(' ')[0]}</span>{' '}
                    <span className="text-slate-200">{layer.name.split(' ').slice(1).join(' ')}</span>
                    {buildStep > index && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-slate-500 text-xs ml-2"
                      >
                        ← {layer.detail}
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Build output after all layers */}
              <AnimatePresence>
                {buildStep >= layers.length && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ type: 'spring', stiffness: 150 }}
                    className="mt-3 pt-3 border-t border-slate-700 space-y-1"
                  >
                    <div className="text-green-400 font-bold">Successfully built a1b2c3d4e5f6</div>
                    <div className="text-green-400 font-bold">Successfully tagged my-app:v1</div>
                    <div className="text-slate-500 mt-3">$ docker images</div>
                    <div className="text-slate-400 text-xs mt-1">
                      <div className="grid grid-cols-5 gap-2 text-slate-500 border-b border-slate-700 pb-1">
                        <span>REPOSITORY</span><span>TAG</span><span>IMAGE ID</span><span>SIZE</span><span>CREATED</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-1 text-slate-200">
                        <span>my-app</span><span>v1</span><span>a1b2c3d4</span><span>247MB</span><span>2s ago</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TerminalBlock>

            <Button
              onClick={() => setBuildStep(prev => Math.min(prev + 1, layers.length))}
              className="w-full"
              disabled={buildStep >= layers.length}
            >
              {buildStep < layers.length ? `Add Layer ${buildStep + 1}/${layers.length}` : 'Build Complete!'}
            </Button>

            {buildStep >= layers.length && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <Button onClick={prevScene} variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft size={20} /> Back
                </Button>
                <Button onClick={nextScene} variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                  Next: Docker Run <ArrowRight />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Visual: Layer stacking */}
          <div className={`h-[500px] rounded-2xl border-2 flex items-center justify-center p-6 relative overflow-hidden ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-mcb-800 bg-mcb-950/50'
          }`}>
            <AnimatePresence mode="wait">
              {buildStep < layers.length ? (
                <div className="flex flex-col-reverse items-center justify-start h-full w-full pt-8">
                  {/* Layer count indicator */}
                  <motion.div
                    className="absolute top-4 right-4 text-xs text-mcb-300 font-mono"
                    key={buildStep}
                  >
                    {buildStep}/{layers.length} layers
                  </motion.div>
                  <AnimatePresence>
                    {layers.map((layer, index) => (
                      buildStep > index && (
                        <motion.div
                          key={layer.id}
                          initial={{ y: -200, opacity: 0, scale: 1.15, rotateX: -20 }}
                          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                          className={`w-56 h-11 mb-1 rounded-lg flex items-center justify-center border border-white/20 text-white font-bold text-sm shadow-lg ${layer.color}`}
                        >
                          {layer.desc}
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  key="final-image"
                  initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="w-48 h-48 bg-mcb-600 rounded-xl border-4 border-mcb-400 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.4)] relative">
                    <Package size={64} className="text-white mb-2" />
                    <span className="font-bold text-white text-lg">My App Image</span>
                    <span className="text-xs text-blue-200 font-mono mt-1">v1 · {layers.length} layers · 247MB</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-2 border-dashed border-white/20 rounded-xl"
                    />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`mt-6 font-mono px-4 py-2 rounded-lg text-sm ${
                      isLight ? 'bg-slate-100 text-slate-600' : 'bg-mcb-900/50 text-mcb-300'
                    }`}
                  >
                    IMAGE ID: a1b2c3d4 · {layers.length} layers
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Scene 2: Docker Run — Full commands              */}
      {/* ═══════════════════════════════════════════════ */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' }}
            className="text-3xl font-bold text-mcb-50"
          >
            Step 2: docker run
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-mcb-200 max-w-3xl mx-auto"
          >
            Running creates a <strong className="text-mcb-50">writable layer</strong> on top of the read-only image.
            This combination becomes the live <strong className="text-mcb-50">container</strong> - isolated from the host.
          </motion.p>

          <div className={`h-[400px] rounded-2xl border-2 relative overflow-hidden p-8 flex items-center justify-center ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-mcb-800 bg-mcb-950/50'
          }`}>
            {!isRunExecuted ? (
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-32 bg-mcb-600 rounded-xl border-4 border-mcb-400 flex flex-col items-center justify-center shadow-lg mx-auto opacity-50 grayscale"
                >
                  <Package size={40} className="text-white mb-2" />
                  <span className="font-bold text-white text-sm">My App Image</span>
                </motion.div>
                <Button
                  onClick={() => setIsRunExecuted(true)}
                  className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto bg-green-600 hover:bg-green-700"
                >
                  <Play size={20} /> Execute: docker run
                </Button>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* The Base Image */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute z-10 w-48 h-48 bg-mcb-800 rounded-xl border-2 border-mcb-500 flex flex-col items-center justify-center"
                >
                  <Package size={48} className="text-mcb-300 mb-2" />
                  <span className="text-mcb-200 font-bold">Read-Only Image</span>
                </motion.div>

                {/* Writable Layer */}
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="absolute z-20 w-48 h-12 -mt-24 bg-green-500/90 rounded-t-xl border-2 border-green-400 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                >
                  Writable Layer
                </motion.div>

                {/* Ports */}
                <motion.div
                  initial={{ x: -200, opacity: 0 }}
                  animate={{ x: -140, opacity: 1 }}
                  transition={{ delay: 1.5, type: 'spring' }}
                  className="absolute z-30 bg-blue-600 text-white p-2 rounded-lg flex items-center gap-2 shadow-lg"
                >
                  <Network size={16} /> -p 80:8080
                  <div className="absolute right-[-40px] top-1/2 h-1 w-10 bg-blue-600" />
                </motion.div>

                {/* Volumes */}
                <motion.div
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 140, opacity: 1 }}
                  transition={{ delay: 1.8, type: 'spring' }}
                  className="absolute z-30 bg-yellow-600 text-white p-2 rounded-lg flex items-center gap-2 shadow-lg"
                >
                  <div className="absolute left-[-40px] top-1/2 h-1 w-10 bg-yellow-600" />
                  -v /data <HardDrive size={16} />
                </motion.div>

                {/* Name tag */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.1, type: 'spring', bounce: 0.5 }}
                  className="absolute z-30 -mt-44 bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg text-sm"
                >
                  --name my-app
                </motion.div>

                {/* Container Boundary */}
                <motion.div
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className={`absolute z-40 w-80 h-80 border-4 border-dashed rounded-3xl flex items-end justify-center pb-4 ${
                    isLight ? 'border-mcb-400/40' : 'border-white/30'
                  }`}
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-green-500 font-mono font-bold bg-green-900/50 px-4 py-1 rounded-full"
                  >
                    STATUS: RUNNING
                  </motion.div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Full docker run command with flag explanations */}
          <TerminalBlock title="terminal — docker run" delay={0.3}>
            <div className="text-slate-500 text-xs mb-2"># Full docker run command with all common flags:</div>
            <div className="text-slate-200">
              <span className="text-green-400 font-bold">docker run</span>{' '}
              <span className="text-blue-300">-d</span>{' '}
              <span className="text-slate-500">\</span>
            </div>
            <div className="pl-4">
              <span className="text-purple-400">--name</span>{' '}
              <span className="text-slate-200">my-app</span>{' '}
              <span className="text-slate-500">\</span>
              <span className="text-slate-600 ml-3"># Name the container</span>
            </div>
            <div className="pl-4">
              <span className="text-blue-400">-p</span>{' '}
              <span className="text-slate-200">80:8080</span>{' '}
              <span className="text-slate-500">\</span>
              <span className="text-slate-600 ml-3"># Map host:container port</span>
            </div>
            <div className="pl-4">
              <span className="text-yellow-400">-v</span>{' '}
              <span className="text-slate-200">/host/data:/app/data</span>{' '}
              <span className="text-slate-500">\</span>
              <span className="text-slate-600 ml-3"># Mount volume</span>
            </div>
            <div className="pl-4">
              <span className="text-cyan-400">-e</span>{' '}
              <span className="text-slate-200">DATABASE_URL=postgres://db:5432/mydb</span>{' '}
              <span className="text-slate-500">\</span>
              <span className="text-slate-600 ml-3"># Env variable</span>
            </div>
            <div className="pl-4">
              <span className="text-orange-400">--restart</span>{' '}
              <span className="text-slate-200">unless-stopped</span>{' '}
              <span className="text-slate-500">\</span>
              <span className="text-slate-600 ml-3"># Auto-restart policy</span>
            </div>
            <div className="pl-4">
              <span className="text-green-400">my-app:v1</span>
              <span className="text-slate-600 ml-3"># Image name:tag</span>
            </div>
          </TerminalBlock>

          {/* Essential Docker commands toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => setShowEssentials(!showEssentials)}
              variant="outline"
              className="mx-auto flex items-center gap-2"
            >
              <Eye size={16} />
              {showEssentials ? 'Hide' : 'Show'} Essential Docker Commands
            </Button>
          </motion.div>

          <AnimatePresence>
            {showEssentials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* docker ps */}
                <TerminalBlock title="List running containers" delay={0}>
                  <CmdRow cmd="docker ps" delay={0.05} />
                  <div className="text-slate-400 text-xs mt-2 space-y-0.5">
                    <div className="grid grid-cols-5 gap-1 text-slate-500 border-b border-slate-700 pb-1">
                      <span>CONTAINER</span><span>IMAGE</span><span>STATUS</span><span>PORTS</span><span>NAMES</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-green-300">
                      <span>a1b2c3d4</span><span>my-app:v1</span><span>Up 5m</span><span>80→8080</span><span>my-app</span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-slate-700 pt-2">
                    <CmdRow cmd="docker ps -a" comment="Show ALL (including stopped)" delay={0.1} />
                  </div>
                </TerminalBlock>

                {/* docker logs */}
                <TerminalBlock title="View container logs" delay={0.1}>
                  <CmdRow cmd="docker logs my-app" delay={0.05} />
                  <div className="text-slate-400 text-xs mt-2 space-y-0.5">
                    <div className="text-slate-300">[INFO] Starting server on :8080</div>
                    <div className="text-slate-300">[INFO] Connected to database</div>
                    <div className="text-green-300">[INFO] Ready to accept connections</div>
                  </div>
                  <div className="mt-3 border-t border-slate-700 pt-2">
                    <CmdRow cmd="docker logs -f my-app" comment="Follow (live tail)" delay={0.1} />
                    <CmdRow cmd="docker logs --tail 50 my-app" comment="Last 50 lines" delay={0.15} />
                  </div>
                </TerminalBlock>

                {/* docker exec */}
                <TerminalBlock title="Execute inside container" delay={0.2}>
                  <CmdRow cmd="docker exec -it my-app bash" delay={0.05} />
                  <div className="text-slate-400 text-xs mt-2 space-y-0.5">
                    <div className="text-green-400">root@a1b2c3d4:/app#</div>
                    <div className="text-slate-300">ls -la</div>
                    <div className="text-slate-400">app.py  requirements.txt  data/</div>
                  </div>
                  <div className="mt-3 border-t border-slate-700 pt-2 text-slate-500 text-xs">
                    <span className="text-blue-300">-i</span> = interactive &nbsp;
                    <span className="text-blue-300">-t</span> = allocate TTY
                  </div>
                </TerminalBlock>

                {/* docker inspect */}
                <TerminalBlock title="Inspect container details" delay={0.3}>
                  <CmdRow cmd="docker inspect my-app" delay={0.05} />
                  <div className="text-slate-400 text-xs mt-2 space-y-0.5">
                    <div className="text-slate-300">{'{'}</div>
                    <div className="text-slate-300 pl-3">"Id": "a1b2c3d4e5f6..."</div>
                    <div className="text-slate-300 pl-3">"State": {'{'} "Status": "<span className="text-green-400">running</span>" {'}'}</div>
                    <div className="text-slate-300 pl-3">"NetworkSettings": {'{'}</div>
                    <div className="text-slate-300 pl-6">"IPAddress": "172.17.0.2"</div>
                    <div className="text-slate-300 pl-3">{'}'}</div>
                    <div className="text-slate-300">{'}'}</div>
                  </div>
                  <div className="mt-3 border-t border-slate-700 pt-2">
                    <CmdRow cmd="docker stats my-app" comment="Live CPU/Mem usage" delay={0.1} />
                  </div>
                </TerminalBlock>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Next: Lifecycle <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Scene 3: Lifecycle — Full commands               */}
      {/* ═══════════════════════════════════════════════ */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-mcb-50"
          >
            Step 3: The Lifecycle
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-mcb-200 max-w-3xl mx-auto"
          >
            Containers are <strong className="text-mcb-50">ephemeral</strong>. They start, run, stop, and get removed.
            Understanding this lifecycle is key to Docker mastery.
          </motion.p>

          {/* State machine visualization */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-5 gap-3 max-w-3xl mx-auto"
          >
            {[
              { step: 0, label: 'Running', cmd: 'docker run', icon: Play, active: lifecycleStep === 0, color: 'text-green-500' },
              { step: 1, label: 'Stop', cmd: 'docker stop', icon: Square, active: lifecycleStep >= 1, color: 'text-amber-500' },
              { step: 2, label: 'Remove', cmd: 'docker rm', icon: Trash2, active: lifecycleStep >= 2, color: 'text-red-500' },
              { step: 3, label: 'Prune', cmd: 'docker system prune', icon: Zap, active: lifecycleStep >= 3, color: 'text-purple-500' },
              { step: 4, label: 'Pull New', cmd: 'docker pull', icon: Download, active: lifecycleStep >= 4, color: 'text-blue-500' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.step}
                  onClick={() => setLifecycleStep(s.step)}
                  disabled={s.step > 0 && lifecycleStep < s.step - 1}
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + s.step * 0.08 }}
                  className={`rounded-xl border p-3 text-center transition-all disabled:opacity-30 ${
                    s.active
                      ? (isLight ? 'border-mcb-400 bg-mcb-500/10' : 'border-mcb-500 bg-mcb-900/40')
                      : (isLight ? 'border-slate-200 bg-slate-50' : 'border-mcb-800/40 bg-mcb-950/30')
                  }`}
                >
                  <Icon size={18} className={`mx-auto mb-1 ${s.active ? s.color : 'text-mcb-300'}`} />
                  <p className="text-xs font-bold text-mcb-50">{s.label}</p>
                  <p className="text-[9px] text-mcb-300 font-mono mt-0.5 truncate">{s.cmd}</p>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Visualization area */}
          <div className={`h-64 rounded-2xl border-2 flex items-center justify-center relative overflow-hidden ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-mcb-800 bg-mcb-950/50'
          }`}>
            <AnimatePresence mode="wait">
              {lifecycleStep === 0 && (
                <motion.div
                  key="running"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="w-32 h-32 bg-green-500 rounded-xl flex flex-col items-center justify-center shadow-lg border-4 border-green-400"
                >
                  <Box className="text-white mb-2" size={40} />
                  <span className="font-bold text-white">Running</span>
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl border-2 border-green-400"
                  />
                </motion.div>
              )}
              {lifecycleStep === 1 && (
                <motion.div
                  key="stopped"
                  initial={{ filter: 'grayscale(0%)' }}
                  animate={{ filter: 'grayscale(100%)', opacity: 0.5 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-32 h-32 bg-green-500 rounded-xl flex flex-col items-center justify-center shadow-lg border-4 border-green-400"
                >
                  <Box className="text-white mb-2" size={40} />
                  <span className="font-bold text-white">Stopped</span>
                </motion.div>
              )}
              {lifecycleStep === 2 && (
                <motion.div
                  key="removed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col gap-4 w-full px-8"
                >
                  <div className={`border p-3 rounded text-xs font-mono flex items-center gap-2 ${
                    isLight ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-yellow-900/50 border-yellow-600 text-yellow-200'
                  }`}>
                    <HardDrive size={14} /> Dangling Volume (orphaned data)
                  </div>
                  <div className={`border p-3 rounded text-xs font-mono flex items-center gap-2 ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-700/50 border-slate-600 text-slate-300'
                  }`}>
                    <Box size={14} /> &lt;none&gt;:&lt;none&gt; - Dangling Image Layer
                  </div>
                </motion.div>
              )}
              {lifecycleStep === 3 && (
                <motion.div
                  key="prune"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-mcb-400"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  >
                    <Trash2 size={64} />
                  </motion.div>
                  <span className="font-bold mt-4 text-mcb-50">System Pruned!</span>
                  <span className="text-xs text-mcb-300 mt-1">Reclaimed 2.3 GB of disk space</span>
                </motion.div>
              )}
              {lifecycleStep === 4 && (
                <motion.div
                  key="pull"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <Cloud size={64} className="text-blue-500" />
                    <motion.div
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: 20, opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 text-blue-400"
                    >
                      <Download size={24} />
                    </motion.div>
                  </div>
                  <span className="font-bold mt-4 text-mcb-50">Pulling nginx:latest...</span>
                  <div className={`w-48 h-2 rounded-full mt-2 overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-mcb-900'}`}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-mcb-300 mt-1 font-mono">Downloading 4 layers... 67MB</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic lifecycle terminal — reacts to button clicks */}
          <TerminalBlock title="terminal" delay={0}>
            <AnimatePresence mode="wait">
              {/* Step 0: Running */}
              {lifecycleStep === 0 && (
                <motion.div key="lc-run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 select-none">$</span>
                    <TypewriterLine text="docker run -d --name my-app -p 80:8080 my-app:v1" delay={300} className="text-green-400 font-semibold" cursor />
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="text-slate-400 text-xs space-y-0.5 mt-2">
                    <div className="text-slate-300">a1b2c3d4e5f6...</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-slate-500 select-none">$</span>
                      <TypewriterLine text="docker ps" delay={2200} className="text-slate-200" cursor />
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="mt-1">
                      <div className="grid grid-cols-5 gap-1 text-slate-500 border-b border-slate-700 pb-0.5 text-[10px]">
                        <span>CONTAINER</span><span>IMAGE</span><span>STATUS</span><span>PORTS</span><span>NAMES</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-green-300 text-[10px] mt-0.5">
                        <span>a1b2c3d4</span><span>my-app:v1</span><span>Up 2s</span><span>80→8080</span><span>my-app</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 1: Stop */}
              {lifecycleStep === 1 && (
                <motion.div key="lc-stop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 select-none">$</span>
                    <TypewriterLine text="docker stop my-app" delay={200} className="text-amber-400 font-semibold" cursor />
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-slate-400 text-xs space-y-0.5 mt-2">
                    <div className="text-slate-500"># Sends SIGTERM → waits 10s → SIGKILL</div>
                    <div className="text-slate-300">my-app</div>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-slate-500 select-none">$</span>
                      <TypewriterLine text="docker ps -a --filter name=my-app" delay={1800} className="text-slate-200" cursor />
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }} className="mt-1">
                      <div className="grid grid-cols-5 gap-1 text-slate-500 border-b border-slate-700 pb-0.5 text-[10px]">
                        <span>CONTAINER</span><span>IMAGE</span><span>STATUS</span><span>PORTS</span><span>NAMES</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-amber-300 text-[10px] mt-0.5">
                        <span>a1b2c3d4</span><span>my-app:v1</span><span>Exited (0)</span><span></span><span>my-app</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Remove */}
              {lifecycleStep === 2 && (
                <motion.div key="lc-rm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 select-none">$</span>
                    <TypewriterLine text="docker rm my-app" delay={200} className="text-red-400 font-semibold" cursor />
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-slate-400 text-xs space-y-0.5 mt-2">
                    <div className="text-slate-300">my-app</div>
                    <div className="mt-2 text-slate-500"># Container removed, but leftover resources remain:</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-slate-500 select-none">$</span>
                      <TypewriterLine text="docker volume ls --filter dangling=true" delay={1600} className="text-yellow-300" cursor />
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="mt-1 text-yellow-300/70">
                      <div>DRIVER    VOLUME NAME</div>
                      <div>local     a7f2...orphaned_data</div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 3: Prune */}
              {lifecycleStep === 3 && (
                <motion.div key="lc-prune" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 select-none">$</span>
                    <TypewriterLine text="docker system prune -a --volumes" delay={200} className="text-purple-400 font-semibold" cursor />
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="text-slate-400 text-xs space-y-0.5 mt-2">
                    <div className="text-amber-300">WARNING! This will remove:</div>
                    <div className="text-slate-300 pl-2">- all stopped containers</div>
                    <div className="text-slate-300 pl-2">- all networks not used by containers</div>
                    <div className="text-slate-300 pl-2">- all volumes not used by containers</div>
                    <div className="text-slate-300 pl-2">- all images without at least one container</div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }} className="mt-2 space-y-0.5">
                      <div className="text-slate-300">Deleted Volumes: orphaned_data</div>
                      <div className="text-slate-300">Deleted Images: my-app:v1 (247MB)</div>
                      <div className="text-green-400 font-bold mt-1">Total reclaimed space: 2.3GB</div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 4: Pull New */}
              {lifecycleStep === 4 && (
                <motion.div key="lc-pull" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 select-none">$</span>
                    <TypewriterLine text="docker pull nginx:latest" delay={200} className="text-blue-400 font-semibold" cursor />
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-slate-400 text-xs space-y-0.5 mt-2">
                    <div className="text-slate-300">latest: Pulling from library/nginx</div>
                    <div className="text-slate-300">a2abf6c4d29d: Pull complete</div>
                    <div className="text-slate-300">f3409a9a9e73: Pull complete</div>
                    <div className="text-slate-300">084b7b3c8b75: Pull complete</div>
                    <div className="text-slate-300">Digest: sha256:a1b2c3d4...</div>
                    <div className="text-green-400">Status: Downloaded newer image for nginx:latest</div>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-slate-500 select-none">$</span>
                      <TypewriterLine text="docker run -d --name web -p 80:80 --restart unless-stopped nginx:latest" delay={3500} className="text-green-400 font-semibold" cursor />
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.5 }} className="mt-1 text-slate-300">
                      <div>b9e8f7d6c5a4...</div>
                      <div className="text-green-400 font-bold mt-1">Container "web" is running on port 80</div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </TerminalBlock>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Next: Docker Compose <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Scene 4: Docker Compose — Complete YAML + Mgmt  */}
      {/* ═══════════════════════════════════════════════ */}
      {scene === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-mcb-50"
          >
            Step 4: Orchestration with Compose
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-mcb-200 max-w-3xl mx-auto"
          >
            Define multi-container apps in a single <code className={`px-1 rounded ${isLight ? 'bg-slate-200' : 'bg-mcb-800/50'}`}>docker-compose.yml</code>.
            Here we set up <strong className="text-mcb-50">Traefik</strong> reverse proxy with HTTPS, a web app, API, and database.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Full docker-compose.yml */}
            <div className="space-y-4">
              <TerminalBlock title="docker-compose.yml" delay={0.3}>
                <div className="text-slate-500"># docker-compose.yml</div>
                <div className="text-slate-300 mt-1">services:</div>

                {/* Traefik */}
                <div className="mt-2">
                  <div className="pl-4 text-orange-400 font-bold">reverse-proxy:</div>
                  <div className="pl-8 text-slate-200">image: <span className="text-green-300">traefik:v2.10</span></div>
                  <div className="pl-8 text-slate-200">command:</div>
                  <div className="pl-12 text-slate-400 text-xs">- "--api.dashboard=true"</div>
                  <div className="pl-12 text-slate-400 text-xs">- "--providers.docker=true"</div>
                  <div className="pl-12 text-slate-400 text-xs">- "--entrypoints.websecure.address=:443"</div>
                  <div className="pl-8 text-slate-200">ports:</div>
                  <div className="pl-12 text-slate-400 text-xs">- "443:443"</div>
                  <div className="pl-12 text-slate-400 text-xs">- "8080:8080" <span className="text-slate-600"># dashboard</span></div>
                  <div className="pl-8 text-slate-200">volumes:</div>
                  <div className="pl-12 text-slate-400 text-xs">- /var/run/docker.sock:/var/run/docker.sock</div>
                </div>

                {/* Web */}
                <div className="mt-2">
                  <div className="pl-4 text-green-400 font-bold">web:</div>
                  <div className="pl-8 text-slate-200">image: <span className="text-green-300">my-frontend:latest</span></div>
                  <div className="pl-8 text-slate-200">labels:</div>
                  <div className="pl-12 text-slate-400 text-xs">- "traefik.http.routers.web.rule=Host(`example.com`)"</div>
                  <div className="pl-12 text-slate-400 text-xs">- "traefik.http.routers.web.tls=true"</div>
                  <div className="pl-8 text-slate-200">depends_on:</div>
                  <div className="pl-12 text-slate-400 text-xs">- api</div>
                </div>

                {/* API */}
                <div className="mt-2">
                  <div className="pl-4 text-blue-400 font-bold">api:</div>
                  <div className="pl-8 text-slate-200">image: <span className="text-green-300">my-backend:latest</span></div>
                  <div className="pl-8 text-slate-200">environment:</div>
                  <div className="pl-12 text-slate-400 text-xs">- DATABASE_URL=postgres://db:5432/app</div>
                  <div className="pl-12 text-slate-400 text-xs">- REDIS_URL=redis://cache:6379</div>
                  <div className="pl-8 text-slate-200">depends_on:</div>
                  <div className="pl-12 text-slate-400 text-xs">- db</div>
                </div>

                {/* DB */}
                <div className="mt-2">
                  <div className="pl-4 text-yellow-400 font-bold">db:</div>
                  <div className="pl-8 text-slate-200">image: <span className="text-green-300">postgres:16</span></div>
                  <div className="pl-8 text-slate-200">environment:</div>
                  <div className="pl-12 text-slate-400 text-xs">- POSTGRES_DB=app</div>
                  <div className="pl-12 text-slate-400 text-xs">- POSTGRES_PASSWORD=secret</div>
                  <div className="pl-8 text-slate-200">volumes:</div>
                  <div className="pl-12 text-slate-400 text-xs">- db-data:/var/lib/postgresql/data</div>
                </div>

                {/* Volumes */}
                <div className="mt-3 border-t border-slate-700 pt-2">
                  <div className="text-slate-300">volumes:</div>
                  <div className="pl-4 text-yellow-300">db-data: <span className="text-slate-600"># Named volume for data persistence</span></div>
                </div>
              </TerminalBlock>

              {/* Compose management commands */}
              <TerminalBlock title="Compose Management" delay={0.5}>
                <div className="space-y-2">
                  <CmdRow cmd="docker compose up -d" comment="Start all services (detached)" delay={0.1} />
                  <CmdRow cmd="docker compose ps" comment="List running services" delay={0.15} />
                  <CmdRow cmd="docker compose logs -f api" comment="Follow API logs" delay={0.2} />
                  <CmdRow cmd="docker compose exec api bash" comment="Shell into API container" delay={0.25} />
                  <CmdRow cmd="docker compose down" comment="Stop and remove all" delay={0.3} />
                  <CmdRow cmd="docker compose down -v" comment="Also remove volumes" delay={0.35} highlight="text-red-400" />
                  <CmdRow cmd="docker compose pull" comment="Pull latest images" delay={0.4} />
                  <CmdRow cmd="docker compose up -d --build" comment="Rebuild and restart" delay={0.45} />
                </div>
              </TerminalBlock>
            </div>

            {/* Architecture visualization */}
            <div className={`relative h-[700px] rounded-xl border flex flex-col items-center justify-center p-4 overflow-hidden ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-mcb-800/50 bg-mcb-950/30'
            }`}>
              {composeStep === 0 && (
                <Button
                  onClick={() => setComposeStep(1)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 scale-110 z-50"
                >
                  <Terminal size={20} /> docker compose up -d
                </Button>
              )}

              <AnimatePresence>
                {composeStep > 0 && (
                  <div className="relative w-full h-full font-sans">
                    {/* Terminal Overlay */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: [0, 1, 1, 0], y: 0 }}
                      transition={{ duration: 2.5, times: [0, 0.1, 0.9, 1] }}
                      className="absolute top-4 left-0 right-0 mx-auto w-3/4 bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-lg border border-green-500/30 z-40 shadow-2xl"
                    >
                      $ docker compose up -d<br />
                      <span className="text-slate-300">Creating network "app_default"...</span><br />
                      <span className="text-slate-300">Creating container "db"...</span><br />
                      <span className="text-slate-300">Creating container "api"...</span><br />
                      <span className="text-slate-300">Creating container "web"...</span><br />
                      <span className="text-slate-300">Creating container "traefik"...</span>
                      <span className="text-green-500 font-bold mt-2 block">Done!</span>
                    </motion.div>

                    {/* Network Boundary */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.2 }}
                      className={`absolute top-[160px] bottom-[20px] left-[5%] right-[5%] border-2 border-dashed rounded-3xl -z-10 ${
                        isLight ? 'border-mcb-400/30 bg-blue-50/50' : 'border-mcb-500/40 bg-mcb-900/10'
                      }`}
                    >
                      <span className={`absolute top-3 right-4 text-xs font-mono px-2 py-1 rounded ${
                        isLight ? 'text-mcb-400 bg-white' : 'text-mcb-400 bg-mcb-950/50'
                      }`}>
                        Network: app_default
                      </span>
                    </motion.div>

                    {/* Internet */}
                    <motion.div
                      initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.2 }}
                      className="absolute top-[30px] left-1/2 -translate-x-1/2 flex items-center gap-2 text-mcb-50 z-20"
                    >
                      <Cloud className="text-blue-500" /> Internet (HTTPS)
                    </motion.div>

                    {/* Traefik */}
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring', bounce: 0.4 }}
                      className="absolute top-[100px] left-1/2 -translate-x-1/2 w-32 h-16 bg-orange-600 rounded-lg flex items-center justify-center gap-2 text-white font-bold shadow-lg z-20"
                    >
                      <Route size={20} /> Traefik
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
                        <Lock size={12} />
                      </div>
                    </motion.div>

                    {/* Web */}
                    <motion.div
                      initial={{ scale: 0, x: -50 }} animate={{ scale: 1, x: 0 }} transition={{ delay: 3.0, type: 'spring' }}
                      className="absolute top-[220px] left-[25%] -translate-x-1/2 w-32 h-24 bg-green-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg z-20"
                    >
                      <Globe size={24} className="mb-2" />
                      <span className="font-bold">Web</span>
                      <span className="text-xs opacity-75">my-frontend</span>
                    </motion.div>

                    {/* API */}
                    <motion.div
                      initial={{ scale: 0, x: 50 }} animate={{ scale: 1, x: 0 }} transition={{ delay: 3.2, type: 'spring' }}
                      className="absolute top-[220px] left-[75%] -translate-x-1/2 w-32 h-24 bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg z-20"
                    >
                      <Server size={24} className="mb-2" />
                      <span className="font-bold">API</span>
                      <span className="text-xs opacity-75">my-backend</span>
                    </motion.div>

                    {/* DB */}
                    <motion.div
                      initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 3.5, type: 'spring' }}
                      className="absolute top-[380px] left-[75%] -translate-x-1/2 w-32 h-16 bg-yellow-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg z-20"
                    >
                      <div className="flex items-center gap-2">
                        <Database size={16} />
                        <span className="font-bold">DB</span>
                      </div>
                      <span className="text-xs opacity-75">postgres:16</span>
                    </motion.div>

                    {/* SVG Connections */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      viewBox="0 0 100 600"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <marker id="arrow-blue" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                          <path d="M0,0 L0,4 L4,2 z" fill="#60a5fa" />
                        </marker>
                        <marker id="arrow-green" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                          <path d="M0,0 L0,4 L4,2 z" fill="#4ade80" />
                        </marker>
                        <marker id="arrow-yellow" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                          <path d="M0,0 L0,4 L4,2 z" fill="#facc15" />
                        </marker>
                      </defs>
                      {[
                        { d: 'M50,50 L50,95', stroke: '#60a5fa', marker: 'url(#arrow-blue)' },
                        { d: 'M50,164 L50,190 L25,190 L25,215', stroke: '#4ade80', marker: 'url(#arrow-green)' },
                        { d: 'M33,268 L67,268', stroke: '#4ade80', marker: 'url(#arrow-green)' },
                        { d: 'M75,316 L75,375', stroke: '#facc15', marker: 'url(#arrow-yellow)' },
                      ].map((line, i) => (
                        <motion.path
                          key={i}
                          d={line.d}
                          fill="none"
                          stroke={line.stroke}
                          strokeWidth="0.5"
                          strokeDasharray="2 1"
                          vectorEffect="non-scaling-stroke"
                          initial={{ opacity: 0, strokeDashoffset: 0 }}
                          animate={{ opacity: 1, strokeDashoffset: -6 }}
                          transition={{
                            opacity: { delay: 4.0, duration: 0.5 },
                            strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' },
                          }}
                          markerEnd={line.marker}
                        />
                      ))}
                    </svg>

                    {/* Animated Packets */}
                    <div className="absolute inset-0 pointer-events-none z-30">
                      <motion.div
                        initial={{ left: '50%', top: 50, opacity: 0 }}
                        animate={{ top: 95, opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 5.0 }}
                        className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] -translate-x-1/2 -translate-y-1/2"
                      />
                      <motion.div
                        initial={{ left: '50%', top: 164, opacity: 0 }}
                        animate={{ left: ['50%', '50%', '25%', '25%'], top: [164, 190, 190, 215], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 5.5 }}
                        className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80] -translate-x-1/2 -translate-y-1/2"
                      />
                      <motion.div
                        initial={{ left: '25%', top: 268, opacity: 0 }}
                        animate={{ left: '75%', opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 6.2 }}
                        className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80] -translate-x-1/2 -translate-y-1/2"
                      />
                      <motion.div
                        initial={{ left: '75%', top: 316, opacity: 0 }}
                        animate={{ top: 375, opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 7.0 }}
                        className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15] -translate-x-1/2 -translate-y-1/2"
                      />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 8.0, type: 'spring' }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold border border-green-400 flex items-center gap-2 z-50 shadow-xl"
                    >
                      <Check size={16} /> Stack Operational
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Next: Reality Check <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Scene 5: Pros & Cons + Transition               */}
      {/* ═══════════════════════════════════════════════ */}
      {scene === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150 }}
            className="text-4xl font-bold text-mcb-50"
          >
            The Reality Check
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-mcb-200 max-w-3xl mx-auto"
          >
            Docker solves the <strong className="text-mcb-50">packaging</strong> problem brilliantly. But managing containers at scale? That's another story.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pros */}
            <motion.div
              initial={{ opacity: 0, x: -20, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 20 }}
              className={`rounded-2xl border-2 p-6 text-left ${
                isLight ? 'border-green-200 bg-green-50' : 'border-green-500/30 bg-green-950/20'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                isLight ? 'text-green-700' : 'text-green-300'
              }`}>
                <CheckCircle size={20} /> What Docker Solves
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Consistent Environments', desc: 'Dev, staging, prod - all identical. No more "works on my machine."' },
                  { title: 'Fast Startup', desc: 'Containers start in milliseconds, not minutes like VMs.' },
                  { title: 'Resource Efficient', desc: 'Share the host kernel. 10x more containers per server than VMs.' },
                  { title: 'Isolation', desc: 'Apps don\'t interfere. Different Node versions can coexist.' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ x: 4 }}
                    className={`rounded-lg p-3 ${isLight ? 'bg-green-100' : 'bg-green-950/30'}`}
                  >
                    <p className={`text-sm font-bold ${isLight ? 'text-green-800' : 'text-green-200'}`}>{item.title}</p>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-green-700' : 'text-green-300/70'}`}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Cons */}
            <motion.div
              initial={{ opacity: 0, x: 20, rotateY: 5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 160, damping: 20 }}
              className={`rounded-2xl border-2 p-6 text-left ${
                isLight ? 'border-red-200 bg-red-50' : 'border-red-500/30 bg-red-950/20'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                isLight ? 'text-red-700' : 'text-red-300'
              }`}>
                <AlertTriangle size={20} /> What Docker Can't Do
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'No Self-Healing', desc: 'restart: always handles app crashes, but if the SERVER dies? Everything goes down.' },
                  { title: 'No Auto-Scaling', desc: 'Traffic spikes at 3 AM? Someone must manually spin up more containers.' },
                  { title: 'No Rolling Updates', desc: 'Compose recreates containers. Users see downtime during deploys.' },
                  { title: 'Single Host Only', desc: 'Compose runs on ONE server. What happens when you need 10 servers?' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ x: -4 }}
                    className={`rounded-lg p-3 ${isLight ? 'bg-red-100' : 'bg-red-950/30'}`}
                  >
                    <p className={`text-sm font-bold ${isLight ? 'text-red-800' : 'text-red-200'}`}>{item.title}</p>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-red-700' : 'text-red-300/70'}`}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Docker cheat sheet */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <TerminalBlock title="Docker Cheat Sheet — Quick Reference" delay={0.9}>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div>
                  <div className="text-slate-500 mt-1 mb-0.5 font-bold">Images</div>
                  <CmdRow cmd="docker images" comment="List images" delay={0} />
                  <CmdRow cmd="docker build -t name:tag ." comment="Build image" delay={0} />
                  <CmdRow cmd="docker push name:tag" comment="Push to registry" delay={0} />
                  <CmdRow cmd="docker pull name:tag" comment="Pull from registry" delay={0} />
                  <CmdRow cmd="docker rmi name:tag" comment="Remove image" delay={0} />
                </div>
                <div>
                  <div className="text-slate-500 mt-1 mb-0.5 font-bold">Containers</div>
                  <CmdRow cmd="docker run -d --name c img" comment="Run detached" delay={0} />
                  <CmdRow cmd="docker ps" comment="List running" delay={0} />
                  <CmdRow cmd="docker logs -f container" comment="Follow logs" delay={0} />
                  <CmdRow cmd="docker exec -it c bash" comment="Shell access" delay={0} />
                  <CmdRow cmd="docker stop container" comment="Graceful stop" delay={0} />
                </div>
                <div>
                  <div className="text-slate-500 mt-1 mb-0.5 font-bold">Networking</div>
                  <CmdRow cmd="docker network ls" comment="List networks" delay={0} />
                  <CmdRow cmd="docker network create net" comment="Create network" delay={0} />
                  <CmdRow cmd="docker run --network net" comment="Join network" delay={0} />
                </div>
                <div>
                  <div className="text-slate-500 mt-1 mb-0.5 font-bold">Volumes</div>
                  <CmdRow cmd="docker volume ls" comment="List volumes" delay={0} />
                  <CmdRow cmd="docker volume create vol" comment="Create volume" delay={0} />
                  <CmdRow cmd="docker run -v vol:/data" comment="Mount volume" delay={0} />
                </div>
              </div>
            </TerminalBlock>
          </motion.div>

          {/* What we need */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className={`rounded-xl border p-5 text-left max-w-3xl mx-auto ${
              isLight ? 'border-blue-200 bg-blue-50' : 'border-mcb-500/30 bg-mcb-900/40'
            }`}
          >
            <p className={`font-bold text-lg ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
              We need a Captain for these containers.
            </p>
            <p className="text-sm text-mcb-200 mt-2 leading-relaxed">
              Someone who can <strong className="text-mcb-50">schedule</strong> containers across multiple servers,
              <strong className="text-mcb-50"> heal</strong> crashed apps automatically,
              <strong className="text-mcb-50"> scale</strong> during traffic spikes, and
              <strong className="text-mcb-50"> update</strong> without downtime.
            </p>
            <p className={`text-sm mt-2 font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
              That captain is Kubernetes.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Enter the Captain (Kubernetes) <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
