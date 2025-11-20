import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Employee } from '../../core/models/employee.model';
import { Department } from '../../core/models/department.model';
import { MatDialogModule } from '@angular/material/dialog';
import { DynamicDialogService } from '../../shared/dynamic/dynamic-dialog.service';
import { EmployeeDialogComponent } from './employee-dialog';
import { DataService } from '../../core/services/data.service';

const API_BASE = '/api';

@Component({
	selector: 'app-employees',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatDialogModule,
	],
	templateUrl: './employees.html',
})
export default class EmployeesComponent implements OnInit {
	private readonly http = inject(HttpClient);
	private readonly data = inject(DataService);
	private readonly dialog = inject(DynamicDialogService);

	employees = signal<Employee[]>([]);
	departments = signal<Department[]>([]);

	roles: string[] = [
		'Frontend Developer',
		'Backend Developer',
		'Tester',
		'Business Analyst',
		'DevOps Engineer',
	];

	searchText = '';
	filterDept = '';
	filterRole = '';

	// Pagination
	page = 1;
	pageSize = 10;

	ngOnInit(): void {
		this.load();
	}

	filteredEmployees(): Employee[] {
		const list = this.employees()
			.filter((e) => (this.searchText ? e.name.toLowerCase().includes(this.searchText.toLowerCase()) : true))
			.filter((e) => (this.filterDept ? e.department === this.filterDept : true))
			.filter((e) => (this.filterRole ? e.role === this.filterRole : true));
		// Ensure current page is valid when filters change
		const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
		if (this.page > totalPages) this.page = totalPages;
		return list;
	}

	paginatedEmployees(): Employee[] {
		const list = this.filteredEmployees();
		const start = (this.page - 1) * this.pageSize;
		return list.slice(start, start + this.pageSize);
	}

	totalPages(): number {
		return Math.max(1, Math.ceil(this.filteredEmployees().length / this.pageSize));
	}

	nextPage(): void {
		if (this.page < this.totalPages()) this.page++;
	}

	prevPage(): void {
		if (this.page > 1) this.page--;
	}

	openCreate(): void {
		this.dialog
			.open(EmployeeDialogComponent, { data: {} })
			.afterClosed()
			.subscribe((changed) => changed && (this.page = 1, this.load()));
	}

	openEdit(_e: Employee): void {
		this.dialog
			.open(EmployeeDialogComponent, { data: { employee: _e } })
			.afterClosed()
			.subscribe((changed) => changed && this.load());
	}

	remove(e: Employee): void {
		if (!confirm(`Delete ${e.name}?`)) return;
		this.data.deleteEmployee(e.id).subscribe(() => this.load());
	}

	statusClass(status: Employee['status']): string {
		switch (status) {
			case 'Active':
				return 'bg-green-100 text-green-700';
			case 'On Leave':
				return 'bg-amber-100 text-amber-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	private load(): void {
		this.data.getEmployees().subscribe((res) => this.employees.set(res));
		this.data.getDepartments().subscribe((res) => this.departments.set(res));
	}
}


