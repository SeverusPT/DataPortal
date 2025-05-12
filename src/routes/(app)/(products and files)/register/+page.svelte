<script lang="ts">
	import { pageTitle } from '$lib/stores/title';
	import Toast from '../../../../Components/Toast.svelte';
	import LoadingComponent from '../../../../Components/LoadingComponent.svelte';

	// Componente que vai conter todo o fluxo de steps e perguntas
	import MultiStepForm from '../../../../Components/RegisterForm/MultiStepForm.svelte';

	// Dados carregados pelo seu +page.ts
	export let data;

	const { registerSteps } = data;

	pageTitle.set('titles.register');
</script>

<Toast />

{#if registerSteps && registerSteps.length > 0}
	<!-- Renderiza o seu componente de formulário multi-step -->
	<MultiStepForm {registerSteps} />
{:else}
	<LoadingComponent loadingText="" />
{/if}
