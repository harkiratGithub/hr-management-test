export interface DocumentRecord {
	id: number;
	employeeId: number;
	employeeName: string;
	category: string; // e.g., Resume, Offer Letter, ID Proof
	fileName: string;
	fileUrl: string;
	uploadedAt: string; // ISO
}


