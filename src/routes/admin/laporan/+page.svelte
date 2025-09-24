<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Download, ArrowLeft, Filter, FileText, TrendingUp, Clock, UserCheck, TrendingDown } from 'lucide-svelte';
	import CalendarPicker from '$lib/components/CalendarPicker.svelte';
	import ExportModal from '$lib/components/ExportModal.svelte';
	
	export let data;
	
	$: attendanceRecords = data.attendanceRecords;
	$: stats = data.stats;
	$: allUsers = data.allUsers;
	$: filters = data.filters;
	
	// Export modal state
	let showExportModal = false;

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
	
	// Reset to first page when filters change
	$: if (attendanceRecords) {
		currentPage = 1;
	}

	function getStatusBadgeClass(status) {
		switch(status) {
			case 'hadir':
			case 'dinas_luar': return 'badge-success'; // dinas_luar dihitung sebagai hadir
			case 'terlambat': return 'badge-warning';
			case 'sakit': return 'badge-error';
			case 'izin': return 'badge-warning';
			case 'tidak_hadir': return 'badge-error';
			default: return 'badge';
		}
	}

	function getStatusText(status) {
		switch(status) {
			case 'hadir': return 'Hadir';
			case 'terlambat': return 'Terlambat';
			case 'sakit': return 'Sakit';
			case 'izin': return 'Izin';
			case 'dinas_luar': return 'Dinas Luar';
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
			['Nama', 'Tanggal', 'Waktu Masuk', 'Status', 'Catatan'],
			...attendanceRecords.map(record => [
				record.user?.fullName || '',
				record.date,
				record.check_in_time || '',
				getStatusText(record.status),
				record.notes || ''
			])
		].map(row => row.join(',')).join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `laporan-absensi-${new Date().toISOString().split('T')[0]}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}
	
	// Handle export Excel
	async function handleExport(event) {
		const { month, year, workDays, exportType, employeeTypeFilter } = event.detail;
		
		try {
			// Create a form for secure download
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '/admin/laporan/export';
			form.style.display = 'none';
			
			// Add form data
			const formData = {
				month,
				year,
				workDays,
				exportType,
				employeeTypeFilter
			};
			
			// Add hidden inputs
			Object.entries(formData).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					const input = document.createElement('input');
					input.type = 'hidden';
					input.name = key;
					input.value = value;
					form.appendChild(input);
				}
			});
			
			// Submit form for download
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
			
		} catch (error) {
			console.error('Export error:', error);
			alert('Gagal mengexport laporan. Silakan coba lagi.');
		}
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
		<div class="flex flex-col sm:flex-row gap-2">
			<button 
				on:click={() => showExportModal = true} 
				class="btn btn-primary"
			>
				<Download class="w-5 h-5" />
				Export Excel
			</button>
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
			<form id="filterForm" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Tanggal Mulai</legend>
					<CalendarPicker
						name="start_date"
						value={filters.startDate}
						placeholder="Pilih tanggal mulai"
					/>
					<p class="label text-xs text-base-content/60">Periode awal laporan</p>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Tanggal Akhir</legend>
					<CalendarPicker
						name="end_date"
						value={filters.endDate}
						placeholder="Pilih tanggal akhir"
					/>
					<p class="label text-xs text-base-content/60">Periode akhir laporan</p>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Pilih Guru</legend>
					<select 
						id="user_id"
						name="user_id" 
						class="select select-bordered w-full"
					>
						<option value="">Semua Guru</option>
						{#each allUsers as user}
							<option value={user.id} selected={filters.userId == user.id}>
								{user.fullName}
							</option>
						{/each}
					</select>
					<p class="label text-xs text-base-content/60">Filter berdasarkan guru</p>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Status Kehadiran</legend>
					<select 
						id="status"
						name="status" 
						class="select select-bordered w-full"
					>
						<option value="">Semua Status</option>
						<option value="hadir" selected={filters.status === 'hadir'}>Hadir</option>
						<option value="terlambat" selected={filters.status === 'terlambat'}>Terlambat</option>
						<option value="tidak_hadir" selected={filters.status === 'tidak_hadir'}>Tidak Hadir</option>
					</select>
					<p class="label text-xs text-base-content/60">Filter berdasarkan status</p>
				</fieldset>
			</form>

			<!-- Action Button -->
			<div class="mt-4">
				<button 
					id="filter-button"
					type="button" 
					on:click={handleFilterChange}
					class="btn btn-primary"
				>
					<Filter class="w-4 h-4" />
					Terapkan Filter
				</button>
			</div>
		</div>
	</div>

	<!-- Statistics Summary -->
	<div class="stats shadow-xl w-full bg-base-100">
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
				<div class="text-sm opacity-70">
					Menampilkan {startIndex + 1}-{endIndex} dari {totalItems} record
				</div>
			</div>
			<div class="overflow-x-auto">
				{#if attendanceRecords.length > 0}
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
							{#each paginatedRecords as record}
							<tr>
								<td class="font-medium">{record.user?.fullName || 'N/A'}</td>
								<td>{format(new Date(record.date), 'dd MMM yyyy', { locale: localeId })}</td>
								<td class="font-mono">{record.check_in_time || '-'}</td>
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

<!-- Export Modal -->
<ExportModal 
	bind:showModal={showExportModal} 
	on:export={handleExport}
/>