import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import { getUsersRoles, verifySession } from '$lib/configs/users/index.server';
import { _verifyName } from '../../../(app)/(products and files)/products/+page';
import { fetchVersionComponents } from '$lib/configs/versions/index.server';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

export const POST: RequestHandler = async ({ request, fetch }) => {
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
		!usersRoles.some((r) => r.id === authUser.role && (r.role === 'ADMIN' || r.role === 'GESTOR'))
	) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const body = await request.json();

	const { folderName } = body as { folderName: string };

	const { versions, versionValues } = await fetchVersionComponents(fetch);

	const match = folderName.match(/v\d+/);
	const version = match ? match[0] : null;

	const errors = await _verifyName(
		folderName.split(
			//versions[version] !== undefined
			versions[version].folderStructure.separator
			//: publicEnv.PUBLIC_FOLDER_SEPARATOR
		),
		'folderStructure',
		versionValues,
		versions
	);

	if (errors.length > 0) {
		return json({
			error: translations.folders.invalidName
		});
	}

	const folderPath = `${privateEnv.SECRET_FOLDER_PATH}/${folderName}`;

	if (fs.existsSync(folderPath)) {
		return json({
			error: translations.folders.exists
		});
	} else {
		fs.mkdirSync(folderPath);
		return json({
			success: translations.folders.successCreate
		});
	}
};
