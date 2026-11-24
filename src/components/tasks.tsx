import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { withAlpha } from '@/components/color';
import { playClickSound } from '@/utils/sound';
import { DragChip, DropZone, HintButton, Toast, useLang, useShuffled, useToast, type Run } from './kit';

export type Bi2 = { en: string; hi: string };

/* ------------------------------------------------------------------
   Generic interaction engines reused across Module 2 simulations.
   MatchTask  – drag items into the correct category OR tap item then tap zone
   OrderTask  – drag steps into sequence OR tap step to place in order
   ChoiceTask – scenario decisions with instant feedback
   ------------------------------------------------------------------ */

export interface MatchItem { id: string; label: Bi2; emoji?: string; cat: string; why?: Bi2 }
export interface MatchZone { id: string; label: Bi2; emoji?: string; note?: Bi2 }

export function MatchTask({ items, zones, run, accent, onDone, points = 4, shuffleKey = 0, cols = 3, hintText }: {
  items: MatchItem[]; zones: MatchZone[]; run: Run; accent: string; onDone?: () => void; points?: number; shuffleKey?: number; cols?: number;
  hintText?: (remaining: MatchItem[]) => string;
}) {
  const L = useLang();
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [shake, setShake] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const { toast, say } = useToast();
  const order = useShuffled(items, shuffleKey + 1);
  const remaining = order.filter((i) => !placed[i.id]);

  useEffect(() => {
    if (items.length > 0 && remaining.length === 0) {
      say('ok', L('All matched correctly!', 'सब सही मिलाया गया!'));
      onDone?.();
    }
    /* eslint-disable-next-line */
  }, [remaining.length]);

  const drop = (zone: string | null, id: string) => {
    setOver(null);
    setSelected(null);
    if (!zone) return;
    const it = items.find((x) => x.id === id)!;
    if (zone === it.cat) {
      setPlaced((p) => ({ ...p, [id]: zone }));
      run.add(points);
      playClickSound('success');
      say('ok', it.why ? L(it.why.en, it.why.hi) : L('Correct!', 'सही!'));
    } else {
      run.miss();
      setShake(id);
      setTimeout(() => setShake(null), 400);
      playClickSound('error');
      const z = zones.find((q) => q.id === zone);
      say('bad', L(`${it.label.en} does not belong in "${z?.label.en}". Think again.`, `${it.label.hi} "${z?.label.hi}" में नहीं आता। फिर सोचें।`));
    }
  };

  const handleZoneClick = (zoneId: string) => {
    if (selected) {
      drop(zoneId, selected);
    }
  };

  const handleItemClick = (itemId: string) => {
    playClickSound('neutral');
    setSelected((prev) => (prev === itemId ? null : itemId));
  };

  const hint = () => {
    run.hint();
    const it = remaining[0];
    if (!it) return;
    const z = zones.find((q) => q.id === it.cat)!;
    say('info', hintText ? hintText(remaining) : L(`Try placing "${it.label.en}" in "${z.label.en}".`, `"${it.label.hi}" को "${z.label.hi}" में रखकर देखें।`));
  };

  return (
    <div className="space-y-3" data-testid="match-task">
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(cols, zones.length)}, minmax(0, 1fr))` }}>
        {zones.map((z) => {
          const inside = items.filter((i) => placed[i.id] === z.id);
          return (
            <div key={z.id} onClick={() => handleZoneClick(z.id)} className={selected ? 'cursor-pointer' : ''}>
              <DropZone id={z.id} className={`rounded-2xl border-2 border-dashed p-3 min-h-[105px] transition-all ${selected ? 'hover:scale-[1.01] hover:border-blue-500 shadow-sm' : ''}`}
                style={{ borderColor: withAlpha(accent, over === z.id || selected ? 0.85 : 0.35), background: withAlpha(accent, selected ? 0.08 : 0.04) }}>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="text-sm sm:text-base font-bold flex items-center gap-1.5" style={{ color: accent }}>
                    <span>{z.emoji}</span> <span>{L(z.label.en, z.label.hi)}</span>
                  </p>
                  {selected && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 animate-pulse">
                      {L('Tap to place', 'रखने हेतु छुएँ')}
                    </span>
                  )}
                </div>
                {z.note && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1.5 leading-snug">{L(z.note.en, z.note.hi)}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {inside.map((i) => (
                    <motion.span key={i.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs sm:text-sm px-2.5 py-1.5 rounded-xl bg-green-100 text-green-900 border border-green-300 font-semibold inline-flex items-center gap-1.5 shadow-xs">
                      <span className="text-base">{i.emoji}</span> {L(i.label.en, i.label.hi)} <Check size={14} className="text-green-700" />
                    </motion.span>
                  ))}
                </div>
              </DropZone>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-3 min-h-[72px] flex flex-wrap gap-2.5 items-center" data-testid="tray">
        {remaining.length === 0 && <span className="text-sm text-green-600 dark:text-green-400 font-bold">🎉 {L('All items matched successfully!', 'सभी सामग्री सफलतापूर्वक मिलाई गई!')}</span>}
        {remaining.map((i) => (
          <div key={i.id} onClick={() => handleItemClick(i.id)} className="cursor-pointer">
            <DragChip id={i.id} onDrop={drop}
              className={`px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-900 shadow-sm text-xs sm:text-sm font-semibold transition-all ${selected === i.id ? 'ring-2 ring-blue-500 scale-105 border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'} ${shake === i.id ? 'animate-pulse border-red-400' : ''}`}>
              <span className="text-xl mr-1.5 align-middle">{i.emoji}</span>{L(i.label.en, i.label.hi)}
            </DragChip>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <HintButton onHint={hint} accent={accent} />
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {selected ? L('Tap a target category box above to place it', 'ऊपर लक्ष्य श्रेणी बॉक्स को छूकर रखें') : L('Drag each card, or tap a card then tap a box', 'कार्ड खींचें, या कार्ड छूकर फिर बॉक्स छुएँ')}
        </span>
      </div>
      <Toast {...toast} />
    </div>
  );
}

export interface OrderStep { id: string; label: Bi2; emoji?: string; why?: Bi2 }
export function OrderTask({ steps, run, accent, onDone, points = 4, shuffleKey = 0 }: {
  steps: OrderStep[]; run: Run; accent: string; onDone?: () => void; points?: number; shuffleKey?: number;
}) {
  const L = useLang();
  const [slots, setSlots] = useState<(string | null)[]>(() => steps.map(() => null));
  const { toast, say } = useToast();
  const shuffled = useShuffled(steps, shuffleKey + 3);
  const free = shuffled.filter((s) => !slots.includes(s.id));
  const nextIdx = slots.findIndex((s) => s === null);

  useEffect(() => {
    if (slots.every(Boolean)) {
      say('ok', L('Perfect sequence!', 'सही क्रम!'));
      onDone?.();
    }
    /* eslint-disable-next-line */
  }, [slots]);

  const drop = (zone: string | null, id: string) => {
    if (!zone || !zone.startsWith('slot-')) return;
    const idx = parseInt(zone.slice(5), 10);
    if (slots[idx]) return;
    const st = steps.find((s) => s.id === id)!;
    if (steps[idx].id === id) {
      setSlots((a) => a.map((v, i) => (i === idx ? id : v)));
      run.add(points);
      playClickSound('success');
      say('ok', st.why ? L(st.why.en, st.why.hi) : L('Correct step!', 'सही चरण!'));
    } else {
      run.miss();
      playClickSound('error');
      say('bad', L(`Not yet — "${st.label.en}" does not come at step ${idx + 1}.`, `अभी नहीं — "${st.label.hi}" चरण ${idx + 1} पर नहीं आता।`));
    }
  };

  const handleStepClick = (stepId: string) => {
    playClickSound('neutral');
    if (nextIdx >= 0) {
      drop(`slot-${nextIdx}`, stepId);
    }
  };

  const hint = () => {
    run.hint();
    if (nextIdx >= 0) {
      say('info', L(`Step ${nextIdx + 1} is: ${steps[nextIdx].label.en}`, `चरण ${nextIdx + 1}: ${steps[nextIdx].label.hi}`));
    }
  };

  return (
    <div className="space-y-4" data-testid="order-task">
      <div className="space-y-2">
        {steps.map((s, i) => (
          <DropZone key={s.id} id={`slot-${i}`} className={`rounded-2xl border-2 border-dashed px-4 py-2.5 flex items-center gap-3 min-h-[54px] transition-all ${i === nextIdx ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
            style={{ borderColor: slots[i] ? '#22c55e' : i === nextIdx ? accent : withAlpha(accent, 0.3), background: slots[i] ? 'rgba(34,197,94,.1)' : i === nextIdx ? withAlpha(accent, 0.08) : withAlpha(accent, 0.03) }}>
            <span className="w-8 h-8 rounded-full text-white text-sm font-bold grid place-items-center flex-shrink-0 shadow-xs" style={{ background: slots[i] ? '#16a34a' : accent }}>{i + 1}</span>
            {slots[i] ? (
              <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span> {L(s.label.en, s.label.hi)}
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-slate-400 font-medium">
                {i === nextIdx ? L('👉 Place next step here (drag or tap step below)', '👉 अगला चरण यहाँ रखें (खींचें या नीचे चरण छुएँ)') : L('Drop step here', 'चरण यहाँ छोड़ें')}
              </span>
            )}
          </DropZone>
        ))}
      </div>
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-3 flex flex-wrap gap-2.5 min-h-[64px] items-center" data-testid="tray">
        {free.map((s) => (
          <div key={s.id} onClick={() => handleStepClick(s.id)} className="cursor-pointer">
            <DragChip id={s.id} onDrop={drop} className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm text-xs sm:text-sm font-semibold hover:border-blue-500 hover:scale-[1.02] transition-all">
              <span className="text-xl mr-1.5 align-middle">{s.emoji}</span>{L(s.label.en, s.label.hi)}
            </DragChip>
          </div>
        ))}
        {free.length === 0 && <span className="text-sm text-green-600 dark:text-green-400 font-bold">🎉 {L('All steps sequenced perfectly!', 'सभी चरण सही क्रम में लग गए!')}</span>}
      </div>
      <div className="flex items-center justify-between gap-3">
        <HintButton onHint={hint} accent={accent} />
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{L('Tap a step to slot it in, or drag to slot', 'चरण को छूकर क्रम में लगाएँ, या खींचें')}</span>
      </div>
      <Toast {...toast} />
    </div>
  );
}

