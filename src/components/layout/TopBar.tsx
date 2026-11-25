import { Link } from 'react-router-dom';
import { Menu, Moon, Sun, Volume2, VolumeX, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useDict } from '@/translations';
import { playClickSound } from '@/utils/sound';
import logo from '@/assets/logo.svg';

export default function TopBar() {
  const { language, setLanguage, theme, toggleTheme, sidebarOpen, setSidebar, xp, soundEnabled, toggleSound } = useStore();
  const t = useDict();

  const handleToggleSound = () => {
    toggleSound();
    playClickSound('click');
  };

  const handleToggleTheme = () => {
    toggleTheme();
    playClickSound('click');
  };

  const handleSetLang = (l: 'en' | 'hi') => {
    setLanguage(l);
    playClickSound('click');
  };

  const handleToggleSidebar = () => {
    setSidebar(!sidebarOpen);
    playClickSound('click');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs transition-colors">
      <div className="h-16 px-2.5 sm:px-6 flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleToggleSidebar}
          aria-label={sidebarOpen ? t.nav.closeMenu : t.nav.openMenu}
          data-testid="menu-btn"
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors flex-shrink-0 active:scale-95"
        >
          <Menu size={20} />
        </button>

        {!sidebarOpen && (
          <Link to="/" className="flex items-center gap-2 min-w-0 flex-shrink-0" aria-label="Home">
            <img src={logo} alt="" className="w-8 h-8 rounded-lg shadow-xs" />
            <span className="hidden sm:inline font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {t.appName} · M2
            </span>
          </Link>
        )}

        <div className="flex-1" />

        <span
          className="chip whitespace-nowrap flex-shrink-0 bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80 font-bold text-xs sm:text-sm px-2.5 sm:px-3 py-1 rounded-xl shadow-2xs"
          data-testid="xp-chip"
        >
          <Zap size={14} className="text-blue-600 fill-blue-600 dark:text-blue-400 dark:fill-blue-400" /> {xp} XP
        </span>

        <div className="inline-flex flex-shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-bold shadow-2xs" role="group" aria-label={t.nav.language}>
          {(['hi', 'en'] as const).map((l) => (
            <button
              key={l}
              data-lang={l}
              onClick={() => handleSetLang(l)}
              aria-pressed={language === l}
              className={`px-2.5 py-1 transition-colors ${
                language === l
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {l === 'en' ? 'EN' : 'हिं'}
            </button>
          ))}
        </div>

        <button
          onClick={handleToggleSound}
          data-testid="sound-btn"
          aria-label={soundEnabled ? t.nav.soundOn : t.nav.soundOff}
          title={soundEnabled ? t.nav.soundOn : t.nav.soundOff}
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors flex-shrink-0 active:scale-95"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={handleToggleTheme}
          data-testid="theme-btn"
          aria-label={theme === 'dark' ? t.nav.light : t.nav.dark}
          title={theme === 'dark' ? t.nav.light : t.nav.dark}
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors flex-shrink-0 active:scale-95"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
