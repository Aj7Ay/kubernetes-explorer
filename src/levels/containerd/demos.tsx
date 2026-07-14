import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  AlertTriangle,
  Check,
  Cog,
  Box,
  Package,
  Database,
  Network,
  Layers,
  Zap,
  ChevronDown,
  Eye,
  Server,
  Shield,
  Terminal,
  ArrowDown,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Shared chrome
   ═══════════════════════════════════════════════════════════ */
export function DemoShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-mcb-500/30 bg-gradient-to-br from-mcb-950/90 via-mcb-900/40 to-black/60 overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.12)]">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-mcb-700/40 bg-mcb-950/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mcb-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-mcb-400" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-mcb-300">{title}</span>
        </div>
        {hint && <span className="text-[10px] text-mcb-500 hidden sm:block">{hint}</span>}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}

export function DemoBtn({
  onClick,
  children,
  color = 'mcb',
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  color?: 'mcb' | 'green' | 'red' | 'amber' | 'blue';
  disabled?: boolean;
}) {
  const colors = {
    mcb: 'bg-mcb-600 hover:bg-mcb-500 border-mcb-400/40',
    green: 'bg-green-700 hover:bg-green-600 border-green-400/40',
    red: 'bg-red-700 hover:bg-red-600 border-red-400/40',
    amber: 'bg-amber-700 hover:bg-amber-600 border-amber-400/40',
    blue: 'bg-blue-700 hover:bg-blue-600 border-blue-400/40',
  };
  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white border flex items-center justify-center gap-2 transition-colors disabled:opacity-40 ${colors[color]}`}
    >
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. Engine intro - spinning gear + pulse tags
   ═══════════════════════════════════════════════════════════ */
export function DemoEngineIntro() {
  const tags = ['Images', 'Tasks', 'Snapshots', 'CRI', 'Networking'];
  return (
    <DemoShell title="Interactive · The Engine" hint="Watch the daemon pulse">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute -inset-8 rounded-full bg-mcb-500/20 blur-2xl"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-28 h-28 rounded-2xl bg-gradient-to-br from-mcb-600 to-mcb-900 border-2 border-mcb-400 flex items-center justify-center shadow-lg shadow-mcb-500/30"
          >
            <Cog size={56} className="text-white" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-2 border-dashed border-mcb-300/30 rounded-2xl"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((t, i) => (
            <motion.span
              key={t}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.12, type: 'spring' }}
              className="px-3 py-1 rounded-full text-xs font-mono bg-mcb-800/60 text-mcb-200 border border-mcb-600/40"
            >
              {t}
            </motion.span>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-mcb-300 text-center max-w-md"
        >
          containerd is the <strong className="text-white">engine</strong> - Docker is the steering wheel.
        </motion.p>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. Runtime stack - click layers
   ═══════════════════════════════════════════════════════════ */
const STACK_LAYERS = [
  {
    title: 'User / Client',
    color: 'from-blue-600 to-blue-800',
    items: ['Docker CLI', 'kubectl', 'nerdctl', 'crictl'],
    desc: 'What humans type. Commands travel down as API / gRPC / CRI calls.',
  },
  {
    title: 'High-Level Orchestration',
    color: 'from-sky-600 to-sky-800',
    items: ['Docker Engine', 'kubelet'],
    desc: 'Pods, health checks, DX features. Often just a client of containerd.',
  },
  {
    title: '★ containerd (The Engine)',
    color: 'from-mcb-600 to-mcb-800',
    items: ['Image', 'Container', 'Task', 'Snapshot', 'CRI Plugin'],
    desc: 'Full lifecycle daemon: images, snapshots, tasks, multi-tenancy namespaces.',
    highlight: true,
  },
  {
    title: 'containerd-shim',
    color: 'from-amber-600 to-amber-800',
    items: ['Per-container process', 'Survives daemon restart'],
    desc: 'Tiny process per container. Holds stdio, exit code, reaps zombies.',
  },
  {
    title: 'Low-Level OCI Runtime',
    color: 'from-red-600 to-red-800',
    items: ['runc', 'gVisor', 'Kata'],
    desc: 'Creates namespaces, cgroups, mounts rootfs, execs init, often exits.',
  },
  {
    title: 'Linux Kernel',
    color: 'from-slate-600 to-slate-800',
    items: ['namespaces', 'cgroups', 'seccomp', 'overlayfs'],
    desc: 'Real isolation happens here - containerd only orchestrates it.',
  },
];

export function DemoRuntimeStack() {
  const [active, setActive] = useState<number | null>(2);
  return (
    <DemoShell title="Interactive · Runtime Stack" hint="Click each layer">
      <div className="space-y-1.5 max-w-xl mx-auto">
        {STACK_LAYERS.map((layer, i) => (
          <div key={layer.title}>
            <motion.button
              type="button"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActive(active === i ? null : i)}
              className={`w-full text-left rounded-xl overflow-hidden border-2 transition-shadow ${
                layer.highlight
                  ? 'border-mcb-400 shadow-lg shadow-mcb-500/30 ring-1 ring-mcb-400/30'
                  : 'border-transparent'
              }`}
            >
              <div className={`bg-gradient-to-r ${layer.color} px-4 py-2.5 flex items-center justify-between`}>
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  {layer.highlight && (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                      <Cog size={16} />
                    </motion.span>
                  )}
                  {layer.title}
                </span>
                <motion.span animate={{ rotate: active === i ? 180 : 0 }}>
                  <ChevronDown size={16} className="text-white/70" />
                </motion.span>
              </div>
            </motion.button>
            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-black/40 border border-mcb-800/50 rounded-b-xl px-4 py-3 space-y-2">
                    <p className="text-sm text-mcb-200">{layer.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {layer.items.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 text-[11px] font-mono rounded bg-mcb-900/80 text-mcb-300 border border-mcb-700/40"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {i < STACK_LAYERS.length - 1 && (
              <div className="flex justify-center py-0.5 text-mcb-600">
                <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <ArrowDown size={14} />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. Architecture services explorer
   ═══════════════════════════════════════════════════════════ */
const SERVICES = [
  { name: 'gRPC API', icon: Network, color: 'text-blue-400', bg: 'bg-blue-900/40', desc: 'Socket /run/containerd/containerd.sock - all clients speak gRPC here.' },
  { name: 'CRI Plugin', icon: Server, color: 'text-sky-400', bg: 'bg-sky-900/40', desc: 'Kubernetes kubelet path. Pod sandboxes, image pulls, container start.' },
  { name: 'Image Svc', icon: Package, color: 'text-green-400', bg: 'bg-green-900/40', desc: 'Pull/push, manifests, tags. Content-addressable layer storage.' },
  { name: 'Container Svc', icon: Box, color: 'text-cyan-400', bg: 'bg-cyan-900/40', desc: 'Metadata only - config, labels, snapshot key. No process yet.' },
  { name: 'Task Svc', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-900/40', desc: 'Live processes. Spawns shims, kill, exec, metrics, pause/resume.' },
  { name: 'Snapshot Svc', icon: Layers, color: 'text-orange-400', bg: 'bg-orange-900/40', desc: 'overlayfs / btrfs / zfs / stargz. Parent chains + writable uppers.' },
  { name: 'Content Svc', icon: Database, color: 'text-pink-400', bg: 'bg-pink-900/40', desc: 'CAS blobs under /var/lib/containerd/.../blobs/sha256/.' },
  { name: 'Namespace Svc', icon: Shield, color: 'text-teal-400', bg: 'bg-teal-900/40', desc: 'Logical multi-tenancy: default, k8s.io, moby, custom teams.' },
];

export function DemoArchitecture() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <DemoShell title="Interactive · Inside containerd" hint="Click a service">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-2">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            const on = active === i;
            return (
              <motion.button
                key={svc.name}
                type="button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActive(i)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  on ? `${svc.bg} border-current ${svc.color}` : 'bg-mcb-950/40 border-mcb-800/40 hover:border-mcb-600'
                }`}
              >
                <Icon size={20} className={on ? svc.color : 'text-mcb-500'} />
                <p className={`text-xs font-bold mt-1.5 ${on ? 'text-white' : 'text-mcb-300'}`}>{svc.name}</p>
              </motion.button>
            );
          })}
        </div>
        <div className="min-h-[200px] rounded-xl border border-mcb-800 bg-black/40 flex items-center justify-center p-5">
          <AnimatePresence mode="wait">
            {active !== null && (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="text-left space-y-3 w-full"
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = SERVICES[active].icon;
                    return <Icon size={28} className={SERVICES[active].color} />;
                  })()}
                  <h4 className="text-lg font-bold text-white">{SERVICES[active].name}</h4>
                </div>
                <p className="text-sm text-mcb-200 leading-relaxed">{SERVICES[active].desc}</p>
                <div className="font-mono text-[11px] text-mcb-400 bg-mcb-950/60 rounded-lg px-3 py-2 border border-mcb-800">
                  /run/containerd/containerd.sock
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. Shim survival demo
   ═══════════════════════════════════════════════════════════ */
