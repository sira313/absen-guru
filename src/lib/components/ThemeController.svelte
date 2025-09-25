<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Sun, Moon } from 'lucide-svelte';
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [size] - Size of the theme toggle: 'sm', 'md', 'lg'
	 */

	/** @type {Props} */
	let { size = 'md' } = $props();
	
	let currentTheme = $state('light');
	let systemThemeCleanup;
	
	// Get theme from localStorage or system preference
	function getInitialTheme() {
		if (!browser) return 'light';
		
		try {
			const saved = localStorage.getItem('selected-theme');
			if (saved) {
				return saved;
			}
			// Jika belum ada yang disimpan, gunakan tema sistem
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				return 'dark';
			}
			return 'light';
		} catch {
			return 'light';
		}
	}
	
	// Save theme to localStorage
	function saveTheme(theme) {
		if (browser) {
			try {
				localStorage.setItem('selected-theme', theme);
			} catch (e) {
				console.warn('Failed to save theme to localStorage:', e);
			}
		}
	}
	
	// Apply theme to document
	function applyTheme(theme) {
		if (browser) {
			document.documentElement.setAttribute('data-theme', theme);
		}
	}
	
	// Handle theme toggle - DaisyUI will automatically handle the swap animation
	function handleToggle(event) {
		const isChecked = event.target.checked;
		const newTheme = isChecked ? 'dark' : 'light';
		
		console.log('Theme toggle:', { isChecked, newTheme, currentTheme });
		
		currentTheme = newTheme;
		applyTheme(newTheme);
		saveTheme(newTheme);
		
		console.log('Theme applied:', document.documentElement.getAttribute('data-theme'));
	}
	
	// Watch system theme changes (only if user hasn't manually set theme)
	function watchSystemTheme() {
		if (!browser || !window.matchMedia) return;
		
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		
		const handleSystemChange = (e) => {
			try {
				const saved = localStorage.getItem('selected-theme');
				if (!saved) {
					// User belum pernah memilih tema, ikuti sistem
					const systemTheme = e.matches ? 'dark' : 'light';
					currentTheme = systemTheme;
					applyTheme(systemTheme);
				}
			} catch (e) {
				console.warn('Failed to handle system theme change:', e);
			}
		};
		
		mediaQuery.addEventListener('change', handleSystemChange);
		
		return () => {
			mediaQuery.removeEventListener('change', handleSystemChange);
		};
	}
	
	onMount(() => {
		if (browser) {
			// Initialize theme
			currentTheme = getInitialTheme();
			applyTheme(currentTheme);
			
			// Watch system theme changes
			systemThemeCleanup = watchSystemTheme();
		}
	});
	
	onDestroy(() => {
		if (systemThemeCleanup) {
			systemThemeCleanup();
		}
	});
	
	// Get icon size classes
	let iconClasses = $derived(() => {
		return size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
	});
</script>

<!-- DaisyUI Theme Controller using swap -->
<label class="swap swap-rotate btn btn-ghost btn-circle" title="Toggle theme">
	<!-- this hidden checkbox controls the state and theme -->
	<input 
		type="checkbox" 
		class="theme-controller" 
		value="dark"
		checked={currentTheme === 'dark'}
		onchange={handleToggle}
	/>
	
	<!-- sun icon (shows in light mode) -->
	<Sun class="swap-off {iconClasses}" />
	
	<!-- moon icon (shows in dark mode) -->
	<Moon class="swap-on {iconClasses}" />
</label>