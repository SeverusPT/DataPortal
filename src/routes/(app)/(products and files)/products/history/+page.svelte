<script lang="ts">
	import { type Components, type ComponentType, type Folder, DictionaryList } from '$lib/configs';
	import { _createFolder, _getLatestVersion, _orderComponents } from '../+page';
	import Toast from '../../../../../Components/Toast.svelte';
	import DownloadButton from '../../../../../Components/DownloadButton.svelte';
	import Table from '../../../../../Components/Table.svelte';
	import { pageTitle } from '$lib/stores/title';
	import Details from '../../../../../Components/Details.svelte';
	import { t, currentLang } from '$lib/lang';

	pageTitle.set('titles.data_products_history');

	let folderName: string = '';

	let selectAll: boolean = false;

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
						{#if componentName === 'SeverityIndicator' || componentName === 'BaseIndex' || componentName === 'PlatformCode' || componentName === 'BurntAreaDataset' || componentName === 'VersionNumber'}
							<details class="dropdown">
								<summary class="btn m-1 rounded-full">
									<div class="block">
										<i class="fa-solid fa-filter mr-2"></i>
										{DictionaryList[componentName][$currentLang]}
									</div>
								</summary>

								<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
									{#each Object.entries(component.values) as value}
										{#if componentName !== 'VersionNumber' || (componentName === 'VersionNumber' && value[0] !== _getLatestVersion(data.versions))}
											<div class="form-control">
												<label class="label cursor-pointer select-auto justify-normal">
													<input
														id={`filter-checkbox-${componentName}-${value[0]}`}
														type="checkbox"
														class="checkbox"
														checked={filterList.some(
															(filter) =>
																filter.component === componentName &&
																filter.value.includes(value[0])
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
														>{value[0]}
														{#if componentName !== 'VersionNumber'}{value[1][
																$currentLang
															]}{/if}</span
													>
												</label>
											</div>
										{/if}
									{/each}
								</ul>
							</details>
						{/if}
					{/each}
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
			const selectedVersionNumber = filterList.find(
				(filter) => filter.component === 'VersionNumber'
			);

			if (
				(selectedSeverity &&
					!selectedSeverity.value.some((value) => folder.splitName.includes(value))) ||
				(selectedBaseIndex &&
					!selectedBaseIndex.value.some((value) => folder.splitName.includes(value))) ||
				(selectedPlatformCode &&
					!selectedPlatformCode.value.some((value) => folder.splitName.includes(value))) ||
				(selectedBurntAreaDataset &&
					!selectedBurntAreaDataset.value.some((value) => folder.splitName.includes(value))) ||
				(selectedVersionNumber &&
					!selectedVersionNumber.value.some((value) => folder.splitName.includes(value)))
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
		method="history"
	/>

	<DownloadButton bind:download {folderName} bind:selectAll method="history" />
</div>
