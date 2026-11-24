import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'hi';
export type ThemeMode = 'light' | 'dark';

export interface LabAttempt { labId: string; score: number; completedAt: string; hintsUsed: number; timeSpent: number }

interface State {
  language: Language;
  theme: ThemeMode;
  sidebarOpen: boolean;
  xp: number;
  completedLessons: string[];
  labAttempts: LabAttempt[];
  soundEnabled: boolean;
  setLanguage: (l: Language) => void;
  toggleTheme: () => void;
  setSidebar: (open: boolean) => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  addXP: (n: number) => void;
  completeLesson: (id: string) => void;
  addLabAttempt: (a: LabAttempt) => void;
  resetProgress: () => void;
}

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

/** Module 2's own persisted state (separate storage key — shares nothing with any other app). */
export const useStore = create<State>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'light',
      sidebarOpen: isDesktop(),
      xp: 0,
      completedLessons: [],
      labAttempts: [],
      soundEnabled: true,
      setLanguage: (language) => set({ language }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setSidebar: (sidebarOpen) => set({ sidebarOpen }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      addXP: (n) => set((s) => ({ xp: s.xp + n })),
      completeLesson: (id) => set((s) => (s.completedLessons.includes(id) ? s : { completedLessons: [...s.completedLessons, id] })),
      addLabAttempt: (a) => set((s) => ({ labAttempts: [...s.labAttempts, a] })),
      resetProgress: () => set({ xp: 0, completedLessons: [], labAttempts: [] }),
    }),
    {
      name: 'foodproduction-module2-storage',
      partialize: (s) => ({ language: s.language, theme: s.theme, xp: s.xp, completedLessons: s.completedLessons, labAttempts: s.labAttempts, soundEnabled: s.soundEnabled }),
    },
  ),
);
