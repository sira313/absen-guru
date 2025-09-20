// Update existing users with employee type
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';

const client = createClient({
	url: 'file:./absen.db'
});

const db = drizzle(client);

async function updateExistingUsers() {
	try {
		// Get all guru users without employee type
		const guruUsers = await db
			.select()
			.from(users)
			.where(eq(users.role, 'guru'));

		console.log(`Found ${guruUsers.length} guru users to update`);

		// Update each guru with a sample employee type
		for (let i = 0; i < guruUsers.length; i++) {
			const user = guruUsers[i];
			let employeeType;
			
			// Distribute evenly among the three types
			if (i % 3 === 0) {
				employeeType = 'PNS';
			} else if (i % 3 === 1) {
				employeeType = 'PPPK';
			} else {
				employeeType = 'Honorer';
			}

			await db
				.update(users)
				.set({ 
					employeeType: employeeType 
				})
				.where(eq(users.id, user.id));

			console.log(`✅ Updated ${user.name} (${user.username}) to ${employeeType}`);
		}

		console.log('🚀 All guru users updated with employee types!');
		
	} catch (error) {
		console.error('❌ Error updating users:', error);
		throw error;
	}
}

updateExistingUsers()
	.then(() => {
		console.log('Migration completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Migration failed:', error);
		process.exit(1);
	});