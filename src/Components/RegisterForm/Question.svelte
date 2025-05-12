<script lang="ts">
	import ptMunicipalities from '$lib/data/portugal-municipality.json';
	import { currentLang, t } from '$lib/lang';

	export let questionObj: any;
	export let stepId: number;
	export let registerSteps: any[];

	// Estados que iremos manipular
	export let questionnaireForm: any[];
	export let selectedCountry: string;
	export let isPortugal: boolean;
	export let selectedNuts3: string;
	export let filteredCountries: any[];
	export let textarea: string;
	export let userForm: {
		email: string;
		password: string;
		repeatPassword: string;
	};
	export let isValidEmail;
	export let isValidPassword;
	export let showPassword;

	// Funções importadas do +page.ts
	export let _handleCheckboxChange;
	export let _handleOtherInputChange;
	export let _handleCountrySelection;
	export let _handleNuts3Selection;
	export let _handleMunicipalitySelection;
	export let _handleTextAreaChange;
	export let _selectCountry;
	export let _validateEmail;
	export let _validatePassword;

	// A cada input, chamamos as funções adequadas para atualizar 'questionnaireForm'.
</script>

<!-- Aqui fica a lógica do "se type === multiple, single, etc." -->
{#if questionObj.type === 'multiple' || questionObj.type === 'single'}
	{#each questionObj.responses as responseObj, responseIdx}
		<label class="label cursor-pointer select-auto justify-normal">
			<input
				type={questionObj.type === 'multiple' ? 'checkbox' : 'radio'}
				class={questionObj.type === 'multiple' ? 'checkbox' : 'radio'}
				name={questionObj.question[$currentLang]}
				on:change={(ev) => {
					questionnaireForm = _handleCheckboxChange(
						stepId,
						questionObj,
						responseObj.id,
						(ev.target as HTMLInputElement).checked,
						questionnaireForm,
						questionObj.type === 'multiple' ? 'checkbox' : 'radio'
					);
				}}
				checked={questionnaireForm
					.find((item) => item.stepId === stepId)
					?.questions.find((q) => q.questionId === questionObj.id)
					?.responses.includes(responseObj.id)}
			/>
			<span class="label-text ml-2 text-left">{responseObj.response[$currentLang]}</span>

			{#if responseObj.custom_flag === 'requires_comment' && questionnaireForm
					.find((item) => item.stepId === stepId)
					?.questions.find((q) => q.questionId === questionObj.id)
					?.responses.includes(responseObj.id)}
				<input
					type="text"
					class="input input-bordered w-full max-w-md rounded-full capitalize"
					placeholder={$t.other}
					value={questionnaireForm
						.find((item) => item.stepId === stepId)
						?.questions.find((q) => q.questionId === questionObj.id)?.other || ''}
					on:input={(ev) => {
						questionnaireForm = _handleOtherInputChange(
							stepId,
							questionObj.id,
							(ev.target as HTMLInputElement).value,
							questionnaireForm
						);
					}}
				/>
			{/if}
		</label>
	{/each}
{:else if questionObj.custom_flag === 'custom_portugal'}
	<!-- País (autocomplete) -->
	<div class="relative">
		<input
			type="text"
			id="country"
			placeholder={$t.country}
			autocomplete="off"
			class="input input-bordered w-full max-w-md rounded-full capitalize"
			bind:value={selectedCountry}
			on:input={() => {
				filteredCountries = _handleCountrySelection(selectedCountry);
			}}
		/>
		{#if filteredCountries.length > 0}
			<div
				class="absolute left-0 top-full z-10 w-full rounded-md border border-gray-300 bg-white shadow-lg"
			>
				{#each filteredCountries as country}
					<button
						class="w-full cursor-pointer p-2 text-left hover:bg-gray-200"
						on:click={() => {
							const res = _selectCountry(
								stepId,
								questionObj.id,
								{ en: country.en, pt: country.pt },
								registerSteps,
								questionnaireForm
							);
							questionnaireForm = res.questionnaireForm;
							filteredCountries = res.filteredCountries;
							selectedCountry = res.selectedCountry;
							isPortugal = res.isPortugal;
						}}
					>
						{country[$currentLang]}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{:else if questionObj.type === 'NUTS-3'}
	<!-- NUTS-3 como radio -->
	{#if isPortugal}
		{#each Object.keys(ptMunicipalities) as nuts3}
			<label class="label cursor-pointer select-auto justify-normal">
				<input
					type="radio"
					class="radio"
					name={questionObj.question[$currentLang]}
					on:change={() => {
						questionnaireForm = _handleNuts3Selection(
							stepId,
							questionObj.id,
							nuts3,
							registerSteps,
							questionnaireForm
						);
						selectedNuts3 = nuts3;
					}}
					checked={questionnaireForm
						.find((item) => item.stepId === stepId)
						?.questions.find((q) => q.questionId === questionObj.id)
						?.responses.some((res) => typeof res === 'object' && res.pt === nuts3)}
				/>
				<span class="label-text ml-2 text-left">{nuts3}</span>
			</label>
		{/each}
	{/if}
{:else if questionObj.type === 'Municipality'}
	<!-- Município como radio -->
	{#if isPortugal && selectedNuts3 !== ''}
		{#each ptMunicipalities[selectedNuts3] as municipality}
			<label class="label cursor-pointer select-auto justify-normal">
				<input
					type="radio"
					class="radio"
					name={questionObj.question[$currentLang]}
					on:change={() => {
						questionnaireForm = _handleMunicipalitySelection(
							stepId,
							questionObj.id,
							municipality,
							questionnaireForm
						);
					}}
					checked={questionnaireForm
						.find((item) => item.stepId === stepId)
						?.questions.find((q) => q.questionId === questionObj.id)
						?.responses.some((res) => typeof res === 'object' && res.pt === municipality)}
				/>
				<span class="label-text ml-2 text-left">{municipality}</span>
			</label>
		{/each}
	{/if}
{:else if questionObj.type === 'textarea'}
	<!-- Textarea -->
	<textarea
		rows="5"
		cols="30"
		maxlength="200"
		id="textarea"
		class="textarea textarea-bordered w-full max-w-md rounded-md"
		bind:value={textarea}
		on:input={(ev) => {
			questionnaireForm = _handleTextAreaChange(
				stepId,
				questionObj.id,
				textarea,
				questionnaireForm
			);
		}}
	></textarea>
	<p class="text-right text-gray-500">{textarea.length}/200</p>
{:else if questionObj.type === 'user'}
	<!-- Campos de usuário -->
	<div class="form-control w-full max-w-md">
		<label class="label select-auto" for="email">
			<span class="label-text">Email</span>
		</label>
		<input
			type="email"
			id="email"
			autocomplete="on"
			placeholder="Email"
			class="input input-bordered w-full max-w-md rounded-full"
			bind:value={userForm.email}
			on:input={() => {
				isValidEmail = _validateEmail(userForm.email);
			}}
		/>
		{#if !isValidEmail && userForm.email !== ''}
			<p class="p-1 text-red-600">{$t.errors.invalidEmail}</p>
		{/if}
	</div>
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
				aria-label="toggle password"
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
				id="repeatPassword"
				bind:value={userForm.repeatPassword}
				placeholder={$t.password.repeat}
				class="w-full"
			/>
			<button
				type="button"
				class="fa-solid cursor-pointer"
				class:fa-eye-slash={showPassword}
				class:fa-eye={!showPassword}
				on:click={() => (showPassword = !showPassword)}
				aria-label="toggle password"
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
{:else}
	<!-- Fallback caso surja outro tipo não mapeado -->
{/if}
