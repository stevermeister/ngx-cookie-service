# Agent Instructions for ngx-cookie-service

This is the workspace for the **ngx-cookie-service** Angular libraries. It is a pnpm-managed
Angular CLI workspace (ng-packagr libraries) that ships two published packages plus an SSR demo app.

## Workspace Layout

- `projects/ngx-cookie-service` — main library (`CookieService`), built with ng-packagr.
- `projects/ngx-cookie-service-ssr` — SSR library (`SsrCookieService`), built with ng-packagr.
- `projects/ngx-cookie-service-ssr-demo` — standalone SSR demo application (`@angular/build:application`).
- `dist/` — build output (generated; do not edit by hand).

## Toolchain

- Angular **22.x**, TypeScript **6.x**, RxJS **7.x**, Node types from `@types/node`.
- Package manager: **pnpm** (see `pnpm-workspace.yaml`). Do not switch to npm/yarn.
- Linting: **ESLint** flat config (`eslint.config.js`) via `angular-eslint`.
- Formatting: **Prettier** (`.prettierrc`): 2-space indent, `printWidth: 160`, single quotes, `trailingComma: es5`.
- Testing: **Vitest** through the Angular `@angular/build:unit-test` builder.

## Common Commands

- Install: `pnpm install`
- Build main library: `pnpm build`
- Build SSR library: `pnpm build:ngx-cookie-service-ssr`
- Build SSR demo: `pnpm build:ssr-demo`
- Run main library tests: `pnpm test` (i.e. `ng test ngx-cookie-service --watch=false`)
- Run SSR library tests: `pnpm test:ngx-cookie-service-ssr`
- Lint main library: `pnpm lint`
- Lint SSR library: `pnpm lint:ngx-cookie-service-ssr`
- Format check / write: `pnpm format:check` / `pnpm format:write`
- Serve demo: `pnpm start` or `pnpm start:ssr`

## Angular Conventions

1. **Latest Angular and TypeScript**
   - Target Angular 22+ APIs and TypeScript 6+. If unsure about an API, refer to the [Angular Docs](https://angular.dev/).

2. **Modern Angular Features Only**
   - Prefer Angular control flow syntax (`@if`, `@for`, `@switch`) over legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
   - Use Angular signals for state and reactivity.
   - Prefer input signals and output signals for component communication. See [InputSignal](https://angular.dev/reference/api/core/InputSignal) and [OutputSignal](https://angular.dev/reference/api/core/OutputSignal).

3. **No Legacy Decorators**
   - Do not use or recommend `@Input` and `@Output` decorators in new examples; use signal-based `input()` / `output()`.

4. **Template Syntax & Style**
   - Use modern template syntax and best practices (`@for`, `@if`, `@switch`).
   - Use `<ng-container>` for structural grouping when needed.

5. **Component Architecture**
   - Prefer standalone components (the repo does not use NgModules for new features).
   - Keep components self-contained and reusable, and set an explicit `ChangeDetectionStrategy`.

6. **Type Safety**
   - Provide explicit types for function signatures, variables, and observables.
   - Angular compiler strictness is enforced via `strictInjectionParameters` and `strictInputAccessModifiers` in `tsconfig.json` plus the per-project `tsconfig.*.json`. Note: global `"strict": true` is **not** currently enabled — match the existing project settings rather than assuming strict mode.

7. **Dependency Injection**
   - Use `inject()` and `@Injectable({ providedIn: 'root' })` for services unless a different scope is needed.
   - Prefer Angular DI over manual instantiation or singleton hacks.

8. **API Communication**
   - Use Angular's `HttpClient` (e.g. `httpResource`) for HTTP/API interactions.
   - Prefer typed responses and RxJS-based error handling.

9. **State Management**
   - Use signals for component-level state.
   - For app-wide state, prefer signals-based/lightweight solutions compatible with Angular 22+; avoid heavy legacy state libraries such as NgRx unless clearly necessary.

10. **Testing**
    - Add unit tests (`*.spec.ts`) for new behavior. Tests run on **Vitest** (globals enabled, import `vi` from `vitest`; see `tsconfig.spec.json` `types: ["vitest/globals"]`).
    - Use `TestBed` from `@angular/core/testing` and Vitest's `describe`/`it`/`expect`/`vi`.

11. **Accessibility**
    - Follow WCAG guidelines and Angular's accessibility best practices; keep the `angular-eslint` template accessibility rules green.

12. **Documentation and Comments**
    - Document public APIs, inputs, and outputs.
    - Follow the existing JSDoc style, including `@author` and `@since` tags on public/service methods, and the Angular style guide for structure and naming.

13. **No Deprecated APIs**
    - Never use deprecated Angular APIs, patterns, or features.
    - Check breaking changes or removals for each Angular version [here](https://update.angular.io/).

## Style Rules Enforced by Tooling

- ESLint `max-len` is set to **160** (match Prettier's `printWidth: 160`).
- Keep formatting consistent with Prettier; run `pnpm format:write` before committing and `pnpm lint` to verify.
- `@typescript-eslint/no-explicit-any` is disabled in this repo, but prefer precise types anyway.
