import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Check,
  AlertTriangle,
  Info,
  Lightbulb,
  XCircle,
  Copy,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import type { ContentBlock, CommandItem } from './types';
import {
  DemoEngineIntro,
  DemoRuntimeStack,
  DemoArchitecture,
  DemoShim,
  DemoLifecycle,
  DemoOverlayFS,
  DemoContainerVsTask,
  DemoImagePull,
  DemoDebugFlow,
} from './demos';
import {
  VisualCarAnalogy,
  VisualRuntimeFlow,
  VisualContainerLifecycle,
  VisualOverlayFS,
  VisualShimSurvival,
  VisualTaskStart,
  VisualNamespaces,
  VisualSnapshotSystem,
  VisualSecurityLayers,
} from './visuals';

/* ═══════════════════════════════════════════════════════════
   Demo map
   ═══════════════════════════════════════════════════════════ */
const demoMap: Record<string, React.FC> = {
  DemoEngineIntro,
  DemoRuntimeStack,
  DemoArchitecture,
  DemoShim,
  DemoLifecycle,
  DemoOverlayFS,
  DemoContainerVsTask,
  DemoImagePull,
  DemoDebugFlow,
  VisualCarAnalogy,
  VisualRuntimeFlow,
  VisualContainerLifecycle,
  VisualOverlayFS,
  VisualShimSurvival,
  VisualTaskStart,
  VisualNamespaces,
  VisualSnapshotSystem,
  VisualSecurityLayers,
};

/* ═══════════════════════════════════════════════════════════
   Typewriter hook - line-by-line reveal
   ═══════════════════════════════════════════════════════════ */
function useTypewriterLines(lines: string[], baseDelay = 60) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    if (!lines.length) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setCount(i);
      if (i >= lines.length) clearInterval(id);
    }, baseDelay);
    return () => clearInterval(id);
  }, [lines, baseDelay]);
  return count;
}

/* ═══════════════════════════════════════════════════════════
   Blinking cursor
   ═══════════════════════════════════════════════════════════ */
function BlinkCursor({ color = 'bg-green-400/80' }: { color?: string }) {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ repeat: Infinity, duration: 0.7 }}
      className={`inline-block w-2 h-4 ${color} ml-0.5 align-middle rounded-[1px]`}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   Typewriter command — types cmd char-by-char in step context
   ═══════════════════════════════════════════════════════════ */
function TypewriterCmd({ cmd }: { cmd: string }) {
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setTyped('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(cmd.slice(0, i));
      if (i >= cmd.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [cmd]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 flex items-start gap-2 bg-black/60 rounded-lg px-3 py-2 border border-mcb-700/50 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        className="text-green-500 font-mono text-xs mt-0.5 shrink-0"
      >
        $
      </motion.span>
      <code className="text-xs font-mono text-green-300 break-all flex-1 min-h-[1.2em]">
        {typed || '\u00A0'}
        {!done && typed.length > 0 && <BlinkCursor color="bg-green-400/60" />}
      </code>
      {done && <CopyBtn text={cmd} />}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════════════ */
const calloutStyles = {
  info: { border: 'border-sky-500/40', bg: 'bg-sky-950/40', icon: Info, iconColor: 'text-sky-400', glow: 'rgba(56,189,248,0.15)' },
  warn: { border: 'border-amber-500/40', bg: 'bg-amber-950/40', icon: AlertTriangle, iconColor: 'text-amber-400', glow: 'rgba(245,158,11,0.15)' },
  success: { border: 'border-green-500/40', bg: 'bg-green-950/40', icon: Check, iconColor: 'text-green-400', glow: 'rgba(34,197,94,0.15)' },
  tip: { border: 'border-mcb-500/40', bg: 'bg-mcb-950/50', icon: Lightbulb, iconColor: 'text-mcb-300', glow: 'rgba(99,102,241,0.15)' },
  danger: { border: 'border-red-500/40', bg: 'bg-red-950/40', icon: XCircle, iconColor: 'text-red-400', glow: 'rgba(239,68,68,0.15)' },
};

const cardColors: Record<string, string> = {
  blue: 'border-blue-500/30 bg-blue-950/30',
  green: 'border-green-500/30 bg-green-950/30',
  orange: 'border-orange-500/30 bg-orange-950/30',
  sky: 'border-sky-500/30 bg-sky-950/30',
  mcb: 'border-mcb-500/40 bg-mcb-950/40',
  yellow: 'border-yellow-500/30 bg-yellow-950/30',
  red: 'border-red-500/30 bg-red-950/30',
  cyan: 'border-cyan-500/30 bg-cyan-950/30',
  pink: 'border-pink-500/30 bg-pink-950/30',
  teal: 'border-teal-500/30 bg-teal-950/30',
};

const cardGlow: Record<string, string> = {
  blue: 'rgba(59,130,246,0.2)',
  green: 'rgba(34,197,94,0.2)',
  orange: 'rgba(249,115,22,0.2)',
  sky: 'rgba(56,189,248,0.2)',
  mcb: 'rgba(99,102,241,0.2)',
  yellow: 'rgba(234,179,8,0.2)',
  red: 'rgba(239,68,68,0.2)',
  cyan: 'rgba(6,182,212,0.2)',
  pink: 'rgba(236,72,153,0.2)',
  teal: 'rgba(20,184,166,0.2)',
};

const cardDirections = [
  { x: -40, y: 0 },
  { x: 40, y: 0 },
  { x: 0, y: 40 },
  { x: -30, y: -30 },
  { x: 30, y: -30 },
  { x: 0, y: -40 },
  { x: -40, y: 20 },
  { x: 40, y: 20 },
  { x: -20, y: 40 },
];

/* ═══════════════════════════════════════════════════════════
   Copy button
   ═══════════════════════════════════════════════════════════ */
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1200);
      }}
      className="p-1 rounded hover:bg-white/10 text-mcb-400 hover:text-white transition-colors"
      title="Copy"
    >
      {ok ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   Typewriter output — line-by-line reveal for cmd output
   ═══════════════════════════════════════════════════════════ */
function TypewriterOutput({ text }: { text: string }) {
  const lines = useMemo(() => text.split('\n'), [text]);
  const visCount = useTypewriterLines(lines, 40);
  return (
    <pre className="px-3 py-2 text-xs font-mono text-mcb-200/90 text-left whitespace-pre-wrap bg-black/40">
      {lines.slice(0, visCount).map((line, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: -3 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1 }}
          className="block"
        >
          {line}
        </motion.span>
      ))}
      {visCount < lines.length && <BlinkCursor color="bg-mcb-300/60" />}
    </pre>
  );
}

