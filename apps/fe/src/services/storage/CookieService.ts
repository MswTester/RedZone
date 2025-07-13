import type { IStorageService } from './types';

export default class CookieService implements IStorageService {
  async get<T = any>(key: string): Promise<T | null> {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`));
    if (!match) return null;
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return decodeURIComponent(match[1]) as unknown as T;
    }
  }

  async set<T = any>(key: string, value: T, options: {
    path?: string;
    expires?: number | Date;
    sameSite?: 'Lax' | 'Strict' | 'None';
    secure?: boolean;
  } = {}): Promise<void> {
    if (typeof document === 'undefined') return;

    const opts = { path: '/', ...options };
    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;

    if (opts.expires) {
      const exp = typeof opts.expires === 'number' ? new Date(Date.now() + opts.expires).toUTCString() : opts.expires.toUTCString();
      cookie += `; expires=${exp}`;
    }
    cookie += `; path=${opts.path}`;
    if (opts.sameSite) cookie += `; samesite=${opts.sameSite}`;
    if (opts.secure) cookie += '; secure';
    
    document.cookie = cookie;
  }

  async remove(key: string): Promise<void> {
    await this.set(key, '', { expires: -1 });
  }
  
  async clear(): Promise<void> {
    if (typeof document === 'undefined') return;
    
    const cookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(c => c.includes('='));
    
    for (const cookie of cookies) {
      const [key] = cookie.split('=').map(k => k.trim());
      if (key) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  }
}
