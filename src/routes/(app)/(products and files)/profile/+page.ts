import { t } from '$lib/lang';
import { toast } from '$lib/stores/toast';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, data }) => {
	depends('data:profile');
	const user = data.user;
	const apiKey = user.maskedKey;

	if (!apiKey) {
		return {
			apiKey: ''
		};
	}

	return {
		apiKey
	};
};

let translations;
t.subscribe((value) => {
	translations = value;
});

export const _generateAPIKey = async () => {
	try {
		const res = await fetch('/api/gestor/api-key', {
			headers: {
				'Cache-Control': 'no-cache' // Evita que o navegador armazene em cache a resposta
			}
		});
		const data = await res.text();

		if (res.status === 200) {
			toast(JSON.parse(data).message, 'success');
			return { success: true, key: JSON.parse(data).key };
		} else {
			toast(data, 'error');
			return { success: false };
		}
	} catch (error) {
		toast(translations.api.errorGenerating, 'error');
		return { success: false };
	}
};
