import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { type ZodType } from 'zod';
import type { IHttpService, RequestConfig, ApiResponse } from './types';
import { CommunicationError } from './types';

export default class HttpService implements IHttpService {
  private client: AxiosInstance;
  private static readonly DEFAULT_TIMEOUT = 10_000;
  private static readonly DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
  } as const;

  constructor(baseURL = '') {
    this.client = axios.create({
      baseURL,
      timeout: HttpService.DEFAULT_TIMEOUT,
      headers: HttpService.DEFAULT_HEADERS,
      withCredentials: true,
    });

    this.attachInterceptors();
  }

  private attachInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.toCommunicationError(error as AxiosError))
    );
  }

  private toCommunicationError(error: AxiosError): CommunicationError {
    if (error.response) {
      const data = error.response.data as any;
      return new CommunicationError(
        data?.error?.message,
        error.response.status,
        data?.error?.details
      );
    }
    if (error.request) {
      return new CommunicationError('서버로부터 응답이 없습니다.', 500);
    }
    return new CommunicationError('요청 생성 중 오류가 발생했습니다.', 'REQUEST_SETUP_ERROR');
  }

  async request<T = any>(config: RequestConfig, resSchema?: ZodType<T>): Promise<ApiResponse<T>> {
    const res = await this.client.request<ApiResponse<T>>(config);

    if (resSchema && res.data.data) {
      const result = resSchema.safeParse(res.data.data);
      if (!result.success) throw result.error;
      return { ...res.data, data: result.data };
    }
    
    return res.data;
  }

  get<T = any>(url: string, params?: Record<string, any>, resSchema?: ZodType<T>) {
    return this.request<T>({ url, method: 'GET', params }, resSchema);
  }

  post<T = any>(url: string, data?: any, resSchema?: ZodType<T>) {
    return this.request<T>({ url, method: 'POST', data }, resSchema);
  }

  patch<T = any>(url: string, data?: any, resSchema?: ZodType<T>) {
    return this.request<T>({ url, method: 'PATCH', data }, resSchema);
  }

  put<T = any>(url: string, data?: any, resSchema?: ZodType<T>) {
    return this.request<T>({ url, method: 'PUT', data }, resSchema);
  }

  delete<T = any>(url: string, params?: Record<string, any>, resSchema?: ZodType<T>) {
    return this.request<T>({ url, method: 'DELETE', params }, resSchema);
  }
}
