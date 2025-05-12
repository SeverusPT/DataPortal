import type { PageLoad } from './$types';
import onuCountries from '$lib/data/onu-countries.json';
import ptMunicipalities from '$lib/data/portugal-municipality.json';
import { t, currentLang } from '$lib/lang';

let currentLanguage;
currentLang.subscribe((value) => {
	currentLanguage = value;
});

let translations;
t.subscribe((value) => {
	translations = value;
});

/**
 * Carrega os steps e ordena as respostas de cada pergunta,
 * colocando as com 'custom_flag' (ex.: "Other") por último.
 */
export const load = (async ({ data }) => {
	const { registerSteps } = data;

	registerSteps.forEach((step: any) => {
		step.questions.forEach((question: any) => {
			question.responses.sort((a: any, b: any) => {
				if (a.custom_flag && !b.custom_flag) return 1;
				if (!a.custom_flag && b.custom_flag) return -1;
				return a.response[currentLanguage].localeCompare(b.response[currentLanguage]);
			});
		});
	});

	return { registerSteps };
}) satisfies PageLoad;

/* ==============================================================
   Função util: centraliza a criação/remoção/atualização de steps e perguntas
   ============================================================== */
function updateQuestionInForm(
	questionnaireForm: any[],
	stepId: number,
	questionId: number,
	newResponses: any[],
	newOther: string | null = null
): any[] {
	const stepIndex = questionnaireForm.findIndex((s) => s.stepId === stepId);

	if (stepIndex === -1) {
		// Step não existe, cria
		questionnaireForm.push({
			stepId,
			questions: [
				{
					questionId,
					responses: newResponses,
					other: newOther
				}
			]
		});
	} else {
		const questions = questionnaireForm[stepIndex].questions;
		const qIndex = questions.findIndex((q: any) => q.questionId === questionId);

		if (qIndex === -1) {
			questions.push({
				questionId,
				responses: newResponses,
				other: newOther
			});
		} else {
			questions[qIndex].responses = newResponses;
			questions[qIndex].other = newOther;
			// Remove a pergunta se estiver vazia
			if (!newResponses.length && !newOther) {
				questions.splice(qIndex, 1);
			}
		}
		// Remove o step se não houver perguntas
		if (!questions.length) {
			questionnaireForm.splice(stepIndex, 1);
		}
	}

	return questionnaireForm;
}

/* ==============================================================
   Múltipla escolha / Seleção única
   ============================================================== */
export const _handleCheckboxChange = (
	stepId: number,
	questionObj: any, // Recebe o objeto da pergunta
	responseId: number,
	isChecked: boolean,
	questionnaireForm: any[],
	type: 'checkbox' | 'radio'
) => {
	// Pegamos as respostas já existentes (se houver)
	let stepIndex = questionnaireForm.findIndex((s: any) => s.stepId === stepId);
	let existingResponses: any[] = [];
	let existingOther: string | null = null;

	if (stepIndex !== -1) {
		const qIndex = questionnaireForm[stepIndex].questions.findIndex(
			(q: any) => q.questionId === questionObj.id
		);
		if (qIndex !== -1) {
			existingResponses = questionnaireForm[stepIndex].questions[qIndex].responses;
			existingOther = questionnaireForm[stepIndex].questions[qIndex].other;
		}
	}

	if (type === 'checkbox') {
		if (isChecked) {
			// Marcando um checkbox
			if (!existingResponses.includes(responseId)) {
				existingResponses.push(responseId);
			}
		} else {
			// Desmarcando
			existingResponses = existingResponses.filter((r) => r !== responseId);

			// Verifica se este 'responseId' tem custom_flag = 'requires_comment'
			const responseObj = questionObj.responses.find((r: any) => r.id === responseId);
			if (responseObj?.custom_flag === 'requires_comment') {
				// Se está desmarcando 'Other', limpa o existingOther
				existingOther = null;
			}
		}
	} else {
		// radio
		existingResponses = isChecked ? [responseId] : [];
	}

	return updateQuestionInForm(
		questionnaireForm,
		stepId,
		questionObj.id,
		existingResponses,
		existingOther
	);
};

/* ==============================================================
   Campo "Other" (requires_comment)
   ============================================================== */
export const _handleOtherInputChange = (
	stepId: number,
	questionId: number,
	value: string,
	questionnaireForm: any[]
) => {
	let stepIndex = questionnaireForm.findIndex((item: any) => item.stepId === stepId);
	let existingResponses: any[] = [];

	if (stepIndex !== -1) {
		const qIndex = questionnaireForm[stepIndex].questions.findIndex(
			(q: any) => q.questionId === questionId
		);
		if (qIndex !== -1) {
			existingResponses = questionnaireForm[stepIndex].questions[qIndex].responses;
		}
	}
	const newOther = value || null;

	return updateQuestionInForm(questionnaireForm, stepId, questionId, existingResponses, newOther);
};

