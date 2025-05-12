<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { t } from '$lib/lang';

	const closeModal = () => {
		const dialog = document.getElementById('modal-wmsinfo');
		if (dialog instanceof HTMLDialogElement) {
			dialog.close();
		}
	};
</script>

<dialog
	id="modal-wmsinfo"
	class="modal"
	aria-labelledby="wmsinfo-title"
	aria-describedby="wmsinfo-content"
>
	<div class="modal-box w-full max-w-2xl">
		<div class="sticky top-0">
			<button
				class="btn btn-circle btn-sm absolute right-0 top-0"
				aria-label="Close"
				on:click={closeModal}
			>
				✕
			</button>
		</div>
		<h3 class="mb-4 text-lg font-bold">
			{$t.titles.wmsInfo}
		</h3>
		<div class="space-y-4">
			<div>
				<b>GetCapabilities ({$t.wms.general}):</b>
				<p>{$t.wms.generalDescription}:</p>
				<code class="block break-words rounded bg-gray-100 p-2 text-sm">
					{env.PUBLIC_BASE_URL}/api/wms?request=GetCapabilities&service=WMS
				</code>
			</div>
			<div class="divider"></div>
			<div>
				<b>GetCapabilities ({$t.wms.products}):</b>
				<p>{$t.wms.productsDescription}:</p>
				<code class="block break-words rounded bg-gray-100 p-2 text-sm">
					{env.PUBLIC_BASE_URL}/api/wms?request=GetCapabilities&service=WMS&product=<b
						>{$t.wms.productName.replaceAll(' ', '_')}</b
					>
				</code>
				<span class="mt-2 text-xs">{$t.example}:</span>
				<code class="block break-words rounded bg-gray-100 p-2 text-xs">
					{env.PUBLIC_BASE_URL}/api/wms?request=GetCapabilities&service=WMS&product=<b
						>SPT-D-DELTA-NBR-L8-E-v02</b
					>
				</code>
			</div>
			<div class="divider"></div>
			<div>
				<b>GetCapabilities ({$t.wms.file}):</b>
				<p>{$t.wms.fileDescription}:</p>
				<code class="block break-words rounded bg-gray-100 p-2 text-sm">
					{env.PUBLIC_BASE_URL}/api/wms?request=GetCapabilities&service=WMS&product=<b
						>{$t.wms.productName.replaceAll(' ', '_')}</b
					>&file=<b>{$t.wms.fileName.replaceAll(' ', '_')}</b>
					<br />
				</code>
				<span class="mt-2 text-xs">{$t.example}:</span>
				<code class="block break-words rounded bg-gray-100 p-2 text-xs">
					{env.PUBLIC_BASE_URL}/api/wms?request=GetCapabilities&service=WMS&product=<b
						>SPT-D-DELTA-NBR-L8-E-v02</b
					>&file=<b>SPT_DELTA_NBR_L8OLI_E2017_R003P003_32629_20231204_v02</b>
				</code>
			</div>
		</div>
	</div>
</dialog>
