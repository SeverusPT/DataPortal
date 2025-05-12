<script lang="ts">
	import type { FireFeature } from '$lib/configs/index.js';
	import { t } from '$lib/lang';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let fireProps: FireFeature;

	const execZoom = () => {
		dispatch('change', fireProps.bbox);
	};
</script>

<div class="w-max">
	<div class="grid grid-cols-[70px_200px] gap-1">
		<div class="w-32">{$t.fireFeature.province}:</div>
		<div>{fireProps.properties.PROVINCE}</div>
		<div class="">{$t.fireFeature.commune}:</div>
		<div>{fireProps.properties.COMMUNE}</div>
		<div>{$t.fireFeature.fireDate}:</div>
		<div>{fireProps.properties.FIREDATE}</div>
		<div>{$t.fireFeature.area}:</div>
		<div>{fireProps.properties.AREA_HA}</div>
		<div class="col-span-2 pt-5">
			<button class="btn btn-outline btn-sm w-full" on:click={() => execZoom()}
				>{$t.fireFeature.zoom}</button
			>
		</div>
	</div>
</div>
