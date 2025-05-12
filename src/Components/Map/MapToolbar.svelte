<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import IconSvg from '../Images/iconSVG.svelte';
	const dispatch = createEventDispatcher();

	export let opacity: number;

	const btClass =
		'bg-slate-200 border border-neutral-600 rounded-md border-x p-1 hover:bg-slate-400 flex-grow-0';

	let showRange = false;
	let showGM = false;

	opacity = opacity * 100; // To rescale between 0 and 100

	function clickOutside(element: HTMLElement, callbackFunction: any) {
		function onClick(event: any) {
			if (!element.contains(event.target)) {
				callbackFunction();
			}
		}

		document.body.addEventListener('click', onClick);

		return {
			update(newCallbackFunction: any) {
				callbackFunction = newCallbackFunction;
			},
			destroy() {
				document.body.removeEventListener('click', onClick);
			}
		};
	}
</script>

<div class="flex flex-col gap-0.5">
	<div class="flex flex-row-reverse">
		<button class={btClass} title="Full extent" on:click={() => dispatch('extent-reset')}>
			<IconSvg name="MdZoomOutMap" height="16px" width="16px" class="pointer-events-none" />
		</button>
	</div>
	<div class="flex flex-row-reverse">
		<button
			class={btClass}
			title="Opacity"
			on:click={(event) => {
				showRange = !showRange;
				event.stopPropagation();
			}}
		>
			<IconSvg name="RiContrastFill" height="16px" width="16px" class="pointer-events-none" />
		</button>
		{#if showRange}
			<div
				class="flex flex-row-reverse items-center rounded-md border border-x border-neutral-600 bg-slate-200"
				use:clickOutside={() => {
					showRange = false;
				}}
			>
				<input
					type="range"
					min="0"
					max="100"
					class="range range-xs mx-2"
					bind:value={opacity}
					on:change={() => {
						dispatch('set-opacity', opacity / 100);
					}}
				/>
			</div>
		{/if}
	</div>
	<div class="flex flex-row-reverse">
		<button
			class={btClass}
			title="Google Satelite"
			on:click={() => {
				showGM = !showGM;
				dispatch('google-maps', showGM);
			}}
		>
			<IconSvg name="MdSatellite" height="16px" width="16px" class="pointer-events-none" />
		</button>
	</div>
</div>
