import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'delete-example',
  templateUrl: './delete-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteExampleComponent {
  private readonly cookieService: CookieService = inject(CookieService);

  protected readonly cookies: WritableSignal<Record<string, string>> = signal(this.cookieService.getAll());

  protected addSamples(): void {
    this.cookieService.set('docs-cart', '3 items', { path: '/' });
    this.cookieService.set('docs-language', 'en', { path: '/' });
    this.cookieService.set('docs-consent', 'analytics', { path: '/' });
    this.refresh();
  }

  protected delete(name: string): void {
    // path must match the path the cookie was set with.
    this.cookieService.delete(name, { path: '/' });
    this.refresh();
  }

  protected deleteAll(): void {
    this.cookieService.deleteAll({ path: '/' });
    this.refresh();
  }

  protected names(): string[] {
    return Object.keys(this.cookies());
  }

  private refresh(): void {
    this.cookies.set(this.cookieService.getAll());
  }
}
