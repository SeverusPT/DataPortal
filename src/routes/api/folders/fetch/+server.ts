import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { _verifyExtensions, _verifyName } from '../../../(app)/(products and files)/products/+page';
import { getComponents, type Folder } from '$lib/configs';
import { env as privateEnv } from '$env/dynamic/private';
import fs from 'fs';
import { _orderComponents } from '../../../(app)/(products and files)/products/+page';
import { _ensurePermissions, _saveErrorsFile } from '../../gestor/upload/+server';
import { getUsersRoles } from '$lib/configs/users/index.server';
import { fetchVersionComponents } from '$lib/configs/versions/index.server';
import { currentLang, t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});
let currentLanguage;
currentLang.subscribe((value) => {
	currentLanguage = value;
});

export const GET: RequestHandler = async ({ locals, url, request, fetch }) => {
	const { user } = locals;

	const method = url.searchParams.get('method');

	const usersRoles = await getUsersRoles();

	const role = user?.role;

	if (
		method === 'history' &&
		usersRoles.some(
			(r) => r.id === role && r.role !== 'ADMIN' && r.role !== 'GESTOR' && r.role !== 'VERIFIED'
		)
	) {
		throw error(403, translations.errors.unauthorized);
	}

	const folders: Folder[] = [];

	const directories = fs.readdirSync(
		method === 'history' ? privateEnv.SECRET_HISTORY_PATH : privateEnv.SECRET_FOLDER_PATH,
		{
			withFileTypes: true
		}
	);

	const { versions, versionValues } = await fetchVersionComponents(fetch);

	const components = await getComponents(versionValues);

	for (const directory of directories) {
		if (directory.isDirectory()) {
			const folderPath = `${
				method === 'history' ? privateEnv.SECRET_HISTORY_PATH : privateEnv.SECRET_FOLDER_PATH
			}/${directory.name}`;
			const folderContent = fs.readdirSync(folderPath, {
				withFileTypes: true
			});

			let filesCount = 0;

			if (usersRoles.some((r) => r.id === role && (r.role === 'ADMIN' || r.role === 'GESTOR'))) {
				const foundNames = {};

				filesCount = folderContent.filter((file) => {
					if (file.isFile()) {
						const fileName = file.name.split('.')[0];

						if (!foundNames[fileName]) {
							foundNames[fileName] = true;
							return true;
						}
					}

					return false;
				}).length;
			} else {
				const result = await _verifyExtensions(
					folderContent,
					versions,
					versionValues,
					directory.name
				);
				filesCount = result.filter((res) => {
					return res.nameErrors.length === 0 && res.missingExtensions.length === 0;
				}).length;

				//for gestor with x-api-key
				const apiKey = request.headers.get('x-api-key');
				if (apiKey !== null) {
					const permission = await _ensurePermissions(apiKey);

					if (!permission.success) {
						throw error(401, { message: translations.errors.unauthorized });
					}

					const errors = result.filter(
						(error) => error.nameErrors.length > 0 || error.missingExtensions.length > 0
					);

					let errorFiles = [];

					for (const error of errors) {
						errorFiles.push({
							name: error.name,
							nameErrors: error.nameErrors,
							missingExtensions: error.missingExtensions
						});
					}

					_saveErrorsFile(errorFiles);
				}
			}

			const match = directory.name.match(/v\d+/);
			const version = match ? match[0] : null;
			const splitName = directory.name.split(
				//versions[version] !== undefined
				versions[version].folderStructure.separator
				//: publicEnv.PUBLIC_FOLDER_SEPARATOR
			);

			const errors = await _verifyName(splitName, 'folderStructure', versionValues, versions);
			let subtitle = '';
			let descriptions: string[] = [];

			if (errors.length === 0) {
				let orderedComponents = await _orderComponents(
					//splitName[splitName.length - 1],
					'folderStructure',
					versions
				);
				if (orderedComponents.length > 0) {
					orderedComponents.forEach((component, index) => {
						if (
							component !== 'VersionNumber' &&
							component !== 'ProjectAcronym' &&
							component !== 'SeverityIndicator'
						) {
							if (component === 'ApproachCode') {
								descriptions.push(
									components[component].values[splitName[index]][currentLanguage].split('-')[0]
								);
							} else {
								descriptions.push(components[component].values[splitName[index]][currentLanguage]);
							}
						}
					});
				}
			}

			if (descriptions.length > 0) {
				subtitle = descriptions.join(' / ');
			}

			const folder: Folder = {
				name: directory.name,
				splitName: splitName,
				error: errors,
				subtitle: subtitle,
				filesCount: filesCount
			};

			if (usersRoles.some((r) => r.id === role && (r.role === 'GUEST' || r.role === 'CONSULT'))) {
				if (folder.error.length > 0 || folder.filesCount === 0) {
					continue;
				}
			}

			folders.push(folder);
		}
	}

	return json(folders);
};
