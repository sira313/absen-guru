<script>
	import { BarChart3, FileText, Users, Clock, Calendar, User, Settings } from 'lucide-svelte';
	
	export let user;
	
	$: isAdmin = user?.role === 'admin';
</script>

<div class="drawer-side">
	<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
	<ul class="menu text-base-content min-h-full w-80 p-4 bg-base-300">
		<!-- Header -->
		<div class="mb-6">
			<div class="text-xl font-bold text-center">
				{#if isAdmin}
					Menu Admin
				{:else}
					Menu Guru
				{/if}
			</div>
			<div class="text-center text-sm opacity-70 mt-2">
				{user?.name || 'User'}
			</div>
		</div>
		
		<!-- Menu items -->
		{#if isAdmin}
			<li>
				<a href="/admin">
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
			<li>
				<a href="/admin/pengaturan">
					<Settings class="w-5 h-5" />
					Pengaturan
				</a>
			</li>
		{:else}
			<li>
				<a href="/guru">
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
		{/if}
	</ul>
</div>