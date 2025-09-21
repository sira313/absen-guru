<script>
	import AppLayout from '$lib/components/AppLayout.svelte';
	
	export let data;
	
	// Handle SvelteKit props that are automatically passed to layouts
	export let params = undefined;
	export let url = undefined;
	export let route = undefined;
	export let form = undefined;
	
	$: ({ user } = data);
	
	// Mark unused props to avoid warnings
	params, url, route, form;
</script>

<AppLayout {user}>
	<slot />
</AppLayout>