import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styles: [
    `
      .example-form {
        min-width: 150px;
        max-width: 500px;
        width: 100%;
      }

      .example-full-width {
        width: 100%;
      }
    `,
  ],
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatFormFieldModule, FormField],
})
export class LoginComponent {
  router = inject(Router);
  authService = inject(AuthService);
  loginModel = signal({
    username: 'admin',
    password: 'admin',
  });
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' });
    required(schemaPath.password, { message: 'Password is required' });
  });

  loginUser($event: Event) {
    $event.preventDefault();
    this.authService.login().subscribe((data) => {
      console.log(data);
      this.router.navigateByUrl('/home');
    });
  }
}
