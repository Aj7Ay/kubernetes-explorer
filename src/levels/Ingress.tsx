import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import {
  ArrowRight,
  ArrowLeft,
  Globe,
  DoorOpen,
  Radio,
  CheckCircle,
  Shield,
  Lock,
  Server,
  Cloud,
  Ship,
  DollarSign,
  Settings,
  Zap,
} from 'lucide-react';

interface IngressProps {
  onComplete: () => void;
}

export const Ingress: React.FC<IngressProps> = ({ onComplete }) => {
  const [scene, setScene] = useState(0);

  // Scene 0
  const [showComparison, setShowComparison] = useState(false);

  // Scene 1
  const [activeRule, setActiveRule] = useState<string | null>(null);
  const [rulePacket, setRulePacket] = useState<string | null>(null);

  // Scene 2
  const [tlsStep, setTlsStep] = useState(0);

  // Scene 3
  const [selectedController, setSelectedController] = useState<string | null>(null);

  // Scene 4
  const [journeyStep, setJourneyStep] = useState(-1);
  const [journeyRunning, setJourneyRunning] = useState(false);

  const nextScene = () => setScene(prev => prev + 1);
  const prevScene = () => setScene(prev => Math.max(0, prev - 1));

  // Scene 0: auto-show comparison
  useEffect(() => {
    if (scene === 0) {
      const t = setTimeout(() => setShowComparison(true), 800);
      return () => clearTimeout(t);
    }
  }, [scene]);

  // Scene 4: journey auto-advance
  useEffect(() => {
    if (!journeyRunning || journeyStep >= 6) return;
    const t = setTimeout(() => {
      setJourneyStep(prev => prev + 1);
    }, 1200);
    return () => clearTimeout(t);
  }, [journeyRunning, journeyStep]);

  const fireRulePacket = (rule: string) => {
    setActiveRule(rule);
    setRulePacket(rule);
    setTimeout(() => setRulePacket(null), 1800);
  };

  const journeyHops = [
    { label: 'Browser', icon: Globe, color: 'bg-blue-500', desc: 'User types app.example.com' },
    { label: 'DNS', icon: Globe, color: 'bg-cyan-500', desc: 'DNS resolves to Load Balancer IP' },
    { label: 'Cloud LB', icon: Cloud, color: 'bg-violet-500', desc: 'Cloud Load Balancer receives traffic' },
    { label: 'Ingress Controller', icon: DoorOpen, color: 'bg-orange-500', desc: 'NGINX matches host/path rules' },
    { label: 'Service', icon: Radio, color: 'bg-mcb-500', desc: 'ClusterIP routes to healthy pod' },
    { label: 'Pod', icon: Ship, color: 'bg-green-500', desc: 'Container processes the request' },
    { label: 'Response', icon: Zap, color: 'bg-yellow-500', desc: 'Response travels back to browser' },
  ];

  return (
    <div className="min-h-[600px] flex flex-col items-center text-center space-y-8 font-sans max-w-6xl mx-auto w-full">

      {/* Scene 0: Why Ingress? */}
      {scene === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 w-full">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-5xl font-extrabold text-mcb-50"
          >
            Why Do We Need Ingress?
          </motion.h2>
          <p className="text-xl text-mcb-200 max-w-3xl mx-auto">
            Giving each service its own LoadBalancer is <strong>expensive</strong> and <strong>messy</strong>.
            Ingress consolidates routing into a single entry point.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Without Ingress */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-left"
            >
              <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                <DollarSign size={20} /> Without Ingress
              </h3>
              <div className="space-y-3">
                {['auth-service', 'api-service', 'web-service', 'admin-service', 'ws-service'].map((svc, i) => (
                  <motion.div
                    key={svc}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-red-600/40 rounded flex items-center justify-center">
                      <Cloud size={14} className="text-red-300" />
                    </div>
                    <span className="text-sm text-red-200 font-mono">{svc}</span>
                    <span className="text-xs text-red-400">← own LoadBalancer ($$$)</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-4 text-red-400 font-bold text-lg"
              >
                5 LoadBalancers = 5x cost
              </motion.div>
            </motion.div>

            {/* With Ingress */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 text-left"
            >
              <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                <CheckCircle size={20} /> With Ingress
              </h3>
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="w-full bg-emerald-600/20 border-2 border-emerald-500 rounded-xl p-3 flex items-center justify-center gap-3"
                >
                  <DoorOpen size={24} className="text-emerald-300" />
                  <span className="font-bold text-emerald-100">1 Ingress Controller</span>
                </motion.div>
                <svg width="24" height="40" className="text-emerald-500">
                  <motion.line
                    x1="12" y1="0" x2="12" y2="40"
                    stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -12 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
                {showComparison && ['auth', 'api', 'web', 'admin', 'ws'].map((svc, i) => (
                  <motion.div
                    key={svc}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-full bg-emerald-800/30 rounded-lg p-2 text-sm text-emerald-200 font-mono text-center"
                  >
                    /{svc} → {svc}-service
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-4 text-emerald-400 font-bold text-lg"
              >
                1 LoadBalancer = 1x cost
              </motion.div>
            </motion.div>
          </div>

          <Button onClick={nextScene} className="text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto">
            Explore Ingress Rules <ArrowRight />
          </Button>
        </motion.div>
      )}

      {/* Scene 1: Ingress Rules */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50">Ingress Routing Rules</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Ingress uses <strong>host-based</strong> and <strong>path-based</strong> rules to route traffic to different services.
            Click a rule to see the traffic flow.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Rules + YAML */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-bold text-mcb-300">Rules</h3>
              {[
                { id: 'host-web', host: 'app.example.com', path: '/', service: 'web-svc', port: 80, color: 'border-green-500' },
                { id: 'host-api', host: 'app.example.com', path: '/api', service: 'api-svc', port: 8080, color: 'border-blue-500' },
                { id: 'host-admin', host: 'admin.example.com', path: '/', service: 'admin-svc', port: 3000, color: 'border-amber-500' },
              ].map((rule) => (
                <motion.button
                  key={rule.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fireRulePacket(rule.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    activeRule === rule.id
                      ? `${rule.color} bg-mcb-900/60`
                      : 'border-mcb-800 bg-mcb-950/50 hover:border-mcb-600'
                  }`}
                >
                  <div className="font-mono text-sm">
                    <span className="text-mcb-400">host:</span> <span className="text-mcb-50">{rule.host}</span>
                  </div>
                  <div className="font-mono text-sm">
                    <span className="text-mcb-400">path:</span> <span className="text-mcb-50">{rule.path}</span>
                    <span className="text-mcb-400"> → </span>
                    <span className="text-mcb-300">{rule.service}:{rule.port}</span>
                  </div>
                </motion.button>
              ))}

              {/* YAML */}
              <div className="bg-black/40 p-4 rounded-xl font-mono text-xs border border-mcb-800 mt-4">
                <div className="text-mcb-400 mb-2"># ingress.yaml</div>
                <div><span className="text-mcb-400">apiVersion:</span> <span className="text-mcb-50">networking.k8s.io/v1</span></div>
                <div><span className="text-mcb-400">kind:</span> <span className="text-mcb-50">Ingress</span></div>
                <div><span className="text-mcb-400">spec:</span></div>
                <div className="pl-2"><span className="text-mcb-400">rules:</span></div>
                <div className="pl-4"><span className="text-mcb-50">- host: app.example.com</span></div>
                <div className="pl-6"><span className="text-mcb-400">http:</span></div>
                <div className="pl-8"><span className="text-mcb-400">paths:</span></div>
                <div className="pl-10"><span className="text-mcb-50">- path: /</span></div>
                <div className="pl-12"><span className="text-mcb-400">backend:</span></div>
                <div className="pl-14"><span className="text-mcb-50">service: web-svc</span></div>
              </div>
            </div>

            {/* Traffic visualization */}
            <div className="relative bg-mcb-950/50 rounded-2xl border border-mcb-800 p-6 min-h-[480px] flex flex-col items-center justify-between">
              {/* Internet */}
              <div className="flex flex-col items-center gap-1 z-10">
                <Globe size={36} className="text-blue-400" />
                <span className="text-xs text-mcb-300">Internet</span>
              </div>

              {/* Ingress Controller */}
              <motion.div
                animate={rulePacket ? { borderColor: 'rgb(168, 85, 247)' } : { borderColor: 'rgba(99, 102, 241, 0.5)' }}
                className="w-44 bg-mcb-800/50 border-2 rounded-xl p-3 flex flex-col items-center gap-1 z-10"
              >
                <DoorOpen size={28} className="text-mcb-400" />
                <span className="font-bold text-mcb-100 text-sm">Ingress Controller</span>
              </motion.div>

              {/* Services */}
              <div className="flex justify-between w-full gap-2 z-10">
                {[
                  { id: 'host-web', name: 'web-svc', color: 'text-green-400' },
                  { id: 'host-api', name: 'api-svc', color: 'text-blue-400' },
                  { id: 'host-admin', name: 'admin-svc', color: 'text-amber-400' },
                ].map((svc) => (
                  <motion.div
                    key={svc.id}
                    animate={activeRule === svc.id ? { scale: 1.08, borderColor: 'rgb(168, 85, 247)' } : { scale: 1 }}
                    className="bg-mcb-900 border-2 border-mcb-700 p-3 rounded-lg flex flex-col items-center flex-1"
                  >
                    <Radio size={18} className={svc.color} />
                    <span className="text-[10px] font-bold text-mcb-50 mt-1">{svc.name}</span>
                  </motion.div>
                ))}
              </div>

              {/* Animated packet */}
              <AnimatePresence>
                {rulePacket && (
                  <motion.div
                    key={rulePacket + Date.now()}
                    initial={{ top: 40, left: '50%', scale: 0, x: '-50%' }}
                    animate={{
                      top: [40, 160, 380],
                      left: ['50%', '50%', rulePacket === 'host-web' ? '20%' : rulePacket === 'host-api' ? '50%' : '80%'],
                      scale: [1, 1, 0.5],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 1.5, times: [0, 0.4, 1] }}
                    className="absolute w-5 h-5 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)] z-20"
                  />
                )}
              </AnimatePresence>

              {/* SVG flow lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
                <motion.line
                  x1="50%" y1="50" x2="50%" y2="180"
                  stroke="rgba(99,102,241,0.3)" strokeWidth="1" strokeDasharray="4 2"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -12 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </svg>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: TLS/HTTPS <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 2: TLS/HTTPS */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50 flex items-center justify-center gap-3">
            <Shield className="text-green-400" /> TLS Termination
          </h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Ingress can handle <strong>HTTPS</strong> for you. It terminates TLS at the edge,
            so internal traffic can remain plain HTTP - simpler and faster.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* TLS Flow */}
            <div className="relative bg-mcb-950/50 rounded-2xl border border-mcb-800 p-6 min-h-[400px] flex flex-col items-center justify-between">
              {/* Client */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <Globe size={36} className="text-blue-400" />
                <span className="text-xs text-mcb-300">Client (Browser)</span>
                <div className="flex items-center gap-1 bg-green-900/50 px-2 py-1 rounded text-xs text-green-300">
                  <Lock size={10} /> HTTPS
                </div>
              </motion.div>

              {/* Encrypted zone */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full relative"
              >
                <div className="absolute left-0 right-0 border-l-2 border-r-2 border-dashed border-green-500/30 h-full" />
                <svg width="100%" height="60">
                  <motion.line
                    x1="50%" y1="0" x2="50%" y2="60"
                    stroke="#22c55e" strokeWidth="2" strokeDasharray="6 3"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -18 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute right-2 top-2 text-[10px] text-green-400 font-mono"
                >
                  Encrypted
                </motion.div>
              </motion.div>

              {/* Ingress - TLS Termination */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="w-52 bg-mcb-800/60 border-2 border-green-500 rounded-xl p-3 flex flex-col items-center gap-1 relative"
              >
                <div className="absolute -top-3 bg-green-500 text-mcb-50 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Lock size={10} /> TLS Terminated
                </div>
                <DoorOpen size={24} className="text-mcb-400" />
                <span className="font-bold text-mcb-100 text-sm">Ingress Controller</span>
              </motion.div>

              {/* Unencrypted zone */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full"
              >
                <svg width="100%" height="60">
                  <motion.line
                    x1="50%" y1="0" x2="50%" y2="60"
                    stroke="#64748b" strokeWidth="2" strokeDasharray="4 2"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -12 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute right-2 text-[10px] text-slate-400 font-mono"
                >
                  Plain HTTP
                </motion.div>
              </motion.div>

              {/* Backend Service */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-3"
              >
                <div className="bg-mcb-800 border border-mcb-600 rounded-lg p-3 flex flex-col items-center">
                  <Radio size={18} className="text-mcb-400" />
                  <span className="text-xs text-mcb-300 mt-1">Service</span>
                </div>
                <span className="text-mcb-400">→</span>
                <div className="bg-mcb-800 border border-mcb-600 rounded-lg p-3 flex flex-col items-center">
                  <Ship size={18} className="text-mcb-400" />
                  <span className="text-xs text-mcb-300 mt-1">Pod</span>
                </div>
              </motion.div>
            </div>

            {/* TLS Config */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-bold text-mcb-300">Certificate Setup</h3>

              <div className="space-y-3">
                {[
                  { step: 1, title: 'Create TLS Secret', desc: 'Store certificate and private key', active: tlsStep >= 0 },
                  { step: 2, title: 'Reference in Ingress', desc: 'Add tls section to Ingress spec', active: tlsStep >= 1 },
                  { step: 3, title: 'HTTPS Active', desc: 'All traffic encrypted end-to-client', active: tlsStep >= 2 },
                ].map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.2 }}
                    onClick={() => setTlsStep(i)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      s.active
                        ? 'border-green-500/60 bg-green-900/20'
                        : 'border-mcb-800 bg-mcb-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        s.active ? 'bg-green-500 text-mcb-50' : 'bg-mcb-800 text-mcb-400'
                      }`}>
                        {s.step}
                      </div>
                      <div>
                        <div className="font-bold text-mcb-50 text-sm">{s.title}</div>
                        <div className="text-xs text-mcb-300">{s.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* YAML */}
              <div className="bg-black/40 p-4 rounded-xl font-mono text-xs border border-mcb-800">
                <div className="text-mcb-400 mb-2"># TLS Secret</div>
                <div><span className="text-mcb-400">apiVersion:</span> <span className="text-mcb-50">v1</span></div>
                <div><span className="text-mcb-400">kind:</span> <span className="text-mcb-50">Secret</span></div>
                <div><span className="text-mcb-400">type:</span> <span className="text-green-400">kubernetes.io/tls</span></div>
                <div><span className="text-mcb-400">data:</span></div>
                <div className="pl-2"><span className="text-mcb-400">tls.crt:</span> <span className="text-mcb-300">&lt;base64-cert&gt;</span></div>
                <div className="pl-2"><span className="text-mcb-400">tls.key:</span> <span className="text-mcb-300">&lt;base64-key&gt;</span></div>
                <div className="mt-3 text-mcb-400"># In Ingress spec:</div>
                <div><span className="text-mcb-400">tls:</span></div>
                <div className="pl-2"><span className="text-mcb-50">- hosts:</span></div>
                <div className="pl-6"><span className="text-mcb-50">- app.example.com</span></div>
                <div className="pl-4"><span className="text-mcb-400">secretName:</span> <span className="text-green-400">app-tls</span></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: Ingress Controllers <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 3: Ingress Controller */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-3xl font-bold text-mcb-50 flex items-center justify-center gap-3">
            <Settings className="text-mcb-400" /> The Ingress Controller
          </h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            An Ingress <strong>resource</strong> is just config - it does nothing alone. You need an Ingress <strong>Controller</strong> (a running pod) that reads those rules and acts as the actual reverse proxy.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Architecture */}
            <div className="relative bg-mcb-950/50 rounded-2xl border border-mcb-800 p-6 min-h-[400px] flex flex-col items-center justify-between gap-4">
              {/* Ingress Resource */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-mcb-800/40 border-2 border-dashed border-mcb-500 rounded-xl p-4 text-left"
              >
                <div className="text-xs text-mcb-400 uppercase tracking-wider mb-1">Ingress Resource (YAML)</div>
                <div className="font-mono text-xs text-mcb-300">
                  <div>host: app.example.com</div>
                  <div>path: / → web-svc</div>
                  <div>path: /api → api-svc</div>
                </div>
              </motion.div>

              {/* Arrow: reads */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <span className="text-xs text-mcb-400 font-mono">reads</span>
                <svg width="24" height="30">
                  <motion.line
                    x1="12" y1="0" x2="12" y2="30"
                    stroke="rgba(99,102,241,0.6)" strokeWidth="2" strokeDasharray="4 2"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -12 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
              </motion.div>

              {/* Ingress Controller Pod */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="w-full bg-orange-900/30 border-2 border-orange-500 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <DoorOpen size={24} className="text-mcb-50" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-mcb-50">Ingress Controller Pod</div>
                  <div className="text-xs text-orange-300">Running reverse proxy (NGINX, Traefik, etc.)</div>
                </div>
              </motion.div>

              {/* Arrow: routes to */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col items-center"
              >
                <span className="text-xs text-mcb-400 font-mono">routes to</span>
                <svg width="24" height="30">
                  <motion.line
                    x1="12" y1="0" x2="12" y2="30"
                    stroke="rgba(99,102,241,0.6)" strokeWidth="2" strokeDasharray="4 2"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -12 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
              </motion.div>

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex gap-3 w-full"
              >
                {['web-svc', 'api-svc'].map((svc) => (
                  <div key={svc} className="flex-1 bg-mcb-800 border border-mcb-600 rounded-lg p-3 flex flex-col items-center">
                    <Radio size={16} className="text-mcb-400" />
                    <span className="text-xs text-mcb-300 mt-1">{svc}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Controller comparison */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-bold text-mcb-300">Popular Controllers</h3>
              {[
                { id: 'nginx', name: 'NGINX Ingress', desc: 'Most popular. Battle-tested, wide annotation support, great for most use cases.', color: 'border-green-500', icon: '🟢' },
                { id: 'traefik', name: 'Traefik', desc: 'Modern, auto-discovery, built-in dashboard, great for dynamic environments.', color: 'border-blue-500', icon: '🔵' },
                { id: 'haproxy', name: 'HAProxy', desc: 'High-performance, TCP/HTTP load balancing, used in enterprise setups.', color: 'border-amber-500', icon: '🟡' },
                { id: 'istio', name: 'Istio Gateway', desc: 'Full service mesh, advanced traffic management, mTLS between services.', color: 'border-violet-500', icon: '🟣' },
              ].map((ctrl, i) => (
                <motion.button
                  key={ctrl.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedController(ctrl.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    selectedController === ctrl.id
                      ? `${ctrl.color} bg-mcb-900/60`
                      : 'border-mcb-800 bg-mcb-950/50 hover:border-mcb-600'
                  }`}
                >
                  <div className="font-bold text-mcb-50 text-sm flex items-center gap-2">
                    <span>{ctrl.icon}</span> {ctrl.name}
                  </div>
                  <AnimatePresence>
                    {selectedController === ctrl.id && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-mcb-300 mt-2"
                      >
                        {ctrl.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}

              {/* Annotations example */}
              <div className="bg-black/40 p-4 rounded-xl font-mono text-xs border border-mcb-800 mt-4">
                <div className="text-mcb-400 mb-2"># Common annotations</div>
                <div><span className="text-mcb-400">annotations:</span></div>
                <div className="pl-2"><span className="text-orange-400">nginx.ingress.kubernetes.io/</span></div>
                <div className="pl-4"><span className="text-mcb-400">rate-limit:</span> <span className="text-mcb-50">"10"</span></div>
                <div className="pl-4"><span className="text-mcb-400">ssl-redirect:</span> <span className="text-mcb-50">"true"</span></div>
                <div className="pl-4"><span className="text-mcb-400">proxy-body-size:</span> <span className="text-mcb-50">"50m"</span></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={nextScene} className="flex items-center justify-center gap-2">
              Next: The Complete Journey <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Scene 4: Complete Journey */}
      {scene === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
          <h2 className="text-4xl font-extrabold text-mcb-50">The Complete Request Journey</h2>
          <p className="text-mcb-200 max-w-3xl mx-auto">
            Watch a single HTTP request travel through the <strong>entire Kubernetes network stack</strong> - from browser to pod and back.
          </p>

          {/* Journey visualization */}
          <div className="relative bg-mcb-950/50 rounded-2xl border border-mcb-800 p-8 min-h-[500px]">
            <div className="flex flex-col items-center gap-2">
              {journeyHops.map((hop, i) => {
                const Icon = hop.icon;
                const isActive = journeyStep === i;
                const isPassed = journeyStep > i;
                return (
                  <React.Fragment key={hop.label}>
                    <motion.div
                      initial={{ opacity: 0.3, scale: 0.9 }}
                      animate={{
                        opacity: isActive || isPassed ? 1 : 0.3,
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className={`relative flex items-center gap-4 w-full max-w-lg px-6 py-3 rounded-xl border-2 transition-colors ${
                        isActive
                          ? `${hop.color} border-white/40 shadow-lg`
                          : isPassed
                          ? 'bg-mcb-800/50 border-mcb-600'
                          : 'bg-mcb-900/30 border-mcb-800'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-white/20' : isPassed ? hop.color + '/40' : 'bg-mcb-800'
                      }`}>
                        <Icon size={20} className={isActive || isPassed ? 'text-mcb-50' : 'text-mcb-500'} />
                      </div>
                      <div className="text-left">
                        <div className={`font-bold text-sm ${isActive || isPassed ? 'text-mcb-50' : 'text-mcb-500'}`}>
                          {hop.label}
                        </div>
                        {(isActive || isPassed) && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-mcb-200"
                          >
                            {hop.desc}
                          </motion.div>
                        )}
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute right-4 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"
                        />
                      )}

                      {isPassed && (
                        <div className="absolute right-4">
                          <CheckCircle size={16} className="text-green-400" />
                        </div>
                      )}
                    </motion.div>

                    {/* Connector line */}
                    {i < journeyHops.length - 1 && (
                      <svg width="4" height="20" className="overflow-visible">
                        <motion.line
                          x1="2" y1="0" x2="2" y2="20"
                          stroke={isPassed ? '#a855f7' : 'rgba(99,102,241,0.3)'}
                          strokeWidth="2"
                          strokeDasharray="3 2"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: isPassed ? -10 : 0 }}
                          transition={{ duration: 0.8, repeat: isPassed ? Infinity : 0, ease: 'linear' }}
                        />
                      </svg>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Traveling packet */}
            <AnimatePresence>
              {journeyRunning && journeyStep >= 0 && journeyStep < journeyHops.length && (
                <motion.div
                  key={journeyStep}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute left-4 w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                  style={{ top: `${80 + journeyStep * 62}px` }}
                />
              )}
            </AnimatePresence>

            {/* Start button */}
            {!journeyRunning && journeyStep < 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-mcb-950/60 backdrop-blur-sm rounded-2xl"
              >
                <Button
                  onClick={() => { setJourneyRunning(true); setJourneyStep(0); }}
                  className="text-lg px-8 py-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  Start Request Journey <Zap size={20} />
                </Button>
              </motion.div>
            )}

            {/* Journey complete */}
            {journeyStep >= journeyHops.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
                className="absolute inset-0 flex items-center justify-center bg-mcb-950/80 backdrop-blur-sm rounded-2xl"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                  >
                    <CheckCircle size={40} className="text-mcb-50" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-mcb-50">Journey Complete!</h3>
                  <p className="text-mcb-200 max-w-md">
                    The request traveled through DNS, Load Balancer, Ingress Controller,
                    Service, and Pod - then the response traveled all the way back.
                  </p>
                  <Button
                    onClick={() => { setJourneyRunning(false); setJourneyStep(-1); }}
                    variant="outline"
                    className="flex items-center gap-2 mx-auto"
                  >
                    Replay Journey
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-mcb-900/40 to-mcb-900/40 p-8 rounded-2xl border border-mcb-500/30"
          >
            <h3 className="text-2xl font-bold text-mcb-50 mb-4">Kubernetes Networking Recap</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pod', desc: 'Gets unique IP', icon: Ship },
                { label: 'Service', desc: 'Stable endpoint', icon: Radio },
                { label: 'Ingress', desc: 'External routing', icon: DoorOpen },
                { label: 'TLS', desc: 'Encryption', icon: Lock },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.15 }}
                    className="bg-mcb-900/50 border border-mcb-700 rounded-xl p-4 flex flex-col items-center gap-2"
                  >
                    <Icon size={24} className="text-mcb-400" />
                    <span className="font-bold text-mcb-50 text-sm">{item.label}</span>
                    <span className="text-xs text-mcb-300">{item.desc}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={prevScene} variant="outline" className="flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back
            </Button>
            <Button onClick={onComplete} className="text-lg px-8 py-4 flex items-center justify-center gap-2">
              Journey Complete! <CheckCircle size={20} />
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
