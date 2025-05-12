<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		let dropdowns = document.querySelectorAll('details');

		document.addEventListener('click', function (event) {
			dropdowns.forEach((dropdown) => {
				let isClickInside = dropdown.contains(event.target as Node);

				if (!isClickInside) {
					dropdown.removeAttribute('open');
				}
			});
		});
	});
</script>
