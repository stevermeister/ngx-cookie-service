import {
  ChangeDetectionStrategy,
  Component,
  createEnvironmentInjector,
  DestroyRef,
  DOCUMENT,
  EnvironmentInjector,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CookieEncoding, CookieService, provideCookieEncoding } from 'ngx-cookie-service';

interface EncodingResult {
  encoding: string;
  stored: string;
  read: string;
}

@Component({
  selector: 'encoding-example',
  templateUrl: './encoding-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncodingExampleComponent {
  private readonly document: Document = inject(DOCUMENT);
  private readonly parentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  // In an app you add provideCookieEncoding() once to app.config.ts. This demo compares two encodings on one page,
  // so it creates a child injector for each.
  private readonly uri: CookieService = this.serviceWith('uri');
  private readonly minimal: CookieService = this.serviceWith('minimal');

  protected readonly value: WritableSignal<string> = signal('eyJhbGciOiJIUzI1NiJ9.e30=');
  protected readonly results: WritableSignal<EncodingResult[]> = signal([]);

  protected compare(): void {
    this.uri.set('docs-uri', this.value(), { path: '/' });
    this.minimal.set('docs-minimal', this.value(), { path: '/' });
    this.results.set([
      { encoding: `'uri' (default)`, stored: this.rawValue('docs-uri'), read: this.uri.get('docs-uri') },
      { encoding: `'minimal'`, stored: this.rawValue('docs-minimal'), read: this.minimal.get('docs-minimal') },
    ]);
  }

  private serviceWith(encoding: CookieEncoding): CookieService {
    const injector = createEnvironmentInjector([CookieService, provideCookieEncoding(encoding)], this.parentInjector);
    inject(DestroyRef).onDestroy(() => injector.destroy());
    return injector.get(CookieService);
  }

  /** The value exactly as the browser stores it (what a server receives in the Cookie header). */
  private rawValue(name: string): string {
    const pair = this.document.cookie.split('; ').find((cookie) => cookie.startsWith(name + '='));
    return pair ? pair.slice(name.length + 1) : '';
  }
}
