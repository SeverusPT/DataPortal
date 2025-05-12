<script lang="ts">
	import type { Folder, FileInterface } from '$lib/configs';
	export let selectAll: boolean = false;
	export let download: { type: string; objects: Folder[] | FileInterface[] } = {
		type: '',
		objects: []
	};
	export let tableData: Folder[] | FileInterface[];
</script>

<input
	type="checkbox"
	class="checkbox static"
	bind:checked={selectAll}
	on:change={(e) => {
		let target = e.target as HTMLInputElement;

		if (download.type === 'folder' && target && target.checked) {
			download.objects = tableData.filter(
				(folder) => 'filesCount' in folder && folder.error.length === 0 && folder.filesCount > 0
			) as Folder[];
		} else if (download.type === 'file' && target && target.checked) {
			download.objects = tableData.filter((file) => file.error.length === 0) as FileInterface[];
		} else {
			download.objects = [];
		}
	}}
/>
