<script>
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	export let data;
	
	// Handle SvelteKit props that are automatically passed to layouts
	export let params = undefined;
	export let url = undefined;
	export let route = undefined;
	export let form = undefined;
	
	$: user = data.user;
	
	// Register service worker
	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js')
				.then(registration => {
					console.log('SW registered successfully');
				})
				.catch(error => {
					console.log('SW registration failed');
				});
		}
	});
	
	// Mark unused props to avoid warnings
	params, url, route, form;
</script>

<svelte:head>
	<title>Absen Guru - Sistem Absensi Guru</title>
	<meta name="description" content="Aplikasi absensi untuk guru" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="alternate icon" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

<div class="min-h-screen bg-base-200">
	<slot />
</div>