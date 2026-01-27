import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../constants/app.constants';
import { SsrCookieService } from '../../../../ngx-cookie-service-ssr/src/lib/ssr-cookie.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(HttpClient);
  router = inject(Router);
  cookieService = inject(SsrCookieService);

  public isUserLoggedIn(): boolean {
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
