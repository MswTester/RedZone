import styled from 'styled-components';
import React from 'react';
import type { ReactNode } from 'react';

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: number | string;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  className?: string;
  style?: React.CSSProperties;
}

const StyledHStack = styled.div<Omit<HStackProps, 'children'>>`
  display: flex;
  flex-direction: row;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : gap || '0px')};
  justify-content: ${({ justifyContent = 'flex-start' }) => justifyContent};
  align-items: ${({ alignItems = 'center' }) => alignItems};
  width: ${({ width = 'auto' }) => width};
  height: ${({ height = 'auto' }) => height};
  padding: ${({ padding = '0' }) => padding};
  margin: ${({ margin = '0' }) => margin};
  flex-wrap: ${({ flexWrap = 'nowrap' }) => flexWrap};
`;

export const HStack: React.FC<HStackProps> = ({
  children,
  gap = 8,
  justifyContent = 'flex-start',
  alignItems = 'center',
  width = 'auto',
  height = 'auto',
  padding = '0',
  margin = '0',
  flexWrap = 'nowrap',
  className,
}) => {
  return (
    <StyledHStack
      gap={gap}
      justifyContent={justifyContent}
      alignItems={alignItems}
      width={width}
      height={height}
      padding={padding}
      margin={margin}
      flexWrap={flexWrap}
      className={className}
    >
      {children}
    </StyledHStack>
  );
};

export default HStack;