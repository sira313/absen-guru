<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { CheckCircle, Clock, AlertTriangle, Calendar, User, ClipboardList } from 'lucide-svelte';
	
	export let data;
	
	$: user = data.user;
	$: todayAttendance = data.todayAttendance;
	$: stats = data.stats;
	$: today = data.today;
	
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

	<!-- Status Absen Hari Ini -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center">Status Absensi Hari Ini</h2>
		
		{#if todayAttendance}
			<div class="alert alert-success">
				<CheckCircle class="w-6 h-6" />
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
					<AlertTriangle class="w-6 h-6" />
					<div>
						<div class="font-bold">Belum Absen Hari Ini</div>
						<div class="text-sm">Silakan lakukan absensi</div>
					</div>
				</div>
				
				<!-- Form Absen -->
				<form method="POST" action="?/absen" use:enhance class="space-y-4">
					<div class="form-control">
						<label class="label" for="notes">
							<span class="label-text">Catatan (opsional)</span>
						</label>
						<textarea 
							id="notes"
							name="notes" 
							class="textarea textarea-bordered" 
							placeholder="Tambahkan catatan jika diperlukan..."
							rows="3"
						></textarea>
					</div>
					
					<button class="btn btn-primary btn-block" type="submit">
						<Clock class="w-6 h-6 mr-2" />
						Absen Sekarang
					</button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Statistik Bulan Ini -->
	<div class="stats stats-vertical lg:stats-horizontal shadow-xl w-full">
		<div class="stat bg-base-100">
			<div class="stat-figure text-success">
				<CheckCircle class="w-8 h-8" />
			</div>
			<div class="stat-value text-success">{stats.presentDays}</div>
			<div class="stat-title">Hadir</div>
		</div>
		
		<div class="stat bg-base-100">
			<div class="stat-figure text-warning">
				<AlertTriangle class="w-8 h-8" />
			</div>
			<div class="stat-value text-warning">{stats.lateDays}</div>
			<div class="stat-title">Terlambat</div>
		</div>
		
		<div class="stat bg-base-100">
			<div class="stat-figure text-error">
				<AlertTriangle class="w-8 h-8" />
			</div>
			<div class="stat-value text-error">{stats.absentDays}</div>
			<div class="stat-title">Tidak Hadir</div>
		</div>
		
		<div class="stat bg-base-100">
			<div class="stat-figure text-neutral">
				<Calendar class="w-8 h-8" />
			</div>
			<div class="stat-value text-neutral">{stats.totalDays}</div>
			<div class="stat-title">Total Hari</div>
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