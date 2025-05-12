<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t, currentLang } from '$lib/lang';

	const dispatch = createEventDispatcher();
	let modal;
	const consentDurationDays = 180;

	// Verifica se o consentimento expirou
	function hasConsentExpired() {
		const consentTimestamp = localStorage.getItem('cookieConsentTimestamp');
		if (!consentTimestamp) return true;
		const diffInDays = (Date.now() - parseInt(consentTimestamp)) / (1000 * 60 * 60 * 24);
		return diffInDays >= consentDurationDays;
	}

	onMount(() => {
		const consent = localStorage.getItem('cookieConsent');
		if (!consent || hasConsentExpired()) {
			modal.showModal();
		}
	});

	function acceptCookies() {
		localStorage.setItem('cookieConsent', 'accepted');
		localStorage.setItem('cookieConsentTimestamp', Date.now().toString());
		modal.close();

		// Emite evento para o pai
		dispatch('accepted');
	}

	function declineCookies() {
		localStorage.setItem('cookieConsent', 'declined');
		localStorage.setItem('cookieConsentTimestamp', Date.now().toString());
		modal.close();

		// Emite evento para o pai (caso queira saber que houve recusa)
		dispatch('declined');
	}

	// If ESC key is pressed do nothing
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			e.preventDefault();
		}
	});
</script>

<!-- Banner de Consentimento de Cookies -->
<dialog
	bind:this={modal}
	class="modal"
	id="modal-cookie-consent"
	aria-labelledby="cookie-consent-info"
>
	<div class="modal-box w-full max-w-2xl">
		<h2 class="mb-3 flex items-center text-lg font-bold">
			<i class="fa-solid fa-cookie-bite mr-2"></i>
			{#if $currentLang === 'pt'}
				Preferências de Cookies
			{:else if $currentLang === 'en'}
				Cookie Preferences
			{/if}
		</h2>

		{#if $currentLang === 'pt'}
			<p class="text-sm">
				Este site utiliza cookies para garantir o funcionamento adequado da plataforma e para
				melhorar a sua experiência de navegação. Alguns cookies são essenciais para o correto
				funcionamento do site, enquanto outros, como os cookies analíticos, ajudam-nos a compreender
				como os utilizadores interagem com o nosso conteúdo de forma anonimizada.
			</p>
			<p class="mt-2 text-sm">
				Se aceitar os cookies analíticos, iremos utilizar o <strong>Google Analytics</strong> para
				recolher informações genéricas sobre a sua visita. Isto inclui dados como as
				<strong
					>páginas que visita, o tempo que permanece no site, como chegou ao site (por exemplo,
					através de um motor de pesquisa ou link), e os produtos/ficheiros de dados que transfere</strong
				>. Estes dados são anonimizados e ajudam-nos a perceber que conteúdos são mais relevantes e
				a melhorar o nosso site para si.
			</p>
			<p class="mt-2 text-sm">
				As suas preferências serão armazenadas por <strong>{consentDurationDays} dias</strong>. Após
				esse período, voltaremos a solicitar o seu consentimento.
			</p>
		{:else if $currentLang === 'en'}
			<p class="text-sm">
				This website uses cookies to ensure the proper functioning of the platform and to improve
				your browsing experience. Some cookies are essential for the correct operation of the site,
				while others, such as analytical cookies, help us understand how users interact with our
				content in an anonymized manner.
			</p>
			<p class="mt-2 text-sm">
				If you accept analytical cookies, we will use <strong>Google Analytics</strong> to collect
				generic information about your visit. This includes data such as
				<strong
					>the pages you visit, the time you spend on the site, how you arrived at the site (for
					example, through a search engine or link), and the products/files you download</strong
				>. This data is anonymized and helps us understand which content is most relevant and
				improve our website for you.
			</p>
			<p class="mt-2 text-sm">
				Your preferences will be stored for <strong>{consentDurationDays} days</strong>. After this
				period, we will request your consent again.
			</p>
		{/if}
		<div class="modal-action mt-4">
			<button class="btn btn-error rounded-full" type="button" on:click={declineCookies}>
				<i class="fa-solid fa-xmark mr-2"></i>
				{$t.actions.declineCookies}
			</button>
			<button class="btn btn-primary rounded-full" type="button" on:click={acceptCookies}>
				<i class="fa-solid fa-check mr-2"></i>
				{$t.actions.acceptCookies}
			</button>
		</div>
	</div>
</dialog>