/* ═══════════════════════════════════════════════════════════
   Command row — typewriter character-by-character + auto output
   ═══════════════════════════════════════════════════════════ */
function CommandRow({ item, index }: { item: CommandItem; index: number }) {
  const [typed, setTyped] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const delay = Math.min(index * 0.05, 0.4);
  const typeStartDelay = index * 400;

  useEffect(() => {
    setTyped('');
    setTypingDone(false);
    setOpen(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTyped(item.cmd.slice(0, i));
        if (i >= item.cmd.length) {
          clearInterval(interval);
          setTypingDone(true);
          if (item.out) {
            setTimeout(() => setOpen(true), 350);
          }
        }
      }, 12);
      return () => clearInterval(interval);
    }, typeStartDelay);
    return () => clearTimeout(timeout);
  }, [item.cmd, typeStartDelay, item.out]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 180, damping: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-lg border border-mcb-800/50 bg-black/50 overflow-hidden group"
    >
      <motion.div
        animate={{
          backgroundColor: hovered ? 'rgba(99,102,241,0.06)' : 'rgba(0,0,0,0)',
        }}
        className="flex items-start gap-2 px-3 py-2.5"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 400, damping: 15 }}
          className="text-green-500 font-mono text-xs mt-0.5 shrink-0"
        >
          $
        </motion.span>
        <code className="flex-1 text-left text-sm font-mono text-green-300 break-all leading-relaxed min-h-[1.5em]">
          {typed || '\u00A0'}
          {!typingDone && typed.length > 0 && <BlinkCursor color="bg-green-400/60" />}
        </code>
        {hovered && typingDone && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BlinkCursor color="bg-green-400/60" />
          </motion.span>
        )}
        {typingDone && <CopyBtn text={item.cmd} />}
        {typingDone && (item.note || item.out) && (
          <motion.button
            type="button"
            onClick={() => setOpen(!open)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 text-mcb-400 hover:text-white"
          >
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </motion.button>
        )}
      </motion.div>
      <AnimatePresence>
        {open && (item.note || item.out) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="border-t border-mcb-800/40 overflow-hidden"
          >
            {item.note && (
              <motion.p
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="px-3 py-2 text-xs text-mcb-300 text-left bg-mcb-950/40"
              >
                {item.note}
              </motion.p>
            )}
            {item.out && <TypewriterOutput text={item.out} />}
          </motion.div>
        )}
      </AnimatePresence>
      {!open && item.note && typingDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 pb-2 text-[11px] text-mcb-500 text-left pl-7"
        >
          {item.note}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Block sub-components (hooks must be top-level, not in switch)
   ═══════════════════════════════════════════════════════════ */
function TerminalBlockView({ block }: { block: ContentBlock & { type: 'terminal' } }) {
  const visCount = useTypewriterLines(block.lines, 50);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      whileHover={{ boxShadow: '0 0 40px rgba(0,255,100,0.08)' }}
      className="rounded-xl border border-mcb-700/50 bg-black/70 overflow-hidden text-left shadow-[0_0_30px_rgba(0,0,0,0.4)] relative group"
    >
      <motion.div
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400/10 to-transparent pointer-events-none z-10"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 border-b border-mcb-800 bg-mcb-950/80 relative"
      >
        {[{ c: 'bg-red-500/80', d: 0.1 }, { c: 'bg-yellow-500/80', d: 0.15 }, { c: 'bg-green-500/80', d: 0.2 }].map((dot, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: dot.d, type: 'spring', stiffness: 400, damping: 15 }}
            className={`w-2.5 h-2.5 rounded-full ${dot.c}`}
          />
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-mcb-400 ml-2 font-mono"
        >
          {block.title || 'terminal'}
        </motion.span>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ml-auto flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(34,197,94,0.8)]" />
          <span className="text-[9px] text-green-400/70 font-mono">LIVE</span>
        </motion.div>
      </motion.div>
      <pre className="p-4 text-xs md:text-sm font-mono text-green-300/95 whitespace-pre-wrap leading-relaxed relative">
        {block.lines.slice(0, visCount).map((line, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
            className="block"
          >
            {line}
          </motion.span>
        ))}
        {visCount < block.lines.length && <BlinkCursor />}
      </pre>
    </motion.div>
  );
}

