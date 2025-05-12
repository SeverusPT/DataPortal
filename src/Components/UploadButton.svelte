<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import type { FileInterface } from '$lib/configs';
	import { t } from '$lib/lang';
	import { toast } from '$lib/stores/toast';
	import { _handleFileUpload } from '../routes/(app)/(products and files)/products/[folderName]/+page';

	export let filesToUpload: {
		files: File[];
		name: string;
		foundExtensions: string[];
		missingExtensions: string[];
		nameErrors: FileInterface['error'];
	}[];

	export let folderName: string;
	let loading: boolean = false;
	//let abortController: AbortController | null = null;
	let filteredFiles: {
		files: File[];
		name: string;
		foundExtensions: string[];
		missingExtensions: string[];
		nameErrors: FileInterface['error'];
	}[];

	$: filteredFiles = filesToUpload.filter((file) => {
		return (
			file.files.length > 0 && file.nameErrors.length === 0 && file.missingExtensions.length === 0
		);
	});

	async function handleUpload() {
		loading = true;

		//abortController = new AbortController();
		//const signal = abortController.signal;

		filteredFiles.forEach(async (upload) => {
			try {
				await _handleFileUpload(upload.files, upload.name, folderName).then((res) => {
					toast(res, 'success');
					loading = false;
					filesToUpload = [];
					//wait 1 second to update the files
					setTimeout(() => {
						invalidate('folder:products');
					}, 1000);
				});
			} catch (err: any) {
				loading = false;
				filesToUpload = [];
				toast(err.message, 'error');
			}
		});
	}

	//   function cancelDownload() {
	//     if (abortController !== null) {
	//       abortController.abort();
	//       download.objects = [];
	//       selectAll = false;
	//       abortController = null;
	//     }
	//   }
</script>

{#if filteredFiles.length > 0}
	<button
		class="z-90 btn btn-primary fixed bottom-20 right-8 rounded-full"
		on:click={handleUpload}
		disabled={loading}
	>
		{#if loading}
			<i class="fas fa-spinner fa-spin mr-2"></i>
		{:else}
			<i class="fas fa-upload mr-2"></i>
		{/if}
		{$t.actions.upload}
	</button>
{/if}
