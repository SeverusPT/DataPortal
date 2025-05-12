<script lang="ts">
	import { env } from '$env/dynamic/public';
	import 'leaflet/dist/leaflet.css';
	import { mount, onDestroy, onMount, unmount } from 'svelte';
	import type {
		Map,
		LatLngExpression,
		Marker,
		LatLngTuple,
		LatLngBoundsExpression,
		GridLayer,
		TileLayer
	} from 'leaflet';
	import parseGeoraster from 'georaster'; // Agora sem @ts-ignore, pois existem types do georaster (caso precise instalar ou ajustar).
	import type { FireFeature } from '$lib/configs/index.js';
	import * as BSFire from '../Images/BSFire';
	import FirePopup from './FirePopup.svelte';
	import proj4 from 'proj4';
	import MapToolbar from './MapToolbar.svelte';
	import LegendToolbar from './LegendToolbar.svelte';
	import LoadingComponent from '../LoadingComponent.svelte';
	import { toast } from '$lib/stores/toast';
	import { t } from '$lib/lang';

	// ================================
	// PROPS
	// ================================
	export let tiffFile: string | undefined;
	export let tiffFolder: string | undefined;
	export let method: string | undefined;
	export let viewMap: boolean;

	// ================================
	// VARIÁVEIS DE ESTADO / LOCAIS
	// ================================
	let L: any;
	let map: Map;
	let mapElement: HTMLDivElement;
	let loadingCount = 0;
	let GeoRasterLayer: { default: any };
	let creatingRGB = false;

	// Camadas
	let layerTiff: GridLayer | null = null;
	let layerOSM: TileLayer;
	let layerGM: TileLayer;

	// Extensão padrão (Portugal)
	const extentPT: LatLngBoundsExpression = [
		[36.51387111613806, -10.641862669962705],
		[42.43878528134468, -5.519225668020489]
	];

	const opacityDefault = 0.8;

	// Definição de projeção para uso no popup (proj4)
	proj4.defs(
		'EPSG:3763',
		'+proj=tmerc +lat_0=39.6682583333333 +lon_0=-8.13310833333333 +k=1 +x_0=0 +y_0=0 ' +
			'+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
	);
	const p4326toWGS84 = proj4('EPSG:3763', 'WGS84');

	// ================================
	// FUNÇÕES GERAIS
	// ================================

	/**
	 * Função para adicionar a barra de ferramentas ao mapa.
	 */
	const addToolBar = (map: Map) => {
		let toolbar = L.control({ position: 'topright' });
		let toolbarComponent: MapToolbar;

		toolbar.onAdd = (map: Map) => {
			const div = L.DomUtil.create('div');
			L.DomEvent.disableClickPropagation(div);

			toolbarComponent = mount(MapToolbar, {
				target: div,
				props: { opacity: opacityDefault },
				events: {
					'set-opacity': ({ detail }: { detail: number }) => {
						if (layerTiff) layerTiff.setOpacity(detail);
					},
					'extent-reset': () => {
						map.fitBounds(extentPT, { animate: true });
					},
					'google-maps': ({ detail }: { detail: boolean }) => {
						if (detail) {
							layerOSM.remove();
							layerGM.addTo(map);
							layerGM.bringToBack();
						} else {
							layerGM.remove();
							layerOSM.addTo(map);
							layerOSM.bringToBack();
						}
					}
				}
			}) as MapToolbar;

			return div;
		};

		toolbar.onRemove = () => {
			if (toolbarComponent) {
				unmount(toolbarComponent);
				// @ts-ignore
				toolbarComponent = null;
			}
		};

		toolbar.addTo(map);
	};

	/**
	 * Função para adicionar a legenda ao mapa.
	 */
	const addLegend = (map: Map) => {
		let legendControl = L.control({ position: 'bottomleft' });
		let legendComponent: LegendToolbar;

		legendControl.onAdd = (map: Map) => {
			const div = L.DomUtil.create('div');
			L.DomEvent.disableClickPropagation(div);

			legendComponent = mount(LegendToolbar, {
				target: div,
				props: {
					fileName: tiffFile
				}
			}) as LegendToolbar;

			return div;
		};

		legendControl.onRemove = () => {
			if (legendComponent) {
				unmount(legendComponent);
				// @ts-ignore
				legendComponent = null;
			}
		};

		legendControl.addTo(map);
	};

	/**
	 * Carrega e inicializa a camada TIFF (raster).
	 *  1. Checa se o RGB existe
	 *  2. Se não existir, tenta criar (creatingRGB = true)
	 *  3. Faz o parse via parseGeoraster
	 *  4. Adiciona ao mapa
	 */
	async function loadRaster(): Promise<void> {
		try {
			if (!tiffFolder || !tiffFile) return;
			let urlCheck = `/api/files/getTIFF?op=rgb_exists&fld=${tiffFolder}&file=${tiffFile}&method=${method}`;

			// Verifica se o RGB existe
			const checkRes = await fetch(urlCheck);
			const checkData = await checkRes.json();

			// Se não existir, tenta criar
			if (!checkData.success) {
				creatingRGB = true;
				urlCheck = urlCheck.replace('rgb_exists', 'rgb_create');

				const createRes = await fetch(urlCheck);
				const createData = await createRes.json();

				if (!createData.success) {
					throw new Error($t.errors.errorCreatingRgb);
				}
				creatingRGB = false;
			}

			// A URL para o arquivo COG (RGB)
			const cogFile = `/api/files/getCogFile?tiffFolder=${tiffFolder}&tiffFile=${tiffFile}`;
			const cogBuffer = await fetch(cogFile)
				.then((res) => res.arrayBuffer())
				.catch(() => {
					throw new Error($t.map.errors.tiff);
				});

			const blob = new Blob([cogBuffer], { type: 'image/tiff' });
			const cogURL = URL.createObjectURL(blob);

			const georaster = await parseGeoraster(cogURL);

			layerTiff = new GeoRasterLayer.default({
				georaster,
				opacity: opacityDefault,
				resolution: 128
			});

			layerTiff.addTo(map);
		} catch (error) {
			toast($t.map.errors.tiff, 'error');
			viewMap = false;
		}
	}

	/**
	 * Cria um ícone personalizado para os marcadores.
	 */
	function markerIcon() {
		return L.divIcon({
			html: BSFire.icon,
			className: 'map-marker'
		});
	}

	/**
	 * Função para criar e configurar o marker (com popup).
	 */
	function createMarker(loc: LatLngExpression, fireFeat: FireFeature): Marker {
		let icon = markerIcon();
		let marker = L.marker(loc, { icon });

		bindPopup(marker, (container: HTMLElement) => {
			return mount(FirePopup, {
				target: container,
				props: {
					fireProps: fireFeat
				},
				events: {
					change: ({ detail }: { detail: [number, number, number, number] }) => {
						// detail = [x1, y1, x2, y2] em EPSG:3763
						const cord1Array = p4326toWGS84.forward([detail[0], detail[1]]);
						const coord1: LatLngTuple = [cord1Array[0], cord1Array[1]];

						const cord2Array = p4326toWGS84.forward([detail[2], detail[3]]);
						const coord2: LatLngTuple = [cord2Array[0], cord2Array[1]];

						map.fitBounds(
							[
								[coord1[1], coord1[0]],
								[coord2[1], coord2[0]]
							],
							{ animate: true }
						);
					}
				}
			});
		});

		return marker;
	}

	/**
	 * Remove o popup (unmount Svelte) ao fechar.
	 */
	function closePopup(popupComponent: any) {
		if (popupComponent) {
			let old = popupComponent;
			popupComponent = null;
			setTimeout(() => {
				unmount(old);
			}, 500);
		}
	}

	/**
	 * Vincula um popup a um marker.
	 */
	function bindPopup(marker: Marker, createFn: (container: HTMLElement) => any) {
		let popupComponent: any;
		marker.bindPopup(() => {
			let container = L.DomUtil.create('div');
			popupComponent = createFn(container);
			return container;
		});

		marker.on('popupclose', () => {
			closePopup(popupComponent);
		});
		return popupComponent;
	}

	/**
	 * Carrega marcadores (focos de incêndio) com base no ano extraído do nome do arquivo TIFF.
	 */
	async function loadMarkers() {
		if (!tiffFile) return;

		// Exemplo: scene_S2_20230812_t9999_YEAR -> obtém '9999' da substring
		const fileSplit = tiffFile.split('_');
		const year = fileSplit[4]?.substring(1); // Ajuste conforme seu pattern real

		if (!year) return;

		try {
			loadingCount++;
			const url = `/api/files/getFireLoc?year=${year}`;
			const response = await fetch(url);
			const locs: FireFeature[] = await response.json();

			const markerLayers = L.layerGroup();
			for (const feat of locs) {
				let coord = feat.properties.centroidxy.split(',');
				let marker = createMarker([+coord[1], +coord[0]], feat);
				markerLayers.addLayer(marker);
			}
			markerLayers.addTo(map);
		} catch (err) {
			toast($t.map.errors.markers, 'error');
			viewMap = false;
		} finally {
			loadingCount--;
		}
	}

	// ================================
	// CICLO DE VIDA SVELTE
	// ================================
	onMount(async () => {
		try {
			L = await import('leaflet');
			GeoRasterLayer = await import('georaster-layer-for-leaflet');

			map = L.map(mapElement);
			map.fitBounds(extentPT);

			layerOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			});
			layerGM = L.tileLayer('http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
				maxZoom: 20,
				subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
			});

			// Camada base inicial
			layerOSM.addTo(map);

			// Adiciona toolbars
			addToolBar(map);
			addLegend(map);

			// Tenta carregar o raster
			loadRaster();

			// Carrega os marcadores
			await loadMarkers();
		} catch (err) {
			toast($t.map.errors.init, 'error');
			viewMap = false;
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="relative table-cell h-full w-full">
	<div class="h-full w-full" bind:this={mapElement}></div>

	{#if loadingCount > 0 || creatingRGB}
		<div
			class="absolute inset-0 z-[4900] flex flex-col items-center justify-center bg-white bg-opacity-70"
		>
			<LoadingComponent loadingText={creatingRGB ? $t.loading.file : $t.loading.load} />
		</div>
	{/if}
</div>
