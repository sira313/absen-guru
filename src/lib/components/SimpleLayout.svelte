<script>
	import { User, Sun, Moon } from 'lucide-svelte';
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [title]
	 * @property {boolean} [showThemeToggle]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { title = 'Absen Guru', showThemeToggle = true, children } = $props();
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
				<!-- Theme Controller -->
				<label class="swap swap-rotate">
					<input type="checkbox" class="theme-controller" value="dark" />
					<Sun class="swap-off h-6 w-6 fill-current" />
					<Moon class="swap-on h-6 w-6 fill-current" />
				</label>
			</div>
		</div>
	{/if}
	
	<!-- Page content -->
	<main class="container mx-auto px-4 py-8">
		{@render children?.()}
	</main>
</div>