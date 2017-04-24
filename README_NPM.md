# NGX Cookie Service

An (AOT ready) Angular (4+) service for cookies. Originally based on the [ng2-cookies](https://www.npmjs.com/package/ng2-cookies) library.

# Installation

```bash
npm install ngx-cookie-service --save

# or

yarn add ngx-cookie-service
```

Add the cookie service to your `app.module.ts` as a provider:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [ AppComponent ],
  imports: [ BrowserModule, FormsModule, HttpModule ],
  providers: [ CookieService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

Then, import and inject it into a component:

```typescript
import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  cookieValue = 'UNKNOWN';

  constructor( private cookieService: CookieService ) { }

  ngOnInit(): void {
    this.cookieService.set( 'Test', 'Hello World' );
    this.cookieValue = this.cookieService.get('Test');
  }
}
```

That's it!

# Methods

## check( name: string ): boolean;

```typescript
const cookieExists: boolean = cookieService.check('test');
```

## get( name: string ): string;

```typescript
const value: string = cookieService.get('test');
```

## getAll(): {};

```typescript
const allCookies: {} = cookieService.getAll();
```

## set( name: string, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean ): void;

```typescript
cookieService.set( 'test', 'Hello World' );
```

## delete( name: string, path?: string, domain?: string ): void;

```typescript
cookieService.delete('test');
```

## deleteAll( path?: string, domain?: string ): void;

```typescript
cookieService.deleteAll();
```

# Author

This cookie service is brought to you by [7leads GmbH](http://www.7leads.org/). We built it for one of our apps, because the other cookie packages we found were either not designed "the Angular way" or caused trouble during AOT compilation.

Check out the [GitHub page](https://github.com/7leads/ngx-cookie-service) for more.

# License

[MIT](https://github.com/7leads/ngx-cookie-service/blob/master/LICENSE)
