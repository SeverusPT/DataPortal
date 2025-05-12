// src/routes/wms/+server.ts
import { currentLang, setLanguage, type Languages } from '$lib/lang';
import { getCapabilities, getLegendGraphic, getMap } from '../../../lib/wms/wmsController';
import { wmsException } from '../../../lib/wms/wmsResponses';
import { parseWmsParams } from '../../../lib/wms/wmsUtils';
import type { RequestEvent } from '@sveltejs/kit';
import { t } from '$lib/lang';
import { get } from 'svelte/store';

let translations;
t.subscribe((value) => {
	translations = value;
});

export async function GET({ url, fetch }: RequestEvent) {
	try {
		// 1) Extrair/normalizar parâmetros
		const params = parseWmsParams(url.searchParams);

		// 2) Validação mínima obrigatória do WMS
		//    (Service e Version são sempre necessários, por exemplo)
		if (params.service !== 'WMS') {
			return wmsException('InvalidParameterValue', translations.wms.invalidServiceParameter, 400);
		}

		let lang = (params.lang?.toLowerCase?.() as Languages) || get(currentLang) || 'pt';

		setLanguage(lang);

		// 3) Roteamento do request
		switch (params.request) {
			case 'GetCapabilities':
				return await getCapabilities(params, fetch);

			case 'GetMap':
				return await getMap(params);

			case 'GetLegendGraphic':
				return await getLegendGraphic(params);

			default:
				return wmsException(
					'OperationNotSupported',
					translations.wms.operationNotSupported.replace('{operation}', params.request),
					400
				);
		}
	} catch (err: any) {
		// Caso seja um erro interno que não tenha sido capturado ainda,
		// podemos responder com uma exceção WMS genérica.
		return wmsException(
			'NoApplicableCode',
			`${translations.wms.internalServerError}: ${err?.message ?? err}`,
			500
		);
	}
}
