import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Employee } from '../../core/models/employee.model';
import { DocumentRecord } from '../../core/models/document.model';
import { DataService } from '../../core/services/data.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const API_BASE = '/api';

@Component({
	selector: 'app-documents',
	standalone: true,
	imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
	templateUrl: './documents.html',
})
export default class DocumentsComponent implements OnInit {
	private readonly http = inject(HttpClient);
	private readonly data = inject(DataService);
	private readonly sanitizer = inject(DomSanitizer);

	employees = signal<Employee[]>([]);
	documents = signal<DocumentRecord[]>([]);

	selectedEmployeeId: number | null = null;
	category = '';
	fileToUpload: File | null = null;

	readonly categories: string[] = ['Resume', 'Offer Letter', 'ID Proof', 'Payslip', 'Other'];

	ngOnInit(): void {
		this.load();
	}

	onFile(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.fileToUpload = input.files?.[0] ?? null;
	}

	async upload(event: Event): Promise<void> {
		event.preventDefault();
		if (!this.fileToUpload || !this.selectedEmployeeId) return;
		const employee = this.employees().find((e) => e.id === this.selectedEmployeeId)!;
		// Persist a Data URL so preview/download works across reloads and deployments
		const fileUrl = await this.readFileAsDataUrl(this.fileToUpload);
		const payload: Omit<DocumentRecord, 'id'> = {
			employeeId: employee.id,
			employeeName: employee.name,
			category: this.category || 'Other',
			fileName: this.fileToUpload.name,
			fileUrl,
			uploadedAt: new Date().toISOString(),
		};
		this.data.addDocument(payload).subscribe(() => {
			this.fileToUpload = null;
			this.category = '';
			this.selectedEmployeeId = null;
			this.load();
		});
	}

	private readFileAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = () => reject(new Error('Failed to read file'));
			reader.onload = () => resolve(String(reader.result));
			reader.readAsDataURL(file);
		});
	}

	remove(d: DocumentRecord): void {
		if (!confirm(`Delete ${d.fileName}?`)) return;
		this.data.deleteDocument(d.id).subscribe(() => this.load());
	}

	private load(): void {
		this.data.getEmployees().subscribe((res) => this.employees.set(res));
		this.data.getDocuments().subscribe((res) => this.documents.set(res));
	}

	// Avoid Angular stripping data: URLs in href
	safeUrl(url: string): SafeUrl {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}


