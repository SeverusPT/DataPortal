import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getComponents, type FileInterface } from '$lib/configs';
import { _fetchFiles } from '../../[folderName]/+page';

export const load: PageLoad = async ({ fetch, params, depends, parent }) => {
	let files: FileInterface[] = [];

	depends('folder:products:history');

	await _fetchFiles(fetch, params.folderName, 'history')
		.then((res) => {
			files = res;
		})
		.catch((err) => {
			throw error(404, err.message);
		});

	const versionValues = (await parent()).versionValues;

	const components = await getComponents(versionValues);

	return {
		files: files,
		params,
		components
	};
};
