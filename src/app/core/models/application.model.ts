export type ApplicationStatus = 'New' | 'Shortlisted' | 'Rejected';

export interface JobApplication {
	id: number;
	name: string;
	role: 'Frontend Developer' | 'Backend Developer' | 'Tester' | 'Business Analyst';
	experienceYears: number;
	status: ApplicationStatus;
	email: string;
	contact: string;
	resumeUrl: string;
}


