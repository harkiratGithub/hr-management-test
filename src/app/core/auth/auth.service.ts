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
		// Prefer static JSON asset; fall back to in-code users if asset missing
		return this.http.get<any[]>('/assets/users.json').pipe(
			catchError(() => of(STATIC_USERS)),
			map((users) => {
				const match = users.find((u) => u.email === email && u.password === password);
				if (!match) {
					throw new Error('Invalid credentials');
				}
				const user = match as { id: number; email: string; role: UserRole; name: string };
				const token = btoa(
					JSON.stringify({ sub: user.id, email: user.email, role: user.role, iat: Date.now() })
				);
				return { ...user, token } satisfies AuthUser;
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


