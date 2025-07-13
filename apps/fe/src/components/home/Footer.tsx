import styled from 'styled-components';
import { HStack } from '../common/HStack';
import { Text } from '../common/Text';
import { useThemeMode } from '../../contexts/ThemeContext';

const Container = styled.footer`
  width: 100%;
`;

const GuideLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ active }) => (active ? '26px' : '2px')};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.onSurface};
    transition: left 0.2s ease;
  }
`;

export const Footer = () => {
  const { mode, toggle } = useThemeMode();

  return (
    <Container>
      <HStack justifyContent="space-between" alignItems="center" padding="8px 0">
        <GuideLink href="https://www.notion.so/22f1038bd92a80bca54ef2af058e6f6f?source=copy_link" target="_blank" rel="noopener noreferrer">
          <Text variant="bodySmall" color="onSurfaceVariant">
            가이드 확인하기
          </Text>
        </GuideLink>
        <ToggleButton active={mode === 'dark'} onClick={toggle} aria-label="Toggle theme" />
      </HStack>
    </Container>
  );
};
