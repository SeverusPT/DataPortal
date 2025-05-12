<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let items: string[] = [];
	export let activeItem: string = '';
</script>

<div role="tablist" class="tabs tabs-lifted tabs-lg w-fit">
	{#each items as item}
		<button
			role="tab"
			class="tab {item === activeItem ? 'tab-active' : ''} cursor-pointer"
			on:click={() => dispatch('tabChange', item)}
		>
			{item}
		</button>
	{/each}
</div>
