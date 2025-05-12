import { env as privateEnv } from '$env/dynamic/private';
import { type FileInterface } from '$lib/configs';
import type { RequestHandler } from './$types';
import fs from 'fs';
import { error, json } from '@sveltejs/kit';
import { _verifyExtensions } from '../../../../(app)/(products and files)/products/+page';
import { getUsersRoles } from '$lib/configs/users/index.server';
import { fetchVersionComponents } from '$lib/configs/versions/index.server';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	const files: FileInterface[] = [];

	const { folderName } = params;

	const method = url.searchParams.get('method');
	const usersRoles = await getUsersRoles();

	const { user } = locals;
	const role = user?.role;

	if (
		method === 'history' &&
		usersRoles.some(
			(r) => r.id === role && r.role !== 'ADMIN' && r.role !== 'GESTOR' && r.role !== 'VERIFIED'
		)
	) {
		throw error(403, translations.errors.unauthorized);
	}
	//get files from folderName in params
	const folderPath = `${
		method === 'history' ? privateEnv.SECRET_HISTORY_PATH : privateEnv.SECRET_FOLDER_PATH
	}/${folderName}`;
	if (!fs.existsSync(folderPath)) {
		throw error(400, { message: translations.errors.folderNotExists });
	}

	const directory = fs.readdirSync(folderPath, {
		withFileTypes: true
	});

	const { versions, versionValues } = await fetchVersionComponents(fetch);

	const result = await _verifyExtensions(directory, versions, versionValues, folderName);

	// Verificar se o usuário é ADMIN ou GESTOR
	const isAdminOrGestor = usersRoles.some(
		(r) => r.id === role && (r.role === 'ADMIN' || r.role === 'GESTOR')
	);

	for (const res of result) {
		// Se não for ADMIN ou GESTOR e o arquivo tiver erros, ignore
		if (!isAdminOrGestor && (res.nameErrors.length > 0 || res.missingExtensions.length > 0)) {
			continue;
		}
		const match = res.name.match(/v\d+/);
		const version = match ? match[0] : null;
		const splitName = res.name.split(
			// versions[version] !== undefined
			versions[version].fileStructure.separator
			// : publicEnv.PUBLIC_FILE_SEPARATOR
		);

		const dateString = splitName[splitName.length - 2];
		const year = dateString.substring(0, 4);
		const month = dateString.substring(4, 6);
		const day = dateString.substring(6, 8);

		const formattedDate = `${day}/${month}/${year}`;

		const fileFound: FileInterface = {
			name: res.name,
			splitName: splitName,
			lastUpdated: formattedDate,
			error: res.nameErrors,
			missingExtensions: res.missingExtensions
		};

		const existFile = files.find((file) => file.name === fileFound.name);
		if (existFile) {
			continue;
		}
		files.push(fileFound);
	}

	return json(files);
};
