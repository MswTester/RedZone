import WebStorageService from './WebStorageService';

export { default as CookieService } from './CookieService';
export { default as IndexedDbService } from './IndexedDbService';
export { WebStorageService };

export const localStorageService = typeof window !== 'undefined' 
  ? WebStorageService.create(window.localStorage) 
  : undefined;

export const sessionStorageService = typeof window !== 'undefined' 
  ? WebStorageService.create(window.sessionStorage) 
  : undefined;

export * from './types';
