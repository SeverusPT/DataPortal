<script lang="ts">
	import { type Folder, type FileInterface, instanceOfFolder } from '$lib/configs';
	import { toast } from '$lib/stores/toast';
	import {
		_parseMarkdown,
		_existsTiffFile
	} from '../routes/(app)/(products and files)/products/[folderName]/+page';
	import Checkbox from './CheckboxDownload.svelte';
	import ModalInfo from './Modals/ModalInfo.svelte';
	import ModalMarkdown from './Modals/ModalMarkdown.svelte';
	import Map from './Map/Map.svelte';
	import { goto } from '$app/navigation';
	import FilterAlert from './FilterAlert.svelte';
	import { page } from '$app/state';
	import ModalWms from './Modals/ModalWms.svelte';
	import { t } from '$lib/lang';

	export let tableData: FileInterface[] | Folder[];
	export let userRole: number;
	export let usersRoles: any[];
	export let selectAll: boolean = false;
	export let download: { type: string; objects: FileInterface[] | Folder[] };
	export let folderName: string | undefined;
	export let versions;
	export let versionValues;
	export let method: string;
	let dataObject = {} as FileInterface | Folder;
	let parsedMarkdown: string = '';
	let viewMap = false;
	let viewModalInfo = false;
	let viewModalWms = false;

	async function handleParseMarkdown(folderName: string, fileName: string) {
		await _parseMarkdown(fetch, folderName, fileName, method)
			.then((res) => {
				parsedMarkdown = res.html;
			})
			.catch((err) => {
				toast(err, 'error');
			});
	}

	async function handleViewMap(folderName: string, fileName: string) {
		if (folderName === '?' && fileName === '?') return false;
		viewMap = false;
		try {
			let res = await _existsTiffFile(fetch, folderName, fileName, method);
			viewMap = true;
		} catch (err) {
			viewMap = false;
			toast(err, 'error');
		}
		viewMap = viewMap;
	}

	$: filteredData = tableData.filter((data) => {
		if (instanceOfFolder(data)) {
			return data.filesCount > 0 && data.error.length === 0;
		} else {
			return data.error.length === 0 && data.missingExtensions.length === 0;
		}
	});

	function noErrorsData(data) {
		if (instanceOfFolder(data)) {
			return data.filesCount > 0 && data.error.length === 0;
		} else {
			return data.error.length === 0 && data.missingExtensions.length === 0;
		}
	}
</script>

