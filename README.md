# NGX Cookie Service

<p align="center">



[![Build](https://github.com/stevermeister/ngx-cookie-service/actions/workflows/ci.yml/badge.svg)](https://github.com/stevermeister/ngx-cookie-service/actions/workflows/ci.yml)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ngx-cookie-service) 
<a href="https://www.npmjs.com/ngx-cookie-service">
<img src="https://img.shields.io/npm/v/ngx-cookie-service.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="Ngx Cookie Service on npm" />
</a>
<a href="https://gitter.im/ngx-cookie-service/community">
<img src="https://badges.gitter.im/ngx-cookie-service/community.svg" alt="Chat in Gitter" />
</a>
[![ngx-cookie-service channel on discord](https://img.shields.io/discord/873021904708059177.svg?style=flat-square)](https://discord.gg/N3xc4Jfb)

</p>

Angular service to read, set and delete browser cookies. Originally based on
the [ng2-cookies](https://www.npmjs.com/package/ng2-cookies) library. This service is lightweight, and its bundle size is **1.3 Kb** to ensure fast loading times and optimal performance.

**Documentation and live examples: [ngx-cookie-service.netlify.app](https://ngx-cookie-service.netlify.app/)**

## Installation

```bash
npm i ngx-cookie-service

# or

pnpm add ngx-cookie-service
```

## Demo

- Documentation with live examples: [ngx-cookie-service.netlify.app](https://ngx-cookie-service.netlify.app/)
- StackBlitz demo: [ngx-cookie-service-demo](https://stackblitz.com/~/github.com/pavankjadda/ngx-cookie-service-demo)

## Usage

`CookieService` is provided in root, so inject it wherever you need it:

```typescript
import { Component, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'my-component',
  template: `<h1>Hello World</h1>`,
})
export class HelloComponent {
  private readonly cookieService = inject(CookieService);

  constructor() {
    this.cookieService.set('token', 'Hello World', { path: '/' });
    console.log(this.cookieService.get('token'));
  }
}
```

See the [usage guide](https://ngx-cookie-service.netlify.app/getting-started/usage/) for options and common pitfalls.

## Server Side Rendering

Ngx Cookie Service supports Server Side Rendering (SSR) via the dedicated
library [ngx-cookie-service-ssr](https://www.npmjs.com/package/ngx-cookie-service-ssr).
Install `ngx-cookie-service-ssr` **instead of** `ngx-cookie-service` for SSR apps.

1. Install the library:

   ```shell
   npm install ngx-cookie-service-ssr
   ```

2. Inject `SsrCookieService`. It has the same API as `CookieService` and also works on the server:

   ```typescript
   import { inject } from '@angular/core';
   import { SsrCookieService } from 'ngx-cookie-service-ssr';

   const cookieService = inject(SsrCookieService);
   ```

3. Serve the app with Angular's `AngularNodeAppEngine` or `AngularAppEngine` (the default for apps created with
   `ng new --ssr`). They provide the `REQUEST` and `RESPONSE_INIT` tokens the service reads from, so there is nothing
   else to configure. On a custom server, provide `REQUEST` yourself.

On the server, `get()`, `check()` and `getAll()` read the request's `Cookie` header and also see cookies set or deleted
earlier while rendering the same request, whatever their `path` or `domain`. `set()`, `delete()` and `deleteAll()` add
`Set-Cookie` headers to the response. Cookies with `httpOnly: true` can only be set on the server; in the browser the
call is skipped with a console warning. See the [SSR guide](https://ngx-cookie-service.netlify.app/getting-started/server-side-rendering/)
for details.

## Supported Versions
We follow angular [LTS versions](https://angular.dev/reference/versions#actively-supported-versions). The latest version of the library supports Angular 22.x.x. Angular 14.x.x or below is not supported.

| Angular Version        | Supported Version |
|------------------------|-------------------|
| 22.x.x                 | 22.x.x            |
| 21.x.x                 | 21.x.x            |
| 20.x.x                 | 20.x.x            |
| 19.x.x                 | 19.x.x            |
| 18.x.x                 | 18.x.x            |
| 17.x.x                 | 17.x.x            |
| 16.x.x                 | 16.x.x            |
| 15.x.x                 | 15.x.x            |

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

**Important:** Browsers do not accept cookies flagged sameSite = 'None' or partitioned unless the secure flag is set as
well. CookieService will override the secure flag to true if sameSite='None' or partitioned is true.

If `path` or `domain` contains `;` or a control character, the cookie is not written or deleted, and a warning is
logged to the console. An invalid `expires` or `sameSite` value is ignored with a warning.

## delete( name: string, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void;

## delete( name: string, options?: { path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict', partitioned?: boolean }): void;

```typescript
cookieService.delete('test');
cookieService.delete('test', { path: '/', secure: true, sameSite: 'None', partitioned: true });
```

Deletes a cookie with the specified `name`. The attributes must match the ones the cookie was set with: `path` and
`domain` select the cookie, and `partitioned: true` is needed to delete a Partitioned cookie.

It is best practice to always define a path. If you are unsure about the path value, use `'/'`. Without a path, the
browser uses the directory of the URL the page was loaded at, so in a single-page app the result depends on the URL the
user first landed on.

**Important:** For security reasons, it is not possible to delete cookies for other domains. Browsers do not allow this.
Read [this](https://stackoverflow.com/a/1063760) and [this](https://stackoverflow.com/a/17777005/1007003) StackOverflow
answer for a more in-depth explanation.

## deleteAll( path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax' ): void;

## deleteAll( options?: { path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict', partitioned?: boolean }): void;

```typescript
cookieService.deleteAll();
cookieService.deleteAll({ path: '/' });
```

Deletes all cookies that can currently be accessed, using the same attributes for each one. It is best practice to
always define a path. If you are unsure about the path value, use `'/'`.

## provideCookieOptions( options: CookieOptions ): EnvironmentProviders;

```typescript
// app.config.ts
import { provideCookieOptions } from 'ngx-cookie-service'; // or 'ngx-cookie-service-ssr'

export const appConfig: ApplicationConfig = {
  providers: [provideCookieOptions({ path: '/', secure: true, sameSite: 'Strict' })],
};
```

Sets default options for every `set()`, `delete()` and `deleteAll()` call, so you don't have to repeat them. Options
passed to a call win over the defaults, and `undefined` values don't override them. A call that passes its own `expires`
(or `maxAge` in `ngx-cookie-service-ssr`) replaces the default lifetime, so `delete()` always expires the cookie.

Setting `path: '/'` here is recommended. Without a path, the browser uses the directory of the URL the page was loaded
at, so the same code can read or delete different cookies depending on where the user landed.

## provideCookieEncoding( encoding: 'uri' | 'minimal' | CookieCodec ): EnvironmentProviders;

```typescript
// app.config.ts
import { provideCookieEncoding } from 'ngx-cookie-service'; // or 'ngx-cookie-service-ssr'

export const appConfig: ApplicationConfig = {
  providers: [provideCookieEncoding('minimal')],
};
```

Sets how cookie values are encoded when they are written and decoded when they are read. Cookie names keep the
default encoding.

- `'uri'` (default): values are encoded with `encodeURIComponent`, so `ab+/cd==` is stored as `ab%2B%2Fcd%3D%3D`.
- `'minimal'`: values made only of characters allowed in a cookie value are stored as-is, so `ab+/cd==` stays
  `ab+/cd==`. Other values fall back to `encodeURIComponent`. Use it when a server reads cookies without URL-decoding
  them, for example JWT or base64 values. Express encodes cookie values the same way.
- A custom `{ encode(value, name), decode(value, name) }` object for any other scheme. If the encoded value contains
  `;` or a control character, the cookie is not written and a warning is logged.

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
npm install # or `pnpm install`
```

## I have a problem with framework X or library Y. What can I do?

Please be aware that we cannot help you with problems that are out of scope. For example, we cannot debug a Symfony or
Springboot application for you. In that case, you are better off asking the nice folks over
at [StackOverflow](https://stackoverflow.com/) for help.

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

- [Pavan Kumar Jadda](https://github.com/pavankjadda)
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

# License

[MIT](https://github.com/stevermeister/ngx-cookie-service/blob/master/LICENSE)
