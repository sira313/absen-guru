<script>
	import { User, Info } from 'lucide-svelte';
	import ThemeController from './ThemeController.svelte';
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [title]
	 * @property {boolean} [showThemeToggle]
	 * @property {boolean} [showAboutLink]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { 
		title = 'Absen Guru', 
		showThemeToggle = true, 
		showAboutLink = true,
		children 
	} = $props();
</script>

<div class="min-h-screen bg-base-200">
	<!-- Simple Navbar -->
	{#if showThemeToggle}
		<div class="navbar bg-base-100 shadow-sm">
			<div class="flex-1">
				<a class="btn btn-ghost text-xl" href="/">
					<User class="w-6 h-6 mr-2" />
					{title}
				</a>
			</div>
			<div class="flex-none">
				<div class="flex items-center gap-2">
					<!-- About Link -->
					{#if showAboutLink}
						<a href="/about" class="btn btn-ghost btn-circle" title="Tentang Aplikasi">
							<Info class="w-5 h-5" />
						</a>
					{/if}
					
					<!-- Theme Controller -->
					<ThemeController />
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Page content -->
	<main class="container mx-auto px-4 py-8">
		{@render children?.()}
	</main>
</div>