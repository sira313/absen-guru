import { error, redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { users } from '$lib/server/schema.js';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Simple hash function - sama dengan yang digunakan di sistem
async function simpleHash(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + 'salt123'); // Same salt as in seed.js
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (locals.user.role !== 'admin') {
		throw error(403, 'Access forbidden');
	}

	try {
		// Get all users
		const allUsers = await db
			.select({
				id: users.id,
				username: users.username,
				name: users.name,
				email: users.email,
				role: users.role,
				nip: users.nip,
				subject: users.subject,
				phone: users.phone,
				isActive: users.isActive,
				createdAt: users.createdAt
			})
			.from(users)
			.orderBy(desc(users.createdAt));

		return {
			users: allUsers
		};
	} catch (err) {
		console.error('Database error:', err);
		throw error(500, 'Internal server error');
	}
}

export const actions = {
	create: async ({ request, locals }) => {
		console.log('=== CREATE USER ACTION START ===');
		console.log('locals.user:', locals.user);
		
		if (!locals.user || locals.user.role !== 'admin') {
			console.log('Access forbidden - user:', locals.user);
			throw error(403, 'Access forbidden');
		}

		const data = await request.formData();
		const username = data.get('username');
		const name = data.get('name');
		const email = data.get('email');
		const password = data.get('password');
		const role = data.get('role');
		const nip = data.get('nip');
		const subject = data.get('subject');
		const phone = data.get('phone');

		console.log('Form data received:', {
			username,
			name,
			email,
			password: password ? '[HIDDEN]' : null,
			role,
			nip,
			subject,
			phone
		});

		// Validation
		if (!username || !name || !email || !password || !role) {
			console.log('Validation failed - missing required fields');
			return fail(400, { message: 'Username, nama, email, password, dan role harus diisi' });
		}

		if (password.length < 6) {
			console.log('Validation failed - password too short');
			return fail(400, { message: 'Password minimal 6 karakter' });
		}

		if (username.length < 3) {
			console.log('Validation failed - username too short');
			return fail(400, { message: 'Username minimal 3 karakter' });
		}

		try {
			console.log('Starting database operations...');
			
			// Check if username already exists
			console.log('Checking if username exists:', username);
			const existingUsername = await db
				.select()
				.from(users)
				.where(eq(users.username, username))
				.limit(1);

			if (existingUsername.length > 0) {
				console.log('Username already exists');
				return fail(400, { message: 'Username sudah digunakan' });
			}

			// Check if email already exists
			console.log('Checking if email exists:', email);
			const existingEmail = await db
				.select()
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			if (existingEmail.length > 0) {
				console.log('Email already exists');
				return fail(400, { message: 'Email sudah digunakan' });
			}

			// Hash password using same method as login system
			console.log('Hashing password...');
			const hashedPassword = await simpleHash(password);

			// Generate unique ID
			console.log('Generating user ID...');
			const userId = nanoid();

			console.log('Creating user with data:', {
				id: userId,
				username,
				name,
				role,
				nip,
				subject,
				phone,
				email,
				hashedPassword: hashedPassword.substring(0, 10) + '...'
			});

			// Create user
			console.log('Inserting user into database...');
			const result = await db.insert(users).values({
				id: userId,
				username: username,
				hashedPassword: hashedPassword,
				name: name,
				role: role,
				nip: nip || null,
				subject: subject || null,
				phone: phone || null,
				email: email,
				isActive: true
			});

			console.log('Database insert result:', result);
			console.log('User created successfully');
			return { success: true, message: 'User berhasil dibuat' };
		} catch (err) {
			console.error('Database error details:');
			console.error('Error message:', err.message);
			console.error('Error stack:', err.stack);
			console.error('Full error object:', err);
			return fail(500, { message: 'Terjadi kesalahan server: ' + err.message });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			throw error(403, 'Access forbidden');
		}

		const data = await request.formData();
		const userId = data.get('userId');

		if (!userId) {
			return fail(400, { message: 'User ID diperlukan' });
		}

		// Prevent deleting self
		if (userId == locals.user.id) {
			return fail(400, { message: 'Tidak dapat menghapus akun sendiri' });
		}

		try {
			await db.delete(users).where(eq(users.id, userId));
			return { success: true, message: 'User berhasil dihapus' };
		} catch (err) {
			console.error('Database error:', err);
			return fail(500, { message: 'Terjadi kesalahan server' });
		}
	}
};