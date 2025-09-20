<script>
	import { Menu, User, LogOut, BarChart3, FileText, Users, Sun, Moon } from 'lucide-svelte';
	export let data;
	$: ({ user } = data);
	
	// Ignore unused SvelteKit props
	$$restProps;
</script>

<div class="drawer lg:drawer-open">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	
	<div class="drawer-content">
		<!-- Navbar -->
		<div class="navbar bg-base-100 shadow-sm sticky top-0 z-30">
			<div class="flex-1">
				<div class="flex-none lg:hidden">
					<label for="my-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost drawer-button mr-2">
						<Menu class="w-6 h-6" />
					</label>
				</div>
				<a class="btn btn-ghost text-xl" href="/admin">
					<BarChart3 class="w-6 h-6 mr-2" />
					Admin Panel - Absen Guru
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
									<span class="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
								</div>
							</div>
						</div>
					</div>
					<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
						<li>
							<a href="/profile" class="justify-between">
								Profile
								<span class="badge badge-sm">Admin</span>
							</a>
						</li>
						<li><a href="/logout" data-sveltekit-preload-data="false">Logout</a></li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Page content -->
		<main class="flex-1 p-4 lg:p-6">
			<slot />
		</main>
	</div>
	
	<div class="drawer-side">
		<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu text-base-content min-h-full w-80 p-4 bg-base-300">
			<!-- Header -->
			<div class="mb-6">
				<div class="text-xl font-bold text-center">Menu Admin</div>
			</div>
			
			<!-- Menu items -->
			<li>
				<a href="/admin" class="active:bg-primary active:text-primary-content">
					<BarChart3 class="w-5 h-5" />
					Dashboard
				</a>
			</li>
			<li>
				<a href="/admin/laporan">
					<FileText class="w-5 h-5" />
					Laporan
				</a>
			</li>
			<li>
				<a href="/admin/users">
					<Users class="w-5 h-5" />
					Kelola User
				</a>
			</li>
		</ul>
	</div>
</div>