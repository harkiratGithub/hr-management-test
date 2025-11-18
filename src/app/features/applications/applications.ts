import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { JobApplication, ApplicationStatus } from '../../core/models/application.model';
import { DataService } from '../../core/services/data.service';

const API_BASE = '/api';

@Component({
	selector: 'app-applications',
	standalone: true,
	imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
	templateUrl: './applications.html',
})
export default class ApplicationsComponent implements OnInit {
	private readonly http = inject(HttpClient);
	private readonly data = inject(DataService);

	applications = signal<JobApplication[]>([]);

	roles: JobApplication['role'][] = ['Frontend Developer', 'Backend Developer', 'Tester', 'Business Analyst'];
	statuses: ApplicationStatus[] = ['New', 'Shortlisted', 'Rejected'];

	filterRole = '';
	filterStatus = '';
	searchText = '';

	ngOnInit(): void {
		this.load();
	}

	filtered(): JobApplication[] {
		return this.applications()
			.filter((a) => (this.searchText ? a.name.toLowerCase().includes(this.searchText.toLowerCase()) : true))
			.filter((a) => (this.filterRole ? a.role === this.filterRole : true))
			.filter((a) => (this.filterStatus ? a.status === this.filterStatus : true));
	}

	updateStatus(a: JobApplication, status: ApplicationStatus): void {
		this.data.updateApplicationStatus(a.id, status).subscribe(() => this.load());
	}

	private load(): void {
		this.data.getApplications().subscribe((res) => this.applications.set(res));
	}
}


