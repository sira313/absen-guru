import { validateSession } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	const { user } = await validateSession(cookies);
	
	if (!user) {
		throw redirect(302, '/login');
	}
	
	if (user.role !== 'admin') {
		throw redirect(302, '/');
	}

	return {
		user
	};
}