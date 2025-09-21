<script>
	import { createEventDispatcher } from 'svelte';
	
	export let value = '';
	export let disabled = false;
	export let name = '';
	export let id = '';
	export let label = '';
	export let required = false;

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
	on:change={handleDateChange}
	class="input input-bordered w-full"
	class:input-disabled={disabled}
/>

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
	on:change={handleDateChange}
	class="input input-bordered w-full"
	class:input-disabled={disabled}
/>