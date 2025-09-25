<script>
	import { page } from '$app/stores';
	import Navbar from './Navbar.svelte';
	import Sidebar from './Sidebar.svelte';
	
	/**
	 * @typedef {Object} Props
	 * @property {any} user
	 * @property {boolean} [showSidebar]
	 * @property {string} [navbarTitle]
	 * @property {string} [navbarHomeUrl]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		user,
		showSidebar = true,
		navbarTitle = '',
		navbarHomeUrl = '',
		children
	} = $props();
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
			{@render children?.()}
		</main>
	</div>
	
	{#if showSidebar && user}
		<Sidebar {user} />
	{/if}
</div>