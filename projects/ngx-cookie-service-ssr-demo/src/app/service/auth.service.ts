import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(HttpClient);
  router = inject(Router);
  cookieService = inject(SsrCookieService);

  public isUserLoggedIn(): boolean {
    console.log('token:', this.cookieService.get('token'));
    return this.cookieService.check('token');
  }

  logout() {
    this.cookieService.delete('token');
    this.router.navigate(['login']);
  }

  login() {
    return this.httpClient.get(`${API_BASE_URL}/login`).pipe(
      map((response: any) => {
        // login successful if there's a Spring Session token in the response
        if (response.body || response.token) {
          this.cookieService.set('token', response.token);
        }
        return response;
      })
    );
  }
}
