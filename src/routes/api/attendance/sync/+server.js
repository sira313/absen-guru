// src/routes/api/attendance/sync/+server.js
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { attendance } from '$lib/server/schema.js';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';

export async function POST({ request, locals }) {
    try {
        // Check authentication
        if (!locals.session || !locals.user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        
        // Validate data
        if (!data.date || !data.status || !data.userId) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if attendance already exists for this date
        const existingAttendance = await db
            .select()
            .from(attendance)
            .where(
                and(
                    eq(attendance.userId, data.userId),
                    eq(attendance.date, data.date)
                )
            )
            .get();

        if (existingAttendance) {
            return json({ 
                error: 'Attendance already recorded for this date',
                existing: existingAttendance 
            }, { status: 409 });
        }

        // Insert attendance record
        const attendanceId = nanoid();
        const attendanceData = {
            id: attendanceId,
            userId: data.userId,
            date: data.date,
            checkIn: data.checkIn,
            checkOut: null,
            status: data.status,
            notes: data.notes || null,
            location: data.location || null,
            ipAddress: data.ipAddress || null
        };

        await db.insert(attendance).values(attendanceData);

        return json({ 
            success: true, 
            message: 'Attendance synced successfully',
            id: attendanceId 
        });

    } catch (error) {
        console.error('Sync attendance error:', error);
        return json({ 
            error: 'Internal server error', 
            details: error.message 
        }, { status: 500 });
    }
}