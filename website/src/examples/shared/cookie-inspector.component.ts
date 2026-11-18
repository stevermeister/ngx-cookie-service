import { ChangeDetectionStrategy, Component, effect, input, InputSignal, signal, WritableSignal } from '@angular/core';

/** The subset of the Cookie Store API (`window.cookieStore`) this inspector uses. */
interface CookieListItem {
  name: string;
  value: string;
  path?: string;
  domain?: string | null;
  expires?: number | null;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  partitioned?: boolean;
}

interface CookieStoreLike {
  get(name: string): Promise<CookieListItem | null>;
}

/** What the inspector shows: the stored cookie, `null` when not visible here, or `undefined` while loading / unsupported. */
type InspectorState = { kind: 'loading' } | { kind: 'unsupported' } | { kind: 'missing' } | { kind: 'found'; cookie: CookieListItem };

/**
 * Docs helper, not part of ngx-cookie-service: shows the attributes the browser actually stored for a cookie.
 *
 * `document.cookie` only exposes names and values, so this reads the cookie back with the Cookie Store API, which also
 * reports `Path`, `Expires`, `SameSite`, `Secure` and `Partitioned`.
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
@Component({
  selector: 'docs-cookie-inspector',
  template: `
    @switch (state().kind) {
      @case ('unsupported') {
        <p class="docs-muted">This browser doesn't support the Cookie Store API, so the stored attributes can't be shown.</p>
      }
      @case ('missing') {
        <p class="docs-muted">
          No cookie named <code>{{ name() }}</code> is visible from this page.
        </p>
      }
      @case ('found') {
        @let cookie = found();
        <table class="docs-table" aria-label="Stored cookie attributes">
          <tbody>
            <tr>
              <th scope="row">Name</th>
              <td>
                <code>{{ cookie.name }}</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Stored value</th>
              <td>
                <code>{{ cookie.value || '(empty)' }}</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Path</th>
              <td>
                <code>{{ cookie.path }}</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Expires</th>
              <td>{{ cookie.expires ? formatDate(cookie.expires) : 'Session (deleted when the browser closes)' }}</td>
            </tr>
            <tr>
              <th scope="row">SameSite</th>
              <td>{{ cookie.sameSite }}</td>
            </tr>
            <tr>
              <th scope="row">Secure</th>
              <td>{{ cookie.secure ? 'Yes' : 'No' }}</td>
            </tr>
            <tr>
              <th scope="row">Partitioned</th>
              <td>{{ cookie.partitioned ? 'Yes' : 'No' }}</td>
            </tr>
          </tbody>
        </table>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieInspectorComponent {
  /** Name of the cookie to inspect. */
  readonly name: InputSignal<string> = input.required<string>();
  /** Change this value to read the cookie again, e.g. after a `set()` or `delete()`. */
  readonly refresh: InputSignal<number> = input<number>(0);

  protected readonly state: WritableSignal<InspectorState> = signal<InspectorState>({ kind: 'loading' });

  constructor() {
    effect(async () => {
      const name = this.name();
      this.refresh();
      const store = (globalThis as { cookieStore?: CookieStoreLike }).cookieStore;
      if (!store) {
        this.state.set({ kind: 'unsupported' });
        return;
      }
      const cookie = await store.get(name);
      this.state.set(cookie ? { kind: 'found', cookie } : { kind: 'missing' });
    });
  }

  protected found(): CookieListItem {
    const state = this.state();
    return state.kind === 'found' ? state.cookie : ({} as CookieListItem);
  }

  protected formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}
