<script lang="ts">
	import { env } from '$env/dynamic/public';
	export let data;
	import { type Components, type FileInterface, DictionaryList } from '$lib/configs';
	import { _verifyExtensions, _processFilesToUpload } from '../+page';
	import Toast from '../../../../../Components/Toast.svelte';

	import Dropzone from 'svelte-file-dropzone';

	import { _fetchFiles, _handleFileUpload, _parseMarkdown } from './+page';
	import Table from '../../../../../Components/Table.svelte';
	import Tabs from '../../../../../Components/Tabs.svelte';
	import DownloadButton from '../../../../../Components/DownloadButton.svelte';
	import { Extensions } from '$lib/configs';
	import DetailsFileUpload from '../../../../../Components/DetailsFileUpload.svelte';
	import { pageTitle } from '$lib/stores/title';
	import Details from '../../../../../Components/Details.svelte';
	import { t, currentLang } from '$lib/lang';

	pageTitle.set('titles.data_products');

	let selectAll = false;

	let download: { type: string; objects: FileInterface[] } = {
		type: 'file',
		objects: []
	};

	//tabs
	let items = [$t.tables.files, $t.files.add];

	let activeItem = items[0];

	const tabChange = (e: { detail: string }) => {
		activeItem = e.detail;
	};

	let filesToUpload: {
		files: File[];
		name: string;
		foundExtensions: string[];
		missingExtensions: string[];
		nameErrors: FileInterface['error'];
	}[] = [];

	async function handleFilesSelected(e: { detail: { acceptedFiles: any } }) {
		const { acceptedFiles } = e.detail;

		let result = await _verifyExtensions(
			acceptedFiles,
			data.versions,
			data.versionValues,
			data.params.folderName
		);

		filesToUpload = _processFilesToUpload(filesToUpload, result);

		filesToUpload = filesToUpload;
	}

	const currentYear = new Date().getFullYear();
	let filterList: {
		component: string;
		value: any[];
		applyFilter: boolean;
	}[] = [
		{
			component: 'ReferenceYear',
			value: [parseInt(env.PUBLIC_MINIMUM_YEAR), currentYear],
			applyFilter: false
		},
		{
			component: 'RefPeriods',
			value: [0],
			applyFilter: false
		}
	];

	const filterIndex = (name: string) => {
		return filterList.findIndex((filter) => {
			return filter.component === name;
		});
	};

	const components: Components = data.components;
	let dropzone = null;

	$: if (dropzone) {
		//get element with class "dropzone"
		const dropzoneElement = document.querySelector('.dropzone');
		//if element exists
		if (dropzoneElement) {
			//change text of <p> element to $t.files.dropzone()
			dropzoneElement.querySelector('p').textContent = $t.files.dragNdrop;
		}
	}
</script>

