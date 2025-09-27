<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Wifi, WifiOff, CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';

	let { 
		message = '', 
		type = 'info', // 'success', 'error', 'warning', 'info'
		duration = 4000,
		position = 'top-center', // 'top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left'
		showIcon = true,
		closable = true,
		onClose = () => {}
	} = $props();

	let visible = $state(true);
	let timeoutId;

	// Auto hide after duration
	onMount(() => {
		if (duration > 0) {
			timeoutId = setTimeout(() => {
				hide();
			}, duration);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	function hide() {
		visible = false;
		setTimeout(() => {
			onClose();
		}, 300); // Wait for animation to complete
	}

	function getIcon(type) {
		switch (type) {
			case 'success': return CheckCircle;
			case 'error': return AlertCircle;
			case 'warning': return AlertCircle;
			case 'online': return Wifi;
			case 'offline': return WifiOff;
			default: return Info;
		}
	}

	function getTypeClass(type) {
		switch (type) {
			case 'success': return 'alert-success';
			case 'error': return 'alert-error';
			case 'warning': return 'alert-warning';
			case 'online': return 'alert-success';
			case 'offline': return 'alert-warning';
			default: return 'alert-info';
		}
	}

	// DaisyUI toast positioning is handled by parent container
	// No need for custom positioning classes

	let IconComponent = $derived(getIcon(type));
</script>

{#if visible}
	<div 
		class="alert {getTypeClass(type)} shadow-lg mb-2"
		transition:fly={{ y: -50, duration: 300 }}
	>
		{#if showIcon}
			<IconComponent class="w-5 h-5 flex-shrink-0" />
		{/if}
		
		<div class="flex-1">
			<span class="font-medium text-sm">{message}</span>
		</div>

		{#if closable}
			<button 
				class="btn btn-ghost btn-xs opacity-60 hover:opacity-100"
				onclick={hide}
				aria-label="Close notification"
			>
				<X class="w-3 h-3" />
			</button>
		{/if}
	</div>
{/if}

<!-- Using Svelte transitions instead of CSS animations -->