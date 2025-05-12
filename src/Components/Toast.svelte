<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toasts } from '$lib/stores/toast';
</script>

{#if $toasts}
	<div class="toast toast-center toast-top z-50 w-full max-w-2xl">
		{#each $toasts as toast}
			<div transition:fade>
				<div
					class={`alert ${
						toast.type === 'error' ? 'alert-error' : 'alert-success'
					} w-full shadow-lg`}
				>
					<div class="flex flex-row items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 flex-shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d={toast.type === 'error'
									? 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
									: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}
							/>
						</svg>
						<span class="whitespace-normal break-words text-justify">
							{toast.message}
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
