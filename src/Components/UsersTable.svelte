<script lang="ts">
	export let tableData = {
		users: [],
		total: 0,
		page: 1,
		pageSize: 10,
		search: ''
	};
	import { t } from '$lib/lang';
	import ModalConfirmDeleteUser from './Modals/ModalConfirmDeleteUser.svelte';
	import ModalUserSettings from './Modals/ModalUserSettings.svelte';
	import Toast from './Toast.svelte';

	let viewModalUserSettings = false;
	let viewModalConfirmDeleteUser = false;
	let userData = null;
	export let roles;
	export let loggedInUser;
</script>

<Toast />

{#if tableData.total === 0}
	<div class="flex h-full flex-col items-center justify-center">
		<i class="fa-solid fa-folder-open fa-5x"></i>
		<h1 class="text-2xl font-bold">{$t.tables.nodata}</h1>
	</div>
{:else}
	<table class="table mt-6 w-full table-auto">
		<thead class="bg-base-300">
			<tr class="round-corners static">
				<th>Email</th>
				<th>{$t.tables.roleUser}</th>
				<th>{$t.tables.userCreatedAt}</th>
				<th>{$t.tables.userLastSeen}</th>
				<th>{$t.tables.actions}</th>
			</tr>
		</thead>
		<tbody>
			{#each tableData.users as user}
				<tr class="hover">
					<td>{user.email}</td>
					<td>{user.role}</td>
					<td>{user.created_at}</td>
					<td>{user.last_login ?? $t.never}</td>
					<td>
						{#if user.email !== loggedInUser.email}
							<div class="inline-flex items-center gap-3">
								<div class="tooltip" data-tip={$t.tables.userSettings}>
									<button
										aria-label="modal user settings"
										on:click={() => {
											viewModalUserSettings = true;
											userData = user;
											setInterval(() => {
												const dialog = document.getElementById('modal-user-settings');
												if (dialog instanceof HTMLDialogElement) {
													dialog.showModal();
												}
											}, 0);
										}}
									>
										<i class="fa-solid fa-gear"></i>
									</button>
								</div>
								<div class="tooltip" data-tip={$t.tables.userDelete}>
									<button
										aria-label="delete user"
										on:click={() => {
											viewModalConfirmDeleteUser = true;
											userData = user;
											setInterval(() => {
												const dialog = document.getElementById('modal-confirm-delete-user');
												if (dialog instanceof HTMLDialogElement) {
													dialog.showModal();
												}
											}, 0);
										}}
									>
										<i class="fa-solid fa-trash text-red-600"></i>
									</button>
								</div>
							</div>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

{#if viewModalUserSettings && userData && roles}
	<ModalUserSettings bind:viewModalUserSettings bind:user={userData} {roles} />
{/if}

{#if viewModalConfirmDeleteUser && userData}
	<ModalConfirmDeleteUser bind:viewModalConfirmDeleteUser bind:user={userData} />
{/if}
