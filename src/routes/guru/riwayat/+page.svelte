<script>
	import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-svelte';
	
	export let data;
	
	$: ({ user, attendanceRecords, stats, currentMonth, currentYear, monthName } = data);
	
	// Ignore unused SvelteKit props
	$$restProps;
	
	// Pagination state
	let currentPage = 1;
	const itemsPerPage = 10;
	
	// Computed pagination values
	$: totalItems = attendanceRecords.length;
	$: totalPages = Math.ceil(totalItems / itemsPerPage);
	$: startIndex = (currentPage - 1) * itemsPerPage;
	$: endIndex = Math.min(startIndex + itemsPerPage, totalItems);
	$: paginatedRecords = attendanceRecords.slice(startIndex, endIndex);
	
	// Pagination functions
	function goToPage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}
	
	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
		}
	}
	
	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}
	
	// Reset pagination when data changes
	$: if (attendanceRecords) {
		currentPage = 1;
	}
	
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

<div class="container mx-auto p-4 lg:p-6 space-y-6 max-w-6xl">

	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-2xl lg:text-3xl font-bold text-base-content">Riwayat Absensi</h1>
			<p class="text-base lg:text-lg text-base-content/70">{monthName} {currentYear}</p>
		</div>
		<div class="flex gap-2">
			<a href="/guru" class="btn btn-outline btn-sm lg:btn-md">
				<ArrowLeft class="w-4 h-4 mr-2" />
				Kembali
			</a>
		</div>
	</div>

	<!-- Filter Section -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">
				<Calendar class="w-5 h-5" />
				Filter Periode
			</h2>
			<div class="flex flex-col sm:flex-row gap-4 items-end">
				<div class="form-control w-full sm:w-auto">
					<label class="label" for="month">
						<span class="label-text">Bulan</span>
					</label>
					<select id="month" class="select select-bordered w-full sm:w-auto" bind:value={currentMonth} on:change={handleFilterChange}>
						{#each months as month}
							<option value={month.value}>{month.label}</option>
						{/each}
					</select>
				</div>
				<div class="form-control w-full sm:w-auto">
					<label class="label" for="year">
						<span class="label-text">Tahun</span>
					</label>
					<select id="year" class="select select-bordered w-full sm:w-auto" bind:value={currentYear} on:change={handleFilterChange}>
						{#each years as year}
							<option value={year}>{year}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Statistics -->
	<div class="stats stats-vertical lg:stats-horizontal shadow-xl w-full">
		<div class="stat bg-base-100">
			<div class="stat-figure text-secondary">
				<Calendar class="w-8 h-8" />
			</div>
			<div class="stat-title">Total Hari</div>
			<div class="stat-value">{stats.total}</div>
			<div class="stat-desc">Hari kerja</div>
		</div>
		<div class="stat bg-base-100">
			<div class="stat-figure text-success">
				<Clock class="w-8 h-8" />
			</div>
			<div class="stat-title">Hadir</div>
			<div class="stat-value text-success">{stats.hadir}</div>
			<div class="stat-desc">Hari hadir tepat waktu</div>
		</div>
		<div class="stat bg-base-100">
			<div class="stat-figure text-warning">
				<AlertCircle class="w-8 h-8" />
			</div>
			<div class="stat-title">Terlambat</div>
			<div class="stat-value text-warning">{stats.terlambat}</div>
			<div class="stat-desc">Hari terlambat</div>
		</div>
		<div class="stat bg-base-100">
			<div class="stat-figure text-error">
				<AlertCircle class="w-8 h-8" />
			</div>
			<div class="stat-title">Tidak Hadir</div>
			<div class="stat-value text-error">{stats.tidak_hadir}</div>
			<div class="stat-desc">Hari tidak hadir</div>
		</div>
	</div>

	<!-- Attendance Records -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="card-title justify-between">
				<h2>Detail Absensi</h2>
				<div class="text-sm opacity-70 font-normal">
					{#if attendanceRecords.length > 0}
						Menampilkan {startIndex + 1}-{endIndex} dari {totalItems} record
					{:else}
						Tidak ada data absensi
					{/if}
				</div>
			</div>

			{#if attendanceRecords.length > 0}
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Tanggal</th>
								<th>Jam Masuk</th>
								<th>Status</th>
								<th>Catatan</th>
							</tr>
						</thead>
						<tbody>
							{#each paginatedRecords as record}
								<tr class="hover">
									<td class="font-medium">{formatDate(record.date)}</td>
									<td>{formatTime(record.checkIn)}</td>
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
				
				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="flex justify-center items-center gap-2 mt-6">
						<div class="join">
							<!-- Previous button -->
							<button 
								class="join-item btn btn-sm" 
								class:btn-disabled={currentPage === 1}
								on:click={prevPage}
							>
								«
							</button>
							
							<!-- Page numbers -->
							{#each Array(totalPages) as _, i}
								{@const pageNum = i + 1}
								{#if totalPages <= 7 || (pageNum <= 3 || pageNum > totalPages - 3 || Math.abs(pageNum - currentPage) <= 1)}
									<button 
										class="join-item btn btn-sm" 
										class:btn-active={currentPage === pageNum}
										on:click={() => goToPage(pageNum)}
									>
										{pageNum}
									</button>
								{:else if pageNum === 4 && currentPage > 5}
									<button class="join-item btn btn-sm btn-disabled">...</button>
								{:else if pageNum === totalPages - 3 && currentPage < totalPages - 4}
									<button class="join-item btn btn-sm btn-disabled">...</button>
								{/if}
							{/each}
							
							<!-- Next button -->
							<button 
								class="join-item btn btn-sm" 
								class:btn-disabled={currentPage === totalPages}
								on:click={nextPage}
							>
								»
							</button>
						</div>
					</div>
				{/if}
			{:else}
				<div class="text-center py-12">
					<AlertCircle class="w-16 h-16 mx-auto text-base-content/40 mb-4" />
					<h3 class="text-xl font-semibold mb-2">Belum Ada Data</h3>
					<p class="text-base-content/60">Tidak ada data absensi untuk periode yang dipilih.</p>
				</div>
			{/if}
		</div>
	</div>
</div>