/* ==============================================================
   Selecionar país (custom_portugal)
   ============================================================== */
export const _handleCountrySelection = (input: string) => {
	let filteredCountries: any[] = [];
	if (input.length >= 2) {
		filteredCountries = onuCountries.filter((c: any) =>
			c[currentLanguage]?.toLowerCase().includes(input.toLowerCase())
		);
	}
	return filteredCountries;
};

export const _selectCountry = (
	stepId: number,
	questionId: number,
	country: { pt: string; en: string },
	registerSteps: any[],
	questionnaireForm: any[]
) => {
	// responses = [country]
	questionnaireForm = updateQuestionInForm(questionnaireForm, stepId, questionId, [country]);

	const isPortugal = country.en.toLowerCase() === 'portugal';

	// Se não for Portugal, remove NUTS-3 e Município (se existirem)
	if (!isPortugal) {
		const nuts3QuestionId = registerSteps
			.find((st: any) => st.id === stepId)
			?.questions.find((q: any) => q.type === 'NUTS-3')?.id;
		const municipalityQuestionId = registerSteps
			.find((st: any) => st.id === stepId)
			?.questions.find((q: any) => q.type === 'Municipality')?.id;

		if (nuts3QuestionId) {
			questionnaireForm = _removeQuestionById(stepId, nuts3QuestionId, questionnaireForm);
		}
		if (municipalityQuestionId) {
			questionnaireForm = _removeQuestionById(stepId, municipalityQuestionId, questionnaireForm);
		}
	}

	return {
		questionnaireForm,
		isPortugal,
		filteredCountries: [],
		selectedCountry: country[currentLanguage]
	};
};

/* ==================================================================================
  Remove do questionnaireForm a pergunta cujo questionId seja "questionIdToRemove"
  dentro do step "stepId".
   ==================================================================================*/
function _removeQuestionById(stepId: number, questionIdToRemove: number, questionnaireForm: any[]) {
	const stepIndex = questionnaireForm.findIndex((s: any) => s.stepId === stepId);
	if (stepIndex !== -1) {
		// Remove a pergunta questionIdToRemove
		questionnaireForm[stepIndex].questions = questionnaireForm[stepIndex].questions.filter(
			(q: any) => q.questionId !== questionIdToRemove
		);
		// Se o step não tiver mais perguntas, remove
		if (!questionnaireForm[stepIndex].questions.length) {
			questionnaireForm.splice(stepIndex, 1);
		}
	}
	return questionnaireForm;
}

/* ==============================================================
   Selecionar NUTS-3 (radio) e remover município, se trocar
   ============================================================== */

export const _handleNuts3Selection = (
	stepId: number,
	questionId: number,
	nuts3: string,
	registerSteps: any[],
	questionnaireForm: any[]
) => {
	const stepIndex = questionnaireForm.findIndex((item: any) => item.stepId === stepId);
	const municipalityQuestionId = registerSteps
		.find((st: any) => st.id === stepId)
		?.questions.find((q: any) => q.type === 'Municipality')?.id;

	if (!municipalityQuestionId) {
		return questionnaireForm;
	}

	// Adiciona/atualiza NUTS-3
	questionnaireForm = updateQuestionInForm(questionnaireForm, stepId, questionId, [
		{ pt: nuts3, en: nuts3 }
	]);

	// Remove o município já selecionado se trocar NUTS-3
	questionnaireForm = _removeQuestionById(stepId, municipalityQuestionId, questionnaireForm);
	return questionnaireForm;
};

/* ==============================================================
   Selecionar Município (radio)
   ============================================================== */
export const _handleMunicipalitySelection = (
	stepId: number,
	questionId: number,
	municipality: string,
	questionnaireForm: any[]
) => {
	return updateQuestionInForm(questionnaireForm, stepId, questionId, [
		{ pt: municipality, en: municipality }
	]);
};

/* ==============================================================
   Textarea
   ============================================================== */
export const _handleTextAreaChange = (
	stepId: number,
	questionId: number,
	value: string,
	questionnaireForm: any[]
) => {
	const trimmed = value.trim();
	const responses = trimmed ? [{ pt: trimmed, en: trimmed }] : [];
	return updateQuestionInForm(questionnaireForm, stepId, questionId, responses);
};

/* ==============================================================
   Validações
   ============================================================== */
