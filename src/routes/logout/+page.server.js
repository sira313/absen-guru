// src/routes/logout/+page.server.js
export async function load() {
  // Return empty data object to prevent layout errors
  return {
    user: null
  };
}