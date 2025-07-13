import { useState } from 'react';
import axios from 'axios';

export interface LogEntry {
  tag: number; // 태그용 숫자
  description: string;
  time: string;
  solution?: string;
}

export interface AnalysisResult {
  logs: LogEntry[];
  confidence: number;
}

export const useImageAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeImage = async (imageFile: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 이미지를 base64로 변환
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // 전체 data URL 전송 (예: "data:image/jpeg;base64,/9j/4AAQ...")
          const dataUrl = reader.result as string;
          if (dataUrl) {
            resolve(dataUrl);
          } else {
            reject(new Error('이미지를 base64로 변환하는데 실패했습니다.'));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
      });

      // API 호출
      console.log('Sending image for analysis...');
      console.log('Image data size:', imageBase64.length, 'characters');
      console.log('First 100 chars of image data:', imageBase64.substring(0, 100));
      
      const response = await axios.post<AnalysisResult>('/api/ai/gemini/analyze-image', {
        imageBase64: imageBase64
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 응답 로깅
      console.log('Analysis response:', response.data);
      
      // 응답 처리
      setResult(response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // 서버에서 응답이 왔지만 에러 상태 코드가 반환된 경우
        console.error('Server responded with error status:', error.response.status);
        console.error('Error data:', error.response.data);
        throw new Error(`서버 오류가 발생했습니다: ${error.response.data?.message || '알 수 없는 오류'}`);
      } else if (error.request) {
        // 요청이 전송되었지만 응답을 받지 못한 경우
        console.error('No response received:', error.request);
        throw new Error('서버로부터 응답을 받지 못했습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        // 요청 설정 중에 에러가 발생한 경우
        console.error('Error setting up request:', error.message);
        throw new Error(`요청 설정 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeImage, isLoading, error, result };
};

export default useImageAnalysis;
