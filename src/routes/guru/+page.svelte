<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { CheckCircle, Clock, AlertTriangle, Calendar, User, ClipboardList, Coffee } from 'lucide-svelte';
	import PWABanner from '$lib/components/PWABanner.svelte';
	
	export let data;
	export let form;
	
	// Handle SvelteKit props that are automatically passed to page components
	export let params = undefined;
	export let url = undefined;
	export let route = undefined;
	
	$: user = data.user;
	$: todayAttendance = data.todayAttendance;
	$: stats = data.stats;
	$: today = data.today;
	$: isWeekend = data.isWeekend;
	$: weekendDayName = data.weekendDayName;
	
	// Mark unused props to avoid warnings
	params, url, route;
	
	// Ignore unused SvelteKit props
	$$restProps;
	
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
			case 'hadir': return 'badge-success';
			case 'terlambat': return 'badge-warning';
			case 'sakit': return 'badge-error';
			case 'izin': return 'badge-warning';
			case 'dinas_luar': return 'badge-info';
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
			case 'tidak_hadir': return 'Tanpa Keterangan';
			default: return status;
		}
	}
</script>

<svelte:head>
	<title>Dashboard Guru - {user.name}</title>
</svelte:head>

<div class="container mx-auto p-4 lg:p-6 space-y-6 max-w-4xl">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-2xl lg:text-3xl font-bold text-base-content">Selamat Datang, {user.name}!</h1>
		<p class="text-base lg:text-lg text-base-content/70">{todayFormatted}</p>
		<div class="text-xl lg:text-2xl font-mono mt-2 text-base-content">{currentTimeString}</div>
	</div>

	<!-- PWA Install Banner -->
	<PWABanner />

	<!-- Error/Success Messages -->
	{#if form?.message}
		<div class="alert {form.success ? 'alert-success' : 'alert-error'}">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				{#if form.success}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
				{/if}
			</svg>
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Status Absen Hari Ini -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center mb-6">Status Absensi Hari Ini</h2>
		
		{#if todayAttendance}
			<!-- Status Sudah Absen -->
			<div class="bg-gradient-to-r from-success/10 to-success/5 rounded-lg p-6 border border-success/20">
				<div class="flex items-center justify-center mb-4">
					<div class="relative">
						<div class="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-lg">
							<CheckCircle class="w-8 h-8 text-success-content" />
						</div>
						<div class="absolute -top-1 -right-1 w-6 h-6 bg-success-content rounded-full border-2 border-success flex items-center justify-center">
							<span class="text-success text-xs font-bold">✓</span>
						</div>
					</div>
				</div>
				
				<div class="text-center space-y-2">
					<h3 class="text-xl font-bold text-success">Sudah Absen!</h3>
					<div class="flex items-center justify-center gap-2 text-base-content/70">
						<Clock class="w-4 h-4" />
						<span>Waktu Check-in: {todayAttendance.checkIn}</span>
					</div>
					<div class="flex justify-center">
						<div class="badge {getStatusBadgeClass(todayAttendance.status)} badge-lg">
							{getStatusText(todayAttendance.status)}
						</div>
					</div>
					{#if todayAttendance.notes}
						<div class="mt-4 p-3 bg-base-100 rounded-lg">
							<div class="text-sm font-medium text-base-content/60 mb-1">Catatan:</div>
							<div class="text-sm text-base-content/80 italic">"{todayAttendance.notes}"</div>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Weekend Notice -->
			{#if isWeekend}
				<div class="bg-gradient-to-r from-info/10 to-info/5 rounded-lg p-6 border border-info/20 mb-6">
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
							<Calendar class="w-4 h-4" />
							<span>Hari kerja: Senin - Jumat</span>
						</div>
					</div>
				</div>
			{:else}
				<!-- Status Belum Absen -->
				<div class="bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg p-6 border border-warning/20 mb-6">
					<div class="flex items-center justify-center mb-4">
						<div class="relative">
							<div class="w-16 h-16 bg-warning rounded-full flex items-center justify-center shadow-lg animate-pulse">
								<AlertTriangle class="w-8 h-8 text-warning-content" />
							</div>
							<div class="absolute -top-1 -right-1 w-6 h-6 bg-warning-content rounded-full border-2 border-warning flex items-center justify-center">
								<span class="text-warning text-xs font-bold">!</span>
							</div>
						</div>
					</div>
					
					<div class="text-center space-y-2">
						<h3 class="text-xl font-bold text-warning">Belum Absen Hari Ini</h3>
						<p class="text-base-content/70">Silakan lakukan absensi untuk memulai hari kerja Anda</p>
						<div class="flex items-center justify-center gap-2 text-sm text-base-content/60">
							<Calendar class="w-4 h-4" />
							<span>Batas waktu: 08:00 WIB</span>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Form Absen dengan Design Baru (hanya tampil jika bukan weekend) -->
			{#if !isWeekend}
			<div class="card bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
				<div class="card-body">
					<h4 class="card-title text-center text-primary mb-4">
						<Clock class="w-5 h-5" />
						Form Absensi
					</h4>
					
					<form method="POST" action="?/absen" use:enhance class="space-y-4">
						<!-- Pilihan Status Kehadiran -->
						<fieldset class="fieldset">
							<legend class="fieldset-legend">Status Kehadiran</legend>
							<div class="grid grid-cols-2 gap-3">
								<label class="label cursor-pointer">
									<input type="radio" name="status" value="hadir" class="radio radio-success" checked />
									<span class="label-text ml-2">
										<CheckCircle class="w-4 h-4 inline mr-1" />
										Hadir
									</span>
								</label>
								
								<label class="label cursor-pointer">
									<input type="radio" name="status" value="sakit" class="radio radio-error" />
									<span class="label-text ml-2">
										<AlertTriangle class="w-4 h-4 inline mr-1" />
										Sakit
									</span>
								</label>
								
								<label class="label cursor-pointer">
									<input type="radio" name="status" value="izin" class="radio radio-warning" />
									<span class="label-text ml-2">
										<Calendar class="w-4 h-4 inline mr-1" />
										Izin
									</span>
								</label>
								
								<label class="label cursor-pointer">
									<input type="radio" name="status" value="dinas_luar" class="radio radio-info" />
									<span class="label-text ml-2">
										<User class="w-4 h-4 inline mr-1" />
										Dinas Luar
									</span>
								</label>
							</div>
							<p class="label">Pilih status kehadiran Anda hari ini</p>
						</fieldset>

						<fieldset class="fieldset">
							<legend class="fieldset-legend">Catatan & Keterangan</legend>
							<textarea 
								id="notes"
								name="notes" 
								class="textarea w-full" 
								placeholder="Tambahkan keterangan untuk status yang dipilih..."
								rows="3"
							></textarea>
							<p class="label">
								<span class="text-xs">
									• <strong>Sakit:</strong> Jelaskan kondisi/gejala<br>
									• <strong>Izin:</strong> Alasan dan keperluan<br>
									• <strong>Dinas Luar:</strong> Lokasi dan agenda
								</span>
							</p>
						</fieldset>
						
						<button class="btn btn-primary btn-block btn-lg" type="submit">
							<Clock class="w-6 h-6 mr-2" />
							Submit Absensi
							<div class="badge badge-outline ml-2">
								{currentTimeString.slice(0, 5)}
							</div>
						</button>
					</form>
				</div>
			</div>
			{/if}
		{/if}
		</div>
	</div>

	<!-- Statistik Bulan Ini -->
	<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
		<!-- Hadir (termasuk Dinas Luar) -->
		<div class="stat bg-base-100 shadow-lg rounded-lg">
			<div class="stat-figure text-success">
				<CheckCircle class="w-8 h-8" />
			</div>
			<div class="stat-value text-success">{stats.presentDays}</div>
			<div class="stat-title">Hadir</div>
			<div class="stat-desc text-xs opacity-60 sm:hidden">Termasuk DL</div>
			<div class="stat-desc text-xs opacity-60 hidden sm:block">Termasuk Dinas Luar</div>
		</div>
		
		<!-- Terlambat -->
		<div class="stat bg-base-100 shadow-lg rounded-lg">
			<div class="stat-figure text-warning">
				<Clock class="w-8 h-8" />
			</div>
			<div class="stat-value text-warning">{stats.lateDays}</div>
			<div class="stat-title">Terlambat</div>
		</div>
		
		<!-- Sakit -->
		<div class="stat bg-base-100 shadow-lg rounded-lg">
			<div class="stat-figure text-error">
				<AlertTriangle class="w-8 h-8" />
			</div>
			<div class="stat-value text-error">{stats.sickDays}</div>
			<div class="stat-title">Sakit</div>
		</div>
		
		<!-- Izin -->
		<div class="stat bg-base-100 shadow-lg rounded-lg">
			<div class="stat-figure text-warning">
				<Calendar class="w-8 h-8" />
			</div>
			<div class="stat-value text-warning">{stats.leaveDays}</div>
			<div class="stat-title">Izin</div>
		</div>
		
		<!-- Tanpa Keterangan -->
		<div class="stat bg-base-100 shadow-lg rounded-lg">
			<div class="stat-figure text-error">
				<AlertTriangle class="w-8 h-8" />
			</div>
			<div class="stat-value text-error">{stats.absentDays}</div>
			<div class="stat-title sm:hidden">TK</div>
			<div class="stat-title hidden sm:block">Tanpa Keterangan</div>
		</div>
		
		<!-- Total Hari -->
		<div class="stat bg-base-100 shadow-lg rounded-lg">
			<div class="stat-figure text-base-content">
				<Calendar class="w-8 h-8" />
			</div>
			<div class="stat-value text-base-content">{stats.totalDays}</div>
			<div class="stat-title">Total Hari</div>
			<div class="stat-desc text-xs opacity-60">30 hari terakhir</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center">Menu Cepat</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
				<a href="/guru/riwayat" class="btn btn-outline">
					<ClipboardList class="w-5 h-5 mr-2" />
					Riwayat Absensi
				</a>
				
				<a href="/profile" class="btn btn-outline">
					<User class="w-5 h-5 mr-2" />
					Profile
				</a>
			</div>
		</div>
	</div>
</div>