import { invalidate } from '$app/navigation';
import { env } from '$env/dynamic/private';
import { getUsersRoles, verifySession } from '$lib/configs/users/index.server';
import { t } from '$lib/lang/index.js';
import { error, json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
let translations;
t.subscribe((value) => {
	translations = value;
});

export async function POST({ request }) {
	const cookies = request.headers.get('cookie');
	if (!cookies) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	// Obtém o token do cookie
	const token = cookies
		.split(';')
		.find((c) => c.trim().startsWith('AuthorizationToken='))
		?.split('=')[1];

	if (!token) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	// Valida a sessão do usuário
	const authUser = await verifySession(`AuthorizationToken=${token}`);
	const usersRoles = await getUsersRoles();

	if (
		!authUser ||
		!usersRoles.some((r) => r.id === authUser.role && (r.role === 'ADMIN' || r.role === 'GESTOR'))
	) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const requestBody = await request.json();
	if (!isValidRequestBody(requestBody)) {
		throw error(400, { message: translations.errors.noFileData });
	}

	const { fileData, fileName, fileExtension, folderName } = requestBody;

	// Verifica a versão do ficheiro e da pasta
	const match = folderName.match(/v\d+/);
	const folderVersion = match ? match[0] : null;
	const matchFile = fileName.replace(new RegExp(`\\.${fileExtension}$`), '').match(/v\d+/);
	const fileVersion = matchFile ? matchFile[0] : null;
	if (folderVersion !== fileVersion) {
		throw error(400, { message: translations.errors.version });
	}

	// Processa o nome do ficheiro base
	const baseFilename = fileName
		.replace(new RegExp(`\\.${fileExtension}$`), '') // Remove a extensão
		.replace(/_v\d+$/, '') // Remove versões como "_v02"
		.replace(/_\d{8}$/, ''); // Remove a data no formato "_YYYYMMDD"

	// Extrai a data do nome do ficheiro
	const dateMatch = fileName.match(/_(\d{8})/);
	const date = dateMatch ? dateMatch[1] : null;

	// Define o caminho da pasta e substitui ficheiros existentes
	const folderPath = path.join(env.SECRET_FOLDER_PATH, folderName);

	try {
		const files = await fs.readdir(folderPath);

		for (const file of files) {
			if (file.startsWith(baseFilename)) {
				const fileDateMatch = file.match(/_(\d{8})/);
				const fileDate = fileDateMatch ? fileDateMatch[1] : null;

				// Remove ficheiros antigos que não possuem a mesma data
				if (fileDate !== date) {
					await fs.unlink(path.join(folderPath, file));
				}
			}
		}
	} catch (err) {
		throw error(500, { message: translations.errors.fileOperation });
	}

	// Caminho final do ficheiro e escrita no servidor
	const filePath = path.join(folderPath, `${fileName}.${fileExtension}`);
	await fs.writeFile(filePath, getBase64Data(fileData), 'base64');

	return json({ success: true, message: translations.files.successUpload });
}
const isValidRequestBody = (
	body: any
): body is {
	fileData: string;
	fileName: string;
	fileExtension: string;
	folderName: string;
} => {
	return (
		body &&
		typeof body.fileData === 'string' &&
		body.fileData !== 'data:' &&
		typeof body.fileName === 'string' &&
		typeof body.fileExtension === 'string' &&
		typeof body.folderName === 'string'
	);
};

const getBase64Data = (fileData: string) => {
	const [, base64Data] = fileData.split(',');
	return base64Data;
};
