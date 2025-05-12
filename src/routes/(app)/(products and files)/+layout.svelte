<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import ModalHowToCite from '../../../Components/Modals/ModalHowToCite.svelte';
	import ModalVersionInfo from '../../../Components/Modals/ModalVersionInfo.svelte';
	import ModalWmsInfo from '../../../Components/Modals/ModalWmsInfo.svelte';
	import { t } from '$lib/lang';
	import { slide } from 'svelte/transition';

	let isCollapsed = false;

	onMount(() => {
		updateSidebar(window.innerWidth);
		window.addEventListener('resize', () => updateSidebar(window.innerWidth));
	});

	onDestroy(() => {
		window.removeEventListener('resize', () => updateSidebar(window.innerWidth));
	});

	function updateSidebar(width: number) {
		isCollapsed = width < 768; // Recolhe se menor que 'md'
	}

	export let data;

	let viewModalHowToCite = false;
	let viewModalVersionInfo = false;
	let viewModalWmsInfo = false;
</script>

{#if viewModalHowToCite}
	<ModalHowToCite />
{/if}

{#if viewModalVersionInfo}
	<ModalVersionInfo dbVersions={data.dbVersions} />
{/if}

{#if viewModalWmsInfo}
	<ModalWmsInfo />
{/if}

<!-- Sidebar -->
<div class="flex h-full">
	<aside
		class="h-full border-r-2 border-r-gray-200 duration-300"
		class:md:w-60={!isCollapsed}
		class:w-14={isCollapsed}
		transition:slide
	>
		<table class="w-full">
			<tbody>
				<tr
					on:click={() => goto('/products')}
					class="mt-3 flex w-full cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
				>
					<td class="w-1/5">
						<i class="fa-solid fa-folder"></i>
					</td>
					{#if !isCollapsed}
						<td>
							<span class=" text-[15px] font-bold md:inline">{$t.titles.data_products}</span>
						</td>
					{/if}
				</tr>
				<!-- tr for data products history-->
				{#if data.roles.some((r) => r.id === data.userData.role && r.role !== 'GUEST' && r.role !== 'CONSULT')}
					<tr
						on:click={() => goto('/products/history')}
						class="flex w-full cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
					>
						<td class="w-1/5">
							<i class="fa-solid fa-history"></i>
						</td>
						{#if !isCollapsed}
							<td>
								<span class=" text-[15px] font-bold md:inline"
									>{$t.titles.data_products_history}</span
								>
							</td>
						{/if}
					</tr>
				{/if}
				<tr class="divider my-0 px-2"></tr>

				{#if data.roles.some((r) => r.id === data.userData.role && r.role !== 'GUEST')}
					<tr
						on:click={() => goto('/profile')}
						class="flex cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
					>
						<td class=" w-1/5">
							<i class="fa-solid fa-user"></i>
						</td>
						{#if !isCollapsed}
							<td>
								<span class=" md:inlinetext-[15px] font-bold">{$t.session.profile}</span>
							</td>
						{/if}
					</tr>
					{#if data.roles.some((r) => r.id === data.userData.role && r.role === 'ADMIN')}
						<tr
							on:click={() => goto('/users')}
							class="flex cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
						>
							<td class="flex w-1/5 items-center rounded-md">
								<i class="fa-solid fa-users-gear"></i>
							</td>
							{#if !isCollapsed}
								<td>
									<span class="text-[15px] font-bold md:inline">{$t.session.users}</span>
								</td>
							{/if}
						</tr>
					{/if}
					<tr
						on:click={() => goto('/logout', { invalidateAll: true })}
						class="flex cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
					>
						<td class="w-1/5"> <i class="fa-solid fa-right-from-bracket"> </i></td>
						{#if !isCollapsed}
							<td>
								<span class="text-[15px] font-bold md:inline">{$t.session.logout}</span>
							</td>
						{/if}
					</tr>
				{/if}
				{#if data.roles.some((r) => r.id === data.userData.role && r.role === 'GUEST')}
					<tr
						on:click={() => goto('/login')}
						class="flex cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
					>
						<td class="w-1/5">
							<i class="fa-solid fa-right-to-bracket"></i>
						</td>
						{#if !isCollapsed}
							<td>
								<span class=" text-[15px] font-bold md:inline">{$t.session.login}</span>
							</td>
						{/if}
					</tr>

					<tr
						on:click={() => goto('/register')}
						class="flex cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
					>
						<td class="w-1/5">
							<i class="fa-solid fa-user-plus"></i>
						</td>
						{#if !isCollapsed}
							<td>
								<span class=" text-[15px] font-bold md:inline">{$t.titles.register}</span>
							</td>
						{/if}
					</tr>
				{/if}
				<tr
					on:click={() => goto('/help')}
					class="flex cursor-pointer items-center rounded-md p-2.5 px-4 duration-300 hover:bg-blue-600 hover:text-white"
				>
					<td class="w-1/5">
						<i class="fa-solid fa-circle-question"></i>
					</td>
					{#if !isCollapsed}
						<td>
							<span class=" text-[15px] font-bold md:inline">{$t.titles.help}</span>
						</td>
					{/if}
				</tr>
				<tr
					class="flex w-full cursor-pointer items-center rounded-md p-2.5 px-4 text-left duration-300 hover:bg-blue-600 hover:text-white"
					on:click={() => {
						viewModalHowToCite = true;
						setTimeout(() => {
							const dialog = document.getElementById('modal-howtocite');
							if (dialog instanceof HTMLDialogElement) {
								dialog.showModal();
							}
						}, 0);
					}}
				>
					<td class="w-1/5">
						<i class="fa-solid fa-quote-right"></i>
					</td>
					{#if !isCollapsed}
						<td>
							<span class=" text-[15px] font-bold md:inline">{$t.titles.howtocite}</span>
						</td>
					{/if}
				</tr>
				<tr
					class="flex w-full cursor-pointer items-center rounded-md p-2.5 px-4 text-left duration-300 hover:bg-blue-600 hover:text-white"
					on:click={() => {
						viewModalVersionInfo = true;
						setTimeout(() => {
							const dialog = document.getElementById('modal-versioninfo');
							if (dialog instanceof HTMLDialogElement) {
								dialog.showModal();
							}
						}, 0);
					}}
				>
					<td class="w-1/5">
						<i class="fa-solid fa-circle-info"></i>
					</td>
					{#if !isCollapsed}
						<td>
							<span class=" text-[15px] font-bold md:inline">{$t.titles.versionInfo}</span>
						</td>
					{/if}
				</tr>
				<tr
					class="flex w-full cursor-pointer items-center rounded-md p-2.5 px-4 text-left duration-300 hover:bg-blue-600 hover:text-white"
					on:click={() => {
						viewModalWmsInfo = true;
						setTimeout(() => {
							const dialog = document.getElementById('modal-wmsinfo');
							if (dialog instanceof HTMLDialogElement) {
								dialog.showModal();
							}
						}, 0);
					}}
				>
					<td class="w-1/5">
						<i class="fa-solid fa-layer-group"></i>
					</td>
					{#if !isCollapsed}
						<td>
							<span class=" text-[15px] font-bold md:inline">WMS</span>
						</td>
					{/if}
				</tr>
			</tbody>
		</table>
	</aside>
</div>

<!-- Main -->
<main class="w-full flex-1 overflow-y-auto bg-slate-50 p-6"><slot /></main>
