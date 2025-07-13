import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { GlobalStyles } from './styles/GlobalStyles.ts';
import ThemeProvider from './theme/ThemeContext.tsx';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <GlobalStyles />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
