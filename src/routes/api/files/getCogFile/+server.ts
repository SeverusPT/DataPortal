import { readFile } from 'fs/promises';
import { error, type RequestHandler } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

export const GET: RequestHandler = async ({ url }) => {
	try {
		const tiffFolder = url.searchParams.get('tiffFolder');
		const tiffFile = url.searchParams.get('tiffFile');

		const cogLocation = `${privateEnv.SECRET_COG_FOLDER_PATH}/${tiffFolder}/${tiffFile}${publicEnv.PUBLIC_RGB_COGFILE_SUFFIX}.tif`;

		const fileBuffer = await readFile(cogLocation);

		return new Response(fileBuffer);
	} catch {
		throw error(500, translations.errors.cogFileNotFound);
	}
};
