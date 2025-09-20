<script>
	export let data;
	$: ({ user } = data);
</script>

<div class="min-h-screen">
	<!-- Navigation -->
	<nav class="navbar">
		<div class="navbar-start">
			<div class="dropdown">
				<button class="btn-ghost btn-circle">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				</button>
				<ul class="dropdown-menu">
					<li><a href="/guru">Dashboard</a></li>
					<li><a href="/guru/riwayat">Riwayat Absensi</a></li>
				</ul>
			</div>
		</div>
		
		<div class="navbar-center">
			<a href="/guru" class="navbar-brand">Absen Guru</a>
		</div>
		
		<div class="navbar-end">
			<div class="user-dropdown">
				<button class="user-avatar">
					<span class="user-initial">{user.name.charAt(0).toUpperCase()}</span>
				</button>
				<ul class="user-menu">
					<li class="user-info">
						<span class="user-name">{user.name}</span>
						<span class="user-role">guru</span>
					</li>
					<li><a href="/profile">Profile</a></li>
					<li><a href="/logout" data-sveltekit-preload-data="false">Logout</a></li>
				</ul>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="main-content">
		<slot />
	</main>
</div>