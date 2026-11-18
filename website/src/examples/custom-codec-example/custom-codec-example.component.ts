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
import { CookieCodec, CookieService, provideCookieEncoding } from 'ngx-cookie-service';

/** Stores values as URL-safe base64, so any Unicode text survives the trip through the Cookie header. */
const base64Codec: CookieCodec = {
  encode: (value) =>
    btoa(String.fromCodePoint(...new TextEncoder().encode(value)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''),
  decode: (value) => {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.codePointAt(0) ?? 0);
    return new TextDecoder().decode(bytes);
  },
};

@Component({
  selector: 'custom-codec-example',
  templateUrl: './custom-codec-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCodecExampleComponent {
  private readonly document: Document = inject(DOCUMENT);
  private readonly parentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  // In an app: providers: [provideCookieEncoding(base64Codec)] in app.config.ts, then inject(CookieService) as usual.
  private readonly cookieService: CookieService = this.createService();

  protected readonly value: WritableSignal<string> = signal('Grüße, 世界! 🍪');
  protected readonly stored: WritableSignal<string> = signal('');
  protected readonly read: WritableSignal<string> = signal('');

  protected save(): void {
    this.cookieService.set('docs-base64', this.value(), { path: '/' });
    const pair = this.document.cookie.split('; ').find((cookie) => cookie.startsWith('docs-base64='));
    this.stored.set(pair ? pair.slice('docs-base64='.length) : '');
    this.read.set(this.cookieService.get('docs-base64'));
  }

  private createService(): CookieService {
    const injector = createEnvironmentInjector([CookieService, provideCookieEncoding(base64Codec)], this.parentInjector);
    inject(DestroyRef).onDestroy(() => injector.destroy());
    return injector.get(CookieService);
  }
}
