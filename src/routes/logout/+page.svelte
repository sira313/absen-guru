<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(async () => {
		try {
			// Try to logout via server endpoint
			const response = await fetch('/logout', {
				method: 'GET',
				credentials: 'include'
			});
			
			if (response.redirected) {
				// Handle redirect manually if needed
				goto('/login');
			} else {
				// Direct navigation if server redirect doesn't work
				goto('/login');
			}
		} catch (error) {
			console.error('Logout error:', error);
			// Fallback to login page
			goto('/login');
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<div class="loading loading-spinner loading-lg text-primary"></div>
		<p class="mt-4">Logging out...</p>
	</div>
</div>