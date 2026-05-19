import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { TranslationKey } from './i18nTypes.ts';

export type Locale = 'en' | 'zh-CN';

import en from './locales/en.json';
import zh from './locales/zh.json';

const translations: Record<Locale, Record<string, string>> = {
  en,
  'zh-CN': zh,
};

function detectLocale(): Locale {
  const stored = localStorage.getItem('li-locale');
  if (stored === 'en' || stored === 'zh-CN') return stored;
  if (navigator.language.startsWith('zh')) return 'zh-CN';
  return 'en';
}

export interface LocaleContextValue {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: 'en',
      t: (key: TranslationKey) => key,
      setLocale: () => {},
    };
  }
  return ctx;
}

export function useLocaleState() {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  useEffect(() => {
    localStorage.setItem('li-locale', locale);
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale]?.[key] ?? key;
    },
    [locale],
  );

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  return { locale, t, setLocale };
}
