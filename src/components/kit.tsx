import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Lightbulb, RotateCcw, Star, Trophy, CheckCircle2, XCircle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { withAlpha } from '@/components/color';
import { FoodShell } from '@/components/FoodShell';
import { useLang } from '@/translations';
import { playClickSound } from '@/utils/sound';

export { useLang, FoodShell };

/* ------------------------------------------------------------------
   Module 2 toolkit: scoring run, feedback toast, drag-and-drop
   (pointer/touch friendly via framer-motion), tabs and finish card.
   ------------------------------------------------------------------ */

export type Tone = 'ok' | 'bad' | 'info';

/** Scoring + persistence for one simulation run. */
export function useRun(simId: string, maxPoints: number) {
  const addXP = useStore((s) => s.addXP); const completeLesson = useStore((s) => s.completeLesson); const addLabAttempt = useStore((s) => s.addLabAttempt);
  const [points, setPoints] = useState(0);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const pct = Math.max(0, Math.min(100, Math.round((points / Math.max(1, maxPoints)) * 100) - hints * 3 - mistakes * 2));
  const add = useCallback((p: number) => setPoints((x) => x + p), []);
  const miss = useCallback(() => setMistakes((x) => x + 1), []);
  const hint = useCallback(() => setHints((x) => x + 1), []);
  const finish = useCallback(() => {
    if (done) return;
    setDone(true);
    addLabAttempt({ labId: simId, score: pct, completedAt: new Date().toISOString(), hintsUsed: hints, timeSpent: Math.round((Date.now() - startRef.current) / 1000) });
    completeLesson(`m2sim-${simId}`);
    addXP(Math.max(10, Math.round(pct / 2)));
  }, [done, pct, hints, simId, addLabAttempt, completeLesson, addXP]);
  const reset = useCallback(() => { setPoints(0); setHints(0); setMistakes(0); setDone(false); startRef.current = Date.now(); }, []);
  return { points, hints, mistakes, pct, done, add, miss, hint, finish, reset };
}
export type Run = ReturnType<typeof useRun>;