export const _validateForm = (
	stepId: number | null,
	registerSteps: any[],
	questionnaireForm: any[]
): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];
	const stepsToValidate = stepId
		? registerSteps.filter((st: any) => st.id === stepId)
		: registerSteps.filter((st: any) => !st.questions.some((q: any) => q.type === 'user')); // Senão, filtramos todos os steps que não tenham "type: user"

	for (const step of stepsToValidate) {
		const stepForm = questionnaireForm.find((item: any) => item.stepId === step.id);
		if (!stepForm) {
			errors.push(translations.steps.noResponses.replace('{step}', step.title[currentLanguage]));
			continue;
		}

		for (const question of step.questions) {
			const formQuestion = stepForm.questions.find((q: any) => q.questionId === question.id);

			// multiple
			if (question.type === 'multiple') {
				if (!formQuestion || !formQuestion.responses.length) {
					errors.push(
						translations.steps.questionAtLeast.replace(
							'{question}',
							question.question[currentLanguage]
						)
					);
					continue;
				}
				const hasOther = question.responses.some((r: any) => r.custom_flag === 'requires_comment');
				const otherSelected = formQuestion.responses.some(
					(rid: number) =>
						typeof rid === 'number' &&
						question.responses.find((rr: any) => rr.id === rid)?.custom_flag === 'requires_comment'
				);
				if (hasOther && otherSelected && !formQuestion.other?.trim()) {
					errors.push(
						translations.steps.otherField.replace('{question}', question.question[currentLanguage])
					);
				}
			}

			// single
			if (question.type === 'single') {
				if (!formQuestion || formQuestion.responses.length !== 1) {
					errors.push(
						translations.steps.singleResponse.replace(
							'{question}',
							question.question[currentLanguage]
						)
					);
				}
			}

			// país (custom_portugal)
			if (question.custom_flag === 'custom_portugal') {
				const country = formQuestion?.responses[0] as { pt: string; en: string };
				if (!country) {
					errors.push(
						translations.steps.countryMandatory.replace(
							'{question}',
							question.question[currentLanguage]
						)
					);
					continue;
				}
				if (country.en.toLowerCase() === 'portugal') {
					// NUTS-3
					const nuts3Question = step.questions.find((q: any) => q.type === 'NUTS-3');
					const nuts3Form = stepForm.questions.find((q: any) => q.questionId === nuts3Question?.id);
					if (!nuts3Form || !nuts3Form.responses.length) {
						errors.push(translations.steps.nuts3Invalid);
						continue;
					}
					const nuts3Selected = nuts3Form.responses[0]?.pt;
					// Município
					const municipalityQuestion = step.questions.find((q: any) => q.type === 'Municipality');
					const municipalityForm = stepForm.questions.find(
						(q: any) => q.questionId === municipalityQuestion?.id
					);
					if (
						!municipalityForm ||
						!municipalityForm.responses.length ||
						!ptMunicipalities[nuts3Selected]?.includes(municipalityForm.responses[0]?.pt)
					) {
						errors.push(translations.steps.municipalityInvalid);
					}
				}
			}

			// textarea
			if (question.type === 'textarea') {
				const t = formQuestion?.responses[0];
				if (!t || !t.pt?.trim()) {
					errors.push(
						translations.steps.textAreaEmpty.replace(
							'{question}',
							question.question[currentLanguage]
						)
					);
				} else if (t.pt.length > 200) {
					errors.push(
						translations.steps.textAreaCharacters.replace(
							'{question}',
							question.question[currentLanguage]
						)
					);
				}
			}
		}
	}

	return { isValid: errors.length === 0, errors };
};

export const _validateEmail = (email: string) => {
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
};

export const _validatePassword = (password: string) => {
	const result = {
		isValid: true,
		errors: {
			_length: false,
			uppercase: false,
			lowercase: false,
			number: false,
			specialCharacter: false
		}
	};
	if (password.length < 8) {
		result.isValid = false;
		result.errors._length = true;
	}
	if (!/[A-Z]/.test(password)) {
		result.isValid = false;
		result.errors.uppercase = true;
	}
	if (!/[a-z]/.test(password)) {
		result.isValid = false;
		result.errors.lowercase = true;
	}
	if (!/\d/.test(password)) {
		result.isValid = false;
		result.errors.number = true;
	}
	if (!/[^a-zA-Z\d]/.test(password)) {
		result.isValid = false;
		result.errors.specialCharacter = true;
	}
	return result;
};

export const _submitquestionnaireForm = async (
	questionnaireForm: any,
	userForm: any,
	registerSteps: any
) => {
	const data = { questionnaireForm, userForm, registerSteps };
	const response = await fetch('/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	return response;
};
