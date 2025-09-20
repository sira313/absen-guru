<script>
	import { enhance } from '$app/forms';
	import { User, Mail, Lock, Save, Eye, EyeOff, Menu, LogOut, Calendar, Clock, BarChart3, FileText, Users, Sun, Moon } from 'lucide-svelte';
	
	export let data;
	export let form;
	
	let showCurrentPassword = false;
	let showNewPassword = false;
	let showConfirmPassword = false;

	$: user = data.user;
	$: isAdmin = user.role === 'admin';
</script>

<div class="drawer lg:drawer-open">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	
	<div class="drawer-content">
		<!-- Navbar -->
		<div class="navbar bg-base-100 shadow-sm sticky top-0 z-30">
			<div class="flex-1">
				<div class="flex-none lg:hidden">
					<label for="my-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost drawer-button mr-2">
						<Menu class="w-6 h-6" />
					</label>
				</div>
				<a class="btn btn-ghost text-xl" href={isAdmin ? '/admin' : '/guru'}>
					{#if isAdmin}
						<BarChart3 class="w-6 h-6 mr-2" />
						Admin Panel - Absen Guru
					{:else}
						<Clock class="w-6 h-6 mr-2" />
						Absen Guru
					{/if}
				</a>
			</div>
			<div class="flex gap-2">
				<!-- Theme Controller -->
				<label class="swap swap-rotate">
					<input type="checkbox" class="theme-controller" value="dark" />
					<Sun class="swap-off h-6 w-6 fill-current" />
					<Moon class="swap-on h-6 w-6 fill-current" />
				</label>
				
				<!-- User Profile Dropdown -->
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
						<div class="w-10 rounded-full">
							<div class="avatar placeholder">
								<div class="bg-neutral text-neutral-content rounded-full w-10 h-10">
									<span class="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
								</div>
							</div>
						</div>
					</div>
					<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
						<li>
							<a href="/profile" class="justify-between">
								<div class="flex items-center gap-2">
									<User class="w-4 h-4" />
									Profile
								</div>
								<span class="badge badge-sm">{isAdmin ? 'Admin' : 'Guru'}</span>
							</a>
						</li>
						<li><a href="/logout" data-sveltekit-preload-data="false">Logout</a></li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Page content -->
		<main class="flex-1 p-4 lg:p-6">
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
					<fieldset class="fieldset mb-4">
						<legend class="fieldset-legend">Username</legend>
						<input 
							type="text" 
							name="username" 
							class="input w-full" 
							placeholder="Masukkan username"
							value={data.user.username}
							required 
						/>
						<p class="label">Minimal 3 karakter, harus unik</p>
					</fieldset>

					<fieldset class="fieldset mb-4">
						<legend class="fieldset-legend">Email</legend>
						<input 
							type="email" 
							name="email" 
							class="input w-full" 
							placeholder="Masukkan email"
							value={data.user.email}
							required 
						/>
						<p class="label">Email harus valid dan unik</p>
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
					<fieldset class="fieldset mb-4">
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

					<fieldset class="fieldset mb-4">
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
		</main>
	</div>
	
	<div class="drawer-side">
		<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu text-base-content min-h-full w-80 p-4 bg-base-300">
			<!-- Header -->
			<div class="mb-6">
				<div class="text-xl font-bold text-center">
					{#if isAdmin}
						Menu Admin
					{:else}
						Menu Guru
					{/if}
				</div>
			</div>
			
			<!-- Menu items -->
			{#if isAdmin}
				<li>
					<a href="/admin" class="active:bg-primary active:text-primary-content">
						<BarChart3 class="w-5 h-5" />
						Dashboard
					</a>
				</li>
				<li>
					<a href="/admin/laporan">
						<FileText class="w-5 h-5" />
						Laporan
					</a>
				</li>
				<li>
					<a href="/admin/users">
						<Users class="w-5 h-5" />
						Kelola User
					</a>
				</li>
			{:else}
				<li>
					<a href="/guru" class="active:bg-primary active:text-primary-content">
						<Clock class="w-5 h-5" />
						Dashboard
					</a>
				</li>
				<li>
					<a href="/guru/riwayat">
						<Calendar class="w-5 h-5" />
						Riwayat Absensi
					</a>
				</li>
			{/if}
		</ul>
	</div>
</div>