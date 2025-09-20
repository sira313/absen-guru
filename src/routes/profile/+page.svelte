<script>
	import { enhance } from '$app/forms';
	import { User, Lock, Save, Eye, EyeOff } from 'lucide-svelte';
	import AppLayout from '$lib/components/AppLayout.svelte';
	
	export let data;
	export let form;
	
	let showCurrentPassword = false;
	let showNewPassword = false;
	let showConfirmPassword = false;

	$: user = data.user;
</script>

<svelte:head>
	<title>Profile Settings - {user.name}</title>
</svelte:head>

<AppLayout {user}>
	<div class="container mx-auto max-w-4xl">
	<div class="flex items-center gap-3 mb-8">
		<User class="w-8 h-8 text-primary" />
		<h1 class="text-3xl font-bold">Profile Settings</h1>
	</div>

	<!-- Alert Messages -->
	{#if form?.success}
		<div class="alert alert-success mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="alert alert-error mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{form.message}</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Profile Information -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title flex items-center gap-2 mb-4">
					<User class="w-5 h-5" />
					Informasi Profile
				</h2>

				<form method="POST" action="?/updateProfile" use:enhance>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Nama Lengkap</legend>
						<input 
							type="text" 
							name="name" 
							class="input w-full" 
							placeholder="Masukkan nama lengkap"
							value={data.user.name || ''}
							required 
						/>
						<p class="label">Nama lengkap yang akan ditampilkan</p>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Username</legend>
						<input 
							type="text" 
							name="username" 
							class="input w-full" 
							placeholder="Masukkan username"
							value={data.user.username || ''}
							required 
						/>
						<p class="label">Minimal 3 karakter, harus unik</p>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Email</legend>
						<input 
							type="email" 
							name="email" 
							class="input w-full" 
							placeholder="Masukkan email"
							value={data.user.email || ''}
							required 
						/>
						<p class="label">Email harus valid dan unik</p>
					</fieldset>

					{#if user.role === 'guru'}
					<fieldset class="fieldset">
						<legend class="fieldset-legend">NIP</legend>
						<input 
							type="text" 
							name="nip" 
							class="input w-full" 
							placeholder="Masukkan NIP"
							value={data.user.nip || ''}
						/>
						<p class="label">Nomor Induk Pegawai</p>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Mata Pelajaran</legend>
						<input 
							type="text" 
							name="subject" 
							class="input w-full" 
							placeholder="Masukkan mata pelajaran"
							value={data.user.subject || ''}
						/>
						<p class="label">Mata pelajaran yang diampu</p>
					</fieldset>
					{/if}

					<fieldset class="fieldset">
						<legend class="fieldset-legend">No. Telepon</legend>
						<input 
							type="tel" 
							name="phone" 
							class="input w-full" 
							placeholder="Masukkan nomor telepon"
							value={data.user.phone || ''}
						/>
						<p class="label">Nomor telepon aktif</p>
					</fieldset>

					<fieldset class="fieldset mb-6">
						<legend class="fieldset-legend">Role</legend>
						<input 
							type="text" 
							class="input w-full" 
							value={data.user.role}
							disabled
						/>
						<p class="label">Role tidak dapat diubah</p>
					</fieldset>

					<div class="card-actions justify-end">
						<button type="submit" class="btn btn-primary">
							<Save class="w-4 h-4 mr-2" />
							Simpan Profile
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Change Password -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title flex items-center gap-2 mb-4">
					<Lock class="w-5 h-5" />
					Ubah Password 
				</h2>

				<form method="POST" action="?/changePassword" use:enhance>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Password Lama</legend>
						<label class="input w-full">
							<Lock class="w-4 h-4" />
							<input 
								type={showCurrentPassword ? 'text' : 'password'}
								name="currentPassword" 
								placeholder="Masukkan password lama"
								class="grow" 
								required 
							/>
							<button 
								type="button" 
								class="btn btn-circle btn-ghost btn-sm"
								on:click={() => showCurrentPassword = !showCurrentPassword}
							>
								{#if showCurrentPassword}
									<EyeOff class="w-4 h-4" />
								{:else}
									<Eye class="w-4 h-4" />
								{/if}
							</button>
						</label>
						<p class="label">Masukkan password saat ini untuk verifikasi</p>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Password Baru</legend>
						<label class="input w-full">
							<Lock class="w-4 h-4" />
							<input 
								type={showNewPassword ? 'text' : 'password'}
								name="newPassword" 
								placeholder="Masukkan password baru"
								class="grow" 
								required 
							/>
							<button 
								type="button" 
								class="btn btn-circle btn-ghost btn-sm"
								on:click={() => showNewPassword = !showNewPassword}
							>
								{#if showNewPassword}
									<EyeOff class="w-4 h-4" />
								{:else}
									<Eye class="w-4 h-4" />
								{/if}
							</button>
						</label>
						<p class="label">Minimal 6 karakter</p>
					</fieldset>

					<fieldset class="fieldset mb-6">
						<legend class="fieldset-legend">Konfirmasi Password</legend>
						<label class="input w-full">
							<Lock class="w-4 h-4" />
							<input 
								type={showConfirmPassword ? 'text' : 'password'}
								name="confirmPassword" 
								placeholder="Konfirmasi password baru"
								class="grow" 
								required 
							/>
							<button 
								type="button" 
								class="btn btn-circle btn-ghost btn-sm"
								on:click={() => showConfirmPassword = !showConfirmPassword}
							>
								{#if showConfirmPassword}
									<EyeOff class="w-4 h-4" />
								{:else}
									<Eye class="w-4 h-4" />
								{/if}
							</button>
						</label>
						<p class="label">Pastikan password sama dengan yang baru</p>
					</fieldset>

					<div class="card-actions justify-end">
						<button type="submit" class="btn btn-warning">
							<Lock class="w-4 h-4 mr-2" />
							Ubah Password
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</AppLayout>