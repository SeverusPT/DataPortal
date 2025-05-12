<script lang="ts">
	import { pageTitle } from '$lib/stores/title.js';
	import UsersTable from '../../../../Components/UsersTable.svelte';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';
	import { t } from '$lib/lang';

	export let data;
	pageTitle.set('session.users');

	// Ligar as variáveis à URL atual usando $page corretamente
	$: page = parseInt($pageStore.url.searchParams.get('page') || '1');
	$: pageSize = $pageStore.url.searchParams.get('pageSize') || '10';
	$: search = $pageStore.url.searchParams.get('search') || '';

	// Atualizar página
	function updatePage(newPage: number) {
		goto(`/users?page=${newPage}&pageSize=${pageSize}&search=${search}`);
	}

	// Atualizar tamanho da página
	function updatePageSize(newSize: number) {
		goto(`/users?page=1&pageSize=${newSize}&search=${search}`);
	}

	// Pesquisa por email
	function searchByEmail() {
		goto(`/users?page=1&pageSize=${pageSize}&search=${search}`);
	}

	// Função para resetar os filtros
	function resetFilters() {
		goto('/users?page=1&pageSize=10&search=');
	}
</script>

<!-- Filtros e Controlo -->
<div class="mb-4 flex items-center justify-between">
	<div>
		<label for="pageSize" class="mr-2">{$t.user.resultsPerPage}:</label>
		<select
			id="pageSize"
			bind:value={pageSize}
			class="select select-bordered select-sm rounded-full"
			on:change={() => updatePageSize(parseInt(pageSize))}
		>
			<option value="5">5</option>
			<option value="10">10</option>
			<option value="20">20</option>
			<option value="50">50</option>
		</select>
	</div>

	<div>
		<input
			id="searchByEmail"
			type="text"
			bind:value={search}
			placeholder={$t.user.searchByEmail}
			class="input input-bordered mr-2 rounded-full"
		/>
		<button
			class="btn btn-circle btn-primary"
			on:click={searchByEmail}
			aria-label={$t.user.searchByEmail}
		>
			<i class="fa-solid fa-magnifying-glass"></i>
		</button>
		<button
			class="btn btn-circle btn-secondary"
			on:click={resetFilters}
			aria-label={$t.user.resetFilters}
		>
			<i class="fa-solid fa-rotate-left"></i>
		</button>
	</div>
</div>

<!-- Contagem de Resultados -->
<p class="mb-4">
	{$t.user.showingUsers
		.replace('{start}', data.usersData.users.length.toString())
		.replace('{end}', data.usersData.total.toString())
		.replace('{total}', data.usersData.total.toString())}
</p>

<!-- Tabela -->
<UsersTable tableData={data.usersData} roles={data.roles} loggedInUser={data.userData} />

<!-- Paginação -->
<div class="mt-4 flex justify-center">
	{#each Array(Math.ceil(data.usersData.total / parseInt(pageSize))) as _, index}
		<button
			class="btn btn-sm mx-1 {index + 1 === page ? 'btn-active' : ''}"
			on:click={() => updatePage(index + 1)}
			disabled={index + 1 === page}
		>
			{index + 1}
		</button>
	{/each}
</div>
