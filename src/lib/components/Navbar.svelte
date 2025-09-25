<script>
	import { User, Menu, LogOut, BarChart3, Clock } from 'lucide-svelte';
	import ThemeController from './ThemeController.svelte';
	
	/**
	 * @typedef {Object} Props
	 * @property {any} user
	 * @property {boolean} [showDrawerToggle]
	 * @property {string} [title]
	 * @property {string} [homeUrl]
	 */

	/** @type {Props} */
	let {
		user,
		showDrawerToggle = true,
		title = '',
		homeUrl = ''
	} = $props();
	
	// Computed properties
	let isAdmin = $derived(user?.role === 'admin');
	let displayTitle = $derived(title || (isAdmin ? 'Admin Panel - Absen Guru' : 'Absen Guru'));
	let defaultHomeUrl = $derived(homeUrl || (isAdmin ? '/admin' : '/guru'));
</script>

<div class="navbar bg-base-100 shadow-sm sticky top-0 z-30 px-2 sm:px-4">
	<!-- Mobile & Desktop Left Section -->
	<div class="flex-1 flex items-center min-w-0">
		{#if showDrawerToggle}
			<!-- Mobile Drawer Toggle -->
			<div class="flex-none lg:hidden">
				<label for="my-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost btn-sm drawer-button">
					<Menu class="w-5 h-5" />
				</label>
			</div>
		{/if}
		
		<!-- Brand/Logo Section -->
		<a class="btn btn-ghost normal-case h-auto py-2 px-3 min-w-0 flex-shrink overflow-hidden" href={defaultHomeUrl}>
			<div class="flex items-center gap-2 sm:gap-3 min-w-0 w-full">
				<!-- Icon -->
				<div class="flex-shrink-0">
					{#if isAdmin}
						<BarChart3 class="w-4 h-4 sm:w-5 sm:h-5" />
					{:else}
						<Clock class="w-4 h-4 sm:w-5 sm:h-5" />
					{/if}
				</div>
				
				<!-- Text with responsive sizing -->
				<div class="min-w-0 flex-1">
					<p class="text-sm sm:text-base font-semibold truncate leading-tight">
						<span class="hidden sm:inline">
							{isAdmin ? 'Admin Panel' : 'Absen Guru'}
						</span>
						<span class="sm:hidden">
							{isAdmin ? 'Admin' : 'Absen'}
						</span>
					</p>
				</div>
			</div>
		</a>
	</div>
	
	<!-- Right Section -->
	<div class="flex-none">
		<div class="flex items-center gap-1 sm:gap-2">
			<!-- Theme Controller -->
			<ThemeController />
			
			<!-- User Profile Dropdown or Login Link -->
			{#if user}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-sm sm:btn-md hover:scale-105 transition-transform duration-200">
					<div class="avatar">
						<div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
							<div class="bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-full w-full h-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
								<!-- Background pattern -->
								<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
								
								<!-- User initial -->
								<span class="text-xs sm:text-sm font-bold relative z-10 drop-shadow-sm">
									{user?.name?.charAt(0)?.toUpperCase() || 'U'}
								</span>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Dropdown Menu -->
				<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-48 sm:w-52 p-2 shadow-lg border border-base-200">
					<!-- User Info Header -->
					<li class="menu-title px-3 py-2">
						<div class="flex flex-col">
							<span class="font-medium text-base-content truncate">
								{user?.name || 'User'}
							</span>
							<span class="text-xs text-base-content/60">
								{user?.email || ''}
							</span>
						</div>
					</li>
					
					<div class="divider my-1"></div>
					
					<!-- Menu Items -->
					<li>
						<a href="/profile" class="flex items-center justify-between py-2">
							<div class="flex items-center gap-2">
								<User class="w-4 h-4" />
								<span>Profile</span>
							</div>
							<span class="badge badge-sm badge-outline">
								{isAdmin ? 'Admin' : 'Guru'}
							</span>
						</a>
					</li>
					
					<div class="divider my-1"></div>
					
					<li>
						<a href="/logout" data-sveltekit-preload-data="false" class="text-error hover:bg-error/10 py-2">
							<LogOut class="w-4 h-4" />
							<span>Logout</span>
						</a>
					</li>
				</ul>
			</div>
			{:else}
			<!-- Login Link for non-authenticated users -->
			<a href="/login" class="btn btn-primary btn-sm">
				<User class="w-4 h-4" />
				Login
			</a>
			{/if}
		</div>
	</div>
</div>