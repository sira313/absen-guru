<!-- src/lib/components/OfflineAttendance.svelte -->
<script>
    function getSyncStatusText(status) {
        switch (status) {
            case 'syncing': return 'Sinkronisasi...';
            case 'error': return 'Error sinkronisasi';
            case 'offline': return 'Offline';
            default: return 'Tersinkronisasi';
        }
    }
    import { onMount } from 'svelte';
    import { isOnline, syncStatus, offlineData, saveOfflineAttendance, syncOfflineData } from '$lib/stores/offline.js';
    import { page } from '$app/stores';

    // Props
    let { user } = $props();

    // State
    let todayAttendance = $state(null);
    let isLoading = $state(false);
    let error = $state('');
    let location = $state({ lat: null, lng: null });

    // Derived values
    let canClockIn = $derived(!todayAttendance?.clock_in);
    let canClockOut = $derived(todayAttendance?.clock_in && !todayAttendance?.clock_out);

    onMount(async () => {
        await loadTodayAttendance();
        await getCurrentLocation();
    });

    async function loadTodayAttendance() {
        if (!user?.id) return;

        try {
            isLoading = true;
            todayAttendance = await attendanceDB.getTodayAttendance(user.id);
        } catch (err) {
            console.error('Error loading attendance:', err);
            error = 'Gagal memuat data absensi';
        } finally {
            isLoading = false;
        }
    }

    async function getCurrentLocation() {
        if ('geolocation' in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    });
                });
                
                location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
            } catch (err) {
                console.warn('Geolocation error:', err);
                // Continue without location - not mandatory
            }
        }
    }

    async function clockIn() {
        if (!user?.id || !canClockIn) return;

        try {
            isLoading = true;
            error = '';

            const now = new Date();
            const attendance = {
                user_id: user.id,
                date: now.toISOString().split('T')[0],
                clock_in: now.toISOString(),
                location: location.lat ? `${location.lat},${location.lng}` : null,
                status: 'present'
            };

            const result = await attendanceDB.create(attendance);
            todayAttendance = result;
            
            // Show success message
            showSuccess('Berhasil clock in!');
        } catch (err) {
            console.error('Clock in error:', err);
            error = 'Gagal melakukan clock in. Data tersimpan offline.';
        } finally {
            isLoading = false;
        }
    }

    async function clockOut() {
        if (!todayAttendance || !canClockOut) return;

        try {
            isLoading = true;
            error = '';

            const updates = {
                clock_out: new Date().toISOString(),
                location: location.lat ? `${location.lat},${location.lng}` : todayAttendance.location
            };

            const result = await attendanceDB.update(todayAttendance._id, updates);
            todayAttendance = result;
            
            showSuccess('Berhasil clock out!');
        } catch (err) {
            console.error('Clock out error:', err);
            error = 'Gagal melakukan clock out. Data tersimpan offline.';
        } finally {
            isLoading = false;
        }
    }

    function showSuccess(message) {
        // You can implement toast notification here
        console.log('Success:', message);
    }

    function formatTime(isoString) {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusColor(status) {
        switch (status) {
            case 'syncing': return 'text-warning';
            case 'error': return 'text-error';
            case 'offline': return 'text-info';
            default: return 'text-success';
        }
    }
</script>

<div class="card bg-base-100 shadow-lg">
    <div class="card-body">
        <h2 class="card-title flex items-center justify-between">
            <span>📋 Absensi Hari Ini</span>
            
            <!-- Network Status Indicator -->
            <div class="flex items-center gap-2 text-sm">
                <div class="badge {$isOnline ? 'badge-success' : 'badge-error'} gap-2">
                    <div class="w-2 h-2 rounded-full {$isOnline ? 'bg-success' : 'bg-error'}"></div>
                    {$isOnline ? 'Online' : 'Offline'}
                </div>
                
                {#if $offlineData.length > 0}
                    <div class="badge badge-warning gap-2">
                        <span class="loading loading-spinner loading-xs"></span>
                        Data Belum Sync
                    </div>
                {/if}
            </div>
        </h2>

        <!-- Sync Status -->
        <div class="text-sm {getStatusColor($syncStatus)} mb-4">
            Status: {getSyncStatusText($syncStatus)}
        </div>

        {#if error}
            <div class="alert alert-error mb-4">
                <span>{error}</span>
            </div>
        {/if}

        {#if isLoading}
            <div class="flex justify-center py-8">
                <span class="loading loading-spinner loading-lg"></span>
            </div>
        {:else}
            <!-- Today's Attendance Status -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-base-200 rounded-lg p-4">
                    <div class="text-sm opacity-60 mb-1">Tanggal</div>
                    <div class="font-bold text-lg">
                        {new Date().toLocaleDateString('id-ID')}
                    </div>
                </div>

                <div class="bg-base-200 rounded-lg p-4">
                    <div class="text-sm opacity-60 mb-1">Clock In</div>
                    <div class="font-bold text-lg {todayAttendance?.clock_in ? 'text-success' : 'text-base-content/50'}">
                        {formatTime(todayAttendance?.clock_in)}
                    </div>
                </div>

                <div class="bg-base-200 rounded-lg p-4">
                    <div class="text-sm opacity-60 mb-1">Clock Out</div>
                    <div class="font-bold text-lg {todayAttendance?.clock_out ? 'text-success' : 'text-base-content/50'}">
                        {formatTime(todayAttendance?.clock_out)}
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 justify-center">
                <button 
                    class="btn btn-primary"
                    disabled={!canClockIn || isLoading}
                    onclick={clockIn}
                >
                    {#if isLoading}
                        <span class="loading loading-spinner loading-sm"></span>
                    {/if}
                    🕐 Clock In
                </button>

                <button 
                    class="btn btn-secondary"
                    disabled={!canClockOut || isLoading}
                    onclick={clockOut}
                >
                    {#if isLoading}
                        <span class="loading loading-spinner loading-sm"></span>
                    {/if}
                    🕐 Clock Out
                </button>
            </div>

            <!-- Location Info -->
            {#if location.lat}
                <div class="mt-4 text-sm text-base-content/70 text-center">
                    📍 Lokasi: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    {#if location.accuracy}
                        (±{Math.round(location.accuracy)}m)
                    {/if}
                </div>
            {/if}

            <!-- Offline Notice -->
            {#if !$isOnline}
                <div class="alert alert-info mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Mode offline aktif. Data akan disinkronkan saat kembali online.</span>
                </div>
            {/if}
        {/if}
    </div>
</div>

