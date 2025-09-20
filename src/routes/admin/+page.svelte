<script>
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	
	export let data;
	
	$: stats = data.stats;
	$: recentAttendance = data.recentAttendance;
	$: users = data.users;
</script>

<svelte:head>
	<title>Dashboard Admin - Absen Guru</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold">Dashboard Admin</h1>
		<p class="text-lg opacity-70">Kelola dan pantau absensi guru</p>
	</div>

	<!-- Statistik Overview -->
	<div class="stats mb-6">
		<div class="stat">
			<div class="stat-value">{stats.total_records || 0}</div>
			<div class="stat-title">Total Record</div>
		</div>
		<div class="stat">
			<div class="stat-value text-green-600">{stats.hadir || 0}</div>
			<div class="stat-title">Hadir</div>
		</div>
		<div class="stat">
			<div class="stat-value text-yellow-600">{stats.terlambat || 0}</div>
			<div class="stat-title">Terlambat</div>
		</div>
		<div class="stat">
			<div class="stat-value text-red-600">{stats.tidak_hadir || 0}</div>
			<div class="stat-title">Tidak Hadir</div>
		</div>
	</div>

	<!-- Menu Admin -->
	<div class="card">
		<div class="card-header">
			<h2 class="card-title">Menu Admin</h2>
		</div>
		<div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
			<a href="/admin/users" class="btn btn-outline">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
				</svg>
				Kelola User
			</a>
			<a href="/admin/laporan" class="btn btn-outline">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				</svg>
				Laporan Detail
			</a>
			<a href="/admin/settings" class="btn btn-outline">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
				</svg>
				Pengaturan
			</a>
		</div>
	</div>

	<!-- Absensi Terbaru -->
	{#if recentAttendance && recentAttendance.length > 0}
	<div class="card">
		<div class="card-header">
			<h2 class="card-title">Absensi Terbaru</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Nama Guru</th>
						<th>Tanggal</th>
						<th>Waktu Masuk</th>
						<th>Status</th>
						<th>Catatan</th>
					</tr>
				</thead>
				<tbody>
					{#each recentAttendance as attendance}
					<tr>
						<td class="font-medium">{attendance.user?.fullName || 'N/A'}</td>
						<td>{format(new Date(attendance.date), 'dd MMM yyyy', { locale: localeId })}</td>
						<td>{attendance.check_in_time || '-'}</td>
						<td>
							<span class="badge {attendance.status === 'hadir' ? 'success' : attendance.status === 'terlambat' ? 'warning' : 'error'}">
								{attendance.status === 'hadir' ? 'Hadir' : attendance.status === 'terlambat' ? 'Terlambat' : 'Tidak Hadir'}
							</span>
						</td>
						<td class="text-sm opacity-70">{attendance.notes || '-'}</td>
					</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{/if}

	<!-- Daftar Guru -->
	{#if users && users.length > 0}
	<div class="card">
		<div class="card-header">
			<h2 class="card-title">Daftar Guru Aktif</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Nama</th>
						<th>Email</th>
						<th>Role</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
					<tr>
						<td class="font-medium">{user.fullName}</td>
						<td>{user.email}</td>
						<td>
							<span class="badge {user.role === 'admin' ? 'primary' : 'secondary'}">
								{user.role === 'admin' ? 'Admin' : 'Guru'}
							</span>
						</td>
						<td>
							<span class="badge success">Aktif</span>
						</td>
					</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{/if}
</div>