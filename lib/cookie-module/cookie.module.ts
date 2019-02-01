import { NgModule } from '@angular/core';

import { CookieService } from '../cookie-service/cookie.service';

@NgModule({
  providers: [ CookieService ]
})
export class CookieModule {}
