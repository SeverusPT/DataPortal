import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import jwt from 'jsonwebtoken';
import {
	deleteUser,
	getUserByToken,
	getUsersRoles,
	updateUserRole,
	updateUserToken
} from '$lib/configs/users/index.server';
import { getAnswersByToken, updateAnswersToken } from '$lib/configs/answers/index.server';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

// Função genérica para manipular erros e retornos
const handleResponseError = (err, defaultMessage) => {
	if (err.status !== 302) {
		return {
			success: false,
			message: err.body?.message || err.message || defaultMessage
		};
	} else {
		throw err; // Re-lança erros de redirecionamento
	}
};

export const POST: RequestHandler = async ({ params }) => {
	const token = params.token;

	try {
		// Obter o utilizador pelo token
		const userByToken = await getUserByToken(token);
		if (!userByToken) {
			return json(handleResponseError(error(404), translations.register.tokenError));
		}

		// Verificar o token
		const { success: isTokenValid, message: tokenValidationMessage } = await _verifyToken(
			token,
			userByToken.email
		);
		if (!isTokenValid) {
			return json(handleResponseError(error(400), tokenValidationMessage));
		}

		// Validar as respostas associadas ao token
		const validation = await validateAnswers(token);
		if (!validation.success) {
			return json(handleResponseError(error(400), validation.message));
		}

		// Atualizar o papel do utilizador para "CONSULT"
		const usersRoles = await getUsersRoles();
		const consultRole = usersRoles.find((consultObj) => consultObj.role === 'CONSULT');
		await updateUserRole(userByToken.email, consultRole.id);

		// Limpar o token do utilizador
		await updateUserToken(userByToken.email, '');

		return json({
			success: true,
			message: translations.register.accountRegistered
		});
	} catch (err) {
		return json(handleResponseError(err, translations.register.genericError));
	}
};

// Função para verificar um token
export const _verifyToken = async (
	token: string,
	email?: string
): Promise<{ success: boolean; message: string }> => {
	try {
		jwt.verify(token, env.SECRET_JWT_TOKEN);
		return { success: true, message: translations.register.tokenVerified };
	} catch (err: any) {
		if (err.name === 'TokenExpiredError' && email) {
			await deleteUser(email); // Apagar o utilizador se o token expirou
			return { success: false, message: translations.register.tokenExpired };
		}

		return {
			success: false,
			message: translations.register.tokenVerificationError
		};
	}
};

// Função para validar respostas do questionário associadas ao token
const validateAnswers = async (token: string): Promise<{ success: boolean; message: string }> => {
	try {
		const answers = await getAnswersByToken(token);
		if (!answers) {
			return {
				success: false,
				message: translations.register.tokenAnswersError
			};
		}

		await updateAnswersToken(token, ''); // Limpar o token após validação
		return { success: true, message: translations.register.answersValidated };
	} catch (error) {
		return {
			success: false,
			message: translations.register.answerValidationError || error.message
		};
	}
};