{#key activeItem}
	<Details />
{/key}

{#if data.roles.some((r) => r.id === data.userData.role && (r.role === 'ADMIN' || r.role === 'GESTOR'))}
	<Tabs {activeItem} {items} on:tabChange={tabChange} />
{/if}
<Toast />
<div class="flex flex-col">
	{#if activeItem === items[0]}
		<table class="w-full border-separate border-spacing-y-3">
			<tbody>
				<tr>
					<td class="w-1/3">
						<div class="mt-3 flex flex-col gap-2">
							<h1 class="text-4xl font-bold">{$t.tables.files}</h1>
							<h1 class="text-2xl font-bold">{data.params.folderName}</h1>
						</div>
					</td>
					<td>
						<div class="mt-3 flex flex-row gap-2">
							{#each Object.keys(components) as componentName}
								{#if componentName === 'ReferenceYear'}
									<details class="dropdown">
										<summary class="btn m-1 rounded-full"
											><i class="fa-solid fa-filter mr-2"></i>
											{DictionaryList[componentName][$currentLang]}</summary
										>
										<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
											<div class="flex flex-col gap-2">
												<label for="start-year-range">{$t.filters.startYear}</label>
												<div id="start-year" class="flex w-full gap-2">
													<input
														id="start-year-range"
														type="range"
														min={env.PUBLIC_MINIMUM_YEAR}
														max={currentYear}
														bind:value={filterList[filterIndex(componentName)].value[0]}
														class="w-[60%]"
														on:change={() =>
															(filterList[filterIndex(componentName)].applyFilter = true)}
													/>
													<input
														id="start-year-input"
														type="number"
														class="input input-sm input-bordered w-[40%]"
														min={env.PUBLIC_MINIMUM_YEAR}
														max={currentYear}
														bind:value={filterList[filterIndex(componentName)].value[0]}
														on:change={() =>
															(filterList[filterIndex(componentName)].applyFilter = true)}
													/>
												</div>
												<label for="end-year-range">{$t.filters.endYear}</label>
												<div id="end-year" class="flex w-full gap-2">
													<input
														id="end-year-range"
														type="range"
														min={env.PUBLIC_MINIMUM_YEAR}
														max={currentYear}
														bind:value={filterList[filterIndex(componentName)].value[1]}
														class="w-[60%]"
														on:change={() =>
															(filterList[filterIndex(componentName)].applyFilter = true)}
													/>
													<input
														id="end-year-input"
														type="number"
														class="input input-sm input-bordered w-[40%]"
														min={env.PUBLIC_MINIMUM_YEAR}
														max={currentYear}
														bind:value={filterList[filterIndex(componentName)].value[1]}
														on:change={() =>
															(filterList[filterIndex(componentName)].applyFilter = true)}
													/>
												</div>
											</div>
										</ul>
									</details>
								{:else if componentName === 'RefPeriods'}
									<details class="dropdown">
										<summary class="btn m-1 rounded-full"
											><i class="fa-solid fa-filter mr-2"></i>
											{DictionaryList[componentName][$currentLang]}</summary
										>

										<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
											<label for="post-fire-range">{$t.filters.postFireMonths}</label>
											<div id="post-fire" class="flex w-full gap-2">
												<input
													id="post-fire-range"
													type="range"
													step="3"
													min="0"
													max="12"
													bind:value={filterList[filterIndex(componentName)].value[0]}
													class="w-[60%]"
													on:change={() =>
														(filterList[filterIndex(componentName)].applyFilter = true)}
												/>
												<input
													id="post-fire-input"
													type="number"
													class="input input-sm input-bordered w-[40%]"
													min="0"
													step="3"
													max="12"
													bind:value={filterList[filterIndex(componentName)].value[0]}
													on:change={() =>
														(filterList[
															filterList.findIndex((filter) => {
																return filter.component === 'RefPeriods';
															})
														].applyFilter = true)}
												/>
											</div>
										</ul>
									</details>
								{:else if componentName === 'ReferenceSystem'}
									<details class="dropdown">
										<summary class="btn m-1 rounded-full"
											><i class="fa-solid fa-filter mr-2"></i>
											{DictionaryList[componentName][$currentLang]}</summary
										>
										<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
											{#each Object.entries(components[componentName].values) as value}
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
																			value: [value[0]],
																			applyFilter: true
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
						</div>
					</td>
				</tr>
				{#if filterList.some((filter) => filter.applyFilter)}
					<tr>
						<td colspan="3">
							<div class="flex flex-row flex-wrap gap-2">
								{#each filterList as filter}
									{#if filter.applyFilter}
										{#if filter.component === 'ReferenceSystem'}
											{#each filter.value as value}
												<!-- Agora percorre os valores dentro do ReferenceSystem -->
												<div class="badge badge-info">
													<button
														aria-label="filter button"
														on:click={() => {
															// Remove apenas o valor específico do ReferenceSystem, em vez de remover todo o filtro
															filter.value = filter.value.filter((v) => v !== value);

															// Se não houver mais valores selecionados, remover o filtro da lista completamente
															if (filter.value.length === 0) {
																filterList = filterList.filter(
																	(item) => item.component !== 'ReferenceSystem'
																);
															}
														}}
														class="inline-block h-4 w-4 cursor-pointer stroke-current"
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
										{:else}
											<!-- Caso seja outro tipo de filtro, mantém o comportamento original -->
											<div class="badge badge-info">
												<button
													aria-label="filter button"
													on:click={() => {
														filter.applyFilter = false;
														if (filter.component === 'ReferenceYear') {
															filter.value = [parseInt(env.PUBLIC_MINIMUM_YEAR), currentYear];
														} else if (filter.component === 'RefPeriods') {
															filter.value = [0];
														} else {
															filterList = filterList.filter(
																(item) => item.component !== filter.component
															);
														}
													}}
													class="inline-block h-4 w-4 cursor-pointer stroke-current"
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
												{#if filter.component === 'ReferenceYear'}
													{filter.value[0]} - {filter.value[1]}
												{:else}
													{filter.value[0]}
												{/if}
											</div>
										{/if}
									{/if}
								{/each}
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
		<Table
			tableData={data.files.filter((file) => {
				return filterList.every((filter) => {
					// Use every em vez de forEach
					if (filter.applyFilter) {
						if (filter.component === 'ReferenceYear') {
							const yearRegex = /^[A-Za-z](\d{4})$/;
							const yearIndex = file.splitName.findIndex((part) => yearRegex.test(part));
							if (yearIndex !== -1) {
								const yearMatch = file.splitName[yearIndex].match(yearRegex);
								const year = parseInt(yearMatch[1]);
								return year >= filter.value[0] && year <= filter.value[filter.value.length - 1];
							} else {
								return false;
							}
						} else if (filter.component === 'RefPeriods') {
							const periodRegex = /^R\d{3}P(\d{3})$/;
							const periodIndex = file.splitName.findIndex((part) => periodRegex.test(part));
							if (periodIndex !== -1) {
								const periodMatch = file.splitName[periodIndex].match(periodRegex);

								const periodNumber = parseInt(periodMatch[1]);
								return periodNumber === filter.value[0];
							} else {
								return false;
							}
						} else {
							return filter.value.some((value) => file.splitName.includes(value));
						}
					}
					// Se o filtro não se aplica, retorne true para não excluir o arquivo
					return true;
				});
			})}
			userRole={data.userData.role}
			usersRoles={data.roles}
			bind:download
			bind:selectAll
			folderName={data.params.folderName}
			versions={data.versions}
			versionValues={data.versionValues}
			method=""
		/>

		<DownloadButton bind:download folderName={data.params.folderName} bind:selectAll method="" />
	{:else if data.roles.some((r) => r.id === data.userData.role && (r.role === 'ADMIN' || r.role === 'GESTOR'))}
		<div class="mt-3 flex flex-col gap-2">
			<h1 class="text-4xl font-bold">{$t.files.add}</h1>
			<h1 class="text-2xl font-bold">{data.params.folderName}</h1>
		</div>

		<Dropzone
			containerClasses="mt-3"
			accept={Extensions}
			inputElement={null}
			on:drop={handleFilesSelected}
			bind:this={dropzone}
		/>

		<div class="mt-2 flex flex-col gap-2">
			<DetailsFileUpload bind:filesToUpload folderName={data.params.folderName} />
		</div>
	{/if}
</div>
