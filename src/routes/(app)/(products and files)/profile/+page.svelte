<script lang="ts">
	import { pageTitle } from '$lib/stores/title';
	import Toast from '../../../../Components/Toast.svelte';
	import { _generateAPIKey } from './+page';
	pageTitle.set('session.profile');
	export let data;
	let edit: boolean = false;
	import { toast } from '$lib/stores/toast';
	import { t } from '$lib/lang';
</script>

<div class="flex flex-col gap-6">
	<Toast />

	<div class="card w-full bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title">{$t.titles.info}</h2>
			<div class="form-control w-full max-w-xs">
				<label class="label select-auto" for="email-input">
					<span class="label-text">Email</span>
				</label>
				<input
					type="email"
					placeholder="Email..."
					class="input input-bordered w-full max-w-xs rounded-full"
					value={data.userData.email}
					disabled
					id="email-input"
				/>
			</div>
			<!-- <div class="card-actions justify-end">
				{#if edit}
					<button class="btn btn-error rounded-full" on:click={() => (edit = false)}>
						<i class="fa-solid fa-xmark mr-2"></i>{$t.actions.cancel}
					</button>

					<button class="btn btn-primary rounded-full">
						<i class="fa-solid fa-save"></i>
						{$t.actions.save}
					</button>
				{:else}
					<button
						class="btn btn-primary rounded-full"
						on:click={() => {
							edit = true;
						}}
					>
						<i class="fa-solid fa-user-edit"></i>
						{$t.actions.edit}</button
					>
				{/if}
			</div> -->
		</div>
	</div>
	{#if data.roles.some((r) => r.id === data.userData.role && (r.role === 'ADMIN' || r.role === 'GESTOR'))}
		<div class="card w-full bg-base-100 shadow-sm">
			<div class="card-body">
				<h2 class="card-title">{$t.api.access}</h2>

				<div class="flex flex-row gap-2">
					{#if data.apiKey !== '' && data.apiKey !== undefined}
						<label class="label select-auto" for="api-key-input">
							<span class="label-text">{$t.api.key}</span>
						</label>
						<input
							id="api-key-input"
							type="text"
							placeholder="{$t.api.key}..."
							class="input input-bordered w-full max-w-xs rounded-full"
							value={data.apiKey}
							disabled
						/>
						{#if !data.apiKey.includes('...')}
							<button
								aria-label="copy api key"
								class="btn btn-circle btn-primary"
								on:click={async () => {
									await navigator.clipboard.writeText(data.apiKey).then(() => {
										toast($t.api.copied, 'success');
									});
								}}
							>
								<i class="fa-solid fa-copy"></i>
							</button>
						{/if}
					{/if}
					<button
						class="btn btn-primary rounded-full"
						on:click={async () =>
							await _generateAPIKey().then((res) => {
								if (res.success) {
									data.apiKey = res.key;
								}
							})}
					>
						<i class="fa-solid fa-key"></i>
						{$t.api.generate}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
