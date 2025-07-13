import type { IAudioService, VolumeChangeHandler, ExtendedHTMLMediaElement } from './types';

class AudioService implements IAudioService {
  private deviceChangeListeners: Set<() => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();
  private volumeChangeHandlers: Map<HTMLMediaElement, Set<VolumeChangeHandler>> = new Map();

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

  private setupVolumeChangeListener(element: HTMLMediaElement) {
    if (!this.volumeChangeHandlers.has(element)) {
      const handlers = new Set<VolumeChangeHandler>();
      this.volumeChangeHandlers.set(element, handlers);
      
      const handleVolumeChange = () => {
        const volume = element.volume;
        handlers.forEach(handler => {
          try {
            handler(volume);
          } catch (error) {
            this.handleError(error as Error);
          }
        });
      };

      element.addEventListener('volumechange', handleVolumeChange);
      
      // Cleanup function
      return () => {
        element.removeEventListener('volumechange', handleVolumeChange);
        this.volumeChangeHandlers.delete(element);
      };
    }
    return () => {};
  }

  onVolumeChange(element: ExtendedHTMLMediaElement, callback: VolumeChangeHandler): () => void {
    const cleanup = this.setupVolumeChangeListener(element);
    const handlers = this.volumeChangeHandlers.get(element) || new Set();
    handlers.add(callback);
    
    // Initial callback with current volume
    try {
      callback(element.volume);
    } catch (error) {
      this.handleError(error as Error);
    }

    return () => {
      handlers.delete(callback);
      if (handlers.size === 0) {
        cleanup();
      }
    };
  }

  async listOutputs(): Promise<MediaDeviceInfo[]> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'audiooutput');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async setOutput(element: ExtendedHTMLMediaElement, deviceId: string): Promise<void> {
    try {
      if (typeof (element as any).setSinkId !== 'function') {
        throw new Error('Audio output device selection is not supported in this browser.');
      }
      await (element as any).setSinkId(deviceId);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  getVolume(element: ExtendedHTMLMediaElement): number {
    return element.volume;
  }

  setVolume(element: ExtendedHTMLMediaElement, volume: number): void {
    try {
      element.volume = Math.max(0, Math.min(1, volume));
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  isMuted(element: ExtendedHTMLMediaElement): boolean {
    return element.muted;
  }

  setMuted(element: ExtendedHTMLMediaElement, muted: boolean): void {
    try {
      element.muted = muted;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
}

export default AudioService;
