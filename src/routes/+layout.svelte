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
	
	// PWA install prompt
	let deferredPrompt = null;
	let showInstallBanner = false;
	
	onMount(() => {
		// Register service worker
		if (browser && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js');
		}
		
		// Handle PWA install prompt
		if (browser) {
			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				deferredPrompt = e;
				showInstallBanner = true;
			});
		}
	});
	
	async function installPWA() {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				showInstallBanner = false;
			}
			deferredPrompt = null;
		}
	}
	
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
	<!-- PWA Install Banner -->
	{#if showInstallBanner}
		<div class="alert alert-info m-4">
			<div>
				<h3 class="font-bold">Install Absen Guru</h3>
				<div class="text-xs">Install aplikasi ini di perangkat Anda untuk pengalaman yang lebih baik!</div>
			</div>
			<div class="flex-none">
				<button class="btn btn-sm btn-ghost" on:click={() => showInstallBanner = false}>Nanti</button>
				<button class="btn btn-sm btn-primary" on:click={installPWA}>Install</button>
			</div>
		</div>
	{/if}
	
	<slot />
</div>