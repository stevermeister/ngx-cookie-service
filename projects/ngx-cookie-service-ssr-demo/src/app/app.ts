import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('ngx-cookie-service-ssr-demo');
}
