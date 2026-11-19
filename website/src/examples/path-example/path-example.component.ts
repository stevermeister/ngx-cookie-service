import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

interface PathCase {
  label: string;
  /** Cookie value, so the page can tell which of the cookies it sees. */
  value: string;
  path: string | undefined;
}

@Component({
  selector: 'path-example',
  templateUrl: './path-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathExampleComponent {
  private readonly cookieService: CookieService = inject(CookieService);

  protected readonly cases: PathCase[] = [
    { label: `path: '/'`, value: 'root', path: '/' },
    { label: 'no path (browser default)', value: 'default', path: undefined },
    { label: `path: '/somewhere-else'`, value: 'elsewhere', path: '/somewhere-else' },
  ];

  protected readonly log: WritableSignal<string[]> = signal([]);
  protected readonly cookies: WritableSignal<Record<string, string>> = signal(this.cookieService.getAll());

  protected set(pathCase: PathCase): void {
    this.cookieService.set('docs-path', pathCase.value, { path: pathCase.path });
    this.record(`set('docs-path', '${pathCase.value}', { path: ${this.literal(pathCase.path)} })`);
  }

  protected delete(pathCase: PathCase): void {
    this.cookieService.delete('docs-path', { path: pathCase.path });
    this.record(`delete('docs-path', { path: ${this.literal(pathCase.path)} })`);
  }

  protected visibleValue(): string | undefined {
    return this.cookies()['docs-path'];
  }

  private record(call: string): void {
    this.cookies.set(this.cookieService.getAll());
    const value = this.visibleValue();
    const outcome = value === undefined ? 'no docs-path cookie visible here' : `visible here: "${value}"`;
    this.log.update((lines) => [`${call} → ${outcome}`, ...lines].slice(0, 5));
  }

  private literal(path: string | undefined): string {
    return path === undefined ? 'undefined' : `'${path}'`;
  }
}
