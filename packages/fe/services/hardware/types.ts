// Common types
export type DeviceChangeCallback = () => void;
export type ErrorHandler = (error: Error) => void;
export type VolumeChangeHandler = (volume: number) => void;

// Track state for audio management
export interface TrackState {
  track: MediaStreamTrack;
  originalEnabled: boolean;
  volume: number;
}

// Media element with extended properties
export type ExtendedHTMLMediaElement = HTMLMediaElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

// Service interfaces
export interface IHardwareService {
  onDeviceChange(callback: DeviceChangeCallback): () => void;
  onError(handler: ErrorHandler): () => void;
}

export interface ICameraService extends IHardwareService {
  listCameras(): Promise<MediaDeviceInfo[]>;
  getStream(constraints?: MediaTrackConstraints): Promise<MediaStream>;
  stopStream(stream: MediaStream): void;
  getCapabilities(): Promise<MediaTrackCapabilities | null>;
}

export interface IMicrophoneService extends IHardwareService {
  listMicrophones(): Promise<MediaDeviceInfo[]>;
  getStream(constraints?: MediaTrackConstraints): Promise<MediaStream>;
  stopStream(stream: MediaStream): void;
  getCapabilities(): Promise<MediaTrackCapabilities | null>;
}

export interface IAudioService extends IHardwareService {
  listOutputs(): Promise<MediaDeviceInfo[]>;
  setOutput(element: HTMLMediaElement, deviceId: string): Promise<void>;
  getVolume(element: HTMLMediaElement): number;
  setVolume(element: HTMLMediaElement, volume: number): void;
  setMuted(element: HTMLMediaElement, muted: boolean): void;
  isMuted(element: HTMLMediaElement): boolean;
  onVolumeChange(element: HTMLMediaElement, callback: VolumeChangeHandler): () => void;
}
