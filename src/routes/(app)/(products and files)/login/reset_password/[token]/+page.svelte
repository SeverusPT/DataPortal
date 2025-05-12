<script lang="ts">
	import { pageTitle } from '$lib/stores/title';
	import { toast } from '$lib/stores/toast.js';
	import Toast from '../../../../../../Components/Toast.svelte';
	import { _validatePassword } from '../../../register/+page';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { t } from '$lib/lang';

	pageTitle.set('titles.resetPw');

	export let data;

	let loading = false;
	let showPassword = false;
	let isValidPassword;

	let userForm = {
		password: '',
		repeatPassword: ''
	};

	onMount(async () => {
		if (data.resetPwErr) {
			toast(data.resetPwErr.message, 'error');
			goto('/login');
		}
	});

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		const result = deserialize(await response.text());

		if ('data' in result && result.data?.success) {
			toast(result.data.message as string, 'success');
			goto('/login');
		} else if ('data' in result) {
			toast(result.data.message as string, 'error');
			loading = false;
		}

		applyAction(result);
	}
</script>

<Toast />

<div class="flex h-full w-full flex-col items-center justify-center px-3">
	<form
		class="flex w-full flex-col items-center"
		on:submit|preventDefault={(ev) => {
			handleSubmit(ev);
			loading = true;
		}}
	>
		<div class="form-control w-full max-w-md">
			<label class="form-control w-full max-w-md">
				<div class="label select-auto">
					<span class="label-text">Password</span>
				</div>
				<label
					class="input input-bordered flex w-full max-w-md items-center justify-between rounded-full"
				>
					<input
						type={showPassword ? 'text' : 'password'}
						name="password"
						id="password"
						placeholder="Password"
						class="w-full"
						required
						on:input={(ev) => {
							userForm.password = (ev.target as HTMLInputElement).value;
							isValidPassword = _validatePassword(userForm.password);
						}}
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
			<label class="form-control w-full max-w-md">
				<div class="label select-auto">
					<span class="label-text">{$t.password.repeat}</span>
				</div>
				<label
					class="input input-bordered flex w-full max-w-md items-center justify-between rounded-full"
				>
					<input
						type={showPassword ? 'text' : 'password'}
						name="repeatPassword"
						id="repeatPassword"
						on:input={(ev) => {
							userForm.repeatPassword = (ev.target as HTMLInputElement).value;
						}}
						placeholder={$t.password.repeat}
						class="w-full"
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
			<ul class="mt-2 p-1">
				{#if isValidPassword}
					{#if userForm.password !== ''}
						{$t.password.rules}
						{#each Object.keys(isValidPassword.errors) as error}
							<li class={isValidPassword.errors[error] ? 'text-red-600' : 'text-green-600'}>
								<i
									class={isValidPassword.errors[error]
										? 'fa-solid fa-circle-xmark'
										: 'fa-solid fa-circle-check'}
								></i>
								{$t.password[error]}
							</li>
						{/each}
					{/if}
				{/if}
				{#if userForm.password !== userForm.repeatPassword && userForm.repeatPassword !== ''}
					<li class="text-red-600">
						<i class="fa-solid fa-circle-xmark"></i>
						{$t.password.match}
					</li>
				{/if}
			</ul>
			<div class="mt-5 flex w-full max-w-md flex-col">
				<button
					class="btn btn-primary w-full rounded-full"
					type="submit"
					disabled={loading || !isValidPassword || userForm.password !== userForm.repeatPassword}
					>{#if loading}
						<span class="loading loading-spinner text-primary"></span>
					{/if}{$t.actions.save}</button
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
		</div>
	</form>
</div>
