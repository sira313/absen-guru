<script>
	import { Menu, User, LogOut, Calendar, Clock } from 'lucide-svelte';
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
				<a class="btn btn-ghost text-xl" href="/guru">
					<Clock class="w-6 h-6 mr-2" />
					Absen Guru
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
							<span class="text-xs opacity-60">Guru</span>
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
				<div class="text-xl font-bold text-center mb-6">Menu Guru</div>
				<ul class="menu p-0 [&_li>*]:rounded-none">
					<li>
						<a href="/guru" class="active:bg-primary active:text-primary-content">
							<Clock class="w-5 h-5" />
							Dashboard
						</a>
					</li>
					<li>
						<a href="/guru/riwayat">
							<Calendar class="w-5 h-5" />
							Riwayat Absensi
						</a>
					</li>
				</ul>
			</div>
		</aside>
	</div>
</div>