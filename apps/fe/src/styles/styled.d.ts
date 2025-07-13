import 'styled-components';
import type { AppTheme } from '../theme/Theme';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface DefaultTheme extends AppTheme {}
}
