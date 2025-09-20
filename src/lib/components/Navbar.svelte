<script>
	import { User, Menu, Sun, Moon, LogOut, BarChart3, Clock } from 'lucide-svelte';
	
	export let user;
	export let showDrawerToggle = true;
	export let title = '';
	export let homeUrl = '';
	
	// Computed properties
	$: isAdmin = user?.role === 'admin';
	$: displayTitle = title || (isAdmin ? 'Admin Panel - Absen Guru' : 'Absen Guru');
	$: defaultHomeUrl = homeUrl || (isAdmin ? '/admin' : '/guru');
</script>

<div class="navbar bg-base-100 shadow-sm sticky top-0 z-30">
	<div class="flex-1 min-w-0 flex items-center">
		{#if showDrawerToggle}
			<div class="flex-none lg:hidden">
				<label for="my-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost drawer-button mr-2">
					<Menu class="w-6 h-6" />
				</label>
			</div>
		{/if}
		
		<a class="btn btn-ghost normal-case min-w-0 flex-1 justify-start" href={defaultHomeUrl}>
			{#if isAdmin}
				<BarChart3 class="w-5 h-5 flex-shrink-0" />
			{:else}
				<Clock class="w-5 h-5 flex-shrink-0" />
			{/if}
			<span class="ml-2 truncate text-base font-semibold">
				{isAdmin ? 'Admin Panel' : 'Absen Guru'}
			</span>
		</a>
	</div>
	
	<div class="flex gap-2">
		<!-- Theme Controller -->
		<label class="swap swap-rotate">
			<input type="checkbox" class="theme-controller" value="dark" />
			<Sun class="swap-off h-6 w-6 fill-current" />
			<Moon class="swap-on h-6 w-6 fill-current" />
		</label>
		
		<!-- User Profile Dropdown -->
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
				<div class="w-10 rounded-full">
					<div class="avatar placeholder">
						<div class="bg-neutral text-neutral-content rounded-full w-10 h-10">
							<span class="text-sm font-medium">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
						</div>
					</div>
				</div>
			</div>
			<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
				<li>
					<a href="/profile" class="justify-between">
						<div class="flex items-center gap-2">
							<User class="w-4 h-4" />
							Profile
						</div>
						<span class="badge badge-sm">{isAdmin ? 'Admin' : 'Guru'}</span>
					</a>
				</li>
				<li>
					<a href="/logout" data-sveltekit-preload-data="false">
						<LogOut class="w-4 h-4" />
						Logout
					</a>
				</li>
			</ul>
		</div>
	</div>
</div>