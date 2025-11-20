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
	
	const API_BASE = '/api';

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
		// Request a high limit so dashboard aggregates include all records
		return this.http.get<any>(`${API_BASE}/employees?limit=10000`).pipe(
			map((res) => (Array.isArray(res) ? res : res?.data ?? [])),
			map((list: any[]) =>
				(list ?? []).map((e: any, idx: number) => ({
					id: String(e?._id ?? e?.id ?? idx + 1),
					name: String(e?.name ?? ''),
					role: String(e?.role ?? ''),
					department: String(e?.department ?? ''),
					joiningDate: String(e?.joiningDate ?? e?.joining_date ?? new Date().toISOString()),
					status: (String(e?.status ?? 'active').toLowerCase() === 'on-leave'
						? 'On Leave'
						: String(e?.status ?? 'active').toLowerCase() === 'inactive'
						? 'Inactive'
						: 'Active') as Employee['status'],
					email: String(e?.email ?? ''),
				}))
			)
		);
	}
	saveEmployee(employee: Employee): Observable<void> {
		const hasId =
			typeof employee.id === 'string' ? employee.id.trim().length > 0 : !!employee.id;
		// Map UI status to backend enum
		const statusApi =
			employee.status === 'On Leave' ? 'on-leave' : employee.status === 'Inactive' ? 'inactive' : 'active';
		const payload = { ...employee, id: undefined, status: statusApi };
		const req$ = hasId
			? this.http.put(`${API_BASE}/employees/${employee.id}`, payload)
			: this.http.post(`${API_BASE}/employees`, payload);
		return req$.pipe(map(() => void 0));
	}
	deleteEmployee(id: string | number): Observable<void> {
		return this.http.delete(`${API_BASE}/employees/${id}`).pipe(map(() => void 0));
	}

	// Applications
	getApplications(): Observable<JobApplication[]> {
		// Request a high limit so dashboard aggregates include all records
		return this.http.get<any>(`${API_BASE}/applicants?limit=10000`).pipe(
			map((res) => (Array.isArray(res) ? res : res?.data ?? [])),
			map((list: any[]): JobApplication[] =>
				(list ?? []).map((a: any, idx: number) => {
					// Normalize role to match JobApplication['role'] union
					const rawRole = String(a?.role ?? a?.appliedRole ?? '').toLowerCase();
					const role: JobApplication['role'] =
						rawRole.includes('front')
							? 'Frontend Developer'
							: rawRole.includes('back')
							? 'Backend Developer'
							: rawRole.includes('test') || rawRole.includes('qa')
							? 'Tester'
							: 'Business Analyst';

					// Normalize status to match ApplicationStatus union
					const rawStatus = String(a?.status ?? '').toLowerCase();
					const status: ApplicationStatus =
						rawStatus === 'shortlisted'
							? 'Shortlisted'
							: rawStatus === 'rejected'
							? 'Rejected'
							: 'New';

					return {
						id: Number(a?.id ?? a?._id ?? idx + 1),
						name: String(a?.name ?? ''),
						role,
						experienceYears: Number(a?.experienceYears ?? a?.experience_years ?? 0),
						status,
						email: String(a?.email ?? ''),
						contact: String(a?.contact ?? ''),
						resumeUrl: String(a?.resumeUrl ?? a?.resume_url ?? ''),
					} satisfies JobApplication;
				})
			)
		);
	}
	updateApplicationStatus(id: number, status: ApplicationStatus): Observable<void> {
		return this.http.put(`${API_BASE}/applicants/${id}/status`, { status }).pipe(map(() => void 0));
	}

	// Departments
	getDepartments(): Observable<Department[]> {
		return this.http.get<any[]>(`${API_BASE}/departments`).pipe(
			map((list) =>
				(list ?? []).map((d: any, idx: number) => ({
					id: Number(d?.id ?? d?._id ?? idx + 1),
					name: String(d?.name ?? ''),
				}))
			)
		);
	}
	saveDepartment(dept: Department): Observable<void> {
		const hasId = !!dept.id;
		const payload = { ...dept, id: undefined };
		const req$ = hasId
			? this.http.put(`${API_BASE}/departments/${dept.id}`, payload)
			: this.http.post(`${API_BASE}/departments`, payload);
		return req$.pipe(map(() => void 0));
	}
	deleteDepartment(id: number): Observable<void> {
		return this.http.delete(`${API_BASE}/departments/${id}`).pipe(map(() => void 0));
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


