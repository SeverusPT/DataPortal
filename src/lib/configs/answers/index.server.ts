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

// Função para salvar respostas do questionário no banco de dados
export const saveAnswersToDb = async (questionnaire: any[], token: string, uuid: string) => {
	const insertQuery = `
    INSERT INTO questionnaire_responses 
    (uuid, token, response_id, custom_response)
    VALUES (?, ?, ?, ?);
  `;

	try {
		// Transação para garantir atomicidade
		const insertTransaction = db.transaction(() => {
			// Percorre cada step do questionário
			for (const stepItem of questionnaire) {
				// Percorre cada pergunta do step
				for (const question of stepItem.questions) {
					const questionId = question.questionId;
					const { responses, other } = question;

					if (!responses || !responses.length) {
						// Se não houver respostas, pular para a próxima pergunta
						continue;
					}

					// 1) Buscamos na tabela 'responses' qual é o ID que tem custom_flag='requires_comment'
					//    para esta questionId (caso exista)
					const rowOther = db
						.prepare(
							"SELECT id FROM responses WHERE question_id = ? AND custom_flag = 'requires_comment'"
						)
						.get(questionId);

					// Ex.: rowOther?.id == 4 => '4' é a ID "Other" para esta pergunta
					const otherId = rowOther ? rowOther.id : null;

					// 2) Para cada resposta
					for (const resp of responses) {
						let responseId: number | null = null;
						let customResponse: string | null = null;

						if (typeof resp === 'number') {
							// A resposta é um ID numérico
							responseId = resp;

							// Se este ID for igual ao otherId e 'other' não for nulo, salvamos em custom_response
							if (otherId && resp === otherId && other) {
								customResponse = other;
							}
						} else if (typeof resp === 'object') {
							// A resposta é um objeto: { pt: "...", en: "..." }
							// -> definimos responseId = null
							// -> salvamos customResponse = JSON.stringify(resp)

							const userInput = db
								.prepare('SELECT id FROM responses WHERE question_id = ? AND custom_flag = ?')
								.get(questionId, 'user_input');

							responseId = userInput ? userInput.id : null;
							customResponse = JSON.stringify(resp);
						}

						// 3) Inserir na bd
						db.prepare(insertQuery).run(
							uuid, // id do questionário
							token, // token do utilizador
							responseId, // se for number, ou null
							customResponse // se for object ou 'other
						);
					}
				}
			}
		});

		// Executar a transação
		insertTransaction();
	} catch (error) {
		handleError(error, translations.errors.saveAnswers);
	}
};

// Função para deletar respostas do questionário por token
export const deleteAnswersByToken = async (token: string): Promise<boolean> => {
	try {
		const result = db.prepare('DELETE FROM questionnaire_responses WHERE token = ?').run(token);
		if (result.changes === 0) {
		}
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.deleteAnswers);
	}
};

// Função para obter respostas do questionário por token
export const getAnswersByToken = async (token: string): Promise<any | null> => {
	try {
		const data = db.prepare('SELECT * FROM questionnaire_responses WHERE token = ?').get(token);
		if (!data) {
			return null;
		}
		return data;
	} catch (error) {
		handleError(error, translations.errors.fetchAnswers);
	}
};

// Função para atualizar o token das respostas do questionário
export const updateAnswersToken = async (token: string, newToken: string): Promise<boolean> => {
	try {
		const result = db
			.prepare('UPDATE questionnaire_responses SET token = ? WHERE token = ?')
			.run(newToken, token);
		if (result.changes === 0) {
		}
		return result.changes > 0;
	} catch (error) {
		handleError(error, translations.errors.updateAnswersToken);
	}
};
