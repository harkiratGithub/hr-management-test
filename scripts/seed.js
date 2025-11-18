/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function randomItem(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function randomDate(fromYearsAgo = 5) {
	const now = new Date();
	const past = new Date(now);
	past.setFullYear(now.getFullYear() - fromYearsAgo);
	const time = past.getTime() + Math.random() * (now.getTime() - past.getTime());
	return new Date(time).toISOString().split('T')[0];
}

function pad(n) {
	return n.toString().padStart(2, '0');
}

function makeEmail(first, last, i) {
	return `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
}

const firstNames = [
	'Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Mohammad','Krishna','Ishaan',
	'Advika','Aadhya','Anaya','Diya','Myra','Sara','Ira','Aaradhya','Saanvi','Riya'
];
const lastNames = [
	'Sharma','Verma','Gupta','Singh','Patel','Khan','Kumar','Joshi','Mehta','Kapoor',
	'Aggarwal','Bansal','Chopra','Desai','Dutta','Goyal','Iyer','Jain','Malhotra','Reddy'
];

const roles = [
	'Frontend Developer','Backend Developer','Tester','Business Analyst','DevOps Engineer',
	'Data Analyst','UI/UX Designer','Product Manager','Support Engineer','Sales Executive'
];
const departments = [
	'Engineering','QA','HR','Sales','Marketing','Finance','Operations','Support','Data','DevOps','Product','Design'
];
const employeeStatuses = ['Active','Inactive','On Leave'];
const appStatuses = ['New','Shortlisted','Rejected'];
const docCategories = ['Resume','Offer Letter','ID Proof','Payslip','NDA'];

function generateEmployees(count = 150) {
	const list = [];
	for (let i = 1; i <= count; i++) {
		const first = randomItem(firstNames);
		const last = randomItem(lastNames);
		list.push({
			id: i,
			name: `${first} ${last}`,
			role: randomItem(roles),
			department: randomItem(departments),
			joiningDate: randomDate(5),
			status: randomItem(employeeStatuses),
			email: makeEmail(first, last, i)
		});
	}
	return list;
}

function generateApplications(count = 120) {
	const list = [];
	for (let i = 1; i <= count; i++) {
		const first = randomItem(firstNames);
		const last = randomItem(lastNames);
		const exp = Math.floor(Math.random() * 10);
		list.push({
			id: i,
			name: `${first} ${last}`,
			role: randomItem(roles),
			experienceYears: exp,
			status: randomItem(appStatuses),
			email: makeEmail(first, last, i + 300),
			contact: `+91-${pad(Math.floor(Math.random() * 90) + 10)}${Math.floor(100000000 + Math.random() * 900000000)}`,
			resumeUrl: `https://example.com/resume/${first.toLowerCase()}-${last.toLowerCase()}-${i}.pdf`
		});
	}
	return list;
}

function generateDepartments() {
	return departments.map((name, idx) => ({ id: idx + 1, name }));
}

function generateDocuments(employees, count = 80) {
	const list = [];
	for (let i = 1; i <= count; i++) {
		const e = randomItem(employees);
		const fileName = `${e.name.toLowerCase().replace(/\\s+/g, '-')}-${i}.pdf`;
		list.push({
			id: i,
			employeeId: e.id,
			employeeName: e.name,
			category: randomItem(docCategories),
			fileName,
			fileUrl: `https://example.com/docs/${fileName}`,
			uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString()
		});
	}
	return list;
}

function main() {
	const employees = generateEmployees(160);
	const applications = generateApplications(130);
	const depts = generateDepartments();
	const documents = generateDocuments(employees, 100);

	const db = {
		employees,
		applications,
		departments: depts,
		documents,
		users: [
			{ id: 1, email: 'owner@company.com', password: 'owner123', role: 'SuperAdmin', name: 'Company Owner' },
			{ id: 2, email: 'hr@company.com', password: 'hr123', role: 'HR', name: 'HR User' }
		],
		roles: ['SuperAdmin','HR']
	};

	const file = path.resolve(process.cwd(), 'db.json');
	fs.writeFileSync(file, JSON.stringify(db, null, 2), 'utf8');
	console.log(`Seeded ${employees.length} employees, ${applications.length} applications, ${depts.length} departments, ${documents.length} documents → ${file}`);
}

main();


