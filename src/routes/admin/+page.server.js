import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { attendance, users } from '$lib/server/schema.js';
import { eq, and, gte, lte, desc, count } from 'drizzle-orm';

export async function load({ locals, url }) {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (locals.user.role !== 'admin') {
		throw error(403, 'Access forbidden');
	}

	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	
	// Ambil parameter filter dari URL
	const startDate = url.searchParams.get('start') || firstDayOfMonth.toISOString().split('T')[0];
	const endDate = url.searchParams.get('end') || lastDayOfMonth.toISOString().split('T')[0];
	
	try {
		// Get statistics
		const summaryStats = await db
			.select({
				status: attendance.status,
				count: count()
			})
			.from(attendance)
			.where(and(
				gte(attendance.date, startDate),
				lte(attendance.date, endDate)
			))
			.groupBy(attendance.status);

		// Get recent attendance records
		const recentAttendance = await db
			.select({
				id: attendance.id,
				date: attendance.date,
				check_in_time: attendance.checkIn,
				status: attendance.status,
				notes: attendance.notes,
				user: {
					id: users.id,
					fullName: users.name
				}
			})
			.from(attendance)
			.leftJoin(users, eq(attendance.userId, users.id))
			.orderBy(desc(attendance.date), desc(attendance.checkIn))
			.limit(10);

		// Get all users
		const allUsers = await db
			.select({
				id: users.id,
				fullName: users.name,
				email: users.email,
				role: users.role
			})
			.from(users)
			.orderBy(users.name);

		// Process summary stats
		const stats = {
			total_records: summaryStats.reduce((sum, s) => sum + s.count, 0),
			hadir: summaryStats.find(s => s.status === 'hadir')?.count || 0,
			terlambat: summaryStats.find(s => s.status === 'terlambat')?.count || 0,
			tidak_hadir: summaryStats.find(s => s.status === 'tidak_hadir')?.count || 0
		};
		
		return {
			stats,
			recentAttendance,
			users: allUsers,
			filters: {
				startDate,
				endDate
			}
		};
	} catch (err) {
		console.error('Error loading admin data:', err);
		throw error(500, 'Internal server error');
	}
}