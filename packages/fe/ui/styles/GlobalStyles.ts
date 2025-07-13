import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.onBackground};
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .page {
    padding: 2rem;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
  }
`;
