// src/hooks.server.js
import {
  validateSession,
  setSessionCookie,
  deleteSessionCookie,
  SESSION_COOKIE_NAME,
} from "$lib/server/auth.js";
import { redirect } from "@sveltejs/kit";

export async function handle({ event, resolve }) {
  const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
  } else {
    try {
      const { session, user } = await validateSession(sessionId);

      // Set fresh session cookie if session was refreshed
      if (session && session.fresh) {
        setSessionCookie(event.cookies, session.id, session.expiresAt);
      }

      // Clear session cookie if session is invalid
      if (!session) {
        deleteSessionCookie(event.cookies);
      }

      event.locals.user = user;
      event.locals.session = session;
    } catch (error) {
      console.error("Session validation error:", error);
      event.locals.user = null;
      event.locals.session = null;
    }
  }

  // Protect admin routes
  if (event.url.pathname.startsWith("/admin")) {
    if (!event.locals.user || event.locals.user.role !== "admin") {
      throw redirect(303, "/login");
    }
  }

  // Protect guru routes
  if (event.url.pathname.startsWith("/guru")) {
    if (!event.locals.user || event.locals.user.role !== "guru") {
      throw redirect(303, "/login");
    }
  }

  // Redirect to appropriate dashboard if logged in and accessing root
  if (event.url.pathname === "/") {
    if (event.locals.user) {
      if (event.locals.user.role === "admin") {
        throw redirect(303, "/admin");
      } else if (event.locals.user.role === "guru") {
        throw redirect(303, "/guru");
      }
    } else {
      throw redirect(303, "/login");
    }
  }

  const response = await resolve(event);

  // Add headers to allow cross-origin requests and fix permissions policy issues
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Remove problematic Permissions-Policy headers and set proper ones
  response.headers.delete("Permissions-Policy");
  response.headers.set(
    "Permissions-Policy",
    "run-ad-auction=(), join-ad-interest-group=()",
  );

  return response;
}
