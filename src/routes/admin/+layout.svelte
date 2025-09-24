<script>
	import AppLayout from '$lib/components/AppLayout.svelte';
	
	export let data;
	
	$: ({ user } = data);
</script>

<AppLayout {user}>
	<slot />
</AppLayout>