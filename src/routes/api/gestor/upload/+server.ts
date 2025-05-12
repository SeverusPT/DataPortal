import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';
import {
	_findFolderName,
	_verifyExtensions
} from '../../../(app)/(products and files)/products/+page';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';

import { getAdminAndManagerUsers } from '$lib/configs/users/index.server';
import { fetchVersionComponents } from '$lib/configs/versions/index.server';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const apiKey = request.headers.get('x-api-key');

		const permission = await _ensurePermissions(apiKey);
		if (!permission.success) {
			throw error(401, permission.error);
		}

		const formData = await request.formData();
		const files = formData.getAll('file') as File[];

		const { versions, versionValues } = await fetchVersionComponents(fetch);

		const result = await _verifyExtensions(files, versions, versionValues);
		const filesToUpload = result.filter(
			(upload) => upload.files.length > 0 && upload.nameErrors.length === 0
			//&& upload.missingExtensions.length === 0
		);

		let uploadedFiles = [];
		const errors = result.filter(
			(upload) => upload.nameErrors.length > 0 || upload.missingExtensions.length > 0
		);
		let errorFiles = errors.map((error) => ({
			name: error.name,
			nameErrors: error.nameErrors,
			missingExtensions: error.missingExtensions
		}));

		for (const upload of filesToUpload) {
			try {
				const folderName = await _findFolderName(upload.name, versions);
				if (!folderName) {
					throw error(500, translations.errors.folderNotExists);
				}

				await _handleFileUploadServer(upload.files as File[], upload.name, folderName);
				uploadedFiles.push({
					name: upload.name,
					extensions: upload.foundExtensions
				});
			} catch (err) {
				errorFiles.push({
					name: upload.name,
					nameErrors: upload.nameErrors,
					missingExtensions: upload.missingExtensions
				});
			}
		}

		//escrever num ficheiro os error files
		await _saveErrorsFile(errorFiles);

		return json({
			success: true,
			uploadedFiles,
			errorFiles
		});
	} catch (err) {
		throw error(500, err.message || err);
	}
};

export const _ensurePermissions = async (api_key: string | null) => {
	if (!api_key) {
		return {
			success: false,
			error: '401: ' + translations.errors.unauthorized
		};
	}

	try {
		// Obter usuários com permissões de GESTOR ou ADMIN
		const users = await getAdminAndManagerUsers();

		// Comparar a chave API fornecida com a chave criptografada armazenada
		const foundUser = users.find((user) => bcrypt.compareSync(api_key, user.encrypted_key));

		if (foundUser) {
			return { success: true };
		} else {
			return {
				success: false,
				error: '401: ' + translations.errors.unauthorized
			};
		}
	} catch (error) {
		return {
			success: false,
			error: '500: ' + 'Internal Error'
		};
	}
};

// Mesma função auxiliar que você já tem (mantendo o nome):
async function findFolderStartingWith(
	baseFolderPath: string,
	folderWithoutVersion: string
): Promise<string | null> {
	try {
		const items = await fs.readdir(baseFolderPath, { withFileTypes: true });
		const directories = items.filter((item) => item.isDirectory());

		// Procura uma pasta que comece com o nome fornecido (sem versão)
		const foundDir = directories.find((dir) => dir.name.startsWith(folderWithoutVersion));
		return foundDir ? foundDir.name : null;
	} catch (error: any) {
		throw new Error(error.message);
	}
}

/**
 * Remove extensão, data (8 dígitos) e sufixo de versão (ex.: _v01) para obter o "base" do arquivo.
 * Ex.: "SPT_RDT_NBR_..._20230406_v01.tif" => "SPT_RDT_NBR_...".
 */
function getBaseName(fileName: string): string {
	// Remove extensão
	let noExt = fileName.split('.')[0];
	// Remove data (8 dígitos após underscore)
	noExt = noExt.replace(/_\d{8}/, '');
	// Remove _vXX do final
	noExt = noExt.replace(/_v\d+$/, '');
	return noExt;
}

