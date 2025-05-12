import type { LayoutServerLoad } from './$types';
import { getUsersRoles } from '$lib/configs/users/index.server';

export const load = (async ({ locals }) => {
	const userData = locals.user;
	const roles = await getUsersRoles();

	return { userData, roles };
}) satisfies LayoutServerLoad;
