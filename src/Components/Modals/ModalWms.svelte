<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { toast } from '$lib/stores/toast';
	import { t } from '$lib/lang';
	import HandleEsc from '../HandleEsc.svelte';
	export let folderName: string;
	export let fileName: string;
	export let viewModalWms: boolean;

	const wmsUrl = `${env.PUBLIC_BASE_URL}/api/wms?request=GetCapabilities&service=WMS&product=${folderName}${fileName ? `&file=${fileName}` : ''}`;

	let modal: HTMLDialogElement | null = null;

	function closeModal() {
		viewModalWms = false;
		modal?.close();
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(wmsUrl);
			toast($t.wms.wmsClipboardSuccess, 'success');
			closeModal();
		} catch (error) {
			toast($t.wms.wmsClipboardError, 'error');
		}
	}
</script>

{#if viewModalWms}
	<HandleEsc resetFunc={closeModal} />
{/if}

<dialog
	bind:this={modal}
	class="modal"
	id="modal-wms"
	aria-labelledby="wms-info"
	aria-describedby="wms-link"
>
	<div class="modal-box w-full max-w-2xl">
		<div class="sticky top-0">
			<button
				class="btn btn-circle btn-sm absolute right-0 top-0"
				aria-label="Close"
				on:click={closeModal}>✕</button
			>
		</div>

		<h3 class="mb-4 text-lg font-bold">
			{folderName} <br />
			{fileName ? `${fileName}` : ''}
		</h3>
		<p>
			<b>WMS</b>
		</p>
		<code class="block break-words rounded bg-gray-100 p-2 text-sm">
			{wmsUrl}
		</code>
		<button
			class="btn btn-circle btn-primary btn-md mt-3 text-white"
			on:click={copyToClipboard}
			aria-label="copy wms link"
		>
			<i class="fa-solid fa-copy"></i>
		</button>
	</div>
</dialog>
