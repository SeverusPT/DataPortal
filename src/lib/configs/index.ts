import { env } from '$env/dynamic/public';

export type Component = {
	values?: { [key: string]: { en: string; pt: string } };
	validation?: (value: any) => boolean;
	description: { en: string; pt: string };
};

export type ComponentType =
	| 'ProjectAcronym'
	| 'PlatformCode'
	| 'ApproachCode'
	| 'SpectralIndex'
	| 'BurntAreaDataset'
	| 'SatCode'
	| 'BaseIndex'
	| 'SeverityIndicator'
	| 'ReferenceYear'
	| 'RefPeriods'
	| 'ReferenceSystem'
	| 'CalculationDate'
	| 'VersionNumber';

export type Components = {
	[key in ComponentType]: Component;
};

export const getComponents = async (
	versionValues: { [key: string]: { en: string; pt: string } } | undefined
): Promise<Components> => {
	return {
		ProjectAcronym: {
			values: {
				SPT: { en: 'SeverusPT project acronym', pt: 'Acrónimo do projeto' }
			},
			description: {
				en: 'SeverusPT project acronym',
				pt: 'Acrónimo do projeto'
			}
		},
		PlatformCode: {
			values: {
				S2: { en: 'Sentinel-2a/b', pt: 'Sentinel-2a/b' },
				MO: { en: 'MODIS Terra', pt: 'MODIS Terra' },
				MY: { en: 'MODIS Aqua', pt: 'MODIS Aqua' },
				L8: { en: 'Landsat-8/OLI', pt: 'Landsat-8/OLI' },
				LH: {
					en: 'Landsat-5,7,8 Harmonized data',
					pt: 'Landsat-5,7,8 Harmonizado'
				}
			},
			description: {
				en: 'Satellite-sensor platform of the input data used to calculate the product',
				pt: 'Plataforma de satélite dos dados de input usada para calcular os produtos'
			}
		},
		ApproachCode: {
			values: {
				D: { en: 'Delta-based methods', pt: 'Métodos baseados em deltas' },
				T: {
					en: 'Tranjectory-based methods',
					pt: 'Métodos baseados em trajetórias'
				}
			},
			description: {
				en: 'General methodological approach for obtaining severity estimates',
				pt: 'Abordagem metodológica usada para obter as estimativas de severidade'
			}
		},
		SpectralIndex: {
			values: {
				NBR: {
					en: 'Normalized Burn Ratio',
					pt: 'Rácio Normalizado de Área Ardida'
				},
				NDVI: {
					en: 'Normal ized Difference Vegetation Index',
					pt: 'Índice de Vegetação por Diferença Normalizada'
				},
				EVI: {
					en: 'Enhanced Vegetation Index',
					pt: 'Índice de Vegetação Melhorado'
				},
				TCTB: {
					en: 'Tasseled Cap Transformation “Brightness”',
					pt: 'Transformação “Tasseled Cap” - Componente de Brilho de Superfície'
				},
				TCTG: {
					en: 'Tasseled Cap Transformation “Greenness”',
					pt: 'Transformação “Tasseled Cap” - Componente de Vigor da Vegetação'
				},
				TCTW: {
					en: 'Tasseled Cap Transformation “Wetness”',
					pt: 'Transformação “Tasseled Cap” - Componente de Teor de Humidade'
				},
				LST: {
					en: 'Land Surface Temperature',
					pt: 'Temperatura da Superfície Terrestre'
				}
			},
			description: {
				en: 'Base combination of spectral bands used',
				pt: 'Índice espectral ou combinação de bandas espectrais utilizado'
			}
		},
		BurntAreaDataset: {
			values: {
				I: {
					en: 'ICNF burned annual area database',
					pt: 'Dados anuais de área ardida ICNF'
				},
				E: { en: 'EFFIS dataset', pt: 'Conjunto de dados EFFIS' },
				F: { en: 'Fire CCI v5.1', pt: 'Fire CCI v5.1' },
				H: {
					en: 'Harmonized and combined Fire CCI and EFFIS datasets',
					pt: 'Conjuntos de dados harmonizados e combinados do Fire CCI e do EFFIS' //TODO verificar
				}
			},
			description: {
				en: 'Source/name of the burnt area product/dataset used for calculating the severity indicators',
				pt: 'Fonte/nome do produto/conjunto de dados de área ardida utilizado no cálculo dos indicadores de severidade'
			}
		},
		SatCode: {
			//TODO verificar todos
			values: {
				S2MSI: { en: 'Sentinel-2a/b/MSI', pt: 'Sentinel-2a/b/MSI' },
				MOD: { en: 'Terra/MODIS', pt: 'Terra/MODIS' },
				MYD: { en: 'Aqua/MODIS', pt: 'Aqua/MODIS' },
				MCD: {
					en: 'Combined Terra+Aqua/MODIS',
					pt: 'Terra+Aqua/MODIS Combinado'
				},
				L5TM: { en: 'Landsat-5/TM', pt: 'Landsat-5/TM' },
				L7ETM: { en: 'Landsat-7/ETM+', pt: 'Landsat-7/ETM+' },
				L8OLI: { en: 'Landsat-8/OLI', pt: 'Landsat-8/OLI' },
				L8TIRS: { en: 'Landsat-8/TIRS', pt: 'Landsat-8/TIRS' },
				L9OLI: { en: 'Landsat-9/OLI', pt: 'Landsat-9/OLI' },
				L9TIRS: { en: 'Landsat-9/TIRS', pt: 'Landsat-9/TIRS' },
				LTH: {
					en: 'Landsat Harmonized (LT 5, 7 and 8)',
					pt: 'Landsat (LT 5, 7 and 8) Harmonizado'
				}
			},
			description: {
				en: 'Satellite and sensor input data used to calculate the product',
				pt: 'Plataforma de satélite dos dados de input usada para calcular os produtos'
			}
		},
		BaseIndex: {
			//TODO review todos
			values: {
				NBR: {
					en: 'Normalized Burn Ratio',
					pt: 'Rácio Normalizado de Área Ardida'
				},
				TCTB: {
					en: 'Tasseled Cap Transformation “Brightness”',
					pt: 'Transformação “Tasseled Cap” — Componente de Brilho de Superfície '
				},
				TCTG: {
					en: 'Tasseled Cap Transformation “Greenness”',
					pt: 'Transformação “Tasseled Cap” - Componente de Vigor da Vegetação'
				},
				TCTW: {
					en: 'Tasseled Cap Transformation “Wetness”',
					pt: 'Transformação “Tasseled Cap” - Componente de Teor de Humidade'
				}
			},
			description: {
				en: 'Spectral index, biophysical variable or band transformation used in calculations',
				pt: 'Spectral index, biophysical variable or band transformation used in calculations'
			}
		},
		SeverityIndicator: {
			//TODO review todos
			values: {
				DELTA: {
					en: 'Post-fire - Pre-fire difference/delta method',
					pt: 'Diferença Pós-fogo - Pré-fogo/método delta'
				},
				RDT: { en: 'Relative Delta Method', pt: 'Delta Relativo' },
				RBR: {
					en: 'Relativized Burn Ratio',
					pt: 'Rácio relativizado de área ardida'
				}
			},
			description: {
				en: 'Calculated fire/burn severity indicator based on a spectral index or other',
				pt: 'Indicador de severidade calculado com base em um índice espectral (ou outro índice similar)'
			}
		},

		ReferenceYear: {
			validation: (value: number) => {
				return value >= parseInt(env.PUBLIC_MINIMUM_YEAR) && value <= new Date().getFullYear();
			},
			description: {
				en: 'Year of fire ignition',
				pt: 'Ano de ignição do fogo'
			} //TODO ReVER
		},
		RefPeriods: {
			validation: (value: string) => {
				const pattern = /^R(00[1-9]|0[1-9]\d|[1-9]\d{2})P(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
				//TODO - Verificar com mais informações
				if (value.match(pattern)) {
					const preFire = Number(value.substring(1, value.indexOf('P')));
					const postFire = Number(value.substring(value.indexOf('P') + 1));

					if (preFire < 1 || preFire > 999) {
						return false;
					}

					if (postFire < 1 || postFire > 12) {
						return false;
					}
				} else {
					return false;
				}

				return true;
			},
			description: {
				//TODO rever
				en: 'The reference periods used to calculate the pre- and post-fire periods',
				pt: 'Os períodos de referência utilizados para calcular os períodos pré-fogo e pós-fogo'
			}
		},
		ReferenceSystem: {
			values: {
				'32629': { en: 'WGS 1984 / UTM 29N', pt: 'WGS 1984 / UTM 29N' },
				'3763': { en: 'ETRS 1989 / PT TM06', pt: 'ETRS 1989 / PT TM06' }
			},
			description: {
				en: 'Projected coordinate reference system of the data in two possible options',
				pt: 'Sistema de referência de coordenadas projetado dos dados em duas opções possíveis'
			}
		},

		CalculationDate: {
			validation: (value: string) => {
				let dateformat = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[01])$/;

				if (value.match(dateformat)) {
					let year = Number(value.substring(0, 4));
					let month = Number(value.substring(4, 6));
					let day = Number(value.substring(6, 8));

					// Create a list of days of a month
					let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
					if (month == 1 || month > 2) {
						if (day > ListofDays[month - 1]) {
							//to check if the date is out of range
							return false;
						}
					} else if (month == 2) {
						let leapYear = false;
						if ((!(year % 4) && year % 100) || !(year % 400)) leapYear = true;
						if (leapYear == false && day >= 29) return false;
						else if (leapYear == true && day > 29) {
							return false;
						}
					}

					// Verificar se a data é superior à de hoje
					let currentDate = new Date();
					let inputDate = new Date(year, month - 1, day); // Mês começa em 0 no objeto Date

					if (inputDate > currentDate) {
						return false;
					}
				} else {
					return false;
				}

				return true;
			},
			description: {
				//TODO rever
				en: 'Calculation date of the product in YYYY year MM month DD day format (YYYYMMDD)',
				pt: 'Data de cálculo do produto no formato AAAA ano MM mês DD dia (AAAAMMDD)'
			}
		},
		VersionNumber: {
			values: versionValues,
			description: {
				en: 'Version number of the product. Composed of a single digit which denotes changes only to the major version',
				pt: 'Número da versão do produto. Composto por dois dígitos que denota alterações apenas na versão principal'
			}
		}
	};
};

