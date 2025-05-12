<script lang="ts">
	import type { FileInterface } from '$lib/configs';
	import { t } from '$lib/lang';
	import UploadButton from './UploadButton.svelte';

	export let filesToUpload: {
		files: File[];
		name: string;
		foundExtensions: string[];
		missingExtensions: string[];
		nameErrors: FileInterface['error'];
	}[];

	export let folderName: string;
</script>

{#each filesToUpload as file}
	<div class="collapse collapse-arrow rounded-md bg-base-200">
		{#if (file.missingExtensions && file.missingExtensions.length > 0) || (file.nameErrors && file.nameErrors.length > 0)}
			<input type="checkbox" />
			<div class="collapse-title flex flex-row items-center gap-2 font-medium">
				<p class="text-red-500">{file.name}</p>
				<i class="fa-solid fa-triangle-exclamation fa-beat" style="color: #ff0000;"></i>
				<button
					class="fa-solid fa-trash z-10 ml-auto cursor-pointer text-red-500"
					on:click={() => {
						filesToUpload = filesToUpload.filter((f) => f.name !== file.name);
					}}
					aria-label={$t.actions.delete}
				></button>
			</div>
			<div class="collapse-content">
				{#each Object.values(file.foundExtensions) as extension}
					<p class=" text-green-500">
						<i class="fa-solid fa-circle-check"></i>
						{extension}
					</p>
				{/each}
				{#each Object.values(file.missingExtensions) as extension}
					<p class="text-red-500">
						<i class="fa-solid fa-circle-xmark"></i>
						{extension}
					</p>
				{/each}
				<div class="flex flex-col">
					{#each Object.values(file.nameErrors) as error}
						<p class="mt-2 font-bold">{error.component}:</p>
						<p class="text-red-500">{error.message}</p>
					{/each}
				</div>
			</div>
		{:else}
			<input type="checkbox" />
			<div class="collapse-title flex flex-row items-center gap-2 font-medium">
				<p class="text-green-500">{file.name}</p>
				<i class="fa-solid fa-circle-check text-green-500"></i>
				<button
					class="fa-solid fa-trash z-10 ml-auto cursor-pointer text-red-500"
					on:click={() => {
						filesToUpload = filesToUpload.filter((f) => f.name !== file.name);
					}}
					aria-label={$t.actions.delete}
				></button>
			</div>
			<div class="collapse-content">
				{#each Object.values(file.foundExtensions) as extension}
					<p class=" text-green-500">
						<i class="fa-solid fa-circle-check"></i>
						{extension}
					</p>
				{/each}
			</div>
		{/if}
	</div>
{/each}

<UploadButton {folderName} bind:filesToUpload />
