// src/lib/server/auth.js
// Custom authentication implementation replacing Lucia
import { dbHelpers } from "./db.js";
import {
  createSession,
  validateSession,
  invalidateSession,
  invalidateAllUserSessions,
  setSessionCookie,
  deleteSessionCookie,
  SESSION_COOKIE_NAME,
} from "./session.js";

// Export the session management functions for use in other parts of the app
export {
  createSession,
  validateSession,
  invalidateSession,
  invalidateAllUserSessions,
  setSessionCookie,
  deleteSessionCookie,
  SESSION_COOKIE_NAME,
};
