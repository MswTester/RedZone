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

const TestButtonContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const TestButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
  width: 100%;
  max-width: 300px;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:active {
    background-color: #3e8e41;
  }
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
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

interface LogEntry {
  tag: number;
  description: string;
  time: string;
  solution?: string;
}

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const captureTimeout = useRef<NodeJS.Timeout>();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const imageAnalysis = useImageAnalysis();
  const { analyzeImage, isLoading, result } = imageAnalysis;
  
  const [allLogs, setAllLogs] = useState<LogEntry[]>([
    {
      tag: 1,
      description: '작업자가 정비 중이던 기계에 손을 넣었다가 끼임 사고 발생',
      time: '2025-07-13 08:42:15',
      solution: '기계 정비 시 반드시 전원을 차단하고, 잠금표시(Lock-out Tag-out)를 의무화해야 합니다.'
    },
    {
      tag: 6,
      description: '지게차가 회전 중 작업자와 충돌',
      time: '2025-07-13 09:10:27',
      solution: '지게차 작업 구역을 명확히 구분하고, 작업자에게 반사 조끼 착용을 의무화하세요.'
    },
    {
      tag: 9,
      description: '노출된 전선에 의해 감전 사고 발생',
      time: '2025-07-13 10:03:49',
      solution: '배선은 보호 덮개로 차단하고, 주기적인 전기 설비 점검이 필요합니다.'
    },
    {
      tag: 2,
      description: '작업자가 미끄러운 바닥에서 넘어져 골절',
      time: '2025-07-13 10:54:33',
      solution: '바닥 정리 상태를 주기적으로 점검하고, 미끄럼 주의 표지를 설치하세요.'
    },
    {
      tag: 11,
      description: '무게 중심이 불안정한 자재 적재로 자재 붕괴 발생',
      time: '2025-07-13 11:05:57',
      solution: '자재 적재 시 균형을 유지하도록 기준을 명시하고, 정기 점검을 강화하세요.'
    },
    {
      tag: 7,
      description: '압축기가 폭발하면서 파편이 튀어 부상 발생',
      time: '2025-07-13 11:17:29',
      solution: '압축기 사용 전 상태 점검을 의무화하고, 노후 설비는 교체하세요.'
    },
    {
      tag: 4,
      description: '작업자가 고소작업 중 안전고리 미체결로 추락',
      time: '2025-07-13 11:33:12',
      solution: '고소작업 전 보호구 착용과 체결 여부를 철저히 확인해야 합니다.'
    }
  ]);
  
  // Alias setAllLogs as setLogs for backward compatibility
  const setLogs = setAllLogs;
  
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter logs based on search query
  const filteredLogs = allLogs.filter(log => 
    log.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Update logs when new analysis result is available
  useEffect(() => {
    if (!result) return;
    
    console.log('Analysis result received:', result);

    try {
      // Check if the response is in the expected format
      // if (!result.Message || !result.Solution || result.Tag === undefined) {
      //   console.log('Invalid response format, skipping...');
      //   return;
      // }

      // Skip if no issue detected (tag = -1)
      if (result.level === -1) {
        console.log('No issues detected, skipping...');
        return;
      }

      // Create a new log entry from the analysis result
      const newLog: LogEntry = {
        tag: result.level || 0,
        description: result.message || '위험 상황이 감지되었습니다.',
        time: result.timestamp || new Date().toISOString(),
        solution: result.solution || '안전 조치가 필요합니다.'
      };
      
      console.log('Adding new log entry:', newLog);
      setAllLogs(prevLogs => [newLog, ...prevLogs]);
      
    } catch (error) {
      console.error('Error processing analysis result:', error);
      
      // Add error log to the UI for better user feedback
      const errorLog: LogEntry = {
        tag: 0, // Default tag for errors
        description: '분석 중 오류가 발생했습니다.',
        time: new Date().toISOString(),
        solution: '잠시 후 다시 시도해주세요.'
      };
      
      setAllLogs(prevLogs => [errorLog, ...prevLogs]);
    }
  }, [result]);

  const handleLogItemClick = (index: number) => {
    setSelectedLogIndex(selectedLogIndex === index ? null : index);
  };

  // Capture and analyze image when camera is active
  const captureAndAnalyze = useCallback(async () => {
    // Don't proceed if camera is off or we're already loading
    if (!isCameraActive || !webcamRef.current) {
      return;
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        console.log('No image captured, retrying...');
        captureTimeout.current = setTimeout(captureAndAnalyze, 1000);
        return;
      }

      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      
      console.log('Sending image for analysis...');
      await analyzeImage(file);
      
    } catch (error) {
      console.error('Error in captureAndAnalyze:', error);
    } finally {
      // Always schedule the next capture, regardless of success/failure
      // but only if the camera is still active
      if (isCameraActive) {
        console.log('Scheduling next capture in 5 seconds...');
        captureTimeout.current = setTimeout(captureAndAnalyze, 5000);
      }
    }
  }, [isCameraActive]);

  // Start/stop the capture loop when camera active state changes
  useEffect(() => {
    if (isCameraActive) {
      console.log('Starting auto-capture...');
      captureAndAnalyze();
    } else {
      console.log('Auto-capture stopped');
    }

    // Cleanup function to clear any pending timeouts
    return () => {
      if (captureTimeout.current) {
        console.log('Cleaning up capture timeout');
        clearTimeout(captureTimeout.current);
      }
    };
  }, [isCameraActive, captureAndAnalyze]);

  // Update logs when new analysis result is available
  // useEffect(() => {
  //   if (!result) return;

  //   console.log('Processing analysis result:', result);

  //   try {
  //     // Skip if no issue detected (level = -1)
  //     if (result.level === -1) {
  //       console.log('No issues detected, skipping...');
  //       return;
  //     }
      
  //     // Create a new log entry from the result
  //     const newLog: LogEntry = {
  //       tag: result.level,
  //       description: result.message || result.description || '위험 상황이 감지되었습니다.',
  //       time: result.timestamp || result.time || new Date().toISOString(),
  //       solution: result.solution || '안전 조치가 필요합니다.'
  //     };
      
  //     console.log('Adding new log entry:', newLog);
  //     setLogs(prevLogs => [newLog, ...prevLogs]);
      
  //   } catch (error) {
  //     console.error('Error processing analysis result:', error);
      
  //     // Add error log to the UI
  //     const errorLog: LogEntry = {
  //       tag: 0, // Error tag
  //       description: '분석 중 오류가 발생했습니다.',
  //       time: new Date().toISOString(),
  //       solution: '잠시 후 다시 시도해주세요.'
  //     };
      
  //     setLogs(prevLogs => [errorLog, ...prevLogs]);
  //   }
  // }, [result]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedLogIndex(null); // Reset selected log when searching
  };

  const startCamera = useCallback(() => {
    setIsCameraActive(true);
  }, []);

  // Function to test with the sample image
  const testWithSampleImage = useCallback(async () => {
    try {
      // Import the test image
      const testImage = await import('../assets/images/r1.jpg');
      
      // Convert the image to a blob
      const response = await fetch(testImage.default);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], 'r1.jpg', { type: 'image/jpeg' });
      
      // Analyze the image
      await analyzeImage(file);
      
      console.log('Test image sent for analysis');
    } catch (error) {
      console.error('Error testing with sample image:', error);
      
      // Add error log to the UI
      const errorLog: LogEntry = {
        tag: 0,
        description: '테스트 이미지 분석 중 오류가 발생했습니다.',
        time: new Date().toISOString(),
        solution: '나중에 다시 시도해주세요.'
      };
      
      setAllLogs(prevLogs => [errorLog, ...prevLogs]);
    }
  }, [analyzeImage]);


  return (
    <Wrapper>
      <LeftPane>
        <TestButtonContainer>
          <TestButton onClick={testWithSampleImage}>
            테스트 이미지로 분석하기
          </TestButton>
        </TestButtonContainer>
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
          {filteredLogs.map((log, idx) => {
            const logKey = `${log.time}-${idx}`;
            return (
              <LogItem 
                key={logKey}
                tag={log.tag}
                description={log.description}
                time={log.time}
                solution={log.solution}
                isSelected={selectedLogIndex === idx}
                onClick={() => handleLogItemClick(idx)}
              />
            );
          })}
        </LogList>
        <Footer />
      </RightPane>
    </Wrapper>
  );
}
