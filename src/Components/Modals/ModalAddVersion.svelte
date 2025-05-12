<script lang="ts">
	import { onMount } from 'svelte';
	import {
		_createVersion,
		_getLatestVersion
	} from '../../routes/(app)/(products and files)/products/+page';
	import { toast } from '$lib/stores/toast';
	import { invalidate } from '$app/navigation';
	import HandleEsc from '../HandleEsc.svelte';
	import { t } from '$lib/lang';

	export let userRole: number;
	export let usersRoles: any[];
	export let versions;
	export let showModalAddVersion: boolean;

	let formAddVersion: HTMLFormElement;
	let latestVersion;

	onMount(() => {
		latestVersion = _getLatestVersion(versions);
	});

	const getNextVersion = () => {
		if (latestVersion) {
			//remove firt element of latest version "v01" to get number
			let number = latestVersion.replace('v', '');
			let nextVersion = 'v' + (parseInt(number) + 1).toString().padStart(2, '0');
			return nextVersion;
		}
	};

	async function handleVersionCreate() {
		try {
			// Extrair dados do formulário
			const formData = new FormData(formAddVersion);
			const versionName = formData.get('version') as string;
			const changesEnglish = formData.get('changes_english') as string;
			const changesPortuguese = formData.get('changes_portuguese') as string;

			// Enviar dados para a API
			const res = await _createVersion(fetch, versionName, changesEnglish, changesPortuguese);

			if (res.success) {
				// Exibir mensagem de sucesso
				toast(res.success, 'success');
				resetForm();
				invalidate('data:versions');
			} else {
				// Exibir erro se o backend retornar falha
				toast(res.error, 'error');
			}
		} catch (err: any) {
			// Capturar erros e exibir mensagens apropriadas
			toast(err.message, 'error');
		}
	}

	function resetForm() {
		formAddVersion.reset();

		const dialog = document.getElementById('modal-add-version');

		if (dialog instanceof HTMLDialogElement) {
			dialog.close();
			showModalAddVersion = false;
		}
	}
</script>

{#if showModalAddVersion}
	<HandleEsc resetFunc={resetForm} />;
{/if}

{#if usersRoles.some((r) => r.id === userRole && (r.role === 'GESTOR' || r.role === 'ADMIN')) && latestVersion}
	<dialog class="modal" id="modal-add-version">
		<div class="modal-box">
			<h3 class="mb-4 text-lg font-bold">{$t.version.add}</h3>
			<form on:submit|preventDefault={handleVersionCreate} bind:this={formAddVersion}>
				<div class="mb-2 flex flex-col gap-2">
					<label for={$t.version.version}>{$t.version.version}:</label>
					<input
						type="text"
						id={$t.version.version}
						name="version"
						class="input input-bordered"
						value={getNextVersion()}
						readonly
						required
					/>

					<label for={$t.version.changes_english}>{$t.version.changes_english}:</label>
					<textarea
						id={$t.version.changes_english}
						placeholder={$t.version.changes_english}
						name="changes_english"
						class="textarea textarea-bordered"
						required
					></textarea>

					<label for={$t.version.changes_portuguese}>{$t.version.changes_portuguese}:</label>
					<textarea
						id={$t.version.changes_portuguese}
						placeholder={$t.version.changes_portuguese}
						name="changes_portuguese"
						class="textarea textarea-bordered"
						required
					></textarea>
				</div>
				<div class="modal-action">
					<button class="btn btn-error rounded-full" type="button" on:click={resetForm}>
						<i class="fa-solid fa-xmark mr-2"></i>{$t.actions.cancel}
					</button>
					<button class="btn btn-primary rounded-full" type="submit"
						><i class="fa-solid fa-floppy-disk mr-2"></i>{$t.actions.save}</button
					>
				</div>
			</form>
		</div>
	</dialog>
{/if}
