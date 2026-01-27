import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { MatButtonModule } from '@angular/material/button';
import { httpResource } from '@angular/common/http';
import { API_BASE_URL } from '../constants/app.constants';
import { User } from '../model/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [MatButtonModule],
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  cookieService = inject(SsrCookieService);
  token: string | undefined;
  user = httpResource<User>(() => `${API_BASE_URL}/home`);

  ngOnInit(): void {
    this.token = this.cookieService.get('token');
  }

  logout() {
    this.authService.logout();
  }
}
