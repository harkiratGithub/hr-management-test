import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatProgressSpinnerModule,
	],
	templateUrl: './login.html',
	styleUrl: './login.scss',
})
export default class LoginComponent {
	private readonly fb = inject(FormBuilder);
	private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

	loading = signal(false);
	error = signal<string | null>(null);

	form = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', Validators.required],
		role: ['HR', Validators.required],
	});

	onSubmit(): void {
		if (this.form.invalid) return;
		this.loading.set(true);
		this.error.set(null);
		const { email, password, role } = this.form.getRawValue();
		this.auth
			.login(String(email), String(password))
			.subscribe({
				next: (user) => {
					// Enforce selected role for demo if different
					if (role && user.role !== role) {
						// override only for demo purposes
						const overridden = { ...user, role: role as any };
						(localStorage as any).setItem('erd_auth_user', JSON.stringify(overridden));
						this.auth.currentUser.set(overridden);
					}
					this.router.navigate(['/dashboard']);
				},
				error: (err) => {
					this.error.set(err?.message ?? 'Login failed');
					this.loading.set(false);
				},
				complete: () => this.loading.set(false),
			});
	}
}


