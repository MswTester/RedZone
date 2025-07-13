import 'styled-components';
import type { ColorScheme } from '../theme/colors';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode: 'light' | 'dark';
    colors: ColorScheme;
  }
}
