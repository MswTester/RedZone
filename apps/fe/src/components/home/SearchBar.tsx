import styled from 'styled-components';
import { useState, type KeyboardEvent, type ChangeEvent } from 'react';



interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const Container = styled.div`
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme?.colors?.onSurfaceVariant || '#CCCCCC'};
  border-radius: 8px;
  background: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  color: ${({ theme }) => theme?.colors?.onBackground || '#000000'};
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme?.colors?.onSurfaceVariant || '#888888'};
  }
`;

export const SearchBar = ({ onSearch, placeholder = '검색어를 입력해주세요' }: SearchBarProps) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value.trim());
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Container>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </Container>
  );
};
