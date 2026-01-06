import Cookies from 'js-cookie';

interface CookieStorageOptions {
  expires?: number | Date; // Days until expiry or Date object
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

class CookieStorage {
  private defaultOptions: CookieStorageOptions = {
    expires: 30, // 30 days default
    secure: window.location.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
  };

  constructor(options: CookieStorageOptions = {}) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  setItem(key: string, value: string, options: CookieStorageOptions = {}): void {
    const cookieOptions = { ...this.defaultOptions, ...options };
    Cookies.set(key, value, cookieOptions);
  }

  getItem(key: string): string | null {
    const value = Cookies.get(key);
    return value !== undefined ? value : null;
  }

  removeItem(key: string): void {
    Cookies.remove(key, { 
      path: this.defaultOptions.path,
      domain: this.defaultOptions.domain 
    });
  }

  clear(): void {
    // Get all cookies and remove them
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(key => {
      this.removeItem(key);
    });
  }

  key(index: number): string | null {
    const keys = Object.keys(Cookies.get());
    return keys[index] || null;
  }

  get length(): number {
    return Object.keys(Cookies.get()).length;
  }

  // Helper methods for JSON data
  setJSON(key: string, value: any, options: CookieStorageOptions = {}): void {
    this.setItem(key, JSON.stringify(value), options);
  }

  getJSON<T>(key: string): T | null {
    const value = this.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}

// Create a default instance that mimics localStorage behavior
export const cookieStorage = new CookieStorage();

// Export the class for custom instances
export { CookieStorage };

// Export a localStorage-compatible interface
export const createLocalStorageReplacement = (options: CookieStorageOptions = {}) => {
  const storage = new CookieStorage(options);
  
  return {
    setItem: (key: string, value: string) => storage.setItem(key, value),
    getItem: (key: string) => storage.getItem(key),
    removeItem: (key: string) => storage.removeItem(key),
    clear: () => storage.clear(),
    key: (index: number) => storage.key(index),
    get length() { return storage.length; }
  };
};