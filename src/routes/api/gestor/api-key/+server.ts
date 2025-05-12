import type { RequestHandler } from './$types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { getUsersRoles, updateUserApiKey } from '$lib/configs/users/index.server';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { user } = locals;

		if (!user) {
			return new Response(translations.session.incorrectAccess, {
				status: 404
			});
		}

		const usersRoles = await getUsersRoles();

		if (
			!usersRoles.some((r) => r.id === user.role && (r.role === 'GESTOR' || r.role === 'ADMIN'))
		) {
			return new Response(translations.errors.unauthorized, { status: 401 });
		}

		const { encryptedKey, maskedKey, key } = await _generateAPIKey();

		await _updateAPIKey(user.email, encryptedKey, maskedKey);

		return new Response(JSON.stringify({ message: translations.api.keyGenerated, key: key }), {
			status: 200
		});
	} catch (error) {
		return new Response(translations.errors.occurred, { status: 500 });
	}
};

const _generateAPIKey = async () => {
	try {
		const key = uuidv4().replace(/-/g, '');

		const maskedKey = `${key.slice(0, 4)}...${key.slice(-4)}`;
		const salt = await bcrypt.genSalt(10);

		const encryptedKey = await bcrypt.hash(key, salt);

		return { encryptedKey, maskedKey, key };
	} catch (error) {
		throw new Error(translations.api.errorGenerating);
	}
};

const _updateAPIKey = async (email: string, encryptedKey: string, maskedKey: string) => {
	try {
		// Chamar a função que faz o update no banco de dados
		const success = await updateUserApiKey(email, encryptedKey, maskedKey);

		if (success) {
			return { status: 'success', message: translations.api.successUpdating };
		} else {
			return {
				status: 'error',
				message: translations.api.noUserFound
			};
		}
	} catch (error) {
		return { status: 'error', message: translations.api.errorUpdating, error };
	}
};
