<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { Plus, ArrowLeft, Check, X, Users, Trash2, User, Mail, Lock, Shield, UserPlus } from 'lucide-svelte';
	
	export let data;
	export let form;
	
	$: users = data.users;
	$: searchTerm = '';
	
	// Ignore unused SvelteKit props
	$$restProps;
	
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
	<div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold text-base-content">Kelola User</h1>
			<p class="text-lg text-base-content/70">Manajemen pengguna sistem</p>
		</div>
		<div class="flex gap-2">
			<button 
				on:click={() => {
					console.log('Toggle button clicked, current state:', showCreateForm);
					showCreateForm = !showCreateForm;
					console.log('New state:', showCreateForm);
				}}
				class="btn btn-primary"
			>
				<Plus class="w-5 h-5" />
				{showCreateForm ? 'Tutup Form' : 'Tambah User'}
			</button>
			<a href="/admin" class="btn btn-outline">
				<ArrowLeft class="w-5 h-5" />
				Kembali
			</a>
		</div>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="alert alert-success">
			<Check class="w-6 h-6" />
			<span>{form.message}</span>
		</div>
	{:else if form?.message}
		<div class="alert alert-error">
			<X class="w-6 h-6" />
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Create User Form -->
	{#if showCreateForm}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">
					<UserPlus class="w-5 h-5" />
					Tambah User Baru
				</h2>
				<form 
					method="POST" 
					action="?/create" 
					class="space-y-4"
					on:submit={(e) => {
						console.log('Form submit event triggered');
						console.log('Form data:', new FormData(e.target));
					}}
				>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label" for="username">
								<span class="label-text">Username <span class="text-error">*</span></span>
							</label>
							<div class="relative">
								<User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<input 
									type="text" 
									id="username"
									name="username" 
									required
									minlength="3"
									class="input input-bordered w-full pl-10"
									placeholder="Masukkan username"
								/>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="name">
								<span class="label-text">Nama Lengkap <span class="text-error">*</span></span>
							</label>
							<div class="relative">
								<User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<input 
									type="text" 
									id="name"
									name="name" 
									required
									class="input input-bordered w-full pl-10"
									placeholder="Masukkan nama lengkap"
								/>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="email">
								<span class="label-text">Email</span>
							</label>
							<div class="relative">
								<Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<input 
									type="email" 
									id="email"
									name="email" 
									class="input input-bordered w-full pl-10"
									placeholder="user@example.com"
								/>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="nip">
								<span class="label-text">NIP</span>
							</label>
							<div class="relative">
								<User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<input 
									type="text" 
									id="nip"
									name="nip" 
									class="input input-bordered w-full pl-10"
									placeholder="Nomor Induk Pegawai"
								/>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="subject">
								<span class="label-text">Mata Pelajaran</span>
							</label>
							<div class="relative">
								<User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<input 
									type="text" 
									id="subject"
									name="subject" 
									class="input input-bordered w-full pl-10"
									placeholder="Mata pelajaran yang diajar"
								/>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="phone">
								<span class="label-text">Telefon</span>
							</label>
							<div class="relative">
								<User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<input 
									type="tel" 
									id="phone"
									name="phone" 
									class="input input-bordered w-full pl-10"
									placeholder="Nomor telefon"
								/>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="password">
								<span class="label-text">Password <span class="text-error">*</span></span>
							</label>
							<div class="relative">
								<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<input 
									type="password" 
									id="password"
									name="password" 
									required
									minlength="6"
									class="input input-bordered w-full pl-10"
									placeholder="Minimal 6 karakter"
								/>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="role">
								<span class="label-text">Role <span class="text-error">*</span></span>
							</label>
							<div class="relative">
								<Shield class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
								<select 
									id="role"
									name="role" 
									required
									class="select select-bordered w-full pl-10"
								>
									<option value="">Pilih Role</option>
									<option value="guru">Guru</option>
									<option value="admin">Admin</option>
								</select>
							</div>
						</div>
					</div>

					<div class="flex gap-4 mt-6">
						<button 
							type="submit" 
							class="btn btn-primary"
							on:click={() => console.log('Submit button clicked')}
						>
							<Check class="w-5 h-5" />
							Simpan User
						</button>
						<button 
							type="button" 
							on:click={() => showCreateForm = false}
							class="btn btn-outline"
						>
							<X class="w-5 h-5" />
							Batal
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Users List -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex justify-between items-center mb-4">
				<h2 class="card-title">
					<Users class="w-5 h-5" />
					Daftar User
				</h2>
				<div class="text-sm opacity-70">Total: {users.length} user</div>
			</div>
			<div class="overflow-x-auto">
				{#if users.length > 0}
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Nama</th>
								<th>Username</th>
								<th>Email</th>
								<th>Role</th>
								<th>Dibuat</th>
								<th>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each users as user}
							<tr>
								<td class="font-medium">{user.name}</td>
								<td class="text-sm opacity-70">{user.username}</td>
								<td>{user.email}</td>
								<td>
									<div class="badge {user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}">
										{user.role === 'admin' ? 'Admin' : 'Guru'}
									</div>
								</td>
								<td>
									{#if user.createdAt}
										{@const dateValue = new Date(user.createdAt)}
										{#if !isNaN(dateValue.getTime())}
											{format(dateValue, 'dd MMM yyyy', { locale: localeId })}
										{:else}
											-
										{/if}
									{:else}
										-
									{/if}
								</td>
								<td>
									<button 
										on:click={() => showDeleteConfirm(user.id, user.name)}
										class="btn btn-sm btn-error btn-outline"
									>
										<Trash2 class="w-4 h-4" />
										Hapus
									</button>
								</td>
							</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<div class="hero min-h-96 bg-base-200 rounded-lg">
						<div class="hero-content text-center">
							<div>
								<Users class="w-16 h-16 mx-auto text-base-content/30 mb-4" />
								<h3 class="text-lg font-medium text-base-content mb-2">Tidak ada user</h3>
								<p class="text-base-content/70">Belum ada user yang terdaftar di sistem.</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Hidden Delete Form -->
	<form id="deleteForm" method="POST" action="?/delete" use:enhance style="display: none;">
		<input type="hidden" name="userId" value={deleteUserId} />
	</form>
</div>