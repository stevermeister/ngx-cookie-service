import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CookieService, SameSite } from 'ngx-cookie-service';
import { CookieInspectorComponent } from '../shared/cookie-inspector.component';

@Component({
  selector: 'same-site-example',
  templateUrl: './same-site-example.component.html',
  imports: [CookieInspectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SameSiteExampleComponent {
  private readonly cookieService: CookieService = inject(CookieService);

  protected readonly sameSiteValues: SameSite[] = ['Lax', 'Strict', 'None'];
  protected readonly sameSite: WritableSignal<SameSite> = signal('Lax');
  protected readonly secure: WritableSignal<boolean> = signal(false);
  protected readonly partitioned: WritableSignal<boolean> = signal(false);
  protected readonly refresh: WritableSignal<number> = signal(0);

  protected call(): string {
    const options = [`sameSite: '${this.sameSite()}'`, `secure: ${this.secure()}`, `partitioned: ${this.partitioned()}`, `path: '/'`];
    return `cookieService.set('docs-same-site', 'yes', { ${options.join(', ')} })`;
  }

  protected set(): void {
    // sameSite: 'None' and partitioned: true both need Secure, so CookieService turns it on and logs a console warning.
    this.cookieService.set('docs-same-site', 'yes', {
      sameSite: this.sameSite(),
      secure: this.secure(),
      partitioned: this.partitioned(),
      path: '/',
    });
    this.refresh.update((r) => r + 1);
  }
}
