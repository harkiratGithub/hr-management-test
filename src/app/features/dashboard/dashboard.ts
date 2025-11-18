import { Component, OnInit, AfterViewInit, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { Department } from '../../core/models/department.model';
import { Employee } from '../../core/models/employee.model';
import { JobApplication } from '../../core/models/application.model';
import { DataService } from '../../core/services/data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

const API_BASE = '/api';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
	templateUrl: './dashboard.html',
})
export default class DashboardComponent implements OnInit, AfterViewInit {
	private readonly data = inject(DataService);

	@ViewChild('deptChart', { static: false }) deptChartRef?: ElementRef<HTMLCanvasElement>;
	@ViewChild('roleChart', { static: false }) roleChartRef?: ElementRef<HTMLCanvasElement>;

	employees = signal<Employee[]>([]);
	applications = signal<JobApplication[]>([]);
	departments = signal<Department[]>([]);

	// Filters
	selectedDepartment = signal<string>('all');
	selectedRole = signal<string>('all');

	readonly departmentOptions = computed<string[]>(() => [
		'all',
		...this.departments().map((d) => d.name).sort(),
	]);
	readonly roleOptions = computed<string[]>(() => {
		const roles = new Set(this.employees().map((e) => e.role));
		return ['all', ...Array.from(roles).sort()];
	});

	private readonly filteredEmployees = computed<Employee[]>(() => {
		const dept = this.selectedDepartment();
		const role = this.selectedRole();
		return this.employees().filter(
			(e) => (dept === 'all' || e.department === dept) && (role === 'all' || e.role === role)
		);
	});
	private readonly filteredApplications = computed<JobApplication[]>(() => {
		const role = this.selectedRole();
		return this.applications().filter((a) => role === 'all' || a.role === role);
	});

	totals = computed(() => ({
		employees: this.filteredEmployees().length,
		applicants: this.filteredApplications().length,
		departments: new Set(this.filteredEmployees().map((e) => e.department)).size,
		roles: new Set(this.filteredEmployees().map((e) => e.role)).size,
	}));

	private deptChart?: Chart;
	private roleChart?: Chart;
	private viewReady = false;

	ngOnInit(): void {
		this.loadData();
	}

	ngAfterViewInit(): void {
		this.viewReady = true;
		// Draw once view is ready with whatever data is loaded
		this.drawDeptBar();
		this.drawRolePie();
	}

	private loadData(): void {
		this.data.getEmployees().subscribe((res) => {
			this.employees.set(res);
			this.drawDeptBar();
			this.drawRolePie();
		});
		this.data.getApplications().subscribe((res) => {
			this.applications.set(res);
			this.drawRolePie();
		});
		this.data.getDepartments().subscribe((res) => {
			this.departments.set(res);
			this.drawDeptBar();
		});
	}

	private drawDeptBar(): void {
		const counts = new Map<string, number>();
		for (const e of this.filteredEmployees()) {
			counts.set(e.department, (counts.get(e.department) ?? 0) + 1);
		}
		const labels = Array.from(counts.keys());
		const data = Array.from(counts.values());
		// Ensure canvas exists (view initialized) before attempting to draw
		if (!this.viewReady && !this.deptChartRef?.nativeElement) return;
		if (this.deptChart) {
			this.deptChart.data.labels = labels;
			this.deptChart.data.datasets[0].data = data;
			this.deptChart.update();
		} else if (this.deptChartRef?.nativeElement) {
			this.deptChart = new Chart(this.deptChartRef.nativeElement, {
				type: 'bar',
				data: {
					labels,
					datasets: [{ data, label: 'Employees', backgroundColor: '#1976d2' }],
				},
				options: { responsive: true, maintainAspectRatio: false },
			});
		}
	}

	private drawRolePie(): void {
		const counts = new Map<string, number>();
		for (const a of this.filteredApplications()) {
			counts.set(a.role, (counts.get(a.role) ?? 0) + 1);
		}
		const labels = Array.from(counts.keys());
		const data = Array.from(counts.values());
		// Ensure canvas exists (view initialized) before attempting to draw
		if (!this.viewReady && !this.roleChartRef?.nativeElement) return;
		if (this.roleChart) {
			this.roleChart.data.labels = labels;
			this.roleChart.data.datasets[0].data = data;
			this.roleChart.update();
		} else if (this.roleChartRef?.nativeElement) {
			this.roleChart = new Chart(this.roleChartRef.nativeElement, {
				type: 'pie',
				data: {
					labels,
					datasets: [{ data }],
				},
				options: { responsive: true, maintainAspectRatio: false },
			});
		}
	}

	// UI handlers
	setDepartment(value: string): void {
		this.selectedDepartment.set(value);
		this.drawDeptBar();
		this.drawRolePie();
	}
	setRole(value: string): void {
		this.selectedRole.set(value);
		this.drawDeptBar();
		this.drawRolePie();
	}
	resetFilters(): void {
		this.selectedDepartment.set('all');
		this.selectedRole.set('all');
		this.drawDeptBar();
		this.drawRolePie();
	}
}
