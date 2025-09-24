// Cookie utility functions for client-side cookie management

export interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export class CookieManager {
  // Set a cookie
  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof window === "undefined") return; // Server-side guard

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}`;

    if (options.expires) {
      let expiresString: string;
      if (typeof options.expires === "number") {
        // If number, treat as days from now
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        expiresString = date.toUTCString();
      } else {
        // If Date object
        expiresString = options.expires.toUTCString();
      }
      cookieString += `; expires=${expiresString}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  // Get a cookie value
  static get(name: string): string | null {
    if (typeof window === "undefined") return null; // Server-side guard

    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  // Remove a cookie
  static remove(
    name: string,
    options: Pick<CookieOptions, "path" | "domain"> = {}
  ): void {
    if (typeof window === "undefined") return; // Server-side guard

    this.set(name, "", {
      ...options,
      expires: new Date(0), // Set to past date to delete
    });
  }

  // Get a cookie value and parse as JSON
  static getJSON<T>(name: string): T | null {
    const value = this.get(name);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // Set a cookie with JSON value
  static setJSON(
    name: string,
    value: unknown,
    options: CookieOptions = {}
  ): void {
    this.set(name, JSON.stringify(value), options);
  }

  // Check if a cookie exists
  static exists(name: string): boolean {
    return this.get(name) !== null;
  }

  // Get all cookies as an object
  static getAll(): Record<string, string> {
    if (typeof window === "undefined") return {}; // Server-side guard

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(";");

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      const [name, ...valueParts] = cookie.split("=");
      if (name && valueParts.length > 0) {
        const value = valueParts.join("=");
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }

  // Clear all cookies (warning: this removes ALL cookies from the domain)
  static clearAll(): void {
    if (typeof window === "undefined") return; // Server-side guard

    const cookies = this.getAll();
    for (const name in cookies) {
      this.remove(name);
      // Also try to remove with common paths
      this.remove(name, { path: "/" });
      this.remove(name, { path: "/", domain: window.location.hostname });
    }
  }
}

// User data interface for cookie storage
export interface UserCookieData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
  salonId: string;
}

// Cookie names constants
export const COOKIE_NAMES = {
  USER_DATA: "glowbridge_user_data",
  AUTH_TOKEN: "glowbridge_auth_token",
  SESSION_ID: "glowbridge_session_id",
} as const;

// User-specific cookie functions
export class UserCookies {
  // Store user data in cookie (expires in 30 days by default)
  static setUserData(userData: UserCookieData, days: number = 30): void {
    CookieManager.setJSON(COOKIE_NAMES.USER_DATA, userData, {
      expires: days,
      path: "/",
      secure: window.location.protocol === "https:", // Only secure on HTTPS
      sameSite: "lax",
    });
  }

  // Get user data from cookie
  static getUserData(): UserCookieData | null {
    return CookieManager.getJSON<UserCookieData>(COOKIE_NAMES.USER_DATA);
  }

  // Remove user data cookie
  static clearUserData(): void {
    CookieManager.remove(COOKIE_NAMES.USER_DATA, { path: "/" });
  }

  // Check if user is logged in (has user data cookie)
  static isLoggedIn(): boolean {
    return CookieManager.exists(COOKIE_NAMES.USER_DATA);
  }

  // Clear all user-related cookies
  static clearAllUserCookies(): void {
    CookieManager.remove(COOKIE_NAMES.USER_DATA, { path: "/" });
    CookieManager.remove(COOKIE_NAMES.AUTH_TOKEN, { path: "/" });
    CookieManager.remove(COOKIE_NAMES.SESSION_ID, { path: "/" });
  }

  // Set auth token cookie
  static setAuthToken(token: string, days: number = 30): void {
    CookieManager.set(COOKIE_NAMES.AUTH_TOKEN, token, {
      expires: days,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });
  }

  // Get auth token from cookie
  static getAuthToken(): string | null {
    return CookieManager.get(COOKIE_NAMES.AUTH_TOKEN);
  }
}
