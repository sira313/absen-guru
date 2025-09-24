<!-- @migration-task Error while migrating Svelte code: `$:` is not allowed in runes mode, use `$derived` or `$effect` instead
https://svelte.dev/e/legacy_reactive_statement_invalid -->
<script>
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	// Use Svelte 5 $props() runes - automatically handles all SvelteKit props
	let { data, children, ...restProps } = $props();
	
	let user = $derived(data.user);
	
	// Register service worker (only in production)
	onMount(() => {
		if (browser && 'serviceWorker' in navigator && import.meta.env.PROD) {
			navigator.serviceWorker.register('/service-worker.js')
				.then(registration => {
					console.log('SW registered successfully');
				})
				.catch(error => {
					console.log('SW registration failed');
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

<div class="min-h-screen bg-base-200">
	{@render children()}
</div>