<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { School, Database, Download, Upload, Save, Building, MapPin, Phone, Mail, Hash } from 'lucide-svelte';
	
	export let data;
	export let form;
	
	// Handle SvelteKit props that are automatically passed to page components
	export let params = undefined;
	export let url = undefined;
	export let route = undefined;
	
	$: user = data.user;
	$: schoolSettings = data.schoolSettings;
	$: kepalaSekolahUsers = data.kepalaSekolahUsers || [];
	
	// Mark unused props to avoid warnings
	params, url, route;

	// Selected kepala sekolah
	let selectedKepalaSekolahId = '';
	
	// Initialize selected kepala sekolah from settings
	$: {
		if (schoolSettings && schoolSettings.school_principal_name && kepalaSekolahUsers.length > 0) {
			// Try to find matching kepala sekolah by name and NIP
			const matchingUser = kepalaSekolahUsers.find(u => 
				u.name === schoolSettings.school_principal_name && 
				u.nip === schoolSettings.school_principal_nip
			);
			if (matchingUser) {
				selectedKepalaSekolahId = matchingUser.id;
			}
		}
	}
	
	// Get selected kepala sekolah data
	$: selectedKepalaSekolah = kepalaSekolahUsers.find(u => u.id === selectedKepalaSekolahId);

	// Enhanced form handler untuk update data setelah submit
	const handleSchoolFormEnhance = () => {
		return enhance(async ({ result }) => {
			if (result.type === 'success' && result.data?.success) {
				// Invalidate dan reload data setelah sukses
				await invalidateAll();
			}
		});
	}

	// Enhanced form handler untuk export/import  
	const handleDatabaseFormEnhance = () => {
		return enhance(async ({ result }) => {
			if (result.type === 'success') {
				// Refresh page untuk memperbarui status
				await invalidateAll();
			}
		});
	}
</script>

