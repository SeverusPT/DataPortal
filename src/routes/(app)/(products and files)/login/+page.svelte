<script lang="ts">
	import { t } from '$lib/lang';
	import { pageTitle } from '$lib/stores/title';
	import { toast } from '$lib/stores/toast.js';
	import Toast from '../../../../Components/Toast.svelte';
	pageTitle.set('session.login');

	export let form;

	if (form?.message) {
		toast(form.message, form.success ? 'success' : 'error');
	}

	let showPassword = false;
	let loading = false;
</script>

<Toast />

<div class="flex h-full w-full flex-col items-center justify-center px-3">
	<form
		class="flex w-full flex-col items-center"
		action="#"
		method="POST"
		on:submit={() => (loading = true)}
	>
		<div class="form-control w-full max-w-md">
			<label class="label select-auto" for="email">
				<span class="label-text">Email</span>
			</label>
			<input
				id="email"
				type="email"
				name="email"
				placeholder="Email"
				class="input input-bordered w-full max-w-md rounded-full"
				autocomplete="email"
				required
			/>
		</div>
		<label class="form-control w-full max-w-md">
			<div class="label select-auto">
				<span class="label-text">Password</span>
			</div>
			<label
				class="input input-bordered flex w-full max-w-md items-center justify-between rounded-full"
			>
				<input
					type={!showPassword ? 'password' : 'text'}
					name="password"
					id="password"
					placeholder="Password"
					class="w-full"
					autocomplete="current-password"
					required
				/>

				<button
					type="button"
					class="fa-solid cursor-pointer"
					class:fa-eye-slash={showPassword}
					class:fa-eye={!showPassword}
					on:click={() => (showPassword = !showPassword)}
					aria-label={$t.password.toogle}
				></button>
			</label>
		</label>
		<div class="mt-5 flex w-full max-w-md flex-col">
			<button class="btn btn-primary w-full rounded-full" type="submit" disabled={loading}>
				{#if loading}
					<span class="loading loading-spinner text-primary"></span>
				{/if}{$t.session.login}</button
			>
			<a
				href="/register"
				class=" btn-link p-2.5 text-center"
				on:click={() => {
					if (loading) return false;
				}}>{$t.titles.register}</a
			>
			<a
				href="/login/reset_password"
				class=" btn-link text-center"
				on:click={() => {
					if (loading) return false;
				}}>{$t.session.forgotPw}</a
			>
		</div>
	</form>
</div>
