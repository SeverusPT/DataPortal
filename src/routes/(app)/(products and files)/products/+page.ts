import { env } from '$env/dynamic/public';
import {
	type ComponentType,
	type Folder,
	Extensions,
	type FileInterface,
	type Components,
	getComponents
} from '$lib/configs';
import { t } from '$lib/lang';
import type { PageLoad } from './$types';
import type fs from 'fs';

export const load: PageLoad = async ({ fetch, depends, parent }) => {
	let folders: Folder[] = await _fetchFolders(fetch);

	const versionValues = (await parent()).versionValues;

	const components: Components = await getComponents(versionValues);

	depends('data:folders');

	return {
		folders: folders,
		components: components
	};
};

let translations;
t.subscribe((value) => {
	translations = value;
});

export function _getLatestVersion(versions) {
	//Obter todas as chaves das versões
	const keys = Object.keys(versions);

	if (keys.length === 0) {
		throw new Error(translations.errors.noVersions);
	}

	//Ordenar as chaves das versões por ordem decrescente
	const sortedVersions = keys.sort((a, b) => {
		//remover o prefixo "v" e converter para número
		const numA = parseInt(a.substring(1), 10);
		const numB = parseInt(b.substring(1), 10);
		return numB - numA; //Ordenar do maior para o menor
	});

	//Retornar a última versão
	return sortedVersions[0];
}

export async function _orderComponents(
	structureType: 'fileStructure' | 'folderStructure',
	versions
): Promise<ComponentType[]> {
	const latestVersion = _getLatestVersion(versions);

	let tmp = versions[latestVersion];
	return tmp ? tmp[structureType].components : [];
}

export async function _generateName(
	orderedComponents: ComponentType[],
	selectedComponents: { [key: string]: string },
	structureType: 'fileStructure' | 'folderStructure',
	versionValues,
	versions
): Promise<string> {
	let separator;

	const components = await getComponents(versionValues);
	const version = selectedComponents.VersionNumber;

	if (structureType === 'fileStructure') {
		separator = versions[version].fileStructure.separator;
	} else if (structureType === 'folderStructure') {
		separator = versions[version].folderStructure.separator;
	} else {
		return '';
	}

	return (
		Object.keys(Object(components.ProjectAcronym.values)) +
		orderedComponents.map((component) => selectedComponents[component]).join(separator)
	);
}

