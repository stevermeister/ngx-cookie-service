/**
 * @name CookieOptions
 * @description Interface for declaring the options of a cookie
 *
 * This interface contains the following optional properties:
 *
 * - **expires** - {number | Date} - Number of days until the cookies expires or an actual `Date`
 * - **path** - {string} - The cookie will only be available for this URL and all subdirectories
 * - **domain** - {string} - The cookie will only be available to this domain and its subdomains
 * - **secure** - {boolean} - When set to true, the cookie can only be transmitted over HTTPS
 * - **sameSite** - {'Lax' | 'Strict'} - When set to `Strict` the browser will not send this
 *   cookie along with cross-site requests
 */
export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict';
}
