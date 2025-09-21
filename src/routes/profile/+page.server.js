import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { users } from '$lib/server/schema.js';
import { eq } from 'drizzle-orm';

// Simple hash function - sama dengan yang digunakan di seed.js dan login
async function simpleHash(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + 'salt123'); // Same salt as in seed.js
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple hash verification function - sama dengan yang digunakan di login
async function verifyPassword(password, hashedPassword) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + 'salt123'); // Same salt as in seed.js
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hash === hashedPassword;
}

export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Get current user data using Drizzle
	const userResult = await db
		.select({
			id: users.id,
			username: users.username,
			email: users.email,
			role: users.role,
			name: users.name,
			nip: users.nip,
			subject: users.subject,
			employeeType: users.employeeType,
			position: users.position,
			phone: users.phone
		})
		.from(users)
		.where(eq(users.id, locals.user.id))
		.limit(1);

	const user = userResult[0];
	if (!user) {
		throw redirect(302, '/login');
	}

	return {
		user
	};
}

export const actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const name = data.get('name');
		const username = data.get('username');
		const email = data.get('email');
		const nip = data.get('nip') || null;
		const subject = data.get('subject') || null;
		const phone = data.get('phone') || null;

		// Validasi input
		if (!name || name.length < 2) {
			return fail(400, {
				error: true,
				message: 'Nama lengkap minimal 2 karakter'
			});
		}

		if (!username || username.length < 3) {
			return fail(400, {
				error: true,
				message: 'Username minimal 3 karakter'
			});
		}

		if (!email || !email.includes('@')) {
			return fail(400, {
				error: true,
				message: 'Email tidak valid'
			});
		}

		try {
			// Cek apakah username sudah digunakan user lain
			const existingUser = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.username, username))
				.limit(1);

			if (existingUser.length > 0 && existingUser[0].id !== locals.user.id) {
				return fail(400, {
					error: true,
					message: 'Username sudah digunakan'
				});
			}

			// Cek apakah email sudah digunakan user lain
			const existingEmail = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			if (existingEmail.length > 0 && existingEmail[0].id !== locals.user.id) {
				return fail(400, {
					error: true,
					message: 'Email sudah digunakan'
				});
			}

			// Update profile dengan semua field
			await db
				.update(users)
				.set({
					name: name,
					username: username,
					email: email,
					nip: nip,
					subject: subject,
					phone: phone,
					updatedAt: new Date().toISOString()
				})
				.where(eq(users.id, locals.user.id));

			return {
				success: true,
				message: 'Profile berhasil diperbarui'
			};
		} catch (error) {
			console.error('Error updating profile:', error);
			return fail(500, {
				error: true,
				message: 'Terjadi kesalahan saat memperbarui profile'
			});
		}
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const data = await request.formData();
		const currentPassword = data.get('currentPassword');
		const newPassword = data.get('newPassword');
		const confirmPassword = data.get('confirmPassword');

		// Validasi input
		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, {
				error: true,
				message: 'Semua field password harus diisi'
			});
		}

		if (newPassword.length < 6) {
			return fail(400, {
				error: true,
				message: 'Password baru minimal 6 karakter'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, {
				error: true,
				message: 'Konfirmasi password tidak cocok'
			});
		}

		try {
			// Get current user dengan password
			const userResult = await db
				.select({ hashedPassword: users.hashedPassword })
				.from(users)
				.where(eq(users.id, locals.user.id))
				.limit(1);

			const user = userResult[0];
			if (!user) {
				return fail(400, {
					error: true,
					message: 'User tidak ditemukan'
				});
			}

			// Verifikasi password lama
			const isValidPassword = await verifyPassword(currentPassword, user.hashedPassword);
			if (!isValidPassword) {
				return fail(400, {
					error: true,
					message: 'Password lama tidak benar'
				});
			}

			// Hash password baru
			const hashedPassword = await simpleHash(newPassword);

			// Update password
			await db
				.update(users)
				.set({
					hashedPassword: hashedPassword,
					updatedAt: new Date().toISOString()
				})
				.where(eq(users.id, locals.user.id));

			return {
				success: true,
				message: 'Password berhasil diubah'
			};
		} catch (error) {
			console.error('Error changing password:', error);
			return fail(500, {
				error: true,
				message: 'Terjadi kesalahan saat mengubah password'
			});
		}
	}
};