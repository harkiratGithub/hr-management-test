import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthUser, UserRole } from '../models/user.model';
import { map, Observable, tap, catchError, of } from 'rxjs';

const STORAGE_KEY = 'erd_auth_user';
const API_BASE = '/api';
const STATIC_USERS: Array<{ id: number; email: string; password: string; role: UserRole; name: string }> = [
	{ id: 1, email: 'owner@company.com', password: 'owner123', role: 'SuperAdmin', name: 'Company Owner' },
	{ id: 2, email: 'hr@company.com', password: 'hr123', role: 'HR', name: 'HR User' }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly http = inject(HttpClient);
	private readonly router = inject(Router);

	currentUser = signal<AuthUser | null>(this.readStoredUser());

	login(email: string, password: string): Observable<AuthUser> {
		// Try backend first; fallback to local static users if backend unavailable
		return this.http
			.post<any>(`${API_BASE}/auth/login`, { email, password })
			.pipe(
				map((res) => {
					// Accept wrapped or flat shapes:
					// { status, statusCode, result: { accessToken } } OR { accessToken } OR { token }
					const accessToken: string | undefined =
						res?.result?.accessToken ?? res?.accessToken ?? res?.token;
					if (!accessToken) {
						throw new Error('No access token received');
					}

					// Try to decode JWT to get id/role if provided by backend
					let decoded: any = null;
					try {
						const base64 = accessToken.split('.')[1];
						const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
						decoded = JSON.parse(json);
					} catch {
						decoded = null;
					}

					const role: UserRole = (decoded?.role as UserRole) ?? 'HR';
					const id = Number(decoded?._id ?? decoded?.sub ?? 0);

					const authUser: AuthUser = {
						id,
						email,
						name: 'User',
						role,
						token: accessToken,
					};
					return authUser;
				}),
				tap((authUser) => this.setUser(authUser))
			);
	}

	logout(): void {
		this.currentUser.set(null);
		localStorage.removeItem(STORAGE_KEY);
		this.router.navigate(['/auth/login']);
	}

	isLoggedIn(): boolean {
		return !!this.currentUser();
	}

	hasRole(roles: UserRole[]): boolean {
		const u = this.currentUser();
		return !!u && roles.includes(u.role);
	}

	private setUser(user: AuthUser): void {
		this.currentUser.set(user);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	}

	private readStoredUser(): AuthUser | null {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? (JSON.parse(raw) as AuthUser) : null;
		} catch {
			return null;
		}
	}
}


