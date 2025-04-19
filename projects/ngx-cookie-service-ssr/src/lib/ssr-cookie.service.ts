import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SsrCookieService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request: any = inject(REQUEST, { optional: true }); // Use 'any' for flexibility
  private readonly documentIsAccessible: boolean = isPlatformBrowser(this.platformId);

  /** Get cookie RegExp */
  static getCookieRegExp(name: string): RegExp {
    const escapedName: string = name.replace(/([\[\]{}()|=;+?,.*^$])/gi, '\\$1');
    return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
  }

  /** Safely decode URI component */
  static safeDecodeURIComponent(encodedURIComponent: string): string {
    try {
      return decodeURIComponent(encodedURIComponent);
    } catch {
      return encodedURIComponent; // Not URI encoded
    }
  }

  /** Safely gets cookie string from SSR request headers */
  private _getCookieStringFromSsrRequest(): string | null {
    if (!this.request || !this.request.headers) {
      return null;
    }
    const headers = this.request.headers;
    // Check for Headers object with .get()
    if (typeof headers.get === 'function') {
      return headers.get('cookie');
    }
    // Check for plain object with 'cookie' or 'Cookie' key
    if (typeof headers === 'object' && headers !== null) {
        return headers['cookie'] || headers['Cookie'] || null;
    }
    return null; // Unexpected headers format
  }

  /** Check if cookie exists */
  check(name: string): boolean {
    name = encodeURIComponent(name);
    const regExp: RegExp = SsrCookieService.getCookieRegExp(name);
    const cookieString = this.documentIsAccessible ? this.document.cookie : this._getCookieStringFromSsrRequest();
    return cookieString ? regExp.test(cookieString) : false;
  }

  /** Get cookie by name */
  get(name: string): string {
    if (this.check(name)) {
      name = encodeURIComponent(name);
      const regExp: RegExp = SsrCookieService.getCookieRegExp(name);
      const cookieString = this.documentIsAccessible ? this.document.cookie : this._getCookieStringFromSsrRequest();
      const result = cookieString ? regExp.exec(cookieString) : null;
      return result && result[1] ? SsrCookieService.safeDecodeURIComponent(result[1]) : '';
    }
    return '';
  }

  /** Get all cookies as object */
  getAll(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    const cookieString: string | null = this.documentIsAccessible ? this.document?.cookie : this._getCookieStringFromSsrRequest();

    if (cookieString && cookieString !== '') {
      cookieString.split(';').forEach((currentCookie: string) => {
        const index = currentCookie.indexOf('=');
        if (index > 0) {
            const cookieName = currentCookie.substring(0, index);
            const cookieValue = currentCookie.substring(index + 1);
            cookies[SsrCookieService.safeDecodeURIComponent(cookieName.trim())] = SsrCookieService.safeDecodeURIComponent(cookieValue);
        } else if (currentCookie.trim() !== '') {
            cookies[SsrCookieService.safeDecodeURIComponent(currentCookie.trim())] = ''; // Handle flags
        }
      });
    }
    return cookies;
  }

  /** Set cookie (Browser only for this implementation) */
  set(
    name: string,
    value: string,
    expires?: number | Date,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite?: 'Lax' | 'None' | 'Strict',
    partitioned?: boolean
  ): void;
  set(
    name: string,
    value: string,
    options?: {
      expires?: number | Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'Lax' | 'None' | 'Strict';
      partitioned?: boolean;
    }
  ): void;
  set(
    name: string,
    value: string,
    expiresOrOptions?: number | Date | any,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite?: 'Lax' | 'None' | 'Strict',
    partitioned?: boolean
  ): void {
    if (!this.documentIsAccessible) {
      return; // No SSR set implementation needed for this fix
    }

    // Normalize arguments
    let options = {};
    if (typeof expiresOrOptions === 'object' && expiresOrOptions !== null && !(expiresOrOptions instanceof Date)) {
      options = expiresOrOptions;
    } else {
      options = {
        expires: expiresOrOptions,
        path: path,
        domain: domain,
        secure: secure,
        sameSite: sameSite || 'Lax', // Default to Lax
        partitioned: partitioned
      };
    }

    let cookieString: string = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';

    if (options['expires']) {
      if (typeof options['expires'] === 'number') {
        const dateExpires: Date = new Date(new Date().getTime() + options['expires'] * 1000 * 60 * 60 * 24);
        cookieString += 'expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'expires=' + options['expires'].toUTCString() + ';';
      }
    }
    if (options['path']) { cookieString += 'path=' + options['path'] + ';'; }
    if (options['domain']) { cookieString += 'domain=' + options['domain'] + ';'; }

    // Ensure sameSite is set, default to Lax
    options['sameSite'] = options['sameSite'] || 'Lax';

    // Force secure if SameSite=None
    if (options['secure'] === false && options['sameSite'] === 'None') {
      options['secure'] = true;
      console.warn(
        `[ngx-cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.`
      );
    }
    if (options['secure']) { cookieString += 'secure;'; }

    cookieString += 'sameSite=' + options['sameSite'] + ';';

    if (options['partitioned']) {
      cookieString += 'Partitioned;';
    }

    this.document.cookie = cookieString;
  }

  /** Delete cookie (Browser only) */
  delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
    if (!this.documentIsAccessible) {
      return;
    }
    const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
    // Use the object overload of set for options
    this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
  }

  /** Delete all cookies (Browser only) */
  deleteAll(path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
    if (!this.documentIsAccessible) {
      return;
    }
    const cookies: any = this.getAll(); // getAll uses the safe SSR logic
    for (const cookieName in cookies) {
      // Check if cookieName is a real property before deleting
      if (Object.prototype.hasOwnProperty.call(cookies, cookieName)) {
        this.delete(cookieName, path, domain, secure, sameSite);
      }
    }
  }
}
