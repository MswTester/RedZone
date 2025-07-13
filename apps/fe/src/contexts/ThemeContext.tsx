import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as StyledProvider } from 'styled-components';
import type { DefaultTheme } from 'styled-components';
import { lightColors, darkColors } from '../theme/colors';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const themeMap: Record<ThemeMode, DefaultTheme> = {
  light: { mode: 'light', colors: lightColors } as DefaultTheme,
  dark: { mode: 'dark', colors: darkColors } as DefaultTheme,
} as const;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggle = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <StyledProvider theme={themeMap[mode]}>{children}</StyledProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
};
