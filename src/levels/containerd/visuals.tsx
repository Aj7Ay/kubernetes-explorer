import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DemoShell, DemoBtn } from './demos';

/* ═══════════════════════════════════════════════════════════
   1. VisualCarAnalogy  →  lesson intro-engine
   SVG car with 3 clickable hotspots: Engine, Dashboard, Wheels
   ═══════════════════════════════════════════════════════════ */

const carHotspots = [
  {
    id: 'engine',
    label: 'Engine',
    mapTo: 'containerd',
    desc: 'containerd is the engine under the hood — it does all the heavy lifting: pulling images, managing snapshots, running tasks, and supervising container lifecycles.',
    color: '#3b82f6',
    x: 60,
    y: 55,
    w: 80,
    h: 50,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    mapTo: 'Docker / nerdctl / kubectl',
    desc: 'High-level tools are your steering wheel and dashboard. They provide the user-friendly interface, but delegate real work to containerd underneath.',
    color: '#8b5cf6',
    x: 170,
    y: 35,
    w: 85,
    h: 45,
  },
  {
    id: 'wheels',
    label: 'Wheels',
    mapTo: 'runc / OCI runtime',
    desc: 'The low-level OCI runtime (runc) is what actually drives motion — it creates Linux namespaces, cgroups, mounts the rootfs, and executes the container process.',
    color: '#f59e0b',
    x: 80,
    y: 110,
    w: 170,
    h: 30,
  },
] as const;

