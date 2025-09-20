<script>
	import { enhance } from '$app/forms';
	
	export let form;
</script>

<svelte:head>
	<title>Login - Absen Guru</title>
</svelte:head>

<div class="hero min-h-screen">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Absen Guru</h1>
			<p class="py-6 text-gray-600">Sistem absensi untuk guru. Masuk untuk mulai absen atau kelola data absensi.</p>
		</div>
		
		<div class="card shrink-0 w-full max-w-sm shadow-2xl">
			<form method="POST" use:enhance>
				<div class="form-group">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input 
						id="username"
						name="username" 
						type="text" 
						placeholder="username" 
						class="input" 
						class:border-red-500={form?.message}
						value={form?.username ?? ''}
						required 
					/>
				</div>
				
				<div class="form-group">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input 
						id="password"
						name="password" 
						type="password" 
						placeholder="password" 
						class="input"
						class:border-red-500={form?.message}
						required 
					/>
				</div>
				
				{#if form?.message}
					<div class="alert alert-error">
						<span>{form.message}</span>
					</div>
				{/if}
				
				<div class="form-group mt-6">
					<button class="btn btn-primary w-full" type="submit">Login</button>
				</div>
			</form>
		</div>
	</div>
</div>