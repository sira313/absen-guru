<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Download, Smartphone, X } from 'lucide-svelte';
	
	// PWA install prompt
	let deferredPrompt = null;
	let showInstallBanner = false;
	let isInstalled = false;
	
	onMount(() => {
		// Check if already installed
		if (browser) {
			isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
						  window.navigator.standalone || 
						  document.referrer.includes('android-app://');
			
			// Don't show banner if already installed or previously dismissed
			if (isInstalled || localStorage.getItem('pwa-banner-dismissed') === 'true') {
				return;
			}
			
			// Handle PWA install prompt
			window.addEventListener('beforeinstallprompt', (e) => {
				console.log('beforeinstallprompt triggered');
				e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
				deferredPrompt = e;
				showInstallBanner = true;
			});
			
			// Listen for app installed
			window.addEventListener('appinstalled', (e) => {
				console.log('PWA was installed');
				showInstallBanner = false;
				deferredPrompt = null;
				isInstalled = true;
				localStorage.removeItem('pwa-banner-dismissed');
			});
		}
	});
	
	async function installPWA() {
		if (deferredPrompt) {
			try {
				deferredPrompt.prompt();
				const { outcome } = await deferredPrompt.userChoice;
				console.log(`User response to the install prompt: ${outcome}`);
				if (outcome === 'accepted') {
					console.log('User accepted the install prompt');
				} else {
					console.log('User dismissed the install prompt');
				}
				showInstallBanner = false;
				deferredPrompt = null;
			} catch (error) {
				console.error('Error showing install prompt:', error);
				showInstallBanner = false;
			}
		}
	}
	
	function dismissBanner() {
		showInstallBanner = false;
		// Remember user dismissed (optional - you could use localStorage)
		if (browser) {
			localStorage.setItem('pwa-banner-dismissed', 'true');
		}
	}
</script>

{#if showInstallBanner && !isInstalled}
	<div class="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl mb-6">
		<div class="card-body">
			<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
				<div class="flex items-start lg:items-center gap-4">
					<div class="avatar">
						<div class="rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl leading-none">
							🎯
						</div>
					</div>
					<div class="flex-1">
						<h3 class="card-title text-lg">📱 Install Absen Guru</h3>
						<p class="text-sm opacity-90 mb-3">
							Install aplikasi ini di perangkat Anda untuk akses cepat dan pengalaman yang lebih baik!
						</p>
						<div class="flex flex-wrap items-center gap-2 text-xs opacity-80">
							<span class="badge badge-primary badge-outline bg-primary-content text-primary">
								✨ Akses Offline
							</span>
							<span class="badge badge-primary badge-outline bg-primary-content text-primary">
								🚀 Loading Lebih Cepat  
							</span>
							<span class="badge badge-primary badge-outline bg-primary-content text-primary">
								📱 Seperti App Native
							</span>
						</div>
					</div>
				</div>
				
				<div class="flex flex-row lg:flex-col xl:flex-row gap-2">
					<button 
						class="btn btn-sm btn-ghost hover:bg-primary-content hover:text-primary flex-1 lg:flex-none"
						on:click={dismissBanner}
						title="Tutup"
					>
						<X class="w-4 h-4" />
						<span class="hidden sm:inline">Nanti Saja</span>
						<span class="sm:hidden">Nanti</span>
					</button>
					<button 
						class="btn btn-sm btn-primary-content text-primary hover:bg-white flex-1 lg:flex-none"
						on:click={installPWA}
					>
						<Download class="w-4 h-4" />
						Install
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}