export function Toast({ tone, text }: { tone: Tone; text: string | null }) {
  const Icon = tone === 'ok' ? CheckCircle2 : tone === 'bad' ? XCircle : Info;
  const cls = tone === 'ok' ? 'bg-green-50 border-green-300 text-green-800' : tone === 'bad' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-sky-50 border-sky-300 text-sky-800';
  return (
    <div className="min-h-[44px]" aria-live="polite" data-testid="toast">
      <AnimatePresence mode="wait">
        {text && (
          <motion.div key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-start gap-2 text-sm font-medium rounded-xl border px-3.5 py-2 ${cls}`} data-tone={tone}>
            <Icon size={18} className="mt-0.5 flex-shrink-0" /> <span>{text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Small feedback state helper. */
export function useToast() {
  const [t, setT] = useState<{ tone: Tone; text: string | null }>({ tone: 'info', text: null });
  const say = useCallback((tone: Tone, text: string | null) => setT({ tone, text }), []);
  return { toast: t, say };
}

export function Hud({ run, accent, label, extra }: { run: Run; accent: string; label?: string; extra?: React.ReactNode }) {
  const L = useLang();
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm" data-testid="hud">
      <span className="px-3.5 py-1.5 rounded-xl font-bold font-mono shadow-xs" style={{ background: withAlpha(accent, 0.14), color: accent }}>
        {label ?? L('Score', 'स्कोर')} {run.pct}%
      </span>
      <span className="px-3 py-1.5 rounded-xl bg-blue-50/90 border border-blue-200/80 text-blue-900 font-semibold">{L('Hints', 'संकेत')} {run.hints}</span>
      <span className="px-3 py-1.5 rounded-xl bg-blue-50/90 border border-blue-200/80 text-blue-900 font-semibold">{L('Mistakes', 'गलतियाँ')} {run.mistakes}</span>
      {extra}
    </div>
  );
}

export function ChefBrief({ station, role, task, standard }: { station: string; role: string; task: string; standard?: string }) {
  const L = useLang();
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-800/60 p-3.5 text-xs sm:text-sm space-y-1.5" data-testid="chef-brief">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
          🏨 {station} · <span className="font-semibold text-slate-800 dark:text-slate-200">{role}</span>
        </span>
        {standard && (
          <span className="chip bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 text-xs sm:text-sm font-bold px-3 py-1">
            🎓 {standard}
          </span>
        )}
      </div>
      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
        <b>{L('Real-World Scenario', 'वास्तविक परिदृश्य')}:</b> {task}
      </p>
    </div>
  );
}

export function ProTip({ title, text }: { title?: string; text: string }) {
  const L = useLang();
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/40 dark:border-amber-900/60 px-3.5 py-2 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
      <span className="text-lg select-none">💡</span>
      <div className="flex-1 leading-relaxed">
        <span className="font-bold">{title ?? L("Chef's Detail Tip", "शेफ़ की सूक्ष्म जानकारी")}: </span>
        <span>{text}</span>
      </div>
    </div>
  );
}

export function HintButton({ onHint, accent }: { onHint: () => void; accent: string }) {
  const L = useLang();
  return (
    <button onClick={() => { playClickSound('click'); onHint(); }} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95" data-testid="hint-btn"
      style={{ color: accent, borderColor: withAlpha(accent, 0.4), background: withAlpha(accent, 0.08) }}>
      <Lightbulb size={16} /> {L('Hint (-3%)', 'संकेत (-3%)')}
    </button>
  );
}

export function Stars({ pct }: { pct: number }) {
  const n = pct >= 85 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  return (
    <div className="flex justify-center gap-2" data-stars={n}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15 * i, type: 'spring' }}>
          <Star size={36} className={i < n ? 'text-amber-400 fill-amber-400' : 'text-stone-300'} />
        </motion.span>
      ))}
    </div>
  );
}

export function FinishCard({ run, accent, summary, onReplay }: { run: Run; accent: string; summary: string[]; onReplay: () => void }) {
  const L = useLang();
  const msg = run.pct >= 85 ? L('Outstanding kitchen work!', 'शानदार रसोई कार्य!') : run.pct >= 60 ? L('Good job — a little more practice and you will master it.', 'अच्छा — थोड़ा और अभ्यास से महारत मिलेगी।') : L('Keep practising — try again using the hints.', 'अभ्यास जारी रखें — संकेतों के साथ फिर कोशिश करें।');
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border p-6 text-center space-y-4 shadow-sm" data-testid="finish"
      style={{ borderColor: withAlpha(accent, 0.35), background: withAlpha(accent, 0.07) }}>
      <Trophy className="mx-auto" style={{ color: accent }} size={42} />
      <Stars pct={run.pct} />
      <p className="text-2xl sm:text-3xl font-extrabold font-mono" style={{ color: accent }}>{run.pct}%</p>
      <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">{msg}</p>
      <ul className="text-sm sm:text-base text-slate-700 dark:text-slate-300 space-y-1">{summary.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <p className="text-sm text-slate-500">{L('Hints used', 'उपयोग किए संकेत')}: {run.hints} · {L('Mistakes', 'गलतियाँ')}: {run.mistakes}</p>
      <button onClick={() => { playClickSound('click'); onReplay(); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm sm:text-base font-bold shadow-md active:scale-95 transition-all" style={{ background: accent }} data-testid="replay">
        <RotateCcw size={16} /> {L('Replay', 'दोबारा खेलें')}
      </button>
    </motion.div>
  );
}

export function Tabs2<T extends string>({ tabs, value, onChange, accent }: { tabs: { id: T; label: string; done?: boolean }[]; value: T; onChange: (t: T) => void; accent: string }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => { playClickSound('click'); onChange(t.id); }} data-tab={t.id}
          className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${value === t.id ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
          style={value === t.id ? { color: accent } : undefined}>
          {t.label}{t.done ? ' ✓' : ''}
        </button>
      ))}
    </div>
  );
}

export function Levels({ n, value, onChange, accent, labels }: { n: number; value: number; onChange: (i: number) => void; accent: string; labels?: string[] }) {
  const L = useLang();
  return (
    <div className="inline-flex gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
      {Array.from({ length: n }, (_, i) => (
        <button key={i} onClick={() => { playClickSound('click'); onChange(i); }} data-level={i + 1}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold ${value === i ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'}`} style={value === i ? { color: accent } : undefined}>
          {labels?.[i] ?? `${L('Level', 'स्तर')} ${i + 1}`}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Drag and drop ---------------- */
/** Finds the id of the drop-zone under a pointer (client coordinates). */
function zoneAtPoint(x: number, y: number): string | null {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    const z = (el as HTMLElement).dataset?.zone;
    if (z) return z;
  }
  return null;
}

export function DragChip({ id, onDrop, children, disabled, className = '' }: {
  id: string; onDrop: (zone: string | null, id: string) => void; children: React.ReactNode; disabled?: boolean; className?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const handleEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragging(false);
    onDrop(zoneAtPoint(info.point.x - window.scrollX, info.point.y - window.scrollY), id);
  };
  return (
    <motion.div drag={!disabled} dragSnapToOrigin dragElastic={0.15} dragMomentum={false} whileDrag={{ scale: 1.08, zIndex: 50, boxShadow: '0 12px 28px rgba(0,0,0,.25)' }}
      onDragStart={() => setDragging(true)} onDragEnd={handleEnd} data-drag={id}
      className={`touch-none select-none ${disabled ? 'opacity-40' : 'cursor-grab active:cursor-grabbing'} ${dragging ? 'relative' : ''} ${className}`}>
      {children}
    </motion.div>
  );
}

export function DropZone({ id, children, className = '', style, active }: { id: string; children?: React.ReactNode; className?: string; style?: React.CSSProperties; active?: boolean }) {
  return (
    <div data-zone={id} className={`transition-all ${active ? 'ring-2 ring-offset-1' : ''} ${className}`} style={style}>{children}</div>
  );
}

/** Seeded shuffle so scenes are stable per replay key but vary between replays. */
export function useShuffled<T>(arr: T[], key: number): T[] {
  return useMemo(() => {
    const a = [...arr]; let s = key * 9301 + 49297;
    for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function Card({ children, className = '', accent, onClick, selected, testId }: { children: React.ReactNode; className?: string; accent?: string; onClick?: () => void; selected?: boolean; testId?: string }) {
  return (
    <div onClick={onClick} data-testid={testId} className={`rounded-xl border p-3 bg-white dark:bg-ink-1 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
      style={{ borderColor: selected && accent ? accent : 'rgba(148,163,184,.4)', boxShadow: selected && accent ? `0 0 0 2px ${withAlpha(accent, 0.3)}` : undefined }}>
      {children}
    </div>
  );
}

export type SimIcon = LucideIcon;

/** Sub-section switcher: keeps every panel mounted (state is preserved) and shows one. */
export function SubTabs({ tabs, accent, done, value, onChange, children }: {
  tabs: { id: string; label: string }[];
  accent: string;
  done: Record<string, boolean>;
  value?: string;
  onChange?: (id: string) => void;
  children: Record<string, React.ReactNode>;
}) {
  const [internalCur, setInternalCur] = useState(tabs[0].id);
  const cur = value !== undefined ? value : internalCur;
  const setCur = (id: string) => {
    playClickSound('click');
    setInternalCur(id);
    onChange?.(id);
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} data-sub={t.id} onClick={() => setCur(t.id)} className={`px-3.5 py-2 rounded-xl border text-sm font-bold transition-all shadow-xs ${cur === t.id ? 'text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}
            style={cur === t.id ? { background: accent, borderColor: accent } : undefined}>{t.label}{done[t.id] ? ' ✓' : ''}</button>
        ))}
      </div>
      {tabs.map((t) => <div key={t.id} style={{ display: cur === t.id ? 'block' : 'none' }}>{children[t.id]}</div>)}
    </div>
  );
}

/** Tracks completion of named sub-tasks and calls onAll once when all are done. */
export function useSubDone(ids: string[], onAll: () => void) {
  const [d, setD] = useState<Record<string, boolean>>({});
  const fired = useRef(false);
  const all = ids.every((i) => d[i]);
  if (all && !fired.current) { fired.current = true; queueMicrotask(onAll); }
  return { d, mark: (k: string) => () => setD((x) => (x[k] ? x : { ...x, [k]: true })) };
}
