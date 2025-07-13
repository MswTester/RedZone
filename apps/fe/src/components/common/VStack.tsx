import styled from 'styled-components';
import React from 'react';
import type { ReactNode } from 'react';

interface VStackProps {
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
}

const StyledVStack = styled.div<Omit<VStackProps, 'children'>>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : gap || '0px')};
  justify-content: ${({ justifyContent = 'flex-start' }) => justifyContent};
  align-items: ${({ alignItems = 'stretch' }) => alignItems};
  width: ${({ width = '100%' }) => width};
  height: ${({ height = 'auto' }) => height};
  padding: ${({ padding = '0' }) => padding};
  margin: ${({ margin = '0' }) => margin};
  flex-wrap: ${({ flexWrap = 'nowrap' }) => flexWrap};
`;

export const VStack: React.FC<VStackProps> = ({
  children,
  gap = 8,
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  width = '100%',
  height = 'auto',
  padding = '0',
  margin = '0',
  flexWrap = 'nowrap',
  className,
}) => {
  return (
    <StyledVStack
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
    </StyledVStack>
  );
};

export default VStack;