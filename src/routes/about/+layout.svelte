<script>
	import AppLayout from '$lib/components/AppLayout.svelte';
	
	let { data, children } = $props();
	let { user } = data;
</script>

<AppLayout {user} title="Tentang Aplikasi">
	{@render children()}
</AppLayout>