<script>
	import { Menu, User, LogOut, BarChart3 } from 'lucide-svelte';
	export let data;
	$: ({ user } = data);
	
	// Ignore unused SvelteKit props
	$$restProps;
</script>

<div class="drawer lg:drawer-open">
	<input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
	
	<!-- Page content here -->
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div class="navbar bg-base-300 w-full">
			<div class="flex-none lg:hidden">
				<label for="drawer-toggle" aria-label="open sidebar" class="btn btn-square btn-ghost">
					<Menu class="w-6 h-6" />
				</label>
			</div>
			<div class="flex-1">
				<a class="btn btn-ghost text-xl" href="/admin">
					<BarChart3 class="w-6 h-6 mr-2" />
					Admin Panel - Absen Guru
				</a>
			</div>
			<div class="flex-none">
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
						<div class="avatar placeholder">
							<div class="bg-neutral text-neutral-content rounded-full w-10">
								<span class="text-sm">{user.name.charAt(0).toUpperCase()}</span>
							</div>
						</div>
					</div>
					<ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
						<li class="menu-title">
							<span>{user.name}</span>
							<span class="text-xs opacity-60">Administrator</span>
						</li>
						<li><a href="/profile"><User class="w-4 h-4" />Profile</a></li>
						<li><a href="/logout" data-sveltekit-preload-data="false"><LogOut class="w-4 h-4" />Logout</a></li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Page content -->
		<main class="flex-1 p-4 lg:p-6">
			<slot />
		</main>
	</div>
	
	<!-- Sidebar content here -->
	<div class="drawer-side">
		<label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
		<aside class="bg-base-200 min-h-full w-64">
			<div class="p-4">
				<div class="text-xl font-bold text-center mb-6">Menu Admin</div>
				<ul class="menu p-0 [&_li>*]:rounded-none">
					<li>
						<a href="/admin" class="active:bg-primary active:text-primary-content">
							<BarChart3 class="w-5 h-5" />
							Dashboard
						</a>
					</li>
					<li>
						<a href="/admin/laporan">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							Laporan
						</a>
					</li>
					<li>
						<a href="/admin/users">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
							</svg>
							Kelola User
						</a>
					</li>
				</ul>
			</div>
		</aside>
	</div>
</div>