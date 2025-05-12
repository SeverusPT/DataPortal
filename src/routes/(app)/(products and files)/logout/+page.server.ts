import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load = (async ({ cookies }) => {
	cookies.delete('AuthorizationToken', {
		secure: env.SECRET_ENVIRONMENT === 'PROD',
		path: '/'
	});
	throw redirect(303, '/products');
}) satisfies PageServerLoad;
