import { redirect, type Actions, type Cookies } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import {
	getUserByEmail,
	getUsersRoles,
	updateUserLastLogin
} from '$lib/configs/users/index.server';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (user.email !== '') {
		throw redirect(303, '/products');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		const user = await getUserByEmail(email);
		const usersRoles = await getUsersRoles();
		const noAccessRole = usersRoles.find((roleObj) => roleObj.role === 'NOACCESS');

		if (user === null) {
			return {
				success: false,
				message: translations.session.incorrectAccess
			};
		}

		if (user.role_id !== noAccessRole.id) {
			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				return {
					success: false,
					message: translations.session.incorrectAccess
				};
			}

			const jwtUser = {
				email: user.email,
				role: user.role_id
			};

			// Update user last login
			await updateUserLastLogin(user.email);

			const token = jwt.sign(jwtUser, env.SECRET_JWT_TOKEN, {
				expiresIn: '1d'
			});

			cookies.set('AuthorizationToken', `Bearer ${token}`, {
				httpOnly: true,
				path: '/',
				secure: env.SECRET_ENVIRONMENT === 'PROD',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 // 1 day
			});

			throw redirect(303, '/products');
		} else {
			return {
				success: false,
				message: translations.session.noAccess
			};
		}
	}
};
