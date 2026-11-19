import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { CookieInspectorComponent } from '../shared/cookie-inspector.component';

interface ExpiryCase {
  name: string;
  call: string;
  set: () => void;
}

@Component({
  selector: 'expires-example',
  templateUrl: './expires-example.component.html',
  imports: [CookieInspectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpiresExampleComponent {
  private readonly cookieService: CookieService = inject(CookieService);

  protected readonly cases: ExpiryCase[] = [
    {
      name: 'docs-session',
      call: `set('docs-session', 'yes', { path: '/' })`,
      set: () => this.cookieService.set('docs-session', 'yes', { path: '/' }),
    },
    {
      name: 'docs-week',
      call: `set('docs-week', 'yes', { expires: 7, path: '/' })`,
      set: () => this.cookieService.set('docs-week', 'yes', { expires: 7, path: '/' }),
    },
    {
      name: 'docs-15-seconds',
      call: `set('docs-15-seconds', 'yes', { expires: new Date(Date.now() + 15_000), path: '/' })`,
      set: () => this.cookieService.set('docs-15-seconds', 'yes', { expires: new Date(Date.now() + 15_000), path: '/' }),
    },
  ];

  protected readonly selected: WritableSignal<string> = signal('docs-week');
  /** Bumped every second so check() runs again and the 15-second cookie can be seen expiring. */
  protected readonly tick: WritableSignal<number> = signal(0);

  constructor() {
    const timer = setInterval(() => this.tick.update((t) => t + 1), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected setCookie(expiryCase: ExpiryCase): void {
    expiryCase.set();
    this.selected.set(expiryCase.name);
    this.tick.update((t) => t + 1);
  }

  protected exists(name: string): boolean {
    this.tick();
    return this.cookieService.check(name);
  }
}