export async function _handleFileUploadServer(
	files: File[],
	fileName: string,
	folderName: string
): Promise<void> {
	const folderPath = path.join(env.SECRET_FOLDER_PATH, folderName);
	const folderExists = await fs.stat(folderPath).catch(() => null);

	// Cria a pasta se não existir
	await fs.mkdir(folderPath, { recursive: true });

	// Extrai data do nome principal (p. ex. "SPT_..._20230406_v01")
	const fileDateMatch = fileName.match(/_(\d{8})/);
	const fileDate = fileDateMatch ? fileDateMatch[1] : null;
	if (!fileDate) {
		throw new Error(`Formato inválido do nome do ficheiro: ${fileName}`);
	}

	// Base sem data e versão
	const baseFileName = getBaseName(fileName);

	// 1) Se a pasta já existe, remove arquivos antigos (mesmo base, mesma versão, data diferente)
	if (folderExists) {
		const filesInFolder = await fs.readdir(folderPath);
		for (const existingFile of filesInFolder) {
			const existingBase = getBaseName(existingFile);
			const existingDateMatch = existingFile.match(/_(\d{8})/);
			const existingDate = existingDateMatch ? existingDateMatch[1] : null;

			if (existingBase === baseFileName && existingDate && existingDate !== fileDate) {
				await fs.unlink(path.join(folderPath, existingFile));
			}
		}
	}

	// 2) Descobrir se há outra pasta de versão anterior (ou diferente)
	const folderPrefix = folderName.replace(/-v\d+$/, '');
	const foundFolder = await findFolderStartingWith(env.SECRET_FOLDER_PATH, folderPrefix);

	// Se achou outra pasta com o mesmo prefixo, mas não é a atual -> mover arquivo(s) antigo(s) p/ histórico
	if (foundFolder && foundFolder !== folderName) {
		const oldFolderPath = path.join(env.SECRET_FOLDER_PATH, foundFolder);
		try {
			await fs.stat(oldFolderPath);

			const historyFolderPath = path.join(env.SECRET_HISTORY_PATH, foundFolder);
			await fs.mkdir(historyFolderPath, { recursive: true });

			const oldFiles = await fs.readdir(oldFolderPath);
			for (const oldFile of oldFiles) {
				const oldFileBase = getBaseName(oldFile);
				if (oldFileBase === baseFileName) {
					await fs.rename(path.join(oldFolderPath, oldFile), path.join(historyFolderPath, oldFile));
				}
			}

			// Agora verificamos se a pasta 'oldFolderPath' ficou vazia.
			const remaining = await fs.readdir(oldFolderPath);
			if (remaining.length === 0) {
				// Se estiver vazia, removemos a pasta
				await fs.rmdir(oldFolderPath);
			}
			
		} catch {
			// Pasta não existe, sem problema
		}
	}

	// 3) Salva TODOS os arquivos do array 'files'
	for (const singleFile of files) {
		const fileExtension = path.extname(singleFile.name); // p.ex. ".tif"
		let newFileExtension = '.tif';
		if (fileExtension !== '.tif') {
			newFileExtension = '.tif.meta' + fileExtension;
		}

		// Se "fileName" já tiver extensão, cuidado para não duplicar.
		// Mas se seu "fileName" normalmente não vem com extensão, então concatenar está OK.
		const finalFilePath = path.join(folderPath, fileName + newFileExtension);

		const fileBuffer = await singleFile.arrayBuffer();
		// Se o upload vier em base64, use 'base64'.
		// Se vier binário puro (depende da configuração do seu form), use undefined ou 'binary'.
		await fs.writeFile(finalFilePath, Buffer.from(fileBuffer), 'base64');
	}
}

export async function _saveErrorsFile(errorFiles: any[]) {
	let existingErrorFiles = [];

	try {
		if (await fs.stat(env.SECRET_ERRORS_PATH)) {
			const data = await fs.readFile(env.SECRET_ERRORS_PATH, 'utf8');
			existingErrorFiles = JSON.parse(data);
		}
	} catch {
		// If file does not exist, we start with an empty array
	}

	// Remove qualquer arquivo de erro com o mesmo nome do arquivo de upload
	existingErrorFiles = existingErrorFiles.filter(
		(errorFile) => !errorFiles.some((uploadError) => uploadError.name === errorFile.name)
	);

	// Adiciona os novos arquivos de erro à lista existente
	existingErrorFiles.push(...errorFiles);

	// Escreve a lista atualizada de arquivos de erro no arquivo JSON
	await fs.writeFile(env.SECRET_ERRORS_PATH, JSON.stringify(existingErrorFiles, null, 2), 'utf8');
}
