import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, REQUEST } from '@angular/core';
import { DOCUMENT, ɵPLATFORM_BROWSER_ID, ɵPLATFORM_SERVER_ID } from '@angular/common';
import { SsrCookieService } from './ssr-cookie.service'; // Import the SSR service

// Mock Request object for SSR testing
interface MockRequest {
  headers?: any; // Use 'any' to allow testing different header types
}

describe('SsrCookieService', () => {
  let cookieService: SsrCookieService;
  let platformId: string;
  const documentMock: Document = document; // Use real document for browser tests
  let mockRequest: MockRequest | null = null; // Mock request for SSR tests

  // Keep spies for document.cookie for browser tests
  let documentCookieGetterSpy: jest.SpyInstance;
  let documentCookieSetterSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset request before each test
    mockRequest = null;

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useFactory: () => platformId },
        { provide: DOCUMENT, useValue: documentMock },
        // Provide REQUEST using a factory to allow dynamic mock assignment
        { provide: REQUEST, useFactory: () => mockRequest, deps: [] },
      ],
    });

    // Setup spies *before* injecting the service
    documentCookieGetterSpy = jest.spyOn(documentMock, 'cookie', 'get');
    documentCookieSetterSpy = jest.spyOn(documentMock, 'cookie', 'set');

    cookieService = TestBed.inject(SsrCookieService);
  });

  afterEach(() => {
    // Clear document cookies after browser tests
    if (platformId === ɵPLATFORM_BROWSER_ID) {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
    }
    // Reset spies
    documentCookieGetterSpy.mockRestore();
    documentCookieSetterSpy.mockRestore();
  });

  it('should be created', () => {
    expect(cookieService).toBeTruthy();
  });

  // --- Browser Tests (Adapted from original cookie.service.spec.ts) ---
  describe('Platform browser', () => {
    beforeAll(() => {
      platformId = ɵPLATFORM_BROWSER_ID;
    });

    beforeEach(() => {
        // Ensure document spies are active for browser tests
        documentCookieGetterSpy.mockClear();
        documentCookieSetterSpy.mockClear();
    });

    describe('#check', () => {
      it('should return true for existing cookie', () => {
        document.cookie = 'test=true;';
        expect(cookieService.check('test')).toBe(true);
      });

      it('should return false for non-existing cookie', () => {
        expect(cookieService.check('nonexistent')).toBe(false);
      });
    });

    describe('#get', () => {
      it('should return value for existing cookie', () => {
        document.cookie = 'test=value;';
        expect(cookieService.get('test')).toBe('value');
      });

      it('should return empty string for non-existing cookie', () => {
        expect(cookieService.get('nonexistent')).toBe('');
      });
       it('should handle encoded cookie values', () => {
        document.cookie = 'encoded=%7B%22key%22%3A%22value%22%7D;';
        expect(cookieService.get('encoded')).toBe('{"key":"value"}');
      });
    });

     describe('#getAll', () => {
      it('should return object with all cookies', () => {
        document.cookie = 'test1=value1;';
        document.cookie = 'test2=value2;';
        expect(cookieService.getAll()).toEqual({ test1: 'value1', test2: 'value2' });
      });

       it('should return empty object if no cookies', () => {
        expect(cookieService.getAll()).toEqual({});
      });
    });

    describe('#set', () => {
      it('should set a cookie with name and value', () => {
        cookieService.set('test', 'value');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('test=value'));
        expect(document.cookie).toContain('test=value');
      });

      // Add more browser #set tests (expires, path, domain, secure, sameSite) as needed, similar to original spec
      it('should set a cookie with expires (Date)', () => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        cookieService.set('test', 'value', expiryDate);
        expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining(`expires=${expiryDate.toUTCString()}`));
      });

       it('should set cookie using options object', () => {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 1);
          cookieService.set('test', 'value', { expires: expiryDate, path: '/test' });
          expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('test=value;'));
          expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining(`expires=${expiryDate.toUTCString()}`));
          expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('path=/test'));
      });
    });

    describe('#delete', () => {
      it('should delete a cookie', () => {
        cookieService.set('test', 'value'); // Set it first
        cookieService.delete('test');
        // Delete sets expiry in the past
        expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('test=;expires=Thu, 01 Jan 1970 00:00:01 GMT'));
        // Check it's actually gone
        documentCookieGetterSpy.mockReturnValue(''); // Mock reading after deletion
        expect(cookieService.check('test')).toBe(false);
      });
        // Add more browser #delete tests (path, domain) if needed
    });

    describe('#deleteAll', () => {
        it('should delete all cookies', () => {
            cookieService.set('test1', 'value1');
            cookieService.set('test2', 'value2');
            cookieService.deleteAll();
            expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('test1=;expires=Thu, 01 Jan 1970 00:00:01 GMT'));
            expect(documentCookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('test2=;expires=Thu, 01 Jan 1970 00:00:01 GMT'));
            // Check they are gone
             documentCookieGetterSpy.mockReturnValue('');
            expect(cookieService.getAll()).toEqual({});
        });
         // Add more browser #deleteAll tests (path, domain) if needed
    });
  });

  // --- Server Tests --- 
  describe('Platform server', () => {
    beforeAll(() => {
      platformId = ɵPLATFORM_SERVER_ID;
    });

     // Helper to set up the mock request for SSR tests
    const setupMockRequest = (headers: any) => {
        mockRequest = { headers: headers };
        // Re-inject service or update the provider instance if TestBed doesn't automatically pick up the new factory value
        // For simplicity here, we assume TestBed uses the factory on each injection or the instance is updated.
        // A more robust setup might involve TestBed.overrideProvider.
        cookieService = TestBed.inject(SsrCookieService);
    };

    describe('Header Handling (Issue #346)', () => {
      it('should read cookies from Headers object', () => {
        const headers = new Headers();
        headers.append('cookie', 'ssrTest=value1; ssrTest2=value2');
        setupMockRequest(headers);

        expect(cookieService.check('ssrTest')).toBe(true);
        expect(cookieService.get('ssrTest')).toBe('value1');
        expect(cookieService.get('ssrTest2')).toBe('value2');
        expect(cookieService.getAll()).toEqual({ ssrTest: 'value1', ssrTest2: 'value2' });
      });

      it('should read cookies from plain object (lowercase key)', () => {
        setupMockRequest({ cookie: 'plainTest=plainValue; plainTest2=plainValue2' });

        expect(cookieService.check('plainTest')).toBe(true);
        expect(cookieService.get('plainTest')).toBe('plainValue');
        expect(cookieService.getAll()).toEqual({ plainTest: 'plainValue', plainTest2: 'plainValue2' });
      });

       it('should read cookies from plain object (uppercase key)', () => {
        setupMockRequest({ Cookie: 'upperTest=upperValue' }); // Less common but test anyway

        expect(cookieService.check('upperTest')).toBe(true);
        expect(cookieService.get('upperTest')).toBe('upperValue');
        expect(cookieService.getAll()).toEqual({ upperTest: 'upperValue' });
      });

       it('should return empty/false if no request object', () => {
          setupMockRequest(null); // Simulate no request injected
          expect(cookieService.check('any')).toBe(false);
          expect(cookieService.get('any')).toBe('');
          expect(cookieService.getAll()).toEqual({});
      });

       it('should return empty/false if no headers object', () => {
          setupMockRequest({}); // Request with no headers property
          expect(cookieService.check('any')).toBe(false);
          expect(cookieService.get('any')).toBe('');
          expect(cookieService.getAll()).toEqual({});
      });

       it('should return empty/false if headers object has no get method and no cookie property', () => {
          setupMockRequest({ someOtherHeader: 'value' }); // Headers object, but wrong type/no cookie
          expect(cookieService.check('any')).toBe(false);
          expect(cookieService.get('any')).toBe('');
          expect(cookieService.getAll()).toEqual({});
      });

       it('should return empty/false if cookie header is missing', () => {
          const headers = new Headers();
          headers.append('other', 'value');
          setupMockRequest(headers);
          expect(cookieService.check('any')).toBe(false);
          expect(cookieService.get('any')).toBe('');
          expect(cookieService.getAll()).toEqual({});
      });

       it('should return empty/false if cookie header is empty', () => {
          setupMockRequest({ cookie: '' });
          expect(cookieService.check('any')).toBe(false);
          expect(cookieService.get('any')).toBe('');
          expect(cookieService.getAll()).toEqual({});
      });
    });

    // --- Original Server Tests (confirming no side effects) ---
    describe('#check (original server behavior)', () => {
      // These tests now depend on the mock request setup
      it('should return true for existing cookie in headers', () => {
        setupMockRequest({ cookie: 'foo=bar' });
        expect(cookieService.check('foo')).toBe(true);
      });
      it('should return false for non-existing cookie in headers', () => {
        setupMockRequest({ cookie: 'foo=bar' });
        expect(cookieService.check('baz')).toBe(false);
      });
       it('should return false if no cookie header present', () => {
        setupMockRequest({ 'other-header': 'value' });
        expect(cookieService.check('foo')).toBe(false);
      });
    });

    describe('#get (original server behavior)', () => {
        it('should return value for existing cookie in headers', () => {
          setupMockRequest({ cookie: 'foo=bar; test=123' });
          expect(cookieService.get('foo')).toBe('bar');
          expect(cookieService.get('test')).toBe('123');
        });
        it('should return empty string for non-existing cookie in headers', () => {
           setupMockRequest({ cookie: 'foo=bar' });
           expect(cookieService.get('baz')).toBe('');
        });
        it('should return empty string if no cookie header present', () => {
           setupMockRequest({ 'other-header': 'value' });
           expect(cookieService.get('foo')).toBe('');
        });
    });

    describe('#getAll (original server behavior)', () => {
      it('should return object with cookies from headers', () => {
        setupMockRequest({ cookie: 'foo=bar; test=123; flag' });
        expect(cookieService.getAll()).toEqual({ foo: 'bar', test: '123', flag: '' });
      });
      it('should return empty object if no cookie header present', () => {
        setupMockRequest({ 'other-header': 'value' });
        expect(cookieService.getAll()).toEqual({});
      });
    });

    describe('#set', () => {
      it('should not set cookie (no document access)', () => {
        setupMockRequest({ cookie: 'foo=bar' }); // Doesn't matter for set
        cookieService.set('test', 'value');
        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
      });
    });

    describe('#delete', () => {
      it('should not invoke set method to delete cookie (no document access)', () => {
        setupMockRequest({ cookie: 'foo=bar' }); // Doesn't matter for delete
        cookieService.delete('foo');
        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
      });
    });

    describe('#deleteAll', () => {
      it('should not invoke delete method (no document access)', () => {
         setupMockRequest({ cookie: 'foo=bar' }); // Doesn't matter for deleteAll
        cookieService.deleteAll();
        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
      });
    });
  });
});
