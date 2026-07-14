import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Cog,
  Layers,
  Menu,
  X,
  GraduationCap,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { containerdCourse, flatLessons } from './modules';
import { LessonBlocks } from './ui';

/* ═══════════════════════════════════════════════════════════
   Floating particles background
   ═══════════════════════════════════════════════════════════ */
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  dur: 8 + Math.random() * 12,
  delay: Math.random() * 5,
  opacity: 0.08 + Math.random() * 0.12,
}));

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-mcb-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Larger ambient orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-mcb-500/5 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '20%', left: '10%' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-blue-500/5 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{ top: '60%', right: '5%' }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-green-500/5 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
        style={{ bottom: '15%', left: '40%' }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Scroll progress bar
   ═══════════════════════════════════════════════════════════ */
function ScrollProgress({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-mcb-500 via-blue-400 to-green-400 origin-left z-50"
      style={{ scaleX }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   Animated grid background for hub
   ═══════════════════════════════════════════════════════════ */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

interface CourseProps {
  onComplete: () => void;
}

export const ContainerdCourse: React.FC<CourseProps> = ({ onComplete }) => {
  const flat = useMemo(() => flatLessons(), []);
  const [hub, setHub] = useState(true);
  const [moduleId, setModuleId] = useState(containerdCourse[0].id);
  const [lessonId, setLessonId] = useState(containerdCourse[0].lessons[0].id);
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const lessonRef = useRef<HTMLDivElement>(null);
  const [navDir, setNavDir] = useState<1 | -1>(1);

  const mod = containerdCourse.find((m) => m.id === moduleId)!;
  const lesson = mod.lessons.find((l) => l.id === lessonId) ?? mod.lessons[0];
  const flatIndex = flat.findIndex((f) => f.moduleId === moduleId && f.lessonId === lessonId);
  const progress = Math.round((done.size / flat.length) * 100);

  const markDone = (mId: string, lId: string) => {
    setDone((prev) => new Set(prev).add(`${mId}::${lId}`));
  };

  const goTo = (mId: string, lId: string) => {
    setModuleId(mId);
    setLessonId(lId);
    setHub(false);
    setNavOpen(false);
    markDone(mId, lId);
  };

  const goNext = () => {
    if (flatIndex < 0 || flatIndex >= flat.length - 1) return;
    const n = flat[flatIndex + 1];
    goTo(n.moduleId, n.lessonId);
  };

  const goPrev = () => {
    if (flatIndex <= 0) return;
    const p = flat[flatIndex - 1];
    goTo(p.moduleId, p.lessonId);
  };

  const goNextDir = useCallback(() => {
    setNavDir(1);
    goNext();
  }, [goNext]);

  const goPrevDir = useCallback(() => {
    setNavDir(-1);
    goPrev();
  }, [goPrev]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [moduleId, lessonId, hub]);

  const filteredModules = useMemo(() => {
    if (!query.trim()) return containerdCourse;
    const q = query.toLowerCase();
    return containerdCourse
      .map((m) => ({
        ...m,
        lessons: m.lessons.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            m.title.toLowerCase().includes(q) ||
            l.blocks.some((b) => JSON.stringify(b).toLowerCase().includes(q))
        ),
      }))
      .filter((m) => m.lessons.length > 0 || m.title.toLowerCase().includes(q));
  }, [query]);

  const parts = useMemo(() => {
    const map = new Map<string, typeof containerdCourse>();
    for (const m of containerdCourse) {
      if (!map.has(m.part)) map.set(m.part, []);
      map.get(m.part)!.push(m);
    }
    return [...map.entries()];
  }, []);

  /* ───────────── Hub ───────────── */
  if (hub) {
    return (
      <div className="min-h-[600px] w-full max-w-6xl mx-auto text-left space-y-8 relative">
        <GridBackground />
        <FloatingParticles />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="text-center space-y-4 relative z-10">
          {/* Animated hero icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative w-20 h-20 mx-auto"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-mcb-600 to-mcb-800 border-2 border-mcb-400 shadow-[0_0_50px_rgba(59,130,246,0.35)]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cog size={40} className="text-white" />
            </div>
            {/* Orbiting dot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-8px]"
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-mcb-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            className="text-4xl md:text-5xl font-extrabold text-white"
          >
            ContainerD <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 150 }}
              className="text-mcb-400"
            >Masterclass</motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-mcb-200 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Every detail from <code className="text-mcb-300">containerd</code> and the{' '}
            <code className="text-mcb-300">docker</code> curriculum - architecture, OverlayFS, security,
            production ops, and the complete <strong>ctr</strong> command reference.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 text-xs"
          >
            {[
              { label: `${containerdCourse.length} modules`, cls: 'bg-mcb-900/50 border-mcb-700 text-mcb-300' },
              { label: `${flat.length} lessons`, cls: 'bg-mcb-900/50 border-mcb-700 text-mcb-300' },
              { label: '100+ commands', cls: 'bg-mcb-900/50 border-mcb-700 text-mcb-300' },
              { label: `${progress}% explored`, cls: 'bg-green-900/30 border-green-700/40 text-green-300' },
            ].map((badge, bi) => (
              <motion.span
                key={bi}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45 + bi * 0.06, type: 'spring', stiffness: 400, damping: 15 }}
                className={`px-3 py-1 rounded-full border ${badge.cls}`}
              >
                {badge.label}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 150, damping: 20 }}
          className="relative max-w-md mx-auto z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 300 }}
          >
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mcb-500" />
          </motion.div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, commands, topics…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-mcb-950/60 border border-mcb-700/50 text-white text-sm placeholder:text-mcb-500 focus:outline-none focus:border-mcb-400 transition-all focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          />
        </motion.div>

        <div className="space-y-8 relative z-10">
          {(query ? [['Search results', filteredModules] as const] : parts).map(([partName, mods], pi) => (
            <motion.div
              key={String(partName)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + pi * 0.15, type: 'spring', stiffness: 120, damping: 20 }}
            >
              <motion.h2
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + pi * 0.15, type: 'spring', stiffness: 200 }}
                className="text-sm font-bold uppercase tracking-widest text-mcb-400 mb-3 flex items-center gap-2"
              >
                <motion.div
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.4 + pi * 0.15, type: 'spring', stiffness: 300, damping: 12 }}
                >
                  <Layers size={14} />
                </motion.div>
                {partName}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + pi * 0.15, duration: 0.5 }}
                  className="flex-1 h-px bg-gradient-to-r from-mcb-600/30 to-transparent origin-left"
                />
              </motion.h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mods.map((m, mi) => {
                  const doneCount = m.lessons.filter((l) => done.has(`${m.id}::${l.id}`)).length;
                  const completePct = m.lessons.length > 0 ? Math.round((doneCount / m.lessons.length) * 100) : 0;
                  return (
                    <motion.button
                      key={m.id}
                      type="button"
                      initial={{ opacity: 0, y: 20, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.4 + pi * 0.15 + mi * 0.06, type: 'spring', stiffness: 180, damping: 18 }}
                      whileHover={{
                        y: -6,
                        scale: 1.03,
                        boxShadow: '0 12px 40px rgba(99,102,241,0.15)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => goTo(m.id, m.lessons[0].id)}
                      className="group text-left rounded-2xl border border-mcb-700/40 bg-gradient-to-br from-mcb-950/80 to-mcb-900/30 p-5 hover:border-mcb-400/60 transition-colors relative overflow-hidden"
                    >
                      {/* Animated top accent */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.6 + pi * 0.15 + mi * 0.06, duration: 0.5 }}
                        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-mcb-400/50 to-transparent origin-left"
                      />
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-mcb-500/0 to-mcb-500/0 group-hover:from-mcb-500/5 group-hover:to-blue-500/5 transition-all duration-500 rounded-2xl" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + pi * 0.15 + mi * 0.06 }}
                              className="text-[10px] uppercase tracking-wider text-mcb-500 font-bold"
                            >
                              {m.short}
                            </motion.p>
                            <p className="font-bold text-white group-hover:text-mcb-200 mt-0.5 transition-colors">{m.title}</p>
                          </div>
                          <motion.div
                            whileHover={{ x: 3 }}
                            className="shrink-0 mt-1"
                          >
                            <ChevronRight size={18} className="text-mcb-600 group-hover:text-mcb-300 transition-colors" />
                          </motion.div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-mcb-400">
                            {m.lessons.length} lesson{m.lessons.length > 1 ? 's' : ''}
                          </p>
                          {doneCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                              className="text-xs text-green-400 flex items-center gap-1"
                            >
                              <Sparkles size={10} /> {doneCount}/{m.lessons.length}
                            </motion.span>
                          )}
                        </div>
                        {/* Mini progress bar */}
                        {doneCount > 0 && (
                          <div className="mt-2 h-1 rounded-full bg-mcb-800/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completePct}%` }}
                              transition={{ delay: 0.7 + mi * 0.06, duration: 0.6 }}
                              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                            />
                          </div>
                        )}
                        <ul className="mt-3 space-y-1">
                          {m.lessons.slice(0, 3).map((l, li) => (
                            <motion.li
                              key={l.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.55 + pi * 0.15 + mi * 0.06 + li * 0.03 }}
                              className="text-[11px] text-mcb-500 truncate flex items-center gap-1.5"
                            >
                              {done.has(`${m.id}::${l.id}`) ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                                  <Check size={10} className="text-green-400" />
                                </motion.div>
                              ) : (
                                <BookOpen size={10} />
                              )}
                              {l.title}
                            </motion.li>
                          ))}
                          {m.lessons.length > 3 && (
                            <li className="text-[11px] text-mcb-600">+{m.lessons.length - 3} more…</li>
                          )}
                        </ul>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 120 }}
          className="flex flex-col sm:flex-row justify-center gap-3 pt-4 relative z-10"
        >
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => goTo(flat[0].moduleId, flat[0].lessonId)}
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg shadow-[0_0_30px_rgba(99,102,241,0.25)]"
            >
              Start full course <ArrowRight />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              onClick={onComplete}
              className="flex items-center justify-center gap-2"
            >
              Skip to Kubernetes <GraduationCap size={18} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ───────────── Lesson view ───────────── */
  return (
    <div ref={lessonRef} className="min-h-[600px] w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 text-left relative">
      <ScrollProgress containerRef={lessonRef} />
      <FloatingParticles />
      {/* Desktop module rail */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="hidden lg:flex flex-col w-72 shrink-0 max-h-[calc(100vh-8rem)] sticky top-4 relative z-20"
      >
        <motion.button
          type="button"
          onClick={() => setHub(true)}
          whileHover={{ x: 2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mb-3 text-left px-3 py-2 rounded-lg border border-mcb-700/40 bg-mcb-950/50 text-sm text-mcb-300 hover:text-white hover:border-mcb-500 transition-colors flex items-center gap-2"
        >
          <Layers size={14} /> Course hub
        </motion.button>
        <div className="flex-1 overflow-y-auto rounded-2xl border border-mcb-700/40 bg-mcb-950/40 p-2 space-y-1">
          {containerdCourse.map((m) => {
            const open = m.id === moduleId;
            return (
              <div key={m.id}>
                <motion.button
                  type="button"
                  onClick={() => {
                    setModuleId(m.id);
                    if (!open) setLessonId(m.lessons[0].id);
                  }}
                  whileHover={{ x: 2 }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                    open ? 'bg-mcb-700/40 text-white' : 'text-mcb-400 hover:bg-mcb-900/40'
                  }`}
                >
                  <span className="truncate">{m.title}</span>
                  <span className="text-[10px] text-mcb-500">{m.lessons.length}</span>
                </motion.button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      className="ml-2 mt-0.5 space-y-0.5 border-l border-mcb-800 pl-2 overflow-hidden"
                    >
                      {m.lessons.map((l, li) => {
                        const active = l.id === lessonId;
                        const isDone = done.has(`${m.id}::${l.id}`);
                        return (
                          <motion.button
                            key={l.id}
                            type="button"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: li * 0.03 }}
                            onClick={() => goTo(m.id, l.id)}
                            whileHover={{ x: 3 }}
                            className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center gap-1.5 transition-colors relative ${
                              active
                                ? 'bg-mcb-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                                : 'text-mcb-400 hover:text-mcb-200 hover:bg-mcb-900/50'
                            }`}
                          >
                            {active && (
                              <motion.div
                                layoutId="active-lesson"
                                className="absolute inset-0 bg-mcb-600 rounded"
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                              />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5 w-full">
                              {isDone ? <Check size={10} className="text-green-400 shrink-0" /> : <span className="w-2.5" />}
                              <span className="truncate">{l.title}</span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 px-2"
        >
          <div className="h-1.5 rounded-full bg-mcb-900 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-mcb-500 to-green-400"
            />
          </div>
          <p className="text-[10px] text-mcb-500 mt-1 text-center">
            {done.size}/{flat.length} lessons · {progress}%
          </p>
        </motion.div>
      </motion.aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-mcb-700 text-mcb-200 text-sm"
          >
            <Menu size={16} /> Modules
          </button>
          <button type="button" onClick={() => setHub(true)} className="text-xs text-mcb-400 underline">
            Hub
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {navOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[80] lg:hidden"
                onClick={() => setNavOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-mcb-950 z-[90] p-4 overflow-y-auto border-r border-mcb-700 lg:hidden"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-white">Modules</span>
                  <button type="button" onClick={() => setNavOpen(false)}>
                    <X size={20} className="text-mcb-300" />
                  </button>
                </div>
                {containerdCourse.map((m) => (
                  <div key={m.id} className="mb-3">
                    <p className="text-xs font-bold text-mcb-400 mb-1">{m.title}</p>
                    {m.lessons.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => goTo(m.id, l.id)}
                        className={`block w-full text-left text-sm px-2 py-1.5 rounded ${
                          l.id === lessonId && m.id === moduleId ? 'bg-mcb-600 text-white' : 'text-mcb-300'
                        }`}
                      >
                        {l.title}
                      </button>
                    ))}
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Animated lesson header */}
        <motion.div
          key={`${moduleId}-${lessonId}-hdr`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          className="relative overflow-hidden rounded-2xl border border-mcb-700/30 bg-gradient-to-r from-mcb-950/80 via-mcb-900/30 to-mcb-950/80 p-6"
        >
          {/* Background glow */}
          <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-12 -right-12 w-40 h-40 bg-mcb-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl"
          />

          {/* Module icon */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-10 h-10 rounded-xl bg-mcb-700/40 border border-mcb-500/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <Cog size={20} className="text-mcb-300" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] uppercase tracking-widest text-mcb-500 font-bold"
          >
            {mod.part} · {mod.title}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 160 }}
            className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-mcb-200 mt-1"
          >
            {lesson.title}
          </motion.h2>
          {lesson.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-mcb-300 mt-1.5 text-sm md:text-base"
            >
              {lesson.subtitle}
            </motion.p>
          )}

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mt-4"
          >
            <div className="h-1.5 flex-1 rounded-full bg-mcb-800/50 overflow-hidden max-w-[200px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((flatIndex + 1) / flat.length) * 100}%` }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="h-full bg-gradient-to-r from-mcb-500 to-green-400 rounded-full"
              />
            </div>
            <span className="text-[11px] text-mcb-500 font-mono">
              {flatIndex + 1} / {flat.length}
            </span>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${moduleId}-${lessonId}`}
            initial={{ opacity: 0, x: navDir * 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: navDir * -40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            className="relative rounded-2xl border border-mcb-700/40 bg-gradient-to-b from-mcb-950/50 to-mcb-950/20 p-5 md:p-8 overflow-hidden"
          >
            {/* Animated corner glows */}
            <motion.div
              animate={{ opacity: [0.04, 0.1, 0.04], scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-0 right-0 w-40 h-40 bg-mcb-500/10 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ opacity: [0.03, 0.08, 0.03] }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
              className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ opacity: [0.02, 0.06, 0.02] }}
              transition={{ duration: 10, repeat: Infinity, delay: 4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none"
            />
            <div className="relative z-10">
              <LessonBlocks blocks={lesson.blocks} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer nav */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
          className="flex flex-wrap items-center justify-between gap-3 pb-8"
        >
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={goPrevDir}
              disabled={flatIndex <= 0}
              className="flex items-center gap-2 disabled:opacity-40"
            >
              <ArrowLeft size={18} /> Previous
            </Button>
          </motion.div>

          {flatIndex >= flat.length - 1 ? (
            <motion.div whileHover={{ x: 3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={onComplete} className="flex items-center gap-2 text-lg px-6 py-3">
                Continue to Kubernetes <ArrowRight />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={goNextDir} className="flex items-center gap-2">
                Next lesson <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
