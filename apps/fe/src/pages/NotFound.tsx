import CenteredColumn from '../components/layout/CenteredColumn';
import styled from 'styled-components';

const Code = styled.h1`
  font-size: 4rem;
  margin: 0;
`;

const Message = styled.p`
  font-size: 1.25rem;
  opacity: 0.7;
`;

export default function NotFound() {
  return (
    <CenteredColumn className="page">
      <Code>404</Code>
      <Message>Page not found.</Message>
    </CenteredColumn>
  );
}
