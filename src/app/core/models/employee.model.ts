export interface Employee {
	id: number;
	name: string;
	role: string;
	department: string;
	joiningDate: string; // ISO date
	status: 'Active' | 'Inactive' | 'On Leave';
	email: string;
}


