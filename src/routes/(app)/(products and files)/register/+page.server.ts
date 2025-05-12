import { getStepsWithQuestionsAndResponses } from '$lib/configs/register-steps/index.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Tentar obter os steps normalmente
		const registerSteps = await getStepsWithQuestionsAndResponses();
		return { registerSteps };
	} catch (error) {
		// Caso haja um erro, logá-lo e retornar valor padrão
		return { registerSteps: [] }; // Retorna array vazio para evitar undefined no frontend
	}
};
