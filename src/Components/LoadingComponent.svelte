<script lang="ts">
	import logoSvg from '$lib/assets/logo/cor/v02.svg?raw';

	export let loadingText;
</script>

<div class="flex h-screen w-screen animate-pulse flex-col items-center justify-center">
	<!-- SVG Dinâmico -->
	<div class=" h-28 w-28">
		{@html logoSvg}
	</div>
	<p class="mt-4 text-center text-xl font-semibold">{loadingText}</p>

	<style>
		/* Animação de rotação para elementos com a classe cls-1 */
		.cls-1 {
			animation: rotate 4s linear infinite;
			transform-origin: center;
		}

		/* Keyframes para a rotação */
		@keyframes rotate {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	</style>
</div>