export interface ChoiceQ { q: Bi2; options: Bi2[]; correct: number; why: Bi2; scene?: string }
export function ChoiceTask({ qs, run, accent, onDone, points = 5 }: { qs: ChoiceQ[]; run: Run; accent: string; onDone?: () => void; points?: number }) {
  const L = useLang();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const { toast, say } = useToast();
  const q = qs[i];

  const choose = (k: number) => {
    if (pick !== null) return;
    setPick(k);
    if (k === q.correct) {
      run.add(points);
      playClickSound('success');
      say('ok', L(q.why.en, q.why.hi));
    } else {
      run.miss();
      playClickSound('error');
      say('bad', L(`Not quite. ${q.why.en}`, `बिल्कुल नहीं। ${q.why.hi}`));
    }
  };

  const next = () => {
    playClickSound('neutral');
    if (i + 1 >= qs.length) {
      onDone?.();
      return;
    }
    setI(i + 1);
    setPick(null);
    say('info', null);
  };

  const hint = () => {
    run.hint();
    say('info', L('Re-read the situation: which option keeps food and people safest?', 'स्थिति दोबारा पढ़ें: कौन-सा विकल्प भोजन और लोगों को सबसे सुरक्षित रखता है?'));
  };

  return (
    <div className="space-y-4" data-testid="choice-task">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-500 dark:text-slate-400">
        <span>{L('Question', 'प्रश्न')} {i + 1}/{qs.length}</span>
      </div>
      {q.scene && <div className="text-4xl sm:text-5xl text-center py-2">{q.scene}</div>}
      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">{L(q.q.en, q.q.hi)}</p>
      <div className="grid gap-2.5">
        {q.options.map((o, k) => {
          const st = pick === null ? '' : k === q.correct ? 'right' : k === pick ? 'wrong' : 'dim';
          return (
            <button key={k} onClick={() => choose(k)} data-opt={k}
              className={`text-left text-xs sm:text-sm px-4 py-3 rounded-xl border transition-all font-medium leading-relaxed ${st === 'right' ? 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-200' : st === 'wrong' ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200' : st === 'dim' ? 'opacity-50 border-slate-200' : 'border-slate-300 hover:border-blue-400 bg-white dark:bg-slate-900'}`}>
              {L(o.en, o.hi)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        {pick === null ? <HintButton onHint={hint} accent={accent} /> : <button onClick={next} data-testid="next-q" className="px-5 py-2.5 rounded-xl text-white text-sm sm:text-base font-bold shadow-md transition-all active:scale-95" style={{ background: accent }}>{i + 1 >= qs.length ? L('Finish', 'पूर्ण') : L('Next', 'अगला')} →</button>}
      </div>
      <Toast {...toast} />
    </div>
  );
}

/** Convenience: tracks which tabs/tasks are completed and fires finish when all are done. */
export function useDoneSet(total: number, run: Run) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const mark = (k: string) => setDone((s) => (s.has(k) ? s : new Set(s).add(k)));
  const all = done.size >= total;
  useEffect(() => { if (all) run.finish(); /* eslint-disable-next-line */ }, [all]);
  const reset = () => setDone(new Set());
  return { done, mark, all, reset, count: done.size };
}
export function useStable<T>(v: T) { return useMemo(() => v, []); } // eslint-disable-line
