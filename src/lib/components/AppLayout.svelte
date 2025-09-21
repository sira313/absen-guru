<script>
	import { page } from '$app/stores';
	import Navbar from './Navbar.svelte';
	import Sidebar from './Sidebar.svelte';
	
	export let user;
	export let showSidebar = true;
	export let navbarTitle = '';
	export let navbarHomeUrl = '';
</script>

<div class="drawer {showSidebar ? 'lg:drawer-open' : ''}">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	
	<div class="drawer-content">
		<!-- Navbar -->
		<Navbar 
			{user} 
			showDrawerToggle={showSidebar}
			title={navbarTitle}
			homeUrl={navbarHomeUrl}
		/>
		
		<!-- Page content -->
		<main class="flex-1 p-4 lg:p-6">
			<slot />
		</main>
	</div>
	
	{#if showSidebar}
		<Sidebar {user} />
	{/if}
</div>