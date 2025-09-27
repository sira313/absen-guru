<script>
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { CheckCircle, Clock, AlertTriangle, Wifi, WifiOff, CloudUpload, Coffee } from 'lucide-svelte';
	import { isOnline, offlineData, syncStatus, saveOfflineAttendance, syncOfflineData } from '$lib/stores/offline.js';
	import { showSuccess, showError, showInfo } from '$lib/stores/toast.js';
	import { onMount } from 'svelte';
	
	let { user } = $props();
	
	let currentTime = $state(new Date());
	let selectedStatus = $state('hadir');
	let notes = $state('');
	let location = $state('');
	let isSubmitting = $state(false);
	let message = $state('');
	
	// Helper functions untuk weekend check
	function isWeekend(date) {
		const day = date.getDay();
		return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
	}
	
	function getWeekendDayName(date) {
		const day = date.getDay();
		if (day === 0) return "Minggu";
		if (day === 6) return "Sabtu";
		return "";
	}
	
	// Check apakah hari ini weekend
	let isWeekendToday = $derived(isWeekend(currentTime));
	let weekendDayName = $derived(isWeekendToday ? getWeekendDayName(currentTime) : "");
	
	// Get current location
	onMount(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					location = `${position.coords.latitude}, ${position.coords.longitude}`;
				},
				(error) => {
					console.warn('Location not available:', error);
					location = 'Location not available';
				}
			);
		}
		
		// Update clock
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 1000);
		
		return () => clearInterval(interval);
	});
	
	async function handleOfflineSubmit(event) {
		event.preventDefault();
		if (isSubmitting) return;
		
		// Check if today is weekend
		if (isWeekend(currentTime)) {
			const dayName = getWeekendDayName(currentTime);
			showError(`Tidak bisa melakukan absensi pada hari ${dayName}. Sistem absensi hanya tersedia pada hari kerja (Senin-Jumat).`);
			return;
		}
		
		isSubmitting = true;
		message = '';
		
		// Define attendanceData outside try block so it's available in catch block
		const attendanceData = {
			userId: user.id,
			date: format(new Date(), 'yyyy-MM-dd'),
			checkIn: format(currentTime, 'HH:mm:ss'),
			status: selectedStatus,
			notes: notes.trim(),
			location: location,
			ipAddress: 'offline_mode'
		};
		
		try {
			if ($isOnline) {
				// Online mode - kirim langsung ke server menggunakan SvelteKit form action
				const response = await fetch('/guru?/absen', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({
						status: selectedStatus,
						notes: notes.trim()
					}).toString()
				});
				
				if (response.ok) {
					showSuccess('Absensi berhasil dikirim!');
					resetForm();
				} else {
					throw new Error('Server error');
				}
			} else {
				// Offline mode - simpan lokal
				await saveOfflineAttendance(attendanceData);
				message = '💾 Absensi disimpan offline. Akan disync otomatis saat online.';
				resetForm();
			}
		} catch (error) {
			console.error('Submit error:', error);
			
			// Fallback ke offline jika online gagal
			if ($isOnline) {
				try {
					await saveOfflineAttendance(attendanceData);
					message = '⚠️ Server tidak dapat dijangkau. Disimpan offline untuk sync nanti.';
					resetForm();
				} catch (offlineError) {
					showError('Error: ' + offlineError.message);
				}
			} else {
				showError('Error: ' + error.message);
			}
		} finally {
			isSubmitting = false;
		}
	}
	
	function resetForm() {
		selectedStatus = 'hadir';
		notes = '';
	}
	
	async function manualSync() {
		await syncOfflineData();
	}
	
	let currentTimeString = $derived(format(currentTime, 'HH:mm:ss'));
</script>

