import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { en, type Dict } from './en';
import { hi } from './hi';

export const dictionaries: Record<'en' | 'hi', Dict> = { en, hi };

/** Returns the UI dictionary for the active language. */
export function useDict(): Dict {
  const language = useStore((s) => s.language);
  return dictionaries[language];
}

/** Inline bilingual helper: L('English', 'हिन्दी'). Used by simulations for scene-specific copy. */
export function useLang() {
  const language = useStore((s) => s.language);
  return useCallback((e: string, h: string) => (language === 'hi' ? h : e), [language]);
}
