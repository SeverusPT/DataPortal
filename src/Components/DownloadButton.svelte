<script lang="ts">
	import type { FileInterface, Folder } from '$lib/configs';
	import { t } from '$lib/lang';
	import { toast } from '$lib/stores/toast';
	import { _generateZip } from '../routes/(app)/(products and files)/products/+page';

	export let download: { type: string; objects: Folder[] | FileInterface[] };
	export let selectAll: boolean = false;
	export let folderName: string | undefined;
	export let method: string;

	let loading = false;
	let abortController: AbortController | null = null;

	//Função para remover extensões corretamente e eliminar duplicados
	function cleanFileNames(files: string[]): string[] {
		return [...new Set(files.map((name) => name.replace(/\.[^.]+$/, '')))];
	}

	async function handleDownload() {
		if (!download.objects.length) {
			toast($t.errors.noFileSelected, 'error');
			return;
		}

		loading = true;
		abortController = new AbortController();
		const signal = abortController.signal;

		let names: string[] = [];
		let folder = undefined;

		// Obter os nomes e a pasta com base no tipo de download
		if (download.type === 'folder') {
			names = download.objects.map((folder) => folder.name);
		} else if (download.type === 'file') {
			names = download.objects.map((file) => file.name);
			folder = folderName;
		}

		try {
			// Chama o gerador de ZIP
			await _generateZip(names, folder, method, signal);
			toast($t.download.success, 'success');

			// Verificar se os cookies analíticos foram aceites
			const consent = localStorage.getItem('cookieConsent');
			if (consent === 'accepted' && typeof window !== 'undefined') {
				// Aqui checamos se gtag existe
				const gtagRef = (window as any).gtag;

				if (gtagRef) {
					// Se for download de arquivo...
					if (download.type === 'file') {
						const cleanedNames = cleanFileNames(names);

						cleanedNames.forEach((name) => {
							gtagRef('event', 'data_file_download', {
								data_file_name: name,
								folder_name: folder
							});
						});
					}
					// Se for download de "produtos" (pastas)...
					else {
						names.forEach((name) => {
							gtagRef('event', 'data_product_download', {
								data_product_name: name
							});
						});
					}
				}
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				toast($t.download.errors.canceled, 'error');
			} else if (err instanceof Error) {
				toast(err.message, 'error');
			} else {
				toast($t.download.errors.unknown, 'error');
			}
		} finally {
			loading = false;
			download.objects = [];
			selectAll = false;
			abortController = null;
		}
	}

	function cancelDownload() {
		if (abortController !== null) {
			abortController.abort();
			abortController = null;
			loading = false;
		}
	}
</script>

{#if download.objects.length > 0}
	<button
		class="z-90 btn fixed bottom-20 right-8 rounded-full"
		class:btn-error={loading}
		class:btn-primary={!loading}
		on:click={loading ? cancelDownload : handleDownload}
	>
		{#if loading}
			<i class="fas fa-spinner fa-spin mr-2"></i>
			{$t.actions.cancel}
		{:else}
			<i class="fas fa-download mr-2"></i>
			{$t.actions.download}
		{/if}
	</button>
{/if}
