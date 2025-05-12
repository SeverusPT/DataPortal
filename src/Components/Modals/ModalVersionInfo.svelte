<script lang="ts">
	import { onMount } from 'svelte';
	import { _getLatestVersion } from '../../routes/(app)/(products and files)/products/+page';
	import { currentLang, t } from '$lib/lang';

	export let dbVersions;
	let latestVersion: string;

	onMount(async () => {
		if (dbVersions?.length > 0) {
			// Transforme `dbVersions` em JSON
			const dbVersionsToJson = dbVersions.reduce((acc, cur) => {
				acc[cur.version_name] = cur;
				return acc;
			}, {});

			// Determine a última versão
			latestVersion = _getLatestVersion(dbVersionsToJson);
		}
	});

	// Função para obter a descrição correta
	function getChanges(version) {
		if (!version[`changes_${$currentLang}`] || version[`changes_${$currentLang}`] === '') {
			return $t.version.noChangesVersion;
		}
		return version[`changes_${$currentLang}`];
	}
</script>

{#if dbVersions && latestVersion}
	<dialog
		class="modal"
		id="modal-versioninfo"
		aria-labelledby="versioninfo-title"
		aria-describedby="versioninfo-content"
	>
		<div class="modal-box w-full max-w-2xl">
			<div class="sticky top-0">
				<button
					class="btn btn-circle btn-sm absolute right-0 top-0"
					aria-label="Close"
					on:click={() => {
						let dialog = document.getElementById('modal-versioninfo');
						if (dialog instanceof HTMLDialogElement) {
							dialog.close();
						}
					}}>✕</button
				>
			</div>

			<h3 class="mb-4 text-lg font-bold">
				{$t.titles.versionInfo}
			</h3>
			{#if dbVersions.length > 0}
				{#each dbVersions as version}
					<div>
						<p>
							<b>{$t.version.version} {version.version_name}</b>
							{#if version.version_name === latestVersion}
								<span class="text-red-500"> <em>({$t.version.latestVersion})</em></span>
							{/if}:
							<br />
							{getChanges(version)}
						</p>
						<br />
					</div>
				{/each}
			{:else}
				<p>Sem dados</p>
			{/if}
		</div>
	</dialog>
{/if}
