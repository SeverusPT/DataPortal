import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserByEmail } from '$lib/configs/users/index.server';

export const load = (async ({ locals, depends }) => {
	depends('data:profile');
	const { user } = locals;

	if (!user) {
		throw redirect(302, '/login');
	}

	const foundUser = await getUserByEmail(user.email);

	if (foundUser === null) {
		throw redirect(302, '/login');
	}

	return {
		user: { email: foundUser.email, maskedKey: foundUser.masked_key }
	};
}) satisfies PageServerLoad;
