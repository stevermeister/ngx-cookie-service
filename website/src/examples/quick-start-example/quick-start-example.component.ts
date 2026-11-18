import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'quick-start-example',
  templateUrl: './quick-start-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickStartExampleComponent {
  private readonly cookieService: CookieService = inject(CookieService);

  /** The saved name, read from the cookie when the component starts. Reload the page: it's still there. */
  protected readonly name: WritableSignal<string> = signal(this.cookieService.get('docs-name'));

  protected save(value: string): void {
    this.cookieService.set('docs-name', value.trim(), { expires: 7, path: '/' });
    this.name.set(this.cookieService.get('docs-name'));
  }

  protected forget(): void {
    this.cookieService.delete('docs-name', { path: '/' });
    this.name.set(this.cookieService.get('docs-name'));
  }
}
