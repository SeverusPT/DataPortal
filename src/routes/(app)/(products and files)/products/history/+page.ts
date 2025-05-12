import { getComponents, type Components, type Folder } from '$lib/configs';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { _fetchFolders } from '../+page';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

export const load: PageLoad = async ({ fetch, depends, parent }) => {
	const user = (await parent()).userData;
	const roles = (await parent()).roles;

	if (!user || !roles) {
		throw new Error(translations.errors.userDataNotFound);
	}

	//get user data.role and verify on role.id if user has access to this page if is ADMIN or GESTOR or VERIFIED
	if (
		!roles.some(
			(r) =>
				r.id === user.role && (r.role === 'ADMIN' || r.role === 'GESTOR' || r.role === 'VERIFIED')
		)
	) {
		throw error(403, translations.errors.unauthorized);
	}

	let folders: Folder[] = await _fetchFolders(fetch, 'history');

	const versionValues = (await parent()).versionValues;

	const components: Components = await getComponents(versionValues);

	depends('data:folders:history');

	return {
		folders: folders,
		components: components
	};
};
