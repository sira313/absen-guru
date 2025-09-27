<!-- @migration-task Error while migrating Svelte code: `$:` is not allowed in runes mode, use `$derived` or `$effect` instead
https://svelte.dev/e/legacy_reactive_statement_invalid -->
<script>
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import OnlineDetector from '$lib/components/OnlineDetector.svelte';
	
	// Use Svelte 5 $props() runes - automatically handles all SvelteKit props
	let { data, children, ...restProps } = $props();
	
	let user = $derived(data.user);
	
	// Register service worker for offline functionality
	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js')
				.then(registration => {
					console.log('Service Worker registered successfully:', registration);
					
					// Listen for updates
					registration.addEventListener('updatefound', () => {
						const newWorker = registration.installing;
						console.log('Service Worker update found');
						
						if (newWorker) {
							newWorker.addEventListener('statechange', () => {
								if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
									console.log('New Service Worker available, please refresh');
									// You could show a notification here to refresh
								}
							});
						}
					});
				})
				.catch(error => {
					console.error('Service Worker registration failed:', error);
				});
		}
	});
</script>

<svelte:head>
	<title>Absen Guru - Sistem Absensi Guru</title>
	<meta name="description" content="Aplikasi absensi untuk guru" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="alternate icon" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

<!-- Online/Offline Detection with Toast Notifications -->
<OnlineDetector />

<!-- Toast Notifications -->
<ToastContainer />

<div class="min-h-screen bg-base-200">
	{@render children()}
</div>