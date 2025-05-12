import { error, json } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';
import { env as publicEnv } from '$env/dynamic/public';
import { createRgbCogTiff } from '$lib/map/raster-utils.js';
import { getUsersRoles } from '$lib/configs/users/index.server';
import { t } from '$lib/lang/index.js';
let translations;
t.subscribe((value) => {
	translations = value;
});

// Paramter op can have the following values
//  - img: get the original tiff file
//  - exists: returns if the tiff file exists
//  - rgb_exists: verify if rgb file exists
//  - rgb_create: generate the public rgb file if possible
export async function GET({ url, locals }) {
	const op = url.searchParams.get('op')?.toLowerCase();
	const folder = url.searchParams.get('fld');
	const file = url.searchParams.get('file');
	const method = url.searchParams.get('method');
	const user = locals.user;

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

	const tifFilename = `${file}.tif`;
	const basePath =
		method === 'history' ? privateEnv.SECRET_HISTORY_PATH : privateEnv.SECRET_FOLDER_PATH;
	const tifFilepath = `${basePath}/${folder}/${tifFilename}`;

	// Verify if file exists - if not throws error
	const existsTIFF = fs.existsSync(tifFilepath);

	if (!existsTIFF) {
		throw error(400, { message: translations.errors.geoTIFF });
	}

	// Execution for each type of operation
	if (op == 'exists') {
		return json({ success: true });
	}
	if (op == 'img') {
		const buffer = fs.readFileSync(tifFilepath);
		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'image/tiff', //'application/octet-stream',
				'Content-Disposition':
					// Use filename* instead of filename to support non-ASCII characters
					`attachment; filename=${encodeURIComponent(tifFilename)}`
			}
		});
	}

	const cogFilename = `${file}${publicEnv.PUBLIC_RGB_COGFILE_SUFFIX}.tif`;
	const cogFolder = `${privateEnv.SECRET_COG_FOLDER_PATH}/${folder}`;
	const cogFilepath = `${cogFolder}/${cogFilename}`;
	let existsRGB = fs.existsSync(cogFilepath);
	if (op == 'rgb_exists') {
		return json({ exists: existsRGB });
	}
	if (op == 'rgb_create') {
		// REVIEW caso de o ficheiro cog já existir: não faz nada? é substituido? E se apagar o tiff original?
		let suc = await createRgbCogTiff(file!, folder!, method);
		return json({ success: suc });
	}

	// Default response
	throw error(400, { message: translations.errors.opCode });
}