{#if tableData.length === 0}
	<div class="flex h-full flex-col items-center justify-center">
		<i class="fa-solid fa-folder-open fa-5x"></i>
		<h1 class="text-2xl font-bold">{$t.tables.nodata}</h1>
	</div>
{:else}
	{#if filteredData.length !== tableData.length}
		<FilterAlert />
	{/if}

	<table class="table mt-6 w-full table-auto">
		<!-- head -->
		<thead class="bg-base-300">
			<tr class="round-corners static">
				{#if usersRoles.some((r) => r.id === userRole && r.role !== 'GUEST' && r.role !== 'NOACCESS') && filteredData.length > 0}
					<th>
						<!-- {#if userRole !== UserTypes.GUEST && filteredData.length > 0} -->

						<Checkbox bind:selectAll bind:download {tableData} />
					</th>
				{/if}
				<th>{$t.tables.name}</th>
				{#if instanceOfFolder(tableData[0])}
					<th>{$t.tables.files}</th>
				{:else}
					<th>{$t.tables.lastUpdate}</th>
				{/if}
				<th>{$t.tables.actions}</th>
			</tr>
		</thead>
		<tbody>
			{#each tableData as data}
				<tr
					class={`hover ${instanceOfFolder(data) ? 'cursor-pointer' : ''}`}
					on:dblclick={(e) => {
						if (instanceOfFolder(data)) {
							e.preventDefault();
							goto(`${page.url.pathname}/${data.name}`);
						}
					}}
				>
					{#if usersRoles.some((r) => r.id === userRole && r.role !== 'GUEST' && r.role !== 'NOACCESS')}
						<td>
							{#if noErrorsData(data)}
								<input
									type="checkbox"
									value={data}
									bind:group={download.objects}
									name="tableData"
									class="checkbox"
									on:change={() => {
										if (download.objects.length === filteredData.length) {
											selectAll = true;
										} else {
											selectAll = false;
										}
									}}
								/>
							{/if}
						</td>
					{/if}
					<td>
						<div class="flex items-center space-x-3">
							<div class="avatar">
								{#if instanceOfFolder(data)}
									<i class="fa-solid fa-folder fa-xl"></i>
								{:else}
									<i class="fa-solid fa-file fa-xl"></i>
								{/if}
							</div>
							{#if instanceOfFolder(data)}
								{#if data.error.length > 0}
									<a class="link-hover link text-red-500" href="{page.url.pathname}/{data.name}"
										>{data.name}</a
									>
									<i class="fa-solid fa-triangle-exclamation fa-beat" style="color: #ff0000;"></i>
								{:else}
									<div class="flex flex-col">
										<a class="link-hover link" href="{page.url.pathname}/{data.name}">{data.name}</a
										>
										<p class="text-sm text-gray-500">{data.subtitle} files</p>
									</div>
								{/if}
							{:else if !noErrorsData(data)}
								<p class="text-red-500">{data.name}</p>
								<i class="fa-solid fa-triangle-exclamation fa-beat" style="color: #ff0000;"></i>
							{:else}
								<p>{data.name}</p>
							{/if}
						</div>
					</td>
					{#if instanceOfFolder(data)}
						<td>{data.filesCount}</td>
					{:else}
						<td>{data.lastUpdated}</td>
					{/if}
					<td
						><div class="inline-flex items-center gap-2">
							{#if instanceOfFolder(data)}
								<div class="tooltip" data-tip={$t.tables.viewContent}>
									<a href="{page.url.pathname}/{data.name}" aria-label={data.name}>
										<i class="fa-solid fa-eye"></i></a
									>
								</div>
							{:else}
								<div class="tooltip" data-tip={$t.tables.openMap}>
									<button
										aria-label="map modal"
										on:click={() => {
											// DELETE mapWinOpen = !mapWinOpen
											dataObject = data;
											handleViewMap(folderName, data.name);
										}}><i class="fa-solid fa-map-location-dot"></i></button
									>
								</div>
								<div class="tooltip" data-tip={$t.tables.viewMetadata}>
									<button
										aria-label="modal markdown"
										on:click={async () => {
											dataObject = data;
											await handleParseMarkdown(folderName, data.name);
											if (parsedMarkdown !== '') {
												const dialog = document.getElementById('modal-markdown');
												if (dialog instanceof HTMLDialogElement) {
													dialog.showModal();
												}
											}
										}}
										class="cursor-pointer"
									>
										<i class="fa-solid fa-eye"></i>
									</button>
								</div>
							{/if}
							<!-- {#if userRole === UserTypes.ADMIN || userRole === UserTypes.GESTOR} -->
							{#if usersRoles.some((r) => r.id === userRole && (r.role === 'ADMIN' || r.role === 'GESTOR'))}
								<!-- TODO implement edit and delete -->
								<!-- <div class="tooltip" data-tip="{$t.tables.editName()}">
                    <i class="fa-solid fa-pen-to-square" />
                  </div>
                  <div class="tooltip" data-tip="{$t.actions.delete()}">
                    <i class="fa-solid fa-trash" />
                  </div> -->
							{/if}
							<div class="tooltip" data-tip={$t.tables.nameDetails}>
								<button
									aria-label="modal info"
									on:click={() => {
										dataObject = data;
										viewModalInfo = true;
										setInterval(() => {
											const dialog = document.getElementById('modal-info');
											if (dialog instanceof HTMLDialogElement) {
												dialog.showModal();
											}
										}, 0);
									}}
								>
									<i class="fa-solid fa-circle-info"></i>
								</button>
							</div>
							{#if !page.url.pathname.includes('history')}
								<div class="tooltip" data-tip="WMS">
									<button
										aria-label="modal wms"
										on:click={() => {
											dataObject = data;
											viewModalWms = true;
											setInterval(() => {
												const dialog = document.getElementById('modal-wms');
												if (dialog instanceof HTMLDialogElement) {
													dialog.showModal();
												}
											}, 0);
										}}
									>
										<b>WMS</b>
									</button>
								</div>
							{/if}
						</div></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
	<!-- </div> -->
{/if}

{#if Object.keys(dataObject).length > 0}
	{#if viewModalInfo}
		<ModalInfo bind:dataObject bind:viewModalInfo {versions} {versionValues} />
	{/if}

	{#if parsedMarkdown !== ''}
		{#if !instanceOfFolder(dataObject)}
			<ModalMarkdown bind:parsedMarkdown bind:dataObject />
		{/if}
	{/if}

	{#if viewMap}
		<div class="modal" id="map-modalddd" class:modal-open={viewMap}>
			<div class=" relative h-full w-full p-4">
				<div class="table modal-box h-full min-h-full min-w-full">
					<button
						class="btn btn-circle btn-sm absolute right-2 top-2 z-[5000]"
						aria-label="Close"
						on:click={() => (viewMap = false)}>✕</button
					>
					<Map tiffFolder={folderName} tiffFile={dataObject.name} {method} bind:viewMap />
				</div>
			</div>
		</div>
	{/if}

	{#if viewModalWms}
		{#if !folderName}
			<ModalWms bind:viewModalWms folderName={dataObject.name} fileName="" />
		{:else}
			<ModalWms bind:viewModalWms {folderName} fileName={dataObject.name} />
		{/if}
	{/if}
{/if}
