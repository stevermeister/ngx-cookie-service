import { TestBed, async, inject } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { CookieService } from '../../lib';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      providers: [ CookieService ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent( AppComponent );
    const app = fixture.debugElement.componentInstance;
    expect( app ).toBeTruthy();
  }));

  it('should be created properly', inject([ CookieService ], ( cookieService: CookieService ) => {
    expect( cookieService ).toBeTruthy();
  }));

  it('should set and get single cookies', inject([ CookieService ], ( cookieService: CookieService ) => {
    cookieService.set( 'Foo', 'Bar' );

    const value = cookieService.get('Foo');

    expect( value ).toEqual('Bar');
  }));

  it('should delete single cookies', inject([ CookieService ], ( cookieService: CookieService ) => {
    cookieService.set( 'Foo', 'Bar' );

    let value = cookieService.get('Foo');

    expect( value ).toEqual('Bar');

    cookieService.delete('Foo');

    value = cookieService.get('Foo');

    expect( value ).toEqual('');
  }));

  it('should check whether a cookie exists or not', inject([ CookieService ], ( cookieService: CookieService ) => {
    cookieService.set( 'Foo', 'Bar' );

    let value = cookieService.get('Foo');

    expect( value ).toEqual('Bar');
    expect( cookieService.check('Foo') ).toBe( true );

    cookieService.delete('Foo');

    value = cookieService.get('Foo');

    expect( value ).toEqual('');
    expect( cookieService.check('Foo') ).toBe( false );
  }));

  it('should get all cookies', inject([ CookieService ], ( cookieService: CookieService ) => {
    cookieService.set( 'Foo', 'Bar' );
    cookieService.set( 'Hello', 'World' );

    const cookies = cookieService.getAll();

    expect( cookies['Foo'] ).toEqual( 'Bar' );
    expect( cookies['Hello'] ).toEqual( 'World' );
  }));

  it('should delete all cookies', inject([ CookieService ], ( cookieService: CookieService ) => {
    cookieService.set( 'Foo', 'Bar' );
    cookieService.set( 'Hello', 'World' );

    let cookies = cookieService.getAll();

    expect( cookies['Foo'] ).toEqual('Bar');
    expect( cookies['Hello'] ).toEqual('World');

    cookieService.deleteAll();

    cookies = cookieService.getAll();

    expect( cookies['Foo'] ).toBe( undefined );
    expect( cookies['Hello'] ).toBe( undefined );
  }));
});
