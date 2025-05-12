import type { RequestHandler } from './$types';
import { getVersions } from '$lib/configs/versions/index.server';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const versionsData = await getVersions();

		return json({ success: true, versionsData });
	} catch (e) {
		throw error(500, { message: e.message });
	}
};
