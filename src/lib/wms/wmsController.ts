// src/lib/wms/wmsController.ts
import fs from 'fs';
import path from 'path';
import gdal from 'gdal-async';
import { env } from '$env/dynamic/private';
import { wmsException, buildCapabilitiesXml } from './wmsResponses';
import {
	calculateBoundingBox,
	warpDataset,
	processPixels,
	createMemDataset,
	exportToPNG,
	parseBboxNumbers,
	createLegend
} from './wmsUtils';

// Ajuste do caminho do proj.db
const projDbPath = path.resolve('./node_modules/gdal-async/deps/libproj/proj/data');
gdal.config.set('PROJ_LIB', projDbPath);

// Exemplo: cores e labels que você tinha no código anterior
import { colorsSev, getColorMap } from '$lib/map/Colors';
import { fetchVersionComponents } from '$lib/configs/versions/index.server';
import { getComponents, type Component, type Version } from '$lib/configs';
import { t } from '$lib/lang';

let translations;
t.subscribe((value) => {
	translations = value;
});

async function getInfo(
	name: string,
	type: 'folder' | 'file',
	versions: Version,
	versionValues: Component['values'],
	lang: string
) {
	const match = name.match(/v\d+/);
	const version = match ? match[0] : null;
	const currentVersion = versions[version];
	const structure =
		type === 'folder' ? currentVersion.folderStructure : currentVersion.fileStructure;

	const components = await getComponents(versionValues);
	const splitName = name.split(structure.separator);

	return structure.components
		.map((component, i) => {
			const key = splitName[i];
			const componentData = components[component];

			// Verifica se existem valores específicos para a chave
			const value = componentData?.values?.[key]?.[lang];

			// Se não houver `values`, usa a descrição do componente
			const description = componentData?.description?.[lang];

			return value ? `${component}: ${key} - ${value}` : `${component}: ${key} - ${description}`;
		})
		.join('; ')
		.trim();
}

