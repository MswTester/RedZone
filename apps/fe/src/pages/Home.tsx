import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import styled from 'styled-components';
import { LogItem } from '../components/home/LogItem';
import { Footer } from '../components/home/Footer';
import { SearchBar } from '../components/home/SearchBar';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPane = styled.div`
  flex: 2;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    height: 40vh;
  }
`;

const WebcamContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CameraPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
  text-align: center;
`;

const CameraButton = styled.button`
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1976D2;
  }
`;

const RightPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: ${({ theme }) => theme?.colors?.surface || '#F5F5F5'};

  @media (max-width: 768px) {
    flex: unset;
    height: 60vh;
  }
`;

const LogList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export default function Home() {
  const dummyLogs = Array.from({ length: 6 }).map((_, idx) => ({
    tag: 0,
    description: '작업자가 들고있던 커피를 쏟아 프레사가 오작동',
    time: '2025-07-11 18:19:40',
  }));

  const webcamRef = useRef<Webcam>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleSearch = (query: string) => {
    // TODO: Replace with real navigation or search handling
    console.log('검색어:', query);
    alert(`검색: ${query}`);
  };

  const toggleCamera = useCallback(() => {
    setIsCameraActive(!isCameraActive);
  }, [isCameraActive]);

  return (
    <Wrapper>
      <LeftPane>
        <WebcamContainer>
          {isCameraActive ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: 'environment'
                }}
              />
              <CameraButton onClick={toggleCamera}>
                카메라 끄기
              </CameraButton>
            </>
          ) : (
            <CameraPlaceholder>
              <p>카메라가 꺼져있습니다</p>
              <CameraButton onClick={toggleCamera}>
                카메라 켜기
              </CameraButton>
            </CameraPlaceholder>
          )}
        </WebcamContainer>
      </LeftPane>
      <RightPane>
        <SearchBar onSearch={handleSearch} />
        <LogList>
          {dummyLogs.map((log, idx) => (
            <LogItem key={idx} tag={log.tag} description={log.description} time={log.time} />
          ))}
        </LogList>
        <Footer />
      </RightPane>
    </Wrapper>
  );
}
