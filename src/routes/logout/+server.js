import { redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionCookie } from "$lib/server/auth.js";

export async function GET({ locals, cookies }) {
  console.log("Logout GET requested, locals.session:", locals.session);

  if (!locals.session) {
    console.log("No session found, redirecting to login");
    throw redirect(302, "/login");
  }

  try {
    // Invalidate the session
    await invalidateSession(locals.session.id);
    console.log("Session invalidated successfully");

    // Remove the session cookie
    deleteSessionCookie(cookies);
    console.log("Session cookie deleted");

    // Redirect to login page
    throw redirect(302, "/login");
  } catch (error) {
    console.error("Logout error:", error);
    // Still try to redirect to login even if logout fails
    throw redirect(302, "/login");
  }
}

export async function POST({ locals, cookies }) {
  console.log("Logout POST requested");
  return GET({ locals, cookies });
}