export interface FolderStructure {
	separator: string;
	components: ComponentType[];
}

export interface FileStructure {
	separator: string;
	components: ComponentType[];
}

export interface Version {
	[key: string]: {
		folderStructure: FolderStructure;
		fileStructure: FileStructure;
	};
}

export interface Folder {
	name: string;
	splitName: string[];
	filesCount: number;
	subtitle: string;
	error: { component: ComponentType; message: string }[];
}

export function instanceOfFolder(data: any): data is Folder {
	return 'filesCount' in data;
}

export interface FileInterface {
	name: string;
	splitName: string[];
	lastUpdated: string;
	error: { component: ComponentType; message: string }[];
	missingExtensions: string[];
}

export const Extensions = ['.tif', '.json', '.csv', '.txt'];

export interface FireFeature {
	type: string;
	properties: {
		id: string;
		FIREDATE: string;
		PROVINCE: string;
		COMMUNE: string;
		AREA_HA: number;
		year: string;
		area_ht: number;
		centroidxy: string;
	};
	bbox: number[];
}

export type ColorStep = {
	valIn?: number;
	valEx?: number;
	color?: string;
}[];

export type ColorSteps = {
	[key: string]: ColorStep;
};

export type Dictionary = {
	[key in ComponentType]: {
		en: string;
		pt: string;
	};
};

