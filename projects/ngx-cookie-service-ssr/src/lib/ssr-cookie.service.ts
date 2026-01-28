import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID, REQUEST, RESPONSE_INIT } from '@angular/core';

export type SameSite = 'Lax' | 'None' | 'Strict';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: SameSite;
  partitioned?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SsrCookieService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });
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
    const escapedName: string = name.replace(/([[\]{}()|=;+?,.*^$\\])/gi, '\\$1');

    return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)');
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
    return regExp.test(this.documentIsAccessible ? this.document.cookie : this.getRequestCookies());
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
    if (this.check(name)) {
      name = encodeURIComponent(name);
      const regExp: RegExp = SsrCookieService.getCookieRegExp(name);
      const result = regExp.exec(this.documentIsAccessible ? this.document.cookie : this.getRequestCookies());
      return result?.[1] ? SsrCookieService.safeDecodeURIComponent(result[1]) : '';
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
  getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieString: any = this.documentIsAccessible ? this.document?.cookie : this.getRequestCookies();

    if (cookieString && cookieString !== '') {
      cookieString.split(';').forEach((currentCookie: string) => {
        const trimmedCookie = currentCookie.trim();
        if (!trimmedCookie) {
          return;
        }
        // Find the first '=' to handle cookie values that contain '='
        const equalIndex = trimmedCookie.indexOf('=');
        if (equalIndex === -1) {
          // Cookie without value (invalid, but handle gracefully)
          return;
        }
        const cookieName = trimmedCookie.substring(0, equalIndex);
        const cookieValue = trimmedCookie.substring(equalIndex + 1);
        cookies[SsrCookieService.safeDecodeURIComponent(cookieName)] = SsrCookieService.safeDecodeURIComponent(cookieValue);
      });
    }

    return cookies;
  }

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
  set(name: string, value: string, options?: CookieOptions): void;

  set(
    name: string,
    value: string,
    expiresOrOptions?: number | Date | CookieOptions,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite?: SameSite,
    partitioned?: boolean
  ): void {
    const options = this.normalizeOptions(expiresOrOptions, path, domain, secure, sameSite, partitioned);

    if (!this.documentIsAccessible) {
      if (this.responseInit) {
        this.setServerCookie(name, value, options);
      }
      return;
    }

    // Warn if SameSite=None without Secure on browser
    if (options.sameSite === 'None' && !options.secure) {
      options.secure = true;
      console.warn(
        `[ngx-cookie-service] Cookie ${name} was forced with secure flag because SameSite=None.` +
          `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`
      );
    }

    const cookieString = this.buildCookieString(name, value, options);
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
    if (!this.documentIsAccessible && !this.responseInit) {
      return;
    }
    const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
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
    if (!this.documentIsAccessible && !this.responseInit) {
      return;
    }

    const cookies: any = this.getAll();

    for (const cookieName in cookies) {
      if (cookies.hasOwnProperty(cookieName)) {
        this.delete(cookieName, path, domain, secure, sameSite);
      }
    }
  }

  /**
   * Helper method to safely get cookies from request object
   * Handles both Angular's REQUEST interface (Web API Request) and Express's req interface
   */
  private getRequestCookies(): string | null {
    if (!this.request) {
      return null;
    }

    // Handle Web API Request object (Angular 19+ with AngularNodeAppEngine)
    // The REQUEST token provides a standard Web API Request object
    if (this.request.headers && typeof this.request.headers.get === 'function') {
      return this.request.headers.get('cookie');
    }

    // Handle Express request object (for backward compatibility or custom setups)
    const reqAny = this.request as any;
    if (typeof reqAny.get === 'function') {
      const cookie = reqAny.get('cookie') || reqAny.get('Cookie');
      if (cookie) {
        return cookie;
      }
    }

    // Handle direct headers object access (Express typically uses lowercase 'cookie')
    const headers = this.request.headers;
    if (headers && typeof headers === 'object') {
      // Check both lowercase and capitalized versions
      if ((headers as any)['cookie']) {
        return (headers as any)['cookie'];
      }
      if ((headers as any)['Cookie']) {
        return (headers as any)['Cookie'];
      }
    }
    return null;
  }

  /**
   * Helper method to set cookies on the server response
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param options  Cookie options
   *
   * @author: Pavankumar Jadda
   * @since: 21.2.0
   */
  private setServerCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (!this.responseInit) {
      return;
    }

    // SameSite=None requires Secure
    if (options.sameSite === 'None' && !options.secure) {
      options.secure = true;
    }

    const cookieString = this.buildCookieString(name, value, options);
    this.appendSetCookieHeader(cookieString);
  }

  /**
   * Normalizes cookie options from either an options object or individual parameters
   *
   * @param expiresOrOptions  Either a CookieOptions object, expiration (number of days or Date), or undefined
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Cookie secure flag
   * @param sameSite Cookie sameSite flag
   * @param partitioned Cookie partitioned flag
   * @returns Normalized CookieOptions object
   *
   * @author: Pavankumar Jadda
   * @since: 21.2.0
   */
  private normalizeOptions(
    expiresOrOptions?: number | Date | CookieOptions,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite?: SameSite,
    partitioned?: boolean
  ): CookieOptions {
    // If it's an object but not a Date, treat it as CookieOptions
    if (typeof expiresOrOptions === 'object' && !(expiresOrOptions instanceof Date)) {
      return { ...expiresOrOptions };
    }

    // Otherwise, it's either a number, Date, or undefined - build options from individual params
    return {
      expires: expiresOrOptions,
      path,
      domain,
      secure,
      sameSite,
      partitioned,
    };
  }

  /**
   * Builds a cookie string from name, value, and options
   *
   * @param name    Cookie name
   * @param value   Cookie value
   * @param options Cookie options
   * @returns Formatted cookie string
   *
   * @author: Pavankumar Jadda
   * @since: 21.2.0
   */
  private buildCookieString(name: string, value: string, options: CookieOptions = {}): string {
    let cookieString = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const dateExpires = new Date(Date.now() + options.expires * 1000 * 60 * 60 * 24);
        cookieString += 'Expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'Expires=' + options.expires.toUTCString() + ';';
      }
    }

    if (options.maxAge !== undefined) {
      cookieString += 'Max-Age=' + options.maxAge + ';';
    }

    if (options.path) {
      cookieString += 'Path=' + options.path + ';';
    }

    if (options.domain) {
      cookieString += 'Domain=' + options.domain + ';';
    }

    if (options.secure) {
      cookieString += 'Secure;';
    }

    cookieString += 'SameSite=' + (options.sameSite ?? 'Lax') + ';';

    if (options.partitioned) {
      cookieString += 'Partitioned;';
    }

    if (options.httpOnly) {
      cookieString += 'HttpOnly;';
    }

    return cookieString;
  }

  /**
   * Appends a Set-Cookie header to the response
   * Handles different header formats (Headers object, array, or plain object)
   *
   * @param cookieString The formatted cookie string to append
   *
   * @author: Pavankumar Jadda
   * @since: 21.2.0
   */
  private appendSetCookieHeader(cookieString: string): void {
    if (!this.responseInit) {
      return;
    }

    // Initialize headers if missing
    if (!this.responseInit.headers) {
      this.responseInit.headers = new Headers();
    }

    const headers = this.responseInit.headers;

    if (headers instanceof Headers) {
      headers.append('Set-Cookie', cookieString);
    } else if (Array.isArray(headers)) {
      // If it's an array (sequence of sequences), push new header
      (headers as string[][]).push(['Set-Cookie', cookieString]);
    } else {
      // Handle plain object format
      const headersObj = headers as Record<string, string | string[]>;
      const existing = headersObj['Set-Cookie'];
      if (existing) {
        headersObj['Set-Cookie'] = Array.isArray(existing)
          ? [...existing, cookieString]
          : [existing, cookieString];
      } else {
        headersObj['Set-Cookie'] = cookieString;
      }
    }
  }
}
