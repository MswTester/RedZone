import type { IStorageService } from './types';

export default class WebStorageService implements IStorageService {
  private readonly bucket: Storage;
  
  constructor(bucket: Storage) {
    this.bucket = bucket;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const raw = this.bucket.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    this.bucket.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    this.bucket.removeItem(key);
  }

  async clear(): Promise<void> {
    this.bucket.clear();
  }

  static create(bucket: Storage): IStorageService {
    return new WebStorageService(bucket);
  }
}