function DiagramBlockView({ block }: { block: ContentBlock & { type: 'diagram' } }) {
  const visCount = useTypewriterLines(block.lines, 70);
  return (
    <div className="text-left">
      {block.title && (
        <motion.h4
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-bold text-mcb-300 mb-2 flex items-center gap-2"
        >
          {block.title}
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[9px] text-mcb-500 font-mono"
          >
            ▪ diagram
          </motion.span>
        </motion.h4>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        whileHover={{ boxShadow: '0 0 30px rgba(99,102,241,0.12)' }}
        className="rounded-xl border border-mcb-700/40 bg-gradient-to-br from-mcb-950/80 to-black/60 overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.08)] relative"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.5) 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />
        <pre className="p-4 text-[11px] md:text-xs font-mono text-mcb-200 overflow-x-auto leading-relaxed whitespace-pre relative z-10">
          {block.lines.slice(0, visCount).map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              <DiagramLine text={line} />
            </motion.span>
          ))}
          {visCount < block.lines.length && <BlinkCursor color="bg-mcb-400/70" />}
        </pre>
      </motion.div>
    </div>
  );
}

function TreeBlockView({ block }: { block: ContentBlock & { type: 'tree' } }) {
  const visCount = useTypewriterLines(block.lines, 55);
  return (
    <div className="text-left">
      {block.title && (
        <motion.h4
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-bold text-mcb-300 mb-2"
        >
          {block.title}
        </motion.h4>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="rounded-xl border border-mcb-700/40 bg-gradient-to-br from-mcb-950/80 to-black/60 overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.08)]"
      >
        <pre className="p-4 text-[11px] md:text-xs font-mono text-mcb-200 overflow-x-auto leading-relaxed whitespace-pre">
          {block.lines.slice(0, visCount).map((line, i) => {
            const indent = line.search(/[^\s│├└─┬┤┘]/);
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: -(indent > 0 ? indent * 1.5 : 6) }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, type: 'spring', stiffness: 250, damping: 22 }}
                className="block"
              >
                <TreeLine text={line} />
              </motion.span>
            );
          })}
          {visCount < block.lines.length && <BlinkCursor color="bg-mcb-400/70" />}
        </pre>
      </motion.div>
    </div>
  );
}

