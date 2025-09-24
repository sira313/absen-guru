<script>
	import { createEventDispatcher } from 'svelte';
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [value]
	 * @property {boolean} [disabled]
	 * @property {string} [name]
	 * @property {string} [id]
	 * @property {string} [label]
	 * @property {boolean} [required]
	 * @property {string} [placeholder]
	 */

	/** @type {Props} */
	let {
		value = $bindable(''),
		disabled = false,
		name = '',
		id = '',
		label = '',
		required = false,
		placeholder = ''
	} = $props();

	const dispatch = createEventDispatcher();

	function handleDateChange(event) {
		value = event.target.value;
		dispatch('change', { value: event.target.value });
	}
</script>

{#if label}
	<label for={id} class="label">
		<span class="label-text">{label}</span>
		{#if required}
			<span class="text-error">*</span>
		{/if}
	</label>
{/if}

<input 
	type="date" 
	{id}
	{name}
	{required}
	{disabled}
	bind:value
	onchange={handleDateChange}
	class="input input-bordered w-full"
	class:input-disabled={disabled}
	{placeholder}
/>