export async function _verifyName(
	name: string[],
	structureType: 'fileStructure' | 'folderStructure',
	versionValues,
	versions,
	folderName?: string
): Promise<{ component: ComponentType; message: string }[]> {
	const components = await getComponents(versionValues);
	const version = name[name.length - 1];
	const tmp = versions[version];

	if (!tmp) {
		return [{ component: 'VersionNumber', message: translations.errors.version }];
	}

	const orderedComponents = tmp[structureType].components;
	const errors = [];

	if (orderedComponents.length !== name.length) {
		return [
			{
				component: 'VersionNumber',
				message: translations.errors.components
			}
		];
	}

	if (structureType === 'fileStructure' && folderName) {
		const match = folderName.match(/v\d+/);
		const version = match ? match[0] : null;
		const folderNameSplit = folderName.split(
			//versions[version] !== undefined
			versions[version].folderStructure.separator
			//: env.PUBLIC_FOLDER_SEPARATOR
		);
		const folderNameError = await _verifyName(
			folderNameSplit,
			'folderStructure',
			versionValues,
			versions
		);

		if (folderNameError.length > 0) {
			return [
				{
					component: 'VersionNumber',
					message: translations.errors.fixFolderName
				}
			];
		}

		const folderComponents = tmp['folderStructure'].components;
		const commonComponents = orderedComponents.filter((component) =>
			folderComponents.includes(component)
		);

		for (let i = 0; i < commonComponents.length; i++) {
			const component = commonComponents[i];
			const folderValue = folderNameSplit[folderComponents.indexOf(component)];
			const fileValue = name[orderedComponents.indexOf(component)];

			if (folderValue !== fileValue) {
				errors.push({
					component,
					message: fileValue + ': ' + translations.errors.diffValues
				});
			}
		}

		for (let i = 0; i < orderedComponents.length; i++) {
			const component = orderedComponents[i];

			if (!commonComponents.includes(component)) {
				if (
					component !== 'ReferenceYear' &&
					component !== 'RefPeriods' &&
					component !== 'CalculationDate'
				) {
					if (components[component].values && !components[component].values[name[i]]) {
						errors.push({
							component,
							message: name[i] + ': ' + translations.errors.invalidValue
						});
					}
				} else if (component === 'ReferenceYear') {
					if (
						components['BurntAreaDataset'].values &&
						!components['BurntAreaDataset'].values[name[i][0]]
					) {
						const validationFailed =
							components[component].validation &&
							components[component].validation(name[i].slice(1)) === false;
						const errorMessage = validationFailed
							? name[i] + ':' + translations.errors.invalidValue
							: name[i][0] + ':' + translations.errors.invalidValue;
						errors.push({ component, message: errorMessage });
					} else if (
						components[component].validation &&
						components[component].validation(name[i].slice(1)) === false
					) {
						errors.push({
							component,
							message: name[i].slice(1) + ': ' + translations.errors.invalidValue
						});
					} else if (
						components['BurntAreaDataset'].values &&
						components['BurntAreaDataset'].values[name[i][0]] &&
						folderNameSplit[folderComponents.indexOf('BurntAreaDataset')] !== name[i][0]
					) {
						errors.push({
							component,
							message: name[i][0] + ': ' + translations.errors.diffValues
						});
					}
				} else if (component === 'RefPeriods') {
					if (
						components[component].validation &&
						components[component].validation(name[i]) === false
					) {
						errors.push({
							component,
							message: name[i] + ': ' + translations.errors.invalidValue
						});
					}
				} else if (component === 'CalculationDate') {
					if (
						components[component].validation &&
						components[component].validation(name[i]) === false
					) {
						errors.push({
							component,
							message: name[i] + ': ' + translations.errors.invalidValue
						});
					}
				}
			}
		}
	} else {
		for (let i = 0; i < orderedComponents.length; i++) {
			if (
				orderedComponents[i] !== 'ReferenceYear' &&
				orderedComponents[i] !== 'RefPeriods' &&
				orderedComponents[i] !== 'CalculationDate'
			) {
				if (
					components[orderedComponents[i]].values &&
					!components[orderedComponents[i]].values[name[i]]
				) {
					errors.push({
						component: orderedComponents[i],
						message: name[i] + ': ' + translations.errors.invalidValue
					});
				}
			} else if (orderedComponents[i] === 'ReferenceYear') {
				if (
					components['BurntAreaDataset'].values &&
					!components['BurntAreaDataset'].values[name[i][0]]
				) {
					const validationFailed =
						components[orderedComponents[i]].validation &&
						components[orderedComponents[i]].validation(name[i].slice(1)) === false;
					const errorMessage = validationFailed
						? name[i] + ': ' + translations.errors.invalidValue
						: name[i][0] + ': ' + translations.errors.invalidValue;
					errors.push({
						component: orderedComponents[i],
						message: errorMessage
					});
				} else if (
					components[orderedComponents[i]].validation &&
					components[orderedComponents[i]].validation(name[i].slice(1)) === false
				) {
					errors.push({
						component: orderedComponents[i],
						message: name[i].slice(1) + ': ' + translations.errors.invalidValue
					});
				}
			} else if (orderedComponents[i] === 'RefPeriods') {
				if (
					components[orderedComponents[i]].validation &&
					components[orderedComponents[i]].validation(name[i]) === false
				) {
					errors.push({
						component: orderedComponents[i],
						message: name[i] + ': ' + translations.errors.invalidValue
					});
				}
			} else if (orderedComponents[i] === 'CalculationDate') {
				if (
					components[orderedComponents[i]].validation &&
					components[orderedComponents[i]].validation(name[i]) === false
				) {
					errors.push({
						component: orderedComponents[i],
						message: name[i] + ': ' + translations.errors.invalidValue
					});
				}
			}
		}
	}

	return errors;
}

export async function _generateZip(
	names: string[],
	folder: string | undefined,
	method: string | undefined,
	signal: AbortSignal
) {
	const endpoint = folder === undefined ? '/api/folders/download' : '/api/files/download';
	const url =
		method === 'history' ? `${endpoint}?${new URLSearchParams({ method }).toString()}` : endpoint;

	// Inicia a solicitação para o servidor gerar o ZIP
	const res = await fetch(url, {
		method: 'POST',
		body: JSON.stringify({ names, folder }),
		signal
	});

	if (!res.ok) {
		const resJson = await res.json();
		throw new Error(resJson.message);
	}

	const reader = res.body?.getReader();
	if (!reader) {
		throw new Error(translations.errors.errorFetchingResponse);
	}

	const chunks: Uint8Array[] = [];

	// Lê os dados em chunks
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		if (value) {
			chunks.push(value);
		}
	}
	// Concatena todos os chunks em um único blob
	const blob = new Blob(chunks, { type: 'application/zip' });

	// Inicia o download do ZIP
	const downloadUrl = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = downloadUrl;
	a.download = 'SPT_Download.zip'; // Nome do arquivo ZIP
	a.click();

	// Libera o URL temporário
	URL.revokeObjectURL(downloadUrl);
}

export async function _fetchFolders(fetch, method?: string) {
	const buildUrl = (method: any) => {
		const params = method ? `?${new URLSearchParams({ method }).toString()}` : '';
		return `/api/folders/fetch${params}`;
	};

	const handleResponse = async (response) => {
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}
		return response.json();
	};

	try {
		const url = buildUrl(method);
		const response = await fetch(url, { cache: 'no-store' });
		return await handleResponse(response);
	} catch (error) {
		throw error; // Rethrow the error for the caller to handle
	}
}

