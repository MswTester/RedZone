export interface IStorageService {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, options?: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
