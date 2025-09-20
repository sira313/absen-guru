<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	
	export let data;
	
	$: user = data.user;
	$: todayAttendance = data.todayAttendance;
	$: stats = data.stats;
	$: today = data.today;
	
	let currentTime = new Date();
	let clockInterval;
	
	// Update jam setiap detik
	function startClock() {
		clockInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);
	}
	
	function stopClock() {
		if (clockInterval) {
			clearInterval(clockInterval);
		}
	}
	
	// Jalankan clock saat component mount
	import { onMount, onDestroy } from 'svelte';
	
	onMount(startClock);
	onDestroy(stopClock);
	
	$: currentTimeString = format(currentTime, 'HH:mm:ss');
	$: todayFormatted = format(new Date(today), 'dd MMMM yyyy', { locale: localeId });
	
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
</script>

<svelte:head>
	<title>Dashboard Guru - {user.name}</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold">Selamat Datang, {user.name}!</h1>
		<p class="text-lg opacity-70">{todayFormatted}</p>
		<div class="text-2xl font-mono mt-2">{currentTimeString}</div>
	</div>

	<!-- Status Absen Hari Ini -->
	<div class="card">
		<div class="card-header text-center">
			<h2 class="card-title">Status Absensi Hari Ini</h2>
		</div>
		
		{#if todayAttendance}
			<div class="alert alert-success">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<div>
					<div class="font-bold">Sudah Absen!</div>
					<div class="text-sm">
						Waktu: {todayAttendance.checkIn} - 
						<span class="badge {getStatusBadgeClass(todayAttendance.status)}">
							{getStatusText(todayAttendance.status)}
						</span>
						</div>
						{#if todayAttendance.notes}
							<div class="text-sm opacity-70">Catatan: {todayAttendance.notes}</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="alert alert-warning">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<div>
						<div class="font-bold">Belum Absen Hari Ini</div>
						<div class="text-sm">Silakan lakukan absensi</div>
					</div>
				</div>
				
				<!-- Form Absen -->
				<form method="POST" action="?/absen" use:enhance class="mt-4">
					<div class="mb-4">
						<label class="block text-sm font-medium mb-2" for="notes">
							Catatan (opsional)
						</label>
						<textarea 
							id="notes"
							name="notes" 
							class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
							placeholder="Tambahkan catatan jika diperlukan..."
							rows="3"
						></textarea>
					</div>
					
					<button 
						class="btn btn-primary w-full text-lg py-3"
						type="submit"
					>
						<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						Absen Sekarang
					</button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Statistik Bulan Ini -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="card">
			<div class="p-6 text-center">
				<div class="stat-value text-green-600">{stats.presentDays}</div>
				<div class="stat-title">Hadir</div>
			</div>
		</div>
		
		<div class="card">
			<div class="p-6 text-center">
				<div class="stat-value text-yellow-600">{stats.lateDays}</div>
				<div class="stat-title">Terlambat</div>
			</div>
		</div>
		
		<div class="card">
			<div class="p-6 text-center">
				<div class="stat-value text-red-600">{stats.absentDays}</div>
				<div class="stat-title">Tidak Hadir</div>
			</div>
		</div>
		
		<div class="card">
			<div class="p-6 text-center">
				<div class="stat-value text-gray-600">{stats.totalDays}</div>
				<div class="stat-title">Total Hari</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="card">
		<div class="card-header">
			<h3 class="card-title">Menu Cepat</h3>
		</div>
		<div class="p-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<a href="/guru/riwayat" class="btn btn-outline">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
					</svg>
					Riwayat Absensi
				</a>
				
				<a href="/profile" class="btn btn-outline">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
					</svg>
					Profile
				</a>
			</div>
		</div>
	</div>