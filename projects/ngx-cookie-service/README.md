# NGX Cookie Service

<p align="center">

![build](https://github.com/stevermeister/ngx-cookie-service/workflows/CI/badge.svg?branch=master)
<a href="https://www.npmjs.com/ngx-cookie-service">
<img src="https://img.shields.io/npm/v/ngx-cookie-service.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="Ngx Cookie Service on npm" />
</a>
<a href="https://gitter.im/ngx-cookie-service/community">
<img src="https://badges.gitter.im/ngx-cookie-service/community.svg" alt="Chat in Gitter" />
</a>
[![ngx-cookie-service channel on discord](https://img.shields.io/discord/873021904708059177.svg?style=flat-square)](https://discord.gg/N3xc4Jfb)

</p>

Angular service to read, set and delete browser cookies. Originally based on the [ng2-cookies](https://www.npmjs.com/package/ng2-cookies) library. The experienced team behind [Studytube](https://www.studytube.nl/) will take care of our cookie service from now on.

> Note: `ViewEngine` support has been removed on 13.x.x. See [compatability matrix](https://github.com/stevermeister/ngx-cookie-service#supported-versions) for details

## Installation

```bash
npm install ngx-cookie-service --save

# or

yarn add ngx-cookie-service
```

## Usage
Add the cookie service to your `app.module.ts` as a provider:

```typescript
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  ...
    providers:
[CookieService],
...
})

export class AppModule {
}
```

Then, import and inject it into a constructor:

```typescript
constructor(private
cookieService: CookieService
)
{
  this.cookieService.set('Test', 'Hello World');
  this.cookieValue = this.cookieService.get('Test');
}
```

That's it!
### Angular 14+
1. Angular 14 introduced support for standalone components.
   If you are using just standalone components, you can import the service directly into the component
    ```typescript
    import {CookieService} from 'ngx-cookie-service';
    import {Component} from '@angular/core';
    
    @Component({
      selector: 'my-component',
      template: `<h1>Hello World</h1>`,
      providers: [CookieService]
    })
    
    export class HelloComponent {
      constructor(private cookieService: CookieService) {
        this.cookieService.set('Test', 'Hello World');
        this.cookieValue = this.cookieService.get('Test');
      }
    }
    ```
2. You can also use `inject()` method in v14+ to inject the service into the component
    ```typescript
    import {CookieService} from 'ngx-cookie-service';
    import {Component,inject} from '@angular/core';
    
    @Component({
      selector: 'my-component',
      template: `<h1>Hello World</h1>`,
      providers: [CookieService]
    })
    
    export class HelloComponent {
        cookieService=inject(CookieService);
   
        constructor() {
        this.cookieService.set('Test', 'Hello World');
        this.cookieValue = this.cookieService.get('Test');
      }
    }
    ```
## Server Side Rendering
Ngx Cookie Service supports Server Side Rendering (SSR) via dedicated library [ngx-cookie-service-ssr](https://www.npmjs.com/package/ngx-cookie-service-ssr).
Only install `ngx-cookie-service-ssr` library (and skip `ngx-cookie-service`) for SSR

1. Install the library using below command
    ```shell
        npm install ngx-cookie-service-ssr --save
        
        # or
        
        yarn add ngx-cookie-service-ssr
    ```
2. By default, browser cookies are not
   available in SSR because `document` object is not available. To overcome this, navigate to `server.ts` file in your SSR
   project, and replace the following code

    ```typescript
    server.get('*', (req, res) => {
      res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
    });
    ```
with this

```typescript
server.get('*', (req, res) => {
      res.render(indexHtml, {
        req,
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
          { provide: 'REQUEST', useValue: req },
          { provide: 'RESPONSE', useValue: res },
        ],
      });
    });
```

3. This will make sure the cookies are available in `REQUEST` object, and the `ngx-cookie-service-ssr` can use `REQUEST.cookies` to access the
   cookies in SSR. Then proceed to use `ngx-cookie-service` as usual.
4. See the [sample repo](https://github.com/pavankjadda/angular-ssr-docker) for more details.

## Demo

https://stackblitz.com/edit/angular-ivy-1lrgdt?file=src%2Fapp%2Fapp.component.ts

## Supported Versions

`ViewEngine` support has been removed on 13.x.x. For Angular versions 13.x.x or later use the latest version of the
library. For versions <=12.x.x, use 12.0.3 version

| Angular Version        | Supported Version |
| ---------------------- | ----------------- |
| 13.x.x or later (Ivy)  | 13.x.x or later   |
| <=12.x.x (View Engine) | 12.0.3            |

# API

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

## set( name: string, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'Strict' | 'None' ): void;

## set( name: string, value: string, options?: { expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'}): void;

```typescript
cookieService.set('test', 'Hello World');
cookieService.set('test', 'Hello World', { expires: 2, sameSite: 'Lax' });
```

Sets a cookie with the specified `name` and `value`. It is good practice to specify a path. If you are unsure about the
path value, use `'/'`. If no path or domain is explicitly defined, the current location is assumed. `sameSite` defaults
to `Lax`.

**Important:** For security reasons, it is not possible to define cookies for other domains. Browsers do not allow this.
Read [this](https://stackoverflow.com/a/1063760) and [this](https://stackoverflow.com/a/17777005/1007003) StackOverflow
answer for a more in-depth explanation.

**Important:** Browsers do not accept cookies flagged sameSite = 'None' if secure flag isn't set as well. CookieService
will override the secure flag to true if sameSite='None'.

## delete( name: string, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void;

```typescript
cookieService.delete('test');
```

Deletes a cookie with the specified `name`. It is best practice to always define a path. If you are unsure about the
path value, use `'/'`.

**Important:** For security reasons, it is not possible to delete cookies for other domains. Browsers do not allow this.
Read [this](https://stackoverflow.com/a/1063760) and [this](https://stackoverflow.com/a/17777005/1007003) StackOverflow
answer for a more in-depth explanation.

## deleteAll( path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax' ): void;

```typescript
cookieService.deleteAll();
```

Deletes all cookies that can currently be accessed. It is best practice to always define a path. If you are unsure about
the path value, use `'/'`.

# FAQ

## General tips

Checking out the following resources usually solves most of the problems people seem to have with this cookie service:

- [article about cookies in general @MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) (recommended read!)
- [common localhost problems @StackOverflow](https://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain)
- [problems with secure cookies @StackOverflow](https://stackoverflow.com/questions/8064318/how-to-read-a-secure-cookie-using-javascript)
- [how do browser cookie domains work? @StackOverflow](https://stackoverflow.com/questions/1062963/how-do-browser-cookie-domains-work)
- [get cookies from different paths](https://github.com/7leads/ngx-cookie-service/issues/7#issuecomment-351321518)

The following general steps are usually very helpful when debugging problems with this cookie service or cookies in
general:

- check out if there are any [open](https://github.com/stevermeister/ngx-cookie-service/issues)
  or [closed](https://github.com/stevermeister/ngx-cookie-service/issues?q=is%3Aissue+is%3Aclosed) issues that answer
  your question
- check out the actual value(s) of `document.cookie`
- does it work if you use `document.cookie` manually (i.e. in a console of your choice)?
- set explicit paths for your cookies
- [explain to your local rubber duck why your code should work and why it (probably) does not](https://en.wikipedia.org/wiki/Rubber_duck_debugging)

# I am always getting a "token missing" or "no provider" error.

Package managers are a well known source of frustration. If you have "token missing" or "no provider" errors, a simple
re-installation of your node modules might suffice:

```
rm -rf node_modules
yarn # or `npm install`
```

## I have a problem with framework X or library Y. What can I do?

Please be aware that we cannot help you with problems that are out of scope. For example, we cannot debug a Symfony or
Springboot application for you. In that case, you are better off asking the nice folks over
at [StackOverflow](https://stackoverflow.com/) for help.

## Do you support Angular Universal?

There is an [issue](https://github.com/7leads/ngx-cookie-service/issues/1) for that. Check
out [this comment](https://github.com/7leads/ngx-cookie-service/issues/1#issuecomment-361150174) for more information
about future support.

# Opening issues

Please make sure to check out our FAQ before you open a new issue. Also, try to give us as much information as you can
when you open an issue. Maybe you can even supply a test environment or test cases, if necessary?

# Contributing

We are happy to accept pull requests or test cases for things that do not work. Feel free to submit one of those.

However, we will only accept pull requests that pass all tests and include some new ones (as long as it makes sense to
add them, of course).

- [Open a new pull request](https://github.com/stevermeister/ngx-cookie-service/compare)

# Author

This cookie service is brought to you by [7leads GmbH](http://www.7leads.org/). We built it for one of our apps, because
the other cookie packages we found were either not designed "the Angular way" or caused trouble during AOT compilation.

# Contributors

Thanks to all contributors:

- [paroe](https://github.com/paroe)
- [CunningFatalist](https://github.com/CunningFatalist)
- [kthy](https://github.com/kthy)
- [JaredClemence](https://github.com/JaredClemence)
- [flakolefluk](https://github.com/flakolefluk)
- [mattbanks](https://github.com/mattbanks)
- [DBaker85](https://github.com/DBaker85)
- [mattlewis92](https://github.com/mattlewis92)
- [IceBreakerG](https://github.com/IceBreakerG)
- [rojedalopez](https://github.com/rojedalopez)
- [Nikel163](https://github.com/Nikel163)
- [pavankjadda](https://github.com/pavankjadda)

# License

[MIT](https://github.com/stevermeister/ngx-cookie-service/blob/master/LICENSE)
