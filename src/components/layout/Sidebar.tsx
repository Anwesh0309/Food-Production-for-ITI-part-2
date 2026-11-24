import { Link, NavLink } from 'react-router-dom';
import { Check, Home, RotateCcw, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useDict } from '@/translations';
import { FOOD2_UNITS } from '@/data/units';
import { FOOD2_THEMES } from '@/data/themes';
import { withAlpha } from '@/components/color';
import { playClickSound } from '@/utils/sound';
import logo from '@/assets/logo.svg';

export default function Sidebar() {
  const { language, sidebarOpen, setSidebar, completedLessons, resetProgress } = useStore();
  const t = useDict();
  const hi = language === 'hi';
  const done = FOOD2_UNITS.filter((u) => completedLessons.includes(`food2-${u.id}`)).length;
  const pct = Math.round((done / FOOD2_UNITS.length) * 100);

  const handleClose = () => {
    setSidebar(false);
    playClickSound('click');
  };

  const handleReset = () => {
    playClickSound('click');
    if (window.confirm(t.nav.resetProgress + '?')) {
      resetProgress();
      playClickSound('success');
    }
  };

  return (
    <aside
      data-testid="sidebar"
      aria-hidden={!sidebarOpen}
      className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-transform duration-200 shadow-sm ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <Link to="/" onClick={() => playClickSound('click')} className="flex items-center gap-3 min-w-0 flex-1">
          <img src={logo} alt="" className="w-10 h-10 rounded-xl shadow-md bg-white p-0.5" />
          <div className="min-w-0">
            <p className="font-display font-bold text-sm sm:text-base leading-tight text-slate-900 dark:text-white">
              {t.appName}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
              {t.appSub}
            </p>
          </div>
        </Link>
        <button
          onClick={handleClose}
          aria-label={t.nav.closeMenu}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 lg:hidden active:scale-95 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLink
          to="/"
          end
          onClick={() => playClickSound('click')}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.99] ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400'
            }`
          }
        >
          <Home size={16} /> {t.nav.home}
        </NavLink>

        <p className="eyebrow text-blue-600 dark:text-blue-400 px-3 pt-3 pb-1 text-xs font-bold tracking-wider">
          {t.nav.unit}
        </p>

        {FOOD2_UNITS.map((u) => {
          const th = FOOD2_THEMES[u.themeKey];
          const Icon = th.Icon;
          const ok = completedLessons.includes(`food2-${u.id}`);
          return (
            <NavLink
              key={u.id}
              to={`/unit/${u.id}`}
              onClick={() => playClickSound('click')}
              data-testid={`nav-unit-${u.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm leading-tight font-medium transition-all active:scale-[0.99] ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700'
                    : 'hover:bg-slate-50 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-blue-300'
                }`
              }
            >
              <span
                className="grid place-items-center w-7 h-7 rounded-lg flex-shrink-0"
                style={{ background: withAlpha(th.accent2, 0.15), color: th.accent }}
              >
                <Icon size={14} />
              </span>
              <span className="flex-1 min-w-0 truncate">
                {u.id}. {hi ? u.title.hi : u.title.en}
              </span>
              {ok && <Check size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 font-bold" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 space-y-2.5">
        <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
          <span>{t.nav.progress}</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {done}/{FOOD2_UNITS.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          onClick={handleReset}
          data-testid="reset-progress"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
        >
          <RotateCcw size={13} /> {t.nav.resetProgress}
        </button>
      </div>
    </aside>
  );
}
