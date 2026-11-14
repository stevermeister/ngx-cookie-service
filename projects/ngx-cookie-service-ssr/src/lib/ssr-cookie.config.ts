import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { CookieOptions } from './ssr-cookie.service';

/**
 * App-wide default options for {@link SsrCookieService}. Provide them with {@link provideCookieOptions}.
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
export const COOKIE_OPTIONS = new InjectionToken<CookieOptions>('ngx-cookie-service-ssr default cookie options');

/**
 * Sets default options for every `set()`, `delete()` and `deleteAll()` call of {@link SsrCookieService}, in the browser and
 * on the server.
 *
 * Options passed to a call win over these defaults, and `undefined` values don't override them. A call that passes its own
 * `expires` or `maxAge` replaces the default lifetime, so `delete()` always expires the cookie. A default `httpOnly: true`
 * also applies in the browser, where it makes `set()` skip the cookie with a warning.
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideCookieOptions({ path: '/', secure: true, sameSite: 'Strict' })],
 * };
 * ```
 *
 * @param options Default cookie options
 * @returns Providers to add to the application config
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
export function provideCookieOptions(options: CookieOptions): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: COOKIE_OPTIONS, useValue: { ...options } }]);
}

/**
 * A custom encoding for cookie values, used with {@link provideCookieEncoding}.
 *
 * `encode` runs on every value written by `set()`, and `decode` on every value read by `get()` and `getAll()`. Cookie names
 * keep the default encoding. If `decode` throws, the raw value is returned instead.
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
export interface CookieCodec {
  encode(value: string, name: string): string;
  decode(value: string, name: string): string;
}

/**
 * How {@link SsrCookieService} encodes cookie values:
 *
 * - `'uri'` (default): `encodeURIComponent` and `decodeURIComponent`.
 * - `'minimal'`: values made only of characters allowed in a cookie value (RFC 6265 cookie-octets, except `%`) are written
 *   as-is, and other values are encoded with `encodeURIComponent`. This is the default of the jshttp `cookie` package used
 *   by Express, and keeps values such as JWTs and base64 readable by servers that don't URL-decode cookies.
 * - A {@link CookieCodec} for a custom scheme.
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
export type CookieEncoding = 'uri' | 'minimal' | CookieCodec;

/**
 * The cookie value encoding for {@link SsrCookieService}. Provide it with {@link provideCookieEncoding}.
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
export const COOKIE_ENCODING = new InjectionToken<CookieEncoding>('ngx-cookie-service-ssr cookie value encoding');

/**
 * Sets how {@link SsrCookieService} encodes cookie values when writing them and decodes them when reading.
 *
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideCookieEncoding('minimal')],
 * };
 * ```
 *
 * @param encoding `'uri'` (default), `'minimal'`, or a custom {@link CookieCodec}
 * @returns Providers to add to the application config
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
export function provideCookieEncoding(encoding: CookieEncoding): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: COOKIE_ENCODING, useValue: encoding }]);
}
