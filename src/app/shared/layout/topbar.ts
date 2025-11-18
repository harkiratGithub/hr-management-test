import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
	selector: 'app-topbar',
	standalone: true,
	imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
	template: `
		<mat-toolbar color="primary" class="justify-between">
			<div class="flex items-center gap-4">
				<a class="font-semibold text-white no-underline" routerLink="/">Employee & Recruitment</a>
				<a mat-button routerLink="/dashboard">Dashboard</a>
				<a mat-button routerLink="/employees">Employees</a>
				<a mat-button routerLink="/applications">Applications</a>
				<a *ngIf="auth.currentUser()?.role === 'SuperAdmin'" mat-button routerLink="/departments"
					>Departments</a
				>
				<a mat-button routerLink="/documents">Documents</a>
			</div>
			<div class="flex items-center gap-2">
				<button *ngIf="auth.isLoggedIn()" mat-button (click)="auth.logout()">Logout</button>
				<a *ngIf="!auth.isLoggedIn()" mat-button routerLink="/auth/login">Login</a>
			</div>
		</mat-toolbar>
	`,
})
export class TopbarComponent {
	readonly auth = inject(AuthService);
}


