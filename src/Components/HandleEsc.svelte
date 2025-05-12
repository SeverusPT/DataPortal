<script lang="ts">
	import { onMount } from 'svelte';
	export let resetFunc: () => void;

	onMount(() => {
		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				resetFunc();
			}
		});
	});
</script>
