export type UserRole = 'SuperAdmin' | 'HR';

export interface AuthUser {
	id: number;
	email: string;
	name: string;
	role: UserRole;
	token: string;
}


