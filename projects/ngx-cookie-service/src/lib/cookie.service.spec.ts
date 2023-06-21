import { TestBed } from '@angular/core/testing';
import { CookieService } from './cookie.service';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT, ɵPLATFORM_BROWSER_ID, ɵPLATFORM_SERVER_ID } from '@angular/common';
import SpyInstance = jest.SpyInstance;

describe('NgxCookieServiceService', () => {
  let cookieService: CookieService;
  let platformId: string;
  const documentMock: Document = document;
  let documentCookieGetterSpy: SpyInstance;
  let documentCookieSetterSpy: SpyInstance;

  beforeEach(() => {
    documentCookieGetterSpy = jest.spyOn(documentMock, 'cookie', 'get');
    documentCookieSetterSpy = jest.spyOn(documentMock, 'cookie', 'set');

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useFactory: () => platformId },
        { provide: DOCUMENT, useFactory: () => documentMock },
      ],
    });
    cookieService = TestBed.inject(CookieService);
  });

  afterEach(() => {
    cookieService.deleteAll();
    documentCookieGetterSpy.mockReset();
    documentCookieSetterSpy.mockReset();
  });

  it('should be created', () => {
    expect(cookieService).toBeTruthy();
  });

  describe('Platform browser', () => {
    beforeAll(() => {
      platformId = ɵPLATFORM_BROWSER_ID;
    });
    describe('#check', () => {
      it('should return true if cookie exists on document', () => {
        documentCookieGetterSpy.mockReturnValue('foo=bar;');
        //documentCookieGetterSpy.mockReturnValue('foo=bar;');

        expect(cookieService.check('foo')).toEqual(true);
      });
      it('should look up cookie by encoded name', () => {
        documentCookieGetterSpy.mockReturnValue('%3B%2C%2F%3F%3A%40%26%3D%2B%24=exists;');

        expect(cookieService.check(';,/?:@&=+$')).toEqual(true);
      });
      it('should return false if cookie does not exist on document', () => {
        documentCookieGetterSpy.mockReturnValue('foo=bar;');

        expect(cookieService.check('bar')).toEqual(false);
      });
      it('should check for values and not for keys', () => {
        documentCookieGetterSpy.mockReturnValue('foo=bar; test1=test123;');

        expect(cookieService.check('foo')).toEqual(true);
        expect(cookieService.check('bar')).toEqual(false);
        expect(cookieService.check('test1')).toEqual(true);
        expect(cookieService.check('test123')).toEqual(false);
      });
    });
    describe('#get', () => {
      it('should return value of cookie', () => {
        documentCookieGetterSpy.mockReturnValue('foo=bar;');

        expect(cookieService.get('foo')).toEqual('bar');
      });
      it('should return decoded value of cookie', () => {
        const cookieString = [
          '%3B%2C%2F%3F%3A%40%26%3D%2B%24=%3B%2C%2F%3F%3A%40%26%3D%2B%24',
          '-H%40ll%C3%B6_%20W%C3%B6rld-=-H%40ll%C3%B6_%20W%C3%B6rld-',
          '%24uper%5ETEST(123)=%24uper%5ETEST(123)',
          'F()!!()%2Fbar=F()!!()%2Fbar',
          '*F.)%2Fo(o*=*F.)%2Fo(o*',
          '-O_o%7B1%2C2%7D=-O_o%7B1%2C2%7D',
          'B%3Far%7CFo%2Bo=B%3Far%7CFo%2Bo',
          'Hello%3DWorld%3B=Hello%3DWorld%3B',
          '%5Bfoo-_*.%5Dbar=%5Bfoo-_*.%5Dbar',
        ].join('; ');
        documentCookieGetterSpy.mockReturnValue(cookieString);

        expect(cookieService.get(';,/?:@&=+$')).toEqual(';,/?:@&=+$');
        expect(cookieService.get('-H@llö_ Wörld-')).toEqual('-H@llö_ Wörld-');
        expect(cookieService.get('$uper^TEST(123)')).toEqual('$uper^TEST(123)');
        expect(cookieService.get('F()!!()/bar')).toEqual('F()!!()/bar');
        expect(cookieService.get('*F.)/o(o*')).toEqual('*F.)/o(o*');
        expect(cookieService.get('-O_o{1,2}')).toEqual('-O_o{1,2}');
        expect(cookieService.get('B?ar|Fo+o')).toEqual('B?ar|Fo+o');
        expect(cookieService.get('Hello=World;')).toEqual('Hello=World;');
        expect(cookieService.get('[foo-_*.]bar')).toEqual('[foo-_*.]bar');
      });
      it('should fallback to original value if decoding fails', () => {
        documentCookieGetterSpy.mockReturnValue('foo=%E0%A4%A');

        expect(cookieService.get('foo')).toEqual('%E0%A4%A');
      });
      it('should return empty string for not set cookie', () => {
        documentCookieGetterSpy.mockReturnValue('foo=bar;');

        expect(cookieService.get('bar')).toEqual('');
      });
    });
    describe('#getAll', () => {
      it('should return empty object if cookies not set', () => {
        documentCookieGetterSpy.mockReturnValue('');

        expect(cookieService.getAll()).toEqual({});
      });
      it('should return object with decoded cookie names and values', () => {
        documentCookieGetterSpy.mockReturnValue('foo=bar; Hello=World; %3B%2C%2F%3F%3A%40%26%3D%2B%24=%3B%2C%2F%3F%3A%40%26%3D%2B%24');

        expect(cookieService.getAll()).toEqual({ foo: 'bar', Hello: 'World', ';,/?:@&=+$': ';,/?:@&=+$' });
      });
      it('should return object with safely decoded cookie names and values', () => {
        documentCookieGetterSpy.mockReturnValue('foo=%E0%A4%A; %E0%A4%A=%E0%A4%A; Hello=World; %3B%2C%2F%3F%3A%40%26%3D%2B%24=%3B%2C%2F%3F%3A%40%26%3D%2B%24');

        expect(cookieService.getAll()).toEqual({
          foo: '%E0%A4%A',
          '%E0%A4%A': '%E0%A4%A',
          Hello: 'World',
          ';,/?:@&=+$': ';,/?:@&=+$',
        });
      });
    });
    describe('#set', () => {
      it('should set cookie with default SameSite option', () => {
        cookieService.set('foo', 'bar');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;sameSite=Lax;');
      });
      it('should set cookie with encoded name and value', () => {
        cookieService.set(';,/?:@&=+$', ';,/?:@&=+$');
        cookieService.set('-H@llö_ Wörld-', '-H@llö_ Wörld-');
        cookieService.set('$uper^TEST(123)', '$uper^TEST(123)');
        cookieService.set('F()!!()/bar', 'F()!!()/bar');
        cookieService.set('*F.)/o(o*', '*F.)/o(o*');
        cookieService.set('-O_o{1,2}', '-O_o{1,2}');
        cookieService.set('B?ar|Fo+o', 'B?ar|Fo+o');
        cookieService.set('Hello=World;', 'Hello=World;');
        cookieService.set('[foo-_*.]bar', '[foo-_*.]bar');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('%3B%2C%2F%3F%3A%40%26%3D%2B%24=%3B%2C%2F%3F%3A%40%26%3D%2B%24;sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('-H%40ll%C3%B6_%20W%C3%B6rld-=-H%40ll%C3%B6_%20W%C3%B6rld-;sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('%24uper%5ETEST(123)=%24uper%5ETEST(123);sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('F()!!()%2Fbar=F()!!()%2Fbar;sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('*F.)%2Fo(o*=*F.)%2Fo(o*;sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('-O_o%7B1%2C2%7D=-O_o%7B1%2C2%7D;sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('B%3Far%7CFo%2Bo=B%3Far%7CFo%2Bo;sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('Hello%3DWorld%3B=Hello%3DWorld%3B;sameSite=Lax;');
        expect(documentCookieSetterSpy).toHaveBeenCalledWith('%5Bfoo-_*.%5Dbar=%5Bfoo-_*.%5Dbar;sameSite=Lax;');
      });

      /*it('should set cookie with expires options in days', () => {
        jest.spyOn(global, 'Date').mockImplementation(() => new Date('Sun, 15 Mar 2020 10:00:00 GMT'));
        cookieService.set('foo', 'bar', 2);

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;expires=Tue, 17 Mar 2020 10:00:00 GMT;sameSite=Lax;');
        jest.spyOn(global, 'Date').mockImplementation(() => new Date());
      });

      it('should set cookie with expires option in options body', () => {
        jest.spyOn(global, 'Date').mockImplementation(() => new Date('Sun, 30 Aug 2020 10:00:00 GMT'));
        cookieService.set('foo', 'bar', { expires: 2 });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;expires=Tue, 01 Sep 2020 10:00:00 GMT;sameSite=Lax;');
        jest.spyOn(global, 'Date').mockImplementation(() => new Date());
      });*/

      it('should set cookie with expires option from Date object', () => {
        const expiresDate = new Date('Mon, 15 Mar 2021 10:00:00 GMT');
        cookieService.set('foo', 'bar', expiresDate);

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;expires=Mon, 15 Mar 2021 10:00:00 GMT;sameSite=Lax;');
      });

      it('should set cookie with expires option from Date object in options body', () => {
        const expires = new Date('Mon, 15 Mar 2021 10:00:00 GMT');
        cookieService.set('foo', 'bar', { expires });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;expires=Mon, 15 Mar 2021 10:00:00 GMT;sameSite=Lax;');
      });
      it('should set cookie with path option', () => {
        cookieService.set('foo', 'bar', undefined, '/test');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;path=/test;sameSite=Lax;');
      });
      it('should set cookie with path option in options body', () => {
        cookieService.set('foo', 'bar', { path: '/test' });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;path=/test;sameSite=Lax;');
      });
      it('should set cookie with domain option', () => {
        cookieService.set('foo', 'bar', undefined, undefined, 'example.com');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;domain=example.com;sameSite=Lax;');
      });
      it('should set cookie with domain option in options body', () => {
        cookieService.set('foo', 'bar', { domain: 'example.com' });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;domain=example.com;sameSite=Lax;');
      });
      it('should set cookie with secure option', () => {
        cookieService.set('foo', 'bar', undefined, undefined, undefined, true, 'Lax');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;secure;sameSite=Lax;');
      });
      it('should set cookie with secure option in options body', () => {
        cookieService.set('foo', 'bar', { secure: true, sameSite: 'Lax' });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;secure;sameSite=Lax;');
      });
      it('should set cookie with forced secure flag when SameSite option is "None"', () => {
        cookieService.set('foo', 'bar', undefined, undefined, undefined, false, 'None');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;secure;sameSite=None;');
      });
      it('should set cookie with forced secure flag when SameSite option is "None" in options body', () => {
        cookieService.set('foo', 'bar', { secure: false, sameSite: 'None' });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;secure;sameSite=None;');
      });
      it('should set cookie with SameSite option', () => {
        cookieService.set('foo', 'bar', undefined, undefined, undefined, false, 'Strict');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;sameSite=Strict;');
      });
      it('should set cookie with SameSite option in options body', () => {
        cookieService.set('foo', 'bar', { secure: false, sameSite: 'Strict' });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith('foo=bar;sameSite=Strict;');
      });
      it('should set cookie with all options', () => {
        const expiresDate = new Date('Mon, 15 Mar 2021 10:00:00 GMT');
        cookieService.set('foo', 'bar', expiresDate, '/test', 'example.com', true, 'Strict');

        expect(documentCookieSetterSpy).toHaveBeenCalledWith(
          'foo=bar;expires=Mon, 15 Mar 2021 10:00:00 GMT;path=/test;domain=example.com;secure;sameSite=Strict;'
        );
      });
      it('should set cookie with all options in options body', () => {
        const expiresDate = new Date('Mon, 15 Mar 2021 10:00:00 GMT');

        cookieService.set('foo', 'bar', {
          expires: expiresDate,
          path: '/test',
          domain: 'example.com',
          secure: true,
          sameSite: 'Strict',
        });

        expect(documentCookieSetterSpy).toHaveBeenCalledWith(
          'foo=bar;expires=Mon, 15 Mar 2021 10:00:00 GMT;path=/test;domain=example.com;secure;sameSite=Strict;'
        );
      });
    });
    describe('#delete', () => {
      it('should delete cookie', () => {
        documentMock.cookie = 'foo=bar';
        expect(documentMock.cookie).toContain('foo=bar');
        cookieService.delete('foo');

        expect(documentMock.cookie).not.toContain('foo=bar');
      });
      it('should invoke set method with fixed date and and pass other params through', () => {
        jest.spyOn(cookieService, 'set');
        cookieService.delete('foo', '/test', 'example.com', true, 'Lax');

        const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
        expect(cookieService.set).toHaveBeenCalledWith('foo', '', {
          expires: expiresDate,
          path: '/test',
          domain: 'example.com',
          secure: true,
          sameSite: 'Lax',
        });
      });
    });
    describe('#deleteAll', () => {
      it('should delete all cookies', () => {
        documentMock.cookie = 'foo=bar';
        documentMock.cookie = 'test=test123';
        expect(documentMock.cookie).toEqual('foo=bar; test=test123');
        cookieService.deleteAll();

        expect(documentMock.cookie).toEqual('');
      });
      it('should invoke delete method for each cookie and path params through', () => {
        jest.spyOn(cookieService, 'delete');
        documentMock.cookie = 'foo=bar';
        documentMock.cookie = 'test=test123';
        expect(documentMock.cookie).toEqual('foo=bar; test=test123');
        cookieService.deleteAll('/test', 'example.com', true, 'Lax');

        expect(cookieService.delete).toHaveBeenCalledWith('foo', '/test', 'example.com', true, 'Lax');
        expect(cookieService.delete).toHaveBeenCalledWith('test', '/test', 'example.com', true, 'Lax');
      });
    });
  });
  describe('Platform server', () => {
    beforeAll(() => {
      platformId = ɵPLATFORM_SERVER_ID;
    });
    describe('#check', () => {
      it('should always return false ', () => {
        cookieService.set('foo', 'bar');

        expect(cookieService.check('foo')).toEqual(false);
        expect(cookieService.check('bar')).toEqual(false);
      });
    });
    describe('#get', () => {
      it('should always return empty string', () => {
        cookieService.set('foo', 'bar');

        expect(cookieService.get('foo')).toEqual('');
        expect(cookieService.get('bar')).toEqual('');
      });
    });
    describe('#getAll', () => {
      it('should always return empty object', () => {
        cookieService.set('foo', 'bar');

        expect(cookieService.getAll()).toEqual({});
      });
    });
    describe('#set', () => {
      it('should not set cookie', () => {
        cookieService.set('foo', 'bar');

        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
      });
    });
    describe('#delete', () => {
      it('should not invoke set method to delete cookie', () => {
        cookieService.delete('foo');

        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
      });
    });
    describe('#deleteAll', () => {
      it('should not invoke delete method', () => {
        cookieService.deleteAll();

        expect(documentCookieSetterSpy).not.toHaveBeenCalled();
      });
    });
  });
});
