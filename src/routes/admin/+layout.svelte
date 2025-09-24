<script>
	import AppLayout from '$lib/components/AppLayout.svelte';
	
	let { data, children } = $props();
	
	let { user } = $derived(data);
</script>

<AppLayout {user}>
	{@render children?.()}
</AppLayout>