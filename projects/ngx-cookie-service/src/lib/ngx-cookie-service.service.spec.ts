import { TestBed, async, inject } from '@angular/core/testing';

import { CookieService } from './ngx-cookie-service.service';

describe('NgxCookieServiceService', () => {
  let cookieService: CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    cookieService = TestBed.inject(CookieService);
  });

  it('should be created', () => {
    expect(cookieService).toBeTruthy();
  });

  it('should check for values and not for keys', () => {
    cookieService.set( 'Foo', 'Bar' );

    let value = cookieService.check('Foo');
    expect( value ).toEqual( true );

    value = cookieService.check('Bar');
    expect( value ).toEqual( false );

    cookieService.set( 'test1', 'test123' );

    value = cookieService.check( 'test1' );
    expect( value ).toEqual( true );

    value = cookieService.check( 'test123' );
    expect( value ).toEqual( false );
  });

  it('should set and get single cookies', () => {
    cookieService.set( 'Foo', 'Bar' );
    const value = cookieService.get('Foo');
    expect( value ).toEqual('Bar');
  });

  it('should delete single cookies', () => {
    cookieService.set( 'Foo', 'Bar' );
    let value = cookieService.get('Foo');
    expect( value ).toEqual('Bar');
    cookieService.delete('Foo');
    value = cookieService.get('Foo');
    expect( value ).toEqual('');
  });

  it('should check whether a cookie exists or not', () => {
    cookieService.set( 'Foo', 'Bar' );
    let value = cookieService.get('Foo');
    expect( value ).toEqual('Bar');
    expect( cookieService.check('Foo') ).toBe( true );
    cookieService.delete('Foo');
    value = cookieService.get('Foo');
    expect( value ).toEqual('');
    expect( cookieService.check('Foo') ).toBe( false );
  });

  it('should get all cookies', () => {
    cookieService.set( 'Foo', 'Bar' );
    cookieService.set( 'Hello', 'World' );

    const cookies = cookieService.getAll();

    expect( cookies['Foo'] ).toEqual( 'Bar' );
    expect( cookies['Hello'] ).toEqual( 'World' );
  });

  it('should delete all cookies', () => {
    cookieService.set( 'Foo', 'Bar' );
    cookieService.set( 'Hello', 'World' );

    let cookies = cookieService.getAll();

    expect( cookies['Foo'] ).toEqual('Bar');
    expect( cookies['Hello'] ).toEqual('World');

    cookieService.deleteAll();

    cookies = cookieService.getAll();

    expect( cookies['Foo'] ).toBe( undefined );
    expect( cookies['Hello'] ).toBe( undefined );
  });

  it('should handle special characters properly',  () => {
    const cookieNames: Array<string> = [
      '-H@llö_ Wörld-',
      '$uper^TEST(123)',
      'F()!!()/Bar',
      '*F.)/o(o*',
      '-O_o{1,2}',
      'B?ar|Fo+o',
      'Hello=World;',
      '[Foo-_*.]Bar',
    ];

    for ( const name of cookieNames ) {
      const testValue = 'Some value ' + (Math.round( Math.random() * 1000 ));
      cookieService.set( name, testValue );
      expect( cookieService.get( name ) ).toEqual( testValue );
    }
  });
});
