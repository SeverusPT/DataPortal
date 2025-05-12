import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { t } from '$lib/lang';
import {
	deleteUser,
	getUserByEmail,
	getUsersRoles,
	updateUserRole,
	verifySession
} from '$lib/configs/users/index.server';
import { _validateEmail } from '../register/+page';

let translations;
t.subscribe((value) => {
	translations = value;
});

export const PUT: RequestHandler = async ({ request }) => {
	const cookies = request.headers.get('cookie');
	if (!cookies) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	//split cookie ; and get part where "AuthorizationToken=" and get after that
	const cookie = cookies.split(';').find((c) => c.trim().startsWith('AuthorizationToken='));

	if (!cookie) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const token = cookie.split('=')[1];

	//add AuthorizationToken= to the cookie
	const authCookie = `AuthorizationToken=${token}`;

	const authUser = await verifySession(authCookie);
	const usersRoles = await getUsersRoles();

	if (!authUser || !usersRoles.some((r) => r.id === authUser.role && r.role === 'ADMIN')) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const { role_id, email } = await request.json();

	if (authUser.email === email) {
		throw error(400, { message: translations.errors.invalidFields });
	}

	if (!usersRoles.some((r) => r.id === role_id)) {
		throw error(400, { message: translations.errors.invalidFields });
	}

	if (!email) {
		throw error(400, { message: translations.errors.invalidFields });
	}

	const emailValidation = _validateEmail(email);
	if (!emailValidation) {
		throw error(400, translations.errors.changeOwnRole);
	}

	const existingUser = await getUserByEmail(email);
	if (!existingUser) {
		throw error(400, translations.errors.invalidFields);
	}

	const updated = await updateUserRole(email, role_id);
	if (!updated) {
		throw error(400, translations.user.updatedError);
	}

	return json({ success: true, message: translations.user.updatedSuccess });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const cookies = request.headers.get('cookie');
	if (!cookies) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	//split cookie ; and get part where "AuthorizationToken=" and get after that
	const cookie = cookies.split(';').find((c) => c.trim().startsWith('AuthorizationToken='));

	if (!cookie) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const token = cookie.split('=')[1];

	//add AuthorizationToken= to the cookie
	const authCookie = `AuthorizationToken=${token}`;

	const authUser = await verifySession(authCookie);
	const usersRoles = await getUsersRoles();

	if (!authUser || !usersRoles.some((r) => r.id === authUser.role && r.role === 'ADMIN')) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const { email } = await request.json();

	if (!email) {
		throw error(400, { message: translations.errors.invalidFields });
	}

	const emailValidation = _validateEmail(email);
	if (!emailValidation) {
		throw error(400, translations.errors.invalidFields);
	}

	const existingUser = await getUserByEmail(email);
	if (!existingUser) {
		throw error(400, translations.errors.invalidFields);
	}

	const deleted = await deleteUser(email);
	if (!deleted) {
		throw error(400, translations.user.deletedError);
	}

	return json({ success: true, message: translations.user.deletedSuccess });
};
