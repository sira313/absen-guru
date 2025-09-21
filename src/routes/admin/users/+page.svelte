<script>
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { id as localeId } from 'date-fns/locale';
	import { Plus, ArrowLeft, Check, X, Users, Trash2, User, Mail, Lock, Shield, UserPlus, Edit3, Eye, EyeOff, Hash, BookOpen, Phone, Briefcase, Badge } from 'lucide-svelte';
	
	export let data;
	export let form;
	
	$: users = data.users;
	$: searchTerm = '';
	
	// Ignore unused SvelteKit props
	$$restProps;
	
	let showCreateForm = false;
	let editingUser = null;
	let deleteUserId = null;
	let selectedRole = '';
	let editSelectedRole = '';
	let showCreatePassword = false;
	let showEditPassword = false;
	
	function showDeleteConfirm(userId, userName) {
		if (confirm(`Yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
			deleteUserId = userId;
			document.getElementById('deleteForm').requestSubmit();
		}
	}

	function showEditForm(user) {
		editingUser = { ...user };
		editSelectedRole = user.role;
		showCreateForm = false; // Close create form if open
	}

	function cancelEdit() {
		editingUser = null;
		editSelectedRole = '';
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
		<div class="flex flex-col sm:flex-row gap-2">
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
					<div class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label" for="username">
									<span class="label-text">Username <span class="text-error">*</span></span>
								</label>
								<label class="input input-bordered flex items-center gap-2 w-full">
									<User class="w-4 h-4 opacity-70" />
									<input 
										type="text" 
										id="username"
										name="username" 
										required
										minlength="3"
										class="grow"
										placeholder="Masukkan username"
									/>
								</label>
							</div>

							<div class="form-control">
								<label class="label" for="name">
									<span class="label-text">Nama Lengkap <span class="text-error">*</span></span>
								</label>
								<label class="input input-bordered flex items-center gap-2 w-full">
									<User class="w-4 h-4 opacity-70" />
									<input 
										type="text" 
										id="name"
										name="name" 
										required
										class="grow"
										placeholder="Masukkan nama lengkap"
									/>
								</label>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label" for="email">
									<span class="label-text">Email</span>
								</label>
								<label class="input input-bordered flex items-center gap-2 w-full">
									<Mail class="w-4 h-4 opacity-70" />
									<input 
										type="email" 
										id="email"
										name="email" 
										class="grow"
										placeholder="user@example.com"
									/>
								</label>
							</div>

							<div class="form-control">
								<label class="label" for="nip">
									<span class="label-text">NIP</span>
								</label>
								<label class="input input-bordered flex items-center gap-2 w-full">
									<Hash class="w-4 h-4 opacity-70" />
									<input 
										type="text" 
										id="nip"
										name="nip" 
										class="grow"
										placeholder="Nomor Induk Pegawai"
									/>
								</label>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label" for="subject">
									<span class="label-text">Mata Pelajaran</span>
								</label>
								<label class="input input-bordered flex items-center gap-2 w-full">
									<BookOpen class="w-4 h-4 opacity-70" />
									<input 
										type="text" 
										id="subject"
										name="subject" 
										class="grow"
										placeholder="Mata pelajaran yang diajar"
									/>
								</label>
							</div>

							<div class="form-control">
								<label class="label" for="phone">
									<span class="label-text">Telefon</span>
								</label>
								<label class="input input-bordered flex items-center gap-2 w-full">
									<Phone class="w-4 h-4 opacity-70" />
									<input 
										type="tel" 
										id="phone"
										name="phone" 
										class="grow"
										placeholder="Nomor telefon"
									/>
								</label>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label" for="role">
									<span class="label-text">Role <span class="text-error">*</span></span>
								</label>
								<div class="relative">
									<Shield class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50 z-10 pointer-events-none" />
									<select 
										id="role"
										name="role" 
										required
										class="select select-bordered w-full pl-10"
										bind:value={selectedRole}
									>
										<option value="">Pilih Role</option>
										<option value="guru">Guru</option>
										<option value="admin">Admin</option>
									</select>
								</div>
							</div>

							<div class="form-control">
								<label class="label" for="password">
									<span class="label-text">Password <span class="text-error">*</span></span>
								</label>
								<label class="input input-bordered flex items-center gap-2 w-full">
									<Lock class="w-4 h-4" />
									<input 
										type={showCreatePassword ? 'text' : 'password'}
										id="password"
										name="password" 
										required
										minlength="6"
										class="grow"
										placeholder="Minimal 6 karakter"
									/>
									<button 
										type="button" 
										class="btn btn-circle btn-ghost btn-sm"
										on:click={() => showCreatePassword = !showCreatePassword}
									>
										{#if showCreatePassword}
											<EyeOff class="w-4 h-4" />
										{:else}
											<Eye class="w-4 h-4" />
										{/if}
									</button>
								</label>
							</div>
						</div>

						{#if selectedRole === 'guru'}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label" for="employeeType">
									<span class="label-text">Status Kepegawaian <span class="text-error">*</span></span>
								</label>
								<div class="relative">
									<Briefcase class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50 z-10 pointer-events-none" />
									<select 
										id="employeeType"
										name="employeeType" 
										required
										class="select select-bordered w-full pl-10"
									>
										<option value="">Pilih Status</option>
										<option value="PNS">PNS (Pegawai Negeri Sipil)</option>
										<option value="PPPK">PPPK (Pegawai Pemerintah dengan Perjanjian Kerja)</option>
										<option value="Honorer">Honorer</option>
									</select>
								</div>
							</div>

							<div class="form-control">
								<label class="label" for="position">
									<span class="label-text">Jabatan <span class="text-error">*</span></span>
								</label>
								<div class="relative">
									<Badge class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50 z-10 pointer-events-none" />
									<select 
										id="position"
										name="position" 
										required
										class="select select-bordered w-full pl-10"
									>
										<option value="">Pilih Jabatan</option>
										<option value="Kepala Sekolah">Kepala Sekolah</option>
										<option value="Guru Kelas">Guru Kelas</option>
										<option value="Guru Penjaskes">Guru Penjaskes</option>
										<option value="Guru Agama">Guru Agama</option>
									</select>
								</div>
							</div>
						</div>
						{:else if selectedRole === 'admin'}
						<input type="hidden" name="position" value="Administrator" />
						{/if}
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
								<th>Status Kepegawaian</th>
								<th>Jabatan</th>
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
									{#if user.role === 'guru' && user.employeeType}
										<div class="badge badge-outline 
											{user.employeeType === 'PNS' ? 'badge-success' : 
											 user.employeeType === 'PPPK' ? 'badge-info' : 'badge-warning'}">
											{user.employeeType}
										</div>
									{:else}
										<span class="text-sm opacity-50">-</span>
									{/if}
								</td>
								<td>
									{#if user.position}
										<div class="badge badge-outline
											{user.position === 'Kepala Sekolah' ? 'badge-primary' :
											 user.position === 'Administrator' ? 'badge-accent' : 'badge-neutral'}">
											{user.position}
										</div>
									{:else}
										<span class="text-sm opacity-50">-</span>
									{/if}
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
									<div class="flex gap-2">
										<button 
											on:click={() => showEditForm(user)}
											class="btn btn-sm btn-warning btn-outline"
										>
											<Edit3 class="w-4 h-4" />
											Edit
										</button>
										<button 
											on:click={() => showDeleteConfirm(user.id, user.name)}
											class="btn btn-sm btn-error btn-outline"
										>
											<Trash2 class="w-4 h-4" />
											Hapus
										</button>
									</div>
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

	<!-- Modal Edit User -->
	{#if editingUser}
	<div class="modal modal-open">
		<div class="modal-box max-w-2xl">
			<h3 class="font-bold text-lg mb-4">Edit User</h3>
			
			<form method="POST" action="?/updateUser" on:submit={() => editingUser = null}>
				<input type="hidden" name="id" value={editingUser.id}>
				
				<!-- Name -->
				<div class="form-control mb-4">
					<label class="label" for="edit-name">
						<span class="label-text">Nama <span class="text-red-500">*</span></span>
					</label>
					<label class="input input-bordered flex items-center gap-2 w-full">
						<User class="w-4 h-4 opacity-70" />
						<input 
							type="text" 
							id="edit-name"
							name="name" 
							value={editingUser.name}
							class="grow" 
							required 
						/>
					</label>
				</div>

				<!-- Email -->
				<div class="form-control mb-4">
					<label class="label" for="edit-email">
						<span class="label-text">Email <span class="text-red-500">*</span></span>
					</label>
					<label class="input input-bordered flex items-center gap-2 w-full">
						<Mail class="w-4 h-4 opacity-70" />
						<input 
							type="email" 
							id="edit-email"
							name="email" 
							value={editingUser.email}
							class="grow" 
							required 
						/>
					</label>
				</div>

				<!-- Role -->
				<div class="form-control mb-4">
					<label class="label" for="edit-role">
						<span class="label-text">Role <span class="text-red-500">*</span></span>
					</label>
					<div class="relative">
						<Shield class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50 z-10 pointer-events-none" />
						<select id="edit-role" name="role" class="select select-bordered w-full pl-10" bind:value={editSelectedRole} required>
							<option value="">Pilih Role</option>
							<option value="admin">Admin</option>
							<option value="guru">Guru</option>
						</select>
					</div>
				</div>

				<!-- Employee Type (only for guru) -->
				{#if editSelectedRole === 'guru'}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div class="form-control">
						<label class="label" for="edit-employee-type">
							<span class="label-text">Status Kepegawaian <span class="text-red-500">*</span></span>
						</label>
						<div class="relative">
							<Briefcase class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50 z-10 pointer-events-none" />
							<select id="edit-employee-type" name="employee_type" class="select select-bordered w-full pl-10">
								<option value="">Pilih Status</option>
								<option value="PNS" selected={editingUser.employee_type === 'PNS'}>PNS</option>
								<option value="PPPK" selected={editingUser.employee_type === 'PPPK'}>PPPK</option>
								<option value="Honorer" selected={editingUser.employee_type === 'Honorer'}>Honorer</option>
							</select>
						</div>
					</div>

					<div class="form-control">
						<label class="label" for="edit-position">
							<span class="label-text">Jabatan <span class="text-red-500">*</span></span>
						</label>
						<div class="relative">
							<Badge class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50 z-10 pointer-events-none" />
							<select id="edit-position" name="position" class="select select-bordered w-full pl-10">
								<option value="">Pilih Jabatan</option>
								<option value="Kepala Sekolah" selected={editingUser.position === 'Kepala Sekolah'}>Kepala Sekolah</option>
								<option value="Guru Kelas" selected={editingUser.position === 'Guru Kelas'}>Guru Kelas</option>
								<option value="Guru Penjaskes" selected={editingUser.position === 'Guru Penjaskes'}>Guru Penjaskes</option>
								<option value="Guru Agama" selected={editingUser.position === 'Guru Agama'}>Guru Agama</option>
							</select>
						</div>
					</div>
				</div>
				{:else if editSelectedRole === 'admin'}
				<input type="hidden" name="position" value="Administrator" />
				{/if}

				<!-- Password Change -->
				<div class="form-control mb-4">
					<label class="label" for="edit-password">
						<span class="label-text">Password Baru</span>
						<span class="label-text-alt text-gray-500">Kosongkan jika tidak ingin mengubah</span>
					</label>
					<label class="input input-bordered w-full">
						<Lock class="w-4 h-4" />
						<input 
							type={showEditPassword ? 'text' : 'password'}
							id="edit-password"
							name="newPassword" 
							class="grow" 
							placeholder="Masukkan password baru (opsional)"
							minlength="6"
						/>
						<button 
							type="button" 
							class="btn btn-circle btn-ghost btn-sm"
							on:click={() => showEditPassword = !showEditPassword}
						>
							{#if showEditPassword}
								<EyeOff class="w-4 h-4" />
							{:else}
								<Eye class="w-4 h-4" />
							{/if}
						</button>
					</label>
				</div>

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" on:click={cancelEdit}>
						Batal
					</button>
					<button type="submit" class="btn btn-primary">
						Simpan Perubahan
					</button>
				</div>
			</form>
		</div>
	</div>
	{/if}

	<!-- Hidden Delete Form -->
	<form id="deleteForm" method="POST" action="?/delete" use:enhance style="display: none;">
		<input type="hidden" name="userId" value={deleteUserId} />
	</form>
</div>