import db from '$lib/db/db.server';
import { t } from '$lib/lang';
import type { Component, Version } from '..';

// Função genérica para manipular erros e retornos
const handleError = (error, message) => {
	throw new Error(message);
};

let translations;
t.subscribe((value) => {
	translations = value;
});

// get all versions from db
export const getVersions = async () => {
	try {
		// Buscar todas as versões da base de dados
		const versionsData = db.prepare('SELECT * FROM version').all();

		// Criar um objeto vazio para armazenar as versões no formato necessário
		const versions: Version = {};

		// Verificar se existem versões retornadas e processá-las
		if (versionsData.length > 0) {
			versionsData.forEach((version: any) => {
				versions[version.version_name] = {
					folderStructure: {
						separator: version.folder_separator,
						components: JSON.parse(version.folder_components)
					},
					fileStructure: {
						separator: version.file_separator,
						components: JSON.parse(version.file_components)
					}
				};
			});
		}

		// Retornar o objeto contendo as versões no formato esperado
		return { versions, dbVersions: versionsData };
	} catch (error) {
		handleError(error, translations.errors.fetchVersions);
	}
};

//Adicionar uma nova versão à base de dados
export const addVersion = async (versionName: string, changesEn: string, changesPt: string) => {
	try {
		// Verificar se a versão já existe
		const versionExists = db
			.prepare('SELECT * FROM version WHERE version_name = ?')
			.get(versionName);

		if (versionExists) {
			handleError(null, translations.errors.versionExists);
		}

		// Inserir a nova versão na base de dados
		db.prepare('INSERT INTO version (version_name, changes_en, changes_pt) VALUES (?, ?, ?)').run(
			versionName,
			changesEn,
			changesPt
		);

		return { success: true };
	} catch (error) {
		handleError(error, translations.errors.addVersion);
	}
};

// Função para obter o VersionNumber dinamicamente da base de dados
export const fetchVersionComponents = async (
	fetch
): Promise<{
	versions: Version;
	versionValues: Component['values'];
	dbVersions: [];
}> => {
	try {
		// Fazendo a requisição para obter as versões no formato desejado
		const res = await fetch('/api/versions/fetch', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		});

		// Converte a resposta para JSON
		const jsonData = await res.json();

		if (!jsonData.success) {
			throw new Error(translations.errors.fetchVersions);
		}
		// Obtendo as versões diretamente da resposta
		const versions: Version = jsonData.versionsData.versions;
		const dbVersions = jsonData.versionsData.dbVersions;

		// Criando `versionValues` no formato necessário para `Component["values"]`
		const versionValues: { [key: string]: { en: string; pt: string } } = {};

		for (const versionKey in versions) {
			if (versions.hasOwnProperty(versionKey)) {
				versionValues[versionKey] = {
					en: 'Version number of the product. Composed of a single digit which denotes changes only to the major version',
					pt: 'Número da versão do produto. Composto por dois dígitos que denota alterações apenas na versão principal'
				};
			}
		}

		// Retornando as versões e `versionValues`
		return { versions, versionValues, dbVersions };
	} catch (error) {
		throw error; // Repassa o erro para ser tratado pela aplicação chamadora
	}
};
