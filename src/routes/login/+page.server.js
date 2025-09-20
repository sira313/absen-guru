import { redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth.js';
import { dbHelpers } from '$lib/server/db.js';
import { fail } from '@sveltejs/kit';

// Simple hash verification function
async function verifyPassword(password, hashedPassword) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + 'salt123'); // Same salt as in seed.js
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hash === hashedPassword;
}

export async function load({ locals }) {
	if (locals.user) {
		if (locals.user.role === 'admin') {
			throw redirect(302, '/admin');
		} else {
			throw redirect(302, '/guru');
		}
	}
}

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString();
		const password = formData.get('password')?.toString();

		if (!username || !password) {
			return fail(400, {
				message: 'Username dan password harus diisi',
				username
			});
		}

		const user = await dbHelpers.getUserByUsername(username);
		if (!user || !user.isActive) {
			return fail(400, {
				message: 'Username atau password salah',
				username
			});
		}

		const validPassword = await verifyPassword(password, user.hashedPassword);
		if (!validPassword) {
			return fail(400, {
				message: 'Username atau password salah',
				username
			});
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// Redirect langsung berdasarkan role untuk menghindari loop
		if (user.role === 'admin') {
			throw redirect(302, '/admin');
		} else {
			throw redirect(302, '/guru');
		}
	}
};