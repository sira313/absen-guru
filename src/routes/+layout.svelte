<script>
	import '../app.css';
	export let data;
	
	$: user = data.user;
</script>

<svelte:head>
	<title>Absen Guru - Sistem Absensi Guru</title>
	<meta name="description" content="Aplikasi absensi untuk guru" />
</svelte:head>

<div class="min-h-screen">
	<slot />
</div>

<style>
	:global(html) {
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>