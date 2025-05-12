<script lang="ts">
	import { toast } from '$lib/stores/toast.js';
	import { onMount } from 'svelte';
	import Toast from '../../../../../Components/Toast.svelte';
	import { goto } from '$app/navigation';
	import { pageTitle } from '$lib/stores/title.js';
	import LoadingComponent from '../../../../../Components/LoadingComponent.svelte';
	import { t } from '$lib/lang';

	pageTitle.set('register.confirmation');

	export let data;
	let loading = true;
	let loadingText = $t.register.validating;

	const validateAccount = async (token: string) => {
		const res = await fetch(`${token}`, {
			method: 'POST'
		});
		const data = await res.json();
		return data;
	};

	onMount(async () => {
		const token = data.token;

		const res = await validateAccount(token);
		if (res) {
			loadingText = $t.register.redirect;
			toast(res.message, res.success ? 'success' : 'error');

			if (res.success) {
				goto('/login');
			} else {
				goto('/products');
			}
		}
	});
</script>

<Toast />

{#if loading}
	<LoadingComponent {loadingText} />
{/if}
