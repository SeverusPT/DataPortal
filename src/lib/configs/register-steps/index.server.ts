import db from '$lib/db/db.server';
import { t } from '$lib/lang';

// Função genérica para manipular erros e retornos
const handleError = (error, message) => {
	throw new Error(message);
};

let translations;
t.subscribe((value) => {
	translations = value;
});

// Função para obter todos os steps com suas perguntas e respostas
export const getStepsWithQuestionsAndResponses = async (): Promise<any[]> => {
	try {
		// Obter todos os steps ordenados
		const steps = db.prepare('SELECT * FROM steps ORDER BY "order"').all();

		// Mapear cada step para incluir as suas perguntas
		const stepsWithDetails = steps.map((step) => {
			// Obter perguntas associadas ao step
			const questions = db
				.prepare('SELECT * FROM questions WHERE step_id = ? ORDER BY "order"')
				.all(step.id);

			// Mapear cada pergunta para incluir as suas respostas
			const questionsWithResponses = questions.map((question) => {
				const responses = db
					.prepare('SELECT * FROM responses WHERE question_id = ?')
					.all(question.id);

				return {
					id: question.id,
					type: question.type,
					custom_flag: question.custom_flag,
					question: {
						pt: question.question_pt,
						en: question.question_en
					},
					responses: responses.map((response) => ({
						id: response.id,
						response: {
							pt: response.response_pt,
							en: response.response_en
						},
						custom_flag: response.custom_flag
					}))
				};
			});

			return {
				id: step.id,
				order: step.order,
				title: {
					pt: step.title_pt,
					en: step.title_en
				},
				questions: questionsWithResponses
			};
		});

		return stepsWithDetails;
	} catch (error) {
		handleError(error, translations.errors.fetchSteps);
	}
};
