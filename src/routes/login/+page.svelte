<script>
	import { enhance } from '$app/forms';
	import { User, Lock, School, Eye, EyeOff } from 'lucide-svelte';
	import SimpleLayout from '$lib/components/SimpleLayout.svelte';
	
	export let form;
	
	let showPassword = false;
	
	// Ignore unused SvelteKit props
	$$restProps;
</script>

<svelte:head>
	<title>Login - Absen Guru</title>
</svelte:head>

<SimpleLayout showThemeToggle={false}>
	<div class="hero min-h-[80vh]">
		<div class="hero-content flex-col lg:flex-row-reverse">
			<div class="text-center lg:text-left">
				<div class="flex items-center justify-center lg:justify-start mb-4">
					<School class="w-12 h-12 mr-3 text-primary" />
					<h1 class="text-5xl font-bold">Absen Guru</h1>
				</div>
				<p class="py-6 text-base-content/70">
					Sistem absensi untuk guru. Masuk untuk mulai absen atau kelola data absensi.
				</p>
			</div>
			
			<div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			<form method="POST" use:enhance class="card-body">
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<label class="input input-bordered w-full">
						<User class="w-4 h-4" />
						<input 
							id="username"
							name="username" 
							type="text" 
							placeholder="Masukkan username" 
							class="grow"
							class:input-error={form?.message}
							value={form?.username ?? ''}
							required 
						/>
					</label>
				</div>
				
				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<label class="input input-bordered w-full">
						<Lock class="w-4 h-4" />
						<input 
							id="password"
							name="password" 
							type={showPassword ? 'text' : 'password'}
							placeholder="Masukkan password" 
							class="grow"
							class:input-error={form?.message}
							required 
						/>
						<button 
							type="button" 
							class="btn btn-circle btn-ghost btn-sm"
							on:click={() => showPassword = !showPassword}
						>
							{#if showPassword}
								<EyeOff class="w-4 h-4" />
							{:else}
								<Eye class="w-4 h-4" />
							{/if}
						</button>
					</label>
				</div>
				
				{#if form?.message}
					<div class="alert alert-error">
						<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{form.message}</span>
					</div>
				{/if}
				
				<div class="form-control mt-6">
					<button class="btn btn-primary" type="submit">
						Login
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
</SimpleLayout>