<svelte:head>
	<title>Pengaturan Sistem - Admin</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-base-content">Pengaturan Sistem</h1>
		<p class="text-base-content/70 mt-2">Kelola pengaturan aplikasi absen guru</p>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="alert alert-success mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div>
				<span>{form.message}</span>
				{#if form.backupFile}
					<div class="mt-2">
						<a 
							href="/admin/pengaturan/download?file={form.backupFile}" 
							class="btn btn-sm btn-success btn-outline"
						>
							<Download class="w-4 h-4 mr-2" />
							Download {form.backupFile}
						</a>
					</div>
				{/if}
			</div>
		</div>
	{:else if form?.message}
		<div class="alert alert-error mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{form.message}</span>
		</div>
	{/if}

	<div class="grid gap-6">
		<!-- Data Sekolah -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4">
					<School class="w-6 h-6" />
					Data Sekolah
				</h2>
				
				<form method="POST" action="?/updateSchool" use:enhance={handleSchoolFormEnhance} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Nama Sekolah -->
						<fieldset class="fieldset">
							<legend class="fieldset-legend">Nama Sekolah <span class="text-error">*</span></legend>
							<label class="input input-bordered w-full">
								<Building class="w-4 h-4" />
								<input 
									type="text" 
									name="school_name" 
									placeholder="Masukkan nama sekolah"
									value={schoolSettings.school_name || ''}
									class="grow" 
									required 
								/>
							</label>
							<p class="label">Nama lengkap sekolah</p>
						</fieldset>

						<!-- NPSN -->
						<fieldset class="fieldset">
							<legend class="fieldset-legend">NPSN <span class="text-error">*</span></legend>
							<label class="input input-bordered w-full">
								<Hash class="w-4 h-4" />
								<input 
									type="text" 
									name="school_npsn" 
									placeholder="Nomor Pokok Sekolah Nasional"
									value={schoolSettings.school_npsn || ''}
									class="grow" 
									required 
								/>
							</label>
							<p class="label">NPSN dari Kementerian Pendidikan</p>
						</fieldset>

						<!-- No. Telepon -->
						<fieldset class="fieldset">
							<legend class="fieldset-legend">No. Telepon</legend>
							<label class="input input-bordered w-full">
								<Phone class="w-4 h-4" />
								<input 
									type="tel" 
									name="school_phone" 
									placeholder="021-12345678"
									value={schoolSettings.school_phone || ''}
									class="grow" 
								/>
							</label>
							<p class="label">Nomor telepon sekolah</p>
						</fieldset>

						<!-- Email -->
						<fieldset class="fieldset">
							<legend class="fieldset-legend">Email</legend>
							<label class="input input-bordered w-full">
								<Mail class="w-4 h-4" />
								<input 
									type="email" 
									name="school_email" 
									placeholder="info@sekolah.sch.id"
									value={schoolSettings.school_email || ''}
									class="grow" 
								/>
							</label>
							<p class="label">Alamat email sekolah</p>
						</fieldset>

						<!-- Kepala Sekolah -->
						<fieldset class="fieldset">
							<legend class="fieldset-legend">Kepala Sekolah</legend>
							{#if kepalaSekolahUsers.length > 0}
								<div class="form-control w-full">
									<div class="relative">
										<svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
										</svg>
										<select 
											name="school_principal_id" 
											class="select select-bordered w-full pl-10"
											bind:value={selectedKepalaSekolahId}
										>
											<option value="">Pilih Kepala Sekolah</option>
											{#each kepalaSekolahUsers as kepala}
												<option value={kepala.id}>
													{kepala.name} 
													{kepala.nip ? `(${kepala.nip})` : ''} 
													- {kepala.position}
												</option>
											{/each}
										</select>
									</div>
									{#if selectedKepalaSekolah}
										<div class="mt-2 text-sm text-base-content/70">
											<p><strong>Nama:</strong> {selectedKepalaSekolah.name}</p>
											{#if selectedKepalaSekolah.nip}
												<p><strong>NIP:</strong> {selectedKepalaSekolah.nip}</p>
											{/if}
										</div>
									{/if}
								</div>
								<!-- Hidden inputs for backward compatibility -->
								<input 
									type="hidden" 
									name="school_principal_name" 
									value={selectedKepalaSekolah?.name || ''}
								/>
								<input 
									type="hidden" 
									name="school_principal_nip" 
									value={selectedKepalaSekolah?.nip || ''}
								/>
							{:else}
								<div class="alert alert-warning">
									<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
									</svg>
									<div>
										<h3 class="font-bold">Tidak ada Kepala Sekolah</h3>
										<div class="text-xs">Silakan tambahkan user dengan jabatan "Kepala Sekolah" terlebih dahulu di menu <a href="/admin/users" class="link">Kelola User</a></div>
									</div>
								</div>
								<!-- Fallback manual inputs -->
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
									<fieldset class="fieldset">
										<legend class="fieldset-legend">Nama Kepala Sekolah (Manual)</legend>
										<label class="input input-bordered w-full">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
											</svg>
											<input 
												type="text" 
												name="school_principal_name" 
												placeholder="Nama lengkap kepala sekolah"
												value={schoolSettings.school_principal_name || ''}
												class="grow" 
											/>
										</label>
									</fieldset>
									<fieldset class="fieldset">
										<legend class="fieldset-legend">NIP Kepala Sekolah (Manual)</legend>
										<label class="input input-bordered w-full">
											<Hash class="w-4 h-4" />
											<input 
												type="text" 
												name="school_principal_nip" 
												placeholder="NIP kepala sekolah"
												value={schoolSettings.school_principal_nip || ''}
												class="grow" 
											/>
										</label>
									</fieldset>
								</div>
							{/if}
							<p class="label text-xs text-base-content/70">Data kepala sekolah akan otomatis diambil dari user dengan jabatan "Kepala Sekolah"</p>
						</fieldset>
					</div>

					<!-- Alamat Lengkap -->
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Alamat Lengkap</legend>
						<label class="textarea textarea-bordered w-full">
							<MapPin class="w-4 h-4" />
							<textarea 
								name="school_address" 
								placeholder="Masukkan alamat lengkap sekolah"
								rows="3"
								class="grow w-full"
							>{schoolSettings.school_address || ''}</textarea>
						</label>
						<p class="label">Alamat lengkap termasuk kode pos</p>
					</fieldset>

					<div class="card-actions justify-end mt-6">
						<button type="submit" class="btn btn-primary">
							<Save class="w-5 h-5 mr-2" />
							Simpan Data Sekolah
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Database Management -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4">
					<Database class="w-6 h-6" />
					Kelola Database
				</h2>
				
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Export Database -->
					<div class="space-y-4">
						<h3 class="font-semibold text-lg">Export Database</h3>
						<p class="text-sm text-base-content/70">
							Buat backup database untuk keamanan data. File backup akan disimpan di folder backups.
						</p>
						
						<form method="POST" action="?/exportDatabase" use:enhance={handleDatabaseFormEnhance}>
							<button type="submit" class="btn btn-success btn-block">
								<Download class="w-5 h-5 mr-2" />
								Export Database
							</button>
						</form>
						
						<div class="alert alert-info">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<div class="text-sm">
								<p class="font-semibold">Tips Export:</p>
								<ul class="list-disc list-inside mt-1 space-y-1">
									<li>Lakukan backup secara rutin</li>
									<li>Simpan file backup di tempat aman</li>
									<li>File berformat SQLite (.db)</li>
								</ul>
							</div>
						</div>
					</div>

					<!-- Import Database -->
					<div class="space-y-4">
						<h3 class="font-semibold text-lg">Import Database</h3>
						<p class="text-sm text-base-content/70">
							Restore database dari file backup. <strong class="text-warning">Hati-hati:</strong> Ini akan mengganti semua data yang ada.
						</p>
						
						<form method="POST" action="?/importDatabase" use:enhance={handleDatabaseFormEnhance} enctype="multipart/form-data" class="space-y-4">
							<div class="form-control">
								<label class="label" for="database_file">
									<span class="label-text">Pilih File Database</span>
								</label>
								<input 
									id="database_file"
									name="database_file"
									type="file" 
									accept=".db"
									class="file-input file-input-bordered w-full" 
									required
								/>
							</div>
							
							<div class="form-control">
								<label class="label cursor-pointer">
                  <input type="checkbox" class="checkbox checkbox-warning" required />
									<span class="label-text">Saya memahami risiko import database</span>
								</label>
							</div>
							
							<button 
								type="submit" 
								class="btn btn-warning btn-block"
							>
								<Upload class="w-5 h-5 mr-2" />
								Import Database
							</button>
						</form>
						
						<div class="alert alert-warning">
							<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
							<div class="text-sm">
								<p class="font-semibold">Peringatan Import:</p>
								<ul class="list-disc list-inside mt-1 space-y-1">
									<li>Semua data akan diganti</li>
									<li>Backup otomatis dibuat</li>
									<li>Pastikan file benar dan valid</li>
									<li>Maksimal ukuran file: 100MB</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Informasi Sistem -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-xl mb-4">Informasi Sistem</h2>
				<div class="stats stats-vertical lg:stats-horizontal shadow">
					<div class="stat">
						<div class="stat-title">Versi Aplikasi</div>
						<div class="stat-value text-2xl">1.0.0</div>
						<div class="stat-desc">SvelteKit + SQLite</div>
					</div>
					<div class="stat">
						<div class="stat-title">Database</div>
						<div class="stat-value text-2xl">SQLite</div>
						<div class="stat-desc">Drizzle ORM</div>
					</div>
					<div class="stat">
						<div class="stat-title">Framework</div>
						<div class="stat-value text-2xl">SvelteKit</div>
						<div class="stat-desc">+ DaisyUI + TailwindCSS</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>