export const DictionaryList: Dictionary = {
	ProjectAcronym: {
		en: 'Project Acronym',
		pt: 'Acrónimo do Projeto'
	},
	PlatformCode: { en: 'Platform Code', pt: 'Plataforma de Observação Remota' },
	ApproachCode: { en: 'Approach Code', pt: 'Código da abordagem de cálculo' },
	SpectralIndex: { en: 'Spectral Index', pt: 'Índice espectral' },
	BurntAreaDataset: { en: 'Burnt Area Dataset', pt: 'Dados de Área Ardida' },
	SatCode: { en: 'Satellite Code', pt: 'Código do Satélite' },
	BaseIndex: {
		en: 'Base Index',
		pt: 'Índice base'
	},
	SeverityIndicator: {
		en: 'Severity Indicator',
		pt: 'Indicador de Severidade'
	},
	ReferenceYear: { en: 'Reference Year', pt: 'Ano de Referência' },
	RefPeriods: {
		en: 'Reference Periods',
		pt: 'Período de Referência'
	},
	ReferenceSystem: { en: 'Reference System', pt: 'Sistema de Coordenadas' },
	CalculationDate: { en: 'Calculation Date', pt: 'Data de Cálculo' },
	VersionNumber: { en: 'Version Number', pt: 'Número da Versão' }
};
