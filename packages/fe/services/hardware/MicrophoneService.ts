import type { IMicrophoneService, TrackState } from './types';

class MicrophoneService implements IMicrophoneService {
  private deviceChangeListeners: Set<() => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();
  private trackStates: WeakMap<MediaStream, TrackState[]> = new WeakMap();

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
      const status = await (navigator as any).permissions.query({ name: 'microphone' });
      if (status.state === 'denied') {
        throw new DOMException('Microphone permission denied', 'NotAllowedError');
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async listMicrophones(): Promise<MediaDeviceInfo[]> {
    try {
      await this.ensurePermissions();
      await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => undefined);
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'audioinput');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async getStream(constraints: MediaTrackConstraints = {}): Promise<MediaStream> {
    try {
      await this.ensurePermissions();
      return await navigator.mediaDevices.getUserMedia({ audio: { ...constraints } });
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
      const [track] = stream.getAudioTracks();
      const capabilities = track.getCapabilities ? track.getCapabilities() : null;
      this.stopStream(stream);
      return capabilities;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  private initializeTrackStates(stream: MediaStream) {
    const tracks = stream.getAudioTracks();
    const states = tracks.map(track => ({
      track,
      originalEnabled: track.enabled,
      volume: 1.0
    }));
    this.trackStates.set(stream, states);
  }

  private getTrackStates(stream: MediaStream): TrackState[] {
    const states = this.trackStates.get(stream);
    if (!states || states.length === 0) {
      this.initializeTrackStates(stream);
      return this.trackStates.get(stream) || [];
    }
    return states;
  }

  setMuted(stream: MediaStream, muted: boolean): void {
    try {
      const states = this.getTrackStates(stream);
      states.forEach(state => {
        state.track.enabled = !muted;
      });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  isMuted(stream: MediaStream): boolean {
    const states = this.getTrackStates(stream);
    return states.every(state => !state.track.enabled);
  }

  getVolume(stream: MediaStream): number {
    const states = this.getTrackStates(stream);
    if (states.length === 0) return 1.0;
    return states[0].volume; // Assuming all tracks have same volume
  }

  setVolume(stream: MediaStream, volume: number): void {
    try {
      const normalizedVolume = Math.max(0, Math.min(1, volume));
      const states = this.getTrackStates(stream);
      
      states.forEach(state => {
        state.volume = normalizedVolume;
        // Apply volume using Web Audio API if available
        if (typeof (state.track as any).volume !== 'undefined') {
          (state.track as any).volume = normalizedVolume;
        }
      });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
}

export default MicrophoneService;
