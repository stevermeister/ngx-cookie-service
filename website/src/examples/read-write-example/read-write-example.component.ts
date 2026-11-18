import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'read-write-example',
  templateUrl: './read-write-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadWriteExampleComponent {
  private readonly cookieService: CookieService = inject(CookieService);

  protected readonly name: WritableSignal<string> = signal('docs-theme');
  protected readonly value: WritableSignal<string> = signal('dark');
  /** The call that ran last and what it returned. */
  protected readonly result: WritableSignal<string> = signal('');
  /** Every cookie this page can read, as returned by getAll(). */
  protected readonly cookies: WritableSignal<Record<string, string>> = signal(this.cookieService.getAll());

  protected set(): void {
    this.cookieService.set(this.name(), this.value(), { path: '/' });
    this.show(`set('${this.name()}', '${this.value()}', { path: '/' })`, undefined);
  }

  protected get(): void {
    this.show(`get('${this.name()}')`, JSON.stringify(this.cookieService.get(this.name())));
  }

  protected check(): void {
    this.show(`check('${this.name()}')`, String(this.cookieService.check(this.name())));
  }

  protected delete(): void {
    this.cookieService.delete(this.name(), { path: '/' });
    this.show(`delete('${this.name()}', { path: '/' })`, undefined);
  }

  protected entries(): [string, string][] {
    return Object.entries(this.cookies());
  }

  private show(call: string, returned: string | undefined): void {
    this.result.set(returned === undefined ? `cookieService.${call}` : `cookieService.${call} → ${returned}`);
    this.cookies.set(this.cookieService.getAll());
  }
}
