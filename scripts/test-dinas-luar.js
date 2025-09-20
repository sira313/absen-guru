import { db } from '../src/lib/server/db.js';
import { attendance, users } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

async function addDinasLuarTestData() {
    try {
        console.log('Adding test data for dinas_luar status...');
        
        // Get a guru user for testing
        const guruUsers = await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(eq(users.role, 'guru'))
            .limit(1);
            
        if (guruUsers.length === 0) {
            console.log('No guru users found. Please add guru users first.');
            return;
        }
        
        const guru = guruUsers[0];
        console.log(`Using guru: ${guru.name} (${guru.id})`);
        
        // Add dinas_luar attendance record for today
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().slice(0, 8); // HH:MM:SS format
        
        const attendanceRecord = {
            id: nanoid(),
            userId: guru.id,
            date: today,
            checkIn: currentTime,
            checkOut: null,
            status: 'dinas_luar',
            notes: 'Rapat dinas di Dinas Pendidikan',
            location: 'Dinas Pendidikan',
            ipAddress: '192.168.1.100',
            createdAt: new Date().toISOString()
        };
        
        // Check if record already exists for today
        const existingRecord = await db
            .select()
            .from(attendance)
            .where(eq(attendance.userId, guru.id) && eq(attendance.date, today))
            .limit(1);
            
        if (existingRecord.length > 0) {
            console.log('Attendance record already exists for today. Updating to dinas_luar...');
            await db.update(attendance)
                .set({
                    status: 'dinas_luar',
                    notes: 'Rapat dinas di Dinas Pendidikan',
                    location: 'Dinas Pendidikan'
                })
                .where(eq(attendance.id, existingRecord[0].id));
            console.log('Updated existing record to dinas_luar status');
        } else {
            await db.insert(attendance).values(attendanceRecord);
            console.log('Added new dinas_luar attendance record');
        }
        
        console.log('Test data added successfully!');
        console.log(`Record: ${guru.name} - ${today} - dinas_luar`);
        
    } catch (error) {
        console.error('Error adding test data:', error);
    }
}

addDinasLuarTestData();