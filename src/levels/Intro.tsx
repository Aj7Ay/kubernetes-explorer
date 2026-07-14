import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { useTheme } from '../ThemeContext';
import {
  ArrowRight,
  ArrowLeft,
  AlertOctagon,
  X,
  Server,
  Laptop,
  Database,
  Users,
  ShoppingCart,
  CreditCard,
  Search,
  User,
  Globe,
  Clock,
  AlertTriangle,
  Zap,
  Package,
  Code,
  Layers,
  Lock,
  Wifi,
  RefreshCw,
  CheckCircle,
  XCircle,
  Terminal,
  Cpu,
  Hash,
} from 'lucide-react';

interface IntroProps {
  onComplete: () => void;
}

/* ═══════════════════════════════════════════════════════════
   Typing animation hook
   ═══════════════════════════════════════════════════════════ */
const useTypingAnimation = (text: string, speed = 100, shouldStart = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text || !shouldStart) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    setDisplayedText('');
    let idx = 0;
    const id = setInterval(() => {
      if (idx < text.length) {
        setDisplayedText(text.slice(0, idx + 1));
        idx++;
      } else {
        setIsTyping(false);
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, shouldStart]);

  return { displayedText, isTyping };
};

/* ═══════════════════════════════════════════════════════════
   Monolith component modules (tightly coupled inside)
   ═══════════════════════════════════════════════════════════ */
