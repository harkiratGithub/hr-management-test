import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const auth = inject(AuthService);
	const router = inject(Router);
	const allowed = (route.data?.['roles'] as UserRole[]) ?? [];
	if (allowed.length === 0 || auth.hasRole(allowed)) {
		return true;
	}
	router.navigate(['/']);
	return false;
};


