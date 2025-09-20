import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table untuk autentikasi
export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	hashedPassword: text('hashed_password').notNull(),
	name: text('name').notNull(),
	role: text('role').notNull().default('guru'), // 'admin' atau 'guru'
	nip: text('nip'), // Nomor Induk Pegawai
	subject: text('subject'), // Mata pelajaran yang diajar
	employeeType: text('employee_type').default('Honorer'), // 'PNS', 'PPPK', 'Honorer'
	phone: text('phone'),
	email: text('email'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Sessions table untuk Lucia auth
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull(),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Attendance records
export const attendance = sqliteTable('attendance', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	date: text('date').notNull(), // Format: YYYY-MM-DD
	checkIn: text('check_in'), // Format: HH:MM:SS
	checkOut: text('check_out'), // Format: HH:MM:SS
	status: text('status').notNull().default('hadir'), // 'hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit'
	notes: text('notes'), // Catatan tambahan
	location: text('location'), // Lokasi absen jika menggunakan GPS
	ipAddress: text('ip_address'), // IP address saat absen
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Schedule untuk jadwal kerja guru
export const schedules = sqliteTable('schedules', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	dayOfWeek: integer('day_of_week').notNull(), // 1=Monday, 7=Sunday
	startTime: text('start_time').notNull(), // Format: HH:MM
	endTime: text('end_time').notNull(), // Format: HH:MM
	subject: text('subject'), // Mata pelajaran
	class: text('class'), // Kelas
	room: text('room'), // Ruangan
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Settings untuk konfigurasi aplikasi
export const settings = sqliteTable('settings', {
	id: text('id').primaryKey(),
	key: text('key').notNull().unique(),
	value: text('value').notNull(),
	description: text('description'),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Holidays untuk hari libur
export const holidays = sqliteTable('holidays', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	date: text('date').notNull(), // Format: YYYY-MM-DD
	isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});