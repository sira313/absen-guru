<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
	export let data;
	
	$: attendanceRecords = data.attendanceRecords;
	$: stats = data.stats;
	$: allUsers = data.allUsers;
	$: filters = data.filters;

	function getStatusBadgeClass(status) {
		switch(status) {
			case 'hadir': return 'badge success';
			case 'terlambat': return 'badge warning';
			case 'tidak_hadir': return 'badge error';
			default: return 'badge';
		}
	}

	function getStatusText(status) {
		switch(status) {
			case 'hadir': return 'Hadir';
			case 'terlambat': return 'Terlambat';
			case 'tidak_hadir': return 'Tidak Hadir';
			default: return status;
		}
	}

	function handleFilterChange() {
		const form = document.getElementById('filterForm');
		const formData = new FormData(form);
		const params = new URLSearchParams();
		
		for (let [key, value] of formData.entries()) {
			if (value) params.set(key, value);
		}
		
		goto(`/admin/laporan?${params.toString()}`);
	}

	function exportToCSV() {
		const csvContent = [
			['Nama', 'Tanggal', 'Waktu Masuk', 'Waktu Keluar', 'Status', 'Catatan'],
			...attendanceRecords.map(record => [
				record.user?.fullName || '',
				record.date,
				record.check_in_time || '',
				record.check_out_time || '',
				getStatusText(record.status),
				record.notes || ''
			])
		].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `laporan_absensi_${filters.startDate}_${filters.endDate}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<svelte:head>
	<title>Laporan Absensi - Admin</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">Laporan Absensi</h1>
			<p class="text-lg opacity-70">Detail laporan absensi guru</p>
		</div>
		<div class="flex gap-2">
			<button on:click={exportToCSV} class="btn btn-outline">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				</svg>
				Export CSV
			</button>
			<a href="/admin" class="btn btn-outline">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
				</svg>
				Kembali
			</a>
		</div>
	</div>

	<!-- Filter Section -->
	<div class="card">
		<div class="card-header">
			<h2 class="card-title">Filter Laporan</h2>
		</div>
		<div class="p-6">
			<form id="filterForm" class="grid grid-cols-1 md:grid-cols-5 gap-4">
				<div>
					<label for="start_date" class="block text-sm font-medium mb-2">Tanggal Mulai</label>
					<input 
						id="start_date"
						type="date" 
						name="start_date" 
						value={filters.startDate}
						class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				
				<div>
					<label for="end_date" class="block text-sm font-medium mb-2">Tanggal Akhir</label>
					<input 
						id="end_date"
						type="date" 
						name="end_date" 
						value={filters.endDate}
						class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="user_id" class="block text-sm font-medium mb-2">Guru</label>
					<select 
						id="user_id"
						name="user_id" 
						class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Semua Guru</option>
						{#each allUsers as user}
							<option value={user.id} selected={filters.userId == user.id}>
								{user.fullName}
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="status" class="block text-sm font-medium mb-2">Status</label>
					<select 
						id="status"
						name="status" 
						class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Semua Status</option>
						<option value="hadir" selected={filters.status === 'hadir'}>Hadir</option>
						<option value="terlambat" selected={filters.status === 'terlambat'}>Terlambat</option>
						<option value="tidak_hadir" selected={filters.status === 'tidak_hadir'}>Tidak Hadir</option>
					</select>
				</div>

				<div class="flex items-end">
					<button 
						type="button" 
						on:click={handleFilterChange}
						class="btn btn-primary w-full"
					>
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
						</svg>
						Filter
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Statistics Summary -->
	<div class="stats">
		<div class="stat">
			<div class="stat-value">{stats.total}</div>
			<div class="stat-title">Total Record</div>
		</div>
		<div class="stat">
			<div class="stat-value text-green-600">{stats.hadir}</div>
			<div class="stat-title">Hadir</div>
		</div>
		<div class="stat">
			<div class="stat-value text-yellow-600">{stats.terlambat}</div>
			<div class="stat-title">Terlambat</div>
		</div>
		<div class="stat">
			<div class="stat-value text-red-600">{stats.tidak_hadir}</div>
			<div class="stat-title">Tidak Hadir</div>
		</div>
	</div>

	<!-- Attendance Records Table -->
	<div class="card">
		<div class="card-header">
			<h2 class="card-title">Detail Absensi</h2>
			<p class="text-sm opacity-70">Menampilkan {attendanceRecords.length} record</p>
		</div>
		<div class="overflow-x-auto">
			{#if attendanceRecords.length > 0}
				<table class="table">
					<thead>
						<tr>
							<th>Nama Guru</th>
							<th>Tanggal</th>
							<th>Waktu Masuk</th>
							<th>Waktu Keluar</th>
							<th>Status</th>
							<th>Catatan</th>
						</tr>
					</thead>
					<tbody>
						{#each attendanceRecords as record}
						<tr>
							<td class="font-medium">{record.user?.fullName || 'N/A'}</td>
							<td>{format(new Date(record.date), 'dd MMM yyyy', { locale: localeId })}</td>
							<td class="font-mono">{record.check_in_time || '-'}</td>
							<td class="font-mono">{record.check_out_time || '-'}</td>
							<td>
								<span class="badge {getStatusBadgeClass(record.status)}">
									{getStatusText(record.status)}
								</span>
							</td>
							<td class="text-sm opacity-70 max-w-xs truncate">
								{record.notes || '-'}
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="p-8 text-center">
					<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
					<h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
					<p class="text-gray-500">Tidak ditemukan record absensi dengan filter yang dipilih.</p>
				</div>
			{/if}
		</div>
	</div>
</div>