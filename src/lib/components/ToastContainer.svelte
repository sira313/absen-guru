<script>
	import { toasts, removeToast } from '$lib/stores/toast.js';
	import ToastNotification from './ToastNotification.svelte';
</script>

<!-- DaisyUI Toast Container -->
<div class="toast toast-top toast-center z-50">
	{#each $toasts as toast (toast.id)}
		<ToastNotification
			message={toast.message}
			type={toast.type}
			duration={4000}
			showIcon={true}
			closable={true}
			onClose={() => removeToast(toast.id)}
		/>
	{/each}
</div>

<!-- No custom styles needed - using DaisyUI toast classes -->