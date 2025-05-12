// src/lib/wms/wmsUtils.ts
import sharp from 'sharp';
import { ColorRgbIndex, getColorMap, pixelValueToRGB_func } from '$lib/map/Colors';
import path from 'path';
import gdal from 'gdal-async';

// Ajuste do caminho do proj.db
const projDbPath = path.resolve('./node_modules/gdal-async/deps/libproj/proj/data');
gdal.config.set('PROJ_LIB', projDbPath);

/**
 * Normaliza e extrai parâmetros WMS de um URLSearchParams,
 * convertendo keys para lowercase e retornando objeto final.
 */
export function parseWmsParams(searchParams: URLSearchParams) {
	const toLowerParams = new URLSearchParams();
	for (const [key, value] of searchParams.entries()) {
		toLowerParams.append(key.toLowerCase(), value);
	}

	return {
		request: toLowerParams.get('request') ?? '',
		service: toLowerParams.get('service') ?? '',
		version: toLowerParams.get('version') ?? '',
		layers: toLowerParams.get('layers') ?? '',
		layer: toLowerParams.get('layer') ?? '',
		format: toLowerParams.get('format') || 'image/png',
		bbox: toLowerParams.get('bbox'),
		width: parseInt(toLowerParams.get('width') ?? '0'),
		height: parseInt(toLowerParams.get('height') ?? '0'),
		crs: toLowerParams.get('crs') ?? '',
		lang: toLowerParams.get('lang') ?? '',
		product: toLowerParams.get('product') ?? '',
		file: toLowerParams.get('file') ?? ''
	};
}

/**
 * Faz parse do BBOX e retorna como objeto com minX, minY, maxX, maxY
 */
export function parseBboxNumbers(bboxStr: string) {
	const [minX, minY, maxX, maxY] = bboxStr.split(',').map(parseFloat);
	return { minX, minY, maxX, maxY };
}

/**
 * Retorna o bounding box de um dataset
 */
export function calculateBoundingBox(dataset: any) {
	const geoTransform = dataset.geoTransform;
	const { x: width, y: height } = dataset.rasterSize;

	const minx = geoTransform[0];
	const maxx = geoTransform[0] + width * geoTransform[1];
	const miny = geoTransform[3] + height * geoTransform[5];
	const maxy = geoTransform[3];

	return { minx, miny, maxx, maxy };
}

/**
 * Executa o warp (reprojeção/recorte) de um dataset para um BBOX/CRS/tamanho especificado.
 * Retorna o dataset em memória virtual (/vsimem).
 */
export function warpDataset(
	srcDataset: gdal.Dataset,
	bbox: number[],
	width: number,
	height: number,
	crs: string
) {
	const [minX, minY, maxX, maxY] = bbox;
	const tempWarpedPath = '/vsimem/warped.tif';

	const warpArgs = [
		'-t_srs',
		crs,
		'-te',
		minX.toString(),
		minY.toString(),
		maxX.toString(),
		maxY.toString(),
		'-ts',
		width.toString(),
		height.toString()
	];

	gdal.warp(tempWarpedPath, null, [srcDataset], warpArgs);
	return gdal.open(tempWarpedPath);
}

/**
 * Gera as 4 bandas RGBA a partir dos valores raster (dataIN) e colormap.
 */
export function processPixels(
	dataIN: Float32Array | Uint8Array,
	colormap: any,
	noDataValue: number | null
) {
	const length = dataIN.length;
	const red = new Uint8Array(length);
	const green = new Uint8Array(length);
	const blue = new Uint8Array(length);
	const alpha = new Uint8Array(length);

	const fnR = new Function('t', pixelValueToRGB_func(colormap, 't', ColorRgbIndex.RED));
	const fnG = new Function('t', pixelValueToRGB_func(colormap, 't', ColorRgbIndex.GREEN));
	const fnB = new Function('t', pixelValueToRGB_func(colormap, 't', ColorRgbIndex.BLUE));

	for (let i = 0; i < length; i++) {
		const val = dataIN[i];
		if (val !== noDataValue) {
			red[i] = fnR(val);
			green[i] = fnG(val);
			blue[i] = fnB(val);
			alpha[i] = 255;
		} else {
			red[i] = green[i] = blue[i] = alpha[i] = 0;
		}
	}
	return { red, green, blue, alpha };
}

/**
 * Cria um dataset em memória (driver MEM) com 4 bandas (RGBA).
 */
export function createMemDataset(
	width: number,
	height: number,
	rgba: any,
	srs: gdal.SpatialReference
) {
	const memDriver = gdal.drivers.get('MEM');
	const memDataset = memDriver.create('', width, height, 4, gdal.GDT_Byte);

	memDataset.bands.get(1).pixels.write(0, 0, width, height, rgba.red);
	memDataset.bands.get(2).pixels.write(0, 0, width, height, rgba.green);
	memDataset.bands.get(3).pixels.write(0, 0, width, height, rgba.blue);
	memDataset.bands.get(4).pixels.write(0, 0, width, height, rgba.alpha);

	memDataset.srs = srs;
	return memDataset;
}

