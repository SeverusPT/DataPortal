import type { RequestHandler } from './$types';
import { _ensurePermissions } from '../+server';
import { error, json } from '@sveltejs/kit';
import fs from 'fs';
import { env } from '$env/dynamic/private';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

export const GET: RequestHandler = async (event) => {
	let errors;

	const apiKey = event.request.headers.get('x-api-key');

	const permission = await _ensurePermissions(apiKey);

	if (!permission.success) {
		throw error(401, { message: translations.errors.unauthorized });
	}

	try {
		const res = await fetch(`/api/folders/fetch`, {
			headers: {
				'x-api-key': apiKey
			}
		});

		// Lê o arquivo de erros e atribui o conteúdo à variável
		const data = fs.readFileSync(env.SECRET_ERRORS_PATH, 'utf-8');
		errors = JSON.parse(data);
	} catch (err: any) {
		throw error(500, { message: err });
	}

	return json(errors);
};
