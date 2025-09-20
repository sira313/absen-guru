import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users, sessions, attendance, schedules, settings, holidays } from './schema.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { generateId } from 'lucia';

// Create database client
const client = createClient({
	url: 'file:./absen.db'
});

export const db = drizzle(client);

// Database helper functions
export const dbHelpers = {
	// User operations
	async createUser(userData) {
		const userId = generateId(15);
		const user = {
			id: userId,
			...userData,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		await db.insert(users).values(user);
		return user;
	},

	async getUserById(id) {
		const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
		return result[0] || null;
	},

	async getUserByUsername(username) {
		const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
		return result[0] || null;
	},

	async getAllUsers() {
		return await db.select().from(users).orderBy(users.name);
	},

	async updateUser(id, userData) {
		const updateData = {
			...userData,
			updatedAt: new Date().toISOString()
		};
		
		await db.update(users).set(updateData).where(eq(users.id, id));
	},

	async deleteUser(id) {
		await db.delete(users).where(eq(users.id, id));
	},

	// Session operations
	async createSession(sessionData) {
		await db.insert(sessions).values(sessionData);
	},

	async getSessionById(id) {
		const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
		return result[0] || null;
	},

	async deleteSession(id) {
		await db.delete(sessions).where(eq(sessions.id, id));
	},

	async deleteExpiredSessions() {
		const now = Date.now();
		await db.delete(sessions).where(lte(sessions.expiresAt, now));
	},

	// Attendance operations
	async createAttendance(attendanceData) {
		const attendanceId = generateId(15);
		const record = {
			id: attendanceId,
			...attendanceData,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		await db.insert(attendance).values(record);
		return record;
	},

	async getAttendanceByUserAndDate(userId, date) {
		const result = await db.select()
			.from(attendance)
			.where(and(eq(attendance.userId, userId), eq(attendance.date, date)))
			.limit(1);
		return result[0] || null;
	},

	async getAttendanceByDateRange(userId, startDate, endDate) {
		return await db.select()
			.from(attendance)
			.where(
				and(
					eq(attendance.userId, userId),
					gte(attendance.date, startDate),
					lte(attendance.date, endDate)
				)
			)
			.orderBy(desc(attendance.date));
	},

	async getAllAttendanceByDate(date) {
		return await db.select({
			id: attendance.id,
			userId: attendance.userId,
			userName: users.name,
			userNip: users.nip,
			date: attendance.date,
			checkIn: attendance.checkIn,
			checkOut: attendance.checkOut,
			status: attendance.status,
			notes: attendance.notes,
			createdAt: attendance.createdAt
		})
		.from(attendance)
		.innerJoin(users, eq(attendance.userId, users.id))
		.where(eq(attendance.date, date))
		.orderBy(users.name);
	},

	async updateAttendance(id, attendanceData) {
		const updateData = {
			...attendanceData,
			updatedAt: new Date().toISOString()
		};
		
		await db.update(attendance).set(updateData).where(eq(attendance.id, id));
	},

	async deleteAttendance(id) {
		await db.delete(attendance).where(eq(attendance.id, id));
	},

	// Schedule operations
	async createSchedule(scheduleData) {
		const scheduleId = generateId(15);
		const schedule = {
			id: scheduleId,
			...scheduleData,
			createdAt: new Date().toISOString()
		};
		
		await db.insert(schedules).values(schedule);
		return schedule;
	},

	async getSchedulesByUser(userId) {
		return await db.select()
			.from(schedules)
			.where(and(eq(schedules.userId, userId), eq(schedules.isActive, true)))
			.orderBy(schedules.dayOfWeek, schedules.startTime);
	},

	async getAllSchedules() {
		return await db.select({
			id: schedules.id,
			userId: schedules.userId,
			userName: users.name,
			dayOfWeek: schedules.dayOfWeek,
			startTime: schedules.startTime,
			endTime: schedules.endTime,
			subject: schedules.subject,
			class: schedules.class,
			room: schedules.room,
			isActive: schedules.isActive
		})
		.from(schedules)
		.innerJoin(users, eq(schedules.userId, users.id))
		.where(eq(schedules.isActive, true))
		.orderBy(schedules.dayOfWeek, schedules.startTime);
	},

	async updateSchedule(id, scheduleData) {
		await db.update(schedules).set(scheduleData).where(eq(schedules.id, id));
	},

	async deleteSchedule(id) {
		await db.delete(schedules).where(eq(schedules.id, id));
	},

	// Settings operations
	async setSetting(key, value, description = null) {
		const setting = {
			id: generateId(15),
			key,
			value,
			description,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		// Try to update first, if not exists then insert
		const existing = await this.getSetting(key);
		if (existing) {
			await db.update(settings)
				.set({ value, updatedAt: new Date().toISOString() })
				.where(eq(settings.key, key));
		} else {
			await db.insert(settings).values(setting);
		}
	},

	async getSetting(key) {
		const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
		return result[0] || null;
	},

	async getAllSettings() {
		return await db.select().from(settings).orderBy(settings.key);
	},

	// Holiday operations
	async createHoliday(holidayData) {
		const holidayId = generateId(15);
		const holiday = {
			id: holidayId,
			...holidayData,
			createdAt: new Date().toISOString()
		};
		
		await db.insert(holidays).values(holiday);
		return holiday;
	},

	async getHolidaysByYear(year) {
		return await db.select()
			.from(holidays)
			.where(sql`strftime('%Y', date) = ${year}`)
			.orderBy(holidays.date);
	},

	async isHoliday(date) {
		const result = await db.select()
			.from(holidays)
			.where(eq(holidays.date, date))
			.limit(1);
		return result.length > 0;
	},

	// Stats and reports
	async getAttendanceStats(userId, startDate, endDate) {
		const records = await this.getAttendanceByDateRange(userId, startDate, endDate);
		
		const stats = {
			total: records.length,
			hadir: 0,
			terlambat: 0,
			tidak_hadir: 0,
			izin: 0,
			sakit: 0
		};

		records.forEach(record => {
			if (stats[record.status] !== undefined) {
				stats[record.status]++;
			}
		});

		return stats;
	},

	async getMonthlyReport(year, month) {
		const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
		const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
		
		return await db.select({
			userId: users.id,
			userName: users.name,
			userNip: users.nip,
			attendanceId: attendance.id,
			date: attendance.date,
			checkIn: attendance.checkIn,
			checkOut: attendance.checkOut,
			status: attendance.status,
			notes: attendance.notes
		})
		.from(users)
		.leftJoin(attendance, and(
			eq(users.id, attendance.userId),
			gte(attendance.date, startDate),
			lte(attendance.date, endDate)
		))
		.where(eq(users.role, 'guru'))
		.orderBy(users.name, attendance.date);
	}
};