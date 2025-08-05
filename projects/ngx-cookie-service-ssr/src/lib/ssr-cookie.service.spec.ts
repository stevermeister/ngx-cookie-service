import { TestBed } from '@angular/core/testing';
import { REQUEST, DOCUMENT, PLATFORM_ID } from '@angular/core';
import { SsrCookieService } from './ssr-cookie.service';

describe('SsrCookieService - Request Object Compatibility', () => {
  let service: SsrCookieService;
  let mockDocument: any;

  beforeEach(() => {
    mockDocument = {
      cookie: ''
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: mockDocument },
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
  });

  it('should handle Angular REQUEST object with headers.get method', () => {
    const angularRequest = {
      headers: {
        get: jasmine.createSpy('get').and.returnValue('test=value1; another=value2')
      }
    };

    TestBed.overrideProvider(REQUEST, { useValue: angularRequest });
    service = TestBed.inject(SsrCookieService);

    expect(service.get('test')).toBe('value1');
    expect(angularRequest.headers.get).toHaveBeenCalledWith('cookie');
  });

  it('should handle Express request object with get method', () => {
    const expressRequest = {
      get: jasmine.createSpy('get').and.returnValue('test=value1; another=value2'),
      headers: { cookie: 'test=value1; another=value2' }
    };

    TestBed.overrideProvider(REQUEST, { useValue: expressRequest });
    service = TestBed.inject(SsrCookieService);

    expect(service.get('test')).toBe('value1');
    expect(expressRequest.get).toHaveBeenCalledWith('cookie');
  });

  it('should handle request object with direct headers access', () => {
    const simpleRequest = {
      headers: {
        cookie: 'test=value1; another=value2'
      }
    };

    TestBed.overrideProvider(REQUEST, { useValue: simpleRequest });
    service = TestBed.inject(SsrCookieService);

    expect(service.get('test')).toBe('value1');
  });

  it('should handle case-insensitive cookie headers', () => {
    const requestWithCapitalCookie = {
      headers: {
        Cookie: 'test=value1; another=value2'
      }
    };

    TestBed.overrideProvider(REQUEST, { useValue: requestWithCapitalCookie });
    service = TestBed.inject(SsrCookieService);

    expect(service.get('test')).toBe('value1');
  });

  it('should handle Express request with case-insensitive get method', () => {
    const expressRequest = {
      get: jasmine.createSpy('get').and.callFake((name: string) => {
        if (name === 'cookie') return null;
        if (name === 'Cookie') return 'test=value1; another=value2';
        return null;
      }),
      headers: {}
    };

    TestBed.overrideProvider(REQUEST, { useValue: expressRequest });
    service = TestBed.inject(SsrCookieService);

    expect(service.get('test')).toBe('value1');
    expect(expressRequest.get).toHaveBeenCalledWith('cookie');
    expect(expressRequest.get).toHaveBeenCalledWith('Cookie');
  });

  it('should return empty string when no request is provided', () => {
    TestBed.overrideProvider(REQUEST, { useValue: null });
    service = TestBed.inject(SsrCookieService);

    expect(service.get('test')).toBe('');
  });

  it('should return empty cookies object when no request is provided', () => {
    TestBed.overrideProvider(REQUEST, { useValue: null });
    service = TestBed.inject(SsrCookieService);

    expect(service.getAll()).toEqual({});
  });

  it('should check cookie existence correctly with different request types', () => {
    const expressRequest = {
      get: () => 'existing=value1; another=value2',
      headers: { cookie: 'existing=value1; another=value2' }
    };

    TestBed.overrideProvider(REQUEST, { useValue: expressRequest });
    service = TestBed.inject(SsrCookieService);

    expect(service.check('existing')).toBe(true);
    expect(service.check('nonexistent')).toBe(false);
  });
});