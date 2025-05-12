<script lang="ts">
	import { type Components, type ComponentType, type Folder, DictionaryList } from '$lib/configs';
	import { _createFolder, _orderComponents } from './+page';
	import Toast from '../../../../Components/Toast.svelte';
	import DownloadButton from '../../../../Components/DownloadButton.svelte';
	import Table from '../../../../Components/Table.svelte';
	import ModalAddFolder from '../../../../Components/Modals/ModalAddFolder.svelte';
	import { pageTitle } from '$lib/stores/title';
	import Details from '../../../../Components/Details.svelte';
	import ModalAddVersion from '../../../../Components/Modals/ModalAddVersion.svelte';
	import { t, currentLang } from '$lib/lang';

	pageTitle.set('titles.data_products');

	let folderName: string = '';
	let orderedComponents: ComponentType[] = [];

	let selectAll: boolean = false;
	let showModalAddFolder: boolean = false;
	let showModalAddVersion: boolean = false;

	export let data;

	let download: { type: string; objects: Folder[] } = {
		type: 'folder',
		objects: []
	};

	let filterList: {
		component: string;
		value: string[];
	}[] = [];

	const components: Components = data.components;
</script>

<Details />

<div class="flex flex-col">
	<Toast />
	<table class="w-full border-separate border-spacing-y-3">
		<tbody>
			<tr>
				<td class="w-[20%]">
					<h1 class="text-4xl font-bold">{$t.titles.products}</h1>
				</td>
				<td class="w-[60%] text-center">
					{#each Object.entries(components) as [componentName, component]}
						{#if componentName === 'SeverityIndicator' || componentName === 'BaseIndex' || componentName === 'PlatformCode' || componentName === 'BurntAreaDataset'}
							<details class="dropdown">
								<summary class="btn m-1 rounded-full">
									<div class="block">
										<i class="fa-solid fa-filter mr-2"></i>
										{DictionaryList[componentName][$currentLang]}
									</div>
								</summary>

								<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
									{#each Object.entries(component.values) as value}
										<div class="form-control">
											<label class="label cursor-pointer select-auto justify-normal">
												<input
													id={`filter-checkbox-${componentName}-${value[0]}`}
													type="checkbox"
													class="checkbox"
													checked={filterList.some(
														(filter) =>
															filter.component === componentName && filter.value.includes(value[0])
													)}
													on:change={(ev) => {
														const isChecked = (ev.target as HTMLInputElement).checked;
														const filter = filterList.find(
															(filter) => filter.component === componentName
														);
														if (isChecked) {
															if (filter) {
																filter.value.push(value[0]);
															} else {
																filterList.push({
																	component: componentName,
																	value: [value[0]]
																});
															}
														} else {
															if (filter) {
																filter.value = filter.value.filter((item) => item !== value[0]);
																if (filter.value.length === 0) {
																	filterList = filterList.filter(
																		(item) => item.component !== componentName
																	);
																}
															}
														}

														filterList = [...filterList];
													}}
												/>
												<span class="label-text ml-2 text-left"
													>{value[0]} ({value[1][$currentLang]})</span
												>
											</label>
										</div>
									{/each}
								</ul>
							</details>
						{/if}
					{/each}
				</td>
				<td class="w-[20%] text-right">
					{#if data.roles.some((r) => r.id === data.userData.role && (r.role === 'ADMIN' || r.role === 'GESTOR'))}
						<!-- Contêiner flexível para espaçamento e alinhamento -->
						<div class="flex flex-col justify-between gap-4">
							<!-- Botão para adicionar pasta -->
							<button
								class="btn btn-primary w-full whitespace-nowrap rounded-full"
								on:click={async () => {
									orderedComponents = await _orderComponents('folderStructure', data.versions);
									showModalAddFolder = true;
									setInterval(() => {
										const dialog = document.getElementById('modal-add');
										if (dialog instanceof HTMLDialogElement) {
											dialog.showModal();
										}
									}, 0);
								}}
							>
								<div class="flex items-center justify-center">
									<i class="fa-solid fa-plus mr-2"></i>
									{$t.folders.add}
								</div>
							</button>

							<!-- Botão para adicionar versão -->
							<button
								class="btn btn-primary w-full whitespace-nowrap rounded-full"
								on:click={async () => {
									showModalAddVersion = true;
									setInterval(() => {
										const dialog = document.getElementById('modal-add-version');
										if (dialog instanceof HTMLDialogElement) {
											dialog.showModal();
										}
									}, 0);
								}}
							>
								<div class="flex items-center justify-center">
									<i class="fa-solid fa-plus mr-2"></i>
									{$t.version.add}
								</div>
							</button>
						</div>
					{/if}
				</td>
			</tr>
			{#if filterList.length > 0}
				<tr>
					<td colspan="3">
						<div class="flex flex-row flex-wrap gap-2">
							{#each filterList as filter}
								{#each filter.value as value}
									<div class="badge badge-info gap-2">
										<button
											on:click={() => {
												filter.value = filter.value.filter((item) => item !== value);

												if (filter.value.length === 0) {
													filterList = filterList.filter(
														(item) => item.component !== filter.component
													);
												}
											}}
											class="inline-block h-4 w-4 cursor-pointer stroke-current"
											aria-label="Remove"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
										{value}
									</div>
								{/each}
							{/each}
						</div>
					</td>
				</tr>
			{/if}
		</tbody>
	</table>

	<Table
		tableData={data.folders.filter((folder) => {
			const selectedSeverity = filterList.find(
				(filter) => filter.component === 'SeverityIndicator'
			);
			const selectedBaseIndex = filterList.find((filter) => filter.component === 'BaseIndex');
			const selectedPlatformCode = filterList.find((filter) => filter.component === 'PlatformCode');
			const selectedBurntAreaDataset = filterList.find(
				(filter) => filter.component === 'BurntAreaDataset'
			);

			if (
				(selectedSeverity &&
					!selectedSeverity.value.some((value) => folder.splitName.includes(value))) ||
				(selectedBaseIndex &&
					!selectedBaseIndex.value.some((value) => folder.splitName.includes(value))) ||
				(selectedPlatformCode &&
					!selectedPlatformCode.value.some((value) => folder.splitName.includes(value))) ||
				(selectedBurntAreaDataset &&
					!selectedBurntAreaDataset.value.some((value) => folder.splitName.includes(value)))
			) {
				return false;
			}

			return true;
		})}
		userRole={data.userData.role}
		usersRoles={data.roles}
		bind:download
		bind:selectAll
		{folderName}
		versions={data.versions}
		versionValues={data.versionValues}
		method=""
	/>

	<DownloadButton bind:download {folderName} bind:selectAll method="" />

	{#if showModalAddFolder}
		<ModalAddFolder
			userRole={data.userData.role}
			usersRoles={data.roles}
			{orderedComponents}
			versionValues={data.versionValues}
			versions={data.versions}
			bind:showModalAddFolder
		/>
	{/if}

	{#if showModalAddVersion}
		<ModalAddVersion
			userRole={data.userData.role}
			usersRoles={data.roles}
			versions={data.versions}
			bind:showModalAddVersion
		/>
	{/if}
</div>
