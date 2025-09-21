import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';

const client = createClient({ url: 'file:./absen.db' });
const db = drizzle(client);

/**
 * Calculate ceremony status based on attendance time and date
 */
export async function calculateCeremonyStatus(userId, checkInTime) {
	try {
		const attendanceDate = new Date(checkInTime);
		const dayOfWeek = attendanceDate.getDay(); // 0 = Sunday, 1 = Monday
		
		// Only calculate for Mondays
		if (dayOfWeek !== 1) {
			return null; // Not Monday
		}
		
		// Skip holiday checking for now - just focus on Monday ceremony logic
		// TODO: Add holiday checking when holidays table is populated
		
		// Check ceremony time (07:00 WIB)
		const hours = attendanceDate.getHours();
		const minutes = attendanceDate.getMinutes();
		const totalMinutes = hours * 60 + minutes;
		
		const ceremonyStartTime = 7 * 60; // 07:00 in minutes
		const lateThreshold = ceremonyStartTime + 15; // 07:15 in minutes
		
		if (totalMinutes <= ceremonyStartTime) {
			return 'hadir'; // Attended ceremony
		} else if (totalMinutes <= lateThreshold) {
			return 'hadir'; // Late but still considered present
		} else {
			return 'tidak_hadir'; // Too late, considered absent
		}
		
	} catch (error) {
		console.error('Error calculating ceremony status:', error);
		return null;
	}
}

/**
 * Update ceremony status for existing attendance record
 */
export async function updateCeremonyStatus(attendanceId, ceremonyStatus) {
	try {
		await db.run(sql`
			UPDATE attendance 
			SET ceremony_status = ? 
			WHERE id = ?
		`, [ceremonyStatus, attendanceId]);
		
		return true;
	} catch (error) {
		console.error('Error updating ceremony status:', error);
		return false;
	}
}

/**
 * Bulk update ceremony status for all attendance records
 */
export async function bulkUpdateCeremonyStatus() {
	try {
		console.log('🚀 Starting bulk update ceremony status...');
		
		// Get all attendance records that don't have ceremony_status yet
		const attendanceRecords = await db.all(sql`
			SELECT id, date, check_in 
			FROM attendance 
			WHERE ceremony_status IS NULL AND check_in IS NOT NULL
		`);
		
		console.log(`📝 Found ${attendanceRecords.length} records to process`);
		
		let updatedCount = 0;
		
		for (const record of attendanceRecords) {
			// Construct full datetime from date and check_in
			const fullDateTime = `${record.date}T${record.check_in}`;
			const ceremonyStatus = await calculateCeremonyStatus(null, fullDateTime);
			
			if (ceremonyStatus) {
				await updateCeremonyStatus(record.id, ceremonyStatus);
				updatedCount++;
			}
		}
		
		console.log(`✅ Updated ${updatedCount} attendance records with ceremony status`);
		return updatedCount;
		
	} catch (error) {
		console.error('Error in bulk update ceremony status:', error);
		throw error;
	}
}

/**
 * Get ceremony statistics for a specific month
 */
export async function getCeremonyStats(month, year) {
	try {
		const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
		const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
		
		const stats = await db.get(sql`
			SELECT 
				COUNT(CASE WHEN ceremony_status = 'hadir' THEN 1 END) as ceremony_hadir,
				COUNT(CASE WHEN ceremony_status = 'tidak_hadir' THEN 1 END) as ceremony_tidak_hadir,
				COUNT(CASE WHEN ceremony_status IS NOT NULL THEN 1 END) as total_ceremony_opportunities
			FROM attendance 
			WHERE date(checkInTime) >= ? AND date(checkInTime) <= ?
		`, [startDate, endDate]);
		
		return stats;
		
	} catch (error) {
		console.error('Error getting ceremony stats:', error);
		return { ceremony_hadir: 0, ceremony_tidak_hadir: 0, total_ceremony_opportunities: 0 };
	}
}