<div class="card bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
	<div class="card-body">
		<!-- Header dengan status koneksi -->
		<div class="flex items-center justify-between mb-4">
			<h4 class="card-title text-primary">
				<Clock class="w-5 h-5" />
				Absensi Offline-First
			</h4>
			
			<div class="flex items-center gap-2">
				{#if $isOnline}
					<div class="badge badge-success gap-1">
						<Wifi class="w-3 h-3" />
						Online
					</div>
				{:else}
					<div class="badge badge-warning gap-1">
						<WifiOff class="w-3 h-3" />
						Offline
					</div>
				{/if}
				
				{#if $offlineData.length > 0}
					<div class="badge badge-info gap-1">
						{$offlineData.length} pending
					</div>
				{/if}
			</div>
		</div>
		
		<!-- Status Messages -->
		{#if message}
			<div class="alert alert-info mb-4">
				<span>{message}</span>
			</div>
		{/if}
		
		<!-- Sync Status -->
		{#if $syncStatus === 'syncing'}
			<div class="alert alert-info mb-4">
				<CloudUpload class="w-4 h-4" />
				<span>Syncing data...</span>
			</div>
		{/if}
		
		<!-- Offline Data List -->
		{#if $offlineData.length > 0}
			<div class="mb-4">
				<h5 class="font-semibold mb-2">Data Offline ({$offlineData.length}):</h5>
				<div class="max-h-32 overflow-y-auto space-y-1">
					{#each $offlineData as item}
						<div class="text-xs bg-base-200 p-2 rounded flex justify-between">
							<span>{item.date} - {item.status}</span>
							<span class="text-warning">Pending sync</span>
						</div>
					{/each}
				</div>
				{#if $isOnline}
					<button class="btn btn-xs btn-outline mt-2" onclick={manualSync}>
						<CloudUpload class="w-3 h-3" />
						Manual Sync
					</button>
				{/if}
			</div>
		{/if}
		
		<!-- Weekend Notice atau Form Absensi -->
		{#if isWeekendToday}
			<!-- Weekend Notice -->
			<div class="bg-gradient-to-r from-info/10 to-info/5 rounded-lg p-6 border border-info/20">
				<div class="flex items-center justify-center mb-4">
					<div class="relative">
						<div class="w-16 h-16 bg-info rounded-full flex items-center justify-center shadow-lg">
							<Coffee class="w-8 h-8 text-info-content" />
						</div>
						<div class="absolute -top-1 -right-1 w-6 h-6 bg-info-content rounded-full border-2 border-info flex items-center justify-center">
							<span class="text-info text-xs font-bold">☕</span>
						</div>
					</div>
				</div>
				
				<div class="text-center space-y-2">
					<h3 class="text-xl font-bold text-info">Selamat Hari {weekendDayName}!</h3>
					<p class="text-base-content/70">Nikmati hari libur Anda. Sistem absensi akan tersedia kembali pada hari Senin.</p>
					<div class="flex items-center justify-center gap-2 text-sm text-base-content/60">
						<Clock class="w-4 h-4" />
						<span>Hari kerja: Senin - Jumat</span>
					</div>
				</div>
			</div>
		{:else}
			<!-- Form Absensi -->
			<form onsubmit={handleOfflineSubmit} class="space-y-4">
			<!-- Waktu Saat Ini -->
			<div class="bg-base-200 p-3 rounded-lg text-center">
				<div class="text-sm text-base-content/70">Waktu Absen</div>
				<div class="text-xl font-mono font-bold">{currentTimeString}</div>
			</div>
			
			<!-- Status Kehadiran -->
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Status Kehadiran</legend>
				<div class="grid grid-cols-2 gap-3">
					<label class="label cursor-pointer">
						<input type="radio" bind:group={selectedStatus} value="hadir" class="radio radio-success" />
						<span class="label-text ml-2">
							<CheckCircle class="w-4 h-4 inline mr-1" />
							Hadir
						</span>
					</label>
					
					<label class="label cursor-pointer">
						<input type="radio" bind:group={selectedStatus} value="sakit" class="radio radio-error" />
						<span class="label-text ml-2">
							<AlertTriangle class="w-4 h-4 inline mr-1" />
							Sakit
						</span>
					</label>
					
					<label class="label cursor-pointer">
						<input type="radio" bind:group={selectedStatus} value="izin" class="radio radio-warning" />
						<span class="label-text ml-2">Izin</span>
					</label>
					
					<label class="label cursor-pointer">
						<input type="radio" bind:group={selectedStatus} value="dinas_luar" class="radio radio-info" />
						<span class="label-text ml-2">Dinas Luar</span>
					</label>
				</div>
			</fieldset>
			
			<!-- Catatan -->
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Catatan</legend>
				<textarea 
					bind:value={notes}
					class="textarea textarea-bordered w-full" 
					rows="3" 
					placeholder="Catatan tambahan (opsional)"
				></textarea>
			</fieldset>
			
			<!-- Submit Button -->
			<button 
				type="submit" 
				class="btn btn-primary btn-block btn-lg"
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					<span class="loading loading-spinner loading-sm"></span>
					Processing...
				{:else}
					<Clock class="w-6 h-6 mr-2" />
					{$isOnline ? 'Kirim' : 'Simpan'}
					<div class="badge badge-outline ml-2">
						{currentTimeString.slice(0, 5)}
					</div>
				{/if}
			</button>
		
			<!-- Location Info -->
			{#if location}
				<div class="text-xs text-base-content/60 text-center mt-2">
					📍 Location: {location}
				</div>
			{/if}
		</form>
		{/if}
	</div>
</div>