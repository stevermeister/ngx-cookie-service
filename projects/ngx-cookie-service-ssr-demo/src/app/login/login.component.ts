import {Component, inject, OnInit} from '@angular/core';
import {ReactiveFormsModule, UntypedFormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../service/auth.service';
import {Router} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	standalone: true,
	imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatFormFieldModule],
})
export class LoginComponent implements OnInit {
	fb = inject(UntypedFormBuilder);
	router = inject(Router);
	authService = inject(AuthService);
	loginFormGroup = this.fb.group({
		username: ['admin', Validators.required],
		password: ['admin', Validators.required],
	});

	ngOnInit(): void {
	}

	loginUser() {
		this.authService.login().subscribe((data) => {
			console.log(data);
			this.router.navigateByUrl('/home');
		});
	}
}
