import type { IWebSocketService, IWebSocketHandlers } from './types';

export default class WebSocketService implements IWebSocketService {
  private socket: WebSocket | null = null;

  connect<T = any>(url: string, handlers: IWebSocketHandlers<T>): void {
    if (this.isConnected()) {
      console.warn('WebSocket already connected');
      return;
    }

    this.socket = new WebSocket(url);
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = () => handlers.onOpen?.();
    this.socket.onmessage = (e) => {
      try {
        const raw = e.data;
        let parsed: any = raw;

        if (handlers.schema && typeof raw === 'string') {
          parsed = JSON.parse(raw);
          const result = handlers.schema.parse(parsed);
          parsed = result;
        }

        handlers.onMessage(parsed);
      } catch (error) {
        handlers.onError?.(error as Error);
      }
    };
    this.socket.onerror = () => handlers.onError?.(new Error('WebSocket error'));
    this.socket.onclose = (e) => handlers.onClose?.(e);
  }

  send<T = any>(data: T): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }

    const payload = typeof data === 'string' || data instanceof ArrayBuffer 
      ? data 
      : JSON.stringify(data);

    this.socket?.send(payload);
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
