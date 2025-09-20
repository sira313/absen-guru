import { redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth.js';

export async function GET({ locals, cookies }) {
	if (!locals.session) {
		throw redirect(302, '/login');
	}
	
	// Invalidate the session
	await lucia.invalidateSession(locals.session.id);
	
	// Remove the session cookie
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: ".",
		...sessionCookie.attributes
	});
	
	// Redirect to login page
	throw redirect(302, '/login');
}