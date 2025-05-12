import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises'; // Note que agora estou usando a versão `promises` do fs
import type { FireFeature } from '$lib/configs';
import { t } from '$lib/lang/index.js';
import { building } from '$app/environment';

let fireLocs: FireFeature[] = [];

let translations;
t.subscribe((value) => {
	translations = value;
});

// Função para carregar os dados do arquivo de forma assíncrona
async function loadFireLocs() {
	try {
		const jsonString = await fs.readFile(`${env.SECRET_FLOC_PATH}`, 'utf8');
		fireLocs = JSON.parse(jsonString);
	} catch (e) {
		throw error(404, translations.errors.fireLoc);
	}
}

// Carrega os dados assim que o módulo for carregado
if (!building) {
	loadFireLocs();
}

// ========= GET
export async function GET({ url }) {
	// Garantir que os dados sejam carregados antes de qualquer requisição
	if (fireLocs.length === 0) {
		await loadFireLocs();
	}

	const ano = url.searchParams.get('year');

	const ret = fireLocs.filter(
		(feat) => feat.properties.year == ano && feat.properties.area_ht >= 10
	);

	return json(ret);
}
