// Importing types using "import type"
import { error, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import jwt from 'jsonwebtoken';
import { getUserByEmail, getUsersRoles } from '$lib/configs/users/index.server';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

const getUserFromToken = async (token) => {
	try {
		const jwtUser = jwt.verify(token, env.SECRET_JWT_TOKEN);
		if (typeof jwtUser === 'string') {
			throw new Error(translations.errors.somethingWentWrong);
		}

		const user = await getUserByEmail(jwtUser.email);

		if (!user) {
			throw new Error(translations.errors.userDataNotFound);
		}

		return user;
	} catch (error) {
		return null;
	}
};

const handle: Handle = async ({ event, resolve }) => {
	const authCookie = event.cookies.get('AuthorizationToken');

	const rolesArray = await getUsersRoles();

	const guestRole = rolesArray.find((roleObj) => roleObj.role === 'GUEST');

	let sessionUser = {
		email: '',
		role: guestRole.id
	};

	if (authCookie) {
		const token = authCookie.split(' ')[1];
		const user = await getUserFromToken(token);

		if (user) {
			sessionUser = {
				email: user.email,
				role: user.role_id
			};
		} else {
			throw error(404, translations.errors.userDataNotFound);
		}
	}

	// If request route is logout, set authenticate = false
	if (event.url.pathname === '/logout') {
		sessionUser = {
			email: '',
			role: guestRole.id
		};
	}

	event.locals.user = sessionUser;

	// Remove unnecessary code block
	if (event.url.pathname === '/api/gestor/upload' && event.request.headers.get('x-api-token')) {
		//prevent from go out
	}

	return await resolve(event);
};

export { handle };
