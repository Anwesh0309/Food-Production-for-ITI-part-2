import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, language, sidebarOpen, setSidebar } = useStore();
  const { pathname } = useLocation();

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => { document.documentElement.lang = language === 'hi' ? 'hi' : 'en'; }, [language]);
  // on phones/tablets the drawer closes after navigating
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) setSidebar(false);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#070d18] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <Sidebar />
      {sidebarOpen && <button aria-label="close menu" onClick={() => setSidebar(false)} className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden" />}
      <div className={`transition-[padding] duration-200 ${sidebarOpen ? 'lg:pl-72' : ''}`}>
        <TopBar />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pb-20">{children}</main>
      </div>
    </div>
  );
}
