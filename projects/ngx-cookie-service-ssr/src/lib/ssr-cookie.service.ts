import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
// Using 'any' for request type to handle different environments (e.g., express, other frameworks)
// import { Request } from 'express'; // No need to import if using 'any'

@Injectable({
  providedIn: 'root',
})
export class SsrCookieService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request: any = inject(REQUEST, { optional: true });
  private readonly documentIsAccessible: boolean = isPlatformBrowser(this.platformId);

  /**
   * Get cookie Regular Expression
   *
   * @param name Cookie name
   * @returns property RegExp
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  static getCookieRegExp(name: string): RegExp {
    const escapedName: string = name.replace(/([\[\]{}()|=;+?,.*^$])/gi, '\\$1');
    return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
  }

  /**
   * Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @param encodedURIComponent A value representing an encoded URI component.
   *
   * @returns The unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  static safeDecodeURIComponent(encodedURIComponent: string): string {
    try {
      return decodeURIComponent(encodedURIComponent);
    } catch {
      // probably it is not uri encoded. return as is
      return encodedURIComponent;
    }
  }

  /**
   * Safely retrieves the cookie string from the request headers during SSR.
   * Handles cases where headers might be a Headers object or a plain object.
   * @private
   * @returns The cookie header string or null if not found/accessible.
   *
   * @author: Cascade Fix for #346
   * @since: N/A (internal helper)
   */
  private _getCookieStringFromSsrRequest(): string | null {
    if (!this.request || !this.request.headers) {
      return null;
    }
    const headers = this.request.headers;

    // Check if headers object has a 'get' method (like Fetch API Headers)
    if (typeof headers.get === 'function') {
      return headers.get('cookie'); // .get() should handle case-insensitivity
    }

    // Check if it's a plain object with a 'cookie' or 'Cookie' key (like Node.js IncomingHttpHeaders)
    if (typeof headers === 'object' && headers !== null) {
       // Node.js headers are typically lowercased, but check both just in case
       return headers['cookie'] || headers['Cookie'] || null;
    }

    return null; // Return null if no cookie header found or headers format is unexpected
  }

  /**
   * Return `true` if {@link Document} is accessible, otherwise return `false`
   *
   * @param name Cookie name
   * @returns boolean - whether cookie with specified name exists
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  check(name: string): boolean {
    name = encodeURIComponent(name);
    const regExp: RegExp = SsrCookieService.getCookieRegExp(name);
    // Use helper for SSR, document.cookie for browser
    const cookieString = this.documentIsAccessible ? this.document.cookie : this._getCookieStringFromSsrRequest();
    // Test only if cookieString is valid
    return cookieString ? regExp.test(cookieString) : false;
  }

  /**
   * Get cookies by name
   *
   * @param name Cookie name
   * @returns property value
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  get(name: string): string {
    // Check uses the updated logic already
    if (this.check(name)) {
      name = encodeURIComponent(name);
      const regExp: RegExp = SsrCookieService.getCookieRegExp(name);
       // Use helper for SSR, document.cookie for browser
      const cookieString = this.documentIsAccessible ? this.document.cookie : this._getCookieStringFromSsrRequest();
      // Execute regex only if cookieString is valid
      const result = cookieString ? regExp.exec(cookieString) : null;
      return result && result[1] ? SsrCookieService.safeDecodeURIComponent(result[1]) : '';
    }
    return '';
  }

  /**
   * Get all cookies in JSON format
   *
   * @returns all the cookies in json
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  getAll(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    // Use helper for SSR, document.cookie for browser
    const cookieString: string | null = this.documentIsAccessible ? this.document?.cookie : this._getCookieStringFromSsrRequest();

    if (cookieString && cookieString !== '') {
      cookieString.split(';').forEach((currentCookie: string) => {
        const index = currentCookie.indexOf('=');
        if (index > 0) {
            const cookieName = currentCookie.substring(0, index).trim(); // Trim whitespace
            const cookieValue = currentCookie.substring(index + 1);
            cookies[SsrCookieService.safeDecodeURIComponent(cookieName)] = SsrCookieService.safeDecodeURIComponent(cookieValue);
        } else if (currentCookie.trim() !== '') {
            // Handle flags
            cookies[SsrCookieService.safeDecodeURIComponent(currentCookie.trim())] = '';
        }
      });
    }
    return cookies;
  }

  /**
   * Set cookie based on provided information
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param expires  Number of days until the cookies expires or an actual `Date`
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Secure flag
   * @param sameSite OWASP same site token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   * @param partitioned Partitioned flag
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
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

  /**
   * Set cookie based on provided information
   *
   * Cookie's parameters:
   * <pre>
   * expires  Number of days until the cookies expires or an actual `Date`
   * path     Cookie path
   * domain   Cookie domain
   * secure Cookie secure flag
   * sameSite OWASP same site token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   * </pre>
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param options  Body with cookie's params
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
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
    // Set implementation only affects browser, no change needed for SSR fix #346
    if (!this.documentIsAccessible) {
      return;
    }

    // Normalize arguments
    let options: any = {}; // Use 'any' for options flexibility
    if (typeof expiresOrOptions === 'object' && expiresOrOptions !== null && !(expiresOrOptions instanceof Date)) {
      options = expiresOrOptions;
    } else {
      options = {
        expires: expiresOrOptions,
        path,
        domain,
        secure,
        sameSite: sameSite || 'Lax', // Default to Lax if not provided in object or arg
        partitioned,
      };
    }

    let cookieString: string = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const dateExpires: Date = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);
        cookieString += 'expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'expires=' + options.expires.toUTCString() + ';';
      }
    }

    if (options.path) {
      cookieString += 'path=' + options.path + ';';
    }

    if (options.domain) {
      cookieString += 'domain=' + options.domain + ';';
    }

    // Ensure sameSite is set, default to Lax
    options.sameSite = options.sameSite || 'Lax';

    if (options.secure === false && options.sameSite === 'None') {
      options.secure = true;
      console.warn(
        `[ngx-cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.` +
          `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`
      );
    }
    if (options.secure) {
      cookieString += 'secure;';
    }

    cookieString += 'sameSite=' + options.sameSite + ';';

    if (options.partitioned) {
      cookieString += 'Partitioned;';
    }

    this.document.cookie = cookieString;
  }

  /**
   * Delete cookie by name at given path and domain. If not path is not specified, cookie at '/' path will be deleted.
   *
   * @param name   Cookie name
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure Cookie secure flag
   * @param sameSite Cookie sameSite flag - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
    // Delete implementation only affects browser, no change needed for SSR fix #346
    if (!this.documentIsAccessible) {
      return;
    }
    const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
    // Use the object overload of set for options
    this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
  }

  /**
   * Delete all cookies at given path and domain. If not path is not specified, all cookies at '/' path will be deleted.
   *
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure Is the Cookie secure
   * @param sameSite Is the cookie same site
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  deleteAll(path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
    // Delete implementation only affects browser, no change needed for SSR fix #346
    if (!this.documentIsAccessible) {
      return;
    }

    const cookies: any = this.getAll(); // Use existing getAll, which now safely handles SSR reads

    for (const cookieName in cookies) {
      // Use Object.prototype.hasOwnProperty.call for safety
      if (Object.prototype.hasOwnProperty.call(cookies, cookieName)) {
        this.delete(cookieName, path, domain, secure, sameSite);
      }
    }
  }
}
