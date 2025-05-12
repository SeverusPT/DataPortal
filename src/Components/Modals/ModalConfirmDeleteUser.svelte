<script lang="ts">
	export let viewModalConfirmDeleteUser: boolean;
	export let user;
	import HandleEsc from '../HandleEsc.svelte';
	let modal: HTMLDialogElement | null = null;
	import { t } from '$lib/lang';
	import { toast } from '$lib/stores/toast';
	import { invalidate } from '$app/navigation';

	function closeModal() {
		viewModalConfirmDeleteUser = false;
		modal?.close();
		user = null;
	}

	async function handleUserDelete(email: string) {
		const data = {
			email: email
		};
		const response = await fetch(`/users`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const resJson = await response.json();

		if (resJson.success) {
			invalidate('data:users');
			closeModal();
			toast(resJson.message, 'success');
		} else {
			invalidate('data:users');
			closeModal();
			toast(resJson.message, 'error');
		}
	}
</script>

{#if viewModalConfirmDeleteUser}
	<HandleEsc resetFunc={closeModal} />
{/if}

<dialog
	bind:this={modal}
	class="modal"
	id="modal-confirm-delete-user"
	aria-labelledby="user-delete"
>
	<div class="modal-box w-full max-w-2xl">
		<div class="sticky top-0">
			<button
				class="btn btn-circle btn-sm absolute right-0 top-0"
				aria-label="Close"
				on:click={closeModal}>✕</button
			>
		</div>

		<h3 class="mb-4 text-lg font-bold">
			{$t.user.deleteUser}
		</h3>
		<div class="flex flex-col gap-4">
			<div>
				<p>
					{$t.user.confirmDeleteUser.split('{email}')[0]}
					<b>{user.email}</b>
					{$t.user.confirmDeleteUser.split('{email}')[1]}
				</p>
			</div>
		</div>

		<div class="modal-action">
			<button class="btn btn-error rounded-full" type="button" on:click={() => closeModal()}>
				<i class="fa-solid fa-xmark mr-2"></i>{$t.actions.cancel}
			</button>
			<button
				class="btn btn-primary rounded-full"
				on:click={async () => await handleUserDelete(user.email)}
				><i class="fa-solid fa-trash mr-2"></i>{$t.actions.delete}</button
			>
		</div>
	</div>
</dialog>
