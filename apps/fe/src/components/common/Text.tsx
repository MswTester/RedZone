import styled from 'styled-components';
import React from 'react';
import type { ReactNode } from 'react';

// Font face definitions
const FontFaces = `
  @font-face {
    font-family: 'Pretendard';
    src: url('/src/assets/fonts/Pretendard-Medium.otf') format('opentype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Pretendard';
    src: url('/src/assets/fonts/Pretendard-SemiBold.otf') format('opentype');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Pretendard';
    src: url('/src/assets/fonts/Pretendard-Bold.otf') format('opentype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
`;

type TextVariant = 
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall';

const variantStyles = {
  headlineLarge: '28px / 34px',
  headlineMedium: '24px / 28px',
  headlineSmall: '20px / 24px',
  titleLarge: '18px / 22px',
  titleMedium: '16px / 20px',
  titleSmall: '14px / 18px',
  bodyLarge: '16px / 20px',
  bodyMedium: '14px / 18px',
  bodySmall: '12px / 16px',
} as const;

interface TextProps {
  variant?: TextVariant;
  children: ReactNode;
  color?: string;
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

const StyledText = styled.div<Omit<TextProps, 'children'>>`
  ${FontFaces}
  
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-style: normal;
  font-weight: ${({ variant = 'bodyMedium' }) => {
    if (variant.startsWith('headline')) return 700; // Bold
    if (variant.startsWith('title')) return 600;   // SemiBold
    return 500;                                    // Medium (for body and fallback)
  }};
  margin: 0;
  padding: 0;
  color: ${({ color, theme }) => {
    if (!color) return (theme as any)?.colors?.text?.primary || '#000000';
    // If color is a theme key, try to get it from theme
    if (typeof color === 'string' && !color.startsWith('#')) {
      return (theme as any)?.colors?.[color] || color;
    }
    // Otherwise use the color directly (for hex, rgb, etc.)
    return color;
  }};
  ${({ variant = 'bodyMedium' }) => {
    const [fontSize, lineHeight] = variantStyles[variant].split(' / ');
    return `
      font-size: ${fontSize};
      line-height: ${lineHeight};
    `;
  }}
  white-space: 'nowrap';
`;

export const Text: React.FC<TextProps> = ({
  variant = 'bodyMedium',
  children,
  color,
  className,
  as = 'span',
  style,
}) => {
  return (
    <StyledText
      as={as}
      variant={variant}
      color={color}
      className={className}
      style={style}
    >
      {children}
    </StyledText>
  );
};

export default Text;