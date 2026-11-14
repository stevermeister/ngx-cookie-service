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

/**
 * Attributes that identify the cookie to delete. They must match the attributes the cookie was set with.
 */
export type DeleteCookieOptions = Omit<CookieOptions, 'expires' | 'maxAge' | 'httpOnly'>;

/**
 * Cookie options after validation: invalid values are removed and `expires` is always a `Date`.
 */
type ValidCookieOptions = Omit<CookieOptions, 'expires'> & { expires?: Date };

/**
 * The `SameSite` values browsers accept, in their canonical spelling.
 */
const SAME_SITE_VALUES: readonly SameSite[] = ['Lax', 'Strict', 'None'];

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
    return regExp.test((this.documentIsAccessible ? this.document.cookie : this.getRequestCookies()) ?? '');
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
      const result = regExp.exec((this.documentIsAccessible ? this.document.cookie : this.getRequestCookies()) ?? '');
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
        const cookieName = SsrCookieService.safeDecodeURIComponent(trimmedCookie.substring(0, equalIndex));
        // Browsers list the most specific cookie first when several share a name. Keep that one, as get() does.
        if (Object.hasOwn(cookies, cookieName)) {
          return;
        }
        // defineProperty stores names such as "__proto__" as normal entries instead of touching the object's prototype
        Object.defineProperty(cookies, cookieName, {
          value: SsrCookieService.safeDecodeURIComponent(trimmedCookie.substring(equalIndex + 1)),
          enumerable: true,
          writable: true,
          configurable: true,
        });
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
    const options = SsrCookieService.validateOptions(name, this.normalizeOptions(expiresOrOptions, path, domain, secure, sameSite, partitioned));
    if (!options) {
      return;
    }

    if (!this.documentIsAccessible) {
      if (this.responseInit) {
        this.setServerCookie(name, value, options);
      }
      return;
    }

    // Browsers drop any cookie set from script with HttpOnly, so skip it instead of failing silently
    if (options.httpOnly) {
      console.warn(`[ngx-cookie-service] Cookie ${name} was not set because HttpOnly cookies can only be set by the server.`);
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
    if (options.partitioned && !options.secure) {
      options.secure = true;
      console.warn(`[ngx-cookie-service] Cookie ${name} was forced with secure flag because Partitioned cookies must be Secure.`);
    }

    const cookieString = this.buildCookieString(name, value, options);
    this.document.cookie = cookieString;
  }

  /**
   * Delete cookie by name at given path and domain.
   *
   * If `path` is not specified, no `Path` attribute is written and the browser uses its default path: the directory of the URL
   * the page was loaded at (not the current router URL). To delete a cookie that was set with `path: '/'`, pass `'/'` here too.
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
  delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite?: SameSite): void;

  /**
   * Delete cookie by name. The options must match the attributes the cookie was set with: `path` and `domain` select the
   * cookie, and `partitioned: true` is required to delete a Partitioned cookie.
   *
   * If `path` is not specified, no `Path` attribute is written and the browser uses its default path: the directory of the URL
   * the page was loaded at (not the current router URL). To delete a cookie that was set with `path: '/'`, pass `'/'` here too.
   *
   * @param name    Cookie name
   * @param options Cookie attributes: `path`, `domain`, `secure`, `sameSite` and `partitioned`
   *
   * @author: Pavankumar Jadda
   * @since: 22.1.0
   */
  delete(name: string, options?: DeleteCookieOptions): void;

  delete(name: string, pathOrOptions?: string | DeleteCookieOptions, domain?: string, secure?: boolean, sameSite: SameSite = 'Lax'): void {
    if (!this.documentIsAccessible && !this.responseInit) {
      return;
    }
    const options = SsrCookieService.toDeleteOptions(pathOrOptions, domain, secure, sameSite);
    this.set(name, '', { ...options, expires: new Date('Thu, 01 Jan 1970 00:00:01 GMT') });
  }

  /**
   * Delete all cookies at given path and domain.
   *
   * If `path` is not specified, the browser's default path is used for each cookie, as described for {@link delete}.
   *
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure Is the Cookie secure
   * @param sameSite Is the cookie same site
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  deleteAll(path?: string, domain?: string, secure?: boolean, sameSite?: SameSite): void;

  /**
   * Delete all cookies that can currently be accessed, using the same attributes for each one.
   *
   * If `path` is not specified, the browser's default path is used for each cookie, as described for {@link delete}.
   *
   * @param options Cookie attributes: `path`, `domain`, `secure`, `sameSite` and `partitioned`
   *
   * @author: Pavankumar Jadda
   * @since: 22.1.0
   */
  deleteAll(options?: DeleteCookieOptions): void;

  deleteAll(pathOrOptions?: string | DeleteCookieOptions, domain?: string, secure?: boolean, sameSite: SameSite = 'Lax'): void {
    if (!this.documentIsAccessible && !this.responseInit) {
      return;
    }

    // Object.keys() rather than for...in with cookies.hasOwnProperty(): a cookie named "hasOwnProperty" would shadow that method
    for (const cookieName of Object.keys(this.getAll())) {
      // Call delete() the same way deleteAll() was called, so overrides and spies of the positional form keep working
      if (typeof pathOrOptions === 'object' && pathOrOptions !== null) {
        this.delete(cookieName, pathOrOptions);
      } else {
        this.delete(cookieName, pathOrOptions, domain, secure, sameSite);
      }
    }
  }

  /**
   * Builds delete options from either an options object or the positional `path`, `domain`, `secure` and `sameSite` arguments.
   *
   * @param pathOrOptions Either a DeleteCookieOptions object or the cookie path
   * @param domain   Cookie domain
   * @param secure   Cookie secure flag
   * @param sameSite Cookie sameSite flag
   * @returns A new DeleteCookieOptions object
   *
   * @author: Pavankumar Jadda
   * @since: 22.1.0
   */
  private static toDeleteOptions(pathOrOptions?: string | DeleteCookieOptions, domain?: string, secure?: boolean, sameSite?: SameSite): DeleteCookieOptions {
    if (typeof pathOrOptions === 'object' && pathOrOptions !== null) {
      return { ...pathOrOptions };
    }
    return { path: pathOrOptions, domain, secure, sameSite };
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

    // SameSite=None and Partitioned cookies both require Secure
    if ((options.sameSite === 'None' || options.partitioned) && !options.secure) {
      options.secure = true;
    }

    const cookieString = this.buildCookieString(name, value, options);
    this.appendSetCookieHeader(cookieString);
  }

  /**
   * Returns a validated copy of the options, or `undefined` if the cookie must not be written.
   *
   * A `path` or `domain` containing `;` or a control character could inject attributes or change the cookie's scope, so the
   * whole write is skipped. An invalid `expires` or `maxAge` is dropped, which makes a session cookie as browsers already did,
   * and a `null` `maxAge` counts as absent. An unknown `sameSite` falls back to the `Lax` default. Each case logs a warning.
   * A numeric `expires` (days from now) is converted to a `Date`, and `sameSite` is matched case-insensitively.
   *
   * @param name    Cookie name, used in warnings
   * @param options Cookie options
   * @returns A validated copy of the options, or `undefined` to skip the write
   *
   * @author: Pavankumar Jadda
   * @since: 22.1.0
   */
  private static validateOptions(name: string, options: CookieOptions = {}): ValidCookieOptions | undefined {
    const { expires, ...valid }: CookieOptions = options;
    const result: ValidCookieOptions = valid;

    for (const attribute of ['path', 'domain'] as const) {
      const attributeValue = result[attribute];
      if (typeof attributeValue === 'string' && SsrCookieService.hasUnsafeCharacter(attributeValue)) {
        console.warn(`[ngx-cookie-service] Cookie ${name} was skipped because its ${attribute} contains ";" or a control character.`);
        return undefined;
      }
    }
    if (expires) {
      const date = typeof expires === 'number' ? new Date(Date.now() + expires * 1000 * 60 * 60 * 24) : expires;
      if (date instanceof Date && Number.isFinite(date.getTime())) {
        result.expires = date;
      } else {
        console.warn(`[ngx-cookie-service] Cookie ${name}: ignoring invalid expires value "${String(expires)}".`);
      }
    }
    if (result.maxAge === null) {
      delete result.maxAge;
    } else if (result.maxAge !== undefined && !Number.isSafeInteger(result.maxAge)) {
      console.warn(`[ngx-cookie-service] Cookie ${name}: ignoring invalid maxAge "${String(result.maxAge)}".`);
      delete result.maxAge;
    }
    if (result.sameSite !== undefined && result.sameSite !== null) {
      const sameSite = SAME_SITE_VALUES.find((value) => value.toLowerCase() === String(result.sameSite).toLowerCase());
      if (sameSite) {
        result.sameSite = sameSite;
      } else {
        console.warn(`[ngx-cookie-service] Cookie ${name}: ignoring invalid sameSite value "${String(result.sameSite)}".`);
        delete result.sameSite;
      }
    }
    return result;
  }

  /**
   * Whether a cookie attribute value contains `;` or an ASCII control character, which would end the attribute early or
   * corrupt the header.
   *
   * @param value Attribute value
   * @returns `true` if the value is unsafe to write
   *
   * @author: Pavankumar Jadda
   * @since: 22.1.0
   */
  private static hasUnsafeCharacter(value: string): boolean {
    return [...value].some((character) => {
      const code = character.charCodeAt(0);
      return character === ';' || code < 0x20 || code === 0x7f;
    });
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
    // If it's an object but not null or a Date, treat it as CookieOptions
    if (typeof expiresOrOptions === 'object' && expiresOrOptions !== null && !(expiresOrOptions instanceof Date)) {
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
        headersObj['Set-Cookie'] = Array.isArray(existing) ? [...existing, cookieString] : [existing, cookieString];
      } else {
        headersObj['Set-Cookie'] = cookieString;
      }
    }
  }
}
