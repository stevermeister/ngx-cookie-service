// This service is based on the `ng2-cookies` package which sadly is not a service and does
// not use `DOCUMENT` injection and therefore doesn't work well with AoT production builds.
// Package: https://github.com/BCJTI/ng2-cookies

import { Injectable, Inject, PLATFORM_ID, InjectionToken } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {CookieModel} from './cookie.model';
import {COOKIE_CONFIG_TOKEN} from './cookie.config';

const EXPIRE_TIME = 86400000;

@Injectable()
export class CookieService {
  private readonly documentIsAccessible: boolean;

  constructor(
    // The type `Document` may not be used here. Although a fix is on its way,
    // we will go with `any` for now to support Angular 2.4.x projects.
    // Issue: https://github.com/angular/angular/issues/12631
    // Fix: https://github.com/angular/angular/pull/14894
    @Inject( DOCUMENT ) private document: any,
    // Get the `PLATFORM_ID` so we can check if we're in a browser.
    @Inject( PLATFORM_ID ) private platformId: InjectionToken<Object>,
    // Get the root cookie config to set in this service
    @Inject( COOKIE_CONFIG_TOKEN ) private cookieConfig: CookieModel,
  ) {
    this.documentIsAccessible = isPlatformBrowser( this.platformId );
  }

  /**
   * @param name Cookie name
   * @returns {boolean}
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
   * @returns {any}
   */
  get( name: string ): string {
    if ( this.documentIsAccessible && this.check( name ) ) {
      name = encodeURIComponent( name );

      const regExp: RegExp = this.getCookieRegExp( name );
      const result: RegExpExecArray = regExp.exec( this.document.cookie );

      return decodeURIComponent( result[ 1 ] );
    } else {
      return '';
    }
  }

  /**
   * @returns {}
   */
  getAll(): {} {
    if ( !this.documentIsAccessible ) {
      return {};
    }

    const cookies: {} = {};
    const document: any = this.document;

    if ( document.cookie && document.cookie !== '' ) {
      const split: Array<string> = document.cookie.split(';');

      for ( let i = 0; i < split.length; i += 1 ) {
        const currentCookie: Array<string> = split[ i ].split('=');

        currentCookie[ 0 ] = currentCookie[ 0 ].replace( /^ /, '' );
        cookies[ decodeURIComponent( currentCookie[ 0 ] ) ] = decodeURIComponent( currentCookie[ 1 ] );
      }
    }

    return cookies;
  }

  /**
   * @param options
   */
  set(options: CookieModel): void {
    const { value, expires, path, domain, secure, sameSite } = options;
    if ( !this.documentIsAccessible ) {
      return;
    }

    let cookieString: string = encodeURIComponent( name ) + '=' + encodeURIComponent( value ) + ';';

    if ( expires ) {
      if ( typeof expires === 'number' ) {
        const dateExpires: Date = new Date( new Date().getTime() + expires * EXPIRE_TIME );

        cookieString += 'expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'expires=' + expires.toUTCString() + ';';
      }
    }

    if ( this.cookieConfig.path ) {
      cookieString += 'path=' + this.cookieConfig.path + ';';
    } else {
      cookieString += 'path=' + path + ';';
    }

    if ( this.cookieConfig.domain ) {
      cookieString += 'domain=' + this.cookieConfig.domain + ';';
    } else {
      cookieString += 'domain=' + domain + ';';
    }

    if ( this.cookieConfig.secure ) {
      cookieString += 'secure;';
    } else {
      cookieString += 'secure;';
    }

    if ( this.cookieConfig.sameSite ) {
      cookieString += 'sameSite=' + this.cookieConfig.sameSite + ';';
    } else {
      cookieString += 'sameSite=' + sameSite + ';';
    }

    this.document.cookie = cookieString;
  }

  /**
   * @param name   Cookie name
   * @param path   Cookie path
   * @param domain Cookie domain
   */
  delete( name: string, path?: string, domain?: string ): void {
    if ( !this.documentIsAccessible ) {
      return;
    }

    const cookie = {
      name,
      value: '',
      expires: this.cookieConfig.expires,
      path: this.cookieConfig.path || path,
      domain: this.cookieConfig.domain || domain,
    };

    this.set(cookie);
  }

  /**
   * @param path   Cookie path
   * @param domain Cookie domain
   */
  deleteAll( path?: string, domain?: string ): void {
    if ( !this.documentIsAccessible ) {
      return;
    }

    const cookies: any = this.getAll();

    for ( const cookieName in cookies ) {
      if ( cookies.hasOwnProperty( cookieName ) ) {
        if (path && domain) {
          this.delete( cookieName, path, domain );
        } else {
          this.delete(cookieName, this.cookieConfig.path, this.cookieConfig.domain);
        }
      }
    }
  }

  /**
   * @param name Cookie name
   * @returns {RegExp}
   */
  private getCookieRegExp( name: string ): RegExp {
    const escapedName: string = name.replace( /([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/ig, '\\$1' );

    return new RegExp( '(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g' );
  }
}
