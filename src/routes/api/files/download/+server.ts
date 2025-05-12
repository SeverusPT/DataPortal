import fs from 'fs';
import { env } from '$env/dynamic/private';
import { getUsersRoles, verifySession } from '$lib/configs/users/index.server';
import { error } from '@sveltejs/kit';
import { _verifyExtensions } from '../../../(app)/(products and files)/products/+page';
import JSZip from 'jszip';
import path from 'path';
import { fetchVersionComponents } from '$lib/configs/versions/index.server';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

export async function POST({ request, url, locals, fetch }) {
	const cookies = request.headers.get('cookie');

	if (!cookies) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const cookie = cookies.split(';').find((c) => c.trim().startsWith('AuthorizationToken='));
	if (!cookie) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	const token = cookie.split('=')[1];
	const authCookie = `AuthorizationToken=${token}`;

	const authUser = await verifySession(authCookie);
	if (!authUser) {
		throw error(401, { message: translations.errors.unauthorized });
	}

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

	const { names, folder } = await request.json();
	if (!folder || !Array.isArray(names) || names.length === 0) {
		throw error(400, { message: translations.errors.invalidRequest });
	}

	const basePath = method === 'history' ? env.SECRET_HISTORY_PATH : env.SECRET_FOLDER_PATH;
	const folderPath = `${basePath}/${folder}`;

	if (!fs.existsSync(folderPath)) {
		throw error(404, { message: translations.errors.folderNotExists });
	}

	// Verificar se os ficheiros especificados existem na pasta
	const filesInFolder = fs.readdirSync(folderPath);

	// Mapeia os nomes completos com extensões a partir de names
	const filesToProcess = names.flatMap((name) =>
		filesInFolder.filter((file) => file.startsWith(name))
	);

	if (filesToProcess.length === 0) {
		throw error(404, { message: translations.errors.noFiles });
	}

	const { versions, versionValues } = await fetchVersionComponents(fetch);

	// Cria o ZIP
	const zip = new JSZip();

	// Criar a zip folder
	const zipFolder = zip.folder(folder);

	// Verificar se zip folder é null
	if (!zipFolder) {
		throw error(500, translations.errors.creatingZip);
	}

	// Validar os ficheiros
	const fileObjects = filesToProcess.map((fileName) => {
		const filePath = `${folderPath}/${fileName}`;
		const fileContent = fs.readFileSync(filePath);
		return new File([fileContent], fileName, {
			type: 'application/octet-stream'
		});
	});

	const validationResults = await _verifyExtensions(fileObjects, versions, versionValues);

	// Filtrar apenas os ficheiros válidos, considerando o papel do usuário
	const validFiles = filesToProcess.filter((file) => {
		const fileNameWithoutExtension = file.split('.')[0];

		// Verificar se o usuário tem o papel de "CONSULT"
		const consultRole = usersRoles.find((consultObj) => consultObj.role === 'CONSULT');
		if (authUser.role === consultRole.id) {
			// Apenas permite ficheiros sem erros e extensões ausentes
			const isToDownload = validationResults.some((fileResult) => {
				return (
					fileResult.name === fileNameWithoutExtension &&
					fileResult.missingExtensions.length === 0 &&
					fileResult.nameErrors.length === 0
				);
			});

			// Excluir ficheiros que não passam na validação
			if (!isToDownload) {
				return false;
			}
		}

		// Se o usuário não for "CONSULT" ou o ficheiro for válido, inclui-o
		return true;
	});

	// Adiciona os arquivos ao ZIP
	for (const file of validFiles) {
		const filePath = path.join(folderPath, file);
		if (fs.existsSync(filePath)) {
			const fileContent = fs.readFileSync(filePath);
			zipFolder.file(file, fileContent);
		}
	}

	// Gera o ZIP na memória
	const zipBuffer = await zip.generateAsync({
		type: 'nodebuffer',
		compression: 'DEFLATE',
		compressionOptions: { level: 9 }
	});

	// Retorna o ZIP como resposta
	return new Response(zipBuffer, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': 'attachment; filename="SPT_Download.zip"'
		}
	});
}
