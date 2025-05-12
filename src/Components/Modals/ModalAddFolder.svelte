<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { type Components, type ComponentType, getComponents } from '$lib/configs';
	import { toast } from '$lib/stores/toast';
	import {
		_createFolder,
		_fetchFolders,
		_generateName,
		_getLatestVersion
	} from '../../routes/(app)/(products and files)/products/+page';
	import { onMount } from 'svelte';
	import HandleEsc from '../HandleEsc.svelte';
	import { t } from '$lib/lang';

	export let userRole: number;
	export let usersRoles: any[];
	export let orderedComponents: ComponentType[];
	export let showModalAddFolder: boolean;
	let selectedComponents: { [key: string]: string } = {};
	let initialComponents: { [key: string]: string } = {};
	let folderName: string = '';
	let components: Components;
	export let versionValues;
	export let versions;

	onMount(async () => {
		components = await getComponents(versionValues);
	});

	$: if (
		Object.keys(initialComponents).length === 0 &&
		Object.keys(selectedComponents).length > 0
	) {
		initialComponents = { ...selectedComponents };
	}

	let formAdd: HTMLFormElement;

	async function handleFolderCreate() {
		try {
			const res = await _createFolder(fetch, folderName);
			if (res.success) {
				toast(res.success, 'success');
				resetForm();
				invalidate('data:folders');
			} else {
				toast(res.error, 'error');
			}
		} catch (err) {
			toast(err.message, 'error');
		}
	}

	function resetForm() {
		folderName = '';
		selectedComponents = { ...initialComponents };
		formAdd.reset();

		const dialog = document.getElementById('modal-add');

		if (dialog instanceof HTMLDialogElement) {
			dialog.close();
			showModalAddFolder = false;
		}
	}
</script>

{#if showModalAddFolder}
	<HandleEsc resetFunc={resetForm} />;
{/if}

{#if usersRoles.some((r) => r.id === userRole && (r.role === 'GESTOR' || r.role === 'ADMIN')) && components}
	<dialog class="modal" id="modal-add">
		<div class="modal-box">
			<h3 class="mb-4 text-lg font-bold">{$t.folders.add}</h3>

			<form on:submit|preventDefault={handleFolderCreate} bind:this={formAdd}>
				{#each orderedComponents as component}
					<div class="mb-2 flex items-center gap-2">
						<label for={component}>{component}:</label>
						{#if component === 'ProjectAcronym'}
							<p>SPT</p>
						{:else}
							<select
								bind:value={selectedComponents[component]}
								class="select select-bordered select-sm"
								id={component}
								on:change={() => {
									if (folderName) {
										folderName = '';
									}
								}}
								required
							>
								{#if component === 'VersionNumber'}
									<!-- Mostra apenas a última versão -->
									<option value={_getLatestVersion(components[component].values)}>
										{_getLatestVersion(components[component].values)}
									</option>
								{:else}
									<!-- Mostra todas as outras opções -->
									{#each Object.keys(components[component].values) as value}
										<option {value}>{value}</option>
									{/each}
								{/if}
							</select>
						{/if}
					</div>
				{/each}

				<div class="flex flex-row gap-2">
					<label for="fileName">{$t.folders.name}:</label>
					<p class="font-bold">{folderName}</p>
					<input type="hidden" name="folderName" bind:value={folderName} />
				</div>

				<div class="modal-action">
					<button class="btn btn-error rounded-full" type="button" on:click={resetForm}>
						<i class="fa-solid fa-xmark mr-2"></i>{$t.actions.cancel}
					</button>
					{#if folderName}
						<button class="btn btn-primary rounded-full" type="submit"
							><i class="fa-solid fa-floppy-disk mr-2"></i>{$t.actions.save}</button
						>
					{:else}
						<button
							class="btn btn-success rounded-full"
							type="button"
							on:click={async () => {
								folderName = await _generateName(
									orderedComponents,
									selectedComponents,
									'folderStructure',
									versionValues,
									versions
								);
							}}
							><i class="fa-solid fa-arrow-rotate-right mr-2"></i>{$t.folders.generateName}</button
						>
					{/if}
				</div>
			</form>
		</div>
	</dialog>
{/if}
