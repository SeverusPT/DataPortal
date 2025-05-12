import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import gdal from 'gdal-async';
import path from 'path';
import fs from 'fs';
import { ColorRgbIndex, pixelColorMap, pixelValueToRGB_func } from '$lib/map/Colors.js';
import { t } from '$lib/lang';
let translations;
t.subscribe((value) => {
	translations = value;
});

// Configurar o caminho do `proj.db`
const projDbPath = path.resolve('./node_modules/gdal-async/deps/libproj/proj/data');
gdal.config.set('PROJ_LIB', projDbPath);

// ===================== CONSTANTES =====================
const RGBfile_noDataValue: number = parseInt(privateEnv.RGB_FILE_NODATAVALUE);

// ===================== FUNÇÕES =====================
export async function createRgbCogTiff(
	filename: string,
	folderTiff: string,
	method?: string | null
): Promise<boolean> {
	const cogFilename = `${filename}${publicEnv.PUBLIC_RGB_COGFILE_SUFFIX}.tif`;
	const cogFolder = `${privateEnv.SECRET_COG_FOLDER_PATH}/${folderTiff}`;
	const cogFilepath = `${cogFolder}/${cogFilename}`;

	let existsRGB = fs.existsSync(cogFilepath);
	if (!existsRGB) {
		const basePath =
			method === 'history' ? privateEnv.SECRET_HISTORY_PATH : privateEnv.SECRET_FOLDER_PATH;
		const tifFilepath = `${basePath}/${folderTiff}/${filename}.tif`;

		if (!fs.existsSync(tifFilepath)) {
			return false;
		}

		fs.mkdirSync(cogFolder, { recursive: true });

		try {
			await colorizeToRGB(tifFilepath, cogFilepath);
		} catch (error) {
			return false;
		}

		existsRGB = fs.existsSync(cogFilepath);
	}

	return existsRGB;
}

// ===================== COLORIZE =====================
async function colorizeToRGB(filepathIN: string, filepathCOG: string): Promise<boolean> {
	try {
		const dsIN = await gdal.openAsync(filepathIN);
		const size = await dsIN.rasterSizeAsync;
		const b1 = await dsIN.bands.getAsync(1);
		const noDataValue1 = b1.noDataValue;
		const srs1 = gdal.SpatialReference.fromWKT((await dsIN.srsAsync)?.toWKT()!);
		const geoTransform1 = dsIN.geoTransform;

		const tiffFileWExt = path.basename(filepathIN, path.extname(filepathIN));
		const splitFile = tiffFileWExt?.split('_');
		const sevInd = splitFile ? splitFile[1] : undefined;
		const sat = splitFile ? splitFile[3] : undefined;
		const pixelColMap = pixelColorMap(sevInd, sat);

		if (!pixelColMap) {
			throw new Error(
				`${translations.errors.colorMapNotFound.replace('{colormap}', sevInd + '_' + sat)}`
			);
		}

		const func = [
			new Function('t', pixelValueToRGB_func(pixelColMap, 't', ColorRgbIndex.RED)),
			new Function('t', pixelValueToRGB_func(pixelColMap, 't', ColorRgbIndex.GREEN)),
			new Function('t', pixelValueToRGB_func(pixelColMap, 't', ColorRgbIndex.BLUE))
		];

		const dsOUTtemp = '/vsimem/process_to_rgb.tif';
		const dsCloudBase = await gdal.openAsync(
			dsOUTtemp,
			'w',
			'GTiff',
			size.x,
			size.y,
			3,
			gdal.GDT_Byte,
			['COMPRESS=LZW']
		);
		dsCloudBase.srs = srs1;
		dsCloudBase.geoTransform = geoTransform1;

		(await dsCloudBase.bands.getAsync(1)).noDataValue = RGBfile_noDataValue;
		(await dsCloudBase.bands.getAsync(2)).noDataValue = RGBfile_noDataValue;
		(await dsCloudBase.bands.getAsync(3)).noDataValue = RGBfile_noDataValue;

		const dataIN = await b1.pixels.readAsync(0, 0, size.x, size.y);
		const dataOUT = [
			new Uint8Array(dataIN.length),
			new Uint8Array(dataIN.length),
			new Uint8Array(dataIN.length)
		];

		for (let i = 0; i < dataIN.length; i++) {
			if (dataIN[i] !== noDataValue1) {
				for (let b = 0; b < 3; b++) {
					dataOUT[b][i] = func[b](dataIN[i]);
				}
			} else {
				for (let b = 0; b < 3; b++) {
					dataOUT[b][i] = RGBfile_noDataValue;
				}
			}
		}

		for (let b = 0; b < 3; b++) {
			const band = await dsCloudBase.bands.getAsync(b + 1);
			await band.pixels.writeAsync(0, 0, size.x, size.y, dataOUT[b]);
		}

		await dsCloudBase.flushAsync();

		try {
			await gdal.warpAsync(
				filepathCOG,
				null,
				[dsCloudBase],
				['-t_srs', 'EPSG:4326', '-of', 'COG', '-co', 'COMPRESS=LZW']
			);
		} catch (error) {
			throw error;
		}

		gdal.vsimem.release(dsOUTtemp);

		return true;
	} catch (error) {
		throw error;
	}
}
