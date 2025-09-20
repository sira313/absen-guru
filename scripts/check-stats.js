import { db } from '../src/lib/server/db.js';
import { attendance, users } from '../src/lib/server/schema.js';
import { eq, and, gte, lte, count, desc } from 'drizzle-orm';

async function checkStatistics() {
    try {
        console.log('Checking attendance statistics...\n');
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        console.log(`Date: ${today}`);
        
        // Get all attendance records for today
        const todayRecords = await db
            .select({
                id: attendance.id,
                userName: users.name,
                status: attendance.status,
                notes: attendance.notes,
                checkIn: attendance.checkIn
            })
            .from(attendance)
            .leftJoin(users, eq(attendance.userId, users.id))
            .where(eq(attendance.date, today))
            .orderBy(desc(attendance.checkIn));
            
        console.log('\n=== TODAY\'S ATTENDANCE RECORDS ===');
        todayRecords.forEach((record, index) => {
            console.log(`${index + 1}. ${record.userName} - ${record.status} - ${record.checkIn || 'No check-in'}`);
            if (record.notes) console.log(`   Notes: ${record.notes}`);
        });
        
        // Get summary statistics
        const summaryStats = await db
            .select({
                status: attendance.status,
                count: count()
            })
            .from(attendance)
            .where(eq(attendance.date, today))
            .groupBy(attendance.status);
            
        console.log('\n=== SUMMARY STATISTICS (RAW) ===');
        summaryStats.forEach(stat => {
            console.log(`${stat.status}: ${stat.count}`);
        });
        
        // Calculate processed statistics (like in dashboard)
        const processedStats = {
            total_records: summaryStats.reduce((sum, s) => sum + s.count, 0),
            hadir: (summaryStats.find(s => s.status === 'hadir')?.count || 0) + 
                   (summaryStats.find(s => s.status === 'dinas_luar')?.count || 0),
            terlambat: summaryStats.find(s => s.status === 'terlambat')?.count || 0,
            tidak_hadir: summaryStats.find(s => s.status === 'tidak_hadir')?.count || 0
        };
        
        console.log('\n=== PROCESSED STATISTICS (AS SHOWN IN DASHBOARD) ===');
        console.log(`Total Records: ${processedStats.total_records}`);
        console.log(`Hadir (including dinas_luar): ${processedStats.hadir}`);
        console.log(`Terlambat: ${processedStats.terlambat}`);
        console.log(`Tidak Hadir: ${processedStats.tidak_hadir}`);
        
    } catch (error) {
        console.error('Error checking statistics:', error);
    }
}

checkStatistics();