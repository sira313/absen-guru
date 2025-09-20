import { redirect } from '@sveltejs/kit';
import { invalidateSession, deleteSessionCookie } from '$lib/server/auth.js';

export async function GET({ locals, cookies }) {
	if (!locals.session) {
		throw redirect(302, '/login');
	}
	
	// Invalidate the session
	await invalidateSession(locals.session.id);
	
	// Remove the session cookie
	deleteSessionCookie(cookies);
	
	// Redirect to login page
	throw redirect(302, '/login');
}