// src/hooks.server.js
import { lucia } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';
import { dbHelpers } from '$lib/server/db.js';

export async function handle({ event, resolve }) {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		try {
			const result = await lucia.validateSession(sessionId);
			// Lucia mengembalikan { session, user } dari validateSession
			const { session, user } = result;
			
			// WORKAROUND: Lucia tidak menggunakan getUserAttributes dengan benar
			// Ambil user lengkap dari database secara manual
			if (user && user.id) {
				const fullUser = await dbHelpers.getUserById(user.id);
				
				if (fullUser) {
					// Gabungkan dengan user dari Lucia
					user.username = fullUser.username;
					user.name = fullUser.name;
					user.role = fullUser.role;
					user.nip = fullUser.nip;
					user.subject = fullUser.subject;
					user.phone = fullUser.phone;
					user.email = fullUser.email;
					user.isActive = fullUser.isActive;
				}
			}
		
			if (session && session.fresh) {
				const sessionCookie = lucia.createSessionCookie(session.id);
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}
			if (!session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}
			event.locals.user = user;
			event.locals.session = session;
		} catch (error) {
			console.error('Session validation error:', error);
			event.locals.user = null;
			event.locals.session = null;
		}
	}

	// Protect admin routes
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user || event.locals.user.role !== 'admin') {
			throw redirect(303, '/login');
		}
	}

	// Protect guru routes
	if (event.url.pathname.startsWith('/guru')) {
		if (!event.locals.user || event.locals.user.role !== 'guru') {
			throw redirect(303, '/login');
		}
	}

	// Redirect to appropriate dashboard if logged in and accessing root
	if (event.url.pathname === '/') {
		if (event.locals.user) {
			if (event.locals.user.role === 'admin') {
				throw redirect(303, '/admin');
			} else if (event.locals.user.role === 'guru') {
				throw redirect(303, '/guru');
			}
		} else {
			throw redirect(303, '/login');
		}
	}

	return resolve(event);
}