import "../app.css";

export async function load({ locals }) {
  return {
    user: locals.user,
  };
}
