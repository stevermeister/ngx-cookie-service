import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { CookieOptions } from './cookie.service';

/**
 * App-wide default options for {@link CookieService}. Provide them with {@link provideCookieOptions}.
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
export const COOKIE_OPTIONS = new InjectionToken<CookieOptions>('ngx-cookie-service default cookie options');

/**
 * Sets default options for every `set()`, `delete()` and `deleteAll()` call of {@link CookieService}.
 *
 * Options passed to a call win over these defaults, and `undefined` values don't override them. A call that passes its own
 * `expires` replaces the default one, so `delete()` always expires the cookie.
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
