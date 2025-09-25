export async function load({ locals }) {
	// Allow access to about page even without login, but provide user data if available
	return {
		user: locals.user || null
	};
}