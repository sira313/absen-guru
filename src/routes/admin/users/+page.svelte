<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	
	export let data;
	export let form;
	
	$: users = data.users;
	
	let showCreateForm = false;
	let deleteUserId = null;
	
	function showDeleteConfirm(userId, userName) {
		if (confirm(`Yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
			deleteUserId = userId;
			document.getElementById('deleteForm').requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>Kelola User - Admin</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">Kelola User</h1>
			<p class="text-lg opacity-70">Manajemen pengguna sistem</p>
		</div>
		<div class="flex gap-2">
			<button 
				on:click={() => showCreateForm = !showCreateForm}
				class="btn btn-primary"
			>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
				</svg>
				Tambah User
			</button>
			<a href="/admin" class="btn btn-outline">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
				</svg>
				Kembali
			</a>
		</div>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="alert alert-success">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<span>{form.message}</span>
		</div>
	{:else if form?.message}
		<div class="alert alert-error">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Create User Form -->
	{#if showCreateForm}
		<div class="card">
			<div class="card-header">
				<h2 class="card-title">Tambah User Baru</h2>
			</div>
			<div class="p-6">
				<form method="POST" action="?/create" use:enhance>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2" for="fullName">
								Nama Lengkap <span class="text-red-500">*</span>
							</label>
							<input 
								type="text" 
								id="fullName"
								name="fullName" 
								required
								class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Masukkan nama lengkap"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium mb-2" for="email">
								Email <span class="text-red-500">*</span>
							</label>
							<input 
								type="email" 
								id="email"
								name="email" 
								required
								class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="user@example.com"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium mb-2" for="password">
								Password <span class="text-red-500">*</span>
							</label>
							<input 
								type="password" 
								id="password"
								name="password" 
								required
								minlength="6"
								class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Minimal 6 karakter"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium mb-2" for="role">
								Role <span class="text-red-500">*</span>
							</label>
							<select 
								id="role"
								name="role" 
								required
								class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Pilih Role</option>
								<option value="guru">Guru</option>
								<option value="admin">Admin</option>
							</select>
						</div>
					</div>

					<div class="flex gap-4 mt-6">
						<button type="submit" class="btn btn-primary">
							<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							Simpan User
						</button>
						<button 
							type="button" 
							on:click={() => showCreateForm = false}
							class="btn btn-outline"
						>
							Batal
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Users List -->
	<div class="card">
		<div class="card-header">
			<h2 class="card-title">Daftar User</h2>
			<p class="text-sm opacity-70">Total: {users.length} user</p>
		</div>
		<div class="overflow-x-auto">
			{#if users.length > 0}
				<table class="table">
					<thead>
						<tr>
							<th>Nama</th>
							<th>Email</th>
							<th>Role</th>
							<th>Dibuat</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each users as user}
						<tr>
							<td class="font-medium">{user.fullName}</td>
							<td>{user.email}</td>
							<td>
								<span class="badge {user.role === 'admin' ? 'primary' : 'secondary'}">
									{user.role === 'admin' ? 'Admin' : 'Guru'}
								</span>
							</td>
							<td>{format(new Date(user.created_at), 'dd MMM yyyy', { locale: localeId })}</td>
							<td>
								<button 
									on:click={() => showDeleteConfirm(user.id, user.fullName)}
									class="btn btn-sm btn-error"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
									</svg>
									Hapus
								</button>
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="p-8 text-center">
					<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
					</svg>
					<h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada user</h3>
					<p class="text-gray-500">Belum ada user yang terdaftar di sistem.</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Hidden Delete Form -->
	<form id="deleteForm" method="POST" action="?/delete" use:enhance style="display: none;">
		<input type="hidden" name="userId" value={deleteUserId} />
	</form>
</div>