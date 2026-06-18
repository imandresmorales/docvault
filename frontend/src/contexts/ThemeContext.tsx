'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** The user's chosen preference ('light' | 'dark' | 'system') */
  theme: Theme;
  /** The theme that is currently applied to the document */
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'docvault:theme';

function resolveTheme(pref: Theme, systemDark: boolean): 'light' | 'dark' {
  if (pref === 'system') return systemDark ? 'dark' : 'light';
  return pref;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemDark, setSystemDark] = useState(false);

  // Bootstrap: read stored preference and detect system preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) setThemeState(stored);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);

    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Apply data-theme attribute to <html> whenever resolved theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme, systemDark);
    document.documentElement.setAttribute('data-theme', resolved);
    // Also set color-scheme for native browser elements (scrollbars, inputs…)
    document.documentElement.style.colorScheme = resolved;
  }, [theme, systemDark]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolveTheme(theme, systemDark) === 'dark' ? 'light' : 'dark');
  }, [theme, systemDark, setTheme]);

  const resolvedTheme = resolveTheme(theme, systemDark);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
