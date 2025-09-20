import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const user = locals.user;
	
	// Pastikan user sudah login
	if (!user) {
		throw redirect(302, '/login');
	}
	
	// Pastikan user adalah admin
	if (user.role !== 'admin') {
		throw redirect(302, '/');
	}
	
	return {
		user
	};
}