export async function _createFolder(fetch, folderName: string) {
	let res = await fetch(`/api/folders/create`, {
		method: 'POST',
		body: JSON.stringify({ folderName: folderName })
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message);
	} else {
		const data = await res.json();
		return data;
	}
}

export async function _createVersion(
	fetch,
	versionName: string,
	changes_english: string,
	changes_portuguese: string
) {
	let res = await fetch(`/api/versions/create`, {
		method: 'POST',
		body: JSON.stringify({
			version: versionName,
			changes_english: changes_english,
			changes_portuguese: changes_portuguese
		})
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message);
	} else {
		const data = await res.json();
		return data;
	}
}

export async function _verifyExtensions(
	files: File[] | fs.Dirent[],
	versions: any,
	versionValues: any,
	folderName?: string
) {
	const filesInfo: {
		files: File[] | fs.Dirent[];
		name: string;
		foundExtensions: string[];
		nameErrors: FileInterface['error'];
		missingExtensions: string[];
	}[] = [];

	for (const file of files) {
		const fileNameWithoutExtension = file.name.split('.')[0];
		const extension = file.name.substring(file.name.lastIndexOf('.') + 1);

		if (Extensions.includes(`.${extension}`)) {
			const fileInfo = filesInfo.find((info) => info.name === fileNameWithoutExtension);
			if (fileInfo) {
				fileInfo.foundExtensions.push(`.${extension}`);
				if (file instanceof File) {
					fileInfo.files.push(file as File & fs.Dirent);
				}
			} else {
				const match = fileNameWithoutExtension.match(/v\d+/);
				const version = match ? match[0] : null;
				filesInfo.push({
					files: [file as File],
					name: fileNameWithoutExtension,
					nameErrors: await _verifyName(
						fileNameWithoutExtension.split(
							versions[version] !== undefined
								? versions[version].fileStructure.separator
								: env.PUBLIC_FILE_SEPARATOR
						),
						'fileStructure',
						versionValues,
						versions,
						folderName
					),
					foundExtensions: [`.${extension}`],
					missingExtensions: []
				});
			}
		}
	}

	for (const fileInfo of filesInfo) {
		const missingExtensions = Extensions.filter((ext) => !fileInfo.foundExtensions.includes(ext));
		fileInfo.missingExtensions = missingExtensions;
	}

	return filesInfo;
}

export async function _findFolderName(fileName: string, versions): Promise<string | null> {
	const match = fileName.match(/v\d+/);
	const version = match ? match[0] : null;

	if (!version || !versions[version]) {
		return null; // Versão inválida ou não encontrada
	}

	const fileNameSplit = fileName.split(versions[version].fileStructure.separator);

	const folderStructure = versions[version].folderStructure;
	const fileStructure = versions[version].fileStructure;
	const folderComponents: string[] = [];
	const fileComponents = fileStructure.components;

	folderStructure.components.forEach((component) => {
		const fileComponentIndex = fileComponents.indexOf(component);

		if (fileComponentIndex !== -1) {
			folderComponents.push(fileNameSplit[fileComponentIndex]);
		} else {
			if (component === 'ApproachCode') {
				const severityIndicator = fileNameSplit[fileComponents.indexOf('SeverityIndicator')];
				const deltaIndicators = ['DELTA', 'RDT', 'RBR'];
				const approachCode = deltaIndicators.includes(severityIndicator) ? 'D' : 'T';

				folderComponents.push(approachCode);
			} else if (component === 'PlatformCode') {
				const satCode = fileNameSplit[fileComponents.indexOf('SatCode')];

				if (satCode === 'LTH') {
					folderComponents.push('LH');
				} else {
					folderComponents.push(satCode.slice(0, 2));
				}
			} else if (component === 'BurntAreaDataset') {
				folderComponents.push(fileNameSplit[fileComponents.indexOf('ReferenceYear')].charAt(0));
			}
		}
	});

	return folderComponents.join(folderStructure.separator);
}

export function _processFilesToUpload(filesToUpload, result) {
	if (filesToUpload.length === 0) {
		filesToUpload = [...filesToUpload, ...result];
	} else {
		result.forEach((newFile) => {
			const existingFile = filesToUpload.find((file) => {
				return file.name === newFile.name;
			});

			if (existingFile) {
				const missingExtensions = existingFile.missingExtensions.filter((extension) => {
					return !newFile.foundExtensions.includes(extension);
				});

				const newExtensions = newFile.foundExtensions.filter((extension) => {
					return !existingFile.foundExtensions.includes(extension);
				});

				//get newFile.files that match new extensions
				const newFiles = newFile.files.filter((file) => {
					return newExtensions.includes(`.${file.name.split('.').pop()}`);
				});

				existingFile.foundExtensions = [...existingFile.foundExtensions, ...newExtensions];
				existingFile.missingExtensions =
					Object.keys(missingExtensions).length > 0 ? [...missingExtensions] : [];
				existingFile.files = [...existingFile.files, ...newFiles];
			} else {
				filesToUpload = [...filesToUpload, newFile];
			}
		});
	}

	return filesToUpload;
}
