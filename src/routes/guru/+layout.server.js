import { redirect } from '@sveltejs/kit';

export async function load({ locals, parent }) {
	await parent();
	
	if (!locals.user) {
		throw redirect(302, '/login');
	}
	
	if (locals.user.role !== 'guru') {
		throw redirect(302, '/login');
	}
	
	return {
		user: locals.user
	};
}