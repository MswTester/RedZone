import { useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { HStack } from "../common/HStack";
import { Text } from "../common/Text";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface LogItemContainerProps {
    $hasSolution: boolean;
}

const LogItemContainer = styled.div<LogItemContainerProps>`
  position: relative;
  cursor: ${({ $hasSolution }) => ($hasSolution ? 'pointer' : 'default')};
  background: transparent;
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $hasSolution }) => $hasSolution ? 'rgba(255, 255, 255, 0.02)' : 'transparent'};
  }
`;

const ContentWrapper = styled.div`
  padding: 12px 16px;
  position: relative;
  z-index: 1;
`;

const SolutionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  padding: 12px 16px 12px 66px;
  z-index: 2;
  animation: ${fadeIn} 0.2s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const SolutionText = styled(Text)`
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

interface LogItemProps {
    tag: number;
    description: string;
    time: string;
    solution?: string;
    isSelected?: boolean;
    onClick?: () => void;
}

interface TagType {
    text: string;
    color: string;
}

export const LogItem = ({ tag, description, time, solution, isSelected = false, onClick }: LogItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);
    
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (solution && onClick) {
            onClick();
        }
    };
    const tagList: TagType[] = [
        { text: "얽힘", color: "#BA68C8" },
        { text: "협착", color: "#A57C6D" },
        { text: "전도", color: "#2196F3" },
        { text: "비래", color: "#00ACC1" },
        { text: "추락", color: "#FF9800" },
        { text: "낙하", color: "#9569FC" },
        { text: "충돌", color: "#3F51B5" },
        { text: "폭발", color: "#E53935" },
        { text: "동작", color: "#4CAF50" },
        { text: "감전", color: "#FCCE03" },
        { text: "접촉", color: "#009688" },
        { text: "붕괴", color: "#DB6E96" },
    ];

    return (
        <LogItemContainer 
            ref={itemRef}
            $hasSolution={!!solution}
            onClick={handleClick}
        >
            <ContentWrapper>
                <HStack gap={20} alignItems="center">
                    <Text variant="titleMedium" color={tagList[tag].color} style={{ minWidth: '40px' }}>
                        {tagList[tag].text}
                    </Text>
                    <Text variant="bodyMedium" color="onBackground" style={{ flex: 1 }}>
                        {description}
                    </Text>
                    <Text variant="bodySmall" color="onSurfaceVariant" style={{ whiteSpace: 'nowrap' }}>
                        {time}
                    </Text>
                </HStack>
            </ContentWrapper>
            
            {isSelected && solution && (
                <SolutionOverlay>
                    <SolutionText>
                        {solution}
                    </SolutionText>
                </SolutionOverlay>
            )}
        </LogItemContainer>
    )
}