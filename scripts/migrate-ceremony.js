import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';

// Create database client
const client = createClient({
	url: 'file:./absen.db'
});

const db = drizzle(client);

try {
    console.log('🚀 Starting ceremony features migration...');
    
    // Add ceremony_status column to attendance table
    console.log('📝 Adding ceremony_status column...');
    await db.run(sql`ALTER TABLE attendance ADD COLUMN ceremony_status TEXT CHECK (ceremony_status IN ('hadir', 'tidak_hadir'))`);
    
    // Create work_calendar table
    console.log('📅 Creating work_calendar table...');
    await db.run(sql`CREATE TABLE IF NOT EXISTS work_calendar (
        date DATE PRIMARY KEY,
        is_workday BOOLEAN DEFAULT true,
        is_ceremony_day BOOLEAN DEFAULT false,
        is_national_holiday BOOLEAN DEFAULT false,
        description TEXT,
        ceremony_start_time TIME DEFAULT '07:30:00',
        ceremony_end_time TIME DEFAULT '08:00:00',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Create school_settings table
    console.log('⚙️ Creating school_settings table...');
    await db.run(sql`CREATE TABLE IF NOT EXISTS school_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        setting_type TEXT DEFAULT 'string',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Insert default settings
    console.log('🔧 Inserting default settings...');
    await db.run(sql`INSERT OR REPLACE INTO school_settings (setting_key, setting_value, setting_type, description) VALUES
        ('school_name', 'SDN 19 PERIJI', 'string', 'Nama sekolah untuk header laporan'),
        ('school_head_name', 'Bogok, S.Pd.', 'string', 'Nama kepala sekolah'),
        ('school_head_nip', '196709061991102001', 'string', 'NIP kepala sekolah'),
        ('ceremony_start_time', '07:30', 'string', 'Waktu mulai upacara (HH:MM)'),
        ('ceremony_end_time', '08:00', 'string', 'Waktu selesai upacara (HH:MM)'),
        ('default_work_days_per_month', '22', 'number', 'Default jumlah hari kerja per bulan'),
        ('ceremony_location', 'Halaman Sekolah', 'string', 'Lokasi upacara')`);
    
    // Populate work_calendar with Mondays
    console.log('📋 Populating work calendar...');
    await db.run(sql`WITH RECURSIVE dates(date) AS (
        SELECT date('now', 'start of year')
        UNION ALL
        SELECT date(date, '+1 day')
        FROM dates
        WHERE date < date('now', 'start of year', '+1 year')
    )
    INSERT OR REPLACE INTO work_calendar (date, is_ceremony_day, is_workday)
    SELECT 
        date,
        CASE 
            WHEN strftime('%w', date) = '1' THEN 1
            ELSE 0 
        END as is_ceremony_day,
        CASE 
            WHEN strftime('%w', date) IN ('0', '6') THEN 0
            ELSE 1 
        END as is_workday
    FROM dates`);
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_work_calendar_date ON work_calendar(date)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_work_calendar_ceremony ON work_calendar(is_ceremony_day)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_attendance_ceremony ON attendance(ceremony_status)`);
    
    console.log('✅ Ceremony features migration completed successfully!');
    console.log('✅ Work calendar table created');
    console.log('✅ School settings table created');
    console.log('✅ Attendance table updated with ceremony_status');
    
} catch (error) {
    console.error('❌ Error executing migration:', error);
    process.exit(1);
}