<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { showSuccess, showWarning } from '$lib/stores/toast.js';

	let isOnline = $state(true);
	let hasBeenOffline = $state(false);

	onMount(() => {
		if (!browser) return;

		// Initial status
		isOnline = navigator.onLine;

		function handleOnline() {
			isOnline = true;
			
			// Hanya tampilkan toast "Kembali online" jika sebelumnya pernah offline
			if (hasBeenOffline) {
				showSuccess('Kembali online! Sinkronisasi data dimulai...');
			}
		}

		function handleOffline() {
			isOnline = false;
			hasBeenOffline = true;
			showWarning('Mode offline aktif - Data akan disimpan lokal. Jangan hapus cache dan history browser sebelum sync');
		}

		// Event listeners
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Cleanup
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});

	// Export reactive values untuk digunakan komponen lain
	export { isOnline };
</script>

<!-- Component ini tidak render apapun, hanya menangani event -->
<!-- Status online/offline tersedia via exported isOnline variable -->