function CodeBlockView({ block }: { block: ContentBlock & { type: 'code' } }) {
  const codeLines = useMemo(() => block.code.split('\n'), [block.code]);
  const visCount = useTypewriterLines(codeLines, 35);
  return (
    <div className="text-left">
      {block.title && (
        <motion.h4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-bold text-mcb-300 mb-2"
        >
          {block.title}
        </motion.h4>
      )}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        whileHover={{ boxShadow: '0 0 30px rgba(99,102,241,0.1)' }}
        className="relative rounded-xl border border-mcb-700/40 bg-black/70 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)] group"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between items-center px-3 py-1.5 border-b border-mcb-800/50 bg-mcb-950/60"
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {['bg-red-500/60', 'bg-yellow-500/60', 'bg-green-500/60'].map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 15 }}
                  className={`w-2 h-2 rounded-full ${c}`}
                />
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-mcb-500 font-mono ml-1">
              {block.lang || 'code'}
            </span>
          </div>
          <CopyBtn text={block.code} />
        </motion.div>
        <pre className="p-4 text-xs font-mono text-mcb-100 overflow-x-auto leading-relaxed whitespace-pre relative">
          {codeLines.slice(0, visCount).map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className="block hover:bg-mcb-800/20 transition-colors"
            >
              <span className="inline-block w-8 text-right mr-3 text-mcb-600 select-none text-[10px]">{i + 1}</span>
              {line}
            </motion.span>
          ))}
          {visCount < codeLines.length && <BlinkCursor color="bg-mcb-300/60" />}
        </pre>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BlockView - rich animations per type
   ═══════════════════════════════════════════════════════════ */
