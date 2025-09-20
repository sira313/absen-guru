import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { attendance, users } from '$lib/server/schema.js';
import { eq, and, gte, lte, desc, count, sql } from 'drizzle-orm';

export async function load({ locals, url }) {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (locals.user.role !== 'admin') {
		throw error(403, 'Access forbidden');
	}

	// Get query parameters for filtering
	const startDate = url.searchParams.get('start_date') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
	const endDate = url.searchParams.get('end_date') || new Date().toISOString().split('T')[0];
	const userId = url.searchParams.get('user_id') || null;
	const status = url.searchParams.get('status') || null;

	try {

		// Build base query
		let whereConditions = [
			gte(attendance.date, startDate),
			lte(attendance.date, endDate)
		];

		if (userId) {
			whereConditions.push(eq(attendance.userId, userId));
		}

		if (status) {
			whereConditions.push(eq(attendance.status, status));
		}

		// Get detailed attendance records
		const attendanceRecords = await db
			.select({
				id: attendance.id,
				date: attendance.date,
				check_in_time: attendance.checkIn,
				check_out_time: attendance.checkOut,
				status: attendance.status,
				notes: attendance.notes,
				user: {
					id: users.id,
					fullName: users.name,
					email: users.email
				}
			})
			.from(attendance)
			.leftJoin(users, eq(attendance.userId, users.id))
			.where(and(...whereConditions))
			.orderBy(desc(attendance.date), desc(attendance.checkIn));

		// Get summary statistics
		const summaryStats = await db
			.select({
				status: attendance.status,
				count: count()
			})
			.from(attendance)
			.where(and(...whereConditions))
			.groupBy(attendance.status);

		// Get all users for filter dropdown
		const allUsers = await db
			.select({
				id: users.id,
				fullName: users.name,
				email: users.email
			})
			.from(users)
			.where(eq(users.role, 'guru'))
			.orderBy(users.name);

		// Process summary stats - dinas_luar dihitung sebagai hadir
		const stats = {
			hadir: (summaryStats.find(s => s.status === 'hadir')?.count || 0) + 
			       (summaryStats.find(s => s.status === 'dinas_luar')?.count || 0),
			terlambat: summaryStats.find(s => s.status === 'terlambat')?.count || 0,
			tidak_hadir: summaryStats.find(s => s.status === 'tidak_hadir')?.count || 0,
			total: summaryStats.reduce((sum, s) => sum + s.count, 0)
		};

		return {
			attendanceRecords,
			stats,
			allUsers,
			filters: {
				startDate,
				endDate,
				userId,
				status
			}
		};
	} catch (err) {
		console.error('Database error:', err);
		throw error(500, 'Internal server error');
	}
}