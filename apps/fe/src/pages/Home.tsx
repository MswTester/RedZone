import CenteredColumn from '../components/layout/CenteredColumn';
import styled from 'styled-components';

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.8;
`;

export default function Home() {
  return (
    <CenteredColumn className="page">
      <Title>Welcome</Title>
      <Subtitle>React + Vite template with scalable network layer.</Subtitle>
    </CenteredColumn>
  );
}
