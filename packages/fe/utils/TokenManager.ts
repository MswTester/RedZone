import HttpService from '../services/network/HttpService';
import CookieService from '../services/storage/CookieService';
import { type RefreshResponse, RefreshResponseSchema } from '../schemas/auth';

export default class TokenManager {
  private static accessToken: string | null = null;
  private static expiresAt: number | null = null;

  private static readonly http = new HttpService();
  private static readonly cookie = new CookieService();
  private static readonly EXPIRY_BUFFER_MS = 5_000; // 5초 여유

  private static refreshing: Promise<string | null> | null = null;
  private static listeners: Array<() => void> = [];

  /* ---------- Public API ---------- */
  static async initialize(): Promise<boolean> {
    const token = await this.refresh();
    return token !== null;
  }

  static async getValidAccessToken(): Promise<string | null> {
    if (this.isAccessTokenValid()) return this.accessToken;
    return this.refresh();
  }

  static onAuthExpired(cb: () => void): void {
    this.listeners.push(cb);
  }

  /* ---------- Internal ---------- */
  private static isAccessTokenValid(): boolean {
    return (
      this.accessToken !== null &&
      this.expiresAt !== null &&
      Date.now() < this.expiresAt - TokenManager.EXPIRY_BUFFER_MS
    );
  }

  private static async refresh(): Promise<string | null> {
    if (this.refreshing) return this.refreshing;

    this.refreshing = (async () => {
      try {
        const res = await TokenManager.http.post<RefreshResponse>(
          '/auth/refresh', {}, RefreshResponseSchema
        );
        const parsed = res.data!;

        this.accessToken = parsed.accessToken;
        this.expiresAt = Date.now() + parsed.expiresIn;

        await TokenManager.cookie.set('access_token', this.accessToken, { sameSite: 'Lax', path: '/' });
        return this.accessToken;
      } catch (err: any) {
        if (err?.response?.status === 401) this.emitAuthExpired();
        console.error('Token refresh failed', err);
      }
      this.accessToken = null;
      this.expiresAt = null;
      return null;
    })();

    const result = await this.refreshing;
    this.refreshing = null;
    return result;
  }

  private static emitAuthExpired() {
    this.listeners.forEach((cb) => cb());
  }
}
