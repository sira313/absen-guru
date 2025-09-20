import { error, redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { users } from '$lib/server/schema.js';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';

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
				fullName: users.name,
				email: users.email,
				role: users.role,
				created_at: users.createdAt
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
		if (!locals.user || locals.user.role !== 'admin') {
			throw error(403, 'Access forbidden');
		}

		const data = await request.formData();
		const fullName = data.get('fullName');
		const email = data.get('email');
		const password = data.get('password');
		const role = data.get('role');

		// Validation
		if (!fullName || !email || !password || !role) {
			return fail(400, { message: 'Semua field harus diisi' });
		}

		if (password.length < 6) {
			return fail(400, { message: 'Password minimal 6 karakter' });
		}

		try {
			// Check if email already exists
			const existingUser = await db
				.select()
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			if (existingUser.length > 0) {
				return fail(400, { message: 'Email sudah digunakan' });
			}

			// Hash password
			const passwordHash = await bcrypt.hash(password, 12);

			// Create user
			await db.insert(users).values({
				fullName,
				email,
				password: passwordHash,
				role
			});

			return { success: true, message: 'User berhasil dibuat' };
		} catch (err) {
			console.error('Database error:', err);
			return fail(500, { message: 'Terjadi kesalahan server' });
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