export function VisualCarAnalogy() {
  const [active, setActive] = useState<string | null>(null);
  const spot = carHotspots.find((h) => h.id === active);

  return (
    <DemoShell title="Visual · Car Analogy" hint="Click a part of the car">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.45fr] gap-4">
        {/* SVG car */}
        <div className="relative bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-3 flex items-center justify-center min-h-[200px]">
          <svg viewBox="0 0 340 160" className="w-full max-w-[420px]">
            {/* Car body */}
            <path
              d="M50,90 L50,70 Q50,55 65,55 L140,55 L170,30 Q175,25 185,25 L250,25 Q265,25 270,35 L285,55 L300,55 Q315,55 315,70 L315,90"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Windshield */}
            <line x1="170" y1="55" x2="185" y2="28" stroke="#475569" strokeWidth="1.5" />
            <line x1="250" y1="55" x2="265" y2="32" stroke="#475569" strokeWidth="1.5" />
            {/* Roof line */}
            <line x1="185" y1="25" x2="250" y2="25" stroke="#64748b" strokeWidth="2" />
            {/* Undercarriage */}
            <line x1="50" y1="90" x2="100" y2="90" stroke="#64748b" strokeWidth="2" />
            <line x1="140" y1="90" x2="220" y2="90" stroke="#64748b" strokeWidth="2" />
            <line x1="260" y1="90" x2="315" y2="90" stroke="#64748b" strokeWidth="2" />

            {/* Wheels */}
            <circle cx="120" cy="95" r="18" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <circle cx="120" cy="95" r="8" fill="none" stroke="#334155" strokeWidth="1.5" />
            <circle cx="240" cy="95" r="18" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <circle cx="240" cy="95" r="8" fill="none" stroke="#334155" strokeWidth="1.5" />

            {/* Animated power flow line: engine → wheels */}
            <motion.line
              x1="100" y1="75" x2="100" y2="90"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 3"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -14 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.line
              x1="100" y1="90" x2="240" y2="90"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -20 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />

            {/* Animated engine gear */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '85px 68px' }}
            >
              <circle cx="85" cy="68" r="10" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <line
                  key={deg}
                  x1="85"
                  y1="68"
                  x2={85 + 13 * Math.cos((deg * Math.PI) / 180)}
                  y2={68 + 13 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
            </motion.g>

            {/* Clickable hotspots */}
            {carHotspots.map((h) => (
              <g key={h.id} onClick={() => setActive(active === h.id ? null : h.id)} className="cursor-pointer">
                <motion.rect
                  x={h.x}
                  y={h.y}
                  width={h.w}
                  height={h.h}
                  rx="6"
                  fill={h.color}
                  fillOpacity={active === h.id ? 0.3 : 0.08}
                  stroke={h.color}
                  strokeWidth={active === h.id ? 2 : 1}
                  strokeOpacity={active === h.id ? 0.9 : 0.4}
                  strokeDasharray={active === h.id ? undefined : '4 2'}
                  whileHover={{ fillOpacity: 0.25, strokeOpacity: 0.8 }}
                />
                <text
                  x={h.x + h.w / 2}
                  y={h.y + h.h / 2 + 4}
                  textAnchor="middle"
                  fill={h.color}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="pointer-events-none select-none"
                >
                  {h.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Explanation panel */}
        <div className="flex flex-col justify-center min-h-[140px]">
          <AnimatePresence mode="wait">
            {spot ? (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="rounded-xl border border-mcb-600/40 bg-mcb-950/80 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: spot.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: spot.color }}>
                    {spot.label}
                  </span>
                  <span className="text-[10px] text-mcb-400">= {spot.mapTo}</span>
                </div>
                <p className="text-xs text-mcb-300 leading-relaxed">{spot.desc}</p>
              </motion.div>
            ) : (
              <motion.p
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-mcb-500 text-center italic"
              >
                Click a highlighted zone on the car to learn what it maps to in the container world.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. VisualRuntimeFlow  →  lesson landscape-layers
   6-layer stack with animated request dot flowing top→bottom
   ═══════════════════════════════════════════════════════════ */

const runtimeLayers = [
  { id: 'user', label: 'User / Client', sub: 'docker · nerdctl · kubectl', color: '#a78bfa' },
  { id: 'high', label: 'High-Level Runtime', sub: 'Docker Engine · kubelet', color: '#818cf8' },
  { id: 'containerd', label: 'containerd', sub: 'gRPC API · CRI · images · tasks', color: '#3b82f6', highlight: true },
  { id: 'shim', label: 'containerd-shim', sub: 'per-container process supervisor', color: '#06b6d4' },
  { id: 'runc', label: 'runc (OCI)', sub: 'namespaces · cgroups · exec', color: '#22c55e' },
  { id: 'kernel', label: 'Linux Kernel', sub: 'namespaces · cgroups · seccomp · overlayfs', color: '#64748b' },
] as const;

export function VisualRuntimeFlow() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [dotY, setDotY] = useState(0);

  // Auto-animate dot flowing down
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 3000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) % duration;
      setDotY(elapsed / duration);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const layerH = 44;
  const gap = 6;
  const totalH = runtimeLayers.length * (layerH + gap) - gap;
  const layer = runtimeLayers.find((l) => l.id === activeLayer);

  return (
    <DemoShell title="Visual · Runtime Flow" hint="Watch the request travel down the stack">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.42fr] gap-4">
        <div className="relative bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-4 flex items-center justify-center">
          <svg viewBox={`0 0 300 ${totalH + 20}`} className="w-full max-w-[380px]">
            {runtimeLayers.map((l, i) => {
              const y = 10 + i * (layerH + gap);
              const isLit = dotY * totalH + 10 >= y && dotY * totalH + 10 <= y + layerH;
              const isActive = activeLayer === l.id;
              return (
                <g
                  key={l.id}
                  onClick={() => setActiveLayer(isActive ? null : l.id)}
                  className="cursor-pointer"
                >
                  <motion.rect
                    x="30"
                    y={y}
                    width="240"
                    height={layerH}
                    rx="8"
                    fill={l.color}
                    fillOpacity={isLit || isActive ? 0.25 : 0.08}
                    stroke={l.color}
                    strokeWidth={l.highlight ? 2.5 : isActive ? 2 : 1}
                    strokeOpacity={isLit || isActive ? 0.9 : 0.3}
                    animate={{
                      fillOpacity: isLit || isActive ? 0.25 : 0.08,
                      strokeOpacity: isLit || isActive ? 0.9 : 0.3,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  {/* Glow ring for containerd */}
                  {l.highlight && (
                    <motion.rect
                      x="26"
                      y={y - 4}
                      width="248"
                      height={layerH + 8}
                      rx="10"
                      fill="none"
                      stroke={l.color}
                      strokeWidth="1"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <text
                    x="150"
                    y={y + 18}
                    textAnchor="middle"
                    fill={l.color}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {l.label}
                  </text>
                  <text
                    x="150"
                    y={y + 33}
                    textAnchor="middle"
                    fill={l.color}
                    fontSize="7.5"
                    opacity="0.6"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {l.sub}
                  </text>

                  {/* Connector line to next layer */}
                  {i < runtimeLayers.length - 1 && (
                    <motion.line
                      x1="150"
                      y1={y + layerH}
                      x2="150"
                      y2={y + layerH + gap}
                      stroke={l.color}
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                      strokeOpacity="0.3"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -10 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </g>
              );
            })}

            {/* Flowing dot */}
            <motion.circle
              cx="150"
              cy={10 + dotY * totalH}
              r="5"
              fill="#f59e0b"
              className="pointer-events-none"
            >
              <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
            </motion.circle>
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col justify-center min-h-[120px]">
          <AnimatePresence mode="wait">
            {layer ? (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="rounded-xl border border-mcb-600/40 bg-mcb-950/80 p-4"
              >
                <span className="inline-block w-2 h-2 rounded-full mb-2" style={{ background: layer.color }} />
                <p className="text-sm font-bold text-mcb-200 mb-1">{layer.label}</p>
                <p className="text-xs text-mcb-400">{layer.sub}</p>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-mcb-500 text-center italic"
              >
                Click any layer to learn more. Watch the request dot travel from user to kernel.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. VisualContainerLifecycle  →  lesson life-create
   Horizontal state machine: Pull → Create → Start → Running → Stop → Remove
   Auto-progressing with clickable override
   ═══════════════════════════════════════════════════════════ */

const lifecycleStates = [
  { id: 'pull', label: 'Pull', color: '#a78bfa', detail: 'Resolve image reference, download manifest + layers from registry, store in content-addressable storage, unpack snapshot.' },
  { id: 'create', label: 'Create', color: '#818cf8', detail: 'Create container metadata (ID, image ref, snapshot key, OCI spec). No process yet — just a record in the metadata DB.' },
  { id: 'start', label: 'Start', color: '#3b82f6', detail: 'Spawn containerd-shim, generate OCI config.json, shim invokes runc which sets up namespaces, cgroups, mounts rootfs, and executes init.' },
  { id: 'running', label: 'Running', color: '#22c55e', detail: 'Container process is alive. Shim monitors stdio/exit. Metrics collected via cgroups. gRPC API available for exec/logs/stats.' },
  { id: 'stop', label: 'Stop', color: '#f59e0b', detail: 'SIGTERM → grace period → SIGKILL. Shim cleans up process. Network namespace removed. Task state becomes "stopped".' },
  { id: 'remove', label: 'Remove', color: '#ef4444', detail: 'Delete writable snapshot (upper layer). Remove container metadata. Shim exits. Image layers remain shared.' },
] as const;

export function VisualContainerLifecycle() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % lifecycleStates.length);
    }, 2500);
    return () => clearInterval(id);
  }, [manual]);

  const handleClick = useCallback((idx: number) => {
    setManual(true);
    setActiveIdx(idx);
  }, []);

  const nodeW = 70;
  const nodeH = 36;
  const gapX = 18;
  const totalW = lifecycleStates.length * (nodeW + gapX) - gapX + 40;

  return (
    <DemoShell title="Visual · Container Lifecycle" hint={manual ? 'Click states · manual mode' : 'Auto-playing · click to override'}>
      <div className="space-y-4">
        {/* State machine SVG */}
        <div className="overflow-x-auto bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-4">
          <svg viewBox={`0 0 ${totalW} 70`} className="w-full min-w-[480px]">
            {lifecycleStates.map((s, i) => {
              const x = 20 + i * (nodeW + gapX);
              const y = 17;
              const isActive = i === activeIdx;
              const isPast = i < activeIdx;
              return (
                <g key={s.id}>
                  {/* Connector to next */}
                  {i < lifecycleStates.length - 1 && (
                    <motion.line
                      x1={x + nodeW}
                      y1={y + nodeH / 2}
                      x2={x + nodeW + gapX}
                      y2={y + nodeH / 2}
                      stroke={isPast || isActive ? s.color : '#334155'}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{
                        strokeDashoffset: isPast || isActive ? -20 : 0,
                        strokeOpacity: isPast || isActive ? 0.7 : 0.2,
                      }}
                      transition={{
                        strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' },
                        strokeOpacity: { duration: 0.3 },
                      }}
                    />
                  )}

                  {/* State node */}
                  <motion.rect
                    x={x}
                    y={y}
                    width={nodeW}
                    height={nodeH}
                    rx="8"
                    fill={s.color}
                    fillOpacity={isActive ? 0.3 : isPast ? 0.12 : 0.05}
                    stroke={s.color}
                    strokeWidth={isActive ? 2.5 : 1}
                    strokeOpacity={isActive ? 1 : isPast ? 0.5 : 0.2}
                    animate={
                      isActive
                        ? { scale: [1, 1.05, 1], fillOpacity: [0.2, 0.35, 0.2] }
                        : { scale: 1 }
                    }
                    transition={
                      isActive
                        ? { duration: 1.5, repeat: Infinity }
                        : { duration: 0.3 }
                    }
                    style={{ transformOrigin: `${x + nodeW / 2}px ${y + nodeH / 2}px` }}
                    onClick={() => handleClick(i)}
                    className="cursor-pointer"
                  />
                  <text
                    x={x + nodeW / 2}
                    y={y + nodeH / 2 + 4}
                    textAnchor="middle"
                    fill={isActive ? '#fff' : s.color}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                    opacity={isActive ? 1 : isPast ? 0.7 : 0.4}
                  >
                    {s.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 150, damping: 18 }}
            className="rounded-xl border border-mcb-600/30 bg-mcb-950/70 p-3 flex items-start gap-3"
          >
            <span
              className="mt-0.5 inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: lifecycleStates[activeIdx].color }}
            />
            <div>
              <p className="text-sm font-bold text-mcb-200 mb-0.5">{lifecycleStates[activeIdx].label}</p>
              <p className="text-xs text-mcb-400 leading-relaxed">{lifecycleStates[activeIdx].detail}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {manual && (
          <div className="flex justify-center">
            <DemoBtn onClick={() => { setManual(false); setActiveIdx(0); }} color="mcb">
              Resume auto-play
            </DemoBtn>
          </div>
        )}
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. VisualOverlayFS  →  lesson overlayfs
   Layer stack with Read / Write / Delete interactive buttons
   ═══════════════════════════════════════════════════════════ */

type OverlayAction = 'idle' | 'read' | 'write' | 'delete';

const lowerFiles = ['bin/', 'etc/nginx.conf', 'lib/'];
const upperInitial = ['var/log/access.log'];

export function VisualOverlayFS() {
  const [action, setAction] = useState<OverlayAction>('idle');
  const [upperFiles, setUpperFiles] = useState<string[]>(upperInitial);
  const [whiteouts, setWhiteouts] = useState<string[]>([]);
  const [arrowTarget, setArrowTarget] = useState<'upper' | 'lower' | null>(null);
  const [resultMsg, setResultMsg] = useState('');

  const reset = () => {
    setAction('idle');
    setUpperFiles(upperInitial);
    setWhiteouts([]);
    setArrowTarget(null);
    setResultMsg('');
  };

  const doRead = () => {
    setAction('read');
    setArrowTarget('upper');
    setResultMsg('');
    setTimeout(() => {
      setArrowTarget('lower');
      setTimeout(() => {
        setResultMsg('Found etc/nginx.conf in lowerdir (read-only)');
        setArrowTarget(null);
      }, 800);
    }, 800);
  };

  const doWrite = () => {
    setAction('write');
    setArrowTarget('upper');
    setResultMsg('');
    setTimeout(() => {
      setUpperFiles((prev) =>
        prev.includes('tmp/newfile.txt') ? prev : [...prev, 'tmp/newfile.txt']
      );
      setResultMsg('Written tmp/newfile.txt → upperdir (COW)');
      setArrowTarget(null);
    }, 900);
  };

  const doDelete = () => {
    setAction('delete');
    setArrowTarget('upper');
    setResultMsg('');
    setTimeout(() => {
      setWhiteouts((prev) =>
        prev.includes('etc/nginx.conf') ? prev : [...prev, 'etc/nginx.conf']
      );
      setResultMsg('Whiteout marker hides etc/nginx.conf from merged view');
      setArrowTarget(null);
    }, 900);
  };

  const layerY = { merged: 15, upper: 75, lower1: 135, lower2: 175 };

  return (
    <DemoShell title="Visual · OverlayFS" hint="Click an operation to see how layers interact">
      <div className="space-y-4">
        {/* Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <DemoBtn onClick={doRead} color="blue">Read file</DemoBtn>
          <DemoBtn onClick={doWrite} color="green">Write file</DemoBtn>
          <DemoBtn onClick={doDelete} color="red">Delete file</DemoBtn>
          <DemoBtn onClick={reset} color="mcb">Reset</DemoBtn>
        </div>

        {/* SVG layer diagram */}
        <div className="bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-4 flex items-center justify-center">
          <svg viewBox="0 0 360 220" className="w-full max-w-[440px]">
            {/* Merged view */}
            <rect x="30" y={layerY.merged} width="300" height="42" rx="6" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="40" y={layerY.merged + 16} fill="#3b82f6" fontSize="10" fontWeight="bold" fontFamily="monospace">merged (what container sees)</text>
            <text x="40" y={layerY.merged + 32} fill="#3b82f6" fontSize="8" opacity="0.5" fontFamily="monospace">
              {[...lowerFiles, ...upperFiles].filter((f) => !whiteouts.includes(f)).join(' · ')}
            </text>

            {/* Connector: merged → upper */}
            <motion.line
              x1="180" y1={layerY.merged + 42} x2="180" y2={layerY.upper}
              stroke={arrowTarget === 'upper' ? '#f59e0b' : '#334155'}
              strokeWidth="2"
              strokeDasharray="4 3"
              animate={{
                strokeDashoffset: arrowTarget === 'upper' ? -14 : 0,
                strokeOpacity: arrowTarget === 'upper' ? 0.8 : 0.2,
              }}
              transition={{
                strokeDashoffset: { duration: 0.6, repeat: Infinity, ease: 'linear' },
                strokeOpacity: { duration: 0.3 },
              }}
            />

            {/* Upper layer */}
            <rect x="30" y={layerY.upper} width="300" height="42" rx="6" fill="#22c55e" fillOpacity="0.1" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="40" y={layerY.upper + 16} fill="#22c55e" fontSize="10" fontWeight="bold" fontFamily="monospace">upperdir (RW · this container)</text>
            {upperFiles.map((f, i) => (
              <motion.text
                key={f}
                x={40 + i * 100}
                y={layerY.upper + 34}
                fill="#4ade80"
                fontSize="8"
                fontFamily="monospace"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                {f}
              </motion.text>
            ))}
            {/* Whiteout markers */}
            {whiteouts.map((f, i) => (
              <motion.text
                key={`wo-${f}`}
                x={40 + (upperFiles.length + i) * 100}
                y={layerY.upper + 34}
                fill="#ef4444"
                fontSize="8"
                fontFamily="monospace"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                .wh.{f.split('/').pop()}
              </motion.text>
            ))}

            {/* Connector: upper → lower */}
            <motion.line
              x1="180" y1={layerY.upper + 42} x2="180" y2={layerY.lower1}
              stroke={arrowTarget === 'lower' ? '#f59e0b' : '#334155'}
              strokeWidth="2"
              strokeDasharray="4 3"
              animate={{
                strokeDashoffset: arrowTarget === 'lower' ? -14 : 0,
                strokeOpacity: arrowTarget === 'lower' ? 0.8 : 0.2,
              }}
              transition={{
                strokeDashoffset: { duration: 0.6, repeat: Infinity, ease: 'linear' },
                strokeOpacity: { duration: 0.3 },
              }}
            />

            {/* Lower layer 1 */}
            <rect x="30" y={layerY.lower1} width="300" height="30" rx="6" fill="#6366f1" fillOpacity="0.08" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.3" />
            <text x="40" y={layerY.lower1 + 12} fill="#6366f1" fontSize="9" fontWeight="bold" fontFamily="monospace">lowerdir (RO · image layer 2)</text>
            <text x="40" y={layerY.lower1 + 24} fill="#818cf8" fontSize="8" opacity="0.5" fontFamily="monospace">
              {lowerFiles.slice(0, 2).map((f) => (whiteouts.includes(f) ? `̶${f}̶` : f)).join(' · ')}
            </text>
            {whiteouts.filter((f) => lowerFiles.slice(0, 2).includes(f)).length > 0 && (
              <line x1="40" y1={layerY.lower1 + 21} x2="140" y2={layerY.lower1 + 21} stroke="#ef4444" strokeWidth="1" opacity="0.6" />
            )}

            {/* Lower layer 2 */}
            <rect x="30" y={layerY.lower2} width="300" height="30" rx="6" fill="#6366f1" fillOpacity="0.05" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.2" />
            <text x="40" y={layerY.lower2 + 12} fill="#6366f1" fontSize="9" fontWeight="bold" fontFamily="monospace">lowerdir (RO · image layer 1)</text>
            <text x="40" y={layerY.lower2 + 24} fill="#818cf8" fontSize="8" opacity="0.4" fontFamily="monospace">
              {lowerFiles[2]}
            </text>

            {/* Search indicators */}
            {action === 'read' && arrowTarget === 'upper' && (
              <motion.text
                x="260" y={layerY.upper + 16}
                fill="#ef4444" fontSize="12" fontWeight="bold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                ✗ miss
              </motion.text>
            )}
            {action === 'read' && arrowTarget === 'lower' && (
              <motion.text
                x="260" y={layerY.lower1 + 16}
                fill="#22c55e" fontSize="12" fontWeight="bold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                ✓ hit
              </motion.text>
            )}
          </svg>
        </div>

        {/* Result message */}
        <AnimatePresence>
          {resultMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-mcb-300 bg-mcb-950/60 rounded-lg border border-mcb-700/30 py-2 px-3"
            >
              {resultMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. VisualShimSurvival  →  lesson arch-shim
   Process tree: systemd → containerd → 3 shims → 3 containers
   "Restart Daemon" triggers multi-step survival animation
   ═══════════════════════════════════════════════════════════ */

type ShimPhase = 'idle' | 'crash' | 'broken' | 'recovering' | 'survived';

const containers = [
  { id: 'nginx', label: 'nginx', color: '#22c55e' },
  { id: 'postgres', label: 'postgres', color: '#3b82f6' },
  { id: 'python', label: 'python-app', color: '#a78bfa' },
] as const;

export function VisualShimSurvival() {
  const [phase, setPhase] = useState<ShimPhase>('idle');

  const runRestart = useCallback(() => {
    if (phase !== 'idle' && phase !== 'survived') return;
    setPhase('crash');
    setTimeout(() => setPhase('broken'), 800);
    setTimeout(() => setPhase('recovering'), 2200);
    setTimeout(() => setPhase('survived'), 3200);
  }, [phase]);

  const reset = useCallback(() => setPhase('idle'), []);

  const daemonAlive = phase === 'idle' || phase === 'recovering' || phase === 'survived';
  const linesConnected = phase === 'idle' || phase === 'survived';

  // Layout
  const daemonX = 160;
  const daemonY = 52;
  const shimY = 120;
  const containerY = 180;
  const shimXs = [60, 160, 260];

  return (
    <DemoShell title="Visual · Shim Survival" hint="See what happens when containerd restarts">
      <div className="space-y-4">
        <div className="bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-4 flex items-center justify-center">
          <svg viewBox="0 0 340 240" className="w-full max-w-[440px]">
            {/* systemd */}
            <rect x="120" y="4" width="100" height="26" rx="6" fill="#64748b" fillOpacity="0.15" stroke="#64748b" strokeWidth="1" strokeOpacity="0.4" />
            <text x="170" y="21" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">systemd</text>

            {/* Line: systemd → containerd */}
            <line x1="170" y1="30" x2="170" y2={daemonY - 2} stroke="#475569" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />

            {/* containerd daemon */}
            <AnimatePresence mode="wait">
              {daemonAlive ? (
                <motion.g
                  key="daemon-alive"
                  initial={phase === 'recovering' ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                  style={{ transformOrigin: `${daemonX}px ${daemonY + 16}px` }}
                >
                  <rect
                    x={daemonX - 55}
                    y={daemonY}
                    width="110"
                    height="32"
                    rx="8"
                    fill={phase === 'survived' ? '#22c55e' : '#3b82f6'}
                    fillOpacity="0.2"
                    stroke={phase === 'survived' ? '#22c55e' : '#3b82f6'}
                    strokeWidth="2"
                    strokeOpacity="0.6"
                  />
                  {phase === 'survived' && (
                    <motion.rect
                      x={daemonX - 59}
                      y={daemonY - 4}
                      width="118"
                      height="40"
                      rx="10"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <text
                    x={daemonX}
                    y={daemonY + 20}
                    textAnchor="middle"
                    fill={phase === 'survived' ? '#4ade80' : '#60a5fa'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    containerd
                  </text>
                </motion.g>
              ) : (
                <motion.g
                  key="daemon-dead"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: phase === 'crash' ? [1, 0] : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformOrigin: `${daemonX}px ${daemonY + 16}px` }}
                >
                  <rect
                    x={daemonX - 55}
                    y={daemonY}
                    width="110"
                    height="32"
                    rx="8"
                    fill="#ef4444"
                    fillOpacity="0.3"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <text
                    x={daemonX}
                    y={daemonY + 20}
                    textAnchor="middle"
                    fill="#f87171"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    containerd
                  </text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Lines: containerd → shims */}
            {shimXs.map((sx, i) => (
              <motion.line
                key={`line-shim-${i}`}
                x1={daemonX}
                y1={daemonY + 32}
                x2={sx}
                y2={shimY}
                stroke={linesConnected ? '#3b82f6' : phase === 'survived' ? '#22c55e' : '#ef4444'}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                animate={{
                  strokeDashoffset: linesConnected ? -14 : 0,
                  opacity: phase === 'crash' || phase === 'broken' ? 0.1 : 0.6,
                }}
                transition={{
                  strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 0.5 },
                }}
              />
            ))}

            {/* Shims */}
            {shimXs.map((sx, i) => (
              <g key={`shim-${i}`}>
                <motion.rect
                  x={sx - 40}
                  y={shimY}
                  width="80"
                  height="28"
                  rx="6"
                  fill="#06b6d4"
                  fillOpacity={(phase === 'broken' || phase === 'crash') ? 0.25 : 0.12}
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  animate={
                    phase === 'broken'
                      ? { strokeOpacity: [0.4, 0.9, 0.4], fillOpacity: [0.15, 0.3, 0.15] }
                      : {}
                  }
                  transition={phase === 'broken' ? { duration: 1, repeat: Infinity } : {}}
                />
                <text
                  x={sx}
                  y={shimY + 18}
                  textAnchor="middle"
                  fill="#22d3ee"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  shim-runc-v2
                </text>

                {/* Line: shim → container */}
                <motion.line
                  x1={sx}
                  y1={shimY + 28}
                  x2={sx}
                  y2={containerY}
                  stroke="#22c55e"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -14 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />

                {/* Container */}
                <rect
                  x={sx - 35}
                  y={containerY}
                  width="70"
                  height="28"
                  rx="6"
                  fill={containers[i].color}
                  fillOpacity="0.12"
                  stroke={containers[i].color}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
                <text
                  x={sx}
                  y={containerY + 18}
                  textAnchor="middle"
                  fill={containers[i].color}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {containers[i].label}
                </text>
              </g>
            ))}

            {/* Status message */}
            {phase === 'survived' && (
              <motion.text
                x="170"
                y="235"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                initial={{ opacity: 0, y: 240 }}
                animate={{ opacity: 1, y: 235 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              >
                Containers survived the restart!
              </motion.text>
            )}
            {(phase === 'crash' || phase === 'broken') && (
              <motion.text
                x="170"
                y="235"
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {phase === 'crash' ? 'Daemon crashing...' : 'Shims keeping containers alive...'}
              </motion.text>
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          <DemoBtn
            onClick={runRestart}
            color="red"
            disabled={phase === 'crash' || phase === 'broken' || phase === 'recovering'}
          >
            Restart Daemon
          </DemoBtn>
          {phase === 'survived' && (
            <DemoBtn onClick={reset} color="mcb">Reset</DemoBtn>
          )}
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. VisualTaskStart  →  lesson life-start
   Vertical pipeline of 6 stages with animated pulse dot
   ═══════════════════════════════════════════════════════════ */

const taskStages = [
  { id: 'task-svc', label: 'Task Service', color: '#3b82f6', desc: 'The Task service receives the Create/Start RPC. It owns the full execution path — spawning shims, tracking PIDs, and managing task state transitions.' },
  { id: 'spawn-shim', label: 'Spawn Shim', color: '#06b6d4', desc: 'containerd forks a containerd-shim-runc-v2 process for this container. The shim becomes the direct parent supervisor — surviving daemon restarts.' },
  { id: 'oci-spec', label: 'OCI Spec', color: '#818cf8', desc: 'The shim generates config.json from container metadata: process args, env, mounts, namespaces, cgroups, capabilities, seccomp profile.' },
  { id: 'namespaces', label: 'Namespaces', color: '#8b5cf6', desc: 'runc creates 6 Linux namespaces isolating the container: PID (process tree), NET (network stack), MNT (filesystem), UTS (hostname), IPC (messaging), USER (uid mapping).' },
  { id: 'mount-rootfs', label: 'Mount rootfs', color: '#f59e0b', desc: 'OverlayFS merges image layers (read-only lowerdirs) with a writable upperdir into a single merged view — the container sees this as /.' },
  { id: 'exec-init', label: 'Exec Init', color: '#22c55e', desc: 'The container entrypoint becomes PID 1 inside the new namespace. It inherits the configured capabilities, seccomp filter, and cgroup limits.' },
] as const;

const nsBoxes = ['PID', 'NET', 'MNT', 'UTS', 'IPC', 'USER'];

export function VisualTaskStart() {
  const [activeStage, setActiveStage] = useState<number>(-1);
  const [playing, setPlaying] = useState(true);
  const [detail, setDetail] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback(() => {
    setPlaying(true);
    setActiveStage(-1);
    let step = 0;
    const tick = () => {
      setActiveStage(step);
      step++;
      if (step < taskStages.length) {
        timerRef.current = setTimeout(tick, 600);
      } else {
        timerRef.current = setTimeout(() => setPlaying(false), 800);
      }
    };
    timerRef.current = setTimeout(tick, 400);
  }, []);

  useEffect(() => {
    play();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stageH = 36;
  const gap = 14;
  const startY = 10;
  const stage = detail !== null ? taskStages.find((s) => s.id === detail) : null;

  return (
    <DemoShell title="Visual · Task Start Pipeline" hint="Watch the 6-stage startup sequence">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.45fr] gap-4">
        <div className="relative bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-3 flex items-center justify-center min-h-[200px]">
          <svg viewBox="0 0 340 310" className="w-full max-w-[420px]">
            {taskStages.map((s, i) => {
              const y = startY + i * (stageH + gap);
              const isActive = i === activeStage;
              const isPast = i < activeStage;
              return (
                <g key={s.id} onClick={() => setDetail(detail === s.id ? null : s.id)} className="cursor-pointer">
                  {/* Connector to next */}
                  {i < taskStages.length - 1 && (
                    <motion.line
                      x1="170" y1={y + stageH} x2="170" y2={y + stageH + gap}
                      stroke={isPast || isActive ? s.color : '#334155'}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{
                        strokeDashoffset: isPast || isActive ? -14 : 0,
                        strokeOpacity: isPast || isActive ? 0.7 : 0.15,
                      }}
                      transition={{
                        strokeDashoffset: { duration: 0.8, repeat: Infinity, ease: 'linear' },
                        strokeOpacity: { duration: 0.3 },
                      }}
                    />
                  )}

                  {/* Stage box */}
                  <motion.rect
                    x="60" y={y} width="220" height={stageH} rx="8"
                    fill={s.color}
                    fillOpacity={isActive ? 0.3 : isPast ? 0.12 : 0.05}
                    stroke={s.color}
                    strokeWidth={isActive ? 2.5 : 1}
                    strokeOpacity={isActive ? 1 : isPast ? 0.5 : 0.2}
                    animate={isActive ? { fillOpacity: [0.2, 0.35, 0.2] } : {}}
                    transition={isActive ? { duration: 1, repeat: Infinity } : { duration: 0.3 }}
                  />
                  <text
                    x="170" y={y + stageH / 2 + 4}
                    textAnchor="middle" fill={isActive ? '#fff' : s.color}
                    fontSize="10" fontWeight="bold" fontFamily="monospace"
                    className="pointer-events-none select-none"
                    opacity={isActive ? 1 : isPast ? 0.7 : 0.4}
                  >
                    {s.label}
                  </text>

                  {/* Namespace boxes spring in at stage 3 */}
                  {s.id === 'namespaces' && (isPast || isActive) && (
                    <g>
                      {nsBoxes.map((ns, ni) => {
                        const bx = 60 + ni * 37;
                        const by = y + stageH + 1;
                        return (
                          <motion.g
                            key={ns}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: ni * 0.08 }}
                            style={{ transformOrigin: `${bx + 16}px ${by + 5}px` }}
                          >
                            <rect x={bx} y={by} width="33" height="12" rx="3" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="0.8" strokeOpacity="0.5" />
                            <text x={bx + 16.5} y={by + 9} textAnchor="middle" fill="#a78bfa" fontSize="6.5" fontWeight="bold" fontFamily="monospace">{ns}</text>
                          </motion.g>
                        );
                      })}
                    </g>
                  )}
                </g>
              );
            })}

            {/* Pulse dot flowing down */}
            {playing && activeStage >= 0 && activeStage < taskStages.length && (
              <motion.circle
                cx="170"
                cy={startY + activeStage * (stageH + gap) + stageH / 2}
                r="5" fill="#f59e0b"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [1, 0.4, 1], scale: 1 }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="pointer-events-none"
              />
            )}

            {/* Green glow at the end */}
            {!playing && activeStage >= taskStages.length - 1 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.rect
                  x="95" y={startY + 5 * (stageH + gap) - 4}
                  width="150" height={stageH + 8} rx="10"
                  fill="none" stroke="#22c55e" strokeWidth="1.5"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <text
                  x="170" y={startY + 5 * (stageH + gap) + stageH + 18}
                  textAnchor="middle" fill="#22c55e" fontSize="9"
                  fontWeight="bold" fontFamily="monospace"
                >
                  nginx PID 1 ✓
                </text>
              </motion.g>
            )}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col justify-center min-h-[140px]">
          <AnimatePresence mode="wait">
            {stage ? (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="rounded-xl border border-mcb-600/40 bg-mcb-950/80 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: stage.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: stage.color }}>{stage.label}</span>
                </div>
                <p className="text-xs text-mcb-300 leading-relaxed">{stage.desc}</p>
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-mcb-500 text-center italic">
                Click any stage to see what happens at that step.
              </motion.p>
            )}
          </AnimatePresence>

          {!playing && (
            <div className="flex justify-center mt-3">
              <DemoBtn onClick={play} color="mcb">Replay</DemoBtn>
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   7. VisualNamespaces  →  lesson arch-namespaces
   3 vertical columns: default, k8s.io, moby
   ═══════════════════════════════════════════════════════════ */

const nsColumns = [
  {
    id: 'default',
    label: 'default',
    color: '#3b82f6',
    resources: ['ctr images', 'ctr containers', 'ctr tasks'],
    desc: 'The default namespace for ad-hoc operations. When you run ctr commands without -n, resources land here.',
  },
  {
    id: 'k8s',
    label: 'k8s.io',
    color: '#22c55e',
    resources: ['pod images', 'pod containers', 'pod tasks'],
    desc: 'Kubernetes CRI plugin uses this namespace. All K8s pods, images, and tasks are isolated here — invisible to Docker/ctr default.',
  },
  {
    id: 'moby',
    label: 'moby',
    color: '#a78bfa',
    resources: ['docker images', 'docker containers', 'docker tasks'],
    desc: 'Docker Engine uses the moby namespace. Docker containers and images never collide with K8s resources on the same host.',
  },
] as const;

function FloatingDot({ x, y, w, h, color, delay }: { x: number; y: number; w: number; h: number; color: string; delay: number }) {
  return (
    <motion.circle
      r="3"
      fill={color}
      fillOpacity="0.6"
      initial={{ cx: x + w * 0.3, cy: y + h * 0.3 }}
      animate={{
        cx: [x + w * 0.2, x + w * 0.7, x + w * 0.4, x + w * 0.8, x + w * 0.2],
        cy: [y + h * 0.3, y + h * 0.6, y + h * 0.8, y + h * 0.4, y + h * 0.3],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export function VisualNamespaces() {
  const [activeCol, setActiveCol] = useState<string | null>(null);
  const col = nsColumns.find((c) => c.id === activeCol);
  const colW = 95;
  const colH = 160;
  const gap = 12;
  const startX = (340 - (3 * colW + 2 * gap)) / 2;

  return (
    <DemoShell title="Visual · containerd Namespaces" hint="Click a column to learn more">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.45fr] gap-4">
        <div className="relative bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-3 flex items-center justify-center min-h-[200px]">
          <svg viewBox="0 0 340 230" className="w-full max-w-[420px]">
            {nsColumns.map((c, ci) => {
              const x = startX + ci * (colW + gap);
              const y = 10;
              const isActive = activeCol === c.id;
              return (
                <g key={c.id} onClick={() => setActiveCol(isActive ? null : c.id)} className="cursor-pointer">
                  {/* Column border */}
                  <motion.rect
                    x={x} y={y} width={colW} height={colH} rx="8"
                    fill={c.color}
                    fillOpacity={isActive ? 0.15 : 0.04}
                    stroke={c.color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeOpacity={isActive ? 0.9 : 0.3}
                    animate={isActive ? { fillOpacity: [0.1, 0.2, 0.1] } : {}}
                    transition={isActive ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
                  />

                  {/* Column header */}
                  <rect x={x} y={y} width={colW} height="22" rx="8" fill={c.color} fillOpacity="0.15" />
                  <text
                    x={x + colW / 2} y={y + 15}
                    textAnchor="middle" fill={c.color}
                    fontSize="10" fontWeight="bold" fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {c.label}
                  </text>

                  {/* Resource boxes stacked inside */}
                  {c.resources.map((r, ri) => {
                    const ry = y + 30 + ri * 28;
                    return (
                      <g key={r}>
                        <rect x={x + 6} y={ry} width={colW - 12} height="20" rx="4" fill={c.color} fillOpacity="0.08" stroke={c.color} strokeWidth="0.7" strokeOpacity="0.25" />
                        <text x={x + colW / 2} y={ry + 13} textAnchor="middle" fill={c.color} fontSize="7" fontFamily="monospace" opacity="0.7" className="pointer-events-none select-none">{r}</text>
                      </g>
                    );
                  })}

                  {/* Floating dots */}
                  <FloatingDot x={x + 4} y={y + 100} w={colW - 8} h={50} color={c.color} delay={ci * 0.5} />
                  <FloatingDot x={x + 4} y={y + 110} w={colW - 8} h={40} color={c.color} delay={ci * 0.5 + 1.5} />

                  {/* Dashed divider walls between columns */}
                  {ci < nsColumns.length - 1 && (
                    <motion.line
                      x1={x + colW + gap / 2} y1={y + 4}
                      x2={x + colW + gap / 2} y2={y + colH - 4}
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -20 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </g>
              );
            })}

            {/* Bottom label */}
            <text x="170" y="190" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace" className="select-none">
              Resources never cross namespace boundaries
            </text>

            {/* Sub-label */}
            <text x="170" y="205" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="monospace" className="select-none">
              Images, containers, and tasks are isolated per namespace
            </text>
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col justify-center min-h-[140px]">
          <AnimatePresence mode="wait">
            {col ? (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="rounded-xl border border-mcb-600/40 bg-mcb-950/80 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.label}</span>
                </div>
                <p className="text-xs text-mcb-300 leading-relaxed">{col.desc}</p>
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-mcb-500 text-center italic">
                Click a namespace column to see what it's used for.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   8. VisualSnapshotSystem  →  lesson snap-system
   Containerd → Snapshotter Plugin → layer chain
   ═══════════════════════════════════════════════════════════ */

const snapshotterBackends = ['overlayfs', 'btrfs', 'zfs', 'devmapper', 'native', 'stargz'];

interface SnapLayer {
  id: string;
  label: string;
  type: 'committed' | 'active';
}

const initialLayers: SnapLayer[] = [
  { id: 'l1', label: 'Layer 1', type: 'committed' },
  { id: 'l2', label: 'Layer 2', type: 'committed' },
  { id: 'l3', label: 'Active', type: 'active' },
];

export function VisualSnapshotSystem() {
  const [backendIdx, setBackendIdx] = useState(0);
  const [layers, setLayers] = useState<SnapLayer[]>(initialLayers);

  // Cycle backend names
  useEffect(() => {
    const id = setInterval(() => {
      setBackendIdx((prev) => (prev + 1) % snapshotterBackends.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const prepare = () => {
    setLayers((prev) => {
      if (prev.filter((l) => l.type === 'active').length >= 3) return prev;
      return [...prev, { id: `a${Date.now()}`, label: `Branch ${prev.length - 2}`, type: 'active' }];
    });
  };

  const commit = () => {
    setLayers((prev) => {
      const lastActive = [...prev].reverse().findIndex((l) => l.type === 'active');
      if (lastActive === -1) return prev;
      const idx = prev.length - 1 - lastActive;
      return prev.map((l, i) => (i === idx ? { ...l, type: 'committed' as const, label: l.label.replace('Active', 'Committed') } : l));
    });
  };

  const reset = () => setLayers(initialLayers);

  const layerW = 70;
  const layerH = 40;
  const layerGap = 18;
  const layersStartX = (340 - (layers.length * (layerW + layerGap) - layerGap)) / 2;

  return (
    <DemoShell title="Visual · Snapshot System" hint="Prepare, commit, and reset snapshot layers">
      <div className="space-y-4">
        {/* Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <DemoBtn onClick={prepare} color="green">Prepare</DemoBtn>
          <DemoBtn onClick={commit} color="blue">Commit</DemoBtn>
          <DemoBtn onClick={reset} color="mcb">Reset</DemoBtn>
        </div>

        <div className="bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-4 flex items-center justify-center">
          <svg viewBox="0 0 340 250" className="w-full max-w-[440px]">
            {/* Top: containerd box */}
            <rect x="110" y="8" width="120" height="30" rx="6" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="170" y="27" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="monospace">containerd</text>

            {/* Connector down */}
            <motion.line
              x1="170" y1="38" x2="170" y2="58"
              stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 3"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -14 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />

            {/* Middle: Snapshotter Plugin box with cycling backend */}
            <rect x="75" y="60" width="190" height="38" rx="6" fill="#8b5cf6" fillOpacity="0.1" stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="170" y="75" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="bold" fontFamily="monospace">Snapshotter Plugin</text>
            <AnimatePresence mode="wait">
              <motion.text
                key={snapshotterBackends[backendIdx]}
                x="170" y="91"
                textAnchor="middle" fill="#c4b5fd"
                fontSize="10" fontWeight="bold" fontFamily="monospace"
                initial={{ opacity: 0, y: 95 }}
                animate={{ opacity: 1, y: 91 }}
                exit={{ opacity: 0, y: 87 }}
                transition={{ duration: 0.3 }}
              >
                {snapshotterBackends[backendIdx]}
              </motion.text>
            </AnimatePresence>

            {/* Connector down to layers */}
            <motion.line
              x1="170" y1="98" x2="170" y2="118"
              stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -14 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />

            {/* Bottom: Layer chain */}
            <text x="170" y="132" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">Snapshot Chain</text>

            {layers.map((l, i) => {
              const lx = Math.max(10, layersStartX) + i * (layerW + layerGap);
              const ly = 140;
              const isActive = l.type === 'active';
              const color = isActive ? '#22c55e' : '#6366f1';
              return (
                <g key={l.id}>
                  {/* Connector to next */}
                  {i < layers.length - 1 && (
                    <motion.line
                      x1={lx + layerW} y1={ly + layerH / 2}
                      x2={lx + layerW + layerGap} y2={ly + layerH / 2}
                      stroke={color} strokeWidth="1.5" strokeDasharray="5 3"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -16 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  <motion.rect
                    x={lx} y={ly} width={layerW} height={layerH} rx="6"
                    fill={color}
                    fillOpacity={isActive ? 0.2 : 0.1}
                    stroke={color}
                    strokeWidth={isActive ? 2 : 1}
                    strokeOpacity={isActive ? 0.8 : 0.4}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                    style={{ transformOrigin: `${lx + layerW / 2}px ${ly + layerH / 2}px` }}
                  />
                  <text x={lx + layerW / 2} y={ly + 17} textAnchor="middle" fill={color} fontSize="8" fontWeight="bold" fontFamily="monospace" className="pointer-events-none select-none">{l.label}</text>
                  <text x={lx + layerW / 2} y={ly + 30} textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" opacity="0.6" className="pointer-events-none select-none">{isActive ? 'RW' : 'RO'}</text>
                </g>
              );
            })}

            {/* Legend */}
            <rect x="70" y="210" width="10" height="10" rx="2" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="0.8" />
            <text x="85" y="219" fill="#818cf8" fontSize="7" fontFamily="monospace">Committed (RO)</text>
            <rect x="180" y="210" width="10" height="10" rx="2" fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="0.8" />
            <text x="195" y="219" fill="#4ade80" fontSize="7" fontFamily="monospace">Active (RW)</text>
          </svg>
        </div>
      </div>
    </DemoShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   9. VisualSecurityLayers  →  lesson sec-stack
   Concentric shield layers + "Simulate Attack" button
   ═══════════════════════════════════════════════════════════ */

const securityLayers = [
  { id: 'userns', label: 'User Namespaces', color: '#22c55e', desc: 'Maps container root (UID 0) to an unprivileged host UID. Even if an attacker gains root inside, they have no host privileges.' },
  { id: 'mac', label: 'AppArmor / SELinux', color: '#f59e0b', desc: 'Mandatory Access Control profiles restrict file access, network operations, and capabilities regardless of user permissions. Loaded at task start.' },
  { id: 'seccomp', label: 'Seccomp', color: '#ef4444', desc: 'Syscall filter loaded into the kernel. Blocks dangerous syscalls (e.g. mount, reboot, kexec_load) even for root. ~300+ syscalls filtered by default.' },
  { id: 'caps', label: 'Capabilities', color: '#8b5cf6', desc: 'Linux breaks root into ~40 capabilities. containerd/runc drop dangerous ones (CAP_SYS_ADMIN, CAP_NET_RAW) by default. Fine-grained privilege control.' },
] as const;

type AttackPhase = 'idle' | 'attacking' | 'blocked';

export function VisualSecurityLayers() {
  const [phase, setPhase] = useState<AttackPhase>('idle');
  const [hitLayer, setHitLayer] = useState(-1);
  const [detail, setDetail] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const attack = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('attacking');
    setDetail(null);
    setHitLayer(-1);
    let step = 0;
    const tick = () => {
      setHitLayer(step);
      step++;
      if (step < securityLayers.length) {
        timerRef.current = setTimeout(tick, 500);
      } else {
        timerRef.current = setTimeout(() => setPhase('blocked'), 400);
      }
    };
    timerRef.current = setTimeout(tick, 300);
  }, [phase]);

  const reset = useCallback(() => {
    setPhase('idle');
    setHitLayer(-1);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const cx = 170;
  const cy = 140;
  const layer = detail !== null ? securityLayers.find((s) => s.id === detail) : null;

  // Concentric rectangles: outermost is index 0
  const rects = securityLayers.map((s, i) => {
    const padding = 30;
    const w = 280 - i * (padding * 2);
    const h = 220 - i * (padding * 2 - 6);
    const x = cx - w / 2;
    const y = cy - h / 2;
    return { ...s, x, y, w, h, idx: i };
  });

  return (
    <DemoShell title="Visual · Security Layers" hint="Click a layer or simulate an attack">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.45fr] gap-4">
        <div className="relative bg-mcb-950/60 rounded-xl border border-mcb-700/30 p-3 flex items-center justify-center min-h-[200px]">
          <svg viewBox="0 0 340 280" className="w-full max-w-[420px]">
            {/* Concentric shield layers */}
            {rects.map((r) => {
              const isHit = phase === 'attacking' && r.idx <= hitLayer;
              const isActive = detail === r.id;
              return (
                <g key={r.id} onClick={() => setDetail(detail === r.id ? null : r.id)} className="cursor-pointer">
                  <motion.rect
                    x={r.x} y={r.y} width={r.w} height={r.h} rx="12"
                    fill={r.color}
                    fillOpacity={isHit ? 0.25 : isActive ? 0.15 : 0.06}
                    stroke={r.color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeOpacity={isHit || isActive ? 0.9 : 0.3}
                    animate={isHit ? { fillOpacity: [0.15, 0.35, 0.15] } : {}}
                    transition={isHit ? { duration: 0.3, repeat: 2 } : { duration: 0.3 }}
                  />
                  {/* Layer label */}
                  <text
                    x={r.x + r.w / 2} y={r.y + 14}
                    textAnchor="middle" fill={r.color}
                    fontSize="8" fontWeight="bold" fontFamily="monospace"
                    opacity={isActive || isHit ? 1 : 0.6}
                    className="pointer-events-none select-none"
                  >
                    {r.label}
                  </text>
                </g>
              );
            })}

            {/* Center: Container Process */}
            <rect x={cx - 45} y={cy - 16} width="90" height="32" rx="6" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold" fontFamily="monospace" className="select-none">Process</text>

            {/* Attack arrow */}
            {phase !== 'idle' && (
              <motion.g
                initial={{ opacity: 1 }}
                animate={{ opacity: phase === 'blocked' ? 0.2 : 1 }}
              >
                <motion.line
                  x1="0" y1={cy}
                  x2={rects[Math.min(hitLayer, rects.length - 1)]?.x ?? rects[0].x}
                  y2={cy}
                  stroke="#ef4444" strokeWidth="2.5"
                  strokeDasharray="8 4"
                  initial={{ x2: 0 }}
                  animate={{
                    x2: rects[Math.min(hitLayer, rects.length - 1)]?.x ?? rects[0].x,
                    opacity: phase === 'blocked' ? 0.3 : 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* Arrow head */}
                <motion.polygon
                  points={`${rects[Math.min(hitLayer, rects.length - 1)]?.x ?? rects[0].x},${cy - 5} ${rects[Math.min(hitLayer, rects.length - 1)]?.x ?? rects[0].x},${cy + 5} ${(rects[Math.min(hitLayer, rects.length - 1)]?.x ?? rects[0].x) + 8},${cy}`}
                  fill="#ef4444"
                  opacity={phase === 'blocked' ? 0.3 : 0.8}
                />
              </motion.g>
            )}

            {/* BLOCKED text */}
            {phase === 'blocked' && (
              <motion.text
                x={cx} y={cy + 45}
                textAnchor="middle" fill="#22c55e"
                fontSize="14" fontWeight="bold" fontFamily="monospace"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                BLOCKED
              </motion.text>
            )}
          </svg>
        </div>

        {/* Detail panel + controls */}
        <div className="flex flex-col justify-center gap-3 min-h-[140px]">
          <AnimatePresence mode="wait">
            {layer ? (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="rounded-xl border border-mcb-600/40 bg-mcb-950/80 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: layer.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: layer.color }}>{layer.label}</span>
                </div>
                <p className="text-xs text-mcb-300 leading-relaxed">{layer.desc}</p>
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-mcb-500 text-center italic">
                Click a shield layer to learn what it blocks, or simulate an attack.
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2 justify-center">
            <DemoBtn onClick={attack} color="red" disabled={phase !== 'idle'}>Simulate Attack</DemoBtn>
            {phase === 'blocked' && <DemoBtn onClick={reset} color="mcb">Reset</DemoBtn>}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