const monolithModules = [
  { name: 'Auth', icon: Lock, color: 'text-yellow-500', bg: 'bg-yellow-500/15' },
  { name: 'Cart', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/15' },
  { name: 'Payment', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-500/15' },
  { name: 'Profile', icon: User, color: 'text-purple-500', bg: 'bg-purple-500/15' },
  { name: 'Search', icon: Search, color: 'text-sky-500', bg: 'bg-sky-500/15' },
  { name: 'API', icon: Globe, color: 'text-orange-500', bg: 'bg-orange-500/15' },
  { name: 'Frontend', icon: Code, color: 'text-pink-500', bg: 'bg-pink-500/15' },
  { name: 'DB', icon: Database, color: 'text-teal-500', bg: 'bg-teal-500/15' },
];

const monolithProblems = [
  {
    id: 'deploy',
    title: 'One Change = Full Redeploy',
    detail: 'Change one line in the Profile code? You must rebuild, retest, and redeploy the ENTIRE application. Every module. Every time.',
    icon: RefreshCw,
    color: 'text-red-500',
  },
  {
    id: 'scale',
    title: 'Cannot Scale Independently',
    detail: 'Search needs 10x more CPU than Profile? Too bad. You must scale the entire monolith. Wasting resources on modules that don\'t need them.',
    icon: Layers,
    color: 'text-amber-500',
  },
  {
    id: 'team',
    title: 'Team Bottleneck',
    detail: '50 developers all pushing to one codebase. Merge conflicts every hour. One team\'s broken test blocks everyone else\'s deployment.',
    icon: Users,
    color: 'text-orange-500',
  },
  {
    id: 'tech',
    title: 'Technology Lock-in',
    detail: 'Started with Java in 2010? Every new feature must be Java too. Can\'t use Python for ML, Go for performance, or Node for real-time. You\'re stuck.',
    icon: Lock,
    color: 'text-purple-500',
  },
  {
    id: 'failure',
    title: 'Single Point of Failure',
    detail: 'A memory leak in one module crashes the whole server. One uncaught exception in Payment takes down Auth, Cart, Search, and everything else.',
    icon: AlertTriangle,
    color: 'text-red-600',
  },
  {
    id: 'startup',
    title: 'Painful Startup Time',
    detail: 'As the monolith grows, startup time goes from seconds to minutes. Developers wait 5+ minutes just to test a one-line change.',
    icon: Clock,
    color: 'text-yellow-500',
  },
];

/* ═══════════════════════════════════════════════════════════
   Cascade failure simulation data
   ═══════════════════════════════════════════════════════════ */
const cascadeSteps = [
  { module: 'Profile', message: 'NullPointerException in UserProfile.java:142', delay: 0 },
  { module: 'Auth', message: 'Cannot validate session - Profile service unresponsive', delay: 800 },
  { module: 'Cart', message: 'Auth token validation failed - rejecting all requests', delay: 1400 },
  { module: 'Payment', message: 'Cart data unavailable - payment processing halted', delay: 2000 },
  { module: 'Search', message: 'Shared connection pool exhausted - queries timing out', delay: 2600 },
  { module: 'API', message: 'All downstream services failing - returning 503', delay: 3000 },
  { module: 'Frontend', message: 'API returning errors - blank page for all users', delay: 3400 },
  { module: 'DB', message: 'Connection pool flooded with retries - deadlock detected', delay: 3800 },
];

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [scene, setScene] = useState(-1);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Scene 0 state
  const [activeProblem, setActiveProblem] = useState<string | null>(null);
  const [monolithPhase, setMonolithPhase] = useState<'healthy' | 'warning' | 'crashing' | 'dead'>('healthy');
  const [failedModules, setFailedModules] = useState<Set<string>>(new Set());
  const [cascadeLogs, setCascadeLogs] = useState<string[]>([]);
  const [showMonolithDetail, setShowMonolithDetail] = useState(false);

  // Scene 2 state
  const [crashedService, setCrashedService] = useState<string | null>(null);

  const titleText = 'Mr Cloud Book';
  const subtitleText = 'One for All';

  const { displayedText: displayedTitle, isTyping: isTypingTitle } = useTypingAnimation(
    titleText, 80, scene === -1
  );
  const { displayedText: displayedSubtitle, isTyping: isTypingSubtitle } = useTypingAnimation(
    subtitleText, 60, showSubtitle
  );

  const nextScene = () => setScene((p) => p + 1);
  const prevScene = () => setScene((p) => Math.max(0, p - 1));

  // Intro animation sequence
  useEffect(() => {
    if (scene === -1) {
      const titleDelay = titleText.length * 80 + 500;
      const t1 = setTimeout(() => setShowSubtitle(true), titleDelay);
      const subtitleDelay = titleDelay + subtitleText.length * 60 + 500;
      const t2 = setTimeout(() => setShowButton(true), subtitleDelay);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [scene]);

  // Reset scene 0 state
  useEffect(() => {
    if (scene === 0) {
      setMonolithPhase('healthy');
      setFailedModules(new Set());
      setCascadeLogs([]);
      setActiveProblem(null);
      setShowMonolithDetail(false);
      const t = setTimeout(() => setShowMonolithDetail(true), 800);
      return () => clearTimeout(t);
    }
  }, [scene]);

  const handleBegin = () => {
    setScene(0);
    setShowSubtitle(false);
    setShowButton(false);
  };

  /* Cascade failure animation */
  const triggerCascadeFailure = useCallback(() => {
    setMonolithPhase('warning');
    setFailedModules(new Set());
    setCascadeLogs([]);

    cascadeSteps.forEach((step, i) => {
      setTimeout(() => {
        setFailedModules((prev) => new Set(prev).add(step.module));
        setCascadeLogs((prev) => [...prev, `[${step.module}] ${step.message}`]);
        if (i === cascadeSteps.length - 1) {
          setTimeout(() => setMonolithPhase('dead'), 600);
        }
      }, step.delay);
    });

    setTimeout(() => setMonolithPhase('crashing'), 400);
  }, []);

  const resetMonolith = () => {
    setMonolithPhase('healthy');
    setFailedModules(new Set());
    setCascadeLogs([]);
  };

  const killService = () => {
    const services = ['Auth', 'Cart', 'Payment', 'Profile', 'Search'];
    setCrashedService(services[Math.floor(Math.random() * services.length)]);
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">

      {/* ═══════ Scene -1: Animated Intro ═══════ */}
      {scene === -1 && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="w-full flex justify-center min-h-[120px] items-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <h1
                  className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mcb-400 via-mcb-500 to-mcb-400"
                  style={{ fontFamily: 'Satoshi, system-ui, -apple-system, sans-serif' }}
                >
                  {displayedTitle}
                  {isTypingTitle && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-20 bg-mcb-400 ml-2"
                    />
                  )}
                </h1>
              </motion.div>
            </div>

            <div className="w-full flex justify-center min-h-[60px] items-center">
              {showSubtitle ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: 'Satoshi, system-ui, -apple-system, sans-serif' }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mcb-300 to-mcb-400">
                    {displayedSubtitle}
                    {isTypingSubtitle && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-8 bg-mcb-300 ml-1"
                      />
                    )}
                  </h2>
                </motion.div>
              ) : (
                <div className="h-[60px]" />
              )}
            </div>

            <div className="w-full flex justify-center min-h-[60px] items-center">
              {showButton ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <Button
                    onClick={handleBegin}
                    className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto"
                    style={{ fontFamily: 'Satoshi, system-ui, -apple-system, sans-serif' }}
                  >
                    Let's Begin <ArrowRight />
                  </Button>
                </motion.div>
              ) : (
                <div className="h-[60px]" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Scene 0: The Era of Giants ═══════ */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="space-y-4"
          >
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mcb-400 to-mcb-500">
              Chapter 1: The Era of Giants
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-mcb-200 max-w-3xl mx-auto leading-relaxed"
            >
              Long ago, we built software as <strong className="text-mcb-50">Monoliths</strong>.
              One giant codebase. One giant database. One giant server.
              <span className="text-mcb-400"> Everything tightly coupled together.</span>
            </motion.p>
          </motion.div>

          {/* Two-column: Monolith visual + Problem cards */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Interactive Monolith Visualization */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 20 }}
                className={`relative rounded-2xl border-2 p-6 overflow-hidden transition-colors duration-500 ${
                  monolithPhase === 'dead'
                    ? 'border-red-500 bg-red-50 dark-only:bg-red-950/30 shadow-[0_0_60px_rgba(239,68,68,0.3)]'
                    : monolithPhase === 'crashing'
                      ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
                      : 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.2)]'
                } ${isLight
                    ? monolithPhase === 'dead' ? 'bg-red-50' : monolithPhase === 'crashing' ? 'bg-amber-50' : 'bg-blue-50/80'
                    : monolithPhase === 'dead' ? 'bg-red-950/30' : monolithPhase === 'crashing' ? 'bg-amber-950/20' : 'bg-mcb-950/50'
                }`}
              >
                {/* Server header */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={
                        monolithPhase === 'dead'
                          ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                          : monolithPhase === 'crashing'
                            ? { scale: [1, 1.05, 1] }
                            : {}
                      }
                      transition={{ duration: 0.5, repeat: monolithPhase !== 'healthy' ? Infinity : 0 }}
                    >
                      <Server size={28} className={
                        monolithPhase === 'dead' ? 'text-red-500' :
                        monolithPhase === 'crashing' ? 'text-amber-500' : 'text-blue-500'
                      } />
                    </motion.div>
                    <div className="text-left">
                      <span className="font-bold text-mcb-50 text-sm">MONOLITH v1.0</span>
                      <span className="block text-[10px] text-mcb-300 font-mono">single-server-prod-01</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {monolithModules.slice(0, 3).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          backgroundColor:
                            monolithPhase === 'dead' ? 'rgba(239,68,68,0.8)' :
                            monolithPhase === 'crashing' ? 'rgba(245,158,11,0.8)' :
                            'rgba(34,197,94,0.8)',
                        }}
                        className="w-2 h-2 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Tightly coupled modules grid */}
                <div className="grid grid-cols-4 gap-2">
                  {monolithModules.map((mod, i) => {
                    const failed = failedModules.has(mod.name);
                    const Icon = mod.icon;
                    return (
                      <motion.div
                        key={mod.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          borderColor: failed ? 'rgba(239,68,68,0.6)' : isLight ? 'rgba(148,163,184,0.4)' : 'rgba(99,102,241,0.2)',
                          backgroundColor: failed
                            ? (isLight ? 'rgba(254,226,226,0.8)' : 'rgba(127,29,29,0.4)')
                            : (isLight ? 'rgba(248,250,252,0.8)' : 'rgba(0,0,0,0.3)'),
                        }}
                        transition={{
                          delay: 0.4 + i * 0.06,
                          type: 'spring',
                          stiffness: 200,
                          damping: 18,
                        }}
                        className="rounded-lg border p-2 flex flex-col items-center gap-1 relative"
                      >
                        {failed ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                          >
                            <X size={18} className="text-red-500" />
                          </motion.div>
                        ) : (
                          <Icon size={18} className={mod.color} />
                        )}
                        <span className={`text-[10px] font-bold ${failed ? 'text-red-500' : 'text-mcb-200'}`}>
                          {mod.name}
                        </span>
                        {!failed && monolithPhase === 'healthy' && (
                          <motion.div
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* SVG connection lines showing tight coupling */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 300">
                  {[
                    'M80,120 L200,120', 'M200,120 L320,120',
                    'M80,120 L80,200', 'M320,120 L320,200',
                    'M80,200 L200,200', 'M200,200 L320,200',
                    'M200,120 L200,200', 'M140,120 L260,200',
                    'M260,120 L140,200',
                  ].map((d, i) => (
                    <motion.path
                      key={i}
                      d={d}
                      stroke={monolithPhase === 'dead' ? '#ef4444' : monolithPhase === 'crashing' ? '#f59e0b' : '#818cf8'}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      fill="none"
                      initial={{ opacity: 0, strokeDashoffset: 0 }}
                      animate={{
                        opacity: monolithPhase === 'healthy' ? 0.4 : 0.8,
                        strokeDashoffset: -16,
                      }}
                      transition={{
                        opacity: { delay: 0.8 + i * 0.05 },
                        strokeDashoffset: { duration: 2, repeat: Infinity, ease: 'linear' },
                      }}
                    />
                  ))}
                </svg>

                {/* Shared database bar at bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    borderColor: monolithPhase === 'dead'
                      ? 'rgba(239,68,68,0.5)' : 'rgba(20,184,166,0.4)',
                  }}
                  transition={{ delay: 0.9 }}
                  className={`mt-3 flex items-center justify-center gap-2 py-2 rounded-lg border ${
                    isLight ? 'bg-slate-100' : 'bg-black/30'
                  }`}
                >
                  <Database size={14} className={monolithPhase === 'dead' ? 'text-red-500' : 'text-teal-500'} />
                  <span className="text-[11px] font-mono text-mcb-200">
                    Shared Database (all 8 modules → 1 DB)
                  </span>
                </motion.div>

                {/* Dead overlay */}
                <AnimatePresence>
                  {monolithPhase === 'dead' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 backdrop-blur-sm flex items-center justify-center rounded-2xl ${
                        isLight ? 'bg-red-100/90' : 'bg-red-950/80'
                      }`}
                    >
                      <div className="text-center space-y-3">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <AlertOctagon size={56} className="text-red-500 mx-auto" />
                        </motion.div>
                        <p className="text-2xl font-bold text-red-500">TOTAL SYSTEM FAILURE</p>
                        <p className={`text-sm ${isLight ? 'text-red-600' : 'text-red-300/70'}`}>All 8 modules down. 0 users served.</p>
                        <Button
                          onClick={resetMonolith}
                          variant="outline"
                          className="text-sm border-red-500/50 text-red-500 hover:border-red-400"
                        >
                          <RefreshCw size={14} className="mr-1" /> Reset
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Cascade failure log terminal - always dark */}
              <AnimatePresence>
                {cascadeLogs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-red-800/50 bg-slate-900 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-red-900/50 bg-red-950/40">
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-red-500"
                      />
                      <span className="text-xs font-mono text-red-400">CASCADE FAILURE LOG</span>
                    </div>
                    <div className="p-3 max-h-[160px] overflow-y-auto space-y-1">
                      {cascadeLogs.map((log, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xs font-mono text-red-300/80 text-left"
                        >
                          <span className="text-red-500">ERR</span> {log}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={triggerCascadeFailure}
                  disabled={monolithPhase !== 'healthy'}
                  variant="outline"
                  className={`flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-40 ${
                    isLight ? 'border-red-300 text-red-600 hover:border-red-500' : 'border-red-800/50 text-red-300 hover:border-red-500'
                  }`}
                >
                  <Zap size={16} /> Trigger a Bug in Profile
                </Button>
                {monolithPhase !== 'healthy' && (
                  <Button
                    onClick={resetMonolith}
                    variant="outline"
                    className="flex items-center gap-2 text-sm"
                  >
                    <RefreshCw size={14} /> Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Problem cards */}
            <div className="space-y-3">
              <motion.h3
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-bold text-mcb-50 text-left flex items-center gap-2"
              >
                <AlertTriangle size={18} className="text-amber-500" />
                Why Monoliths Break
              </motion.h3>

              {showMonolithDetail && monolithProblems.map((problem, i) => {
                const Icon = problem.icon;
                const isActive = activeProblem === problem.id;
                return (
                  <motion.button
                    key={problem.id}
                    type="button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.08,
                      type: 'spring',
                      stiffness: 180,
                      damping: 20,
                    }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveProblem(isActive ? null : problem.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      isActive
                        ? (isLight ? 'border-mcb-400/50 bg-mcb-500/10' : 'border-mcb-500/40 bg-mcb-900/60')
                        : (isLight ? 'border-slate-200 bg-slate-50 hover:border-mcb-400/40' : 'border-mcb-800/40 bg-mcb-950/30 hover:border-mcb-700')
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon size={18} className={isActive ? problem.color : 'text-mcb-300'} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isActive ? 'text-mcb-50' : 'text-mcb-200'}`}>
                          {problem.title}
                        </p>
                        <AnimatePresence>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-mcb-200 mt-1.5 leading-relaxed"
                            >
                              {problem.detail}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {!activeProblem && showMonolithDetail && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-mcb-300 text-left pl-1"
                >
                  Click each problem to learn more. Then trigger a bug to watch the cascade.
                </motion.p>
              )}
            </div>
          </div>

          {/* Key insight callout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className={`rounded-xl border p-4 flex gap-3 text-left max-w-3xl mx-auto ${
              isLight ? 'border-amber-300 bg-amber-50' : 'border-amber-500/30 bg-amber-950/20'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 400, damping: 12 }}
            >
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            </motion.div>
            <div>
              <p className={`font-bold text-sm ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>The Fundamental Problem</p>
              <p className={`text-sm mt-1 leading-relaxed ${isLight ? 'text-amber-800' : 'text-amber-100/70'}`}>
                In a monolith, <strong className={isLight ? 'text-amber-900' : 'text-amber-200'}>everything shares everything</strong>: one process, one memory space, one database, one deployment. This tight coupling means any failure cascades through the entire system. As the codebase grows, the problems get exponentially worse.
              </p>
            </div>
          </motion.div>

          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              We need a better way... <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══════ Scene 1: The Problem with Giants (rich) ═══════ */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="text-4xl font-bold text-red-500"
          >
            The Problem with Giants
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-mcb-200 max-w-3xl mx-auto leading-relaxed"
          >
            A developer made a typo in the <strong className="text-mcb-50">"User Profile"</strong> code.
            Just a small error. But because <span className="text-red-500">everything is connected</span>...
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Cascade timeline visualization */}
            <div className="space-y-4">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-sm font-bold text-left flex items-center gap-2 ${isLight ? 'text-red-600' : 'text-red-300'}`}
              >
                <Zap size={16} /> Cascade Failure Timeline
              </motion.h3>

              <div className="space-y-0">
                {[
                  { time: '14:32:01', module: 'Profile', msg: 'NullPointerException in UserProfile.java:142', icon: User, color: 'text-purple-500', borderColor: isLight ? 'border-purple-300' : 'border-purple-500/40' },
                  { time: '14:32:03', module: 'Auth', msg: 'Cannot validate session - Profile unresponsive', icon: Lock, color: 'text-yellow-500', borderColor: isLight ? 'border-yellow-300' : 'border-yellow-500/40' },
                  { time: '14:32:05', module: 'Cart', msg: 'Auth token validation failed - rejecting requests', icon: ShoppingCart, color: 'text-blue-500', borderColor: isLight ? 'border-blue-300' : 'border-blue-500/40' },
                  { time: '14:32:08', module: 'Payment', msg: 'Cart data unavailable - payment halted', icon: CreditCard, color: 'text-green-500', borderColor: isLight ? 'border-green-300' : 'border-green-500/40' },
                  { time: '14:32:12', module: 'Database', msg: 'Connection pool flooded - deadlock detected', icon: Database, color: 'text-teal-500', borderColor: isLight ? 'border-teal-300' : 'border-teal-500/40' },
                  { time: '14:32:15', module: 'SYSTEM', msg: 'TOTAL FAILURE - 0 users served', icon: AlertOctagon, color: 'text-red-500', borderColor: isLight ? 'border-red-400' : 'border-red-500/50' },
                ].map((step, i) => {
                  const Icon = step.icon;
                  const isLast = i === 5;
                  return (
                    <div key={i} className="relative">
                      {/* Connector line */}
                      {i < 5 && (
                        <motion.div
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.18 + 0.1, duration: 0.3 }}
                          className="absolute left-[17px] top-[42px] w-[2px] h-[calc(100%-14px)] origin-top"
                        >
                          <svg width="2" height="100%">
                            <motion.line
                              x1="1" y1="0" x2="1" y2="100%"
                              stroke="rgba(239,68,68,0.3)"
                              strokeWidth="2"
                              strokeDasharray="3 3"
                              initial={{ strokeDashoffset: 0 }}
                              animate={{ strokeDashoffset: -12 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          </svg>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.18, type: 'spring', stiffness: 180, damping: 20 }}
                        className={`flex items-start gap-3 rounded-xl border ${step.borderColor} ${
                          isLast
                            ? (isLight ? 'bg-red-50' : 'bg-red-950/40')
                            : (isLight ? 'bg-slate-50' : 'bg-mcb-950/40')
                        } p-3 mb-2 relative z-10`}
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.55 + i * 0.18, type: 'spring', stiffness: 400, damping: 12 }}
                          className="relative"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isLast
                              ? (isLight ? 'bg-red-100 border border-red-300' : 'bg-red-500/20 border border-red-500/40')
                              : (isLight ? 'bg-slate-100 border border-slate-200' : 'bg-mcb-800/50 border border-mcb-700/40')
                          }`}>
                            <Icon size={16} className={step.color} />
                          </div>
                          {isLast && (
                            <motion.div
                              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="absolute inset-0 rounded-lg border border-red-500/40"
                            />
                          )}
                        </motion.div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-mcb-300">{step.time}</span>
                            <span className={`text-xs font-bold ${isLast ? 'text-red-500' : 'text-mcb-50'}`}>{step.module}</span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isLast ? (isLight ? 'text-red-600' : 'text-red-300') : 'text-mcb-200'}`}>{step.msg}</p>
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.18, type: 'spring', stiffness: 500, damping: 12 }}
                        >
                          <X size={14} className="text-red-500 shrink-0 mt-1" />
                        </motion.div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Impact dashboard */}
            <div className="space-y-4">
              {/* Error visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 20 }}
                className={`relative h-52 rounded-2xl border-2 flex items-center justify-center overflow-hidden ${
                  isLight ? 'border-red-300 bg-red-50' : 'border-red-500/40 bg-red-950/20'
                }`}
              >
                <motion.div
                  animate={{ rotate: [-2, 2, -2, 2, 0], x: [-4, 4, -4, 4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <span className="text-6xl font-bold text-red-500">503</span>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className={`absolute bottom-4 text-sm font-mono ${isLight ? 'text-red-500' : 'text-red-300/70'}`}
                >
                  Service Unavailable
                </motion.p>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 2.2], opacity: [0.25, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7 }}
                    className="absolute inset-0 rounded-2xl border border-red-500/20"
                  />
                ))}
              </motion.div>

              {/* Impact metrics */}
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-sm font-bold text-left ${isLight ? 'text-red-600' : 'text-red-300'}`}
              >
                Incident Impact
              </motion.h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Users Affected', value: '10,247', color: 'text-red-500', bg: isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/30 border-red-800/40' },
                  { label: 'Downtime', value: '4h 23m', color: 'text-amber-500', bg: isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/30 border-amber-800/40' },
                  { label: 'Revenue Lost', value: '$47,830', color: 'text-red-600', bg: isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/30 border-red-800/40' },
                  { label: 'Error Rate', value: '100%', color: 'text-red-500', bg: isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/30 border-red-800/40' },
                ].map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                    className={`rounded-xl border p-3 text-left ${metric.bg}`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-mcb-300 font-bold">{metric.label}</p>
                    <p className={`text-xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Root cause */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className={`rounded-xl border p-4 text-left ${
                  isLight ? 'border-red-200 bg-red-50' : 'border-red-500/30 bg-red-950/20'
                }`}
              >
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-red-600' : 'text-red-300'}`}>Post-Incident Root Cause</p>
                <p className="text-sm text-mcb-200 leading-relaxed">
                  A single <code className={`px-1 rounded ${isLight ? 'text-red-600 bg-red-100' : 'text-red-300 bg-red-950/50'}`}>null</code> check was missing in the Profile module.
                  Because all 8 modules share the same process and database connection pool,
                  the exception cascaded and brought down <strong className="text-mcb-50">everything</strong> in 14 seconds.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={prevScene} variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              We need a better way... <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══════ Scene 2: Microservices (rich) ═══════ */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="text-4xl font-bold text-mcb-50"
          >
            Chapter 2: <span className="text-transparent bg-clip-text bg-gradient-to-r from-mcb-400 to-green-500">Microservices</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-mcb-200 max-w-3xl mx-auto leading-relaxed"
          >
            We break the Giant into <strong className="text-mcb-50">small, independent services</strong>.
            Each one does one thing well. Each runs in its own process, has its own database, and can be deployed separately.
          </motion.p>

          {/* Architecture diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 140, damping: 20 }}
            className={`relative rounded-2xl border-2 p-6 md:p-8 overflow-hidden min-h-[420px] ${
              isLight ? 'border-slate-200 bg-slate-50/80' : 'border-mcb-800 bg-mcb-950/50'
            }`}
          >
            {/* API Gateway header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`flex items-center justify-center gap-3 mb-6 py-3 px-5 rounded-xl border mx-auto ${
                isLight ? 'border-slate-200 bg-white' : 'border-mcb-700/40 bg-mcb-900/40'
              }`}
            >
              <Globe size={20} className="text-mcb-400" />
              <span className="text-sm font-bold text-mcb-200">API Gateway</span>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
            </motion.div>

            {/* Services grid */}
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {([
                { name: 'Auth', icon: Lock, color: isLight ? 'border-yellow-300' : 'border-yellow-500/40', bg: isLight ? 'bg-yellow-50' : 'bg-yellow-950/30', iconColor: 'text-yellow-500', tech: 'Go', instances: 3 },
                { name: 'Cart', icon: ShoppingCart, color: isLight ? 'border-blue-300' : 'border-blue-500/40', bg: isLight ? 'bg-blue-50' : 'bg-blue-950/30', iconColor: 'text-blue-500', tech: 'Node.js', instances: 2 },
                { name: 'Payment', icon: CreditCard, color: isLight ? 'border-green-300' : 'border-green-500/40', bg: isLight ? 'bg-green-50' : 'bg-green-950/30', iconColor: 'text-green-500', tech: 'Java', instances: 4 },
                { name: 'Profile', icon: User, color: isLight ? 'border-purple-300' : 'border-purple-500/40', bg: isLight ? 'bg-purple-50' : 'bg-purple-950/30', iconColor: 'text-purple-500', tech: 'Python', instances: 2 },
                { name: 'Search', icon: Search, color: isLight ? 'border-sky-300' : 'border-sky-500/40', bg: isLight ? 'bg-sky-50' : 'bg-sky-950/30', iconColor: 'text-sky-500', tech: 'Rust', instances: 5 },
              ] as const).map((svc, i) => {
                const isDown = crashedService === svc.name;
                const Icon = svc.icon;
                return (
                  <motion.div
                    key={svc.name}
                    initial={{ scale: 0, y: 20 }}
                    animate={{
                      scale: 1,
                      y: 0,
                      borderColor: isDown ? 'rgba(239,68,68,0.6)' : undefined,
                    }}
                    transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 200, damping: 18 }}
                    whileHover={{ y: -6, scale: 1.04, boxShadow: '0 8px 30px rgba(99,102,241,0.15)' }}
                    className={`rounded-xl border p-3 md:p-4 flex flex-col items-center gap-2 relative cursor-default transition-colors ${
                      isDown
                        ? (isLight ? 'border-red-400 bg-red-50' : 'border-red-500/60 bg-red-950/40')
                        : `${svc.color} ${svc.bg}`
                    }`}
                  >
                    {/* Status dot */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isDown ? 'bg-red-500' : 'bg-green-500'}`} />
                      {!isDown && (
                        <motion.div
                          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-green-500"
                        />
                      )}
                    </div>

                    {/* Icon */}
                    {isDown ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                      >
                        <X size={28} className="text-red-500" />
                      </motion.div>
                    ) : (
                      <Icon size={28} className={svc.iconColor} />
                    )}

                    <span className={`text-sm font-bold ${isDown ? 'text-red-500' : 'text-mcb-50'}`}>{svc.name}</span>

                    {/* Tech badge */}
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                      isDown
                        ? (isLight ? 'border-red-300 text-red-500' : 'border-red-700 text-red-400')
                        : (isLight ? 'border-slate-300 text-slate-500' : 'border-mcb-700 text-mcb-400')
                    }`}>
                      {svc.tech}
                    </span>

                    {/* Own database */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.06 }}
                      className={`flex items-center gap-1 text-[9px] ${isDown ? 'text-red-400' : 'text-mcb-300'}`}
                    >
                      <Database size={8} /> own DB
                    </motion.div>

                    {/* Instance count */}
                    {!isDown && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 + i * 0.06 }}
                        className="flex gap-0.5"
                      >
                        {Array.from({ length: svc.instances }).map((_, j) => (
                          <motion.div
                            key={j}
                            animate={{ opacity: [0.4, 0.9, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: j * 0.3 }}
                            className="w-1 h-3 rounded-full bg-green-500/60"
                          />
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Circuit breaker callout when service is down */}
            <AnimatePresence>
              {crashedService && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={`mt-6 rounded-xl border p-4 flex gap-3 ${
                    isLight ? 'border-green-300 bg-green-50' : 'border-green-500/30 bg-green-950/20'
                  }`}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw size={18} className="text-green-500 shrink-0 mt-0.5" />
                  </motion.div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${isLight ? 'text-green-700' : 'text-green-300'}`}>Circuit Breaker Activated</p>
                    <p className={`text-xs mt-1 ${isLight ? 'text-green-600' : 'text-green-200/70'}`}>
                      <strong className="text-red-500">{crashedService}</strong> is isolated.
                      Other 4 services continue serving 8,000+ users normally.
                      The failed service will auto-restart independently.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={killService} variant="outline" className={`flex items-center gap-2 ${
              isLight ? 'border-red-300 text-red-600 hover:border-red-500' : 'border-red-800/50 text-red-300 hover:border-red-500'
            }`}>
              <AlertOctagon size={18} /> Crash a Service
            </Button>
            {crashedService && (
              <Button onClick={() => setCrashedService(null)} variant="outline" className="flex items-center gap-2 text-sm">
                <RefreshCw size={14} /> Heal All
              </Button>
            )}
          </div>

          {/* Benefits comparison cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'Independent Deploy', body: 'Ship Profile without touching Auth, Cart, or Payment. Each team deploys on their own schedule.', icon: Package, color: isLight ? 'border-green-200 bg-green-50' : 'border-green-500/30 bg-green-950/20', iconColor: 'text-green-500' },
              { title: 'Scale What Matters', body: 'Search gets heavy traffic? Scale only Search to 10 instances. Others stay at 2. Save money.', icon: Layers, color: isLight ? 'border-sky-200 bg-sky-50' : 'border-sky-500/30 bg-sky-950/20', iconColor: 'text-sky-500' },
              { title: 'Pick Any Tech', body: 'Auth in Go for speed, Search in Rust for performance, Cart in Node for productivity. Best tool for each job.', icon: Code, color: isLight ? 'border-purple-200 bg-purple-50' : 'border-purple-500/30 bg-purple-950/20', iconColor: 'text-purple-500' },
              { title: 'Fault Isolation', body: 'Profile crashes? Only Profile is down. Circuit breakers prevent cascade. 80% of the system keeps running.', icon: Wifi, color: isLight ? 'border-amber-200 bg-amber-50' : 'border-amber-500/30 bg-amber-950/20', iconColor: 'text-amber-500' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 180, damping: 20 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`rounded-xl border p-4 text-left cursor-default ${card.color}`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 400, damping: 12 }}
                  >
                    <Icon size={20} className={`${card.iconColor} mb-2`} />
                  </motion.div>
                  <p className="text-sm font-bold text-mcb-50">{card.title}</p>
                  <p className="text-xs text-mcb-200 mt-1.5 leading-relaxed">{card.body}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Monolith vs Microservices comparison */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={`rounded-xl border overflow-hidden ${isLight ? 'border-slate-200' : 'border-mcb-700/40'}`}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className={isLight ? 'bg-slate-100' : 'bg-mcb-900/60'}>
                  <th className={`px-4 py-2.5 text-left font-semibold border-b ${isLight ? 'text-slate-600 border-slate-200' : 'text-mcb-300 border-mcb-800'}`}>Aspect</th>
                  <th className={`px-4 py-2.5 text-left font-semibold border-b ${isLight ? 'text-red-600 border-slate-200' : 'text-red-300 border-mcb-800'}`}>Monolith</th>
                  <th className={`px-4 py-2.5 text-left font-semibold border-b ${isLight ? 'text-green-600 border-slate-200' : 'text-green-300 border-mcb-800'}`}>Microservices</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Deploy', 'Full app redeploy', 'Per-service deploy'],
                  ['Scaling', 'Scale everything', 'Scale what you need'],
                  ['Failure', 'One bug = total crash', 'One bug = one service down'],
                  ['Teams', 'All share one codebase', 'Each team owns a service'],
                  ['Tech', 'One language forever', 'Pick best tool per service'],
                ].map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.06 }}
                    className={`border-b ${isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-mcb-800/40 hover:bg-mcb-900/20'}`}
                  >
                    <td className="px-4 py-2 text-mcb-100 font-medium">{row[0]}</td>
                    <td className={`px-4 py-2 font-mono text-xs ${isLight ? 'text-red-500' : 'text-red-300/70'}`}>{row[1]}</td>
                    <td className={`px-4 py-2 font-mono text-xs ${isLight ? 'text-green-600' : 'text-green-300/70'}`}>{row[2]}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              But now we have a NEW problem... <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══════ Scene 3: Works on My Machine (Enhanced) ═══════ */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-mcb-50"
          >
            The "Works on My Machine" Curse
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-mcb-200 max-w-3xl mx-auto leading-relaxed"
          >
            Now we have 5+ independent services. Great! But each developer's machine is
            <strong className="text-mcb-50"> different from production</strong>. And production is
            <span className="text-red-500"> different from staging</span>. Chaos ensues.
          </motion.p>

          {/* Dev vs Prod comparison - two terminal cards */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Developer laptop */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 20 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 18 }}
                >
                  <Laptop size={32} className="text-blue-500" />
                </motion.div>
                <h3 className={`text-xl font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>Developer's Laptop</h3>
              </div>

              {/* Terminal - always dark for code */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">dev-laptop ~ $</span>
                </div>
                <div className="p-4 font-mono text-sm space-y-1.5">
                  {[
                    { key: 'OS', val: 'macOS 14.2 (ARM64)', ok: true },
                    { key: 'Node.js', val: 'v20.11.0', ok: true },
                    { key: 'Python', val: '3.12.1', ok: true },
                    { key: 'Go', val: '1.21.5', ok: true },
                    { key: 'PostgreSQL', val: '16.1', ok: true },
                    { key: 'Redis', val: '7.2.3', ok: true },
                    { key: 'OpenSSL', val: '3.2.0', ok: true },
                  ].map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex justify-between"
                    >
                      <span className="text-slate-400">{item.key}:</span>
                      <span className="text-green-400">{item.val}</span>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="pt-2 border-t border-slate-700 flex items-center gap-2"
                  >
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-green-400 font-bold">ALL TESTS PASSING</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Production server */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 160, damping: 20 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 18 }}
                >
                  <Server size={32} className="text-red-500" />
                </motion.div>
                <h3 className={`text-xl font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>Production Server</h3>
              </div>

              {/* Terminal - always dark */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">prod-server ~ #</span>
                </div>
                <div className="p-4 font-mono text-sm space-y-1.5">
                  {[
                    { key: 'OS', val: 'Ubuntu 20.04 (x86_64)', ok: false, note: 'DIFFERENT ARCH' },
                    { key: 'Node.js', val: 'v14.21.3', ok: false, note: '6 MAJOR VERSIONS BEHIND' },
                    { key: 'Python', val: '2.7.18', ok: false, note: 'END OF LIFE!' },
                    { key: 'Go', val: '1.17.0', ok: false, note: '4 VERSIONS BEHIND' },
                    { key: 'PostgreSQL', val: '12.4', ok: false, note: 'INCOMPATIBLE FEATURES' },
                    { key: 'Redis', val: '5.0.7', ok: false, note: 'MISSING STREAMS API' },
                    { key: 'OpenSSL', val: '1.1.1f', ok: false, note: 'KNOWN CVE!' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.08 }}
                      className="flex justify-between gap-2"
                    >
                      <span className="text-slate-400">{item.key}:</span>
                      <div className="text-right">
                        <span className="text-red-400">{item.val}</span>
                        <span className="text-red-500/60 text-[10px] block">{item.note}</span>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="pt-2 border-t border-slate-700 flex items-center gap-2"
                  >
                    <XCircle size={14} className="text-red-500" />
                    <span className="text-red-400 font-bold">DEPLOY FAILED</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dependency Conflict Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <h3 className={`text-lg font-bold text-left flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-mcb-100'}`}>
              <AlertTriangle size={18} className="text-amber-500" />
              Dependency Conflict Matrix
            </h3>
            <div className={`rounded-xl border overflow-hidden ${isLight ? 'border-slate-200' : 'border-mcb-700/40'}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={isLight ? 'bg-slate-100' : 'bg-mcb-900/60'}>
                    {['Service', 'Runtime', 'DB Driver', 'SSL Lib', 'Conflict?'].map((h) => (
                      <th key={h} className={`px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-b ${
                        isLight ? 'text-slate-500 border-slate-200' : 'text-mcb-300 border-mcb-800'
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { svc: 'Auth', runtime: 'Go 1.21', db: 'pgx v5', ssl: 'OpenSSL 3.x', conflict: false },
                    { svc: 'Cart', runtime: 'Node 20', db: 'pg v8', ssl: 'OpenSSL 3.x', conflict: false },
                    { svc: 'Payment', runtime: 'Java 17', db: 'JDBC 42.6', ssl: 'BouncyCastle', conflict: true },
                    { svc: 'Profile', runtime: 'Python 3.12', db: 'psycopg 3', ssl: 'OpenSSL 3.x', conflict: false },
                    { svc: 'Search', runtime: 'Rust 1.75', db: 'sqlx 0.7', ssl: 'rustls', conflict: true },
                  ].map((row, i) => (
                    <motion.tr
                      key={row.svc}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.06 }}
                      className={`border-b ${isLight ? 'border-slate-100' : 'border-mcb-800/30'} ${
                        row.conflict ? (isLight ? 'bg-red-50' : 'bg-red-950/10') : ''
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-mcb-100">{row.svc}</td>
                      <td className="px-3 py-2 font-mono text-xs text-mcb-200">{row.runtime}</td>
                      <td className="px-3 py-2 font-mono text-xs text-mcb-200">{row.db}</td>
                      <td className="px-3 py-2 font-mono text-xs text-mcb-200">{row.ssl}</td>
                      <td className="px-3 py-2">
                        {row.conflict ? (
                          <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                            <XCircle size={12} /> Conflict
                          </span>
                        ) : (
                          <span className="text-green-500 text-xs flex items-center gap-1">
                            <CheckCircle size={12} /> OK
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Deployment Pipeline of Pain */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            <h3 className={`text-lg font-bold text-left flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-mcb-100'}`}>
              <Terminal size={18} className="text-mcb-400" />
              The Deployment Pipeline of Pain
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { step: 'Build', status: 'pass', icon: Code, detail: 'Compiles on macOS' },
                { step: 'Unit Tests', status: 'pass', icon: CheckCircle, detail: 'All 847 pass' },
                { step: 'Staging', status: 'pass', icon: Server, detail: 'Works on Ubuntu 22' },
                { step: 'Production', status: 'fail', icon: XCircle, detail: 'libssl.so.3 not found!' },
                { step: 'Rollback', status: 'warn', icon: RefreshCw, detail: '2h debugging env' },
              ].map((item, i) => {
                const Icon = item.icon;
                const isFail = item.status === 'fail';
                const isWarn = item.status === 'warn';
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                    className={`rounded-xl border p-3 text-center ${
                      isFail
                        ? (isLight ? 'border-red-300 bg-red-50' : 'border-red-500/40 bg-red-950/20')
                        : isWarn
                          ? (isLight ? 'border-amber-300 bg-amber-50' : 'border-amber-500/40 bg-amber-950/20')
                          : (isLight ? 'border-green-200 bg-green-50' : 'border-green-500/30 bg-green-950/20')
                    }`}
                  >
                    <Icon size={24} className={`mx-auto mb-2 ${
                      isFail ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-green-500'
                    }`} />
                    <p className="text-xs font-bold text-mcb-50">{item.step}</p>
                    <p className={`text-[10px] mt-1 ${
                      isFail ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-mcb-300'
                    }`}>{item.detail}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* The Scale Problem */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className={`rounded-xl border p-6 ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-mcb-800/40 bg-mcb-950/30'
            }`}
          >
            <h3 className="text-lg font-bold text-mcb-50 mb-4 flex items-center gap-2">
              <Cpu size={18} className="text-mcb-400" />
              Now Multiply This by Every Service...
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: '5 services', sub: 'Each with unique runtime', icon: Hash },
                { label: '4 environments', sub: 'Dev, CI, Staging, Prod', icon: Server },
                { label: '= 20 configs', sub: 'All must match exactly', icon: AlertTriangle },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + i * 0.1 }}
                    className="space-y-1"
                  >
                    <Icon size={24} className={`mx-auto ${i === 2 ? 'text-red-500' : 'text-mcb-400'}`} />
                    <p className={`text-2xl font-bold ${i === 2 ? 'text-red-500' : 'text-mcb-50'}`}>{item.label}</p>
                    <p className="text-xs text-mcb-300">{item.sub}</p>
                  </motion.div>
                );
              })}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-sm text-mcb-200 mt-4 text-center"
            >
              At 100 microservices, you're managing <strong className="text-red-500">400 environment configurations</strong>.
              One mismatch = production outage. Manual management is <span className="text-red-500">impossible</span>.
            </motion.p>
          </motion.div>

          {/* Error Terminal - always dark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 ml-2">prod-deploy.log</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-1">
              {[
                { text: '$ kubectl apply -f payment-service.yaml', color: 'text-slate-300' },
                { text: 'deployment.apps/payment created', color: 'text-green-400' },
                { text: 'pod/payment-7b9f4 0/1 CrashLoopBackOff', color: 'text-red-400' },
                { text: '', color: '' },
                { text: 'Error: /usr/lib/x86_64-linux-gnu/libssl.so.3: not found', color: 'text-red-500' },
                { text: 'Error: Payment service requires OpenSSL 3.x but server has 1.1.1f', color: 'text-red-500' },
                { text: 'Error: Node.js v14 does not support ES2022 syntax used in cart-client', color: 'text-red-500' },
                { text: '', color: '' },
                { text: '# 3 hours later...', color: 'text-slate-500' },
                { text: '$ ssh admin@prod "apt upgrade openssl"  # breaks Auth service', color: 'text-amber-400' },
                { text: '$ ssh admin@prod "apt install python3.12"  # conflicts with system python', color: 'text-amber-400' },
              ].map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7 + i * 0.06 }}
                  className={line.color}
                >
                  {line.text || '\u00A0'}
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* Key Insight - the solution teaser */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            className={`rounded-xl border p-5 text-left max-w-3xl mx-auto ${
              isLight ? 'border-blue-300 bg-blue-50' : 'border-mcb-500/30 bg-mcb-900/40'
            }`}
          >
            <p className={`font-bold text-lg ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
              What if the app could carry its own environment?
            </p>
            <p className="text-sm text-mcb-200 mt-2 leading-relaxed">
              What if we could package every service <strong className="text-mcb-50">with its exact dependencies</strong> - the right OS, the right libraries, the right runtime - into a single, portable unit that runs <strong className="text-mcb-50">identically everywhere</strong>?
            </p>
            <p className={`text-sm mt-2 font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
              That's exactly what containers do.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2 whitespace-nowrap">
              Enter the Hero: Docker <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
