import type { ZodType } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    status: number | string;
    message: string;
    details?: string;
  };
  timestamp: string;
}

export class CommunicationError extends Error {
  status: number | string;
  details?: string;
  constructor(message: string, status: number | string, details?: string) {
    super(message);
    this.name = 'CommunicationError';
    this.status = status;
    this.details = details;
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, CommunicationError);
    }
  }
}

export interface IHttpService {
  request<T = any>(config: RequestConfig): Promise<ApiResponse<T>>;
  get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
}

export interface IWebSocketHandlers<T = any> {
  schema?: ZodType<T>;
  onOpen?: () => void;
  onMessage: (data: T) => void;
  onError?: (error: Error) => void;
  onClose?: (event: CloseEvent) => void;
}

export interface IWebSocketService {
  connect<T = any>(url: string, handlers: IWebSocketHandlers<T>): void;
  send<T = any>(data: T): void;
  close(): void;
  isConnected(): boolean;
}

export interface IPeerSocketHandlers<T = any> {
  schema?: ZodType<T>;
  onOpen?: (peerId: string) => void;
  onMessage: (data: T, peerId: string) => void;
  onError?: (error: Error) => void;
  onClose?: (event: CloseEvent, peerId?: string) => void;
}

export interface IPeerSocketService {
  connect<T = any>(peerId: string, handlers: IPeerSocketHandlers<T>): void;
  send<T = any>(data: T, peerId?: string | null): void;
  close(peerId: string): void;
  destroy(): void;
  isConnected(peerId?: string | null): boolean;
}
