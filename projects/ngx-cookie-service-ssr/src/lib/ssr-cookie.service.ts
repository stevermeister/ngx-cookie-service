import { CookieOptions, Request, Response } from 'express';
import { Inject, Injectable, InjectionToken, Optional, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

// Define the `Request` and `Response` token
export const REQUEST = new InjectionToken<Request>('REQUEST');
export const RESPONSE = new InjectionToken<Response>('RESPONSE');

@Injectable({
  providedIn: 'root',
})
export class SsrCookieService {
  private readonly documentIsAccessible: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    // Get the `PLATFORM_ID` so we can check if we're in a browser.
    @Inject(PLATFORM_ID) private platformId: any,
    @Optional() @Inject(REQUEST) private request: Request,
    @Optional() @Inject(RESPONSE) private response: Response
  ) {
    this.documentIsAccessible = isPlatformBrowser(this.platformId);
  }

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
    const escapedName: string = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/gi, '\\$1');

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
   * Converts the provided cookie string to a key-value representation.
   *
   * @param cookieString - A concatenated string of cookies
   * @returns Map - Key-value pairs of the provided cookies
   *
   * @author: Blake Ballard (blakeoxx)
   * @since: 16.2.0
   * @see {@link https://github.com/stevermeister/ngx-cookie-service/blob/f7625d789dc18ea6aebcf136edb4cc01eeac5de9/projects/ngx-cookie-service-ssr/src/lib/ssr-cookie.service.ts#L100}
   *  for previous implementation of parsing logic
   */
   static cookieStringToMap(cookieString: string): Map<string, string> {
    const cookies = new Map<string, string>;

    if (cookieString?.length < 1) {
      return cookies;
    }

    cookieString.split(';').forEach((currentCookie) => {
      let [cookieName, cookieValue] = currentCookie.split('=');

      // Remove any extra spaces from the beginning of cookie names. These are a side effect of browser/express cookie concatenation
      cookieName = cookieName.replace(/^ +/, '');

      cookies.set(SsrCookieService.safeDecodeURIComponent(cookieName), SsrCookieService.safeDecodeURIComponent(cookieValue));
    });

    return cookies;
  }

  /**
   * Gets the current state of all cookies based on the request and response. Cookies added or changed in the response
   * override any old values provided in the response.
   *
   * Client-side will always just return the document's cookies.
   *
   * @private
   * @returns Map - All cookies from the request and response (or document) in key-value form.
   *
   * @author: Blake Ballard (blakeoxx)
   * @since: 16.2.0
   * @see {@link https://github.com/stevermeister/ngx-cookie-service/blob/f7625d789dc18ea6aebcf136edb4cc01eeac5de9/projects/ngx-cookie-service-ssr/src/lib/ssr-cookie.service.ts#L100}
   *  for previous implementation of parsing logic
   */
  private getCombinedCookies(): Map<string, string> {
    if (this.documentIsAccessible) {
      return SsrCookieService.cookieStringToMap(this.document.cookie);
    }

    const requestCookies = SsrCookieService.cookieStringToMap(this.request?.headers.cookie || '');

    let responseCookies: string | string[] = (this.response?.get('Set-Cookie') || []);
    if (!Array.isArray(responseCookies)) {
      responseCookies = [responseCookies];
    }

    let allCookies = new Map(requestCookies);
    // Parse and merge response cookies with request cookies
    responseCookies.forEach((currentCookie) => {
      // Response cookie headers represent individual cookies and their options, so we parse them similar to other cookie strings, but slightly different
      let [cookieName, cookieValue] = currentCookie.split(';')[0].split('=');
      if (cookieName !== '') {
        allCookies.set(SsrCookieService.safeDecodeURIComponent(cookieName), SsrCookieService.safeDecodeURIComponent(cookieValue));
      }
    });

    return allCookies;
  }

  /**
   * Saves a cookie to the client-side document
   *
   * @param name
   * @param value
   * @param options
   * @private
   *
   * @author: Blake Ballard (blakeoxx)
   * @since: 16.2.0
   * @see {@link set} for the original client-side cookie setter logic. This logic is mostly straight from there
   */
  private setClientCookie(
    name: string,
    value: string,
    options: {
      expires?: number | Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'Lax' | 'None' | 'Strict';
      partitioned?: boolean;
    } = {}
  ): void {
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

    if (!options.sameSite) {
      options.sameSite = 'Lax';
    }

    cookieString += 'sameSite=' + options.sameSite + ';';

    if (options.partitioned) {
      cookieString += 'Partitioned;';
    }

    this.document.cookie = cookieString;
  }

  /**
   * Saves a cookie to the server-side response cookie headers
   *
   * @param name
   * @param value
   * @param options
   * @private
   *
   * @author: Blake Ballard (blakeoxx)
   * @since: 16.2.0
   */
  private setServerCookie(
    name: string,
    value: string,
    options: {
      expires?: number | Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'Lax' | 'None' | 'Strict';
      partitioned?: boolean;
    } = {}
  ): void {
    const expressOptions: CookieOptions = {};

    if (options.expires) {
      if (typeof options.expires === 'number') {
        expressOptions.expires = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);
      } else {
        expressOptions.expires = options.expires;
      }
    }

    if (options.path) {
      expressOptions.path = options.path;
    }

    if (options.domain) {
      expressOptions.domain = options.domain;
    }

    if (options.secure) {
      expressOptions.secure = options.secure;
    }

    if (options.sameSite) {
      expressOptions.sameSite = options.sameSite.toLowerCase() as ('lax' | 'none' | 'strict');
    }

    if (options.partitioned) {
      expressOptions.partitioned = options.partitioned;
    }

    this.response?.cookie(name, value, expressOptions);
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
    const allCookies = this.getCombinedCookies();
    return allCookies.has(name);
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
    const allCookies = this.getCombinedCookies();
    return (allCookies.get(name) || '');
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
    const allCookies = this.getCombinedCookies();
    return Object.fromEntries(allCookies);
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
    if (typeof expiresOrOptions === 'number' || expiresOrOptions instanceof Date || path || domain || secure || sameSite) {
      const optionsBody = {
        expires: expiresOrOptions,
        path,
        domain,
        secure,
        sameSite: sameSite ? sameSite : 'Lax',
        partitioned,
      };

      this.set(name, value, optionsBody);
      return;
    }

    if (this.documentIsAccessible) {
      this.setClientCookie(name, value, expiresOrOptions);
    } else {
      this.setServerCookie(name, value, expiresOrOptions);
    }
  }

  /**
   * Delete cookie by name
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
    const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
    this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
  }

  /**
   * Delete all cookies
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
    const cookies: any = this.getAll();

    for (const cookieName in cookies) {
      if (cookies.hasOwnProperty(cookieName)) {
        this.delete(cookieName, path, domain, secure, sameSite);
      }
    }
  }
}
