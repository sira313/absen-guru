#!/usr/bin/env node
import { dbHelpers } from '../src/lib/server/db.js';

// Simple hash function as alternative to bcrypt
async function simpleHash(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + 'salt123'); // Simple salt
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

console.log('🌱 Seeding database...');
console.log('');
console.log('📋 Default credentials yang akan dibuat:');
console.log('   👤 Admin: admin / admin123');
console.log('   👨‍🏫 Guru: guru1, guru2, guru3 / guru123');
console.log('');

try {
	// Create admin user dengan password default
	const defaultAdminPassword = 'admin123';
	const hashedPassword = await simpleHash(defaultAdminPassword);
	
	await dbHelpers.createUser({
		username: 'admin',
		hashedPassword,
		name: 'Administrator',
		role: 'admin',
		nip: 'ADM001',
		subject: null,
		employeeType: 'PNS',
		position: 'Administrator',
		phone: '08123456789',
		email: 'admin@sekolah.edu',
		isActive: true
	});

	// Create sample teacher users
	const teachers = [
		{
			username: 'guru1',
			name: 'Budi Santoso',
			nip: 'GR001',
			subject: 'Matematika',
			employeeType: 'PNS',
			position: 'Guru Kelas',
			phone: '08111111111',
			email: 'budi@sekolah.edu'
		},
		{
			username: 'guru2',
			name: 'Siti Aminah',
			nip: 'GR002',
			subject: 'Bahasa Indonesia',
			employeeType: 'PPPK',
			position: 'Guru Kelas',
			phone: '08222222222',
			email: 'siti@sekolah.edu'
		},
		{
			username: 'guru3',
			name: 'Ahmad Rahman',
			nip: 'GR003',
			subject: 'IPA',
			employeeType: 'Honorer',
			position: 'Guru Penjaskes',
			phone: '08333333333',
			email: 'ahmad@sekolah.edu'
		}
	];

	const teacherPassword = await simpleHash('guru123');
	
	for (const teacher of teachers) {
		await dbHelpers.createUser({
			username: teacher.username,
			hashedPassword: teacherPassword,
			name: teacher.name,
			role: 'guru',
			nip: teacher.nip,
			subject: teacher.subject,
			employeeType: teacher.employeeType,
			position: teacher.position,
			phone: teacher.phone,
			email: teacher.email,
			isActive: true
		});
	}

	// Create sample settings
	await dbHelpers.setSetting('school_name', 'SMK Negeri 1 Contoh', 'Nama sekolah');
	await dbHelpers.setSetting('work_start_time', '08:00:00', 'Jam mulai kerja');
	await dbHelpers.setSetting('work_end_time', '16:00:00', 'Jam selesai kerja');
	await dbHelpers.setSetting('late_threshold', '08:00:00', 'Batas waktu terlambat');
	await dbHelpers.setSetting('allow_early_checkin', '07:00:00', 'Waktu paling awal check-in');
	await dbHelpers.setSetting('allow_late_checkout', '20:00:00', 'Waktu paling akhir check-out');

	// Create sample holidays
	const currentYear = new Date().getFullYear();
	const holidays = [
		{
			name: 'Tahun Baru',
			date: `${currentYear}-01-01`,
			isRecurring: true
		},
		{
			name: 'Hari Kemerdekaan',
			date: `${currentYear}-08-17`,
			isRecurring: true
		},
		{
			name: 'Hari Natal',
			date: `${currentYear}-12-25`,
			isRecurring: true
		}
	];

	for (const holiday of holidays) {
		await dbHelpers.createHoliday(holiday);
	}

	console.log('✅ Database seeded successfully!');
	console.log('\n📋 Default accounts created:');
	console.log('👑 Admin: username="admin", password="admin123"');
	console.log('👨‍🏫 Guru: username="guru1/guru2/guru3", password="guru123"');
	console.log('\n🚀 You can now start the application with: pnpm dev');
	
	process.exit(0);
	
} catch (error) {
	console.error('❌ Error seeding database:', error);
	process.exit(1);
}