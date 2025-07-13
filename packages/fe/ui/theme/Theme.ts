import { lightColors, darkColors } from './colors';
import type { ColorScheme } from './colors';

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: ColorScheme;
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
};
