<script lang="ts">
	export let viewModalUserSettings: boolean;
	export let user;
	import HandleEsc from '../HandleEsc.svelte';
	let modal: HTMLDialogElement | null = null;
	import { t } from '$lib/lang';
	import { toast } from '$lib/stores/toast';
	import { invalidate } from '$app/navigation';
	let edit: boolean = false;
	export let roles;

	function closeModal() {
		viewModalUserSettings = false;
		modal?.close();
		user = null;
	}

	let userRoleId = user.role_id;

	async function handleUserUpdateRole(roleId: number, email: string) {
		const data = {
			role_id: roleId,
			email: email
		};
		const response = await fetch(`/users`, {
			method: 'PUT',
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

{#if viewModalUserSettings}
	<HandleEsc resetFunc={closeModal} />
{/if}

<dialog bind:this={modal} class="modal" id="modal-user-settings" aria-labelledby="user-settings">
	<div class="modal-box w-full max-w-2xl">
		<div class="sticky top-0">
			<button
				class="btn btn-circle btn-sm absolute right-0 top-0"
				aria-label="Close"
				on:click={closeModal}>✕</button
			>
		</div>

		<h3 class="mb-4 text-lg font-bold">
			{$t.tables.userSettings}
		</h3>
		<div class="flex flex-col gap-4">
			<div>
				<p>
					<b>Email:</b>
				</p>
				<p>
					{user.email}
				</p>
			</div>
			<div>
				<p>
					<b>{$t.tables.roleUser}:</b>
				</p>
				<div>
					<select
						id="usersRoles"
						bind:value={userRoleId}
						class="select select-bordered select-sm rounded-full"
						disabled={!edit}
					>
						{#each roles as role}
							<option value={role.id}>{role.role}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<div class="modal-action">
			<button
				class="btn {edit ? 'btn-error' : 'btn-primary'} rounded-full"
				type="button"
				on:click={() => {
					if (edit) {
						closeModal();
					} else {
						edit = !edit;
					}
				}}
			>
				<i class="fa-solid {edit ? 'fa-xmark' : 'fa-pen'} mr-2"></i>{edit
					? $t.actions.cancel
					: $t.actions.edit}
			</button>
			{#if userRoleId !== user.role_id}
				<button
					class="btn btn-primary rounded-full"
					on:click={async () => await handleUserUpdateRole(userRoleId, user.email)}
					><i class="fa-solid fa-floppy-disk mr-2"></i>{$t.actions.save}</button
				>
			{/if}
		</div>
	</div>
</dialog>
