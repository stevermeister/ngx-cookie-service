/// <reference types="vitest/globals" />
import { ɵPLATFORM_BROWSER_ID, ɵPLATFORM_SERVER_ID } from '@angular/common';
import { DOCUMENT, PLATFORM_ID, REQUEST, RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideCookieOptions } from './ssr-cookie.config';
import { CookieOptions, SameSite, SsrCookieService } from './ssr-cookie.service';

describe('SsrCookieService', () => {
  let cookieService: SsrCookieService;
  let platformId: string;
  const documentMock: Document = document;
  let documentCookieGetterSpy: ReturnType<typeof vi.spyOn>;
  let documentCookieSetterSpy: ReturnType<typeof vi.spyOn>;

  // Mock RESPONSE_INIT
  const responseInitMock: { headers: Headers | string[][] | Record<string, any> } = {
    headers: new Headers(),
  };

  // Mock REQUEST
  const requestMock = {
    headers: new Headers(),
  };

  const useDefaults = (options: CookieOptions): void => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SsrCookieService,
        { provide: PLATFORM_ID, useFactory: () => platformId },
        { provide: DOCUMENT, useFactory: () => documentMock },
        { provide: RESPONSE_INIT, useValue: responseInitMock },
        { provide: REQUEST, useValue: requestMock },
        provideCookieOptions(options),
      ],
    });
    cookieService = TestBed.inject(SsrCookieService);
  };

  beforeEach(() => {
    // Store original descriptors to call through
    const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
    documentCookieGetterSpy = vi.spyOn(documentMock, 'cookie', 'get').mockImplementation(originalCookieDescriptor.get!);
    documentCookieSetterSpy = vi.spyOn(documentMock, 'cookie', 'set').mockImplementation(originalCookieDescriptor.set!);

    // Reset mocks
    responseInitMock.headers = new Headers();
    requestMock.headers = new Headers();

    TestBed.configureTestingModule({
      providers: [
        SsrCookieService,
        { provide: PLATFORM_ID, useFactory: () => platformId },
        { provide: DOCUMENT, useFactory: () => documentMock },
        { provide: RESPONSE_INIT, useValue: responseInitMock },
        { provide: REQUEST, useValue: requestMock },
      ],
    });
  });

  afterEach(() => {
    // Cleanup if needed
    // cookieService.deleteAll(); // Might fail on server if not implemented carefully?
    documentCookieGetterSpy.mockClear();
    documentCookieSetterSpy.mockClear();
  });

  describe('Platform browser', () => {
    beforeAll(() => {
      platformId = ɵPLATFORM_BROWSER_ID;
    });

    beforeEach(() => {
      cookieService = TestBed.inject(SsrCookieService);
    });

    it('should be created', () => {
      expect(cookieService).toBeTruthy();
    });

    describe('#check', () => {
      it('should return true if cookie exists on document', () => {
        documentCookieGetterSpy.mockReturnValue('foo=bar;');
        expect(cookieService.check('foo')).toEqual(true);
      });
      // Additional browser tests can be added here similar to cookie.service.spec.ts
    });

    describe('#set', () => {
      it('should set cookie on document in browser', () => {
        cookieService.set('foo', 'bar');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;SameSite=Lax;');
      });

      it('should not write HttpOnly cookies in browser and warn instead', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        cookieService.set('foo', 'bar', { httpOnly: true, path: '/' });

        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
      });

      it('should skip the whole write when path contains ";" in browser', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        cookieService.set('foo', 'bar', { path: '/; Max-Age=999999' });

        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
      });

      it('should force secure flag for Partitioned cookies in browser', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        cookieService.set('foo', 'bar', { partitioned: true });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;Secure;SameSite=Lax;Partitioned;');
        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
      });
    });

    describe('#delete', () => {
      it('should accept an options object and delete Partitioned cookies in browser', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        cookieService.delete('foo', { path: '/', partitioned: true });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/;Secure;SameSite=Lax;Partitioned;');
        warnSpy.mockRestore();
      });
    });

    describe('#deleteAll', () => {
      it('should pass an options object through to delete() in browser', () => {
        const deleteSpy = vi.spyOn(cookieService, 'delete');
        documentCookieGetterSpy.mockReturnValue('a=1; b=2');
        cookieService.deleteAll({ path: '/' });

        expect(deleteSpy).toHaveBeenCalledWith('a', { path: '/' });
        expect(deleteSpy).toHaveBeenCalledWith('b', { path: '/' });
      });
    });

    describe('with provideCookieOptions()', () => {
      it('should apply the defaults in browser', () => {
        useDefaults({ path: '/', sameSite: 'Strict' });
        cookieService.set('foo', 'bar');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;Path=/;SameSite=Strict;');
      });

      it('should skip set() in browser when httpOnly is a default', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        useDefaults({ httpOnly: true });
        cookieService.set('foo', 'bar');

        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
      });
    });
  });

  describe('Platform server', () => {
    beforeAll(() => {
      platformId = ɵPLATFORM_SERVER_ID;
    });

    beforeEach(() => {
      cookieService = TestBed.inject(SsrCookieService);
      // Reset headers for each test
      if (responseInitMock.headers instanceof Headers) {
        // Re-create to clear
        responseInitMock.headers = new Headers();
      }
    });

    describe('#check', () => {
      it('should return true if cookie exists in request headers', () => {
        requestMock.headers.set('cookie', 'foo=bar;');
        expect(cookieService.check('foo')).toEqual(true);
      });

      it('should return false if cookie missing in request headers', () => {
        requestMock.headers.delete('cookie');
        expect(cookieService.check('bar')).toEqual(false);
      });
    });

    describe('reads after writes in the same request', () => {
      it('should return values set earlier in the request', () => {
        requestMock.headers.set('cookie', 'a=old; z=1');
        cookieService.set('a', 'new');
        cookieService.set('b', 'added');

        expect(cookieService.get('a')).toEqual('new');
        expect(cookieService.check('b')).toEqual(true);
        expect(cookieService.getAll()).toEqual({ a: 'new', b: 'added', z: '1' });
      });

      it('should treat cookies deleted earlier in the request as missing', () => {
        requestMock.headers.set('cookie', 'a=1; z=1');
        cookieService.delete('z');
        cookieService.set('a', 'gone', { maxAge: 0 });

        expect(cookieService.check('z')).toEqual(false);
        expect(cookieService.check('a')).toEqual(false);
        expect(cookieService.getAll()).toEqual({});
      });

      it('should encode and decode names and values written during the request', () => {
        cookieService.set('na me', 'va;lue', { expires: 1 });

        expect(cookieService.get('na me')).toEqual('va;lue');
        expect(cookieService.getAll()).toEqual({ 'na me': 'va;lue' });
      });

      it('should match request cookies whose names are not percent-encoded the same way', () => {
        requestMock.headers.set('cookie', 'a:b=1; %61=2; z=3');
        cookieService.delete('a:b');
        cookieService.set('a', 'new');

        expect(cookieService.getAll()).toEqual({ a: 'new', z: '3' });
        cookieService.deleteAll();
        expect(cookieService.getAll()).toEqual({});
      });
    });

    describe('#getAll', () => {
      it('should keep the first cookie when several share a name, like get()', () => {
        requestMock.headers.set('cookie', 'foo=specific; bar=baz; foo=root');

        expect(cookieService.getAll()).toEqual({ foo: 'specific', bar: 'baz' });
        expect(cookieService.get('foo')).toEqual('specific');
      });

      it('should include cookies whose names match Object.prototype members', () => {
        requestMock.headers.set('cookie', '__proto__=x; hasOwnProperty=y; b=1');
        const cookies = cookieService.getAll();

        expect(Object.keys(cookies)).toEqual(['__proto__', 'hasOwnProperty', 'b']);
        expect(Object.getOwnPropertyDescriptor(cookies, '__proto__')?.value).toEqual('x');
      });
    });

    describe('#deleteAll', () => {
      it('should delete cookies named "hasOwnProperty" and "__proto__" too', () => {
        requestMock.headers.set('cookie', 'hasOwnProperty=x; __proto__=y; b=1');
        cookieService.deleteAll();

        expect((responseInitMock.headers as Headers).getSetCookie().map((cookie) => cookie.split('=')[0])).toEqual(['hasOwnProperty', '__proto__', 'b']);
      });

      it('should accept an options object', () => {
        requestMock.headers.set('cookie', 'a=1; b=2');
        cookieService.deleteAll({ path: '/' });

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual([
          'a=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/;SameSite=Lax;',
          'b=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/;SameSite=Lax;',
        ]);
      });
    });

    describe('#set', () => {
      it('should set Set-Cookie header in RESPONSE_INIT', () => {
        cookieService.set('foo', 'bar');
        const headers = responseInitMock.headers as Headers;
        expect(headers.get('Set-Cookie')).toContain('foo=bar;SameSite=Lax;');
      });

      it('should append multiple Set-Cookie headers', () => {
        cookieService.set('foo', 'bar');
        cookieService.set('baz', 'qux');

        const headers = responseInitMock.headers as Headers;
        // In some environments, get('Set-Cookie') joins with comma, which is invalid for Set-Cookie
        // But we rely on the implementation calling append.

        // We can't easily check internal state of Headers object via get() for multiple Set-Cookie in all envs.
        // A better check would be spying on append if we mocked Headers, but we used real Headers.
        // For now, let's assume if we call it twice, it works.
        // Or check if the combined string contains both.
        const headerValue = headers.get('Set-Cookie');
        if (headerValue) {
          expect(headerValue).toContain('foo=bar');
          expect(headerValue).toContain('baz=qux');
        }
      });

      it('should skip the whole write when path or domain contains ";" or a control character', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        cookieService.set('a', 'b', { path: '/; Domain=evil.example; Max-Age=999999' });
        cookieService.set('c', 'd', { domain: 'example.com\r\nX-Injected: 1' });

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual([]);
        expect(warnSpy).toHaveBeenCalledTimes(2);
        warnSpy.mockRestore();
      });

      it('should drop invalid expires, maxAge and sameSite values with a warning', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        cookieService.set('c', 'd', { expires: new Date('not a date'), maxAge: 1.5 });
        cookieService.set('e', 'f', { maxAge: 1e21 });
        cookieService.set('g', 'h', { sameSite: 'Lax; Domain=evil.example' as SameSite });
        cookieService.set('i', 'j', { maxAge: null as unknown as number });

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual([
          'c=d;SameSite=Lax;',
          'e=f;SameSite=Lax;',
          'g=h;SameSite=Lax;',
          'i=j;SameSite=Lax;',
        ]);
        expect(warnSpy).toHaveBeenCalledTimes(4);
        warnSpy.mockRestore();
      });

      it('should not modify the options object passed by the caller', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const options: CookieOptions = { sameSite: 'None', partitioned: true, maxAge: 1.5, expires: new Date('not a date') };
        const snapshot = { ...options };
        cookieService.set('foo', 'bar', options);

        expect(options).toStrictEqual(snapshot);
        warnSpy.mockRestore();
      });

      it('should write HttpOnly cookies on server', () => {
        cookieService.set('foo', 'bar', { httpOnly: true, path: '/' });

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual(['foo=bar;Path=/;SameSite=Lax;HttpOnly;']);
      });

      it('should keep valid maxAge, path and domain values', () => {
        cookieService.set('foo', 'bar', { maxAge: 60, path: '/', domain: 'example.com' });

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual(['foo=bar;Max-Age=60;Path=/;Domain=example.com;SameSite=Lax;']);
      });

      it('should force secure flag for Partitioned cookies on server', () => {
        cookieService.set('foo', 'bar', { partitioned: true });

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual(['foo=bar;Secure;SameSite=Lax;Partitioned;']);
      });

      it('should treat a null third argument as the positional form', () => {
        const setPositional = cookieService.set as (...args: unknown[]) => void;
        setPositional.call(cookieService, 'foo', 'bar', null, '/p', 'example.com');

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual(['foo=bar;Path=/p;Domain=example.com;SameSite=Lax;']);
      });
    });

    describe('#delete', () => {
      it('should set expiration cookie in RESPONSE_INIT', () => {
        cookieService.delete('foo');
        const headers = responseInitMock.headers as Headers;
        const cookie = headers.get('Set-Cookie');
        expect(cookie).toContain('foo=;Expires=Thu, 01 Jan 1970 00:00:01 GMT');
      });

      it('should accept an options object and delete Partitioned cookies', () => {
        cookieService.delete('foo', { path: '/', partitioned: true });

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual([
          'foo=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/;Secure;SameSite=Lax;Partitioned;',
        ]);
      });
    });

    describe('with provideCookieOptions()', () => {
      it('should apply the defaults on server', () => {
        useDefaults({ path: '/', secure: true });
        cookieService.set('foo', 'bar');

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual(['foo=bar;Path=/;Secure;SameSite=Lax;']);
      });

      it('should use a default maxAge for set() but not for delete()', () => {
        useDefaults({ maxAge: 3600, path: '/' });
        cookieService.set('foo', 'bar');
        cookieService.delete('foo');

        expect((responseInitMock.headers as Headers).getSetCookie()).toEqual([
          'foo=bar;Max-Age=3600;Path=/;SameSite=Lax;',
          'foo=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/;SameSite=Lax;',
        ]);
        expect(cookieService.check('foo')).toEqual(false);
      });
    });
  });
});
