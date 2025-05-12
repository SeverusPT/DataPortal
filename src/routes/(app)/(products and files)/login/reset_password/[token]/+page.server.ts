import type { PageServerLoad } from '../$types';
import { error } from '@sveltejs/kit';
import { _verifyToken } from '../../../register/[token]/+server';
import { _validatePassword } from '../../../register/+page';
import bcrypt from 'bcrypt';
import {
	getUserByResetToken,
	getUsersRoles,
	updateUserPassword,
	updateUserResetToken
} from '$lib/configs/users/index.server';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

export const load: PageServerLoad = async ({ params, request }) => {
	if (request.method === 'GET') {
		try {
			const token = params['token'];
			const userByToken = await getUserByResetToken(token);

			if (userByToken === null) {
				throw error(404, translations.register.tokenError);
			} else {
				const { success, message } = await _verifyToken(token);
				if (!success) {
					throw error(401, message);
				}
			}
		} catch (err) {
			return {
				resetPwErr: { success: false, message: err.body.message }
			};
		}
	}
};

export const actions = {
	default: async ({ request, params }) => {
		const token = params.token;
		const data = await request.formData();
		const password = data.get('password') as string;
		const repeatPassword = data.get('repeatPassword') as string;

		if (!password || !repeatPassword) {
			return {
				success: false,
				message: translations.forms.fillAllFields
			};
		}

		try {
			const userByToken = await getUserByResetToken(token);

			if (userByToken === null) {
				throw error(404, translations.register.tokenError);
			} else {
				const { success, message } = await _verifyToken(token);
				if (!success) {
					throw error(401, message);
				}
			}

			if (_validatePassword(password).isValid === false) {
				throw error(400, translations.password.rulesFailed);
			}

			if (password !== repeatPassword) {
				throw error(400, translations.password.match);
			}

			const usersRoles = await getUsersRoles();
			const noAccessRole = usersRoles.find((roleObj) => roleObj.role === 'NOACCESS');

			if (userByToken.role_id !== noAccessRole.id) {
				const passwordMatch = await bcrypt.compare(password, userByToken.password);

				if (passwordMatch) {
					throw error(400, translations.password.samePassword);
				}

				const hashedPassword = await bcrypt.hash(password, 10);

				await updateUserPassword(userByToken.email, hashedPassword);
				await updateUserResetToken(userByToken.email, '');

				return {
					success: true,
					message: translations.password.changed
				};
			} else {
				throw error(403, translations.session.noAccess);
			}
		} catch (err) {
			if (err.status !== 302) {
				if (err.body.message) {
					return {
						success: false,
						message: err.body.message
					};
				} else {
					return {
						success: false,
						message: err.message
					};
				}
			} else {
				throw err;
			}
		}
	}
};
