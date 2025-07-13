import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { ThemeProvider as StyledProvider } from 'styled-components';
import { lightTheme, darkTheme } from './Theme';
import type { AppTheme } from './Theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'themeMode';

interface ThemeCtx {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Initial mode from localStorage or system
  const getInitialMode = (): ThemeMode => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored) return stored;
    return 'system';
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  // Resolve actual theme according to mode & OS
  const resolveTheme = (m: ThemeMode): AppTheme => {
    if (m === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? darkTheme : lightTheme;
    }
    return m === 'dark' ? darkTheme : lightTheme;
  };

  const [theme, setTheme] = useState<AppTheme>(() => resolveTheme(mode));

  // Watch for mode or system changes
  useMemo(() => {
    const update = () => setTheme(resolveTheme(mode));
    update();
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    return undefined;
  }, [mode]);

  const setModePersist = (m: ThemeMode) => {
    setMode(m);
    localStorage.setItem(THEME_STORAGE_KEY, m);
  };

  const toggle = () => {
    setModePersist(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode: setModePersist, toggle }}>
      <StyledProvider theme={theme}>{children}</StyledProvider>
    </ThemeContext.Provider>
  );
}
