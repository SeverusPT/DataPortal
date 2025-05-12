import type { PageLoad } from '../$types';

export const load = (async ({ params }) => {
	const token = params['token'];

	return { token };
}) satisfies PageLoad;
