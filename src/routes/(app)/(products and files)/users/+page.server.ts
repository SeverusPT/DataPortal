import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUsers } from '$lib/configs/users/index.server';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

export const load = (async ({ parent, url, depends }) => {
	depends('data:users');

	const user = (await parent()).userData;
	const roles = (await parent()).roles;

	if (!user || !roles) {
		throw new Error(translations.errors.userDataNotFound);
	}

	// Verificar se o utilizador é ADMIN
	if (!roles.some((r) => r.id === user.role && r.role === 'ADMIN')) {
		throw error(403, translations.errors.unauthorized);
	}

	// Parâmetros de paginação e pesquisa
	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
	const search = url.searchParams.get('search') || '';
	const offset = (page - 1) * pageSize;

	// Obter dados dos utilizadores
	const usersData = await getUsers(page, pageSize, search, offset);

	return {
		usersData
	};
}) satisfies PageServerLoad;
