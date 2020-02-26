import { InjectionToken } from '@angular/core';
import { CookieModel } from './cookie.model';

export const COOKIE_CONFIG_TOKEN = new InjectionToken('ngx-cookie-config');

export const defaultConfig: Partial<CookieModel> = {
  expires: new Date('Thu, 01 Jan 1970 00:00:01 GMT'),
  path: '/',
  secure: false,
  sameSite: 'Lax',
};
