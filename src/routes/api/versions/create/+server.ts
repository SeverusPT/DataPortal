import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUsersRoles, verifySession } from '$lib/configs/users/index.server';
import { addVersion } from '$lib/configs/versions/index.server';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

export const POST: RequestHandler = async ({ request }) => {
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
	if (
		!authUser ||
		!usersRoles.some((r) => r.id === authUser.role && (r.role === 'GESTOR' || r.role === 'ADMIN'))
	) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const body = await request.json();

	const { version, changes_english, changes_portuguese } = body as {
		version: string;
		changes_english: string;
		changes_portuguese: string;
	};

	//verify if version is not empty
	if (!version) {
		throw error(400, { message: translations.errors.version });
	}

	//verify if version is "v" + number
	if (!version.match(/^v\d+$/)) {
		throw error(400, { message: translations.errors.version });
	}

	//verify if changes_english and changes_portuguese are not empty
	if (!changes_english || !changes_portuguese) {
		throw error(400, { message: translations.errors.emptyChanges });
	}

	try {
		// Adicionar versão à base de dados
		await addVersion(version, changes_english, changes_portuguese);

		return json({
			success: translations.version.addVersionSuccess
		});
	} catch (err: any) {
		// Verificar o tipo de erro para retornar mensagens específicas
		if (err.message === translations.errors.versionExists) {
			throw error(400, { message: translations.errors.versionExists });
		}

		throw error(500, { message: translations.errors.addVersion });
	}
};