export async function getCapabilities(params: any, fetch: Function) {
	const { versions, versionValues } = await fetchVersionComponents(fetch);

	try {
		// Ler parâmetros de query
		const productParam = params.product; // nome da pasta (se fornecido)
		const fileParam = params.file; // nome do ficheiro (se fornecido)
		const lang = params.lang;

		// 1) Buscar lista de pastas (folders)
		const foldersResp = await fetch('/api/folders/fetch');
		if (!foldersResp.ok) {
			return wmsException('NoApplicableCode', translations.wms.errorFolders, 500);
		}
		const allFolders = await foldersResp.json();

		// Filtramos se "folderParam" foi definido
		let foldersToProcess = allFolders;
		if (productParam) {
			foldersToProcess = allFolders.filter((f) => f.name === productParam);
			if (foldersToProcess.length === 0) {
				return wmsException(
					'LayerNotDefined',
					translations.wms.productNotFound.replace('{product}', productParam),
					404
				);
			}
		}

		// Este array vai guardar cada <Layer> grande (um por pasta)
		const layerXmlBlocks: string[] = [];

		// 2) Itera cada pasta
		for (const folder of foldersToProcess) {
			// Busca ficheiros desta pasta
			const filesResp = await fetch(`/api/files/fetch/${folder.name}`);
			if (!filesResp.ok) {
				return wmsException(
					'NoApplicableCode',
					translations.wms.errorFiles.replace('{product}', folder.name)
				);
			}
			const filesJSON = await filesResp.json();

			// Se foi definido "fileParam", filtrar ficheiros
			let filesToProcess = filesJSON;
			if (fileParam) {
				filesToProcess = filesJSON.filter((f) => f.name === fileParam);
				if (filesToProcess.length === 0) {
					return wmsException(
						'LayerNotDefined',
						translations.wms.fileNotFound
							.replace('{file}', fileParam)
							.replace('{product}', folder.name),
						404
					);
				}
			}

			// Este array guardará os <Layer> de cada ficheiro dentro da pasta
			const fileLayerBlocks: string[] = [];

			// 3) Para cada ficheiro na pasta, monta sub-layer
			for (const file of filesToProcess) {
				const filePath = path.join(env.SECRET_FOLDER_PATH, folder.name, file.name + '.tif');
				let boundingBoxXML = '';
				let crsList: string[] = [];
				let bandsXML = '';

				try {
					const dataset = gdal.open(filePath);
					const { minx, miny, maxx, maxy } = calculateBoundingBox(dataset);

					// Descobrir EPSG
					const srs = dataset.srs;
					if (srs) {
						const epsgCode = srs.getAuthorityCode(null);
						if (epsgCode) {
							crsList.push(`EPSG:${epsgCode}`);
						}
					}

					// Info das bandas
					const bandCount = dataset.bands.count();
					for (let i = 1; i <= bandCount; i++) {
						const band = dataset.bands.get(i);
						let min = band.minimum;
						let max = band.maximum;

						if (min === undefined || max === undefined) {
							const stats = band.getStatistics(true, true);
							//@ts-ignore
							min = stats.min;
							//@ts-ignore
							max = stats.max;
						}

						bandsXML += `
							<Band>
								<Description>Banda ${i}</Description>
								<DataType>${band.dataType}</DataType>
								<NoDataValue>${band.noDataValue ?? 'N/A'}</NoDataValue>
								<MinValue>${min}</MinValue>
								<MaxValue>${max}</MaxValue>
							</Band>
						`;
					}

					// BoundingBox no primeiro CRS encontrado
					if (crsList[0]) {
						boundingBoxXML = `
							<BoundingBox CRS="${crsList[0]}"
								minx="${minx}" miny="${miny}"
								maxx="${maxx}" maxy="${maxy}" />
						`;
					}
				} catch (error: any) {}

				// CRSs suportados
				const crsXML = crsList.map((c) => `<CRS>${c}</CRS>`).join('');

				// 4) Monta o <Layer> específico para este ficheiro
				const fileLayer = `
					<Layer>
						<Name>${folder.name}/${file.name}</Name>
						<Title>${file.name}</Title>
						<Abstract>${await getInfo(file.name, 'file', versions, versionValues, lang)}</Abstract>
						${crsXML}
						${boundingBoxXML}
						${bandsXML}
					</Layer>
				`;

				fileLayerBlocks.push(fileLayer);
			}

			// 5) Agora criamos um "Layer-pai" para a pasta,
			//    contendo todos os <Layer> de ficheiros como subcamadas
			const folderLayer = `
				<Layer>
					<Name>${folder.name}</Name>
					<Title>${folder.name}</Title>
					<Abstract>
							${await getInfo(folder.name, 'folder', versions, versionValues, lang)}
					</Abstract>
					
					${fileLayerBlocks.join('\n')}
				</Layer>
			`;

			// Adicionamos esse bloco ao array principal
			layerXmlBlocks.push(folderLayer);
		}

		// 6) Constrói o XML final (com todos os Layers de pastas)
		const capabilitiesXML = buildCapabilitiesXml(layerXmlBlocks);

		return new Response(capabilitiesXML, {
			headers: { 'Content-Type': 'application/xml' }
		});
	} catch (err: any) {
		return wmsException(
			'NoApplicableCode',
			`${translations.wms.errorGeneratingCapabilities}: ${err.message}`,
			500
		);
	}
}

