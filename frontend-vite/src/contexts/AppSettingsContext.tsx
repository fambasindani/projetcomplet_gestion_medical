import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { translations, Lang } from '../i18n/translations';

export type Theme = 'light' | 'dark';

interface AppSettingsContextType {
  theme: Theme;
  lang: Lang;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEYS = { theme: 'app_theme', lang: 'app_lang' };

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const resolveInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveInitialLang = (): Lang => {
  const stored = localStorage.getItem(STORAGE_KEYS.lang);
  return stored === 'en' ? 'en' : 'fr';
};

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [lang, setLangState] = useState<Lang>('fr');
  const resolvedRef = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setThemeState(resolveInitialTheme());
      setLangState(resolveInitialLang());
      resolvedRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!resolvedRef.current) return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lang, lang);
  }, [lang]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')), []);
  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = translations[lang] ?? translations.fr;
      let str = dict[key] ?? translations.fr[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [lang],
  );

  return (
    <AppSettingsContext.Provider value={{ theme, lang, setTheme, toggleTheme, setLang, t }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};