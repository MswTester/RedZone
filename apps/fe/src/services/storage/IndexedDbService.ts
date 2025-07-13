import type { IStorageService } from './types';

export default class IndexedDbService implements IStorageService {
  private dbPromise: Promise<IDBDatabase>;

  constructor(name = 'app-db', version = 1) {
    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(name, version);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('kv');
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  }

  private async store() {
    const db = await this.dbPromise;
    return db.transaction('kv', 'readwrite').objectStore('kv');
  }

  async get<T = any>(key: string): Promise<T | null> {
    const store = await this.store();
    return new Promise((res, rej) => {
      const r = store.get(key);
      r.onerror = () => rej(r.error);
      r.onsuccess = () => res(r.result ?? null);
    });
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    const store = await this.store();
    return new Promise((res, rej) => {
      const r = store.put(value, key);
      r.onerror = () => rej(r.error);
      r.onsuccess = () => res();
    });
  }

  async remove(key: string): Promise<void> {
    const store = await this.store();
    return new Promise((res, rej) => {
      const r = store.delete(key);
      r.onerror = () => rej(r.error);
      r.onsuccess = () => res();
    });
  }

  async clear(): Promise<void> {
    const store = await this.store();
    return new Promise((res, rej) => {
      const r = store.clear();
      r.onerror = () => rej(r.error);
      r.onsuccess = () => res();
    });
  }
}