export async function getMap(params: any) {
	try {
		// Parâmetros essenciais
		const { layers, bbox, width, height, crs, format, version } = params;

		// Lista de parâmetros obrigatórios
		const requiredParams = { layers, bbox, width, height, crs, version };

		// Verifica quais estão ausentes
		const missingParams = Object.entries(requiredParams)
			.filter(([_, value]) => !value) // Filtra os que são `undefined` ou `null`
			.map(([key]) => key); // Obtém os nomes das chaves ausentes

		if (missingParams.length > 0) {
			return wmsException(
				'MissingParameterValue',
				`${translations.wms.invalidParameters.replace('{capability}', 'GetMap')}: ${missingParams.join(', ')}`,
				400
			);
		}

		const [folderName, fileName] = layers.split('/');
		const tiffPath = path.join(env.SECRET_FOLDER_PATH, folderName, fileName + '.tif');

		if (!fs.existsSync(tiffPath)) {
			return wmsException(
				'LayerNotDefined',
				translations.wms.layerNotFound.replace('{layer}', fileName),
				404
			);
		}

		// Abre dataset original
		const ds = gdal.open(tiffPath);

		// Warpar / recortar / reprojetar
		const { minX, minY, maxX, maxY } = parseBboxNumbers(bbox);
		const warpedDs = warpDataset(ds, [minX, minY, maxX, maxY], width, height, crs);

		// Lê a primeira banda
		const band = warpedDs.bands.get(1);
		const noDataValue = band.noDataValue ?? null;

		// Carrega colormap específico
		const colormap = getColorMap(fileName);

		// Lê valores da banda
		const dataIN = band.pixels.read(0, 0, width, height);

		// Converte em RGBA
		// @ts-ignore
		const rgba = processPixels(dataIN, colormap, noDataValue);

		// Cria dataset em memória
		const memDataset = createMemDataset(width, height, rgba, warpedDs.srs);

		// Exporta para PNG (ou outro formato)
		const outputBuffer = exportToPNG(memDataset);

		warpedDs.close();

		// Se vier "image/jpeg", por exemplo, você precisaria adequar o `exportToPNG` para suportar.
		// Aqui simplificamos retornando PNG mesmo se "format" = image/png
		const mimeType = format || 'image/png';

		return new Response(outputBuffer, {
			headers: {
				'Content-Type': mimeType,
				'Content-Disposition': `inline; filename="${fileName}.png"`
			}
		});
	} catch (err: any) {
		return wmsException(
			'NoApplicableCode',
			`${translations.wms.errorGeneratingMap}: ${err.message}`,
			500
		);
	}
}

export async function getLegendGraphic(params: any) {
	try {
		const { layer, format, version } = params;

		const requiredParams = { layer, format, version };

		const missingParams = Object.entries(requiredParams)
			.filter(([_, value]) => !value)
			.map(([key]) => key);

		if (missingParams.length > 0) {
			return wmsException(
				'MissingParameterValue',
				`${translations.wms.invalidParameters.replace('{capability}', 'GetLegendGraphic')}: ${missingParams.join(', ')}`,
				400
			);
		}

		const [folderName, fileName] = layer.split('/');
		const tiffPath = path.join(env.SECRET_FOLDER_PATH, folderName, fileName + '.tif');
		if (!fs.existsSync(tiffPath)) {
			return wmsException(
				'LayerNotDefined',
				translations.wms.layerNotFound.replace('{layer}', fileName),
				404
			);
		}

		const severityLabels = [
			translations.severity.null,
			translations.severity.veryLow,
			translations.severity.low,
			translations.severity.moderate,
			translations.severity.high,
			translations.severity.veryHigh
		];

		// Aqui usamos a mesma função que você já tinha, adaptada:
		// createLegend(formato, cores, labels)
		// "colorsSev" e "labels" vêm do seu map/Colors ou outro lugar

		// O format costuma vir como "image/png", "image/jpeg", "image/svg+xml", etc.
		const imageFormat = (format || 'image/png').replace('image/', '');
		const legendResponse = await createLegend(imageFormat, colorsSev, severityLabels, fileName);

		return legendResponse;
	} catch (err: any) {
		return wmsException(
			'NoApplicableCode',
			`${translations.wms.errorGeneratingLegend}: ${err.message}`,
			500
		);
	}
}
