<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { goto } from '$app/navigation';

	// Importa do seu +page.ts
	import {
		_handleCheckboxChange,
		_handleOtherInputChange,
		_validateForm,
		_handleCountrySelection,
		_validateEmail,
		_validatePassword,
		_submitquestionnaireForm,
		_selectCountry,
		_handleMunicipalitySelection,
		_handleNuts3Selection,
		_handleTextAreaChange
	} from '../../routes/(app)/(products and files)/register/+page';

	// Componente que exibe UMA pergunta (com radio, checkbox, textarea, user, etc.)
	import Question from '../RegisterForm/Question.svelte';
	import LoadingComponent from '../LoadingComponent.svelte';
	import { currentLang, t } from '$lib/lang';

	export let registerSteps: any[];

	/* ================= ESTADOS ================= */

	let isLoading = false;

	let questionnaireForm: {
		stepId: number;
		questions: {
			questionId: number;
			responses: Array<number | { pt: string; en: string }>;
			other?: string | null;
		}[];
	}[] = [];

	let selectedCountry = '';
	let isPortugal = false;
	let selectedNuts3 = '';
	let stepActive = 0;
	let filteredCountries = [];
	let textarea = '';

	let isValidEmail;
	let isValidPassword;
	let showPassword = false;

	let userForm = {
		email: '',
		password: '',
		repeatPassword: ''
	};

	/* ================= FUNÇÕES PRINCIPAIS ================= */

	function nextStep() {
		const stepId = registerSteps[stepActive].id;
		const { isValid, errors } = _validateForm(stepId, registerSteps, questionnaireForm);
		if (isValid) {
			stepActive += 1;
		} else {
			for (const error of errors) {
				toast(error, 'error');
			}
		}
	}

	function prevStep() {
		if (stepActive > 0) {
			stepActive -= 1;
		}
	}

	async function submitForm() {
		isLoading = true;
		const res = await _submitquestionnaireForm(questionnaireForm, userForm, registerSteps);
		const data = await res.json();
		isLoading = false;

		if (data.success) {
			toast(data.message, 'success');
			goto('/login');
		} else {
			toast(data.message, 'error');
		}
	}
</script>

<!-- Layout do formulário multi-step -->

<div class="flex w-full flex-col items-center px-3">
	{#if registerSteps && registerSteps.length > 0}
		<div class="flex w-full flex-col items-center gap-4">
			<!-- Lista de steps -->
			<ul class="steps steps-vertical p-4 lg:steps-horizontal">
				{#each registerSteps as step, stepIdx}
					<li class="step" class:step-primary={stepIdx <= stepActive}>
						{step.title[$currentLang]}
					</li>
				{/each}
			</ul>

			<!-- Exibindo apenas o step ativo -->
			{#each registerSteps as step, stepIdx}
				{#if stepIdx === stepActive}
					{#each step.questions as questionObj, questionIdx}
						<!-- Aqui exibimos o heading da pergunta -->
						<div class="form-control w-full max-w-md">
							<span class="label select-auto">
								<span class="label-text">
									<b>
										{#if questionObj.type === 'custom_portugal'}
											{questionIdx + 1}. {questionObj.question[$currentLang]}
										{:else if questionObj.type === 'NUTS-3'}
											{#if isPortugal}
												{questionIdx + 1}. {questionObj.question[$currentLang]}
											{/if}
										{:else if questionObj.type === 'Municipality'}
											{#if isPortugal}
												{questionIdx + 1}. {questionObj.question[$currentLang]}
												{#if selectedNuts3 === ''}
													<i class="text-red-600">{$t.forms.nuts3}</i>
												{/if}
											{/if}
										{:else}
											{questionIdx + 1}. {questionObj.question[$currentLang]}
										{/if}
									</b>
								</span>
							</span>

							<!-- Agora chamamos o componente <Question> para renderizar as radios/checkbox etc. -->
							<Question
								{questionObj}
								stepId={step.id}
								{registerSteps}
								bind:questionnaireForm
								bind:selectedCountry
								bind:isPortugal
								bind:selectedNuts3
								bind:filteredCountries
								bind:textarea
								bind:userForm
								bind:isValidEmail
								bind:isValidPassword
								bind:showPassword
								{_handleCheckboxChange}
								{_handleOtherInputChange}
								{_handleCountrySelection}
								{_handleNuts3Selection}
								{_handleMunicipalitySelection}
								{_handleTextAreaChange}
								{_selectCountry}
								{_validateEmail}
								{_validatePassword}
							/>
						</div>
					{/each}
				{/if}
			{/each}

			<!-- Botões de navegação -->
			<div class="join rounded-full p-4">
				{#if stepActive > 0}
					<button class="btn join-item" type="button" on:click={prevStep}>
						{$t.buttons.previous}
					</button>
				{/if}

				{#if stepActive < registerSteps.length - 1}
					<button class="btn join-item" type="button" on:click={nextStep}>
						{$t.buttons.next}
					</button>
				{:else}
					<button
						class="btn btn-primary join-item"
						type="submit"
						disabled={isLoading ||
							!isValidEmail ||
							!isValidPassword ||
							userForm.password !== userForm.repeatPassword}
						on:click={submitForm}
					>
						{#if isLoading}
							<span class="loading loading-spinner text-primary"></span>
						{/if}
						{$t.titles.register}
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<LoadingComponent loadingText={$t.loading.steps} />
	{/if}
</div>
