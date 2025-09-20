<script>
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { Users, FileText, Settings, TrendingUp, TrendingDown, Clock, UserCheck } from 'lucide-svelte';
	
	export let data;
	$: stats = data.stats;
	$: recentAttendance = data.recentAttendance;
	$: users = data.users;
	
	// Ignore unused SvelteKit props
	$$restProps;
</script>

<svelte:head>
	<title>Dashboard Admin - Absen Guru</title>
</svelte:head>

<div class="container mx-auto p-4 space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold text-base-content">Dashboard Admin</h1>
		<p class="text-lg text-base-content/70 mt-2">Kelola dan pantau absensi guru</p>
	</div>

	<!-- Statistik Overview -->
	<div class="stats shadow w-full">
		<div class="stat">
			<div class="stat-figure text-primary">
				<FileText class="w-8 h-8" />
			</div>
			<div class="stat-title">Total Record</div>
			<div class="stat-value text-primary">{stats.total_records || 0}</div>
		</div>
		<div class="stat">
			<div class="stat-figure text-success">
				<UserCheck class="w-8 h-8" />
			</div>
			<div class="stat-title">Hadir</div>
			<div class="stat-value text-success">{stats.hadir || 0}</div>
		</div>
		<div class="stat">
			<div class="stat-figure text-warning">
				<Clock class="w-8 h-8" />
			</div>
			<div class="stat-title">Terlambat</div>
			<div class="stat-value text-warning">{stats.terlambat || 0}</div>
		</div>
		<div class="stat">
			<div class="stat-figure text-error">
				<TrendingDown class="w-8 h-8" />
			</div>
			<div class="stat-title">Tidak Hadir</div>
			<div class="stat-value text-error">{stats.tidak_hadir || 0}</div>
		</div>
	</div>

	<!-- Menu Admin -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-4">Menu Admin</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<a href="/admin/users" class="btn btn-outline btn-lg">
					<Users class="w-5 h-5 mr-2" />
					Kelola User
				</a>
				<a href="/admin/laporan" class="btn btn-outline btn-lg">
					<FileText class="w-5 h-5 mr-2" />
					Laporan Detail
				</a>
				<a href="/admin/settings" class="btn btn-outline btn-lg">
					<Settings class="w-5 h-5 mr-2" />
					Pengaturan
				</a>
			</div>
		</div>
	</div>

	<!-- Absensi Terbaru -->
	{#if recentAttendance && recentAttendance.length > 0}
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-4">Absensi Terbaru</h2>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
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
								<div class="badge {attendance.status === 'hadir' ? 'badge-success' : attendance.status === 'terlambat' ? 'badge-warning' : 'badge-error'}">
									{attendance.status === 'hadir' ? 'Hadir' : attendance.status === 'terlambat' ? 'Terlambat' : 'Tidak Hadir'}
								</div>
							</td>
							<td class="text-sm opacity-70">{attendance.notes || '-'}</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	{/if}

	<!-- Daftar Guru -->
	{#if users && users.length > 0}
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-4">Daftar Guru Aktif</h2>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
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
								<div class="badge {user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}">
									{user.role === 'admin' ? 'Admin' : 'Guru'}
								</div>
							</td>
							<td>
								<div class="badge badge-success">Aktif</div>
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	{/if}
</div>