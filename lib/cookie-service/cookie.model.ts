export type CookieSiteType = 'Lax' | 'Strict';

export interface CookieModel {
  name: string;
  value: string;
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: CookieSiteType;
}
