import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
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

	selectedEmployeeId: string | null = null;
	category = '';
	fileToUpload: File | null = null;

	// Pagination
	page = 1;
	pageSize = 10;

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
		const employee = this.employees().find((e) => String(e.id) === String(this.selectedEmployeeId))!;
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
			// Clear the file input control UI label ("No file chosen")
			if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
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

	pagedDocuments(): DocumentRecord[] {
		const list = this.documents();
		const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
		if (this.page > totalPages) this.page = totalPages;
		const start = (this.page - 1) * this.pageSize;
		return list.slice(start, start + this.pageSize);
	}

	totalPages(): number {
		return Math.max(1, Math.ceil(this.documents().length / this.pageSize));
	}

	nextPage(): void {
		if (this.page < this.totalPages()) this.page++;
	}

	prevPage(): void {
		if (this.page > 1) this.page--;
	}

	openPreview(d: DocumentRecord): void {
		try {
			const [meta, base64] = d.fileUrl.split(',');
			const mimeMatch = /data:(.*?);base64/.exec(meta);
			const mime = mimeMatch?.[1] ?? 'application/octet-stream';
			const byteChars = atob(base64);
			const byteNumbers = new Array(byteChars.length);
			for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
			const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
			const url = URL.createObjectURL(blob);
			window.open(url, '_blank', 'noopener');
			// Caller tab may navigate away; revoke shortly after
			setTimeout(() => URL.revokeObjectURL(url), 30_000);
		} catch {
			// fallback: navigate current tab
			window.location.href = d.fileUrl;
		}
	}

	private load(): void {
		this.data.getEmployees().subscribe((res) => {
			this.employees.set(res);
			// Do not auto-select any employee; user must choose explicitly
		});
		this.data.getDocuments().subscribe((res) => this.documents.set(res));
	}

	// Avoid Angular stripping data: URLs in href
	safeUrl(url: string): SafeUrl {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

	@ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

	// UI helpers
	canUpload(): boolean {
		return !!this.fileToUpload && !!this.selectedEmployeeId;
	}
}
