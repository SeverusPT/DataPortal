import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import { marked } from 'marked';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

export const POST: RequestHandler = async ({ request }) => {
	const { folderName, fileName, method } = await request.json();

	// Remove extensão do nome do ficheiro
	const finalName = `${fileName}.tif.meta.txt`;

	// Define o caminho com base no método
	const basePath = method === 'history' ? env.SECRET_HISTORY_PATH : env.SECRET_FOLDER_PATH;
	const finalPath = `${basePath}/${folderName}/${finalName}`;

	// Verifica se o ficheiro existe
	if (!fs.existsSync(finalPath)) {
		throw error(400, { message: translations.errors.markdown });
	}

	// Lê o conteúdo do ficheiro
	const file = fs.readFileSync(finalPath);
	const content = file.toString();

	// Converte o conteúdo para HTML
	const html = marked.parse(content);

	return json({ html });
};