export function BlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    /* ── demo ─────────────────────────────────────────── */
    case 'demo': {
      const Comp = demoMap[block.demoId];
      if (!Comp) return null;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        >
          <Comp />
        </motion.div>
      );
    }

    /* ── text (gradient title + animated highlight + shimmer) ──── */
    case 'text':
      return (
        <motion.div
          className="text-left space-y-2 relative group"
          whileHover={{ x: 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {block.title && (
            <div className="relative">
              <motion.h4
                initial={{ opacity: 0, x: -24, y: 4 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-mcb-100 to-mcb-200"
              >
                {block.title}
              </motion.h4>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
                className="h-[2px] w-20 bg-gradient-to-r from-mcb-400 via-blue-400 to-transparent rounded-full mt-1.5 origin-left"
              />
              {/* Shimmer on title */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ delay: 0.6, duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
              />
            </div>
          )}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: block.title ? 0.18 : 0, duration: 0.5 }}
            className="text-mcb-200 leading-relaxed text-[15px]"
          >
            {block.body}
          </motion.p>
          {block.highlight && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 20 }}
              whileHover={{ x: 4, boxShadow: '0 0 20px rgba(59,130,246,0.1)' }}
              className="relative mt-3 rounded-lg bg-mcb-950/30 py-2 transition-all"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="absolute left-0 top-0 w-[3px] bg-gradient-to-b from-mcb-400 via-blue-400 to-mcb-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              />
              <motion.div
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute left-0 top-0 w-[3px] h-full bg-white rounded-full"
              />
              <p className="text-mcb-300 font-medium pl-4 py-1">{block.highlight}</p>
            </motion.div>
          )}
        </motion.div>
      );

    /* ── callout (animated glow border + pulsing icon) ── */
    case 'callout': {
      const s = calloutStyles[block.variant];
      const Icon = s.icon;
      return (
        <motion.div
          initial={{ opacity: 0, x: -28, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          whileHover={{ scale: 1.015, boxShadow: `0 0 35px ${s.glow}` }}
          className={`rounded-xl border ${s.border} ${s.bg} p-4 text-left flex gap-3 transition-shadow relative overflow-hidden`}
        >
          {/* Animated left accent bar */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full origin-top ${s.iconColor.replace('text-', 'bg-')}`}
            style={{ opacity: 0.6 }}
          />
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 12 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ delay: 0.5, duration: 0.8, times: [0, 0.3, 0.6, 1] }}
            >
              <Icon size={20} className={`${s.iconColor} shrink-0 mt-0.5`} />
            </motion.div>
          </motion.div>
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="font-bold text-white text-sm"
            >
              {block.title}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-mcb-200 text-sm mt-1 leading-relaxed"
            >
              {block.body}
            </motion.p>
          </div>
        </motion.div>
      );
    }

    /* ── commands ─────────────────────────────────────── */
    case 'commands':
      return (
        <div className="space-y-2 text-left">
          {block.title && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="flex items-center gap-2 text-mcb-300 text-sm font-semibold mb-1"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Terminal size={16} />
              </motion.div>
              {block.title}
            </motion.div>
          )}
          <div className="space-y-2">
            {block.items.map((item, i) => (
              <CommandRow key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      );

    /* ── terminal (typewriter + scanning line) ────────── */
    case 'terminal':
      return <TerminalBlockView block={block} />;

    /* ── table (row stagger + hover highlight + count) ─── */
    case 'table':
      return (
        <div className="text-left overflow-x-auto">
          {block.title && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="flex items-center gap-2 mb-2"
            >
              <h4 className="text-sm font-bold text-mcb-300">{block.title}</h4>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 12 }}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-mcb-800/50 text-mcb-400 font-mono"
              >
                {block.rows.length} rows
              </motion.span>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            whileHover={{ boxShadow: '0 0 25px rgba(99,102,241,0.08)' }}
            className="rounded-xl border border-mcb-700/40 overflow-hidden transition-shadow"
          >
            <table className="w-full text-sm border-collapse">
              <thead>
                <motion.tr
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                >
                  {block.headers.map((h, hi) => (
                    <motion.th
                      key={h}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: hi * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                      className="text-left px-3 py-2.5 bg-mcb-900/60 text-mcb-200 border-b border-mcb-800 font-semibold"
                    >
                      {h}
                    </motion.th>
                  ))}
                </motion.tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <motion.tr
                    key={ri}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(0.1 + ri * 0.05, 0.5), type: 'spring', stiffness: 180, damping: 22 }}
                    whileHover={{ backgroundColor: 'rgba(99,102,241,0.08)' }}
                    className="odd:bg-mcb-950/30 transition-colors cursor-default"
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 border-b border-mcb-800/40 text-mcb-200 font-mono text-xs md:text-sm">
                        {cell}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      );

    /* ── steps (interactive clickable walkthrough) ──── */
    case 'steps':
      return <StepsView block={block} />;

    /* ── diagram (typewriter + keyword highlights + glow) ───── */
    case 'diagram':
      return <DiagramBlockView block={block} />;

    /* ── tree (typewriter with indent-aware reveal) ──── */
    case 'tree':
      return <TreeBlockView block={block} />;

    /* ── cards (spring physics + gradient border + glow + shine) ─ */
    case 'cards':
      return (
        <div className="space-y-3">
          {block.title && (
            <motion.h4
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-sm font-bold text-mcb-300 text-left"
            >
              {block.title}
            </motion.h4>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {block.items.map((item, i) => {
              const dir = cardDirections[i % cardDirections.length];
              const color = item.color || 'mcb';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: dir.x, y: dir.y, scale: 0.85, rotateY: dir.x > 0 ? 8 : -8 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0 }}
                  transition={{ delay: Math.min(i * 0.08, 0.5), type: 'spring', stiffness: 180, damping: 18 }}
                  whileHover={{
                    y: -8,
                    scale: 1.04,
                    boxShadow: `0 12px 40px ${cardGlow[color] || cardGlow.mcb}`,
                    rotateY: dir.x > 0 ? 2 : -2,
                  }}
                  className={`relative rounded-xl border p-4 text-left cursor-default transition-shadow overflow-hidden ${cardColors[color] || cardColors.mcb}`}
                >
                  {/* Animated gradient accent line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: Math.min(i * 0.08 + 0.2, 0.6), duration: 0.5 }}
                    className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-mcb-400/60 to-transparent origin-left"
                  />
                  {/* Shine sweep on mount */}
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: '200%', opacity: [0, 0.3, 0] }}
                    transition={{ delay: Math.min(i * 0.08 + 0.4, 0.8), duration: 1.2, ease: 'easeInOut' }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                  />
                  {item.tag && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.08 + 0.15, 0.6), type: 'spring', stiffness: 400, damping: 15 }}
                      className="inline-block text-[10px] uppercase tracking-wider text-mcb-400 font-bold bg-mcb-800/40 px-2 py-0.5 rounded-full"
                    >
                      {item.tag}
                    </motion.span>
                  )}
                  <motion.p
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.08 + 0.12, 0.55) }}
                    className="font-bold text-white mt-1.5 text-sm"
                  >
                    {item.title}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.08 + 0.18, 0.6) }}
                    className="text-mcb-300 text-xs mt-1.5 leading-relaxed"
                  >
                    {item.body}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>
        </div>
      );

    /* ── compare (VS animation + gradient panels) ───── */
    case 'compare':
      return (
        <div className="space-y-2">
          {block.title && (
            <motion.h4
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold text-mcb-300 text-left"
            >
              {block.title}
            </motion.h4>
          )}
          <div className="grid md:grid-cols-2 gap-4 relative">
            {/* Animated VS divider */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 hidden md:flex flex-col items-center justify-center z-10">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-px flex-1 bg-gradient-to-b from-transparent via-mcb-500/30 to-transparent origin-top"
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
                className="w-8 h-8 rounded-full bg-mcb-800 border-2 border-mcb-500/50 flex items-center justify-center my-1 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              >
                <span className="text-[10px] font-black text-mcb-300">VS</span>
              </motion.div>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-px flex-1 bg-gradient-to-b from-mcb-500/30 via-transparent to-transparent origin-top"
              />
            </div>

            {[block.left, block.right].map((side, si) => (
              <motion.div
                key={si}
                initial={{ opacity: 0, x: si === 0 ? -40 : 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: si * 0.1, type: 'spring', stiffness: 150, damping: 20 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: si === 0
                    ? '0 0 30px rgba(59,130,246,0.15)'
                    : '0 0 30px rgba(99,102,241,0.15)',
                }}
                className={`rounded-xl border p-4 text-left transition-shadow relative overflow-hidden ${
                  si === 0 ? 'border-blue-500/30 bg-blue-950/20' : 'border-mcb-500/30 bg-mcb-950/30'
                }`}
              >
                {/* Gradient accent */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 + si * 0.1, duration: 0.5 }}
                  className={`absolute top-0 left-0 right-0 h-[2px] origin-left ${
                    si === 0
                      ? 'bg-gradient-to-r from-blue-500/60 via-blue-400/30 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-mcb-400/30 to-mcb-500/60'
                  }`}
                />
                <motion.p
                  initial={{ opacity: 0, x: si === 0 ? -12 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + si * 0.05 }}
                  className="font-bold text-white mb-3"
                >
                  {side.title}
                </motion.p>
                <ul className="space-y-2">
                  {side.items.map((it, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: si === 0 ? -14 : 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: Math.min(0.2 + i * 0.06, 0.6),
                        type: 'spring', stiffness: 200, damping: 22,
                      }}
                      className="text-sm text-mcb-200 flex gap-2"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: Math.min(0.25 + i * 0.06, 0.65), type: 'spring', stiffness: 400, damping: 12 }}
                        className={si === 0 ? 'text-blue-400' : 'text-mcb-400'}
                      >
                        •
                      </motion.span>
                      <span>{it}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      );

    /* ── list (stagger with animated bullets) ────────── */
    case 'list':
      return (
        <div className="text-left">
          {block.title && (
            <motion.h4
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="text-sm font-bold text-mcb-300 mb-2"
            >
              {block.title}
            </motion.h4>
          )}
          <ul className="space-y-1.5 pl-1">
            {block.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: Math.min(i * 0.06, 0.5),
                  type: 'spring', stiffness: 200, damping: 20,
                }}
                className="text-mcb-200 text-sm leading-relaxed flex gap-2.5 items-start"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: Math.min(i * 0.06 + 0.08, 0.55),
                    type: 'spring', stiffness: 500, damping: 12,
                  }}
                  className="text-mcb-500 mt-1.5 shrink-0"
                >
                  {block.ordered ? (
                    <span className="text-xs font-bold text-mcb-400 w-4 inline-block">{i + 1}.</span>
                  ) : (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-mcb-500" />
                  )}
                </motion.span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      );

    /* ── code (typewriter + line numbers + scan) ────────── */
    case 'code':
      return <CodeBlockView block={block} />;

    /* ── checklist (slide-in + icon springs + glows) ─── */
    case 'checklist':
      return (
        <div className="text-left space-y-2">
          {block.title && (
            <motion.h4
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-bold text-mcb-300 mb-2"
            >
              {block.title}
            </motion.h4>
          )}
          {block.items.map((item, i) => {
            const d = Math.min(i * 0.07, 0.5);
            const isOk = item.ok !== false;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: d, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{
                  scale: 1.01,
                  boxShadow: isOk
                    ? '0 0 16px rgba(34,197,94,0.12)'
                    : '0 0 16px rgba(239,68,68,0.12)',
                }}
                className="flex items-start gap-2 rounded-lg border border-mcb-800/40 bg-mcb-950/30 px-3 py-2 transition-shadow"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: d + 0.12, type: 'spring', stiffness: 500, damping: 12 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: d + 0.2, duration: 0.5, times: [0, 0.4, 1] }}
                  >
                    {isOk ? (
                      <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                  </motion.div>
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: d + 0.15 }}
                  className="text-sm text-mcb-200"
                >
                  {item.label}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   StepsView — interactive clickable walkthrough
   ═══════════════════════════════════════════════════════════ */
function StepsView({ block }: { block: Extract<ContentBlock, { type: 'steps' }> }) {
  const [active, setActive] = useState(0);
  const isLab = block.kind === 'lab';

  return (
    <div className={`space-y-3 text-left ${isLab ? 'rounded-2xl border border-green-700/40 bg-green-950/10 p-4 shadow-[0_0_30px_rgba(34,197,94,0.08)]' : ''}`}>
      {isLab && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-green-300 bg-green-500/15 border border-green-500/40 rounded-full px-2.5 py-1">
            Hands-on Lab
          </span>
        </motion.div>
      )}

      {block.title && (
        <motion.h4
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="text-sm font-bold text-mcb-300 mb-1"
        >
          {block.title}
        </motion.h4>
      )}

      {isLab && block.goal && (
        <p className="text-sm text-green-200/80 leading-relaxed">
          <span className="font-semibold text-green-300">Goal: </span>
          {block.goal}
        </p>
      )}

      {/* Progress bar + nav */}
      <div className="relative">
        <div className="h-1.5 bg-mcb-800/50 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((active + 1) / block.steps.length) * 100}%` }}
            className={`h-full rounded-full ${
              isLab
                ? 'bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                : 'bg-gradient-to-r from-mcb-500 via-blue-400 to-green-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
            }`}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[10px] text-mcb-500 font-mono">
            Step {active + 1} / {block.steps.length}
          </span>
          <div className="flex gap-1.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              disabled={active === 0}
              onClick={() => setActive(Math.max(0, active - 1))}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-mcb-800/50 text-mcb-400 hover:text-white hover:bg-mcb-700/50 disabled:opacity-30 border border-mcb-700/30 font-bold transition-colors"
            >
              ← Prev
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              disabled={active === block.steps.length - 1}
              onClick={() => setActive(Math.min(block.steps.length - 1, active + 1))}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-mcb-600/50 text-white hover:bg-mcb-500/50 disabled:opacity-30 border border-mcb-400/30 font-bold transition-colors"
            >
              Next →
            </motion.button>
          </div>
        </div>
      </div>

      {/* Step items */}
      {block.steps.map((step, i) => {
        const isActive = i === active;
        const isPast = i < active;
        const d = Math.min(i * 0.06, 0.4);

        return (
          <div key={i} className="relative">
            {/* Connector line */}
            {i < block.steps.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: d + 0.2, duration: 0.3 }}
                className="absolute left-[17px] top-[42px] w-[2px] h-[calc(100%-14px)] origin-top z-0"
              >
                <motion.div
                  animate={{
                    backgroundColor: isPast || isActive
                      ? 'rgba(59,130,246,0.4)'
                      : 'rgba(99,102,241,0.15)',
                  }}
                  className="w-full h-full rounded-full"
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d, type: 'spring', stiffness: 200, damping: 20 }}
              onClick={() => setActive(i)}
              className={`flex gap-3 rounded-xl border p-3 mb-2 relative z-10 cursor-pointer transition-all duration-300 ${
                isActive
                  ? 'border-mcb-400/60 bg-gradient-to-r from-mcb-900/60 to-mcb-950/80 shadow-[0_0_25px_rgba(59,130,246,0.15)]'
                  : isPast
                    ? 'border-green-700/30 bg-green-950/10 hover:bg-green-950/20'
                    : 'border-mcb-800/40 bg-mcb-950/40 hover:border-mcb-700/60 hover:bg-mcb-950/60'
              }`}
            >
              {/* Step number */}
              <div className="relative shrink-0">
                <motion.div
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isPast
                      ? 'bg-green-500/20 border-2 border-green-500/50 text-green-300'
                      : isActive
                        ? 'bg-mcb-500/30 border-2 border-mcb-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                        : 'bg-mcb-800/50 border-2 border-mcb-600/30 text-mcb-400'
                  }`}
                >
                  {isPast ? <Check size={14} /> : i + 1}
                </motion.div>
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-mcb-400/50"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm transition-colors duration-300 ${
                  isActive ? 'text-white' : isPast ? 'text-green-200/70' : 'text-mcb-300'
                }`}>
                  {step.title}
                </p>

                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={`step-detail-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-mcb-200 text-sm mt-1.5 leading-relaxed"
                      >
                        {step.detail}
                      </motion.p>
                      {step.cmd && <TypewriterCmd key={`cmd-${i}`} cmd={step.cmd} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active indicator arrow */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="self-center shrink-0"
                >
                  <ChevronDown size={14} className="text-mcb-400 -rotate-90" />
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Diagram line with keyword highlighting
   ═══════════════════════════════════════════════════════════ */
const keywordColors: [RegExp, string][] = [
  [/\b(containerd|CONTAINERD)\b/g, 'text-mcb-300 font-semibold'],
  [/\b(runc|gVisor|Kata|Firecracker)\b/g, 'text-yellow-300'],
  [/\b(kubelet|kubectl|docker|nerdctl|crictl|ctr)\b/g, 'text-green-300'],
  [/\b(CRI|OCI|gRPC|API)\b/g, 'text-sky-300 font-semibold'],
  [/\b(KERNEL|kernel)\b/g, 'text-red-300'],
  [/\b(namespaces|cgroups|seccomp|AppArmor|SELinux|overlayfs)\b/g, 'text-orange-300'],
  [/\b(SHIM|shim)\b/g, 'text-amber-300'],
];

function DiagramLine({ text }: { text: string }) {
  // Check for keyword matches, render with highlights
  const parts: { text: string; cls?: string }[] = [];
  let remaining = text;

  // Simple approach: find first match across all patterns, split, recurse
  while (remaining.length > 0) {
    let earliest: { idx: number; len: number; cls: string } | null = null;
    for (const [rx, cls] of keywordColors) {
      const pattern = new RegExp(rx.source, rx.flags);
      const m = pattern.exec(remaining);
      if (m && (earliest === null || m.index < earliest.idx)) {
        earliest = { idx: m.index, len: m[0].length, cls };
      }
    }
    if (!earliest) {
      parts.push({ text: remaining });
      break;
    }
    if (earliest.idx > 0) {
      parts.push({ text: remaining.slice(0, earliest.idx) });
    }
    parts.push({ text: remaining.slice(earliest.idx, earliest.idx + earliest.len), cls: earliest.cls });
    remaining = remaining.slice(earliest.idx + earliest.len);
  }

  return (
    <>
      {parts.map((p, i) =>
        p.cls ? (
          <span key={i} className={p.cls}>{p.text}</span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Tree line with branch character coloring
   ═══════════════════════════════════════════════════════════ */
function TreeLine({ text }: { text: string }) {
  // Color the tree drawing characters (│├└─┬┤┘) in mcb-500
  const match = text.match(/^([\s│├└─┬┤┘]*)(.*)/);
  if (!match) return <>{text}</>;
  const [, prefix, rest] = match;
  return (
    <>
      {prefix && <span className="text-mcb-600">{prefix}</span>}
      <DiagramLine text={rest} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   InViewBlock — dramatic entrance
   ═══════════════════════════════════════════════════════════ */
function InViewBlock({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const d = Math.min(index * 0.12, 0.6);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
      transition={{
        delay: d,
        type: 'spring',
        stiffness: 100,
        damping: 18,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HeroBlock — first block gets dramatic full-width entrance
   ═══════════════════════════════════════════════════════════ */
function HeroBlock({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18, duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DemoHero — demo blocks get full-width cinematic treatment
   ═══════════════════════════════════════════════════════════ */
function DemoHero({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{
        delay: Math.min(index * 0.1, 0.4),
        type: 'spring',
        stiffness: 80,
        damping: 16,
      }}
      className="relative"
    >
      {/* Glow behind demo */}
      <motion.div
        animate={inView ? { opacity: [0, 0.15, 0.08] } : { opacity: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute -inset-4 bg-mcb-500/10 rounded-3xl blur-2xl pointer-events-none"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Block separator — animated divider between blocks
   ═══════════════════════════════════════════════════════════ */
function BlockSeparator({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <div ref={ref} className="flex items-center justify-center py-2">
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.3), ease: 'easeOut' }}
        className="h-px w-32 bg-gradient-to-r from-transparent via-mcb-500/30 to-transparent"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LessonBlocks — hero first block + dramatic stagger + demo prominence
   ═══════════════════════════════════════════════════════════ */
export function LessonBlocks({ blocks }: { blocks: ContentBlock[] }) {
  // Key to force re-mount when blocks change (resets all typewriter animations)
  const blockKey = useMemo(() => JSON.stringify(blocks.map(b => b.type)).slice(0, 100), [blocks]);

  return (
    <div key={blockKey} className="space-y-8">
      {blocks.map((block, i) => {
        const isFirst = i === 0;
        const isDemo = block.type === 'demo';

        // First block gets hero treatment
        if (isFirst) {
          return (
            <div key={i}>
              <HeroBlock>
                <BlockView block={block} />
              </HeroBlock>
              {i < blocks.length - 1 && <BlockSeparator index={i} />}
            </div>
          );
        }

        // Demo blocks get cinematic treatment with glow
        if (isDemo) {
          return (
            <div key={i}>
              <DemoHero index={i}>
                <BlockView block={block} />
              </DemoHero>
              {i < blocks.length - 1 && <BlockSeparator index={i} />}
            </div>
          );
        }

        // Regular blocks with scroll-triggered entrance
        return (
          <div key={i}>
            <InViewBlock index={i}>
              <BlockView block={block} />
            </InViewBlock>
            {i < blocks.length - 1 && <BlockSeparator index={i} />}
          </div>
        );
      })}
    </div>
  );
}
