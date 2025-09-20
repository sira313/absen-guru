// Migration script untuk menambahkan employee_type column
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
	url: 'file:./absen.db'
});

const db = drizzle(client);

async function addEmployeeTypeColumn() {
	try {
		// Add employee_type column with default value
		await db.run(`
			ALTER TABLE users ADD COLUMN employee_type TEXT DEFAULT 'Honorer';
		`);
		
		console.log('✅ Successfully added employee_type column to users table');
		console.log('   Default value: "Honorer"');
		
		// Update existing admin users to not have employee_type if they are admin
		await db.run(`
			UPDATE users SET employee_type = NULL WHERE role = 'admin';
		`);
		
		console.log('✅ Admin users updated (employee_type set to NULL)');
		
	} catch (error) {
		if (error.message.includes('duplicate column name')) {
			console.log('⚠️  Column employee_type already exists');
		} else {
			console.error('❌ Error adding column:', error);
			throw error;
		}
	}
}

addEmployeeTypeColumn()
	.then(() => {
		console.log('🚀 Migration completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('💥 Migration failed:', error);
		process.exit(1);
	});