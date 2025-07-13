import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import styled from 'styled-components';
import { LogItem } from '../components/home/LogItem';
import { Footer } from '../components/home/Footer';
import { SearchBar } from '../components/home/SearchBar';
import useImageAnalysis from '../hooks/useImageAnalysis';

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
  justify-content: center;
  gap: 16px;
  color: #666;
  text-align: center;
  width: 100%;
  height: 100%;
`;

const CameraButton = styled.button`
  padding: 12px 24px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 150px;
  text-align: center;

  &:hover {
    background-color: #1976D2;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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

interface LogEntry {
  tag: number;
  description: string;
  time: string;
  solution?: string;
}

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      tag: 5,
      description: '작업자가 들고있던 커피를 쏟아 프레스가 오작동',
      time: '2025-07-11 18:19:40',
    },
  ]);

  const webcamRef = useRef<Webcam>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const captureInterval = useRef<NodeJS.Timeout>();
  const imageAnalysis = useImageAnalysis();
  const { analyzeImage, isLoading, result } = imageAnalysis;

  // Auto-capture image every 5 seconds when camera is active
  useEffect(() => {
    if (isCameraActive && !isLoading) {
      captureInterval.current = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            try {
              const response = await fetch(imageSrc);
              const blob = await response.blob();
              const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
              await analyzeImage(file);
            } catch (error) {
              console.error('Error capturing or analyzing image:', error);
            }
          }
        }
      }, 5000);
    }

    return () => {
      if (captureInterval.current) {
        clearInterval(captureInterval.current);
      }
    };
  }, [isCameraActive, isLoading, analyzeImage]);

  // Update logs when new analysis result is available
  useEffect(() => {
    if (result) {
      const newLogs: LogEntry[] = result.logs.map(log => ({
        tag: log.tag,
        description: log.description,
        time: log.time || new Date().toLocaleString('ko-KR'),
        solution: log.solution
      }));
      
      setLogs(prevLogs => [...newLogs, ...prevLogs]);
    }
  }, [result]);

  const handleSearch = (query: string) => {
    // TODO: Replace with real navigation or search handling
    console.log('검색어:', query);
    alert(`검색: ${query}`);
  };

  const startCamera = useCallback(() => {
    setIsCameraActive(true);
  }, []);

  return (
    <Wrapper>
      <LeftPane>
        <WebcamContainer>
          {isCameraActive ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'environment'
              }}
            />
          ) : (
            <CameraPlaceholder>
              <p>카메라가 꺼져있습니다</p>
              <CameraButton onClick={startCamera}>
                카메라 켜기
              </CameraButton>
            </CameraPlaceholder>
          )}
        </WebcamContainer>
      </LeftPane>
      <RightPane>
        <SearchBar onSearch={handleSearch} />
        <LogList>
          {logs.map((log, idx) => (
            <LogItem 
              key={`${log.time}-${idx}`}
              tag={log.tag}
              description={log.solution ? `${log.description} (해결 방법: ${log.solution})` : log.description}
              time={log.time}
            />
          ))}
        </LogList>
        <Footer />
      </RightPane>
    </Wrapper>
  );
}
