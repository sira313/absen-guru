// src/routes/+page.server.js
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  // Jika sudah login, redirect ke dashboard sesuai role
  if (locals.user) {
    if (locals.user.role === "admin") {
      throw redirect(302, "/admin");
    } else {
      throw redirect(302, "/guru");
    }
  }

  // Jika belum login, redirect ke halaman login
  throw redirect(302, "/login");
}
