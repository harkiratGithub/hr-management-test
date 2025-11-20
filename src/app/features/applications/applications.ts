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

	// Pagination
	page = 1;
	pageSize = 10;

	ngOnInit(): void {
		this.load();
	}

	filtered(): JobApplication[] {
		const list = this.applications()
			.filter((a) => (this.searchText ? a.name.toLowerCase().includes(this.searchText.toLowerCase()) : true))
			.filter((a) => (this.filterRole ? a.role === this.filterRole : true))
			.filter((a) => (this.filterStatus ? a.status === this.filterStatus : true));
		const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
		if (this.page > totalPages) this.page = totalPages;
		return list;
	}

	updateStatus(a: JobApplication, status: ApplicationStatus): void {
		this.data.updateApplicationStatus(a.id, status).subscribe(() => this.load());
	}

	paged(): JobApplication[] {
		const list = this.filtered();
		const start = (this.page - 1) * this.pageSize;
		return list.slice(start, start + this.pageSize);
	}

	totalPages(): number {
		return Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
	}

	nextPage(): void {
		if (this.page < this.totalPages()) this.page++;
	}

	prevPage(): void {
		if (this.page > 1) this.page--;
	}

	private load(): void {
		this.data.getApplications().subscribe((res) => this.applications.set(res));
	}
}


