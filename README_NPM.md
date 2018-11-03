# NGX Cookie Service

An (AOT ready) Angular (4.2+) service for cookies. Originally based on the [ng2-cookies](https://www.npmjs.com/package/ng2-cookies) library.

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

Checks if a cookie with the given`name` can be accessed or found.

## get( name: string ): string;

```typescript
const value: string = cookieService.get('test');
```

Gets the value of the cookie with the specified `name`.

## getAll(): {};

```typescript
const allCookies: {} = cookieService.getAll();
```

Returns a map of key-value pairs for cookies that can be accessed.

## set( name: string, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean ): void;

```typescript
cookieService.set( 'test', 'Hello World' );
```

Sets a cookie with the specified `name` and `value`. It is good practice to specify a path. If you are unsure about the path value, use `'/'`. If no path or domain is explicitly defined, the current location is assumed.

**Important:** For security reasons, it is not possible to define cookies for other domains. Browsers do not allow this. Read [this](https://stackoverflow.com/a/1063760) and [this](https://stackoverflow.com/a/17777005/1007003) StackOverflow answer for a more in-depth explanation.

## delete( name: string, path?: string, domain?: string ): void;

```typescript
cookieService.delete('test');
```

Deletes a cookie with the specified `name`.  It is best practice to always define a path. If you are unsure about the path value, use `'/'`.

**Important:** For security reasons, it is not possible to delete cookies for other domains. Browsers do not allow this. Read [this](https://stackoverflow.com/a/1063760) and [this](https://stackoverflow.com/a/17777005/1007003) StackOverflow answer for a more in-depth explanation.

## deleteAll( path?: string, domain?: string ): void;

```typescript
cookieService.deleteAll();
```

Deletes all cookies that can currently be accessed. It is best practice to always define a path. If you are unsure about the path value, use `'/'`.

# FAQ & Troubleshooting

Are you having any trouble with your integration or cookies in general? Check out our [FAQ](https://github.com/7leads/ngx-cookie-service#faq), maybe it will save you some headache.

# Author

This cookie service is brought to you by [7leads GmbH](http://www.7leads.org/). We built it for one of our apps, because the other cookie packages we found were either not designed "the Angular way" or caused trouble during AOT compilation.

Check out the [GitHub page](https://github.com/7leads/ngx-cookie-service) for more.

# License

[MIT](https://github.com/7leads/ngx-cookie-service/blob/master/LICENSE)
