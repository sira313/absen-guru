import { db } from '../src/lib/server/db.js';
import { users } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';

// Simple hash function - sama dengan sistem auth
async function simpleHash(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + 'salt123');
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function resetAdminPassword() {
	try {
		console.log('🔐 Admin Password Reset Tool');
		console.log('================================\n');
		
		// Get all admin users
		const adminUsers = await db
			.select({
				id: users.id,
				username: users.username,
				name: users.name,
				email: users.email
			})
			.from(users)
			.where(eq(users.role, 'admin'));
			
		if (adminUsers.length === 0) {
			console.log('❌ No admin users found in database!');
			return;
		}
		
		console.log('Found admin users:');
		adminUsers.forEach((admin, index) => {
			console.log(`${index + 1}. ${admin.name} (${admin.username}) - ${admin.email || 'No email'}`);
		});
		
		console.log('\n📋 Available Reset Options:');
		console.log('1. Reset to temporary password: admin123');
		console.log('2. Custom password (modify script)');
		console.log('3. Generate random password');
		
		// For security, use a more secure temporary password
		const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
		const tempPassword = `Admin${timestamp}!`; // e.g., Admin20250921!
		
		// Reset all admin users found
		for (const admin of adminUsers) {
			const hashedPassword = await simpleHash(tempPassword);
			
			await db
				.update(users)
				.set({
					hashedPassword: hashedPassword,
					updatedAt: new Date().toISOString()
				})
				.where(eq(users.id, admin.id));
				
			console.log(`\n✅ Password reset for: ${admin.name} (${admin.username})`);
		}
		
		console.log('\n🎯 RESET COMPLETED!');
		console.log('==================');
		console.log(`📱 Username: admin`);
		console.log(`🔑 Temporary Password: ${tempPassword}`);
		console.log(`🌐 Login URL: http://localhost:5174/login`);
		
		console.log('\n⚠️  SECURITY CHECKLIST:');
		console.log('✓ Login with the temporary password above');
		console.log('✓ Change password immediately after login');
		console.log('✓ Delete this script file for security');
		console.log('✓ Test the new password works');
		
		console.log('\n🗑️  To delete this script after use:');
		console.log('rm scripts/reset-admin-password.js');
		
	} catch (error) {
		console.error('❌ Error resetting password:', error);
		console.log('\n🔧 Troubleshooting:');
		console.log('1. Make sure database file exists');
		console.log('2. Check if you have admin users in the database');
		console.log('3. Run: npm run dev to start the application');
	}
}

// Show usage instructions
console.log('🚨 EMERGENCY ADMIN PASSWORD RESET');
console.log('==================================');
console.log('This script will reset ALL admin passwords to a temporary password.');
console.log('Use this only when admin is locked out of the system.\n');

resetAdminPassword();