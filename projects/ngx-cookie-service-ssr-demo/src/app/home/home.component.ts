import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { MatButtonModule } from '@angular/material/button';
import { httpResource } from '@angular/common/http';
import { API_BASE_URL } from '../constants/app.constants';
import { User } from '../model/user';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [MatButtonModule],
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  cookieService = inject(SsrCookieService);
  platformId = inject(PLATFORM_ID);
  token: string | undefined;
  serverCookieValue: string | undefined;

  user = httpResource<User>(() => `${API_BASE_URL}/home`);

  ngOnInit(): void {
    if (isPlatformServer(this.platformId)) {
      this.cookieService.set('server-cookie', crypto.randomUUID());
    }

    this.token = this.cookieService.get('token');

    // We try to read it. In browser it should exist if server set it.
    // On server, after we set it, we might not be able to read it back depending on implementation
    // (usually SsrCookieService reads from REQUEST, not RESPONSE where we just set it).
    // But for demo purpose, we display what we read.
    this.serverCookieValue = this.cookieService.get('server-cookie');
  }

  logout() {
    this.authService.logout();
  }
}
