<script lang="ts">
	import { t } from '$lib/lang';
	import { pageTitle } from '$lib/stores/title';
	import { toast } from '$lib/stores/toast.js';
	import Toast from '../../../../../Components/Toast.svelte';

	pageTitle.set('titles.resetPw');

	export let form;

	if (form?.message) {
		toast(form.message, form.success ? 'success' : 'error');
	}

	let loading = false;
</script>

<Toast />

<div class="flex h-full w-full flex-col items-center justify-center px-3">
	<form
		class="flex w-full flex-col items-center"
		action="#"
		method="POST"
		on:submit={() => {
			loading = true;
		}}
	>
		<div class="form-control w-full max-w-md">
			<span class=" text-sm text-slate-500">
				{$t.session.resetPwInfo}
			</span>
			<label class="label mt-2 select-auto" for="email">
				<span class="label-text">Email</span>
			</label>
			<input
				id="email"
				type="email"
				name="email"
				autocomplete="email"
				placeholder="Email"
				class="input input-bordered w-full max-w-md rounded-full"
				required
			/>
		</div>
		<div class="mt-5 flex w-full max-w-md flex-col">
			<button class="btn btn-primary w-full rounded-full" type="submit" disabled={loading}
				>{#if loading}
					<span class="loading loading-spinner text-primary"></span>
				{/if}{$t.session.resetPwInstructions}</button
			>
			<div class="flex flex-row justify-center p-2.5">
				<span>{$t.actions.goBackTo}</span><a
					href="/login"
					class="btn-link ml-1"
					on:click={() => {
						if (loading) return false;
					}}>{$t.session.login}</a
				>
			</div>
		</div>
	</form>
</div>
