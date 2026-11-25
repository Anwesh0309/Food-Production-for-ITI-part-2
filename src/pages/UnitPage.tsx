import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useDict } from '@/translations';
import { getUnit2 } from '@/data/units';
import type { Bi } from '@/data/types';
import { getFood2Sim } from '@/simulations';
import { FOOD2_THEMES } from '@/data/themes';
import { withAlpha } from '@/components/color';
import { STAGES } from '@/pages/stages';
import { playClickSound } from '@/utils/sound';
import {
  Check, X, Send, RotateCcw, SearchX, ListChecks, Sigma, Target, BookMarked, ShieldAlert, Globe, Lightbulb, PartyPopper,
  Play, Pause, ChevronLeft, ChevronRight, RefreshCw, Wrench, ArrowLeft, ArrowRight,
} from 'lucide-react';

export default function UnitPage() {
  const { id } = useParams<{ id: string }>();
  const { language, setLanguage, addXP, completeLesson, completedLessons, labAttempts } = useStore();
  const t = useDict();
  const [stage, setStage] = useState(0);
  const hi = language === 'hi';
  const L = (b: Bi) => (hi ? b.hi : b.en);
  const unitId = parseInt(id ?? '', 10);
  const unit = getUnit2(unitId);

  // Watch
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Practice
  const [ticked, setTicked] = useState<number[]>([]);
  // Quiz
  const [qa, setQa] = useState<Record<number, number>>({});
  const [qs, setQs] = useState(false);
  // Apply
  const [sa, setSa] = useState<Record<number, number>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLanguage('hi');
    setStage(0);
    setStep(0);
    setPlaying(false);
    setTicked([]);
    setQa({});
    setQs(false);
    setSa({});
  }, [unitId, setLanguage]);

  useEffect(() => {
    if (!unit) return;
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= unit.watch.length) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 3200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, unit]);

  // Mark watch complete when reaching the end of watch steps
  useEffect(() => {
    if (unit && step === unit.watch.length - 1 && stage === 0 && !completedLessons.includes(`food2-${unitId}-watch`)) {
      completeLesson(`food2-${unitId}-watch`);
    }
  }, [step, stage, unit, unitId, completedLessons, completeLesson]);

  // Auto-mark read complete when visiting Read stage
  useEffect(() => {
    if (unit && stage === 1 && !completedLessons.includes(`food2-${unitId}-read`)) {
      completeLesson(`food2-${unitId}-read`);
      addXP(5);
    }
  }, [stage, unit, unitId, completedLessons, completeLesson, addXP]);

  if (!unit) {
    return (
      <div className="text-center py-16">
        <SearchX className="w-14 h-14 mx-auto mb-4 text-stone-300" />
        <h2 className="text-xl font-bold mb-2">{t.unit.notFound}</h2>
        <Link to="/" className="btn-primary text-sm px-4 py-2 mt-4 inline-block">← {t.unit.back}</Link>
      </div>
    );
  }

  const th = FOOD2_THEMES[unit.themeKey];
  const HeaderIcon = th.Icon;
  const ActiveIcon = STAGES[stage].Icon;
  const sk = STAGES[stage].key;
  const Sim = getFood2Sim(unit.simId);

  const done = (k: string) => completedLessons.includes(k);
  const isCompleted = done(`food2-${unitId}`);
  const simDone = done(`m2sim-${unit.simId}`);
  const bestSim = Math.max(0, ...labAttempts.filter((a) => a.labId === unit.simId).map((a) => a.score));
  const correct = unit.mcqs.reduce((a, q, i) => a + (qa[i] === q.correct ? 1 : 0), 0);
  const quizScore = unit.mcqs.length ? Math.round((correct / unit.mcqs.length) * 100) : 0;
  const applyDone = Object.keys(sa).length >= unit.scenarios.length;

  const submitQuiz = () => {
    setQs(true);
    if (quizScore >= 60) {
      playClickSound('success');
      if (!done(`food2-${unitId}-quiz`)) {
        addXP(25);
        completeLesson(`food2-${unitId}-quiz`);
      }
    } else {
      playClickSound('error');
    }
  };

  const tick = (i: number) => {
    setTicked((t) => {
      const n = t.includes(i) ? t.filter((x) => x !== i) : [...t, i];
      if (n.length === unit.practice.length && !done(`food2-${unitId}-practice`)) {
        playClickSound('success');
        completeLesson(`food2-${unitId}-practice`);
        addXP(10);
      } else {
        playClickSound('click');
      }
      return n;
    });
  };

  const answerScenario = (i: number, k: number) => {
    if (sa[i] !== undefined) return;
    const n = { ...sa, [i]: k };
    setSa(n);
    if (k === unit.scenarios[i].correct) {
      playClickSound('success');
    } else {
      playClickSound('error');
    }
    if (Object.keys(n).length >= unit.scenarios.length && !done(`food2-${unitId}-apply`)) {
      completeLesson(`food2-${unitId}-apply`);
      addXP(10);
    }
  };

  const complete = () => {
    playClickSound('success');
    addXP(50);
    completeLesson(`food2-${unitId}`);
  };

  const goToStage = (idx: number) => {
    playClickSound('click');
    setStage(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stageDone = [
    done(`food2-${unitId}-watch`),
    done(`food2-${unitId}-read`),
    done(`food2-${unitId}-practice`),
    simDone,
    done(`food2-${unitId}-quiz`),
    done(`food2-${unitId}-apply`),
    isCompleted,
  ];

  const w = unit.watch[step];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="module2-detail">
      {/* Unit Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <Link
            to="/"
            onClick={() => playClickSound('click')}
            className="mt-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-2xl font-bold p-1 flex-shrink-0"
            title={t.unit.back}
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span
                className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 shadow-sm"
                style={{ background: withAlpha(th.accent, 0.15), color: th.accent }}
              >
                <HeaderIcon size={26} strokeWidth={2.3} />
              </span>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-slate-900 dark:text-white truncate">
                  {L(unit.title)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {t.unit.module} • {t.home.unitWord} {unitId} • {L(unit.section)}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed">
              {L(unit.desc)}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t.unit.syllabus}: {L(unit.syllabus)}
            </p>
          </div>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm px-3.5 py-1.5 rounded-xl bg-green-500/15 text-green-700 dark:text-green-400 font-bold self-start flex-shrink-0 shadow-xs">
            <Check size={14} /> {t.unit.completed}
          </span>
        )}
      </div>

      {/* Stage Navigation Pills */}
      <div className="card p-2 sm:p-3">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1" role="tablist">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={stage === i}
              data-stage={s.key}
              onClick={() => goToStage(i)}
              className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95"
              style={stage === i ? { background: th.accent, color: '#fff', boxShadow: `0 4px 14px ${withAlpha(th.accent, 0.35)}` } : {}}
            >
              <s.Icon size={16} className={stage === i ? '' : 'text-slate-500'} />
              <span className={stage === i ? '' : 'text-slate-700 dark:text-slate-300'}>{t.stages[s.key].name}</span>
              {i < 7 && stageDone[i] && (
                <Check size={13} className={stage === i ? 'text-white' : 'text-green-500'} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Body Card */}
      <div className="card p-4 sm:p-7 space-y-6">
        <h2 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          <ActiveIcon size={22} style={{ color: th.accent }} />
          <span>{t.stages[sk].name}</span>
          <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400">— {t.stages[sk].desc}</span>
        </h2>

        {/* 1. Watch Phase */}
        {stage === 0 && (
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6 sm:p-8 text-center text-white relative min-h-[280px] grid place-items-center shadow-md"
              style={{ background: `linear-gradient(135deg, ${withAlpha(th.accent, 0.95)}, ${withAlpha(th.accent2, 0.9)})` }}
              data-testid="watch-stage"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-xl py-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="text-6xl sm:text-7xl mb-3 select-none"
                  >
                    {w.icon}
                  </motion.div>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-white/85 font-bold">
                    {t.unit.step} {step + 1} / {unit.watch.length}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold mt-1.5 leading-tight text-white" data-testid="watch-title">
                    {L(w.title)}
                  </h3>
                  <p className="text-sm sm:text-base text-white/95 mt-2.5 leading-relaxed font-medium">
                    {L(w.text)}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Watch Player Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => { playClickSound('click'); setStep((s) => Math.max(0, s - 1)); }}
                  disabled={step === 0}
                  data-testid="watch-prev"
                  className="btn-secondary p-2.5 sm:p-3 rounded-xl disabled:opacity-30"
                  aria-label="previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => {
                    playClickSound('click');
                    if (step >= unit.watch.length - 1) setStep(0);
                    setPlaying((p) => !p);
                  }}
                  data-testid="watch-play"
                  className="btn-primary px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-xl inline-flex items-center gap-2 shadow-sm"
                  style={{ background: th.accent }}
                >
                  {playing ? <Pause size={18} /> : <Play size={18} />} {playing ? t.unit.pause : t.unit.play}
                </button>
                <button
                  onClick={() => { playClickSound('click'); setStep((s) => Math.min(unit.watch.length - 1, s + 1)); }}
                  disabled={step >= unit.watch.length - 1}
                  data-testid="watch-next"
                  className="btn-secondary p-2.5 sm:p-3 rounded-xl disabled:opacity-30"
                  aria-label="next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap">
                {unit.watch.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { playClickSound('click'); setStep(i); }}
                    aria-label={`step ${i + 1}`}
                    className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full transition-all"
                    style={{ background: i === step ? th.accent : withAlpha(th.accent, 0.25) }}
                  />
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div className="rounded-2xl p-5" style={{ background: withAlpha(th.accent, 0.08) }}>
              <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2" style={{ color: th.accent }}>
                <Target size={18} /> {t.unit.objectives}
              </h3>
              <ul className="space-y-2">
                {unit.objectives.map((o, i) => (
                  <li key={i} className="text-sm sm:text-base flex items-start gap-2.5 text-slate-800 dark:text-slate-200 leading-relaxed">
                    <span style={{ color: th.accent }} className="mt-0.5 font-bold">•</span> {L(o)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Topics */}
            <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                <ListChecks size={18} /> {t.unit.keyTopics}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {unit.keyTopics.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl shadow-2xs"
                    style={{ background: withAlpha(th.accent, 0.12), color: th.accent }}
                  >
                    {L(t)}
                  </span>
                ))}
              </div>
            </div>

            {/* Advance to Read */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => goToStage(1)}
                className="btn-primary text-sm sm:text-base font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-sm"
                style={{ background: th.accent }}
              >
                {t.stages.read.name} →
              </button>
            </div>
          </div>
        )}

        {/* 2. Read / Theory Phase */}
        {stage === 1 && (
          <div className="space-y-6">
            <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-normal">
              {L(unit.theory)}
            </div>

            {unit.terminology.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <BookMarked size={18} /> {t.unit.terminology}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {unit.terminology.map((t, i) => (
                    <div key={i} className="rounded-2xl p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                      <p className="text-sm sm:text-base font-bold" style={{ color: th.accent }}>{L(t.term)}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{L(t.def)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unit.formulas && unit.formulas.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <Sigma size={18} /> {t.unit.formulas}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {unit.formulas.map((f, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-5 border"
                      style={{ background: withAlpha(th.accent, 0.06), borderColor: withAlpha(th.accent, 0.25) }}
                    >
                      <p className="text-xs sm:text-sm font-bold mb-1" style={{ color: th.accent }}>{L(f.name)}</p>
                      <p className="font-mono text-base sm:text-lg font-extrabold text-slate-900 dark:text-white break-words">{f.formula}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{L(f.desc)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advance to Practice */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => goToStage(2)}
                className="btn-primary text-sm sm:text-base font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-sm"
                style={{ background: th.accent }}
              >
                {t.stages.practice.name} →
              </button>
            </div>
          </div>
        )}

        {/* 3. Practice Phase */}
        {stage === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                {t.unit.practiceHelp}
              </p>
              <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                {ticked.length}/{unit.practice.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {unit.practice.map((p, i) => {
                const on = ticked.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => tick(i)}
                    data-practice={i}
                    className={`w-full text-left flex items-start gap-3 rounded-xl p-3.5 border transition-all active:scale-[0.99] ${
                      on
                        ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <span
                      className="grid place-items-center w-7 h-7 rounded-full text-xs font-bold text-white flex-shrink-0 shadow-xs"
                      style={{ background: on ? '#16a34a' : th.accent }}
                    >
                      {on ? <Check size={14} /> : i + 1}
                    </span>
                    <p className={`text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-snug ${on ? 'line-through opacity-70' : ''}`}>
                      {L(p)}
                    </p>
                  </button>
                );
              })}
            </div>

            {ticked.length === unit.practice.length && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex flex-wrap items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200"
              >
                <div className="font-bold text-sm">
                  ✓ {hi ? 'सभी प्रायोगिक कार्य सत्यापित! सिमुलेशन पर आगे बढ़ें।' : 'All practical tasks verified! Proceed to hands-on Simulation.'}
                </div>
                <button
                  onClick={() => goToStage(3)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
                >
                  {t.stages.simulate.name} →
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* 4. Simulation Phase */}
        {stage === 3 && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {t.unit.simHelp}
            </p>
            {Sim ? (
              <Suspense fallback={<div className="py-12 text-center text-base text-slate-400">{t.unit.loadingSim}</div>}>
                <Sim />
              </Suspense>
            ) : (
              <div className="text-center py-10 text-base text-slate-400">{t.unit.simMissing}</div>
            )}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => goToStage(4)}
                className="btn-primary text-sm sm:text-base font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-sm"
                style={{ background: th.accent }}
              >
                {t.stages.quiz.name} →
              </button>
            </div>
          </div>
        )}

        {/* 5. Quiz Phase */}
        {stage === 4 && (
          <div className="space-y-5">
            {unit.mcqs.map((q, qi) => (
              <div
                key={qi}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900 shadow-2xs"
              >
                <p className="font-bold text-sm sm:text-base leading-snug text-slate-900 dark:text-white">
                  {hi ? `${t.unit.question}${qi + 1}: ${q.q.hi}` : `${t.unit.question}${qi + 1}: ${q.q.en}`}
                </p>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const sel = qa[qi] === oi;
                    const ok = qs && oi === q.correct;
                    const bad = qs && sel && oi !== q.correct;
                    return (
                      <button
                        key={oi}
                        data-q={`${qi}-${oi}`}
                        onClick={() => {
                          if (!qs) {
                            playClickSound('click');
                            setQa({ ...qa, [qi]: oi });
                          }
                        }}
                        disabled={qs}
                        className={`text-left text-xs sm:text-sm px-4 py-3 rounded-xl border transition-all font-medium leading-relaxed active:scale-[0.99] ${
                          ok
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200 font-bold'
                            : bad
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 font-bold'
                            : sel
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                        {L(opt)}
                        {ok && <Check size={16} className="inline ml-2 text-green-600" />}
                        {bad && <X size={16} className="inline ml-2 text-red-600" />}
                      </button>
                    );
                  })}
                </div>
                {qs && (
                  <div
                    className={`mt-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2 ${
                      qa[qi] === q.correct
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <Lightbulb size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{L(q.explanation)}</span>
                  </div>
                )}
              </div>
            ))}

            {!qs ? (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(qa).length < unit.mcqs.length}
                data-testid="quiz-submit"
                className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base font-bold px-6 py-2.5 rounded-xl disabled:opacity-40 shadow-md active:scale-95"
              >
                <Send size={16} /> {t.unit.submit}
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100" data-testid="quiz-score">
                  {t.unit.score}: <span className="font-mono text-blue-600 dark:text-blue-400">{correct}/{unit.mcqs.length}</span> ({quizScore}%)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound('click');
                      setQs(false);
                      setQa({});
                    }}
                    data-testid="quiz-retry"
                    className="btn-secondary inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs active:scale-95"
                  >
                    <RotateCcw size={15} /> {t.unit.tryAgain}
                  </button>
                  {quizScore >= 60 && (
                    <button
                      onClick={() => goToStage(5)}
                      className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs active:scale-95"
                      style={{ background: th.accent }}
                    >
                      {t.stages.apply.name} →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Apply & Safety Phase */}
        {stage === 5 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <Globe size={18} /> {t.unit.decisions}
              </h3>
              <div className="space-y-4">
                {unit.scenarios.map((s, i) => {
                  const picked = sa[i];
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-4 sm:p-5 border space-y-3"
                      style={{ background: withAlpha(th.accent2, 0.06), borderColor: withAlpha(th.accent2, 0.25) }}
                    >
                      <div className="text-4xl sm:text-5xl select-none">{s.scene}</div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {L(s.q)}
                      </p>
                      <div className="grid gap-2">
                        {s.options.map((o, k) => {
                          const ok = picked !== undefined && k === s.correct;
                          const bad = picked === k && k !== s.correct;
                          return (
                            <button
                              key={k}
                              data-scn={`${i}-${k}`}
                              onClick={() => answerScenario(i, k)}
                              disabled={picked !== undefined}
                              className={`text-left text-xs sm:text-sm px-4 py-3 rounded-xl border font-medium transition-all active:scale-[0.99] ${
                                ok
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-200 font-bold'
                                  : bad
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-bold'
                                  : picked !== undefined
                                  ? 'opacity-50 border-slate-200 dark:border-slate-800'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-400'
                              }`}
                            >
                              {L(o)}
                            </button>
                          );
                        })}
                      </div>
                      {picked !== undefined && (
                        <p
                          className={`mt-2.5 text-xs sm:text-sm font-semibold p-2.5 rounded-xl ${
                            picked === s.correct
                              ? 'bg-green-100 dark:bg-green-950/50 text-green-900 dark:text-green-200 border border-green-300 dark:border-green-800'
                              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {picked === s.correct ? '✔ ' : '✘ '}
                          {L(s.why)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {applyDone && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  <span>✓ {t.unit.allDecisions}</span>
                  <button
                    onClick={() => goToStage(6)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    {t.stages.review.name} →
                  </button>
                </div>
              )}
            </div>

            {/* Safety Guidelines */}
            <div className="space-y-3">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldAlert size={18} className="text-rose-500" /> {t.unit.safety}
              </h3>
              <div className="space-y-2">
                {unit.safety.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40"
                  >
                    <ShieldAlert size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-200 font-medium leading-relaxed">
                      {L(s)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Applications */}
            <div className="space-y-3">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <Wrench size={18} /> {t.unit.applications}
              </h3>
              <div className="flex flex-wrap gap-2">
                {unit.applications.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {L(a)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. Review & Complete Phase */}
        {stage === 6 && (
          <div className="space-y-5">
            <div
              className="rounded-2xl p-5 border"
              style={{ background: withAlpha(th.accent, 0.07), borderColor: withAlpha(th.accent, 0.25) }}
            >
              <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center gap-2" style={{ color: th.accent }}>
                <RefreshCw size={18} /> {t.unit.summary}
              </h3>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {L(unit.review)}
              </p>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs" data-testid="performance">
              <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                <ListChecks size={18} /> {t.unit.performance}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {[
                  [t.unit.perfWatch, stageDone[0]],
                  [t.unit.perfPractice, stageDone[2]],
                  [`${t.unit.perfSim}${bestSim ? ` — ${t.unit.best} ${bestSim}%` : ''}`, stageDone[3]],
                  [t.unit.perfQuiz, stageDone[4]],
                  [t.unit.perfApply, stageDone[5]],
                ].map(([lbl, ok], i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full grid place-items-center text-white text-xs font-bold ${
                        ok ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      {ok ? <Check size={12} /> : ''}
                    </span>
                    <span className={ok ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500'}>
                      {lbl as string}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
              <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                <ListChecks size={18} /> {t.unit.takeaways}
              </h3>
              <ul className="space-y-2">
                {unit.keyTopics.map((t, i) => (
                  <li key={i} className="text-xs sm:text-sm flex items-start gap-2 leading-relaxed">
                    <span className="font-bold" style={{ color: th.accent }}>{i + 1}.</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{L(t)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!isCompleted ? (
              <button
                onClick={complete}
                data-testid="complete-unit"
                className="btn-primary text-sm sm:text-base font-bold px-7 py-3 flex items-center gap-2 mx-auto rounded-xl shadow-md active:scale-95 transition-all"
                style={{ background: th.accent }}
              >
                <Check size={18} /> {t.unit.completeUnit}
              </button>
            ) : (
              <div
                className="text-center p-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl shadow-xs"
                data-testid="unit-complete"
              >
                <PartyPopper className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm sm:text-base font-bold text-green-800 dark:text-green-300">
                  {t.unit.unitDone}
                </p>
              </div>
            )}

            {unitId < 10 && (
              <div className="text-center pt-2">
                <Link
                  to={`/unit/${unitId + 1}`}
                  onClick={() => playClickSound('click')}
                  className="text-sm sm:text-base font-bold underline transition hover:opacity-80"
                  style={{ color: th.accent }}
                >
                  {t.unit.nextUnit} →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stage Bottom Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => goToStage(Math.max(0, stage - 1))}
          disabled={stage === 0}
          className="btn-secondary text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl disabled:opacity-30 inline-flex items-center gap-1.5 active:scale-95"
        >
          <ArrowLeft size={16} /> {t.unit.previous}
        </button>
        <button
          onClick={() => goToStage(Math.min(STAGES.length - 1, stage + 1))}
          disabled={stage === STAGES.length - 1}
          data-testid="stage-next"
          className="btn-primary text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl disabled:opacity-30 inline-flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          {t.unit.next} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
