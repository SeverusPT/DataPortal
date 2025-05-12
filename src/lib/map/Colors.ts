import type { ColorSteps, ColorStep } from '$lib/configs';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

const defaultColor = '#666666'; // REVIEW if null to not appear
export const colorsSev = [
	'#D0D1E6', // No Severity OR In Recovery
	'#FEE391', // Very Low
	'#FEC44F', // Low
	'#FE9929', // Moderate
	'#D95F0E', // High
	'#993404' // Very_high
];

const stepsSevSat: ColorSteps = {
	L8OLI_DELTA: [
		{ valIn: -1e7, valEx: 0 }, // [-1e7, 0]
		{ valIn: 1, valEx: 2629 },
		{ valIn: 2629, valEx: 4582 },
		{ valIn: 4582, valEx: 6271 },
		{ valIn: 6271, valEx: 8194 },
		{ valIn: 8194, valEx: 1e7 } // [8194, 1e7[
	],
	L8OLI_RBR: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 1895 },
		{ valIn: 1895, valEx: 3162 },
		{ valIn: 3162, valEx: 4217 },
		{ valIn: 4217, valEx: 5286 },
		{ valIn: 5286, valEx: 1e7 }
	],
	L8OLI_RDT: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 4377 },
		{ valIn: 4377, valEx: 7127 },
		{ valIn: 7127, valEx: 9519 },
		{ valIn: 9519, valEx: 11628 },
		{ valIn: 11628, valEx: 1e7 }
	],
	LTH_DELTA: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 2510 },
		{ valIn: 2510, valEx: 3868 },
		{ valIn: 3868, valEx: 5038 },
		{ valIn: 5038, valEx: 6328 },
		{ valIn: 6328, valEx: 1e7 }
	],
	LTH_RBR: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 1846 },
		{ valIn: 1846, valEx: 2761 },
		{ valIn: 2761, valEx: 3488 },
		{ valIn: 3488, valEx: 4244 },
		{ valIn: 4244, valEx: 1e7 }
	],
	LTH_RDT: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 4257 },
		{ valIn: 4257, valEx: 6283 },
		{ valIn: 6283, valEx: 7895 },
		{ valIn: 7895, valEx: 9486 },
		{ valIn: 9486, valEx: 1e7 }
	],
	MOD_DELTA: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 2613 },
		{ valIn: 2613, valEx: 4123 },
		{ valIn: 4123, valEx: 5548 },
		{ valIn: 5548, valEx: 7162 },
		{ valIn: 7162, valEx: 1e7 }
	],
	MOD_RBR: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 1851 },
		{ valIn: 1851, valEx: 2862.2 },
		{ valIn: 2862.2, valEx: 3703 },
		{ valIn: 3703, valEx: 4612 },
		{ valIn: 4612, valEx: 1e7 }
	],
	MOD_RDT: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 4164.4 },
		{ valIn: 4164.4, valEx: 6358 },
		{ valIn: 6358, valEx: 8137 },
		{ valIn: 8137, valEx: 10001 },
		{ valIn: 10001, valEx: 1e7 }
	],
	S2MSI_DELTA: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 1816 },
		{ valIn: 1816, valEx: 3519 },
		{ valIn: 3519, valEx: 5029 },
		{ valIn: 5029, valEx: 6725 },
		{ valIn: 6725, valEx: 1e7 }
	],
	S2MSI_RBR: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 1455 },
		{ valIn: 1455, valEx: 2750 },
		{ valIn: 2750, valEx: 3801 },
		{ valIn: 3801, valEx: 4900 },
		{ valIn: 4900, valEx: 1e7 }
	],
	S2MSI_RDT: [
		{ valIn: -1e7, valEx: 0 },
		{ valIn: 1, valEx: 3818 },
		{ valIn: 3818, valEx: 6884 },
		{ valIn: 6884, valEx: 9673 },
		{ valIn: 9673, valEx: 12247 },
		{ valIn: 12247, valEx: 1e7 }
	]
};

// Inicialize colors
for (const [key, colStep] of Object.entries(stepsSevSat)) {
	for (let i = 0; i <= colStep.length - 1; i++) {
		colStep[i].color = colorsSev[i];
	}
}

export const pixelColorMap = (sevInd?: string, sat?: string): ColorStep | undefined => {
	let colormap: ColorStep | undefined = undefined;
	if (sevInd && sat) {
		colormap = stepsSevSat[sat + '_' + sevInd];
	}
	return colormap;
};

function HEXToRGB(rrggbb: string): number[] {
	return [
		parseInt(rrggbb.slice(1, 3), 16),
		parseInt(rrggbb.slice(3, 5), 16),
		parseInt(rrggbb.slice(-2), 16)
	];
}

export enum ColorRgbIndex {
	RED = 0,
	GREEN = 1,
	BLUE = 2
}

export const pixelValueToRGB_func = (
	colormap: ColorStep | undefined,
	varSymbol: string,
	colorIndex: ColorRgbIndex
): string => {
	let funcao = 'return ';
	if (colormap) {
		for (let i = 0; i < colormap.length; i++) {
			const { valIn, valEx, color } = colormap[i];
			const rgb = HEXToRGB(color || defaultColor);

			const lower = valIn ?? -Infinity;
			const upper = valEx ?? Infinity;

			// Exemplo de intervalo fechado em valIn e aberto em valEx: [valIn, valEx)
			funcao +=
				`(${varSymbol} >= ${lower} && ${varSymbol} < ${upper}) ? ` + `${rgb[colorIndex]} : `;
		}
	}

	// Se não caiu em nenhum intervalo acima, retorne cor padrão
	funcao += HEXToRGB(defaultColor)[colorIndex];
	return funcao;
};

export function getColorMap(fileName: string) {
	const splitFile = fileName.split('_');
	const sevInd = splitFile[1];
	const sat = splitFile[3];
	const colormap = pixelColorMap(sevInd, sat); // Exemplo

	if (!colormap) {
		throw new Error(
			`${translations.errors.colorMapNotFound.replace('{colormap}', sevInd + '_' + sat)} `
		);
	}
	return colormap;
}
