<script lang="ts">
	import {
		type Components,
		type FileInterface,
		type Folder,
		getComponents,
		instanceOfFolder
	} from '$lib/configs';
	import { onMount } from 'svelte';
	import HandleEsc from '../HandleEsc.svelte';
	import { t, currentLang } from '$lib/lang';

	let components: Components;

	onMount(async () => {
		components = await getComponents(versionValues);
	});

	export let dataObject = {} as FileInterface | Folder;
	export let viewModalInfo: boolean;
	export let versions;
	export let versionValues;

	let modalInfo: HTMLDialogElement | null = null;

	function closeModal() {
		modalInfo?.close();
		dataObject = instanceOfFolder(dataObject) ? ({} as Folder) : ({} as FileInterface);
		viewModalInfo = false;
	}
</script>

{#if viewModalInfo}
	<HandleEsc resetFunc={closeModal} />;
{/if}

{#if components}
	<dialog class="modal" id="modal-info" bind:this={modalInfo}>
		<div class="modal-box w-fit max-w-2xl">
			<div class="sticky top-0">
				<button
					class="btn btn-circle btn-sm absolute right-0 top-0"
					on:click={() => {
						closeModal();
					}}>✕</button
				>
			</div>
			<h3 class="mb-4 text-lg font-bold">{$t.titles.info}</h3>

			<div class="flex flex-col gap-2">
				{#if dataObject.error && dataObject.error.length > 0 && dataObject.error[0].component === 'VersionNumber'}
					<p class="text-red-500">{dataObject.error[0].message}</p>
				{:else if dataObject.error && dataObject.error.length > 0}
					{#each dataObject.error as error}
						{#if instanceOfFolder(dataObject)}
							{#each versions[dataObject.splitName[dataObject.splitName.length - 1]].folderStructure.components as component, i}
								{#if component === error.component}
									<p class="font-bold">{component}:</p>
									<p class="text-red-500">{error.message}</p>
								{:else}
									<p class="font-bold">{component}:</p>
									<p>
										{dataObject.splitName[i]}: {components[component].values[
											dataObject.splitName[i]
										][$currentLang]}
									</p>
								{/if}
							{/each}
						{:else}
							{#each versions[dataObject.splitName[dataObject.splitName.length - 1]].fileStructure.components as component, i}
								{#if component === error.component}
									<p class="font-bold">{component}:</p>
									<p class="text-red-500">{error.message}</p>
								{:else}
									<p class="font-bold">{component}:</p>
									<p>
										{dataObject.splitName[i]}: {components[component].description[$currentLang]}
									</p>
								{/if}
							{/each}
						{/if}
					{/each}
				{:else if dataObject.splitName && dataObject.splitName.length > 0 && dataObject.error.length === 0}
					{#if instanceOfFolder(dataObject)}
						{#each versions[dataObject.splitName[dataObject.splitName.length - 1]].folderStructure.components as component, i}
							<p class="font-bold">{component}:</p>
							<p>
								{dataObject.splitName[i]}: {components[component].values[dataObject.splitName[i]][
									$currentLang
								]}
							</p>
						{/each}
					{:else}
						{#each versions[dataObject.splitName[dataObject.splitName.length - 1]].fileStructure.components as component, i}
							<p class="font-bold">{component}:</p>
							{#if components[component].values !== undefined}
								<p>
									{dataObject.splitName[i]}: {components[component].values[dataObject.splitName[i]][
										$currentLang
									]}
								</p>
							{:else}
								<p>
									{dataObject.splitName[i]}: {components[component].description[$currentLang]}
								</p>{/if}
						{/each}
					{/if}
				{/if}
				{#if !instanceOfFolder(dataObject)}
					{#if dataObject.missingExtensions.length > 0}
						<p class="font-bold">{$t.errors.missingExtensions}:</p>
						{#each dataObject.missingExtensions as extension}
							<p class="text-red-500">{extension}</p>
						{/each}
					{/if}
				{/if}
			</div>
		</div>
	</dialog>
{/if}
