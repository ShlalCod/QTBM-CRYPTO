'use client';

import { useAppStore } from '@/stores/app-store';

/**
 * Locale-aware formatter hook.
 * Returns helpers that respect the current app language (ar | en-US).
 * Use these instead of bare `toLocaleString()` / `toLocaleDateString('en-US', ...)`.
 */
export const useLocaleFmt = () => {
  const { language } = useAppStore();
  const lang: string = language === 'ar' ? 'ar' : 'en-US';
  return {
    lang,
    formatDate: (d: string | Date, opts?: Intl.DateTimeFormatOptions) =>
      new Date(d).toLocaleDateString(lang, opts),
    formatDateTime: (d: string | Date, opts?: Intl.DateTimeFormatOptions) =>
      new Date(d).toLocaleString(lang, opts),
    formatNum: (n: number, opts?: Intl.NumberFormatOptions) => n.toLocaleString(lang, opts),
    /** Case-insensitive includes() — works for Latin (case-fold) and Arabic (no-op). */
    includesCI: (haystack: string, needle: string) =>
      haystack.toLowerCase().includes(needle.toLowerCase()),
  };
};
