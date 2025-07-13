import type { ICameraService } from './types';

class CameraService implements ICameraService {
  private deviceChangeListeners: Set<() => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();

  constructor() {
    this.setupDeviceChangeListener();
  }

  private setupDeviceChangeListener() {
    if (navigator.mediaDevices && 'addEventListener' in navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange);
    }
  }

  private handleDeviceChange = () => {
    this.deviceChangeListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        this.handleError(error as Error);
      }
    });
  };

  private handleError(error: Error) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        console.error('Error in error handler:', e);
      }
    });
  }

  onDeviceChange(callback: () => void): () => void {
    this.deviceChangeListeners.add(callback);
    return () => this.deviceChangeListeners.delete(callback);
  }

  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  private async ensurePermissions(): Promise<void> {
    try {
      if (!('permissions' in navigator)) return;
      const status = await (navigator as any).permissions.query({ name: 'camera' });
      if (status.state === 'denied') {
        throw new DOMException('Camera permission denied', 'NotAllowedError');
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async listCameras(): Promise<MediaDeviceInfo[]> {
    try {
      await this.ensurePermissions();
      await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => undefined);
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'videoinput');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async getStream(constraints: MediaTrackConstraints = {}): Promise<MediaStream> {
    try {
      await this.ensurePermissions();
      return await navigator.mediaDevices.getUserMedia({ video: { ...constraints } });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  stopStream(stream: MediaStream): void {
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async getCapabilities(): Promise<MediaTrackCapabilities | null> {
    try {
      const stream = await this.getStream();
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities ? track.getCapabilities() : null;
      this.stopStream(stream);
      return capabilities;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
}

export default CameraService;
