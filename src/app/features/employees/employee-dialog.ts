import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Department } from '../../core/models/department.model';
import { Employee } from '../../core/models/employee.model';
import { DataService } from '../../core/services/data.service';

const API_BASE = 'http://localhost:3000';

@Component({
	selector: 'app-employee-dialog',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatIconModule,
	],
	templateUrl: './employee-dialog.html',
})
export class EmployeeDialogComponent implements OnInit {
	private readonly http = inject(HttpClient);
	private readonly store = inject(DataService);
	private readonly fb = inject(FormBuilder);

	departments = signal<Department[]>([]);

	roles: string[] = [
		'Frontend Developer',
		'Backend Developer',
		'Tester',
		'Business Analyst',
		'DevOps Engineer',
	];

	form = this.fb.group({
		id: [''],
		name: ['', Validators.required],
		email: ['', [Validators.required, Validators.email]],
		role: ['', Validators.required],
		department: ['', Validators.required],
		status: ['Active', Validators.required],
		joiningDate: [null as unknown as Date | null, Validators.required],
	});

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { employee?: Employee },
		private dialogRef: MatDialogRef<EmployeeDialogComponent, boolean>
	) {}

	ngOnInit(): void {
		this.store.getDepartments().subscribe((d) => this.departments.set(d));
		if (this.data?.employee) {
			const { joiningDate, ...rest } = this.data.employee;
			const jd = joiningDate ? new Date(joiningDate) : null;
			this.form.patchValue({
				...rest,
				// Ensure the reactive form receives a string id
				id: String((rest as any).id ?? ''),
				joiningDate: jd,
			});
		}
	}

	save(): void {
		if (this.form.invalid) return;
		const raw = this.form.getRawValue();
		const formatted: Employee = {
			...(raw as any),
			joiningDate: this.formatAsYyyyMmDd(raw.joiningDate as unknown as Date),
		};
		this.store.saveEmployee(formatted).subscribe(() => this.dialogRef.close(true));
	}

	private formatAsYyyyMmDd(date: Date | null): string {
		if (!date) return '';
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}
}


