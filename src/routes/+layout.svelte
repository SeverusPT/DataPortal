<script lang="ts">
	import { pageTitle } from '$lib/stores/title';
	import LogoCorV01 from '$lib/assets/logo/cor/v01.png';
	import LogoCorV02 from '$lib/assets/logo/cor/v02.png';
	import Financiamento from '$lib/assets/footer/financiamento.png';
	import Biopolis from '$lib/assets/footer/biopolis.png';
	import CibioInbioUp from '$lib/assets/footer/cibio-inbio-up.jpg';
	import SeverusIpvcLogo from '$lib/assets/footer/severus-ipvc-logo.png';
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { setLanguage, currentLang, t, initLanguage } from '$lib/lang';
	import CookieConsent from '../Components/CookieConsent.svelte';
	import { onMount } from 'svelte';
	import LoadingComponent from '../Components/LoadingComponent.svelte';
	import { get } from 'svelte/store';
	import { env } from '$env/dynamic/public';

	let title: string = '';
	let isLoading = true; // Estado de carregamento
	let analyticsLoaded = false; // Estado de carregamento do GA4

	// Função para obter tradução aninhada dinamicamente
	function getNestedTranslation(path: string) {
		const keys = path.split('.'); // Exemplo: "session.login" → ['session', 'login']
		return keys.reduce((obj, key) => (obj && obj[key] ? obj[key] : path), get(t));
	}

	// Atualizar título reativamente com base na store `pageTitle`
	pageTitle.subscribe((value) => {
		title = getNestedTranslation(value);
	});

	// Reagir também à mudança de idioma
	t.subscribe(() => {
		title = getNestedTranslation(get(pageTitle));
	});

	// Inicializar idioma e aguardar carregamento
	onMount(async () => {
		initLanguage(); // Garante que o idioma está carregado
		await loadImages(); // Garante que as imagens carregaram
		isLoading = false; // Carregamento concluído

		// Se o utilizador já aceitou antes, injetamos GA4 imediatamente
		const consent = localStorage.getItem('cookieConsent');
		if (consent === 'accepted') {
			injectAnalytics();
		}
	});

	// Função para injetar o GA4
	function injectAnalytics() {
		if (analyticsLoaded) return;
		analyticsLoaded = true;

		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://www.googletagmanager.com/gtag/js?id=' + env.PUBLIC_GTAG_ID;
		document.head.appendChild(script);

		//@ts-ignore
		window.dataLayer = window.dataLayer || [];
		// Degine a função gtag globalmente
		//@ts-ignore
		window.gtag = function gtag() {
			//@ts-ignore
			window.dataLayer.push(arguments);
		};

		// Inicializa o GA4
		//@ts-ignore
		gtag('js', new Date());
		//@ts-ignore
		gtag('config', env.PUBLIC_GTAG_ID, { anonymize_ip: true });
	}

	// Handler que será chamado quando o CookieConsent emitir o evento 'accepted'
	function handleCookiesAccepted() {
		// Salva localStorage e injeta GA4
		injectAnalytics();
	}

	// Função para mudar o idioma
	function changeLanguage(event: Event) {
		const lang = (event.target as HTMLSelectElement).value;
		setLanguage(lang as 'en' | 'pt');
	}

	// Função para garantir que as imagens carregam antes de mostrar o conteúdo
	async function loadImages() {
		const images = document.querySelectorAll('img');
		const promises = Array.from(images).map((img) => {
			if (!img.complete) {
				return new Promise<void>((resolve) => {
					img.onload = () => resolve();
					img.onerror = () => resolve();
				});
			}
			return Promise.resolve();
		});
		await Promise.all(promises);
	}
</script>

<svelte:head>
	<title>SeverusPT | {title}</title>
</svelte:head>

<!-- Tela de Carregamento -->
{#if isLoading}
	<LoadingComponent loadingText={$t.loading.load} />
{:else}
	<!-- Popup de cookies -->
	<CookieConsent on:accepted={handleCookiesAccepted} />

	<!-- Conteúdo principal -->
	<div class="flex flex-col" data-sveltekit-preload-code="off">
		<table class="z-10 h-[10vh] border-b-2 border-b-gray-200">
			<tbody>
				<tr>
					<td class="w-1/3 p-2">
						<a href="/">
							<img
								src={LogoCorV01}
								alt="SeverusPT"
								class="hidden max-h-[7vh] w-auto object-contain md:block"
							/>
							<img src={LogoCorV02} alt="SeverusPT" class="h-[7vh] max-w-none md:hidden" />
						</a>
					</td>
					<td class="w-1/3 p-2 text-center">
						<h1 class="custom-size-title m-auto whitespace-nowrap font-bold">
							{title}
						</h1>
					</td>
					<td class="float-right h-full w-1/3 content-center justify-items-end p-2">
						<div class="flex items-center gap-1">
							<i class="fa-solid fa-globe text-xl"></i>
							<select
								class="select select-sm max-w-xs uppercase"
								id="lang"
								on:change={changeLanguage}
								bind:value={$currentLang}
							>
								<option value="en">EN</option>
								<option value="pt">PT</option>
							</select>
						</div>
					</td>
				</tr>
			</tbody>
		</table>

		<main class="flex h-[80vh] w-full flex-row">
			<slot />
		</main>

		<footer
			class="flex h-[10vh] w-full flex-col items-center gap-3 border-t-2 border-t-gray-200 p-2 text-center xl:flex-row xl:justify-between"
		>
			<div class="w-fit">
				<a href="https://severus.pt/financiamento">
					<img src={Financiamento} alt="Apoios Portugal 2020" class="max-h-[8vh] w-auto" />
				</a>
			</div>
			<div class="flex flex-col gap-3 md:flex-row">
				<img class="max-h-[6vh] w-auto object-contain" src={Biopolis} alt="Biopolis" />
				<img class="max-h-[6vh] w-auto object-contain" src={CibioInbioUp} alt="Cibio InBio" />
				<img class="max-h-[6vh] w-auto object-contain" src={SeverusIpvcLogo} alt="Severus IPVC" />
			</div>
		</footer>
	</div>
{/if}
