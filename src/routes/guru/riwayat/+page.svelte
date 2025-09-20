<script>
	export let data;
	
	$: ({ user, attendanceRecords, stats, currentMonth, currentYear, monthName } = data);
	
	// Helper function to format date
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	// Helper function to format time
	function formatTime(timeString) {
		if (!timeString) return '-';
		return timeString.substring(0, 5); // HH:MM format
	}
	
	// Helper function to get status badge class
	function getStatusClass(status) {
		switch (status) {
			case 'hadir': return 'badge-success';
			case 'terlambat': return 'badge-warning';
			case 'tidak_hadir': return 'badge-error';
			case 'izin': return 'badge-info';
			case 'sakit': return 'badge-warning';
			default: return 'badge-secondary';
		}
	}
	
	// Helper function to get status text
	function getStatusText(status) {
		switch (status) {
			case 'hadir': return 'Hadir';
			case 'terlambat': return 'Terlambat';
			case 'tidak_hadir': return 'Tidak Hadir';
			case 'izin': return 'Izin';
			case 'sakit': return 'Sakit';
			default: return status;
		}
	}
	
	// Generate months for dropdown
	const months = Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		label: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2024, i))
	}));
	
	// Generate years for dropdown
	const currentYearNum = new Date().getFullYear();
	const years = Array.from({ length: 3 }, (_, i) => currentYearNum - i);
	
	function handleFilterChange() {
		const month = document.getElementById('month').value;
		const year = document.getElementById('year').value;
		window.location.href = `/guru/riwayat?month=${month}&year=${year}`;
	}
</script>

<svelte:head>
	<title>Riwayat Absensi - {user.name}</title>
</svelte:head>

<!-- Header -->
<div class="flex justify-between items-center mb-6">
	<div>
		<h1 class="text-3xl font-bold">Riwayat Absensi</h1>
		<p class="text-lg opacity-70">{monthName} {currentYear}</p>
	</div>
		<div class="flex gap-2">
			<a href="/guru" class="btn btn-outline">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
				</svg>
				Kembali
			</a>
		</div>
	</div>

	<!-- Filter Section -->
	<div class="card mb-6">
		<div class="card-header">
			<h2 class="card-title">Filter Periode</h2>
		</div>
		<div class="flex gap-4 items-end">
			<div class="form-group">
				<label for="month" class="label">Bulan</label>
				<select id="month" class="select" bind:value={currentMonth} on:change={handleFilterChange}>
					{#each months as month}
						<option value={month.value}>{month.label}</option>
					{/each}
				</select>
			</div>
			<div class="form-group">
				<label for="year" class="label">Tahun</label>
				<select id="year" class="select" bind:value={currentYear} on:change={handleFilterChange}>
					{#each years as year}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Statistics -->
	<div class="stats mb-6">
		<div class="stat">
			<div class="stat-title">Total Hari</div>
			<div class="stat-value">{stats.total}</div>
			<div class="stat-desc">Hari kerja</div>
		</div>
		<div class="stat">
			<div class="stat-title">Hadir</div>
			<div class="stat-value text-green-600">{stats.hadir}</div>
			<div class="stat-desc">Hari hadir tepat waktu</div>
		</div>
		<div class="stat">
			<div class="stat-title">Terlambat</div>
			<div class="stat-value text-yellow-600">{stats.terlambat}</div>
			<div class="stat-desc">Hari terlambat</div>
		</div>
		<div class="stat">
			<div class="stat-title">Tidak Hadir</div>
			<div class="stat-value text-red-600">{stats.tidak_hadir}</div>
			<div class="stat-desc">Hari tidak hadir</div>
		</div>
	</div>

	<!-- Attendance Records -->
	<div class="card">
		<div class="card-header">
			<h2 class="card-title">Detail Absensi</h2>
			<p class="text-sm opacity-70">
				{#if attendanceRecords.length > 0}
					Menampilkan {attendanceRecords.length} record
				{:else}
					Tidak ada data absensi
				{/if}
			</p>
		</div>

		{#if attendanceRecords.length > 0}
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>Tanggal</th>
							<th>Jam Masuk</th>
							<th>Jam Keluar</th>
							<th>Status</th>
							<th>Catatan</th>
						</tr>
					</thead>
					<tbody>
						{#each attendanceRecords as record}
							<tr>
								<td class="font-medium">{formatDate(record.date)}</td>
								<td>{formatTime(record.checkIn)}</td>
								<td>{formatTime(record.checkOut)}</td>
								<td>
									<span class="badge {getStatusClass(record.status)}">
										{getStatusText(record.status)}
									</span>
								</td>
								<td class="max-w-xs truncate">
									{record.notes || '-'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="text-center py-8">
				<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				</svg>
				<h3 class="text-xl font-semibold mb-2">Belum Ada Data</h3>
				<p class="text-gray-600">Tidak ada data absensi untuk periode yang dipilih.</p>
			</div>
		{/if}
	</div>