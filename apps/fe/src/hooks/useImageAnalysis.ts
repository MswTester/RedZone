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
          // data URL에서 base64 부분만 추출 (예: "data:image/jpeg;base64,/9j/4AAQ...")
          const base64String = (reader.result as string).split(',')[1];
          if (base64String) {
            resolve(base64String);
          } else {
            reject(new Error('이미지를 base64로 변환하는데 실패했습니다.'));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
      });

      // API 호출
      console.log('Sending image for analysis...');
      const response = await axios.post<AnalysisResult>('/api/analyze', {
        image: imageBase64
      });

      // 응답 로깅
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      // 응답 처리
      setResult(response.data);
      return response.data;
    } catch (err) {
      console.error('Error during image analysis:', err);
      const error = err instanceof Error ? err : new Error('이미지 분석 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeImage, isLoading, error, result };
};

export default useImageAnalysis;
