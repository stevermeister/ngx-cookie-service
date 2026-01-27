import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const UserGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const router = inject(Router);
	const authService = inject(AuthService);

	if (authService.isUserLoggedIn()) {
		return true;
	} else {
		router.navigateByUrl('/login');
	}
	return false;
};
