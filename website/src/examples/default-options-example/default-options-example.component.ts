import { ChangeDetectionStrategy, Component, createEnvironmentInjector, DestroyRef, EnvironmentInjector, inject, signal, WritableSignal } from '@angular/core';
import { CookieService, provideCookieOptions } from 'ngx-cookie-service';
import { CookieInspectorComponent } from '../shared/cookie-inspector.component';

@Component({
  selector: 'default-options-example',
  templateUrl: './default-options-example.component.html',
  imports: [CookieInspectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultOptionsExampleComponent {
  private readonly parentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  // In an app: providers: [provideCookieOptions({ ... })] in app.config.ts, then inject(CookieService) as usual.
  private readonly cookieService: CookieService = this.createService();

  protected readonly cookieName: WritableSignal<string> = signal('docs-defaults');
  protected readonly refresh: WritableSignal<number> = signal(0);

  protected setWithDefaults(): void {
    // No options here: path, expires and sameSite all come from provideCookieOptions().
    this.cookieService.set('docs-defaults', 'yes');
    this.show('docs-defaults');
  }

  protected setWithOverride(): void {
    // Options passed to the call win over the defaults; the rest still apply.
    this.cookieService.set('docs-override', 'yes', { sameSite: 'Lax', expires: 30 });
    this.show('docs-override');
  }

  private show(name: string): void {
    this.cookieName.set(name);
    this.refresh.update((r) => r + 1);
  }

  private createService(): CookieService {
    const injector = createEnvironmentInjector(
      [CookieService, provideCookieOptions({ path: '/', expires: 1, sameSite: 'Strict', secure: true })],
      this.parentInjector
    );
    inject(DestroyRef).onDestroy(() => injector.destroy());
    return injector.get(CookieService);
  }
}
