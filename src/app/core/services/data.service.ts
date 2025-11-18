import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, catchError } from 'rxjs';
import { Employee } from '../models/employee.model';
import { Department } from '../models/department.model';
import { JobApplication, ApplicationStatus } from '../models/application.model';
import { DocumentRecord } from '../models/document.model';

type RootDb = {
	employees: Employee[];
	applications: JobApplication[];
	departments: Department[];
	documents: DocumentRecord[];
};

const LS_KEYS = {
	employees: 'erd_employees',
	applications: 'erd_applications',
	departments: 'erd_departments',
	documents: 'erd_documents',
} as const;

@Injectable({ providedIn: 'root' })
export class DataService {
	private readonly http = inject(HttpClient);
	private seeded = false;

	private ensureSeed(): Observable<void> {
		if (this.seeded) return of(void 0);
		const parse = <T>(k: string): T | null => {
			try {
				const raw = localStorage.getItem(k);
				return raw ? (JSON.parse(raw) as T) : null;
			} catch {
				return null;
			}
		};
		const existingEmployees = parse<Employee[]>(LS_KEYS.employees);
		const existingApplications = parse<JobApplication[]>(LS_KEYS.applications);
		const existingDepartments = parse<Department[]>(LS_KEYS.departments);
		const existingDocuments = parse<DocumentRecord[]>(LS_KEYS.documents);
		const hasValid =
			!!existingEmployees?.length &&
			!!existingApplications?.length &&
			!!existingDepartments?.length &&
			!!existingDocuments?.length;
		if (hasValid) {
			this.seeded = true;
			return of(void 0);
		}
		// Try relative assets first (works best in dev and most hosts), then absolute assets, then root.
		return this.http.get<RootDb>('assets/db.json').pipe(
			catchError(() => this.http.get<RootDb>('/assets/db.json')),
			catchError(() => this.http.get<RootDb>('/db.json')),
			tap((db) => {
				const emps = db.employees ?? [];
				const apps = db.applications ?? [];
				const depts = db.departments ?? [];
				const docs = db.documents ?? [];
				localStorage.setItem(LS_KEYS.employees, JSON.stringify(emps));
				localStorage.setItem(LS_KEYS.applications, JSON.stringify(apps));
				localStorage.setItem(LS_KEYS.departments, JSON.stringify(depts));
				localStorage.setItem(LS_KEYS.documents, JSON.stringify(docs));
				this.seeded = true;
			}),
			map(() => void 0)
		);
	}

	// Employees
	getEmployees(): Observable<Employee[]> {
		return this.ensureSeed().pipe(
			map(() => JSON.parse(localStorage.getItem(LS_KEYS.employees) ?? '[]') as Employee[])
		);
	}
	saveEmployee(employee: Employee): Observable<void> {
		const list = JSON.parse(localStorage.getItem(LS_KEYS.employees) ?? '[]') as Employee[];
		if (employee.id) {
			const idx = list.findIndex((e) => e.id === employee.id);
			if (idx >= 0) list[idx] = employee;
		} else {
			const nextId = (list.at(-1)?.id ?? 0) + 1;
			list.push({ ...employee, id: nextId });
		}
		localStorage.setItem(LS_KEYS.employees, JSON.stringify(list));
		return of(void 0);
	}
	deleteEmployee(id: number): Observable<void> {
		const list = (JSON.parse(localStorage.getItem(LS_KEYS.employees) ?? '[]') as Employee[]).filter(
			(e) => e.id !== id
		);
		localStorage.setItem(LS_KEYS.employees, JSON.stringify(list));
		return of(void 0);
	}

	// Applications
	getApplications(): Observable<JobApplication[]> {
		return this.ensureSeed().pipe(
			map(() => JSON.parse(localStorage.getItem(LS_KEYS.applications) ?? '[]') as JobApplication[])
		);
	}
	updateApplicationStatus(id: number, status: ApplicationStatus): Observable<void> {
		const list = JSON.parse(localStorage.getItem(LS_KEYS.applications) ?? '[]') as JobApplication[];
		const idx = list.findIndex((a) => a.id === id);
		if (idx >= 0) list[idx] = { ...list[idx], status };
		localStorage.setItem(LS_KEYS.applications, JSON.stringify(list));
		return of(void 0);
	}

	// Departments
	getDepartments(): Observable<Department[]> {
		return this.ensureSeed().pipe(
			map(() => JSON.parse(localStorage.getItem(LS_KEYS.departments) ?? '[]') as Department[])
		);
	}
	saveDepartment(dept: Department): Observable<void> {
		const list = JSON.parse(localStorage.getItem(LS_KEYS.departments) ?? '[]') as Department[];
		if (dept.id) {
			const idx = list.findIndex((d) => d.id === dept.id);
			if (idx >= 0) list[idx] = dept;
		} else {
			const nextId = (list.at(-1)?.id ?? 0) + 1;
			list.push({ ...dept, id: nextId });
		}
		localStorage.setItem(LS_KEYS.departments, JSON.stringify(list));
		return of(void 0);
	}
	deleteDepartment(id: number): Observable<void> {
		const list = (JSON.parse(localStorage.getItem(LS_KEYS.departments) ?? '[]') as Department[]).filter(
			(d) => d.id !== id
		);
		localStorage.setItem(LS_KEYS.departments, JSON.stringify(list));
		return of(void 0);
	}

	// Documents
	getDocuments(): Observable<DocumentRecord[]> {
		return this.ensureSeed().pipe(
			map(() => JSON.parse(localStorage.getItem(LS_KEYS.documents) ?? '[]') as DocumentRecord[])
		);
	}
	addDocument(doc: Omit<DocumentRecord, 'id'>): Observable<void> {
		const list = JSON.parse(localStorage.getItem(LS_KEYS.documents) ?? '[]') as DocumentRecord[];
		const nextId = (list.at(-1)?.id ?? 0) + 1;
		list.push({ ...doc, id: nextId });
		localStorage.setItem(LS_KEYS.documents, JSON.stringify(list));
		return of(void 0);
	}
	deleteDocument(id: number): Observable<void> {
		const list = (JSON.parse(localStorage.getItem(LS_KEYS.documents) ?? '[]') as DocumentRecord[]).filter(
			(d) => d.id !== id
		);
		localStorage.setItem(LS_KEYS.documents, JSON.stringify(list));
		return of(void 0);
	}
}


