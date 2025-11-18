import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
	req: HttpRequest<unknown>,
	next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
	const auth = inject(AuthService);
	const user = auth.currentUser();
	if (user?.token) {
		req = req.clone({
			setHeaders: {
				Authorization: `Bearer ${user.token}`,
			},
		});
	}
	return next(req);
};


