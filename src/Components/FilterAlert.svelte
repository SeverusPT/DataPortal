<script lang="ts">
	import { t } from '$lib/lang';
	import { alert, hideAlert, showAlert } from '$lib/stores/alert';
	import { onMount } from 'svelte';

	onMount(() => {
		showAlert();
	});
</script>

{#if $alert}
	<div class="toast toast-end toast-top z-50">
		<div class="sticky top-0">
			<button
				class="btn btn-circle btn-xs absolute right-0 top-0"
				on:click={() => {
					hideAlert();
				}}>✕</button
			>
		</div>
		<div class="alert alert-warning max-w-lg whitespace-normal" role="alert">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 flex-shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/></svg
			>
			<span>{$t.files.nameErrors}</span>
		</div>
	</div>
{/if}
