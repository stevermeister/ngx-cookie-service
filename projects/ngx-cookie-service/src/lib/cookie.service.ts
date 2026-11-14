import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { COOKIE_ENCODING, COOKIE_OPTIONS, CookieCodec, CookieEncoding } from './cookie.config';

export type SameSite = 'Lax' | 'None' | 'Strict';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: SameSite;
  partitioned?: boolean;
}

/**
 * Attributes that identify the cookie to delete. They must match the attributes the cookie was set with.
 */
export type DeleteCookieOptions = Omit<CookieOptions, 'expires'>;

/**
 * Cookie options after validation: invalid values are removed and `expires` is always a `Date`.
 */
type ValidCookieOptions = Omit<CookieOptions, 'expires'> & { expires?: Date };

/**
 * The `SameSite` values browsers accept, in their canonical spelling.
 */
const SAME_SITE_VALUES: readonly SameSite[] = ['Lax', 'Strict', 'None'];

/**
 * RFC 6265 cookie-octets except `%`: values made only of these are written as-is by the `'minimal'` encoding and still
 * decode to themselves. Same pattern as the jshttp `cookie` package (2.x) used by Express.
 */
const COOKIE_OCTET_REGEXP = /^[!#$&'()*+\-./0-9:<=>?@A-Z[\]^_`a-z{|}~]*$/;

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private readonly documentIsAccessible: boolean;
  private readonly document = inject<Document>(DOCUMENT);
  private readonly platformId = inject<object>(PLATFORM_ID);
  private readonly defaultOptions: CookieOptions = inject(COOKIE_OPTIONS, { optional: true }) ?? {};
  private readonly codec: CookieCodec = CookieService.toCodec(inject(COOKIE_ENCODING, { optional: true }));

  constructor() {
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
  private static getCookieRegExp(name: string): RegExp {
    const escapedName: string = name.replace(/([[\]{}()|=;+?,.*^$\\])/gi, '\\$1');

    return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)');
  }

  /**
   * Gets the decoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @param encodedURIComponent A value representing an encoded URI component.
   *
   * @returns The decoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  private static safeDecodeURIComponent(encodedURIComponent: string): string {
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
    if (!this.documentIsAccessible) {
      return false;
    }
    name = encodeURIComponent(name);
    const regExp = CookieService.getCookieRegExp(name);
    return regExp.test(this.document.cookie);
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
      const regExp: RegExp = CookieService.getCookieRegExp(encodeURIComponent(name));
      const result = regExp.exec(this.document.cookie);
      return result?.[1] ? this.decodeValue(result[1], name) : '';
    } else {
      return '';
    }
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
    if (!this.documentIsAccessible) {
      return {};
    }

    const cookies: Record<string, string> = {};
    const document: Document = this.document;

    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((currentCookie: string) => {
        const trimmedCookie = currentCookie.trim();
        if (!trimmedCookie) {
          return;
        }
        // Split on the first '=' only, so values containing '=' (e.g. base64 padding) are preserved
        const equalIndex = trimmedCookie.indexOf('=');
        if (equalIndex === -1) {
          // Cookie without value (invalid, but handle gracefully)
          return;
        }
        const cookieName = CookieService.safeDecodeURIComponent(trimmedCookie.substring(0, equalIndex));
        // Browsers list the most specific cookie first when several share a name. Keep that one, as get() does.
        if (Object.hasOwn(cookies, cookieName)) {
          return;
        }
        // defineProperty stores names such as "__proto__" as normal entries instead of touching the object's prototype
        Object.defineProperty(cookies, cookieName, {
          value: this.decodeValue(trimmedCookie.substring(equalIndex + 1), cookieName),
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
   * @param name     Cookie name
   * @param value    Cookie value
   * @param expires  Number of days until the cookies expires or an actual `Date`
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Secure flag
   * @param partitioned Partitioned flag
   * @param sameSite OWASP same site token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   *
   * @author: Stepan Suvorov
   * @since: 1.0.0
   */
  set(
    name: string,
    value: string,
    expires?: CookieOptions['expires'],
    path?: CookieOptions['path'],
    domain?: CookieOptions['domain'],
    secure?: CookieOptions['secure'],
    sameSite?: SameSite,
    partitioned?: CookieOptions['partitioned']
  ): void;

  /**
   * Set cookie based on provided information
   *
   * Cookie's parameters:
   * <pre>
   * expires  Number of days until the cookies expires or an actual `Date`
   * path     Cookie path
   * domain   Cookie domain
   * secure flag
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
    expiresOrOptions?: CookieOptions['expires'] | CookieOptions,
    path?: CookieOptions['path'],
    domain?: CookieOptions['domain'],
    secure?: CookieOptions['secure'],
    sameSite?: SameSite,
    partitioned?: CookieOptions['partitioned']
  ): void {
    if (!this.documentIsAccessible) {
      return;
    }

    // Anything but an options object means the positional form, so no positional argument (e.g. a lone `partitioned`) is dropped
    if (typeof expiresOrOptions !== 'object' || expiresOrOptions === null || expiresOrOptions instanceof Date) {
      const optionsBody = {
        expires: expiresOrOptions as CookieOptions['expires'],
        path,
        domain,
        secure,
        sameSite,
        partitioned,
      };

      this.set(name, value, optionsBody);
      return;
    }

    // validateOptions() returns a copy, so the defaults applied below don't leak back into the caller's object
    const options = CookieService.validateOptions(name, CookieService.withDefaults(this.defaultOptions, expiresOrOptions));
    if (!options) {
      return;
    }

    const encodedValue = this.encodeValue(name, value);
    if (encodedValue === undefined) {
      return;
    }

    let cookieString: string = encodeURIComponent(name) + '=' + encodedValue + ';';

    if (options.expires) {
      cookieString += 'Expires=' + options.expires.toUTCString() + ';';
    }

    if (options.path) {
      cookieString += 'Path=' + options.path + ';';
    }

    if (options.domain) {
      cookieString += 'Domain=' + options.domain + ';';
    }

    if (options.sameSite === 'None' && !options.secure) {
      options.secure = true;
      console.warn(
        `[ngx-cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.` +
          `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`
      );
    }
    if (options.partitioned && !options.secure) {
      options.secure = true;
      console.warn(`[ngx-cookie-service] Cookie ${name} was forced with secure flag because Partitioned cookies must be Secure.`);
    }
    if (options.secure) {
      cookieString += 'Secure;';
    }

    if (!options.sameSite) {
      options.sameSite = 'Lax';
    }

    cookieString += 'SameSite=' + options.sameSite + ';';

    if (options.partitioned) {
      cookieString += 'Partitioned;';
    }

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
  delete(name: string, path?: CookieOptions['path'], domain?: CookieOptions['domain'], secure?: CookieOptions['secure'], sameSite?: SameSite): void;

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

  delete(
    name: string,
    pathOrOptions?: CookieOptions['path'] | DeleteCookieOptions,
    domain?: CookieOptions['domain'],
    secure?: CookieOptions['secure'],
    sameSite?: SameSite
  ): void {
    if (!this.documentIsAccessible) {
      return;
    }
    const options = CookieService.toDeleteOptions(pathOrOptions, domain, secure, sameSite);
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
  deleteAll(path?: CookieOptions['path'], domain?: CookieOptions['domain'], secure?: CookieOptions['secure'], sameSite?: SameSite): void;

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

  deleteAll(
    pathOrOptions?: CookieOptions['path'] | DeleteCookieOptions,
    domain?: CookieOptions['domain'],
    secure?: CookieOptions['secure'],
    sameSite?: SameSite
  ): void {
    if (!this.documentIsAccessible) {
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
   * Built-in `'uri'` encoding: `encodeURIComponent`, decoded with {@link CookieService.safeDecodeURIComponent}.
   */
  private static readonly uriCodec: CookieCodec = {
    encode: (value) => encodeURIComponent(value),
    decode: (value) => CookieService.safeDecodeURIComponent(value),
  };

  /**
   * Built-in `'minimal'` encoding: values made only of cookie-octets are written as-is, others use `encodeURIComponent`.
   */
  private static readonly minimalCodec: CookieCodec = {
    encode: (value) => (COOKIE_OCTET_REGEXP.test(value) ? value : encodeURIComponent(value)),
    decode: (value) => CookieService.safeDecodeURIComponent(value),
  };

  /**
   * Resolves the encoding provided with {@link provideCookieEncoding} to a codec, defaulting to `'uri'`.
   *
   * @param encoding Provided encoding, or `null` when none was provided
   * @returns The codec to use
   *
   * @author: Pavankumar Jadda
   * @since: 22.2.0
   */
  private static toCodec(encoding: CookieEncoding | null): CookieCodec {
    if (encoding === 'minimal') {
      return CookieService.minimalCodec;
    }
    if (typeof encoding === 'object' && encoding !== null) {
      return encoding;
    }
    return CookieService.uriCodec;
  }

  /**
   * Encodes a cookie value with the configured encoding. Returns `undefined`, with a warning, when the result can't be
   * written safely because it isn't a string or contains `;` or a control character.
   *
   * @param name  Cookie name
   * @param value Cookie value
   * @returns The encoded value, or `undefined` to skip the write
   *
   * @author: Pavankumar Jadda
   * @since: 22.2.0
   */
  private encodeValue(name: string, value: string): string | undefined {
    const encodedValue = this.codec.encode(value, name);
    if (typeof encodedValue !== 'string' || CookieService.hasUnsafeCharacter(encodedValue)) {
      console.warn(`[ngx-cookie-service] Cookie ${name} was skipped because its encoded value isn't a string without ";" or control characters.`);
      return undefined;
    }
    return encodedValue;
  }

  /**
   * Decodes a cookie value with the configured encoding. If a custom `decode` throws, the raw value is returned.
   *
   * @param value Raw cookie value
   * @param name  Decoded cookie name
   * @returns The decoded value
   *
   * @author: Pavankumar Jadda
   * @since: 22.2.0
   */
  private decodeValue(value: string, name: string): string {
    try {
      return this.codec.decode(value, name);
    } catch {
      return value;
    }
  }

  /**
   * Merges the app-wide defaults from {@link provideCookieOptions} under the options of one call.
   *
   * Values passed to the call win, and `undefined` or `null` values don't override a default.
   *
   * @param defaults Default cookie options
   * @param options  Options passed to the call
   * @returns A new, merged CookieOptions object
   *
   * @author: Pavankumar Jadda
   * @since: 22.2.0
   */
  private static withDefaults(defaults: CookieOptions, options: CookieOptions = {}): CookieOptions {
    const merged: Record<string, unknown> = { ...defaults };
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null) {
        merged[key] = value;
      }
    }
    return merged as CookieOptions;
  }

  /**
   * Returns a validated copy of the options, or `undefined` if the cookie must not be written.
   *
   * A `path` or `domain` containing `;` or a control character could inject attributes or change the cookie's scope, so the
   * whole write is skipped. An invalid `expires` is dropped, which makes a session cookie as browsers already did, and an
   * unknown `sameSite` falls back to the `Lax` default. Each case logs a warning. A numeric `expires` (days
   * from now) is converted to a `Date`, and `sameSite` is matched case-insensitively.
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
      if (typeof attributeValue === 'string' && CookieService.hasUnsafeCharacter(attributeValue)) {
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
  private static toDeleteOptions(
    pathOrOptions?: CookieOptions['path'] | DeleteCookieOptions,
    domain?: CookieOptions['domain'],
    secure?: CookieOptions['secure'],
    sameSite?: SameSite
  ): DeleteCookieOptions {
    if (typeof pathOrOptions === 'object' && pathOrOptions !== null) {
      return { ...pathOrOptions };
    }
    return { path: pathOrOptions, domain, secure, sameSite };
  }
}
