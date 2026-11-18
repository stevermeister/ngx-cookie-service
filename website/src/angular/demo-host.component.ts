import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, input, InputSignal, PLATFORM_ID, ViewContainerRef } from '@angular/core';
import { EXAMPLES } from './examples.registry';

/**
 * Astro island that mounts one example component by folder name.
 *
 * Each island is its own Angular application. The example is loaded lazily and only in the browser, so build-time
 * prerendering never runs example code (all of it touches `document.cookie`).
 *
 * @author: Pavankumar Jadda
 * @since: 22.2.0
 */
@Component({
  selector: 'docs-demo-host',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoHostComponent {
  /** Folder name of the example under `website/src/examples`. */
  readonly example: InputSignal<string> = input<string>('');
  private readonly viewContainer: ViewContainerRef = inject(ViewContainerRef);

  constructor() {
    // Prerendering (platform-server) must not load demo code; inputs are also not set yet at that point.
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    afterNextRender(async () => {
      const load = EXAMPLES[this.example()];
      if (!load) {
        console.error(`[ngx-cookie-service docs] Unknown example "${this.example()}"`);
        return;
      }
      this.viewContainer.createComponent(await load());
    });
  }
}
