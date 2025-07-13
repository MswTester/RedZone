import { Peer, DataConnection } from 'peerjs';
import type { IPeerSocketService, IPeerSocketHandlers } from './types';

export default class PeerSocketService implements IPeerSocketService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private handlers: IPeerSocketHandlers | null = null;

  connect<T = any>(peerId: string, handlers: IPeerSocketHandlers<T>): void {
    this.handlers = handlers;

    if (!this.peer) {
      this.peer = new Peer();
      this.peer.on('connection', conn => this.setupConnection(conn, conn.peer));
      this.peer.on('error', err => this.handlers?.onError?.(err));
    }

    if (this.connections.has(peerId) && this.connections.get(peerId)!.open) {
      throw new Error(`Already connected to peer ${peerId}`);
    }

    const openOrConnect = () => {
      const conn = this.peer!.connect(peerId);
      this.setupConnection(conn, peerId);
    };

    this.peer!.open ? openOrConnect() : this.peer!.once('open', openOrConnect);
  }

  send<T = any>(data: T, peerId?: string | null): void {
    if (!this.isConnected()) throw new Error('No open peer connections');

    const payload: any = typeof data === 'string' || data instanceof ArrayBuffer
      ? data
      : JSON.stringify(data);

    if (peerId) {
      const conn = this.connections.get(peerId);
      if (!conn || !conn.open) throw new Error(`No open connection to peer ${peerId}`);
      conn.send(payload);
      return;
    }

    this.connections.forEach(conn => conn.open && conn.send(payload));
  }

  close(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
      this.handlers?.onClose?.(new CloseEvent('manual-close'), peerId);
    }
  }

  destroy(): void {
    this.connections.forEach(c => c.close());
    this.connections.clear();
    
    this.peer?.disconnect();
    this.peer?.destroy();
    this.peer = null;
    
    this.handlers?.onClose?.(new CloseEvent('manual-close-all'));
  }

  isConnected(peerId?: string | null): boolean {
    if (peerId) return !!this.connections.get(peerId)?.open;
    return Array.from(this.connections.values()).some(c => c.open);
  }

  private setupConnection(conn: DataConnection, peerId: string): void {
    conn.on('open', () => this.handlers?.onOpen?.(peerId));

    conn.on('data', raw => {
      try {
        let parsed: any = raw;
        if (this.handlers?.schema && typeof raw === 'string') {
          parsed = JSON.parse(raw);
          parsed = this.handlers.schema.parse(parsed);
        }
        this.handlers?.onMessage(parsed, peerId);
      } catch (err: any) {
        this.handlers?.onError?.(err);
      }
    });

    conn.on('close', () => {
      this.connections.delete(peerId);
      if (this.connections.size === 0) {
        this.handlers?.onClose?.(new CloseEvent('remote-close'), peerId);
      }
    });

    conn.on('error', err => {
      this.connections.delete(peerId);
      this.handlers?.onError?.(err);
    });

    this.connections.set(peerId, conn);
  }
}
