import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { dbHelpers } from './db.js';

// Custom adapter untuk Drizzle + libsql yang mengikuti interface Lucia
class DrizzleAdapter {
	async getSessionAndUser(sessionId) {
		try {
			const session = await dbHelpers.getSessionById(sessionId);
			if (!session) return [null, null];
			
			const user = await dbHelpers.getUserById(session.userId);
			if (!user) return [null, null];
			
			console.log('Auth adapter - Raw user from DB:', user);
			console.log('Auth adapter - User role:', user.role);
			
			// Lucia v3 expects user with id + all other fields as attributes
			// Remove fields that should not be in attributes
			const { hashedPassword, createdAt, updatedAt, ...userAttributes } = user;
			console.log('Auth adapter - User attributes for Lucia:', userAttributes);
			
			// Convert expiresAt to Date object - handle berbagai format
			let expiresAtDate;
			if (session.expiresAt instanceof Date) {
				expiresAtDate = session.expiresAt;
			} else if (typeof session.expiresAt === 'number') {
				// Unix timestamp in milliseconds
				expiresAtDate = new Date(session.expiresAt);
			} else if (typeof session.expiresAt === 'string') {
				// ISO string
				expiresAtDate = new Date(session.expiresAt);
			} else {
				console.error('Invalid expiresAt format:', session.expiresAt);
				return [null, null];
			}
			
			// Validasi bahwa date object valid
			if (isNaN(expiresAtDate.getTime())) {
				console.error('Invalid date created from expiresAt:', session.expiresAt);
				return [null, null];
			}
			
			const convertedSession = {
				...session,
				expiresAt: expiresAtDate
			};
			
			return [convertedSession, userAttributes];
		} catch (error) {
			console.error('Error in getSessionAndUser:', error);
			return [null, null];
		}
	}

	async getUserSessions(userId) {
		// Return empty array for now - implement if needed
		return [];
	}

	async setSession(session) {
		try {
			await dbHelpers.createSession(session);
		} catch (error) {
			console.error('Error in setSession:', error);
			throw error;
		}
	}

	async updateSessionExpiration(sessionId, expiresAt) {
		// For now, we'll skip this since our dbHelpers doesn't have this method
		// In production, you'd want to implement this
		console.log(`Session ${sessionId} expiration would be updated to ${expiresAt}`);
	}

	async deleteSession(sessionId) {
		try {
			await dbHelpers.deleteSession(sessionId);
		} catch (error) {
			console.error('Error in deleteSession:', error);
			throw error;
		}
	}

	async deleteUserSessions(userId) {
		// For now, we'll skip this since our dbHelpers doesn't have this method
		console.log(`All sessions for user ${userId} would be deleted`);
	}

	async deleteExpiredSessions() {
		try {
			await dbHelpers.deleteExpiredSessions();
		} catch (error) {
			console.error('Error in deleteExpiredSessions:', error);
		}
	}
}

export const lucia = new Lucia(new DrizzleAdapter(), {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		console.log('getUserAttributes called with:', attributes);
		if (!attributes) {
			console.log('getUserAttributes - no attributes, returning empty');
			return {};
		}
		const result = {
			username: attributes.username,
			name: attributes.name,
			role: attributes.role,
			nip: attributes.nip,
			subject: attributes.subject,
			phone: attributes.phone,
			email: attributes.email,
			isActive: attributes.isActive
		};
		console.log('getUserAttributes - returning:', result);
		return result;
	}
});