import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { env } from '$env/dynamic/private';
import { getUsersRoles, verifySession } from '$lib/configs/users/index.server';
import { error } from '@sveltejs/kit';
import { _verifyExtensions } from '../../../(app)/(products and files)/products/+page';
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

	const { names } = await request.json();

	if (!names || !Array.isArray(names)) {
		throw error(400, { message: translations.errors.missingFileNames });
	}

	const basePath = method === 'history' ? env.SECRET_HISTORY_PATH : env.SECRET_FOLDER_PATH;

	// Obtem as versões antes de iniciar o loop
	const { versions, versionValues } = await fetchVersionComponents(fetch);

	// Cria o ZIP
	const zip = new JSZip();

	// Adiciona arquivos ao ZIP
	for (const folderName of names) {
		const folderPath = path.join(basePath, folderName);

		if (!fs.existsSync(folderPath)) {
			throw error(404, { message: translations.errors.folderNotExists });
		}

		const files = fs.readdirSync(folderPath);
		const folder = zip.folder(folderName);

		// Verificar se folder é null
		if (!folder) {
			throw error(500, translations.errors.creatingZip);
		}

		const fileObjects = files.map((fileName) => {
			const filePath = path.join(folderPath, fileName);
			const fileContent = fs.readFileSync(filePath);
			return new File([fileContent], fileName, { type: 'application/octet-stream' });
		});

		const validationResults = await _verifyExtensions(fileObjects, versions, versionValues);

		const validFiles = files.filter((file) => {
			const fileNameWithoutExtension = file.split('.')[0];
			const consultRole = usersRoles.find((r) => r.role === 'CONSULT');

			if (authUser.role === consultRole.id) {
				const isToDownload = validationResults.some((result) => {
					return (
						result.name === fileNameWithoutExtension &&
						result.missingExtensions.length === 0 &&
						result.nameErrors.length === 0
					);
				});

				return isToDownload;
			}

			return true;
		});

		for (const file of validFiles) {
			const filePath = path.join(folderPath, file);
			if (fs.existsSync(filePath)) {
				const fileContent = fs.readFileSync(filePath);
				folder.file(file, fileContent);
			}
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
