<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Download, ArrowLeft, Filter, FileText, TrendingUp, Clock, UserCheck, TrendingDown } from 'lucide-svelte';
	
	export let data;
	
	// Ignore unused SvelteKit props
	$$restProps;
	
	$: attendanceRecords = data.attendanceRecords;
	$: stats = data.stats;
	$: allUsers = data.allUsers;
	$: filters = data.filters;

	function getStatusBadgeClass(status) {
		switch(status) {
			case 'hadir': return 'badge-success';
			case 'terlambat': return 'badge-warning';
			case 'tidak_hadir': return 'badge-error';
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
	<div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold text-base-content">Laporan Absensi</h1>
			<p class="text-lg text-base-content/70">Detail laporan absensi guru</p>
		</div>
		<div class="flex gap-2">
			<button on:click={exportToCSV} class="btn btn-outline">
				<Download class="w-5 h-5" />
				Export CSV
			</button>
			<a href="/admin" class="btn btn-outline">
				<ArrowLeft class="w-5 h-5" />
				Kembali
			</a>
		</div>
	</div>

	<!-- Filter Section -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">
				<Filter class="w-5 h-5" />
				Filter Laporan
			</h2>
			<form id="filterForm" class="grid grid-cols-1 md:grid-cols-5 gap-4">
				<div class="form-control">
					<label for="start_date" class="label">
						<span class="label-text">Tanggal Mulai</span>
					</label>
					<input 
						id="start_date"
						type="date" 
						name="start_date" 
						value={filters.startDate}
						class="input input-bordered"
					/>
				</div>
				
				<div class="form-control">
					<label for="end_date" class="label">
						<span class="label-text">Tanggal Akhir</span>
					</label>
					<input 
						id="end_date"
						type="date" 
						name="end_date" 
						value={filters.endDate}
						class="input input-bordered"
					/>
				</div>

				<div class="form-control">
					<label for="user_id" class="label">
						<span class="label-text">Guru</span>
					</label>
					<select 
						id="user_id"
						name="user_id" 
						class="select select-bordered"
					>
						<option value="">Semua Guru</option>
						{#each allUsers as user}
							<option value={user.id} selected={filters.userId == user.id}>
								{user.fullName}
							</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label for="status" class="label">
						<span class="label-text">Status</span>
					</label>
					<select 
						id="status"
						name="status" 
						class="select select-bordered"
					>
						<option value="">Semua Status</option>
						<option value="hadir" selected={filters.status === 'hadir'}>Hadir</option>
						<option value="terlambat" selected={filters.status === 'terlambat'}>Terlambat</option>
						<option value="tidak_hadir" selected={filters.status === 'tidak_hadir'}>Tidak Hadir</option>
					</select>
				</div>

				<div class="form-control">
					<label for="filter-button" class="label">
						<span class="label-text">Terapkan Filter</span>
					</label>
					<button 
						id="filter-button"
						type="button" 
						on:click={handleFilterChange}
						class="btn btn-primary"
					>
						<Filter class="w-4 h-4" />
						Filter
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Statistics Summary -->
	<div class="stats shadow w-full">
		<div class="stat">
			<div class="stat-figure text-primary">
				<FileText class="w-8 h-8" />
			</div>
			<div class="stat-title">Total Record</div>
			<div class="stat-value text-primary">{stats.total}</div>
		</div>
		<div class="stat">
			<div class="stat-figure text-success">
				<UserCheck class="w-8 h-8" />
			</div>
			<div class="stat-title">Hadir</div>
			<div class="stat-value text-success">{stats.hadir}</div>
		</div>
		<div class="stat">
			<div class="stat-figure text-warning">
				<Clock class="w-8 h-8" />
			</div>
			<div class="stat-title">Terlambat</div>
			<div class="stat-value text-warning">{stats.terlambat}</div>
		</div>
		<div class="stat">
			<div class="stat-figure text-error">
				<TrendingDown class="w-8 h-8" />
			</div>
			<div class="stat-title">Tidak Hadir</div>
			<div class="stat-value text-error">{stats.tidak_hadir}</div>
		</div>
	</div>

	<!-- Attendance Records Table -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex justify-between items-center mb-4">
				<h2 class="card-title">Detail Absensi</h2>
				<div class="text-sm opacity-70">Menampilkan {attendanceRecords.length} record</div>
			</div>
			<div class="overflow-x-auto">
				{#if attendanceRecords.length > 0}
					<table class="table table-zebra">
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
									<div class="badge {getStatusBadgeClass(record.status)}">
										{getStatusText(record.status)}
									</div>
								</td>
								<td class="text-sm opacity-70 max-w-xs truncate">
									{record.notes || '-'}
								</td>
							</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<div class="hero min-h-96 bg-base-200 rounded-lg">
						<div class="hero-content text-center">
							<div>
								<FileText class="w-16 h-16 mx-auto text-base-content/30 mb-4" />
								<h3 class="text-lg font-medium text-base-content mb-2">Tidak ada data</h3>
								<p class="text-base-content/70">Tidak ditemukan record absensi dengan filter yang dipilih.</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>