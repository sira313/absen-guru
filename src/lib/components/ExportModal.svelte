<!-- @migration-task Error while migrating Svelte code: `<button>` cannot be a descendant of `<button>`. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
https://svelte.dev/e/node_invalid_placement -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { Calendar, Download, X } from 'lucide-svelte';
	
	export let showModal = false;
	
	const dispatch = createEventDispatcher();
	
	// Form data
	let selectedMonth = new Date().getMonth() + 1;
	let selectedYear = new Date().getFullYear();
	let exportType = 'tpp';
	let workDays = 22; // Default work days
	let employeeTypeFilter = ''; // Filter PNS/PPPK
	
	// Options
	const months = [
		{ value: 1, label: 'Januari' },
		{ value: 2, label: 'Februari' },
		{ value: 3, label: 'Maret' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'Mei' },
		{ value: 6, label: 'Juni' },
		{ value: 7, label: 'Juli' },
		{ value: 8, label: 'Agustus' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'Oktober' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'Desember' }
	];
	
	const exportTypes = [
		{ value: 'tpp', label: 'Laporan TPP', description: 'Format rekapitulasi kehadiran PNS/CPNS' },
		{ value: 'bulanan', label: 'Laporan Bulanan', description: 'Daftar hadir harian dalam satu bulan' }
	];
	
	const employeeTypeOptions = [
		{ value: '', label: 'Semua Pegawai' },
		{ value: 'PNS', label: 'PNS & CPNS' },
		{ value: 'PPPK', label: 'PPPK' }
	];
	
	// Calculate work days based on month/year
	function calculateWorkDays() {
		const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
		let workDaysCount = 0;
		
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(selectedYear, selectedMonth - 1, day);
			const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
			
			// Count Monday to Friday (1-5) as work days
			if (dayOfWeek >= 1 && dayOfWeek <= 5) {
				workDaysCount++;
			}
		}
		
		workDays = workDaysCount;
	}
	
	// Auto-calculate work days when month/year changes
	$: if (selectedMonth && selectedYear) {
		calculateWorkDays();
	}
	
	function closeModal() {
		showModal = false;
		dispatch('close');
	}
	
	function handleExport() {
		const exportData = {
			month: selectedMonth,
			year: selectedYear,
			exportType,
			workDays,
			employeeTypeFilter
		};
		
		dispatch('export', exportData);
		closeModal();
	}
	
	function handleBackdrop(event) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
</script>

<!-- Modal -->
{#if showModal}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		on:click={handleBackdrop}
		on:keydown={(e) => e.key === 'Escape' && closeModal()}
		role="presentation"
	>
		<!-- Modal Content -->
		<div 
			class="bg-base-100 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-base-200">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-primary/10 rounded-lg">
						<Download class="w-5 h-5 text-primary" />
					</div>
					<div>
						<h3 id="modal-title" class="text-lg font-semibold text-base-content">
							Export Laporan Excel
						</h3>
						<p class="text-sm text-base-content/60">
							Export data absensi ke dalam format Excel
						</p>
					</div>
				</div>
				<button 
					class="btn btn-sm btn-ghost btn-circle"
					on:click={closeModal}
					aria-label="Close modal"
				>
					<X class="w-4 h-4" />
				</button>
			</div>
			
			<!-- Body -->
			<div class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
				<!-- Export Type -->
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Jenis Laporan</legend>
					<select 
						bind:value={exportType}
						class="select select-bordered w-full"
					>
						{#each exportTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</select>
					<span class="label text-base-content/60">
						{exportTypes.find(t => t.value === exportType)?.description || 'Pilih jenis laporan yang akan diekspor'}
					</span>
				</fieldset>
				
				<!-- Month & Year Selection -->
				<div class="grid grid-cols-2 gap-4">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Bulan</legend>
						<select 
							bind:value={selectedMonth} 
							class="select select-bordered w-full"
						>
							{#each months as month}
								<option value={month.value}>{month.label}</option>
							{/each}
						</select>
						<span class="label">Pilih bulan laporan</span>
					</fieldset>
					
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Tahun</legend>
						<select 
							bind:value={selectedYear} 
							class="select select-bordered w-full"
						>
							{#each Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i) as year}
								<option value={year}>{year}</option>
							{/each}
						</select>
						<span class="label">Pilih tahun laporan</span>
					</fieldset>
				</div>
				
				<!-- Work Days -->
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Jumlah Hari Kerja <span class="text-sm font-normal opacity-60">Auto-calculated</span></legend>
					<input 
						type="number" 
						bind:value={workDays}
						min="1"
						max="31"
						class="input input-bordered w-full"
					/>
					<span class="label text-base-content/60">
						Dihitung otomatis berdasarkan hari kerja (Senin-Jumat)
					</span>
				</fieldset>
				
				<!-- Employee Type Filter (Only for TPP) -->
				{#if exportType === 'tpp'}
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Filter Pegawai</legend>
						<select 
							bind:value={employeeTypeFilter} 
							class="select select-bordered w-full"
						>
							{#each employeeTypeOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<span class="label text-base-content/60">
							CPNS secara otomatis dimasukkan ke kategori PNS
						</span>
					</fieldset>
				{/if}
				
				<!-- Preview Info -->
				<div class="alert alert-info">
					<Calendar class="w-4 h-4" />
					<div>
						<div class="font-medium">Periode: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</div>
						<div class="text-sm opacity-80">
							Total hari kerja: {workDays} hari
							{#if exportType === 'tpp' && employeeTypeFilter}
								<br>Filter: {employeeTypeOptions.find(o => o.value === employeeTypeFilter)?.label}
							{/if}
						</div>
					</div>
				</div>
			</div>
			
			<!-- Footer -->
			<div class="flex items-center justify-end gap-3 p-6 border-t border-base-200 flex-shrink-0">
				<button 
					class="btn btn-ghost"
					on:click={closeModal}
				>
					Batal
				</button>
				<button 
					class="btn btn-primary"
					on:click={handleExport}
				>
					<Download class="w-4 h-4" />
					Export Excel
				</button>
			</div>
		</div>
	</div>
{/if}