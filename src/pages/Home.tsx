import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, FlaskConical, Trophy, Zap, Layers } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useDict } from '@/translations';
import { FOOD2_UNITS } from '@/data/units';
import { FOOD2_THEMES } from '@/data/themes';
import { STAGES } from '@/pages/stages';
import type { Bi } from '@/data/types';
import { withAlpha } from '@/components/color';
import { playClickSound } from '@/utils/sound';
import logo from '@/assets/logo.svg';

export default function Home() {
  const { language, completedLessons, xp } = useStore();
  const t = useDict();
  const hi = language === 'hi';
  const L = (b: Bi) => (hi ? b.hi : b.en);
  const total = FOOD2_UNITS.length;
  const doneUnits = FOOD2_UNITS.filter((u) => completedLessons.includes(`food2-${u.id}`)).length;
  const doneSims = FOOD2_UNITS.filter((u) => completedLessons.includes(`m2sim-${u.simId}`)).length;
  const next = FOOD2_UNITS.find((u) => !completedLessons.includes(`food2-${u.id}`)) ?? FOOD2_UNITS[0];
  const started = completedLessons.length > 0;

  const sections: { label: Bi; units: typeof FOOD2_UNITS }[] = [];
  FOOD2_UNITS.forEach((u) => {
    let g = sections.find((s) => s.label.en === u.section.en);
    if (!g) {
      g = { label: u.section, units: [] };
      sections.push(g);
    }
    g.units.push(u);
  });

  const stats = [
    { Icon: Layers, label: t.home.unitsDone, value: `${doneUnits}/${total}` },
    { Icon: FlaskConical, label: t.home.simsDone, value: `${doneSims}/${total}` },
    { Icon: Zap, label: t.home.xp, value: String(xp) },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 animate-rise" data-testid="module2-home">
      {/* Hero Banner */}
      <section
        className="relative overflow-hidden rounded-3xl p-5 sm:p-9 text-white shadow-xl shadow-blue-900/10"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)' }}
      >
        <div
          aria-hidden
          className="absolute -right-10 -top-10 w-72 h-72 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #93c5fd, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute right-4 sm:right-6 bottom-3 sm:bottom-4 text-[80px] sm:text-[130px] leading-none opacity-[0.14] select-none pointer-events-none"
        >
          🍳
        </div>
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <img src={logo} alt="" className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-md bg-white p-1" />
            <span className="eyebrow bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
              {t.home.kicker}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold leading-[1.15] text-white">
            {t.home.title}
          </h1>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-blue-100 leading-relaxed font-normal">
            {t.home.subtitle(total)}
          </p>
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={`/unit/${next.id}`}
              onClick={() => playClickSound('click')}
              data-testid="start-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm sm:text-base transition-all shadow-md active:scale-95"
            >
              {started ? t.home.resume : t.home.start} <ArrowRight size={16} />
            </Link>
            <span className="text-xs sm:text-sm text-blue-100/90 font-medium">
              {t.unit.module} · {t.home.unitWord} {next.id}: {L(next.title)}
            </span>
          </div>
        </div>

        {/* Quick Progress Stats */}
        <div className="relative mt-7 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-4 max-w-xl">
          {stats.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-white/15 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 ring-1 ring-white/20">
              <Icon size={18} className="text-white" />
              <p className="font-mono font-extrabold text-base sm:text-xl leading-tight mt-1 text-white">{value}</p>
              <p className="text-[11px] sm:text-xs text-blue-100 leading-tight font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="relative mt-5 sm:mt-6 max-w-xl">
          <div className="flex justify-between text-xs sm:text-sm text-blue-100 mb-1.5 font-semibold">
            <span>{t.home.progress}</span>
            <span className="font-mono font-bold">{Math.round((doneUnits / total) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-300 shadow-sm"
              style={{ width: `${(doneUnits / total) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* 7-Stage Pedagogy Overview */}
      <section aria-label={t.home.stages} className="space-y-3">
        <p className="eyebrow text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold tracking-wider">
          {t.home.stages}
        </p>
        <ol className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
          {STAGES.map((s, i) => (
            <li
              key={s.key}
              className="card bg-white dark:bg-slate-900 flex-shrink-0 px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 min-w-[135px] sm:min-w-[145px] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all rounded-2xl"
            >
              <span className="grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <s.Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-500 font-bold">0{i + 1}</p>
                <p className="text-xs sm:text-sm font-bold leading-tight text-slate-800 dark:text-slate-200 truncate">
                  {t.stages[s.key].name}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Curriculum Units by Section */}
      {sections.map((sec) => (
        <section key={sec.label.en} className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {L(sec.label)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sec.units.map((u, idx) => {
              const th = FOOD2_THEMES[u.themeKey];
              const Icon = th.Icon;
              const done = completedLessons.includes(`food2-${u.id}`);
              const simDone = completedLessons.includes(`m2sim-${u.simId}`);
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link
                    to={`/unit/${u.id}`}
                    onClick={() => playClickSound('click')}
                    data-testid={`unit-card-${u.id}`}
                    className="card-hover block overflow-hidden h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl active:scale-[0.99]"
                  >
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${th.accent}, ${th.accent2})` }} />
                    <div className="p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 bg-white dark:bg-slate-900">
                      <span
                        className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${th.accent}, ${th.accent2})` }}
                      >
                        <Icon size={24} strokeWidth={2.2} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-bold text-sm sm:text-base leading-snug text-slate-900 dark:text-white">
                            {u.id}. {L(u.title)}
                          </h3>
                          {done && (
                            <span className="chip bg-green-500/15 text-green-700 dark:text-green-400 flex-shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                              <Check size={12} /> {t.home.done}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {L(u.desc)}
                        </p>
                        <div className="flex items-center gap-2 mt-3.5 text-xs sm:text-sm font-bold" style={{ color: th.accent }}>
                          <FlaskConical size={15} /> {t.home.sim}
                          {simDone && (
                            <span
                              className="chip ml-1.5 px-2.5 py-0.5 text-xs font-bold rounded-lg"
                              style={{ background: withAlpha(th.accent, 0.12) }}
                            >
                              <Trophy size={13} /> {t.home.simDone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
