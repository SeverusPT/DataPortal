import { fetchVersionComponents } from '$lib/configs/versions/index.server';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ fetch, depends }) => {
	depends('data:versions');

	const { versions, versionValues, dbVersions } = await fetchVersionComponents(fetch);

	return { versions, versionValues, dbVersions };
}) satisfies LayoutServerLoad;
