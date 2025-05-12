<script lang="ts">
	import type { FileInterface } from '$lib/configs';

	export let dataObject: FileInterface;
	export let parsedMarkdown: string = '';
</script>

<dialog class="modal" id="modal-markdown">
	<div class="modal-box w-fit max-w-2xl">
		<div class="sticky top-0">
			<button
				class="btn btn-circle btn-sm absolute right-0 top-0"
				on:click={() => {
					let dialog = document.getElementById('modal-markdown');
					if (dialog instanceof HTMLDialogElement) {
						dialog.close();
					}
					parsedMarkdown = '';
				}}>✕</button
			>
		</div>
		<h3 class="mb-4 text-lg font-bold">
			{dataObject.name}
		</h3>

		{@html parsedMarkdown}
	</div>
</dialog>