/**
 * Exporta o dataset (memDataset) para PNG (em memória) e retorna o Buffer.
 */
export function exportToPNG(memDataset: gdal.Dataset) {
	const pngPath = '/vsimem/output.png';
	gdal.drivers.get('PNG').createCopy(pngPath, memDataset, ['TILED=YES', 'COMPRESS=DEFLATE']);
	memDataset.close(); // Liberar o dataset MEM
	return gdal.vsimem.release(pngPath);
}

function formatNum(value: number) {
	// Se quiser especificamente "-1e+7" para -1e7, e "1e+7" para 1e7:
	if (value === -1e7) return '-1e+7';
	if (value === 1e7) return '1e+7';

	// Se quiser que 1 apareça como "1", 0 como "0" etc.
	// e não se importe se for "1895", "2.862e+3", etc.,
	// pode usar .toString() ou .toExponential().
	// Exemplo usando toString():
	return value.toString();
}

/**
 * Cria uma legenda usando apenas Sharp e SVG (sem node-canvas).
 *
 * @param format        'png', 'jpeg', 'webp', etc.
 * @param colorsSev     array de cores (hex, rgb, etc.)
 * @param severityLabels array de rótulos para severidade
 * @param fileName      nome do arquivo, para buscar o colormap
 */
export async function createLegend(format, colorsSev, severityLabels, fileName) {
	// 1) Obter o colormap
	const colormap = getColorMap(fileName);
	// Ex.: 7 itens: 1 com `valIn`, 6 com `valEx`.

	const intervals = colormap.map((c, i) => {
		const isFirst = (i === 0);
		// Se for a última faixa, feche com ']', senão feche com '['
		const closingBracket = isFirst ? ']' : '[';
		return `[${formatNum(c.valIn)}, ${formatNum(c.valEx)}${closingBracket}`;
	  });

	// Depois você monta `items` combinando cor + texto do intervalo + rótulo
	const items = intervals.map((range, i) => ({
		range,
		severity: severityLabels[i], // Ex.: "Muito Baixa", "Baixa" etc.
		color: colorsSev[i] // Ex.: "#FEE391" etc.
	}));

	// 4) Definir layout básico
	const colorBoxSize = 20; // Tamanho do quadrado de cor
	const itemHeight = 40; // Espaço vertical para cada item
	const verticalSpacing = 5; // Espaço extra entre itens
	const padding = 10; // Margem externa
	const fontSize = 14;

	// Largura “fixa” (você pode ajustar)
	// Se quiser algo mais preciso, pode estimar tamanho do texto
	// ou usar um valor maior se o texto for longo.
	const svgWidth = 300;

	// Altura total calculada
	const svgHeight = padding * 2 + items.length * itemHeight + (items.length - 1) * verticalSpacing;

	// 5) Montar o SVG na mão
	let svgParts = [];
	svgParts.push(`
<svg 
  width="${svgWidth}" 
  height="${svgHeight}" 
  xmlns="http://www.w3.org/2000/svg"
  style="font-family: Arial; font-size: ${fontSize}px; background: white;"
>
  <!-- Fundo branco -->
  <rect x="0" y="0" width="100%" height="100%" fill="white" />
`);

	items.forEach((item, i) => {
		const yCenter = padding + i * (itemHeight + verticalSpacing) + itemHeight / 2;

		// Quadrado de cor
		svgParts.push(`
    <rect 
      x="${padding}" 
      y="${yCenter - colorBoxSize / 2}" 
      width="${colorBoxSize}" 
      height="${colorBoxSize}" 
      fill="${item.color}" 
    />
    `);

		// Coordenadas para os textos (alinhados verticalmente)
		const textX = padding + colorBoxSize + 10;
		const labelY = yCenter - 8; // Label um pouco acima do centro
		const rangeY = yCenter + 10; // Intervalo um pouco abaixo do centro

		// Texto de severidade (linha 1)
		svgParts.push(`
    <text 
      x="${textX}" 
      y="${labelY}" 
      fill="black" 
      dominant-baseline="middle"
    >
      ${item.severity}
    </text>
    `);

		// Texto de intervalo (linha 2)
		svgParts.push(`
    <text 
      x="${textX}" 
      y="${rangeY}" 
      fill="black" 
      dominant-baseline="middle"
    >
      ${item.range}
    </text>
    `);
	});

	svgParts.push('</svg>');
	const svgContent = svgParts.join('');

	// 6) Converter o SVG em buffer usando Sharp
	const outputBuffer = await sharp(Buffer.from(svgContent))
		.toFormat(format) // 'png', 'jpeg', etc.
		.toBuffer();

	// 7) Retornar a imagem (exemplo de retorno estilo SvelteKit)
	return new Response(outputBuffer, {
		headers: {
			'Content-Type': `image/${format}`,
			'Content-Disposition': `inline; filename="legend.${format}"`
		}
	});
}
