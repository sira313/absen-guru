// src/lib/server/session.js
// Custom session implementation following Lucia v3 migration guide
// https://lucia-auth.com/lucia-v3/migrate

import { dev } from '$app/environment';
import { dbHelpers } from './db.js';

// Base32 encoding implementation from Lucia migration guide
const alphabet = '0123456789abcdefghijklmnpqrstuvwxyz';

function encodeBase32LowerCaseNoPadding(data) {
	let result = '';
	let buffer = 0;
	let bufferLength = 0;
	
	for (let i = 0; i < data.length; i++) {
		buffer = (buffer << 8) | data[i];
		bufferLength += 8;
		
		while (bufferLength >= 5) {
			result += alphabet[(buffer >>> (bufferLength - 5)) & 0x1f];
			bufferLength -= 5;
		}
	}
	
	if (bufferLength > 0) {
		result += alphabet[(buffer << (5 - bufferLength)) & 0x1f];
	}
	
	return result;
}

function generateSessionId() {
	const bytes = new Uint8Array(25);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

const sessionExpiresInSeconds = 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId) {
	const now = new Date();
	const sessionId = generateSessionId();
	const expiresAt = new Date(now.getTime() + 1000 * sessionExpiresInSeconds);
	
	const session = {
		id: sessionId,
		userId,
		expiresAt
	};
	
	// Create session in database
	await dbHelpers.createSession(session);
	return session;
}

export async function validateSession(sessionId) {
	if (!sessionId) {
		return { session: null, user: null };
	}

	const now = Date.now();
	
	// Get session from database
	const session = await dbHelpers.getSessionById(sessionId);
	if (!session) {
		return { session: null, user: null };
	}

	// Convert expiresAt to Date object if needed
	let expiresAtDate;
	if (session.expiresAt instanceof Date) {
		expiresAtDate = session.expiresAt;
	} else if (typeof session.expiresAt === 'number') {
		expiresAtDate = new Date(session.expiresAt);
	} else if (typeof session.expiresAt === 'string') {
		expiresAtDate = new Date(session.expiresAt);
	} else {
		console.error('Invalid expiresAt format:', session.expiresAt);
		return { session: null, user: null };
	}

	// Check if session expired
	if (now >= expiresAtDate.getTime()) {
		await dbHelpers.deleteSession(session.id);
		return { session: null, user: null };
	}

	// Get user data
	const user = await dbHelpers.getUserById(session.userId);
	if (!user) {
		await dbHelpers.deleteSession(session.id);
		return { session: null, user: null };
	}

	// Session refresh - extend expiration if more than half the session time has passed
	let sessionFresh = false;
	if (now >= expiresAtDate.getTime() - (1000 * sessionExpiresInSeconds) / 2) {
		session.expiresAt = new Date(Date.now() + 1000 * sessionExpiresInSeconds);
		await dbHelpers.updateSessionExpiration(session.id, session.expiresAt);
		sessionFresh = true;
	}

	// Convert session object
	const convertedSession = {
		...session,
		expiresAt: expiresAtDate,
		fresh: sessionFresh
	};

	// Return user without sensitive fields
	const { hashedPassword, createdAt, updatedAt, ...userWithoutSensitive } = user;

	return { 
		session: convertedSession, 
		user: userWithoutSensitive 
	};
}

export async function invalidateSession(sessionId) {
	await dbHelpers.deleteSession(sessionId);
}

export async function invalidateAllUserSessions(userId) {
	await dbHelpers.deleteUserSessions(userId);
}

// Cookie management functions
export function setSessionCookie(cookies, sessionId, expiresAt) {
	const cookieOptions = {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/',
		secure: false // Allow HTTP for local network access
	};
	
	cookies.set('session', sessionId, cookieOptions);
}

export function deleteSessionCookie(cookies) {
	const cookieOptions = {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/',
		secure: false // Allow HTTP for local network access
	};
	
	cookies.set('session', '', cookieOptions);
}

export const SESSION_COOKIE_NAME = 'session';