export function DemoShim() {
  const [step, setStep] = useState(0); // 0 idle, 1 running, 2 restarting, 3 survived

  const containers = [
    { name: 'web', emoji: '🌐', color: 'bg-green-700' },
    { name: 'api', emoji: '⚡', color: 'bg-blue-700' },
    { name: 'db', emoji: '🗄️', color: 'bg-yellow-700' },
  ];

  return (
    <DemoShell title="Interactive · Shim Survival" hint="Step through the demo">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          {step === 0 && (
            <DemoBtn color="green" onClick={() => setStep(1)}>
              <Play size={16} /> Launch 3 containers
            </DemoBtn>
          )}
          {step === 1 && (
            <DemoBtn color="red" onClick={() => setStep(2)}>
              <AlertTriangle size={16} /> Restart containerd daemon
            </DemoBtn>
          )}
          {step === 2 && (
            <DemoBtn color="blue" onClick={() => setStep(3)}>
              <Eye size={16} /> Check containers
            </DemoBtn>
          )}
          {step === 3 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl border border-green-500/40 bg-green-900/30 p-4 text-center"
            >
              <Check size={28} className="text-green-400 mx-auto mb-1" />
              <p className="text-green-300 font-bold text-sm">All 3 still running!</p>
              <p className="text-green-200/70 text-xs mt-1">Shims kept them alive</p>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="mt-3 text-xs text-mcb-400 underline flex items-center gap-1 mx-auto"
              >
                <RotateCcw size={12} /> Replay
              </button>
            </motion.div>
          )}

          <div className="rounded-xl bg-black/60 border border-mcb-800 p-3 font-mono text-[11px] text-left space-y-1 min-h-[140px]">
            <div className="text-mcb-500 border-b border-mcb-800 pb-1 mb-1 flex items-center gap-1">
              <Terminal size={12} /> terminal
            </div>
            {step >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-green-400">$ nerdctl run -d --name web nginx</p>
                <p className="text-green-400">$ nerdctl run -d --name api node</p>
                <p className="text-green-400">$ nerdctl run -d --name db postgres</p>
                <p className="text-white/80 mt-1">3 containers started</p>
              </motion.div>
            )}
            {step >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                <p className="text-red-400">$ systemctl restart containerd</p>
                <p className="text-yellow-300">containerd restarting…</p>
                {step >= 3 && <p className="text-green-400">containerd back online</p>}
              </motion.div>
            )}
            {step >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                <p className="text-blue-400">$ nerdctl ps</p>
                <p className="text-white">web nginx Up</p>
                <p className="text-white">api node Up</p>
                <p className="text-white">db postgres Up</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Process tree */}
        <div className="rounded-xl border border-mcb-800 bg-mcb-950/50 p-4 min-h-[280px] relative">
          <p className="text-[10px] font-mono text-mcb-500 mb-3">PROCESS TREE</p>
          <div className="flex flex-col items-center">
            <div className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-mono border border-slate-500">
              systemd (PID 1)
            </div>
            <div className="w-px h-3 bg-mcb-600" />
            <AnimatePresence mode="wait">
              {step < 2 ? (
                <motion.div
                  key="run"
                  className="px-3 py-1.5 rounded-lg bg-mcb-700 text-white text-xs font-mono border-2 border-mcb-400 flex items-center gap-1.5"
                >
                  <Cog size={12} /> containerd
                  <span className="text-green-400 text-[10px]">RUNNING</span>
                </motion.div>
              ) : step === 2 ? (
                <motion.div
                  key="rst"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="px-3 py-1.5 rounded-lg bg-red-800 text-white text-xs font-mono border-2 border-red-500 flex items-center gap-1.5"
                >
                  <RotateCcw size={12} className="animate-spin" /> containerd
                  <span className="text-yellow-300 text-[10px]">RESTART</span>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1.5 rounded-lg bg-mcb-700 text-white text-xs font-mono border-2 border-mcb-400 flex items-center gap-1.5"
                >
                  <Cog size={12} /> containerd
                  <span className="text-green-400 text-[10px]">RUNNING</span>
                </motion.div>
              )}
            </AnimatePresence>

            {step >= 1 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex gap-2">
                {containers.map((c) => (
                  <div key={c.name} className="flex flex-col items-center">
                    <div className="w-px h-2 bg-amber-500/50" />
                    <motion.div
                      animate={
                        step === 2
                          ? { borderColor: ['#f59e0b', '#22c55e', '#f59e0b'], boxShadow: ['0 0 0px #f59e0b', '0 0 12px #22c55e', '0 0 0px #f59e0b'] }
                          : {}
                      }
                      transition={{ duration: 1, repeat: step === 2 ? Infinity : 0 }}
                      className="px-2 py-1 rounded-lg bg-amber-900/70 text-[10px] font-mono text-amber-200 border border-amber-500/50"
                    >
                      shim
                    </motion.div>
                    <div className="w-px h-1.5 bg-mcb-700" />
                    <div className={`px-2 py-1 rounded text-[10px] text-white font-mono ${c.color}`}>
                      {c.emoji} {c.name}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          {step >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-3 left-3 right-3 text-[10px] text-center text-amber-200/90 bg-amber-900/30 border border-amber-500/20 rounded-lg px-2 py-1.5"
            >
              Shims are <strong>independent</strong> - they don’t die when the daemon restarts
            </motion.p>
          )}
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. Lifecycle animation (auto-play phases)
   ═══════════════════════════════════════════════════════════ */
const LIFE_PHASES = [
  {
    title: 'Pull',
    cmd: 'nerdctl pull nginx',
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-500/40',
    visual: 'pull' as const,
  },
  {
    title: 'Create',
    cmd: 'containers create …',
    color: 'text-green-400',
    bg: 'bg-green-900/30',
    border: 'border-green-500/40',
    visual: 'create' as const,
  },
  {
    title: 'Start task',
    cmd: 'tasks start …',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-500/40',
    visual: 'start' as const,
  },
  {
    title: 'Monitor',
    cmd: 'logs / metrics',
    color: 'text-sky-400',
    bg: 'bg-sky-900/30',
    border: 'border-sky-500/40',
    visual: 'monitor' as const,
  },
  {
    title: 'Stop + rm',
    cmd: 'kill → delete → rm',
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-500/40',
    visual: 'stop' as const,
  },
];

export function DemoLifecycle() {
  const [phase, setPhase] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setPhase((p) => (p + 1) % LIFE_PHASES.length), 2800);
    return () => clearInterval(t);
  }, [auto]);

  const p = LIFE_PHASES[phase];

  return (
    <DemoShell title="Interactive · Container Lifecycle" hint="Auto-plays · click a phase">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {LIFE_PHASES.map((ph, i) => (
            <button
              key={ph.title}
              type="button"
              onClick={() => {
                setAuto(false);
                setPhase(i);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                phase === i ? `${ph.bg} ${ph.color} ${ph.border}` : 'border-mcb-800 text-mcb-500 hover:text-mcb-300'
              }`}
            >
              {i + 1}. {ph.title}
            </button>
          ))}
        </div>

        <div className={`rounded-xl border ${p.border} ${p.bg} p-5 min-h-[200px] flex flex-col items-center justify-center`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              className="w-full"
            >
              {p.visual === 'pull' && (
                <div className="space-y-2">
                  <p className={`${p.color} text-sm font-bold flex items-center gap-2 justify-center mb-3`}>
                    <Package size={18} /> Registry → Content Store
                  </p>
                  {['Manifest', 'Layer sha256:abc…', 'Layer sha256:def…', 'Layer sha256:ghi…'].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ x: -80, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="relative overflow-hidden rounded-lg border border-blue-500/30 bg-blue-950/40 px-3 py-2 text-xs font-mono text-blue-200 flex items-center gap-2"
                    >
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.1 + i * 0.15, duration: 0.7 }}
                        className="absolute inset-y-0 left-0 bg-blue-500/15"
                      />
                      <Database size={12} className="relative" /> <span className="relative">{item}</span>
                    </motion.div>
                  ))}
                </div>
              )}
              {p.visual === 'create' && (
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-36 h-24 rounded-xl bg-mcb-800 border-2 border-mcb-500 flex flex-col items-center justify-center"
                  >
                    <Package size={28} className="text-mcb-300" />
                    <span className="text-xs text-mcb-200 mt-1">Read-only image</span>
                  </motion.div>
                  <motion.div
                    initial={{ y: -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="w-36 h-9 rounded-lg bg-green-600 border border-green-400 text-white text-xs font-bold flex items-center justify-center"
                  >
                    Writable snapshot
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs text-mcb-300 font-mono"
                  >
                    container metadata created · no PID yet
                  </motion.p>
                </div>
              )}
              {p.visual === 'start' && (
                <div className="space-y-2 max-w-sm mx-auto">
                  {['shim spawned', 'OCI config.json', 'runc → namespaces', 'nginx PID 1 running'].map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className={`px-3 py-2 rounded-lg text-xs font-mono text-center ${
                        i === 3
                          ? 'bg-green-900/50 text-green-300 border-2 border-green-500/50 font-bold'
                          : 'bg-yellow-900/30 text-yellow-200 border border-yellow-500/20'
                      }`}
                    >
                      {i === 3 && <Zap size={12} className="inline mr-1" />}
                      {s}
                    </motion.div>
                  ))}
                </div>
              )}
              {p.visual === 'monitor' && (
                <div className="space-y-2 max-w-xs mx-auto">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="rounded-lg border border-green-500/40 bg-green-900/40 text-green-300 text-center py-2 text-xs font-mono"
                  >
                    STATUS: RUNNING
                  </motion.div>
                  {['CPU 0.5%', 'Mem 12MB', 'Net 1.2KB/s', 'logs streaming…'].map((m, i) => (
                    <motion.div
                      key={m}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.12 }}
                      className="rounded border border-sky-500/20 bg-sky-950/30 px-3 py-1.5 text-xs font-mono text-sky-200"
                    >
                      {m}
                    </motion.div>
                  ))}
                </div>
              )}
              {p.visual === 'stop' && (
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 0.9, 0], opacity: [1, 0.6, 0] }}
                    transition={{ duration: 1.6 }}
                    className="w-28 h-28 rounded-xl bg-red-900 border-2 border-red-500 flex flex-col items-center justify-center"
                  >
                    <Box size={32} className="text-red-300" />
                    <span className="text-xs text-red-200 mt-1">container</span>
                  </motion.div>
                  <p className="text-xs font-mono text-red-300">SIGTERM → SIGKILL → cleanup</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className={`text-center text-xs font-mono ${p.color}`}>$ {p.cmd}</p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            className="text-[11px] text-mcb-400 hover:text-mcb-200 underline"
          >
            {auto ? 'Pause auto-play' : 'Resume auto-play'}
          </button>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. OverlayFS COW animation
   ═══════════════════════════════════════════════════════════ */
export function DemoOverlayFS() {
  const [mode, setMode] = useState<'idle' | 'read' | 'write'>('idle');

  return (
    <DemoShell title="Interactive · OverlayFS Copy-on-Write" hint="Try Read vs Write">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <DemoBtn color="blue" onClick={() => setMode('read')}>
            Read /etc/nginx.conf
          </DemoBtn>
          <DemoBtn color="green" onClick={() => setMode('write')}>
            Write /app/data.txt
          </DemoBtn>
          <DemoBtn color="mcb" onClick={() => setMode('idle')}>
            <RotateCcw size={14} /> Reset
          </DemoBtn>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'lower', label: 'lowerdir', sub: 'image layers RO', color: 'border-blue-500/40 bg-blue-950/30' },
            { id: 'upper', label: 'upperdir', sub: 'container RW', color: 'border-green-500/40 bg-green-950/30' },
            { id: 'work', label: 'workdir', sub: 'kernel temp', color: 'border-yellow-500/40 bg-yellow-950/30' },
            { id: 'merged', label: 'merged', sub: 'what PID sees', color: 'border-mcb-500/40 bg-mcb-950/40' },
          ].map((box, i) => (
            <motion.div
              key={box.id}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl border p-3 text-center ${box.color} min-h-[100px] relative overflow-hidden`}
            >
              <p className="text-xs font-bold text-white font-mono">{box.label}</p>
              <p className="text-[10px] text-mcb-400 mt-0.5">{box.sub}</p>

              {/* files */}
              {box.id === 'lower' && (
                <motion.div className="mt-2 text-[10px] font-mono text-blue-200 space-y-0.5">
                  <div>nginx.conf</div>
                  <div className="opacity-60">base libs…</div>
                </motion.div>
              )}
              {box.id === 'upper' && mode === 'write' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-[10px] font-mono text-green-300"
                >
                  ✨ data.txt
                  <br />
                  <span className="text-green-400/70">(new write)</span>
                </motion.div>
              )}
              {box.id === 'upper' && mode === 'read' && (
                <p className="mt-3 text-[10px] text-mcb-500">empty (no COW yet)</p>
              )}
              {box.id === 'merged' && (
                <motion.div className="mt-2 text-[10px] font-mono text-mcb-200 space-y-0.5">
                  <motion.div
                    animate={mode === 'read' ? { scale: [1, 1.15, 1], color: '#93c5fd' } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    nginx.conf
                  </motion.div>
                  {mode === 'write' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-300">
                      data.txt
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* animated arrows */}
              {mode === 'read' && box.id === 'lower' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: 2 }}
                  className="absolute inset-0 border-2 border-blue-400 rounded-xl pointer-events-none"
                />
              )}
              {mode === 'write' && box.id === 'upper' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: 2 }}
                  className="absolute inset-0 border-2 border-green-400 rounded-xl pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-center text-mcb-200"
          >
            {mode === 'idle' && 'Click Read or Write to see how OverlayFS resolves files.'}
            {mode === 'read' && (
              <>
                Read looks in <strong className="text-green-300">upper</strong> first → miss → falls through to{' '}
                <strong className="text-blue-300">lower</strong>. Image layers stay untouched.
              </>
            )}
            {mode === 'write' && (
              <>
                Write creates/modifies only in <strong className="text-green-300">upperdir</strong>. Other containers
                sharing lower layers still see the original file.
              </>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   7. Container vs Task workflow
   ═══════════════════════════════════════════════════════════ */
export function DemoContainerVsTask() {
  const [step, setStep] = useState(0);
  // 0 empty, 1 pulled, 2 container created, 3 task running, 4 cleaned

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const reset = () => setStep(0);

  const steps = [
    { label: 'Empty', btn: 'Pull image', color: 'blue' as const },
    { label: 'Image ready', btn: 'Create container', color: 'green' as const },
    { label: 'Container (meta only)', btn: 'Start task', color: 'amber' as const },
    { label: 'Task RUNNING', btn: 'Cleanup (kill→del→rm)', color: 'red' as const },
    { label: 'Clean', btn: 'Replay', color: 'mcb' as const },
  ];

  return (
    <DemoShell title="Interactive · Container vs Task" hint="The #1 concept Docker hides">
      <div className="space-y-5">
        {/* Pipeline */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          {[
            { id: 1, name: 'Image', icon: Package },
            { id: 2, name: 'Container', icon: Box },
            { id: 3, name: 'Task', icon: Zap },
          ].map((node, i) => {
            const Icon = node.icon;
            const on = step >= node.id && step < 4;
            const done = step === 4;
            return (
              <div key={node.name} className="flex items-center gap-1 sm:gap-2">
                {i > 0 && (
                  <motion.div
                    animate={{ opacity: step >= node.id ? 1 : 0.25 }}
                    className="w-6 sm:w-10 h-0.5 bg-mcb-500 rounded"
                  />
                )}
                <motion.div
                  animate={{
                    scale: step === node.id ? 1.08 : 1,
                    borderColor: on || done ? '#60a5fa' : '#1e3a5f',
                  }}
                  className={`w-20 sm:w-24 rounded-xl border-2 p-3 text-center ${
                    on || done ? 'bg-mcb-900/60' : 'bg-mcb-950/40'
                  }`}
                >
                  <Icon size={22} className={`mx-auto ${on || done ? 'text-mcb-300' : 'text-mcb-600'}`} />
                  <p className={`text-[10px] font-bold mt-1 ${on || done ? 'text-white' : 'text-mcb-600'}`}>
                    {node.name}
                  </p>
                  {node.id === 2 && step === 2 && (
                    <p className="text-[9px] text-amber-300 mt-0.5">no PID</p>
                  )}
                  {node.id === 3 && step === 3 && (
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-[9px] text-green-400 mt-0.5"
                    >
                      PID live
                    </motion.p>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Terminal echo */}
        <div className="rounded-xl bg-black/60 border border-mcb-800 p-3 font-mono text-[11px] min-h-[100px] text-left">
          {step >= 1 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400">
              $ ctr images pull docker.io/library/nginx:latest
            </motion.p>
          )}
          {step >= 2 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 mt-1">
              $ ctr containers create … my-nginx
              <span className="text-mcb-500">  # metadata only</span>
            </motion.p>
          )}
          {step >= 3 && step < 4 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 mt-1">
              $ ctr tasks start -d my-nginx
              <span className="text-yellow-300">  # process + shim</span>
            </motion.p>
          )}
          {step >= 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 space-y-0.5">
              <p className="text-red-400">$ ctr tasks kill my-nginx</p>
              <p className="text-red-400">$ ctr tasks delete my-nginx</p>
              <p className="text-red-400">$ ctr containers rm my-nginx</p>
              <p className="text-mcb-400"># order always: kill → delete task → rm container</p>
            </motion.div>
          )}
          {step === 0 && <p className="text-mcb-600">Press the button to walk the workflow…</p>}
        </div>

        <div className="flex justify-center">
          <DemoBtn
            color={steps[step].color}
            onClick={step === 4 ? reset : next}
          >
            {step < 4 ? (
              <>
                <Play size={14} /> {steps[step].btn}
              </>
            ) : (
              <>
                <RotateCcw size={14} /> Replay
              </>
            )}
          </DemoBtn>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   8. Image pull layers animation
   ═══════════════════════════════════════════════════════════ */
export function DemoImagePull() {
  const [running, setRunning] = useState(false);
  const [layer, setLayer] = useState(0);
  const layers = ['config/manifest', 'base OS layer', 'deps layer', 'app layer', 'snapshot ready'];

  useEffect(() => {
    if (!running) return;
    if (layer >= layers.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setLayer((l) => l + 1), 700);
    return () => clearTimeout(t);
  }, [running, layer, layers.length]);

  const start = () => {
    setLayer(0);
    setRunning(true);
  };

  return (
    <DemoShell title="Interactive · Image Pull Pipeline" hint="Watch layers land in CAS">
      <div className="space-y-4">
        <div className="flex justify-center">
          <DemoBtn color="blue" onClick={start} disabled={running}>
            <Play size={14} /> {running ? 'Pulling…' : 'ctr images pull nginx:latest'}
          </DemoBtn>
        </div>
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={running ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-500/40 text-blue-200 text-xs font-mono"
          >
            docker.io registry
          </motion.div>
          <motion.div animate={{ opacity: running ? 1 : 0.3 }} className="text-mcb-500">
            <ArrowDown size={16} />
          </motion.div>
          <div className="w-full max-w-sm space-y-1.5">
            {layers.map((name, i) => {
              const done = layer > i;
              const active = layer === i && running;
              return (
                <motion.div
                  key={name}
                  animate={{
                    opacity: done || active ? 1 : 0.35,
                    x: active ? [0, 4, 0] : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-xs font-mono ${
                    done
                      ? 'border-green-500/40 bg-green-950/30 text-green-300'
                      : active
                        ? 'border-blue-500/50 bg-blue-950/40 text-blue-200'
                        : 'border-mcb-800 bg-mcb-950/40 text-mcb-500'
                  }`}
                >
                  {done ? <Check size={12} /> : active ? <Package size={12} className="animate-pulse" /> : <span className="w-3" />}
                  {name}
                  {active && (
                    <motion.div className="ml-auto h-1 w-16 rounded bg-mcb-900 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.65 }}
                        className="h-full bg-blue-400"
                      />
                    </motion.div>
                  )}
                  {done && <span className="ml-auto text-[9px] text-green-500">sha256</span>}
                </motion.div>
              );
            })}
          </div>
          <motion.div animate={{ opacity: layer >= layers.length ? 1 : 0.3 }} className="text-mcb-500">
            <ArrowDown size={16} />
          </motion.div>
          <div className="px-4 py-2 rounded-lg bg-mcb-900/50 border border-mcb-600/40 text-mcb-200 text-xs font-mono">
            /var/lib/containerd/…/blobs/sha256/
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   9. Debug path animation
   ═══════════════════════════════════════════════════════════ */
export function DemoDebugFlow() {
  const steps = [
    { cmd: 'ctr tasks list', result: 'PID 5679 found' },
    { cmd: 'ls /proc/5679/ns', result: 'pid · net · mnt · uts' },
    { cmd: 'nsenter -t 5679 …', result: 'inside container view' },
    { cmd: 'ctr tasks exec …', result: 'shell in same cgroup' },
    { cmd: 'ctr events', result: 'streaming events…' },
    { cmd: 'journalctl -u containerd -f', result: 'daemon logs' },
  ];
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setI((x) => (x + 1) % steps.length), 2200);
    return () => clearInterval(t);
  }, [auto, steps.length]);

  return (
    <DemoShell title="Interactive · Debug Path" hint="7-step toolkit condensed">
      <div className="space-y-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAuto(false);
                setI(idx);
              }}
              className={`shrink-0 w-8 h-8 rounded-full text-xs font-bold border ${
                idx === i
                  ? 'bg-mcb-600 border-mcb-400 text-white'
                  : idx < i
                    ? 'bg-green-900/40 border-green-500/40 text-green-300'
                    : 'border-mcb-800 text-mcb-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-xl bg-black/60 border border-mcb-800 p-4 font-mono text-sm"
          >
            <p className="text-green-400">$ {steps[i].cmd}</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-mcb-200 mt-2"
            >
              → {steps[i].result}
            </motion.p>
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => setAuto((a) => !a)} className="text-[11px] text-mcb-500 underline">
          {auto ? 'Pause' : 'Auto-play'}
        </button>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   Registry
   ═══════════════════════════════════════════════════════════ */
export type DemoId =
  | 'engine-intro'
  | 'runtime-stack'
  | 'architecture'
  | 'shim'
  | 'lifecycle'
  | 'overlayfs'
  | 'container-vs-task'
  | 'image-pull'
  | 'debug-flow';

export function InteractiveDemo({ id }: { id: DemoId }) {
  switch (id) {
    case 'engine-intro':
      return <DemoEngineIntro />;
    case 'runtime-stack':
      return <DemoRuntimeStack />;
    case 'architecture':
      return <DemoArchitecture />;
    case 'shim':
      return <DemoShim />;
    case 'lifecycle':
      return <DemoLifecycle />;
    case 'overlayfs':
      return <DemoOverlayFS />;
    case 'container-vs-task':
      return <DemoContainerVsTask />;
    case 'image-pull':
      return <DemoImagePull />;
    case 'debug-flow':
      return <DemoDebugFlow />;
    default:
      return null;
  }
}
