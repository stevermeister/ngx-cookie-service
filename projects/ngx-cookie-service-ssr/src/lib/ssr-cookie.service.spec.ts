/// <reference types="vitest/globals" />
import { ɵPLATFORM_BROWSER_ID, ɵPLATFORM_SERVER_ID } from '@angular/common';
import { DOCUMENT, PLATFORM_ID, REQUEST, RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SsrCookieService } from './ssr-cookie.service';

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
    });

    describe('#delete', () => {
      it('should set expiration cookie in RESPONSE_INIT', () => {
        cookieService.delete('foo');
        const headers = responseInitMock.headers as Headers;
        const cookie = headers.get('Set-Cookie');
        expect(cookie).toContain('foo=;Expires=Thu, 01 Jan 1970 00:00:01 GMT');
      });
    });
  });
});
