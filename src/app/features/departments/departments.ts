import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Department } from '../../core/models/department.model';
import { Employee } from '../../core/models/employee.model';
import { DataService } from '../../core/services/data.service';

const API_BASE = '/api';

@Component({
	selector: 'app-departments',
	standalone: true,
	imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
	templateUrl: './departments.html',
})
export default class DepartmentsComponent implements OnInit {
	private readonly http = inject(HttpClient);
	private readonly data = inject(DataService);
	departments = signal<Department[]>([]);
	employees = signal<Employee[]>([]);
	newDeptName = '';

	ngOnInit(): void {
		this.load();
	}

	countEmployees(name: string): number {
		return this.employees().filter((e) => e.department === name).length;
	}

	add(): void {
		const name = this.newDeptName.trim();
		if (!name) return;
		this.data.saveDepartment({ id: 0, name }).subscribe(() => {
			this.newDeptName = '';
			this.load();
		});
	}

	save(d: Department): void {
		this.data.saveDepartment(d).subscribe(() => this.load());
	}

	remove(d: Department): void {
		if (!confirm(`Delete department ${d.name}?`)) return;
		this.data.deleteDepartment(d.id).subscribe(() => this.load());
	}

	private load(): void {
		this.data.getDepartments().subscribe((res) => this.departments.set(res));
		this.data.getEmployees().subscribe((res) => this.employees.set(res));
	}
}


