// This service is based on the `ng2-cookies` package which sadly is not a service and does
// not use `DOCUMENT` injection and therefore doesn't work well with AoT production builds.
// Package: https://github.com/BCJTI/ng2-cookies

import { Injectable, Inject, PLATFORM_ID, InjectionToken } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SameSiteOptionKey } from '../types';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly documentIsAccessible: boolean;

  constructor(
    // The type `Document` may not be used here. Although a fix is on its way,
    // we will go with `any` for now to support Angular 2.4.x projects.
    // Issue: https://github.com/angular/angular/issues/12631
    // Fix: https://github.com/angular/angular/pull/14894
    @Inject( DOCUMENT ) private document: any,
    // Get the `PLATFORM_ID` so we can check if we're in a browser.
    @Inject( PLATFORM_ID ) private platformId: InjectionToken<object>,
  ) {
    this.documentIsAccessible = isPlatformBrowser( this.platformId );
  }

  /**
   * @param name Cookie name
   * @returns boolean - whether cookie with specified name exists
   */
  check( name: string ): boolean {
    if ( !this.documentIsAccessible ) {
      return false;
    }

    name = encodeURIComponent( name );

    const regExp: RegExp = this.getCookieRegExp( name );
    const exists: boolean = regExp.test( this.document.cookie );

    return exists;
  }

  /**
   * @param name Cookie name
   * @returns property value
   */
  get( name: string ): string {
    if ( this.documentIsAccessible && this.check( name ) ) {
      name = encodeURIComponent( name );

      const regExp: RegExp = this.getCookieRegExp( name );
      const result: RegExpExecArray = regExp.exec( this.document.cookie );

      try {
        return decodeURIComponent( result[ 1 ] );
      } catch (error) {
        // the cookie probably is not uri encoded. return as is
        return result[ 1 ];
      }
    } else {
      return '';
    }
  }

  /**
   * @returns all the cookies in json
   */
  getAll(): {[key: string]: string} {
    if ( !this.documentIsAccessible ) {
      return {};
    }

    const cookies: {[key: string]: string}  = {};
    const document: any = this.document;

    if ( document.cookie && document.cookie !== '' ) {
      document.cookie.split(';').forEach(currentCookie => {
        const [cookieName, cookieValue] = currentCookie.split('=');
        cookies[decodeURIComponent(cookieName.replace( /^ /, '' ))] = decodeURIComponent(cookieValue);
      });
    }

    return cookies;
  }

  /**
   * @param name     Cookie name
   * @param value    Cookie value
   * @param expires  Number of days until the cookies expires or an actual `Date`
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Secure flag
   * @param sameSite OWASP SameSite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   */
  set(
    name: string,
    value: string,
    expires?: number | Date,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite: SameSiteOptionKey = 'Lax'
  ): void {
    if ( !this.documentIsAccessible ) {
      return;
    }

    let cookieString: string = encodeURIComponent( name ) + '=' + encodeURIComponent( value ) + ';';

    if ( expires ) {
      if ( typeof expires === 'number' ) {
        const dateExpires: Date = new Date( new Date().getTime() + expires * 1000 * 60 * 60 * 24 );

        cookieString += 'expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'expires=' + expires.toUTCString() + ';';
      }
    }

    if ( path ) {
      cookieString += 'path=' + path + ';';
    }

    if ( domain ) {
      cookieString += 'domain=' + domain + ';';
    }

    if ( secure === false && sameSite === 'None') {
      secure = true;
      console.warn(`[ngx-cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.` +
        `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`);
    }

    if (secure) {
      cookieString += 'secure;';
    }

    cookieString += 'sameSite=' + sameSite + ';';

    this.document.cookie = cookieString;
  }

  /**
   * @param name   Cookie name
   * @param path   Cookie path
   * @param domain Cookie domain
   */
  delete( name: string, path?: string, domain?: string, secure?: boolean, sameSite: SameSiteOptionKey = 'None' ): void {
    if ( !this.documentIsAccessible ) {
      return;
    }

    this.set( name, '', new Date('Thu, 01 Jan 1970 00:00:01 GMT'), path, domain, secure, sameSite );
  }

  /**
   * @param path   Cookie path
   * @param domain Cookie domain
   */
  deleteAll( path?: string, domain?: string, secure?: boolean, sameSite: SameSiteOptionKey = 'None' ): void {
    if ( !this.documentIsAccessible ) {
      return;
    }

    const cookies: any = this.getAll();

    for ( const cookieName in cookies ) {
      if ( cookies.hasOwnProperty( cookieName ) ) {
        this.delete( cookieName, path, domain, secure, sameSite );
      }
    }
  }

  /**
   * @param name Cookie name
   * @returns property RegExp
   */
  private getCookieRegExp( name: string ): RegExp {
    const escapedName: string = name.replace( /([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/ig, '\\$1' );

    return new RegExp( '(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g' );
  }
}
